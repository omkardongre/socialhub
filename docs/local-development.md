# Local Development Guide

This guide provides detailed instructions for setting up and running the SocialHub project on your local machine for development purposes.

## Prerequisites

- **Git:** For cloning the repository.
- **Docker & Docker Compose:** The entire local environment is managed by Docker. Make sure you have both installed and running.
  - [Install Docker](https://docs.docker.com/get-docker/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)

## Setup Instructions

1.  **Clone the Repository:**
    ```sh
    git clone <your-repo-url>
    cd socialhub
    ```

2.  **Environment Variables:**
    The project uses `.env.local` files for environment variables for each service. These files are ignored by Git. To get started, you can copy the example files:
    ```sh
    # In the root directory
    cp api-gateway/.env.example api-gateway/.env.local
    cp apps/auth-service/.env.example apps/auth-service/.env.local
    cp apps/user-service/.env.example apps/user-service/.env.local
    # ... repeat for all other services in apps/
    ```
    The default values in the `.env.example` files are configured to work with the `docker-compose.yml` setup.

## Running the Application

1.  **Start All Services:**
    Use Docker Compose to build the images and start all the containers.
    ```sh
    docker-compose up --build
    ```
    - The `--build` flag forces Docker to rebuild the images if there are any changes in the Dockerfiles or source code.
    - This command will show logs from all running containers in your terminal. To run them in the background (detached mode), use `docker-compose up -d --build`.

2.  **Run Database Migrations:**
    When you start the application for the first time, the databases will be created, but the tables (schemas) will be empty. You need to apply the Prisma migrations.
    Open a **new terminal window** and run the migration script from the root directory:
    ```sh
    ./scripts/run-migrations.sh
    ```
    This script iterates through each service that has a `prisma` directory and executes `npx prisma migrate dev`, which applies migrations and generates the Prisma Client.

## Accessing Services

Once everything is running, you can access the different parts of the application at the following local addresses:

| Service                 | URL                                     | Credentials                |
| ----------------------- | --------------------------------------- | -------------------------- |
| **Frontend Application**| [http://localhost:3007](http://localhost:3007) | -                          |
| **API Gateway**         | [http://localhost:8082](http://localhost:8082) | -                          |
| **RabbitMQ Management** | [http://localhost:15672](http://localhost:15672) | `user: guest`, `pass: guest` |
| **Adminer (DB Tool)**   | [http://localhost:8080](http://localhost:8080) | See below                  |
| **Redis Commander**     | [http://localhost:8081](http://localhost:8081) | -                          |

### Connecting to the Database with Adminer

- **System:** `PostgreSQL`
- **Server:** `postgres` (this is the service name from `docker-compose.yml`)
- **Username:** `admin`
- **Password:** `admin123`
- **Database:** `auth_db` (or any of the other service databases)

## Common Development Tasks

### Viewing Logs

- If running in attached mode (`docker-compose up`), logs are in your terminal.
- If running in detached mode, you can view logs for a specific service:
  ```sh
  docker-compose logs -f auth-service
  ```

### Stopping the Application

- To stop all running containers:
  ```sh
  docker-compose down
  ```
- To stop and remove the data volumes (e.g., to start fresh):
  ```sh
  docker-compose down -v
  ```

### Resetting Databases

A script is provided to completely reset all databases. **This will delete all data.**
```sh
./reset-all-dbs.sh
```
After running this, you will need to restart the containers and run migrations again.