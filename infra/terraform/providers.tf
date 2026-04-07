terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment = "Production"
      Project     = "Fintech-DR-Platform"
      ManagedBy   = "Terraform"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}