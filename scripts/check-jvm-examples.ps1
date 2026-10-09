param(
    [string]$SdkRoot = "$PSScriptRoot/../../sdk",
    [ValidateSet('fr', 'en')][string[]]$Locales = @('fr', 'en')
)
$ErrorActionPreference = 'Stop'
$wikiRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$SdkRoot = (Resolve-Path -LiteralPath $SdkRoot).Path
$clientSource = Join-Path $SdkRoot 'kotlin-client'
if (-not (Test-Path -LiteralPath "$clientSource/build.gradle.kts" -PathType Leaf)) {
    $clientSource = Join-Path $SdkRoot 'share/NimbyRailsFranceSDK/kotlin-client'
}
if (-not (Test-Path -LiteralPath "$clientSource/build.gradle.kts" -PathType Leaf)) {
    throw "No Kotlin/JVM client in SDK: $SdkRoot"
}

# Every run starts from a fresh source copy: removed SDK files cannot survive
# in validation. This directory is inside the wiki, never in the SDK or Hub.
$runId = (Get-Date -Format 'yyyyMMddTHHmmssfff') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$output = Join-Path $wikiRoot ".validation/example-check/jvm-smoke-$runId"
$copiedSdkRoot = Join-Path $output 'sdk'
$copiedClientParent = Join-Path $copiedSdkRoot 'share/NimbyRailsFranceSDK'
$copiedClient = Join-Path $copiedClientParent 'kotlin-client'
function Copy-ClientSources([string]$source, [string]$destination) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    foreach ($entry in Get-ChildItem -LiteralPath $source -Force) {
        if ($entry.PSIsContainer) {
            if ($entry.Name -in @('build', '.gradle', '.kotlin', '.idea')) { continue }
            Copy-ClientSources $entry.FullName (Join-Path $destination $entry.Name)
        } else {
            Copy-Item -LiteralPath $entry.FullName -Destination (Join-Path $destination $entry.Name)
        }
    }
}
Copy-ClientSources $clientSource $copiedClient
$wrapper = Join-Path $copiedClient 'gradlew.bat'
if (-not (Test-Path -LiteralPath $wrapper -PathType Leaf)) { throw 'Copied SDK has no Windows Gradle wrapper' }

if ($Locales -contains 'en') {
    & node "$PSScriptRoot/export-examples.mjs"
    if ($LASTEXITCODE) { throw 'English JVM example extraction failed' }
}
& node "$PSScriptRoot/stage-jvm-application.mjs" $output ($Locales -join ',')
if ($LASTEXITCODE) { throw 'JVM application staging failed' }
$projects = Get-Content -LiteralPath "$output/projects.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$results = @()
foreach ($project in $projects.projects) {
    $locale = $project.locale
    # Composite substitution uses the actual SDK API as a separate module,
    # including JNA transitively. It does not give examples internal visibility.
    & $wrapper --console=plain --no-daemon -p "$wikiRoot/verification/jvm-examples" "-PnrfSdkSources=$copiedClientParent" "-PwikiLocale=$locale" run
    if ($LASTEXITCODE) { throw "Wiki $locale JVM pure contracts failed" }

    # Compile the actual tutorial Gradle files and main, without invoking run.
    # No native library is loaded and no process discovery or game connection occurs.
    & $wrapper --console=plain --no-daemon -p $project.directory "-PnrfSdk=$copiedSdkRoot" classes
    if ($LASTEXITCODE) { throw "Wiki $locale standalone JVM application compilation failed" }
    $results += @{ locale = $locale; pureContracts = 'PASS'; tutorialCompilation = 'PASS'; tutorialMainExecuted = $false }
}
@{
    sdkSource = $clientSource
    sdkCopy = $copiedClient
    results = $results
    nativeLibraryLoaded = $false
    gameConnectionOpened = $false
} | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath "$output/verification.json" -Encoding UTF8
Write-Output "JVM example verification: $output/verification.json"
