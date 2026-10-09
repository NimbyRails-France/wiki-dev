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
# Standalone Entry.kt examples deliberately share nimby.mod.createMod(). Compile
# each one in its own consumer module instead of changing the code readers copy.
$standalone = @{
    'ModOptions.kt' = @{ Name = 'options'; Entry = 'wiki.optiontests.main'; Test = 'mod-options-example.kt'; Id = 'clock-history'; Title = 'Clock tools' }
    'TrainEditor.kt' = @{ Name = 'train-editor'; Entry = 'wiki.traineditortests.main'; Test = 'train-editor-example.kt'; Id = 'long-trains'; Title = 'Long trains' }
}
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
        $inventory = @(Get-ChildItem -LiteralPath "$wikiRoot/app/content/snippets" -Filter *.kt | Select-Object -ExpandProperty Name)
        foreach ($name in $inventory) {
            if (-not (Test-Path -LiteralPath (Join-Path $sourceDirectory $name) -PathType Leaf)) {
                throw "Missing $locale example: $name"
            }
        }
        $snippets = @($inventory | Where-Object { -not $standalone.ContainsKey($_) } | ForEach-Object { Join-Path $sourceDirectory $_ })
        & $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry wiki.tests.main -o "$output/wiki-example-$locale" @snippets "$wikiRoot/tests/mod-example.kt" "$output/ModInfo.kt"
        if ($LASTEXITCODE) { throw "Wiki $locale example compilation failed" }
        & "$output/wiki-example-$locale.exe"
        if ($LASTEXITCODE) { throw "Wiki $locale example checks failed" }
        & $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry wiki.tooltests.main -o "$output/wiki-tool-example-$locale" @snippets "$wikiRoot/tests/tool-examples.kt" "$output/ModInfo.kt"
        if ($LASTEXITCODE) { throw "Wiki $locale tool example compilation failed" }
        & "$output/wiki-tool-example-$locale.exe"
        if ($LASTEXITCODE) { throw "Wiki $locale tool example checks failed" }
        foreach ($name in $standalone.Keys) {
            if ($inventory -notcontains $name) { throw "Standalone example is missing from the source inventory: $name" }
            $example = $standalone[$name]
            $identity = Join-Path $output "ModInfo-$($example.Name).kt"
            $idLiteral = ConvertTo-Json -InputObject $example.Id -Compress
            $titleLiteral = ConvertTo-Json -InputObject $example.Title -Compress
            "package nimby.mod; internal val modInfo = nimby.ModInfo($idLiteral, $titleLiteral)" | Set-Content -LiteralPath $identity -Encoding UTF8
            $binary = Join-Path $output "wiki-$($example.Name)-example-$locale"
            & $compiler -target mingw_x64 -library "$output/nimby-mod-api.klib" -entry $example.Entry -o $binary (Join-Path $sourceDirectory $name) (Join-Path "$wikiRoot/tests" $example.Test) $identity
            if ($LASTEXITCODE) { throw "Wiki $locale $($example.Name) example compilation failed" }
            & "$binary.exe"
            if ($LASTEXITCODE) { throw "Wiki $locale $($example.Name) example checks failed" }
        }
    }
}
if ($Runtime -ne 'native') {
    # Compile against a copy of the real SDK, never write Gradle state into SDK.
    # The helper runs only pure contracts; the actual tutorial main is not run.
    & "$PSScriptRoot/check-jvm-examples.ps1" -SdkRoot $SdkRoot -Locales $Locales
}
