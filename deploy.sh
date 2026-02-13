#!/bin/bash
set -e

# ==========================================
# TapalqueApp - Script de Deploy en Produccion
# Dominio: www.tapalqueapp.com.ar
# ==========================================

DOMAIN="www.tapalqueapp.com.ar"
EMAIL="tapalqueapp@gmail.com"
COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ==========================================
# PRE-REQUISITOS
# ==========================================
check_prerequisites() {
    echo_info "Verificando pre-requisitos..."

    if ! command -v docker &> /dev/null; then
        echo_error "Docker no esta instalado"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo_error "Docker Compose v2 no esta instalado"
        exit 1
    fi

    if [ ! -f .env ]; then
        echo_error "Archivo .env no encontrado. Copia .env.production.example a .env y completa los valores."
        exit 1
    fi

    echo_info "Pre-requisitos OK"
}

# ==========================================
# FIREWALL
# ==========================================
setup_firewall() {
    echo_info "Configurando firewall (ufw)..."

    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 80/tcp    # HTTP
        sudo ufw allow 443/tcp   # HTTPS
        sudo ufw --force enable
        echo_info "Firewall configurado: solo 22, 80, 443 abiertos"
    else
        echo_warn "ufw no encontrado. Configura el firewall manualmente para permitir solo puertos 22, 80 y 443."
    fi
}

# ==========================================
# BUILD Y DEPLOY
# ==========================================
build_and_deploy() {
    echo_info "Construyendo imagen base de Java..."
    docker compose build base-java

    echo_info "Construyendo imagenes de produccion..."
    $COMPOSE_CMD build

    echo_info "Levantando servicios..."
    $COMPOSE_CMD up -d

    echo_info "Esperando a que los servicios esten listos..."
    sleep 30
}

# ==========================================
# SSL - LET'S ENCRYPT
# ==========================================
setup_ssl() {
    echo_info "Configurando SSL con Let's Encrypt..."

    # Verificar si ya existe el certificado
    if $COMPOSE_CMD exec nginx-proxy test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem 2>/dev/null; then
        echo_info "Certificado SSL ya existe, saltando..."
        return
    fi

    echo_info "Obteniendo certificado SSL para $DOMAIN..."
    echo_info "nginx-proxy ya sirve HTTP para el challenge de certbot..."

    # Obtener certificado via webroot (nginx-proxy arranca en modo HTTP-only automaticamente)
    $COMPOSE_CMD run --rm certbot certonly \
        --webroot \
        -w /var/www/certbot \
        -d $DOMAIN \
        -d tapalqueapp.com.ar \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email

    # Reiniciar nginx-proxy para que detecte el certificado y active SSL
    echo_info "Reiniciando nginx-proxy con SSL..."
    $COMPOSE_CMD restart nginx-proxy

    echo_info "Certificado SSL instalado correctamente"
}

# ==========================================
# VERIFICACION
# ==========================================
verify_deployment() {
    echo_info "Verificando deployment..."

    # Verificar containers
    echo_info "Containers en ejecucion:"
    $COMPOSE_CMD ps

    # Verificar HTTPS
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
        echo_info "HTTPS funcionando correctamente"
    else
        echo_warn "HTTPS no responde aun. Verifica que el DNS apunte a este servidor."
    fi
}

# ==========================================
# COMANDOS
# ==========================================
case "${1:-deploy}" in
    deploy)
        check_prerequisites
        setup_firewall
        build_and_deploy
        setup_ssl
        verify_deployment
        echo ""
        echo_info "=== Deploy completado ==="
        echo_info "Sitio: https://$DOMAIN"
        echo_info "Recorda apuntar el DNS de $DOMAIN a la IP de este servidor"
        ;;
    ssl)
        setup_ssl
        ;;
    rebuild)
        echo_info "Rebuild completo..."
        $COMPOSE_CMD down
        $COMPOSE_CMD build --no-cache
        $COMPOSE_CMD up -d
        ;;
    update)
        echo_info "Actualizando servicios..."
        $COMPOSE_CMD pull
        $COMPOSE_CMD build
        $COMPOSE_CMD up -d
        ;;
    logs)
        $COMPOSE_CMD logs -f ${2:-}
        ;;
    status)
        $COMPOSE_CMD ps
        echo ""
        echo_info "Uso de recursos:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        ;;
    stop)
        $COMPOSE_CMD down
        ;;
    *)
        echo "Uso: $0 {deploy|ssl|rebuild|update|logs|status|stop}"
        echo ""
        echo "  deploy   - Deploy completo (build + up + SSL)"
        echo "  ssl      - Solo configurar/renovar SSL"
        echo "  rebuild  - Rebuild sin cache y restart"
        echo "  update   - Pull + build + restart"
        echo "  logs     - Ver logs (opcional: nombre del servicio)"
        echo "  status   - Ver estado y recursos"
        echo "  stop     - Detener todos los servicios"
        ;;
esac
