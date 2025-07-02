# SocialHub - A Microservices-Based Social Media Platform 🚀

SocialHub is a full-stack social media platform built with modern microservices architecture, designed for scalability, maintainability, and cloud-native deployment. It serves as a production-ready template for building distributed systems.

## 🌟 Key Features

- **Modern Architecture**: Microservices with API Gateway pattern
- **Real-time Interactions**: Chat, notifications, and activity feeds
- **Media Handling**: Image/video uploads with processing
- **Scalable Backend**: Containerized services with auto-scaling
- **Event-Driven**: RabbitMQ for asynchronous communication
- **CI/CD Pipelines**: GitHub Actions for automated testing & deployment
- **Infrastructure as Code**: Terraform for AWS provisioning

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with SSR/SSG |
| Tailwind CSS | Utility-first CSS framework |
| React Query | Data fetching and caching |
| Socket.IO | Real-time client communication |

### Backend Services
| Service | Technology | Database |
|---------|------------|----------|
| API Gateway | NestJS | - |
| Auth Service | NestJS | PostgreSQL |
| User Service | NestJS | PostgreSQL |
| Post Service | NestJS | PostgreSQL |
| Media Service | NestJS | PostgreSQL |
| Notification Service | NestJS | PostgreSQL |
| Chat Service | NestJS | PostgreSQL |

### Infrastructure
| Component | Technology |
|-----------|------------|
| Containerization | Docker |
| Orchestration | AWS ECS |
| Provisioning | Terraform |
| Message Broker | RabbitMQ |
| Monitoring | Prometheus + Grafana |
| CI/CD | GitHub Actions |

## 🚀 Getting Started

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Terraform 1.5+ (for deployment)

### Local Development

> **Note:** The default `docker-compose.yml` sets `NODE_ENV=development` for all services. This enables development features, detailed logging, and hot-reloading where supported.

1. Clone the repository:
   ```bash
   git clone https://github.com/omkardongre/socialhub.git
   cd socialhub
   ```

2. Start backend services:
   ```bash
   docker-compose up --build
   ```

3. Run frontend separately:
   ```bash
   cd apps/frontend-nextjs
   npm install
   npm run dev
   ```

4. Run database migrations:
   ```bash
   ./scripts/run-migrations.sh
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8082
   - RabbitMQ Dashboard: http://localhost:15672 (guest/guest)
   - Adminer (DB GUI): http://localhost:8080

## 📦 Production Deployment

> **Note:** For production, update your environment files or Docker Compose to set `NODE_ENV=production` for all services. This enables production optimizations and disables development-only features.

### Prerequisites
- Configure AWS credentials
- GitHub Packages access (GHCR_TOKEN)

### Deployment Steps
1. Build and push Docker images:
   ```bash
   ./scripts/build-and-push-ghcr.sh
   ```

2. Update environment files:
   ```bash
   cd infrastructure/env-files
   terraform init
   terraform apply
   ```

3. Deploy infrastructure:
   ```bash
   cd ../
   terraform apply \
     -var="ghcr_username=your_username" \
     -var="ghcr_pat=your_github_pat" \
     -var="db_username=postgres" \
     -var="db_password=your_db_password"
   ```

4. Configure HTTPS reverse proxy:
   Follow the steps in [API HTTPS Setup Guide](./docs/api-https-setup.md)

## 🧪 Testing

### Running Tests
For each service, navigate to its directory and run:
```bash
# Unit tests with coverage
npm run test:unit

# End-to-end tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

Example for auth service:
```bash
cd apps/auth-service
npm run test:unit
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

For detailed information about the project, please refer to the documentation in the [`docs/`](docs/) directory:

- [Architecture Overview](docs/architecture.md)
- [API HTTPS Setup](docs/api-https-setup.md)

## 📬 Contact

For questions or support, please contact:
- Omkar Dongre - omkardongre5@gmail.com
- Project Link: [https://github.com/omkardongre/socialhub](https://github.com/omkardongre/socialhub)

## 🙏 Acknowledgments
- Microservices patterns from [microservices.io](https://docs.nestjs.com/microservices/basics)
- Infrastructure inspiration from AWS Well-Architected Framework