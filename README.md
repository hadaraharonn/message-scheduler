# Welcome to message-scheduler 👋

---

> **Message Scheduler** is a Node.js-based backend service designed to handle the scheduling and delayed execution of messages. By leveraging Redis for persistence, this application ensures messages are reliably stored and processed at the specified time. Designed with scalability and robustness in mind, this service is built to efficiently manage high volumes of messages and ensure that each message is processed exactly once, making it suitable for large-scale, distributed systems.

## Core Features

* Message Scheduling: REST API for scheduling messages to be printed at a future time.
* Redis-Based Persistence: Uses Redis to store scheduled messages, ensuring reliability across server restarts and crashes.
* Scalable Architecture: Built to handle multiple server instances working in parallel, with load balancing and fault tolerance.
* Configurable Message Handlers: Output mechanism is flexible and can be customized, allowing the service to log messages or perform other actions.
* Error Handling & Validation: Implements robust error-handling mechanisms and validation checks to ensure data integrity and service reliability.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Docker**: Docker is required to run a local Redis instance.
2. **Node.js**: Ensure you have Node.js installed (version 14 or higher).

## Setting Up Redis with Docker

To set up a local Redis instance using Docker, follow these steps:

1. Pull the Redis Docker image:
    ```sh
    docker pull redis
    ```

2. Run the Redis container:
    ```sh
    docker run --name redis-instance -p 6379:6379 -d redis
    ```

This will start a Redis instance on port 6379.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/hadaraharonn/message-scheduler.git
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

To run the application in development mode:

```sh
npm run dev
```

To build and start the application in production mode:

```sh
npm run start
```

## Running tests

To run the tests, use the following command:

```sh
npm run test
```

## Example CURL Request

To test the application, you can use the following curl command to schedule a message:

```sh
curl -X POST http://localhost:3000/api/echoAtTime \
-H "Content-Type: application/json" \
-d '{
  "time": "2024-10-14T14:00:00Z",
  "message": "MEOW"
}'
```

### Response Examples

**Success Response:**

```json
{
    "status": "success",
    "message": "Message scheduled successfully",
    "error": null
}
```

**Error Response:**

```json
{
    "status": "error",
    "message": "Validation Error",
    "error": [
        "message must be a non-empty string"
    ]
}
```