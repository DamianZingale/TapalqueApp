#!/bin/bash

# Scripts de gestión de Docker Compose para Tapalque App - Versión Simple
# Uso: ./docker-manager.sh [comando] [perfil]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de ayuda
show_help() {
    echo -e "${BLUE}🐳 Docker Manager - Tapalque App${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC} ./docker-manager.sh [comando] [perfil]"
    echo ""
    echo -e "${YELLOW}Comandos:${NC}"
    echo "  start     Iniciar servicios"
    echo "  stop      Detener servicios"
    echo "  restart   Reiniciar servicios"
    echo "  status    Ver estado de servicios"
    echo "  logs      Ver logs de servicios"
    echo "  clean     Limpiar contenedores y volúmenes"
    echo "  monitor   Monitorear uso de recursos"
    echo ""
    echo -e "${YELLOW}Perfiles:${NC}"
    echo "  minimal   Solo infraestructura esencial ~400MB RAM"
    echo "  dev       Servicios clave para pruebas integradas ~2GB RAM"
    echo "  full      Sistema completo ~4GB RAM"
    echo ""
    echo -e "${YELLOW}Ejemplos:${NC}"
    echo "  ./docker-manager.sh start minimal  # Iniciar perfil mínimo"
    echo "  ./docker-manager.sh status         # Ver estado actual"
    echo "  ./docker-manager.sh clean          # Limpiar todo"
}

# Iniciar servicios
start_services() {
    local profile=${1:-minimal}
    echo -e "${GREEN}🚀 Iniciando servicios con perfil: ${profile}${NC}"
    
    case $profile in
        minimal)
            # Usar archivo específico para minimal
            docker-compose -f docker-compose.minimal.yml up -d
            ;;
        dev)
            # Usar docker-compose con servicios de desarrollo clave
            docker-compose -f docker-compose.dev.yml up -d
            ;;
        full)
            docker-compose -f docker-compose.yml up -d
            ;;
        *)
            echo -e "${RED}❌ Perfil no válido: ${profile}${NC}"
            echo "Perfiles disponibles: minimal, dev, full"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    sleep 5
    show_status
}

# Detener servicios
stop_services() {
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker-compose.minimal.yml down 2>/dev/null || true
    
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Mostrar estado
show_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    echo ""
    
    local containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
    if [ -n "$containers" ]; then
        echo -e "${GREEN}🟢 Contenedores activos:${NC}"
        echo "$containers"
    else
        echo -e "${RED}🔴 No hay contenedores activos${NC}"
    fi
    
    echo ""
    if docker ps -q | grep -q .; then
        echo -e "${BLUE}💾 Uso de recursos:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    fi
}

# Ver logs
show_logs() {
    local service=${1:-}
    if [ -n "$service" ]; then
        echo -e "${BLUE}📋 Logs del servicio: ${service}${NC}"
        docker logs -f "$(docker ps -q --filter "name=${service}" | head -1)"
    else
        echo -e "${BLUE}📋 Logs de todos los servicios:${NC}"
        docker-compose logs -f --tail=50 2>/dev/null || docker logs -f $(docker ps -q)
    fi
}

# Limpiar sistema
clean_all() {
    echo -e "${YELLOW}🧹 Limpiando sistema Docker...${NC}"
    
    read -p "⚠️  Esto eliminará todos los contenedores, imágenes y volúmenes. ¿Continuar? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}❌ Cancelado${NC}"
        exit 1
    fi
    
    docker-compose -f docker-compose.yml down -v 2>/dev/null || true
    docker-compose -f docker-compose.minimal.yml down -v 2>/dev/null || true
    docker container prune -f
    docker image prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Monitoreo continuo
monitor_resources() {
    echo -e "${BLUE}📊 Monitoreo de recursos (Ctrl+C para salir)${NC}"
    while true; do
        clear
        echo -e "${BLUE}🕐 $(date)${NC}"
        echo ""
        show_status
        echo ""
        echo -e "${BLUE}💾 RAM del sistema:${NC}"
        free -h
        sleep 5
    done
}

# Main
case ${1:-help} in
    start)
        start_services ${2:-minimal}
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services ${2:-minimal}
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs ${2}
        ;;
    clean)
        clean_all
        ;;
    monitor)
        monitor_resources
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no válido: ${1}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac