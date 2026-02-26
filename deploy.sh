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
# COMPILAR JARS (Maven sin tests)
# ==========================================
build_jars() {
    echo_info "Compilando JARs de todos los microservicios (en lotes de 3)..."

    BACKEND_DIR="portal Backend"
    LOG_DIR="/tmp/tapalque-build-logs"
    BATCH_SIZE=3
    mkdir -p "$LOG_DIR"

    ALL_SERVICES=()
    for SERVICE_DIR in "$BACKEND_DIR"/msvc-* "$BACKEND_DIR"/eureka-*; do
        if [ -f "$SERVICE_DIR/pom.xml" ]; then
            ALL_SERVICES+=("$SERVICE_DIR")
        fi
    done

    FAILED=()
    TOTAL=${#ALL_SERVICES[@]}
    BUILT=0

    for ((i=0; i<TOTAL; i+=BATCH_SIZE)); do
        PIDS=()
        SERVICES=()
        BATCH_END=$((i + BATCH_SIZE))
        if [ $BATCH_END -gt $TOTAL ]; then BATCH_END=$TOTAL; fi

        echo_info "Lote $((i/BATCH_SIZE + 1)): compilando servicios $((i+1))-${BATCH_END} de ${TOTAL}..."

        for ((j=i; j<BATCH_END; j++)); do
            SERVICE_DIR="${ALL_SERVICES[$j]}"
            SERVICE_NAME=$(basename "$SERVICE_DIR")
            SERVICES+=("$SERVICE_NAME")
            (cd "$SERVICE_DIR" && mvn clean package -Dmaven.test.skip=true -q > "$LOG_DIR/$SERVICE_NAME.log" 2>&1) &
            PIDS+=($!)
        done

        for k in "${!PIDS[@]}"; do
            if wait "${PIDS[$k]}"; then
                BUILT=$((BUILT + 1))
                echo_info "${SERVICES[$k]} compilado OK ($BUILT/$TOTAL)"
            else
                echo_error "${SERVICES[$k]} fallo (ver $LOG_DIR/${SERVICES[$k]}.log)"
                FAILED+=("${SERVICES[$k]}")
            fi
        done
    done

    if [ ${#FAILED[@]} -gt 0 ]; then
        echo_error "Servicios con error: ${FAILED[*]}"
        exit 1
    fi

    echo_info "Todos los JARs compilados correctamente"
}

# ==========================================
# ARRANQUE ESCALONADO (evita picos de CPU)
# ==========================================
wait_for_services() {
    local services=("$@")
    local max_wait=120
    local elapsed=0

    while [ $elapsed -lt $max_wait ]; do
        local all_ready=true
        for svc in "${services[@]}"; do
            local status
            status=$($COMPOSE_CMD ps "$svc" --format "{{.Status}}" 2>/dev/null)
            if echo "$status" | grep -qi "unhealthy\|starting"; then
                all_ready=false
                break
            fi
        done

        if $all_ready; then
            return 0
        fi

        sleep 10
        elapsed=$((elapsed + 10))
        echo_info "Esperando servicios... (${elapsed}s)"
    done

    echo_warn "Timeout esperando servicios, continuando..."
}

startup_staggered() {
    echo_info "=== Arranque escalonado de servicios ==="

    # Paso 1: Bases de datos + RabbitMQ + Redis + WPPConnect
    echo_info "[1/6] Levantando bases de datos, RabbitMQ, Redis y WPPConnect..."
    $COMPOSE_CMD up -d rabbitmq redis wppconnect \
        pedidos-db reservas-db jwt-db user-db \
        gastronomia-db hosteleria-db mercado-pago-db \
        comercio-db eventos-db servicios-db termas-db espacios-publicos-db
    wait_for_services rabbitmq redis jwt-db user-db

    # Paso 2: Eureka (service registry)
    echo_info "[2/6] Levantando Eureka..."
    $COMPOSE_CMD up -d eureka-server
    wait_for_services eureka-server

    # Paso 3: Gateway
    echo_info "[3/6] Levantando Gateway..."
    $COMPOSE_CMD up -d msvc-gateway-server
    sleep 30

    # Paso 4: Servicios criticos
    echo_info "[4/6] Levantando servicios criticos..."
    $COMPOSE_CMD up -d msvc-jwt msvc-user
    sleep 40
    $COMPOSE_CMD up -d msvc-pedidos msvc-reservas msvc-mercado-pago
    sleep 40

    # Paso 5: Servicios no criticos (de a 3)
    echo_info "[5/6] Levantando servicios no criticos..."
    $COMPOSE_CMD up -d msvc-gastronomia msvc-hosteleria msvc-comercio
    sleep 30
    $COMPOSE_CMD up -d msvc-eventos msvc-servicios msvc-termas
    sleep 30
    $COMPOSE_CMD up -d msvc-espacios-publicos

    # Paso 6: Frontend + proxy
    echo_info "[6/6] Levantando frontend y proxy..."
    $COMPOSE_CMD up -d frontend nginx-proxy certbot

    echo_info "=== Arranque escalonado completado ==="
}

# ==========================================
# BUILD Y DEPLOY
# ==========================================
build_and_deploy() {
    echo_info "Compilando JARs..."
    build_jars

    echo_info "Construyendo imagen base de Java..."
    docker build -t tapalque-base-java:latest "portal Backend/base-java-image"

    echo_info "Construyendo imagenes Docker de produccion..."
    $COMPOSE_CMD build

    echo_info "Levantando servicios (escalonado)..."
    startup_staggered
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
    $COMPOSE_CMD run --rm --entrypoint "certbot" certbot certonly \
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
    build-jars)
        build_jars
        ;;
    startup)
        echo_info "Arrancando servicios de forma escalonada..."
        startup_staggered
        verify_deployment
        ;;
    ssl)
        setup_ssl
        ;;
    rebuild)
        echo_info "Rebuild completo..."
        build_jars
        docker build -t tapalque-base-java:latest "portal Backend/base-java-image"
        $COMPOSE_CMD down
        $COMPOSE_CMD build --no-cache
        startup_staggered
        ;;
    update)
        echo_info "Actualizando servicios..."
        build_jars
        docker build -t tapalque-base-java:latest "portal Backend/base-java-image"
        $COMPOSE_CMD build
        startup_staggered
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
        echo "Uso: $0 {deploy|ssl|rebuild|update|build-jars|startup|logs|status|stop}"
        echo ""
        echo "  deploy     - Deploy completo (build JARs + Docker + arranque escalonado + SSL)"
        echo "  build-jars - Solo compilar JARs (Maven sin tests)"
        echo "  startup    - Solo arrancar servicios de forma escalonada (sin compilar)"
        echo "  ssl        - Solo configurar/renovar SSL"
        echo "  rebuild    - Recompilar JARs + rebuild Docker sin cache + arranque escalonado"
        echo "  update     - Recompilar JARs + rebuild Docker + arranque escalonado"
        echo "  logs       - Ver logs (opcional: nombre del servicio)"
        echo "  status     - Ver estado y recursos"
        echo "  stop       - Detener todos los servicios"
        ;;
esac
