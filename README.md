# MCP Push Notification Preferences

A secure, scalable system for MCP end users to manage push notification preferences for specific event types, and perform CRUD operations on products. Built with Node.js (Express), React, TypeScript, PostgreSQL, JWT authentication, and encrypted storage.

---

## Features

- **Push Notification Preferences**
  - View, enable, or disable push notifications for each supported event type.
  - Preferences are securely stored and encrypted at rest.
  - Only authenticated users can modify their own settings.
  - Robust error handling and atomic updates.

- **Product Management**
  - Full CRUD (Create, Read, Update, Delete) operations for products.
  - RESTful API design.
  - Secure, authenticated access.

- **Security & Compliance**
  - JWT-based authentication and authorization.
  - Preferences encrypted at rest (AES-256-GCM, with KMS-ready design).
  - Centralized error handling.
  - Dockerized for consistent local development.

- **Testing & Quality**
  - Automated tests with Jest and Supertest.
  - ESLint/Prettier for code quality.
  - Swagger-ready API documentation.

---

## Tech Stack

- **Frontend:** React (TypeScript)
- **Backend:** Node.js (Express, TypeScript)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Auth:** JWT
- **Encryption:** AES-256-GCM (KMS-ready)
- **Containerization:** Docker, Docker Compose
- **Testing:** Jest, Supertest
- **Linting:** ESLint, Prettier

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Local Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/mcp-push-notification-preferences.git
   cd mcp-push-notification-preferences
   ```

2. **Start all services (frontend, backend, database):**

   ```bash
   docker-compose up --build
   ```

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:4000/api](http://localhost:4000/api)
   - PostgreSQL: [localhost:5432](localhost:5432)

3. **Stop services:**

   ```bash
   docker-compose down
   ```

---

## Environment Variables

See `docker-compose.yml` for all required environment variables.

- **Backend**
  - `PORT`: API port (default: 4000)
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: PostgreSQL connection
  - `JWT_SECRET`: JWT signing key
  - `PREFERENCES_ENCRYPTION_KEY`: 32-byte key for AES-256-GCM
  - `CORS_ORIGIN`: Allowed frontend origin

- **Frontend**
  - `REACT_APP_API_BASE_URL`: Backend API base URL

---

## API Endpoints

### Auth

- `GET /api/auth/me` — Get current authenticated user
- `POST /api/auth/logout` — Logout user

### Notification Preferences

- `GET /api/notification-preferences/:userId` — Get preferences (authenticated, own user only)
- `PUT /api/notification-preferences/:userId` — Update preferences (authenticated, own user only)

### Products

- `GET /api/products` — List all products
- `POST /api/products` — Create product
- `PUT /api/products/:productId` — Update product
- `DELETE /api/products/:productId` — Delete product

---

## Testing

1. **Run backend tests:**

   ```bash
   docker-compose exec backend npm test
   ```

2. **Run frontend tests:**

   ```bash
   docker-compose exec frontend npm test
   ```

---

## Code Quality

- **Lint:** `npm run lint`
- **Format:** `npm run format`

---

## Security Notes

- All sensitive preferences are encrypted at rest.
- Only authenticated users can access/modify their own preferences.
- JWT secrets and encryption keys should be securely managed (use KMS in production).
- All changes are atomic; partial updates are prevented.

---

## Extending & Customizing

- **Add new event types:** Update the event types list in both frontend and backend.
- **Integrate with real push notification service:** Extend backend logic to trigger push notifications for enabled events.
- **Swagger/OpenAPI:** Add Swagger decorators to backend routes for API documentation.

---

## Troubleshooting

- **Database connection issues:** Ensure Docker is running and ports are not blocked.
- **JWT/auth errors:** Check `JWT_SECRET` and token validity.
- **Encryption errors:** Ensure `PREFERENCES_ENCRYPTION_KEY` is 32 bytes.

---

## License

MIT

---

## Maintainers

- [Your Name](mailto:your.email@example.com)
- [Your Team/Org](https://github.com/your-org)