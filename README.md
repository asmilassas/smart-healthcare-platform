# Smart Healthcare Appointment & Telemedicine Platform

A microservices-based AI-enabled healthcare platform supporting patient appointments, telemedicine consultations, AI-powered symptom checking, and online payments.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Environment Setup](#environment-setup)
5. [Database Setup](#database-setup)
6. [Setting Up ngrok for PayHere](#setting-up-ngrok-for-payhere)
7. [Running the System with Docker](#running-the-system-with-docker)
8. [Running Services Individually (Development)](#running-services-individually-development)
9. [Accessing the Application](#accessing-the-application)
10. [Stopping the System](#stopping-the-system)
11. [Troubleshooting](#troubleshooting)

---

## System Overview

### Services

| Service              | Language | Port |
|----------------------|---|------|
| Auth Service         | Node.js | 5000 |
| Patient Service      | Node.js | 5001 |
| Notification Service | Node.js | 5002 |
| Telemedicine Service | Node.js | 5003 |
| Doctor Service       | Node.js | 5004 |
| Appointment Service  | Node.js | 5005 |
| Payment Service      | Spring Boot | 8083 |
| AI Symptom Service   | Spring Boot | 8084 |
| Frontend             | React | 5173 |

---

## Prerequisites

Ensure the following are installed on your machine before proceeding:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [Node.js](https://nodejs.org/) v18+ (for running services locally without Docker)
- [Java JDK 17+](https://adoptium.net/) (for Spring Boot services without Docker)
- [Maven](https://maven.apache.org/) (for Spring Boot services without Docker)
- [ngrok](https://ngrok.com/download) (for PayHere sandbox webhook)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and/or Docker will spin up a local MongoDB instance (for development)

---

## Project Structure

```
/
├── docker-compose.yml          # Root compose file — orchestrates all services
├── .env                        # Shared root environment variables
│
├── auth-service/
│   ├── Dockerfile
│   └── .env
├── patient-service/
│   ├── Dockerfile
│   └── .env
├── doctor-service/
│   ├── Dockerfile
│   └── .env
├── appointment-service/
│   ├── Dockerfile
│   └── .env
├── notification-service/
│   ├── Dockerfile
│   └── .env
├── telemedicine-service/
│   ├── Dockerfile
│   └── .env
├── payment-service/            # Spring Boot
│   ├── Dockerfile
│   └── src/main/resources/application.properties
├── ai-symptom-service/         # Spring Boot
│   ├── Dockerfile
│   └── src/main/resources/application.properties
└── frontend/
    ├── Dockerfile
    └── .env
```

---

## Environment Setup

### 1. Root `.env` file

Create a `.env` file in the project root (if it does not already exist) and fill in the shared values:

```env
# JWT
JWT_SECRET=your_jwt_secret_key

# MongoDB (used by Node.js services in development)
# Local MongoDB container
MONGO_URI_LOCAL=mongodb://mongo:27017

# Atlas cloud
MONGO_URI_ATLAS=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?appName=Cluster0

# Notification Service
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password   # Gmail App Password, not your account password

# Payment Service (PayHere)
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret

# ngrok tunnel URL for PayHere payment callbacks
# 1. Run: ngrok http 8083
# 2. Copy the https forwarding URL
# 3. Paste it here with /api/payments/callback appended
# Note: free ngrok URLs change on every restart — update this each time
# If you have a stable ngrok domain, it won't change
NOTIFY_URL=https://your-ngrok-subdomain.ngrok-free.app/api/payments/callback

# AI Symptom Checker
# Get your key from: https://console.groq.com
GROQ_API_KEY=your_groq_api_key
```

### 2. Per-service `.env` files

Each Node.js service has its own `.env` file for service-specific config. Open each one and verify the values. A typical service `.env` looks like:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/healthcare_auth
JWT_SECRET=your_jwt_secret_key
```

### 3. Spring Boot services

The Spring Boot services (`payment-service` and `ai-symptom-service`) use `src/main/resources/application.properties` and `.env`. Open each one and verify:

```properties
# payment-service/src/main/resources/application.properties
server.port=8083
spring.application.name=payment-service
security.jwt.secret=${JWT_SECRET}
spring.mongodb.uri=${MONGO_URI}
external.pay-here.merchant-id=${PAYHERE_MERCHANT_ID}
external.pay-here.merchant-secret=${PAYHERE_MERCHANT_SECRET}
external.pay-here.notify-url=${NOTIFY_URL}
external.pay-here.return-url=http://localhost:5173/patient/payment/result
external.pay-here.cancel-url=http://localhost:5173/patient/payment/result
external.appointment-service.base-url=${APPOINTMENT_SERVICE_URL}
external.patient-service.base-url=${PATIENT_SERVICE_URL}
```
```env
server.port=8083
MONGO_URI=mongodb:mongodb+srv://your_db
JWT_SECRET=your_jwt_secret_key
PAYHERE_MERCHANT_ID=your_payhere_merchant_id
PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
NOTIFY_URL=https://your.ngrok-free.dev/api/payments/callback
APPOINTMENT_SERVICE_URL=http://localhost:5003
PATIENT_SERVICE_URL=http://localhost:5001
```

```properties
# ai-symptom-service/src/main/resources/application.properties
server.port=8084
spring.application.name=ai-symptom-service
security.jwt.secret=${JWT_SECRET}
spring.mongodb.uri=${MONGO_URI}
groq.api-key=${GROQ_API_KEY}
```
```env
server.port=8084
MONGO_URI=mongodb:mongodb+srv://your_db
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

> **Important:** The `payhere.notify-url` (or equivalent in your config) must be updated with your ngrok URL before starting the payment service. See the [ngrok section](#setting-up-ngrok-for-payhere) below.

---

## Database Setup

### Local MongoDB via Docker

No setup needed — the `docker-compose.yml` includes a MongoDB container. It will start automatically when you run `docker compose up`.

The local MongoDB will be accessible at `mongodb://localhost:27017`.

### MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (or use an existing one)
3. Go to **Database Access** and create a database user with read/write permissions
4. Go to **Network Access** and add your IP address (or `0.0.0.0/0` to allow all — development only)
5. Go to your cluster, click **Connect** → **Connect your application**, and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/healthcare?retryWrites=true&w=majority
   ```
6. Replace the `MONGO_URI` values in each service's `.env` or `application.properties` with this Atlas connection string

---

## Setting Up ngrok for PayHere

PayHere sandbox requires a publicly accessible URL to send payment notifications (webhooks) back to your local payment service. ngrok creates a temporary public tunnel to your local machine.

### Step 1 — Install ngrok

Download and install ngrok from [https://ngrok.com/download](https://ngrok.com/download).

Sign up for a free account, then authenticate your installation:

```bash
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

### Step 2 — Start ngrok

Open a **separate terminal** and run ngrok to tunnel to the payment service port (default `8081`):

```bash
ngrok http 8081
```

You will see output like this:

```
Forwarding   https://a1b2-123-45-67-89.ngrok-free.app -> http://localhost:8081
```

Copy the `https://...ngrok-free.app` URL. **Do not close this terminal** — ngrok must stay running for webhooks to work.

### Step 3 — Update the payment service config

Open `payment-service/src/main/resources/application.properties` and update the notify URL with your ngrok URL:

```properties
payhere.notify-url=https://a1b2-123-45-67-89.ngrok-free.app/api/payment/notify
```

> **Note:** The ngrok URL changes every time you restart ngrok (on the free plan). You must update this value and restart the payment service each time.

### Step 4 — Configure PayHere sandbox

1. Log in to the [PayHere Sandbox Dashboard](https://sandbox.payhere.lk)
2. Navigate to your app settings
3. Set the **Notify URL** to your ngrok URL: `https://a1b2-123-45-67-89.ngrok-free.app/api/payment/notify`
4. Save the changes

---

## Running the System with Docker

This is the recommended way to run the full system.

### Step 1 — Make sure Docker Desktop is running

Open Docker Desktop and wait until it shows **"Engine running"**.

### Step 2 — Start ngrok first

Before starting the system, start ngrok and update the payment service config as described in the [ngrok section](#setting-up-ngrok-for-payhere) above.

### Step 3 — Build and start all services

From the project root directory, run:

```bash
docker compose up --build
```

The `--build` flag ensures Docker builds fresh images from your latest code. On the first run this will take a few minutes. Subsequent runs will be faster due to Docker's layer caching.

To run in detached mode (in the background):

```bash
docker compose up --build -d
```

### Step 4 — Verify all containers are running

```bash
docker compose ps
```

All services should show a status of `Up`. If any service shows `Exit`, check its logs:

```bash
docker compose logs <service-name>
# e.g.
docker compose logs payment-service
docker compose logs auth-service
```

---

## Running Services Individually (Development)

If you want to run services outside Docker for development or debugging, follow these steps.

### Node.js services

```bash
# Navigate to the service directory
cd auth-service

# Install dependencies (first time only)
npm install

# Start the service
npm run dev       # if a dev script is configured
# or
node index.js
```

Repeat for each Node.js service: `patient-service`, `doctor-service`, `appointment-service`, `notification-service`, `telemedicine-service`.

### Spring Boot services

```bash
# Navigate to the service directory
cd payment-service

# Build and run with Maven
mvn spring-boot:run
```

```bash
cd ai-symptom-service
mvn spring-boot:run
```

Alternatively, build a JAR and run it:

```bash
mvn clean package -DskipTests
java -jar target/*.jar
```

### React frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`.

---

## Accessing the Application

Once all services are running:

| Interface | URL                   |
|---|-----------------------|
| Frontend (React) | http://localhost:3000 |
| Auth Service API | http://localhost:5001 |
| Patient Service API | http://localhost:5002 |
| Doctor Service API | http://localhost:5003 |
| Appointment Service API | http://localhost:5004 |
| Notification Service API | http://localhost:5005 |
| Telemedicine Service API | http://localhost:5006 |
| Payment Service API | http://localhost:8083 |
| AI Symptom Service API | http://localhost:8084 |

---

## Stopping the System

To stop all running containers:

```bash
docker compose down
```

To stop and also remove all volumes (this will wipe the local MongoDB data):

```bash
docker compose down -v
```
---


