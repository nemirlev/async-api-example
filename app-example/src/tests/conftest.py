import pytest
import asyncio
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import json
import os
from typing import AsyncGenerator

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def kafka_producer() -> AsyncGenerator[AIOKafkaProducer, None]:
    producer = AIOKafkaProducer(
        bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
    )
    await producer.start()
    yield producer
    await producer.stop()

@pytest.fixture
async def kafka_consumer() -> AsyncGenerator[AIOKafkaConsumer, None]:
    consumer = AIOKafkaConsumer(
        'orders/created', 'orders/status',
        bootstrap_servers=os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
        group_id='test-group',
        auto_offset_reset='earliest'
    )
    await consumer.start()
    yield consumer
    await consumer.stop()