$ErrorActionPreference = "Stop"

$localFile = Join-Path $PSScriptRoot "application-local.properties"
$exampleFile = Join-Path $PSScriptRoot "application-local.properties.example"

if (-not (Test-Path $localFile)) {
    Copy-Item $exampleFile $localFile
    Write-Host "Created application-local.properties from example."
}

$content = Get-Content $localFile -Raw

if ($content -match "YOUR_MYSQL_ROOT_PASSWORD") {
    $securePassword = Read-Host "Enter your MySQL root password" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }

    $content = $content -replace 'YOUR_MYSQL_ROOT_PASSWORD', $plainPassword
    Set-Content -Path $localFile -Value $content -Encoding utf8NoBOM
    Write-Host "Saved MySQL credentials to application-local.properties (gitignored)."
}

Set-Location $PSScriptRoot
mvn spring-boot:run
