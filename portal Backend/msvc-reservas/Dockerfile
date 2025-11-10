FROM eclipse-temurin:21-jdk-alpine
WORKDIR /TapalqueApp
COPY target/msvc-reservas-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","app.jar"]

