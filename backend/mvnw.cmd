@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@echo off
setlocal enableextensions enabledelayedexpansion

set MAVEN_VERSION=3.9.6
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin\apache-maven-%MAVEN_VERSION%

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

echo Downloading Maven %MAVEN_VERSION%...
powershell -Command "if (-not (Test-Path '%USERPROFILE%\.m2\wrapper\dists')) { New-Item -Path '%USERPROFILE%\.m2\wrapper\dists' -ItemType Directory -Force }; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $zip = '%TEMP%\maven.zip'; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip' -OutFile $zip; Expand-Archive -Path $zip -DestinationPath '%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%-bin' -Force; Remove-Item $zip"

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
) else (
    echo Failed to download Maven wrapper.
    exit /b 1
)
