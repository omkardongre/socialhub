# SocialHub Architecture

This document provides a high-level overview of the SocialHub system architecture, its components, and how they interact.

## High-Level Architecture Diagram

The architecture consists of the following key components:
- A **Client (Next.js Frontend)** that interacts with the system.
- An **API Gateway** that serves as the single entry point for all client requests.
- A set of independent **Microservices**, each responsible for a specific business domain.
- A **Shared Database** (PostgreSQL) with a separate schema for each service for data isolation.
- A **Message Broker** (RabbitMQ) for asynchronous, event-driven communication between services.
- **Cloud Infrastructure** (AWS) for hosting, storage, and managed services.

```
[Client (Browser)] <--> [Vercel] <--> [API Gateway (ECS)]
                                           |
                                           V
+-----------------------------------------------------------------------+
| Backend Microservices (Running on AWS ECS)                            |
|                                                                       |
| [Auth]  [User]  [Post]  [Media]  [Notification]  [Chat]               |
|   |       |       |        |          ^             |                 |
|   |       |       |        |          | (subscribes)  |                 |
|   +-------+-------+--------+----------+-------------+-----------------+
|           | (REST API Calls)          | (Events)
|           V                           V
| [PostgreSQL (RDS)]         [RabbitMQ (Message Broker)]
| (Separate DBs/Schemas)
|
| [S3 Bucket for Media]
+-----------------------------------------------------------------------+
```

## Microservice Decomposition

The system is broken down into the following microservices based on the Single Responsibility Principle. Each service is independently deployable and scalable.

| Service                | Description                                                                                             | Database Schema      |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | -------------------- |
| **Auth Service**       | Handles user registration, login, and JWT token generation/validation.                                    | `auth_db`            |
| **User Service**       | Manages user profiles, relationships (follows/friends), and user-related data.                            | `user_db`            |
| **Post Service**       | Responsible for creating, reading, updating, and deleting posts and comments. Publishes events on new posts. | `post_db`            |
| **Media Service**      | Manages the upload, storage, and retrieval of media files (images, videos) to an object store like S3.    | `media_db`           |
| **Notification Service**| Listens for events from other services (e.g., `post_created`, `user_followed`) and creates notifications for users. | `notification_db`    |
| **Chat Service**       | Powers real-time messaging between users using WebSockets or similar technology.                          | `chat_db`            |

## Communication Patterns

### Synchronous Communication (REST)

- **Client to Backend:** The frontend communicates with the backend exclusively through the **API Gateway** via REST APIs.
- **Inter-service (Request/Response):** When one service needs data from another synchronously, it makes a direct REST API call. This is generally kept to a minimum to avoid tight coupling. The API Gateway is the primary orchestrator.

### Asynchronous Communication (Event-Driven)

- **Event Bus:** SocialHub uses **RabbitMQ** as a message broker to facilitate asynchronous communication.
- **How it works:** When a significant event occurs (e.g., a user creates a new post), the `Post Service` publishes a `post_created` event to a specific exchange in RabbitMQ.
- **Subscribers:** Other services, like the `Notification Service`, subscribe to these events. Upon receiving the event, the `Notification Service` can generate notifications for the user's followers without the `Post Service` needing to know about it.
- **Benefits:** This pattern decouples services, improves fault tolerance (if the notification service is down, events can be processed later), and enhances scalability.

## Data Management

- **Database-per-Service (Schema-based):** While a single PostgreSQL instance is used for local development and simplicity in this project, each service has its own dedicated database (or schema). This enforces data ownership and ensures a service's data can only be accessed through its API. This is a crucial pattern for microservices.
- **Data Consistency:** The system uses an eventual consistency model for data that is spread across services. For example, if a user's name is updated in the `User Service`, other services that might have a copy of that name will be updated asynchronously via events.

## Security

- **Authentication:** Handled by the `Auth Service`, which issues JWTs upon successful login.
- **Authorization:** The API Gateway is responsible for validating the JWT on incoming requests before forwarding them to the appropriate microservice. It can also enforce role-based access control.
- **Secrets Management:** In production, environment variables and secrets are managed securely using AWS Secrets Manager or Parameter Store and injected into the ECS tasks. The `infrastructure/env-files` module helps sync local `.env` files to a secure S3 bucket for Terraform to use.