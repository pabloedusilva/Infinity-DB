@echo off
echo ==========================================
echo 🔄 MAIS HORAS - DATABASE MANAGER
echo ==========================================
echo.

echo 📦 Instalando dependências...
call npm install

echo.
echo 🔧 Verificando configuração...
if not exist ".env" (
    echo ⚠️ Arquivo .env não encontrado!
    echo 📋 Copie .env.example para .env e configure suas URLs
    echo.
    copy .env.example .env
    echo ✅ Arquivo .env criado a partir do exemplo
    echo 📝 EDITE O ARQUIVO .env AGORA com suas URLs de banco!
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidor...
echo 📊 Dashboard: http://localhost:3001/dashboard
echo 🔗 API: http://localhost:3001/api/info
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

node app.js

pause
