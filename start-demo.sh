#!/bin/bash
echo "🚀 Starting Fintech DR Platform Demo Environment..."

echo "1. Installing Monitoring Stack (Prometheus/Grafana)..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install monitoring-stack prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace --wait

echo "2. Deploying Fintech Platform..."
helm upgrade --install fintech-stack ./infra/helm/fintech-platform --wait

echo "✅ System is live! To trigger a disaster, run:"
echo "   kubectl scale deployment auditor --replicas=0"
echo "   python scripts/load_gen.py"