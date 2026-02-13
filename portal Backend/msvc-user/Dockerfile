FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY target/*.jar app.jar

# Crear directorio para uploads de imágenes
RUN mkdir -p /app/uploads

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
