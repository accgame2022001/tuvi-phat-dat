@echo off
setlocal EnableExtensions
chcp 65001 >nul

title Tu Vi Phat Dat - BEAR
set "ROOT=%~dp0"
set "LIVE=%~dp0live"
set "LIVE_PORT=3000"
set "WEB_PORT=4173"

echo ==================================================
echo   Tu Vi Phat Dat - BEAR
echo   Game Coi Tu Vi - Gieo Que Kinh Dich TikTok LIVE
echo ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :no_node
where npm >nul 2>nul
if errorlevel 1 goto :no_node

for /f "delims=" %%v in ('node --version') do set "NODE_VER=%%v"
echo [1/5] Node.js %NODE_VER%

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=19)?0:1)"
if not errorlevel 1 goto :node_ok

echo.
echo [CANH BAO] Node %NODE_VER% qua cu. Ket noi TikTok LIVE can Node 22.19 tro len.
echo.
where winget >nul 2>nul
if errorlevel 1 goto :node_manual
choice /C YN /N /M "Tu dong nang cap Node.js LTS bang winget? [Y/N]: "
if errorlevel 2 goto :node_ok
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
echo.
echo Da cai xong. Dong cua so nay roi nhap dup run.bat lai de dung Node moi.
pause
exit /b 0

:node_manual
echo Tai Node.js LTS tai https://nodejs.org roi chay lai run.bat neu muon ket noi TikTok.
echo.

:node_ok

set "NEED_INSTALL="
if not exist "%LIVE%\node_modules\ws" set "NEED_INSTALL=1"
if not exist "%LIVE%\node_modules\sharp" set "NEED_INSTALL=1"
if not exist "%LIVE%\node_modules\msedge-tts" set "NEED_INSTALL=1"
if not exist "%LIVE%\node_modules\piratetok-live-js" set "NEED_INSTALL=1"
if /I "%~1"=="--reinstall" set "NEED_INSTALL=1"

if not defined NEED_INSTALL (
  echo [2/5] Dependency da co san.
  goto :deps_ok
)
echo [2/5] Dang cai dependency cho LIVE...
pushd "%LIVE%"
call npm install --no-fund --no-audit
if errorlevel 1 (
  echo [LOI] npm install that bai. Kiem tra mang Internet roi chay lai.
  popd
  pause
  exit /b 1
)
popd
:deps_ok

netstat -ano | findstr /R /C:":%LIVE_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo [3/5] Cong %LIVE_PORT% dang duoc dung, server LIVE da chay san.
  goto :live_ok
)
echo [3/5] Dang mo server LIVE tai http://localhost:%LIVE_PORT% ...
start "Tu Vi LIVE - BEAR" /D "%LIVE%" cmd /k "set PORT=%LIVE_PORT%&& npm start"
:live_ok

netstat -ano | findstr /R /C:":%WEB_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo [4/5] Cong %WEB_PORT% dang duoc dung, web demo da chay san.
  goto :web_ok
)
echo [4/5] Dang mo web demo tai http://localhost:%WEB_PORT% ...
start "Tu Vi Web - BEAR" /D "%ROOT%" cmd /k npx --yes serve . -l %WEB_PORT%
:web_ok

echo [5/5] Cho server khoi dong...
call :wait_port %LIVE_PORT% 20
start "" "http://localhost:%WEB_PORT%"
start "" "http://localhost:%LIVE_PORT%/live/control.html"

echo.
echo ==================================================
echo   Da mo xong!
echo   Web demo : http://localhost:%WEB_PORT%
echo   Control  : http://localhost:%LIVE_PORT%/live/control.html
echo   Overlay  : http://localhost:%LIVE_PORT%/live/overlay.html
echo ==================================================
ping -n 9 127.0.0.1 >nul
endlocal
exit /b 0

:wait_port
set /a "_left=%~2"
:wait_loop
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul
if not errorlevel 1 exit /b 0
if %_left% LEQ 0 exit /b 1
set /a "_left-=1"
ping -n 2 127.0.0.1 >nul
goto :wait_loop

:no_node
echo [LOI] Chua tim thay Node.js / npm.
where winget >nul 2>nul
if errorlevel 1 (
  echo Tai Node.js LTS tai https://nodejs.org roi chay lai run.bat.
  pause
  exit /b 1
)
choice /C YN /N /M "Tu dong cai Node.js LTS bang winget? [Y/N]: "
if errorlevel 2 exit /b 1
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
echo.
echo Da cai xong. Dong cua so nay roi nhap dup run.bat lai.
pause
exit /b 0
