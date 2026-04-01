import requests
import time
import random
import uuid

API_URL = "http://localhost:3000/transactions"

def send_transaction():
    corr_id = str(uuid.uuid4())

    payload = {
        "correlationId": corr_id,
        "accountId": f"ACC-{random.randint(100, 999)}",
        "amount": round(random.uniform(10.0, 500.0), 2),
        "type": random.choice(["CREDIT", "DEBIT"])
    }
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 201:
            print(f"✅ Success: {payload['accountId']} | ID: {corr_id[:8]}...")
        else:
            print(f"❌ Failed: {response.status_code} | {response.text}")
    except Exception as e:
        print(f"🚨 Connection Error: {e}")

if __name__ == "__main__":
    print("Starting Fintech Load Generator...")
    for _ in range(20): # Send 20 transactions
        send_transaction()
        time.sleep(0.5)