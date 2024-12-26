#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Running AsyncAPI Demo tests"

# Check if containers are running
if ! docker-compose ps | grep -q "kafka"; then
    echo "${RED}Kafka is not running. Starting services...${NC}"
    docker-compose up -d
    sleep 10  # Wait for initialization
fi

# Running tests
echo "${GREEN}Running tests...${NC}"
docker-compose run --rm order-service pytest tests/ -v --cov=src --cov-report=term-missing

# Получаем код возврата
TEST_EXIT_CODE=$?

# Выводим результат
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "${GREEN}✅ All tests passed successfully!${NC}"
else
    echo "${RED}❌ There are test failures${NC}"
fi

exit $TEST_EXIT_CODE