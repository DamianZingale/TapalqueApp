FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY target/*.jar app.jar

# Crear directorio para uploads de imágenes
RUN mkdir -p /app/uploads

EXPOSE 0

ENTRYPOINT ["java", "-jar", "app.jar"]
