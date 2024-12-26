import asyncio
import json
import os
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.errors import KafkaConnectionError

class OrderService:
    def __init__(self):
        # Get the broker address from the environment variable
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')

        self.order_topic = 'orders'
        self.status_topic = 'order_status'
        
        print(f"Connecting to Kafka at {self.bootstrap_servers}")
        
        # Initialize producer
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        # Initialize consumer
        self.consumer = AIOKafkaConsumer(
            self.status_topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id='order_service_group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest'
        )

    async def connect(self):
        try:
            # Starting producer and consumer
            await self.producer.start()
            await self.consumer.start()
            print("Successfully connected to Kafka")
        except KafkaConnectionError as e:
            print(f"Failed to connect to Kafka: {e}")
            raise

    async def close(self):
        # Properly closing connections
        try:
            await self.producer.stop()
            await self.consumer.stop()
        except Exception as e:
            print(f"Error during cleanup: {e}")

    async def send_order(self, order_data):
        try:
            await self.producer.send(self.order_topic, order_data)
            print(f"Sent order: {order_data}")
        except Exception as e:
            print(f"Error sending order: {e}")
            raise

    async def process_status_updates(self):
        try:
            async for msg in self.consumer:
                status_data = msg.value
                print(f"Received status update: {status_data}")
        except Exception as e:
            print(f"Error processing status update: {e}")
            raise

async def main():
    service = OrderService()
    
    try:
        await service.connect()
        
        # Create a test order
        test_order = {
            "order_id": "123",
            "items": ["item1", "item2"],
            "customer": "test_customer"
        }
        
        # Send the order and start listening for updates
        await asyncio.gather(
            service.send_order(test_order),
            service.process_status_updates()
        )
    except Exception as e:
        print(f"Service error: {e}")
    finally:
        await service.close()

if __name__ == "__main__":
    asyncio.run(main())