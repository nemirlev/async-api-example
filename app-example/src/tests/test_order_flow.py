import pytest
import asyncio
import json
from datetime import datetime
from order_service import Order, OrderService
from status_service import StatusService

@pytest.mark.asyncio
async def test_create_order(kafka_producer, kafka_consumer):
    """Тест полного цикла создания заказа"""
    # Создаём тестовый заказ
    order = Order(
        order_id="test123",
        customer_id="user123",
        items=[{
            "product_id": "prod123",
            "quantity": 1,
            "price": 100000
        }],
        total_amount=100000
    )

    # Отправляем заказ
    await kafka_producer.send(
        'orders/created',
        json.dumps(order.to_dict()).encode()
    )

    # Ждём и проверяем статусы
    statuses = []
    async for msg in kafka_consumer:
        if msg.topic == 'orders/status':
            status_data = json.loads(msg.value.decode())
            if status_data['order_id'] == order.order_id:
                statuses.append(status_data['status'])
                if len(statuses) >= 2:  # Ждём хотя бы 2 статуса
                    break

    assert 'NEW' in statuses
    assert 'PROCESSING' in statuses

@pytest.mark.asyncio
async def test_invalid_order(kafka_producer):
    """Тест валидации заказа"""
    invalid_order = {
        "order_id": "",  # Пустой ID
        "customer_id": "user123",
        "items": [],     # Пустые items
        "total_amount": 0
    }

    with pytest.raises(ValueError):
        await kafka_producer.send(
            'orders/created',
            json.dumps(invalid_order).encode()
        )

@pytest.mark.asyncio
@pytest.mark.timeout(10)
async def test_status_updates(kafka_producer, kafka_consumer):
    """Тест последовательности обновления статусов"""
    order_id = "test_status_456"
    
    # Отправляем начальный статус
    await kafka_producer.send(
        'orders/status',
        json.dumps({
            "order_id": order_id,
            "status": "NEW",
            "updated_at": datetime.utcnow().isoformat()
        }).encode()
    )

    # Проверяем последовательность статусов
    expected_statuses = ["NEW", "PROCESSING", "SHIPPED"]
    received_statuses = []

    async for msg in kafka_consumer:
        if msg.topic == 'orders/status':
            status_data = json.loads(msg.value.decode())
            if status_data['order_id'] == order_id:
                received_statuses.append(status_data['status'])
                if len(received_statuses) >= len(expected_statuses):
                    break

    assert received_statuses == expected_statuses