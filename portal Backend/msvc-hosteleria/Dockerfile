FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY target/*.jar app.jar

# Crear directorio para uploads de imágenes
RUN mkdir -p /app/uploads

EXPOSE 0

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]