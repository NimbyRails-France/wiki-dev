param(
    [string]$SdkRoot = "$PSScriptRoot/../../sdk",
    [string]$KotlinHome = "$env:USERPROFILE/.konan/kotlin-native-prebuilt-windows-x86_64-2.2.20",
    [ValidateSet('fr', 'en')][string[]]$Locales = @('fr', 'en'),
    [ValidateSet('all', 'native', 'jvm')][string]$Runtime = 'all'
)
$ErrorActionPreference = 'Stop'
$wikiRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$SdkRoot = (Resolve-Path -LiteralPath $SdkRoot).Path
$output = Join-Path $wikiRoot '.validation/example-check'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$compiler = Join-Path $KotlinHome 'bin/konanc.bat'
# Same identity the Gradle plugin supplies to a consumer of the guide.
'package nimby.mod; internal val modInfo = nimby.ModInfo("mon-premier-mod", "Mon premier mod")' | Set-Content -LiteralPath "$output/ModInfo.kt" -Encoding UTF8
if ($Runtime -ne 'jvm') {
    $sources = @(Get-ChildItem -LiteralPath "$SdkRoot/kotlin/src" -Recurse -Filter *.kt | ForEach-Object FullName)
    & $compiler -target mingw_x64 -produce library -o "$output/nimby-mod-api" @sources
    if ($LASTEXITCODE) { throw 'API Kotlin compilation failed' }
}
if ($Locales -contains 'en') {
    & node "$PSScriptRoot/export-examples.mjs"
    if ($LASTEXITCODE) { throw 'English example extraction failed' }
}
foreach ($locale in $Locales) {
    if ($Runtime -ne 'jvm') {
        $sourceDirectory = if($locale -eq 'fr'){"$wikiRoot/app/content/snippets"}else{"$output/en"}
        # Select the current source inventory, so removed examples cannot survive in
        # the translated output and accidentally participate in a later validation.
        $snippets = @(Get-ChildItem -LiteralPath "$wikiRoot/app/content/snippets" -Filter *.kt | ForEach-Object { Join-Path $sourceDirectory $_.Name })
        & $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry wiki.tests.main -o "$output/wiki-example-$locale" @snippets "$wikiRoot/tests/mod-example.kt" "$output/ModInfo.kt"
        if ($LASTEXITCODE) { throw "Wiki $locale example compilation failed" }
        & "$output/wiki-example-$locale.exe"
        if ($LASTEXITCODE) { throw "Wiki $locale example checks failed" }
        & $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry wiki.tooltests.main -o "$output/wiki-tool-example-$locale" @snippets "$wikiRoot/tests/tool-examples.kt" "$output/ModInfo.kt"
        if ($LASTEXITCODE) { throw "Wiki $locale tool example compilation failed" }
        & "$output/wiki-tool-example-$locale.exe"
        if ($LASTEXITCODE) { throw "Wiki $locale tool example checks failed" }
    }

    # JVM snippets use the actual SDK project dependency, with its public API
    # visibility and transitive JNA dependency, rather than native API stubs.
    if ($Runtime -ne 'native') {
        & "$SdkRoot/kotlin-client/gradlew.bat" --console=plain -p "$wikiRoot/verification/jvm-examples" "-PnrfSdkSources=$SdkRoot" "-PwikiLocale=$locale" run
        if ($LASTEXITCODE) { throw "Wiki $locale JVM example checks failed" }
    }
}
