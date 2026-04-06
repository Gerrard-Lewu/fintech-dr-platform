# Fintech Disaster Recovery & Observability Platform

A cloud-native, distributed microservices platform designed to demonstrate modern DevOps practices, including distributed transaction reconciliation, automated disaster detection, and Kubernetes self-healing.

## Architecture Overview

This platform simulates a high-throughput financial system where transactions must be reliably stored and reconciled across multiple databases.

* **API Gateway (NestJS):** Ingests transactions, saves them to a primary ledger, and queues them for auditing. Protected by global rate limiting.
* **Message Broker (LocalStack / AWS SQS):** Decouples the API from the auditing service to ensure no data is lost during traffic spikes.
* **Reconciliation Auditor (.NET 8 Worker):** Processes queued transactions and logs them into a secondary database for compliance.
* **Persistence Layer:** PostgreSQL (Primary Ledger) and MongoDB (Audit Log).
* **Observability Stack:** Prometheus and Grafana for real-time metrics, custom alerting, and data drift detection.
* **Infrastructure:** Deployed via Helm on Kubernetes with strict Security Contexts.

## Key Features & Hardening

* **Data Drift Alerting:** Custom Prometheus math expressions trigger Discord webhooks if the databases fall out of sync.
* **Kubernetes Self-Healing:** Configured Liveness and Readiness probes automatically restart stalled services.
* **Container Security:** Enforced `runAsNonRoot: true` and User ID `1000` via Helm Security Contexts to prevent privilege escalation.
* **API Abuse Prevention:** Implemented `@nestjs/throttler` to enforce strict rate limiting (10 requests/min) and protect database resources.

## Disaster Recovery Simulation (Chaos Test)

You can simulate a data disaster using the provided load generator to see the automated response system in action.

**1. Simulate an Outage:**
Kill the Auditor service to stop the flow of data reconciliation.
> `kubectl scale deployment auditor --replicas=0`

**2. Generate Traffic:**
Spam the API with transactions using the Python load generator.
> `python scripts/load_gen.py`

**3. Observe the Alert:**
Within 2 minutes, Grafana will detect the "Data Drift" (or a `NoData` state) and transition to a `FIRING` state, sending an automated webhook alert via Discord.

**4. Execute Recovery:**
Bring the Auditor back online. The system will automatically drain the SQS queue, catch up on missing MongoDB records, and resolve the Grafana alert.
> `kubectl scale deployment auditor --replicas=1`

## Deployment Instructions

Requires Docker Desktop (with Kubernetes enabled) and Helm.

**1. Install the monitoring stack**
> `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts`
> `helm install monitoring-stack prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace`

**2. Deploy the Fintech Platform**
> `helm upgrade --install fintech-stack ./infra/helm/fintech-platform`