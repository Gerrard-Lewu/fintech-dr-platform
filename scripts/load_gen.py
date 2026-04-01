import requests
import time
import random

API_URL = "http://localhost:3000/transactions"

def send_transaction():
    payload = {
        "accountId": f"ACC-{random.randint(100, 999)}",
        "amount": round(random.uniform(10.0, 500.0), 2),
        "type": random.choice(["CREDIT", "DEBIT"])
    }
    try:
        response = requests.post(API_URL, json=payload)
        print(f"Sent: {payload['accountId']} | Status: {response.status_code}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    print("Starting Fintech Load Generator...")
    for _ in range(20): # Send 20 transactions
        send_transaction()
        time.sleep(0.5)