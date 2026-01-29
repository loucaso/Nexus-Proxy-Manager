@echo off
TITLE Nexus Proxy Manager - Inicializador
CLS

echo ========================================================
echo        NEXUS PROXY MANAGER - INICIALIZADOR
echo        Criado por Loucaso + AI
echo ========================================================
echo.

:: Verifica se o Node.js está instalado
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit
)

:: Verifica se a pasta node_modules existe
IF NOT EXIST "node_modules" (
    echo [AVISO] Dependencias nao encontradas. Instalando agora...
    echo Isso pode levar alguns minutos.
    echo.
    call npm install
    IF %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar dependencias. Verifique sua conexao.
        pause
        exit
    )
    echo.
    echo [SUCESSO] Dependencias instaladas!
) ELSE (
    echo [INFO] Sistema ja instalado. Iniciando...
)

echo.
echo ========================================================
echo        INICIANDO SERVIDOR...
echo ========================================================
echo.

:: Inicia o servidor
npm start

pause