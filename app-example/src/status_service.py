import asyncio
import json
import os
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.errors import KafkaConnectionError

class StatusService:
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')
        self.order_topic = 'orders'
        self.status_topic = 'order_status'
        
        print(f"Connecting to Kafka at {self.bootstrap_servers}")
        
        # Initialize producer for sending statuses
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        # Initialize consumer for receiving orders
        self.consumer = AIOKafkaConsumer(
            self.order_topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id='status_service_group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest'
        )

    async def connect(self):
        try:
            await self.producer.start()
            await self.consumer.start()
            print("Successfully connected to Kafka")
        except KafkaConnectionError as e:
            print(f"Failed to connect to Kafka: {e}")
            raise

    async def close(self):
        try:
            await self.producer.stop()
            await self.consumer.stop()
        except Exception as e:
            print(f"Error during cleanup: {e}")

    async def send_status(self, order_id, status):
        status_data = {
            "order_id": order_id,
            "status": status,
            "timestamp": str(asyncio.get_event_loop().time())
        }
        try:
            await self.producer.send(self.status_topic, status_data)
            print(f"Sent status update: {status_data}")
        except Exception as e:
            print(f"Error sending status: {e}")
            raise

    async def process_orders(self):
        try:
            async for msg in self.consumer:
                order_data = msg.value
                print(f"Received order: {order_data}")
                
                # Simulating order processing
                order_id = order_data.get("order_id")
                await asyncio.sleep(2)  # Simulating some work

                # Sending status update
                await self.send_status(order_id, "PROCESSING")

                await asyncio.sleep(3)  # More work

                # Sending final status
                await self.send_status(order_id, "COMPLETED")
                
        except Exception as e:
            print(f"Error processing order: {e}")
            raise

async def main():
    service = StatusService()
    
    try:
        await service.connect()
        await service.process_orders()
    except Exception as e:
        print(f"Service error: {e}")
    finally:
        await service.close()

if __name__ == "__main__":
    asyncio.run(main())