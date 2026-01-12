#!/bin/bash
echo "Iniciando despliegue de Icaro..."

echo "Bajando cambios de Git..."
git pull origin main

echo " Construyendo y desplegando contenedores..."
docker-compose up -d --build

echo " Limpiando sistema..."
docker image prune -f

echo " ¡Despliegue completado! Backend y Frontend operativos."