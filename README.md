# Blog Application Server

A scalable, production-ready blog server built with **Express**, **Prisma**, and **Better-Auth**. This project provides a comprehensive platform for managing blog content, user authentication, and hierarchical discussions with enterprise-grade performance and security.

---

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend Framework** | [Express 5](https://expressjs.com/) |
| **Database ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via `pg`) |
| **Authentication** | [Better-Auth](https://www.better-auth.com/) |
| **Runtime** | [Node.js](https://nodejs.org/) |
| **Development Tool** | [tsx](https://github.com/privatenumber/tsx) (Fast TypeScript execution) |
| **Security** | [Bcrypt](https://www.npmjs.com/package/bcrypt) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) |

---

## Key Features

- **Enterprise-Grade Authentication**: Implements secure user authentication through Better-Auth, featuring email verification, session management, and industry-standard security protocols.
- **Comprehensive Post Management**: Full-featured blog post administration with support for rich metadata including tags, thumbnails, and featured content designation.
- **Hierarchical Comment System**: Supports nested comment threads with built-in moderation workflows for content governance.
- **Role-Based Access Control (RBAC)**: Implements differentiated permission levels for administrative and standard user roles.
- **Performance Optimization**: Leverages Prisma query optimization and PostgreSQL indexing strategies for efficient data retrieval and system responsiveness.
- **Automated Data Initialization**: Includes ready-to-deploy seeding scripts for rapid development and testing environment setup.

---

## Database Schema

The application employs a relational data model defined in `prisma/schema.prisma`:

- **User**: Maintains user profiles, role assignments (Admin/User), and account status (Active/Inactive).
- **Post**: Manages blog content with status tracking (Draft/Published), view metrics, and tag associations.
- **Comment**: Facilitates user discussions on posts with support for nested replies and moderation controls.
- **Authentication**: Provides `Session`, `Account`, and `Verification` tables for secure identity and access management.

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ recommended
- **PostgreSQL**: A running instance of PostgreSQL

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd blog-app-with-prisma
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the project root with the following variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"
   BETTER_AUTH_SECRET="your-secret-key"
   # Additional environment variables as needed
   ```

4. **Database Initialization**:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## Usage

### Development Mode
Start the development server with hot-reload enabled:
```bash
npm run dev
```

### Initialize Admin User
Provision an administrative account for system initialization and testing:
```bash
npm run seed:admin
```

---

## Project Structure

```text
├── prisma/               # Prisma schema and migrations
├── src/
│   ├── modules/          # Feature-based modules (Post, Comment, Auth)
│   ├── middlewares/      # Express middlewares (Auth, Validation)
│   ├── helpers/          # Utility functions
│   ├── lib/              # Library configurations (Prisma client, Better-Auth)
│   ├── scripts/          # Seeding and utility scripts
│   ├── app.ts            # App configuration
│   └── server.ts         # Entry point
└── tsconfig.json         # TypeScript configuration
```

---

## API Reference

### Authentication (`/api/auth`)
Authentication service powered by **Better-Auth**. Base path: `/api/auth`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/sign-up/email` | Register a new user account | No |
| POST | `/sign-in/email` | Authenticate with email and password credentials | No |
| POST | `/sign-out` | Terminate the current user session | Yes |
| GET | `/get-session` | Retrieve active session information for the authenticated user | Yes |

---

### Posts (`/posts`)
Base path: `/posts`

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a new blog post | `USER`, `ADMIN` |
| GET | `/` | Retrieve all posts with support for pagination and filtering | No |
| GET | `/:postId` | Retrieve a specific post by identifier | No |
| GET | `/my-posts` | Retrieve posts authored by the authenticated user | `USER`, `ADMIN` |
| GET | `/view/stats` | Retrieve comprehensive platform statistics | `ADMIN` |
| PATCH | `/:postId` | Update an existing post | `USER` (Owner), `ADMIN` |
| DELETE | `/:postId` | Delete a post | `USER` (Owner), `ADMIN` |

**Query Parameters for GET `/posts`:**
- `page`, `limit`: Control pagination parameters.
- `search`: Full-text search across post title and content.
- `tags`: Filter results by tags (comma-separated values).
- `status`: Filter by publication status (`PUBLISHED`, `DRAFT`, `ARCHIVED`).
- `isFeatured`: Filter by featured status (`true`/`false`).

---

### Comments (`/comments`)
Base path: `/comments`

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a new comment or reply | `USER`, `ADMIN` |
| GET | `/:commentId` | Retrieve a specific comment | No |
| GET | `/author/:authorId`| Retrieve all comments authored by a specific user | No |
| PATCH | `/:commentId` | Update an existing comment | `USER` (Owner), `ADMIN` |
| DELETE | `/:commentId` | Delete a comment | `USER` (Owner), `ADMIN` |
| PATCH | `/:commentId/moderate` | Approve or reject a comment | `ADMIN` |

---


## Contributing

Contributions are welcome and encouraged. Please follow the standard development workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/FeatureName`)
3. Implement your changes and commit them (`git commit -m 'Add FeatureName'`)
4. Push to the branch (`git push origin feature/FeatureName`)
5. Submit a Pull Request for review

---