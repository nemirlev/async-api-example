# Тестирование AsyncAPI Demo

1. Подготовка окружения

```bash
# Запуск всех сервисов
docker-compose up -d
```

2. Тестирование в Postman
Создание заказа (Create Order)

```plaintext
POST http://localhost:8000/orders
```

Headers:
```plaintext
Content-Type: application/json
```

Body:
```json
{
  "customer_id": "user123",
  "items": [
    {
      "product_id": "prod789",
      "quantity": 2,
      "price": 150000
    }
  ],
  "total_amount": 300000
}
```

Получение статуса заказа (Get Order Status)

```plaintext
GET http://localhost:8000/orders/{order_id}/status
```

Пример ответа:

```json
{
  "order_id": "12345",
  "status": "NEW",
  "created_at": "2024-02-20T15:30:00Z",
  "message": "Order created successfully"
}
```

Мониторинг событий (WebSockets)

```plaintext
WS http://localhost:8000/orders/events
```

3. Проверка результатов

* Откройте Kafka UI: http://localhost:8080
* Перейдите в раздел Topics
* Проверьте сообщения в топиках:
    * orders/created
    * orders/status

4. Коллекция Postman

```json
{
  "info": {
    "name": "AsyncAPI Demo",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/orders",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["orders"]
        },
        "body": {
          "mode": "raw",
          "raw": "{\n  \"customer_id\": \"user123\",\n  \"items\": [\n    {\n      \"product_id\": \"prod789\",\n      \"quantity\": 2,\n      \"price\": 150000\n    }\n  ],\n  \"total_amount\": 300000\n}"
        }
      }
    },
    {
      "name": "Get Order Status",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/orders/12345/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["orders", "12345", "status"]
        }
      }
    }
  ]
}
```

5. Примеры ответов
Успешное создание заказа
```json
{
  "order_id": "12345",
  "status": "NEW",
  "created_at": "2024-02-20T15:30:00Z",
  "message": "Order created successfully"
}
```

Ошибка валидации
```json
{
  "error": "Validation Error",
  "details": {
    "total_amount": "Must be greater than 0",
    "items": "Must contain at least one item"
  }
}
```
Обновление статуса

```json
{
  "order_id": "12345",
  "status": "PROCESSING",
  "updated_at": "2024-02-20T15:35:00Z"
}
```
6. Возможные ошибки

| Код | Описание | Решение |
|-----|----------|---------|
| 400 | Неверный формат данных | Проверьте JSON структуру |
| 404 | Заказ не найден | Проверьте order_id |
| 503 | Kafka недоступна | Проверьте docker-compose logs kafka |

7. Быстрая проверка работоспособности
Выполните последовательно:

1. Создайте заказ (POST /orders)
2. Проверьте статус (GET /orders/{id}/status)
3. Проверьте Kafka UI для подтверждения событий