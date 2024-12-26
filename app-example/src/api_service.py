from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import json
import os
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from typing import List, Optional
import uvicorn

app = FastAPI(title="Order API Service")

# Data models
class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Order(BaseModel):
    customer_id: str
    items: List[OrderItem]
    total_amount: float
    status: Optional[str] = "NEW"

class OrderStatus(BaseModel):
    order_id: str
    status: str

# Global variables for Kafka
producer = None
consumer = None
ORDER_TOPIC = 'orders'
STATUS_TOPIC = 'order_status'
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')

# Storage for tracking order statuses (a real application would use a database)
order_statuses = {}

@app.on_event("startup")
async def startup_event():
    global producer, consumer
    
    print(f"Connecting to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")

    # Initialize producer
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    
    # Initialize consumer
    consumer = AIOKafkaConsumer(
        STATUS_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id='api_service_group',
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='earliest'
    )
    
    await producer.start()
    await consumer.start()
    
    # Start background process to receive status updates
    asyncio.create_task(consume_status_updates())

@app.on_event("shutdown")
async def shutdown_event():
    await producer.stop()
    await consumer.stop()

async def consume_status_updates():
    try:
        async for msg in consumer:
            status_update = msg.value
            order_id = status_update.get('order_id')
            status = status_update.get('status')
            if order_id:
                order_statuses[order_id] = status
            print(f"Status update received: {status_update}")
    except Exception as e:
        print(f"Error consuming status updates: {e}")

@app.post("/orders/", response_model=OrderStatus)
async def create_order(order: Order):
    try:
        # Generate order ID (a real application would use UUID)
        order_id = str(len(order_statuses) + 1)
        
        # Prepare data for sending
        order_data = {
            "order_id": order_id,
            "customer_id": order.customer_id,
            "items": [item.dict() for item in order.items],
            "total_amount": order.total_amount,
            "status": "NEW"
        }
        
        # Send order to Kafka
        await producer.send(ORDER_TOPIC, order_data)
        
        # Save initial status
        order_statuses[order_id] = "NEW"
        
        return {"order_id": order_id, "status": "NEW"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orders/{order_id}/status", response_model=OrderStatus)
async def get_order_status(order_id: str):
    status = order_statuses.get(order_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"order_id": order_id, "status": status}

if __name__ == "__main__":
    uvicorn.run("api_service:app", host="0.0.0.0", port=8000, reload=True)