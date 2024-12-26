
    const schema = {
  "asyncapi": "3.0.0",
  "info": {
    "title": "Order Service API",
    "version": "1.0.0",
    "description": "# Order Service\n\nThis service is responsible for processing orders in our system.\n\n## Main operations\n* Creating an order\n* Updating status\n* Sending notifications\n\n## How to use\n1. Subscribe to the `orders/created` topic to receive new orders\n2. Send updates to `orders/status`\n3. Monitor notifications in `orders/notifications`\n"
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
          "title": "New Order",
          "contentType": "application/json",
          "payload": {
            "type": "object",
            "description": "# Order Schema\n\nThe main entity describing an order in the system\n",
            "properties": {
              "order_id": {
                "type": "string",
                "description": "Unique order identifier",
                "examples": [
                  "12345"
                ],
                "x-parser-schema-id": "<anonymous-schema-1>"
              },
              "customer_id": {
                "type": "string",
                "description": "Customer ID",
                "examples": [
                  "user789"
                ],
                "x-parser-schema-id": "<anonymous-schema-2>"
              },
              "items": {
                "type": "array",
                "description": "List of items in the order",
                "items": {
                  "type": "object",
                  "description": "Order item",
                  "properties": {
                    "product_id": {
                      "type": "string",
                      "description": "Product ID",
                      "x-parser-schema-id": "<anonymous-schema-4>"
                    },
                    "quantity": {
                      "type": "integer",
                      "minimum": 1,
                      "description": "Quantity",
                      "x-parser-schema-id": "<anonymous-schema-5>"
                    },
                    "price": {
                      "type": "integer",
                      "description": "Price per unit in kopecks",
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
                "description": "Total order amount in kopecks",
                "examples": [
                  300000
                ],
                "x-parser-schema-id": "<anonymous-schema-7>"
              },
              "created_at": {
                "type": "string",
                "format": "date-time",
                "description": "Order creation date and time",
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
                "description": "Current order status",
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
      "description": "# Creating a new order\n\nThis topic is used to publish information about new orders.\n\n## Important\n* All amounts are specified in kopecks\n* All dates are in ISO 8601 format\n* Order ID must be unique\n",
      "x-parser-unique-object-id": "ordersCreated"
    },
    "ordersStatus": {
      "address": "orders/status",
      "messages": {
        "statusChanged": {
          "name": "OrderStatusChanged",
          "title": "Order Status Changed",
          "contentType": "application/json",
          "payload": {
            "type": "object",
            "description": "Order status update",
            "properties": {
              "order_id": {
                "type": "string",
                "description": "Order ID",
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
                "description": "New status",
                "x-parser-schema-id": "<anonymous-schema-11>"
              },
              "updated_at": {
                "type": "string",
                "format": "date-time",
                "description": "Status update time",
                "x-parser-schema-id": "<anonymous-schema-12>"
              },
              "comment": {
                "type": "string",
                "description": "Comment on status change",
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
      "description": "# Updating order status\n\nUsed to track the lifecycle of an order\n",
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
      "summary": "Sending a new order",
      "x-parser-unique-object-id": "sendOrder"
    },
    "sendStatus": {
      "action": "send",
      "channel": "$ref:$.channels.ordersStatus",
      "messages": [
        "$ref:$.channels.ordersStatus.messages.statusChanged"
      ],
      "summary": "Sending a status update",
      "x-parser-unique-object-id": "sendStatus"
    },
    "receiveOrders": {
      "action": "receive",
      "channel": "$ref:$.channels.ordersCreated",
      "messages": [
        "$ref:$.channels.ordersCreated.messages.orderCreated"
      ],
      "summary": "Receiving new orders",
      "x-parser-unique-object-id": "receiveOrders"
    },
    "receiveStatusUpdates": {
      "action": "receive",
      "channel": "$ref:$.channels.ordersStatus",
      "messages": [
        "$ref:$.channels.ordersStatus.messages.statusChanged"
      ],
      "summary": "Receiving status updates",
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
  