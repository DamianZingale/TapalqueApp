Dependencian instaladas para frontend en formato script unico

code --install-extension dsznajder.es7-react-js-snippets
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension formulahendry.auto-rename-tag
code --install-extension formulahendry.auto-close-tag
code --install-extension xabikos.javascriptsnippets
code --install-extension christian-kohler.path-intellisense
code --install-extension christian-kohler.npm-intellisense

Script para manejar compose

# Iniciar todo
./manage.sh start

# Ver logs
./manage.sh logs
./manage.sh logs frontend

# Estado
./manage.sh status

# Reiniciar
./manage.sh restart

# Detener
./manage.sh stop

# Limpiar todo
./manage.sh clean

# Reconstruir servicio específico
./manage.sh rebuild frontend

# Solo descargar imágenes (útil para pre-descargar en conexión lenta)
./manage.sh pull

# Solo construir (sin levantar)
./manage.sh build

# Ver estado completo
./manage.sh status