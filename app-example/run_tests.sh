#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Запуск тестов AsyncAPI Demo"

# Проверяем, запущены ли контейнеры
if ! docker-compose ps | grep -q "kafka"; then
    echo "${RED}Kafka не запущена. Запускаем сервисы...${NC}"
    docker-compose up -d
    sleep 10  # Ждём инициализацию
fi

# Запуск тестов
echo "${GREEN}Запуск тестов...${NC}"
docker-compose run --rm order-service pytest tests/ -v --cov=src --cov-report=term-missing

# Получаем код возврата
TEST_EXIT_CODE=$?

# Выводим результат
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "${GREEN}✅ Все тесты пройдены успешно!${NC}"
else
    echo "${RED}❌ Есть проблемы в тестах${NC}"
fi

exit $TEST_EXIT_CODE