terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # We will use local state for now, but in a real enterprise, 
  # this would be stored in an S3 bucket.
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1" # We match the region from your localstack config
  
  default_tags {
    tags = {
      Environment = "Production"
      Project     = "Fintech-DR-Platform"
      ManagedBy   = "Terraform"
    }
  }
}