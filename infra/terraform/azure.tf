resource "azurerm_resource_group" "fintech_rg" {
  name     = "fintech-dr-failover-rg"
  location = "East US" # Geographically aligns with AWS us-east-1
}

# Create the Service Bus Namespace
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_servicebus_namespace" "fintech_sb" {
  name                = "fintech-dr-failover-${random_string.suffix.result}"
  location            = azurerm_resource_group.fintech_rg.location
  resource_group_name = azurerm_resource_group.fintech_rg.name
  sku                 = "Standard"
}

# Create the Failover Queue
resource "azurerm_servicebus_queue" "transaction_queue" {
  name         = "failover-transaction-queue"
  namespace_id = azurerm_servicebus_namespace.fintech_sb.id
}

output "azure_servicebus_connection_string" {
  value     = azurerm_servicebus_namespace.fintech_sb.default_primary_connection_string
  sensitive = true
}