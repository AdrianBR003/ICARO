# ETAPA 1: Construcción
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# ETAPA 2: Ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

RUN mkdir -p /app/uploads

EXPOSE 8080

# 3. LÓGICA DE REINICIO INTEGRADA 
# Esto ejecuta un bucle:
# - Lanza Java
# - Si Java termina con código 10 -> Espera 2s y repite (Reinicia)
# - Si Java termina con otro código -> Rompe el bucle (Apaga)
ENTRYPOINT ["/bin/sh", "-c", "while true; do echo '[Docker] Iniciando Spring Boot...'; java -jar app.jar; rc=$?; echo \"[Docker] Java ha terminado con código: $rc\"; if [ $rc -eq 10 ]; then echo '[Docker] CÓDIGO 10 DETECTADO -> Reiniciando en 2s...'; sleep 2; else echo \"[Docker] CÓDIGO $rc DETECTADO -> Apagando contenedor.\"; exit $rc; fi; done"]