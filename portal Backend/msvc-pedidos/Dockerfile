FROM tapalque-base-java:latest

# Copiar JAR específico del servicio
COPY target/msvc-pedidos-0.0.1-SNAPSHOT.jar app.jar

# Variables de entorno específicas del servicio
ENV SERVER_PORT=8082
ENV SPRING_PROFILES_ACTIVE=docker

# Exponer puerto del servicio
EXPOSE 8082

# Optimización JVM para este servicio específico
ENV JAVA_OPTS="-Xmx192m -Xms96m -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=60.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]