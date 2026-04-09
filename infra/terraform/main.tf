# ECR Repository for the NestJS API
resource "aws_ecr_repository" "fintech_api" {
  name                 = "fintech-dr-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true # Matches our Trivy security mindset
  }
}

# ECR Repository for the .NET Auditor
resource "aws_ecr_repository" "fintech_auditor" {
  name                 = "fintech-dr-auditor"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# The Production SQS Queue
resource "aws_sqs_queue" "transaction_queue" {
  name                      = "production-transaction-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 345600 # 4 days of retention for Disaster Recovery
  receive_wait_time_seconds = 5      # Long polling to save costs

  # Enforce encryption at rest
  sqs_managed_sse_enabled = true
}

# Output the created resource URLs
output "api_ecr_url" {
  value = aws_ecr_repository.fintech_api.repository_url
}

output "auditor_ecr_url" {
  value = aws_ecr_repository.fintech_auditor.repository_url
}

output "sqs_queue_url" {
  value = aws_sqs_queue.transaction_queue.url
}