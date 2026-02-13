# Imagen base optimizada para microservicios Spring Boot
FROM eclipse-temurin:21-jre-alpine

# Instalar utilidades necesarias
RUN apk add --no-cache curl

# Configuración JVM optimizada para contenedores
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Directorio de trabajo
WORKDIR /app

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring
USER spring

# Exponer puerto genérico (se sobreescribe en docker-compose)
EXPOSE 8080