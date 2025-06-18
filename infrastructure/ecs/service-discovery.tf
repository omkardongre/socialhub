data "aws_vpc" "main" {
  # Use your existing VPC data source or update as needed
  default = true
}

resource "aws_service_discovery_private_dns_namespace" "socialhub" {
  name        = "socialhub.local"
  description = "Namespace for SocialHub ECS service discovery"
  vpc         = data.aws_vpc.main.id
}

resource "aws_service_discovery_service" "auth_service" {
  name = "auth-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.socialhub.id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config { failure_threshold = 1 }
}

resource "aws_service_discovery_service" "user_service" {
  name = "user-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.socialhub.id
    dns_records { type = "A" ttl = 10 }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config { failure_threshold = 1 }
}

resource "aws_service_discovery_service" "post_service" {
  name = "post-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.socialhub.id
    dns_records { type = "A" ttl = 10 }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config { failure_threshold = 1 }
}

resource "aws_service_discovery_service" "media_service" {
  name = "media-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.socialhub.id
    dns_records { type = "A" ttl = 10 }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config { failure_threshold = 1 }
}

resource "aws_service_discovery_service" "notification_service" {
  name = "notification-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.socialhub.id
    dns_records { type = "A" ttl = 10 }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config { failure_threshold = 1 }
}

resource "aws_service_discovery_service" "chat_service" {
  name = "chat-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.socialhub.id
    dns_records { type = "A" ttl = 10 }
    routing_policy = "MULTIVALUE"
  }
  health_check_custom_config { failure_threshold = 1 }
}
