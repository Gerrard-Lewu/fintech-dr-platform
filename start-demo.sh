#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

echo "Starting Enterprise Fintech DR Platform Demo..."

echo "------------------------------------------------"
echo "1. Provisioning Multi-Cloud Infrastructure (Terraform)..."
echo "------------------------------------------------"
cd infra/terraform
terraform init
terraform apply -auto-approve
cd ../../

echo "------------------------------------------------"
echo "2. Injecting Cloud Security Credentials into Kubernetes..."
echo "------------------------------------------------"
# Clean up old secrets if they exist
kubectl delete secret ecr-secret azure-credentials --ignore-not-found

# Fetch AWS Account ID dynamically and create ECR Registry Secret
echo "Authenticating with AWS ECR..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
kubectl create secret docker-registry ecr-secret \
  --docker-server=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region ${AWS_REGION})

# Fetch Azure Service Bus String from Terraform and create Secret
echo "Authenticating with Azure Service Bus..."
AZURE_CONN_STRING=$(cd infra/terraform && terraform output -raw azure_servicebus_connection_string)
kubectl create secret generic azure-credentials \
  --from-literal=AZURE_SERVICEBUS_CONNECTION_STRING="${AZURE_CONN_STRING}"

echo "------------------------------------------------"
echo "3. Installing Observability Stack (Prometheus/Grafana)..."
echo "------------------------------------------------"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring-stack prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace

echo "------------------------------------------------"
echo "4. Deploying Fintech Microservices..."
echo "------------------------------------------------"
helm upgrade --install fintech-stack ./infra/helm/fintech-platform --wait

echo "================================================"
echo "✅ SYSTEM IS LIVE AND MULTI-CLOUD READY!"
echo "================================================"
echo "To test the Active-Passive Azure Failover:"
echo " 1. Run the load generator: python scripts/load_gen.py"
echo " 2. In a new terminal, break the AWS connection:"
echo "    kubectl set env deployment/api SQS_TRANSACTION_QUEUE_URL=https://broken-url"
echo " 3. Watch the logs rescue the data:"
echo "    kubectl logs -f deployment/api"
echo "================================================"