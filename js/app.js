
    const schema = {
  "asyncapi": "3.0.0",
  "info": {
    "title": "Order Service API",
    "version": "1.0.0",
    "description": "# Сервис заказов\n\nЭтот сервис отвечает за обработку заказов в нашей системе.\n\n## Основные операции\n* Создание заказа\n* Обновление статуса\n* Отправка уведомлений\n\n## Как использовать\n1. Подпишитесь на топик `orders/created` для получения новых заказов\n2. Отправляйте обновления в `orders/status`\n3. Следите за уведомлениями в `orders/notifications`\n"
  },
  "servers": {
    "production": {
      "host": "kafka.example.com:9092",
      "protocol": "kafka",
      "description": "Production Kafka Broker"
    },
    "development": {
      "host": "localhost:9092",
      "protocol": "kafka",
      "description": "Local Kafka Broker"
    }
  },
  "channels": {
    "ordersCreated": {
      "address": "orders/created",
      "messages": {
        "orderCreated": {
          "name": "OrderCreated",
          "title": "Новый заказ",
          "contentType": "application/json",
          "payload": {
            "type": "object",
            "description": "# Схема заказа\n\nОсновная сущность, описывающая заказ в системе\n",
            "properties": {
              "order_id": {
                "type": "string",
                "description": "Уникальный идентификатор заказа",
                "examples": [
                  "12345"
                ],
                "x-parser-schema-id": "<anonymous-schema-1>"
              },
              "customer_id": {
                "type": "string",
                "description": "ID клиента",
                "examples": [
                  "user789"
                ],
                "x-parser-schema-id": "<anonymous-schema-2>"
              },
              "items": {
                "type": "array",
                "description": "Список товаров в заказе",
                "items": {
                  "type": "object",
                  "description": "Товар в заказе",
                  "properties": {
                    "product_id": {
                      "type": "string",
                      "description": "ID товара",
                      "x-parser-schema-id": "<anonymous-schema-4>"
                    },
                    "quantity": {
                      "type": "integer",
                      "minimum": 1,
                      "description": "Количество",
                      "x-parser-schema-id": "<anonymous-schema-5>"
                    },
                    "price": {
                      "type": "integer",
                      "description": "Цена за единицу в копейках",
                      "x-parser-schema-id": "<anonymous-schema-6>"
                    }
                  },
                  "required": [
                    "product_id",
                    "quantity",
                    "price"
                  ],
                  "x-parser-schema-id": "OrderItem"
                },
                "x-parser-schema-id": "<anonymous-schema-3>"
              },
              "total_amount": {
                "type": "integer",
                "description": "Общая сумма заказа в копейках",
                "examples": [
                  300000
                ],
                "x-parser-schema-id": "<anonymous-schema-7>"
              },
              "created_at": {
                "type": "string",
                "format": "date-time",
                "description": "Дата и время создания заказа",
                "x-parser-schema-id": "<anonymous-schema-8>"
              },
              "status": {
                "type": "string",
                "enum": [
                  "NEW",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED"
                ],
                "description": "Текущий статус заказа",
                "x-parser-schema-id": "<anonymous-schema-9>"
              }
            },
            "required": [
              "order_id",
              "customer_id",
              "items",
              "total_amount",
              "created_at",
              "status"
            ],
            "x-parser-schema-id": "Order"
          },
          "examples": [
            {
              "payload": {
                "order_id": "12345",
                "customer_id": "user789",
                "items": [
                  {
                    "product_id": "prod123",
                    "quantity": 2,
                    "price": 150000
                  }
                ],
                "total_amount": 300000,
                "created_at": "2024-02-20T15:30:00Z",
                "status": "NEW"
              }
            }
          ],
          "x-parser-unique-object-id": "orderCreated"
        }
      },
      "description": "# Создание нового заказа\n\nЭтот топик используется для публикации информации о новых заказах.\n\n## Важно\n* Все суммы указываются в копейках\n* Все даты в формате ISO 8601\n* ID заказа должен быть уникальным\n",
      "x-parser-unique-object-id": "ordersCreated"
    },
    "ordersStatus": {
      "address": "orders/status",
      "messages": {
        "statusChanged": {
          "name": "OrderStatusChanged",
          "title": "Изменение статуса заказа",
          "contentType": "application/json",
          "payload": {
            "type": "object",
            "description": "Обновление статуса заказа",
            "properties": {
              "order_id": {
                "type": "string",
                "description": "ID заказа",
                "x-parser-schema-id": "<anonymous-schema-10>"
              },
              "status": {
                "type": "string",
                "enum": [
                  "NEW",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED"
                ],
                "description": "Новый статус",
                "x-parser-schema-id": "<anonymous-schema-11>"
              },
              "updated_at": {
                "type": "string",
                "format": "date-time",
                "description": "Время обновления статуса",
                "x-parser-schema-id": "<anonymous-schema-12>"
              },
              "comment": {
                "type": "string",
                "description": "Комментарий к изменению статуса",
                "x-parser-schema-id": "<anonymous-schema-13>"
              }
            },
            "required": [
              "order_id",
              "status",
              "updated_at"
            ],
            "x-parser-schema-id": "OrderStatus"
          },
          "x-parser-unique-object-id": "statusChanged"
        }
      },
      "description": "# Обновление статуса заказа\n\nИспользуется для отслеживания жизненного цикла заказа\n",
      "x-parser-unique-object-id": "ordersStatus"
    }
  },
  "operations": {
    "sendOrder": {
      "action": "send",
      "channel": "$ref:$.channels.ordersCreated",
      "messages": [
        "$ref:$.channels.ordersCreated.messages.orderCreated"
      ],
      "summary": "Отправка нового заказа",
      "x-parser-unique-object-id": "sendOrder"
    },
    "sendStatus": {
      "action": "send",
      "channel": "$ref:$.channels.ordersStatus",
      "messages": [
        "$ref:$.channels.ordersStatus.messages.statusChanged"
      ],
      "summary": "Отправка обновления статуса",
      "x-parser-unique-object-id": "sendStatus"
    },
    "receiveOrders": {
      "action": "receive",
      "channel": "$ref:$.channels.ordersCreated",
      "messages": [
        "$ref:$.channels.ordersCreated.messages.orderCreated"
      ],
      "summary": "Получение новых заказов",
      "x-parser-unique-object-id": "receiveOrders"
    },
    "receiveStatusUpdates": {
      "action": "receive",
      "channel": "$ref:$.channels.ordersStatus",
      "messages": [
        "$ref:$.channels.ordersStatus.messages.statusChanged"
      ],
      "summary": "Получение обновлений статуса",
      "x-parser-unique-object-id": "receiveStatusUpdates"
    }
  },
  "components": {
    "messages": {
      "OrderCreated": "$ref:$.channels.ordersCreated.messages.orderCreated",
      "OrderStatusChanged": "$ref:$.channels.ordersStatus.messages.statusChanged"
    },
    "schemas": {
      "Order": "$ref:$.channels.ordersCreated.messages.orderCreated.payload",
      "OrderItem": "$ref:$.channels.ordersCreated.messages.orderCreated.payload.properties.items.items",
      "OrderStatus": "$ref:$.channels.ordersStatus.messages.statusChanged.payload"
    }
  },
  "x-parser-spec-parsed": true,
  "x-parser-api-version": 3,
  "x-parser-spec-stringified": true
};
    const config = {"show":{"sidebar":true},"sidebar":{"showOperations":"byDefault"}};
    const appRoot = document.getElementById('root');
    AsyncApiStandalone.render(
        { schema, config, }, appRoot
    );
  