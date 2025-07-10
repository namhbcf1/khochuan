@echo off
REM KhoChuan POS - Deployment Verification Script (Windows)
REM This script runs the deployment verification process

setlocal

echo === KhoChuan POS Deployment Verification ===

set DEPLOYMENT_URL=%1
set API_URL=%2

if "%DEPLOYMENT_URL%"=="" (
  set DEPLOYMENT_URL=https://khochuan-pos.pages.dev
)

if "%API_URL%"=="" (
  set API_URL=https://jsonplaceholder.typicode.com
)

echo.
echo Testing deployment at: %DEPLOYMENT_URL%
echo API expected at: %API_URL%
echo.

REM Set the TEST_DEPLOYED environment variable
set TEST_DEPLOYED=1

REM Check if site is accessible using PowerShell
powershell -Command "try { $response = Invoke-WebRequest -Uri '%DEPLOYMENT_URL%' -Method Head -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host 'Site is accessible' -ForegroundColor Green; exit 0 } else { Write-Host 'Site is not accessible!' -ForegroundColor Red; exit 1 } } catch { Write-Host 'Site is not accessible: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment verification FAILED! Site not accessible.
  echo ## Deployment Verification Failed - %DATE% %TIME% >> CHUAN.MD
  echo Site at %DEPLOYMENT_URL% is not accessible >> CHUAN.MD
  exit /b 1
)

REM Check API
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_URL%' -Method Head -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host 'API is accessible' -ForegroundColor Green; exit 0 } else { Write-Host 'API is not accessible!' -ForegroundColor Red; exit 1 } } catch { Write-Host 'API is not accessible: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment verification FAILED! API not accessible.
  echo ## Deployment Verification Failed - %DATE% %TIME% >> CHUAN.MD
  echo API at %API_URL% is not accessible >> CHUAN.MD
  exit /b 1
)

REM Run the deployment tests
echo Running deployment tests...

REM Set environment variables for the test
set DEPLOYMENT_URL=%DEPLOYMENT_URL%
set API_URL=%API_URL%

REM Run the tests
node tests\run-deployment-tests.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment verification FAILED!
  exit /b 1
)

echo.
echo Deployment verification completed successfully!
echo Results saved to CHUAN.MD
echo To view detailed report: npx playwright show-report

endlocal 