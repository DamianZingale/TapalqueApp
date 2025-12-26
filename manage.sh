#!/bin/bash

case "$1" in
    start)
        echo "🚀 Iniciando TapalqueApp..."
        echo ""
        
        echo "📥 Descargando imágenes base necesarias..."
        docker-compose pull
        
        echo ""
        echo "🔨 Construyendo imágenes personalizadas..."
        docker-compose build
        
        echo ""
        echo "🚀 Levantando todos los servicios..."
        docker-compose up -d
        
        echo ""
        echo "⏳ Esperando que los servicios inicien..."
        sleep 5
        
        echo ""
        echo "📊 Estado de los contenedores:"
        docker-compose ps
        
        echo ""
        echo "✅ TapalqueApp iniciada exitosamente!"
        echo ""
        echo "🌐 Servicios disponibles:"
        echo "   Frontend:  http://localhost:3000"
        echo "   Eureka:    http://localhost:8761"
        echo "   RabbitMQ:  http://localhost:15672 (user: guest, pass: guest)"
        ;;
        
    stop)
        echo "🛑 Deteniendo TapalqueApp..."
        docker-compose down
        echo "✅ Servicios detenidos"
        ;;
        
    restart)
        echo "🔄 Reiniciando TapalqueApp..."
        docker-compose down
        
        echo ""
        echo "📥 Actualizando imágenes base..."
        docker-compose pull
        
        echo ""
        echo "🔨 Reconstruyendo servicios..."
        docker-compose build
        
        echo ""
        echo "🚀 Levantando servicios..."
        docker-compose up -d
        
        echo ""
        echo "✅ Servicios reiniciados"
        docker-compose ps
        ;;
        
    logs)
        if [ -z "$2" ]; then
            echo "📋 Mostrando logs de todos los servicios..."
            echo "   (Presiona Ctrl+C para salir)"
            echo ""
            docker-compose logs -f
        else
            echo "📋 Mostrando logs de: $2"
            echo "   (Presiona Ctrl+C para salir)"
            echo ""
            docker-compose logs -f "$2"
        fi
        ;;
        
    status)
        echo "📊 Estado de los servicios:"
        docker-compose ps
        echo ""
        echo "💾 Uso de volúmenes:"
        docker volume ls | grep tapalqueapp
        echo ""
        echo "🌐 Red Docker:"
        docker network ls | grep tapalque
        ;;
        
    clean)
        echo "🧹 Limpiando TapalqueApp completamente..."
        echo ""
        echo "⚠️  ADVERTENCIA: Esto eliminará:"
        echo "   - Todos los contenedores"
        echo "   - Todos los volúmenes (bases de datos)"
        echo "   - Imágenes no utilizadas"
        echo ""
        read -p "¿Estás seguro? (s/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            echo ""
            echo "🗑️  Eliminando contenedores y volúmenes..."
            docker-compose down -v
            
            echo ""
            echo "🗑️  Limpiando imágenes sin usar..."
            docker system prune -f
            
            echo ""
            echo "✅ Limpieza completada"
        else
            echo "❌ Operación cancelada"
        fi
        ;;
        
    rebuild)
        if [ -z "$2" ]; then
            echo "❌ Error: Debes especificar un servicio"
            echo ""
            echo "Uso: ./manage.sh rebuild [servicio]"
            echo ""
            echo "Servicios disponibles:"
            docker-compose config --services
        else
            echo "🔨 Reconstruyendo servicio: $2"
            echo ""
            
            echo "📥 Descargando imagen base si es necesaria..."
            docker-compose pull "$2" 2>/dev/null || echo "   (Servicio personalizado, no requiere pull)"
            
            echo ""
            echo "🔨 Construyendo imagen..."
            docker-compose build "$2"
            
            echo ""
            echo "🚀 Reiniciando servicio..."
            docker-compose up -d "$2"
            
            echo ""
            echo "✅ Servicio $2 reconstruido"
            docker-compose ps "$2"
        fi
        ;;
        
    pull)
        echo "📥 Descargando todas las imágenes base..."
        docker-compose pull
        echo "✅ Imágenes descargadas"
        ;;
        
    build)
        echo "🔨 Construyendo todas las imágenes personalizadas..."
        docker-compose build
        echo "✅ Imágenes construidas"
        ;;
        
    *)
        echo "Uso: ./manage.sh {start|stop|restart|logs|status|clean|rebuild|pull|build}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start              - Descargar, construir e iniciar todos los servicios"
        echo "  stop               - Detener todos los servicios"
        echo "  restart            - Reiniciar todos los servicios (con rebuild)"
        echo "  logs [servicio]    - Ver logs (opcional: servicio específico)"
        echo "  status             - Ver estado de servicios, volúmenes y red"
        echo "  clean              - Limpiar todo (incluye volúmenes y BD)"
        echo "  rebuild [servicio] - Reconstruir un servicio específico"
        echo "  pull               - Solo descargar imágenes base"
        echo "  build              - Solo construir imágenes personalizadas"
        echo ""
        echo "Ejemplos:"
        echo "  ./manage.sh start"
        echo "  ./manage.sh logs frontend"
        echo "  ./manage.sh rebuild msvc-gateway-server"
        echo "  ./manage.sh status"
        exit 1
        ;;
esac