@echo off
REM ============================================================
REM Upload build ke SteamPipe
REM Prasyarat: Steamworks SDK di %STEAMWORKS_SDK% (folder tools\ContentBuilder)
REM Usage: UploadSteam.bat <steam_login>
REM ============================================================

setlocal
if "%STEAMWORKS_SDK%"=="" (
  echo Set STEAMWORKS_SDK ke folder SDK dulu, contoh:
  echo   set STEAMWORKS_SDK=C:\steamworks_sdk
  exit /b 1
)
if "%~1"=="" (
  echo Usage: UploadSteam.bat ^<steam_login^>
  exit /b 1
)

"%STEAMWORKS_SDK%\tools\ContentBuilder\builder\steamcmd.exe" ^
  +login %~1 ^
  +run_app_build "%~dp0steampipe\app_build.vdf" ^
  +quit

endlocal
