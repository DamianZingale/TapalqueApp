#!/bin/bash

case "$1" in
    start)
        echo "🚀 Iniciando TapalqueApp..."
        docker-compose up -d --build
        echo "✅ Servicios iniciados"
        docker-compose ps
        ;;
    stop)
        echo "🛑 Deteniendo TapalqueApp..."
        docker-compose down
        echo "✅ Servicios detenidos"
        ;;
    restart)
        echo "🔄 Reiniciando TapalqueApp..."
        docker-compose down
        docker-compose up -d --build
        echo "✅ Servicios reiniciados"
        ;;
    logs)
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    status)
        echo "📊 Estado de los servicios:"
        docker-compose ps
        ;;
    clean)
        echo "🧹 Limpiando todo (incluyendo volúmenes)..."
        read -p "¿Estás seguro? (s/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            docker-compose down -v
            docker system prune -f
            echo "✅ Limpieza completada"
        fi
        ;;
    rebuild)
        if [ -z "$2" ]; then
            echo "❌ Especifica un servicio: ./manage.sh rebuild [servicio]"
        else
            echo "🔨 Reconstruyendo $2..."
            docker-compose up -d --build "$2"
            echo "✅ Servicio reconstruido"
        fi
        ;;
    *)
        echo "Uso: ./manage.sh {start|stop|restart|logs|status|clean|rebuild}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start          - Iniciar todos los servicios"
        echo "  stop           - Detener todos los servicios"
        echo "  restart        - Reiniciar todos los servicios"
        echo "  logs [servicio] - Ver logs (opcional: servicio específico)"
        echo "  status         - Ver estado de los servicios"
        echo "  clean          - Limpiar todo (incluye volúmenes)"
        echo "  rebuild [servicio] - Reconstruir un servicio específico"
        echo ""
        echo "Ejemplos:"
        echo "  ./manage.sh start"
        echo "  ./manage.sh logs frontend"
        echo "  ./manage.sh rebuild msvc-gateway-server"
        exit 1
        ;;
esac