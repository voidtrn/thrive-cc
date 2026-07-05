@echo off
REM ============================================================
REM Steam release build - Shipping, cooked, packaged
REM Usage: BuildSteam.bat [path-to-UE5]  (default: C:\Program Files\Epic Games\UE_5.4)
REM ============================================================

setlocal
set UE_ROOT=%~1
if "%UE_ROOT%"=="" set UE_ROOT=C:\Program Files\Epic Games\UE_5.4
set PROJECT_DIR=%~dp0..
set PROJECT=%PROJECT_DIR%\MyGame.uproject
set ARCHIVE_DIR=%PROJECT_DIR%\Build\Steam

echo === Building Aether Realm for Steam (Shipping) ===
echo UE Root: %UE_ROOT%
echo Project: %PROJECT%
echo Output : %ARCHIVE_DIR%

call "%UE_ROOT%\Engine\Build\BatchFiles\RunUAT.bat" BuildCookRun ^
  -project="%PROJECT%" ^
  -platform=Win64 ^
  -clientconfig=Shipping ^
  -build ^
  -cook ^
  -stage ^
  -pak ^
  -iostore ^
  -compressed ^
  -archive ^
  -archivedirectory="%ARCHIVE_DIR%"

if %ERRORLEVEL% neq 0 (
  echo BUILD FAILED
  exit /b %ERRORLEVEL%
)

echo === Build OK: %ARCHIVE_DIR% ===
echo Next: Scripts\UploadSteam.bat untuk push ke SteamPipe
endlocal
