# 📝 Blog App with Prisma

A modern, robust, and feature-rich blog server built with **Express**, **Prisma**, and **Better-Auth**. This project implements a scalable architecture for managing posts, comments, authentications, and user roles with high visual excellence and performance.

---

## 🚀 Tech Stack

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

## ✨ Key Features

- **Robust Authentication**: Secure sign-up/sign-in using `Better-Auth` with email verification and session management.
- **Advanced Post Management**: Create, update, and manage blog posts with rich metadata (tags, thumbnails, featured status).
- **Nested Comment System**: Full support for hierarchical comments (replies) with approval workflows.
- **Role-Based Access Control**: Differentiated functionality for Admins and Users.
- **High Performance**: Optimized queries using Prisma indices and PostgreSQL.
- **Automated Seeding**: Ready-to-use scripts to set up admin users and initial data.

---

## 📊 Database Schema

The project uses a structured relational schema defined in `prisma/schema.prisma`:

- **User**: Stores profiles, roles (Admin/User), and status (Active/Inactive).
- **Post**: Manages blog content, status (Draft/Published), views, and tags.
- **Comment**: Handles user interaction with posts, including nested replies and moderation states.
- **Auth Related**: `Session`, `Account`, and `Verification` tables for secure identity management.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18+ recommended
- **PostgreSQL**: A running instance of PostgreSQL

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd blog-app-with-prisma
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"
   BETTER_AUTH_SECRET="your-secret-key"
   # Add other necessary environment variables
   ```

4. **Initialize Database**:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## 🏃 Usage

### Development Mode
Start the server with auto-reload:
```bash
npm run dev
```

### Seed Admin User
Quickly set up an admin user for initial testing:
```bash
npm run seed:admin
```

---

## 📂 Project Structure

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

## 🔌 API Reference

### 🔐 Authentication (`/api/auth`)
Powered by **Better-Auth**. Base path: `/api/auth`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/sign-up/email` | Create a new user account | No |
| POST | `/sign-in/email` | Sign in with email and password | No |
| POST | `/sign-out` | Sign out and clear session | Yes |
| GET | `/get-session` | Get current user session | Yes |

---

### 📝 Posts (`/posts`)
Base path: `/posts`

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a new post | `USER`, `ADMIN` |
| GET | `/` | Get all posts (Supports pagination & filtering) | No |
| GET | `/:postId` | Get a specific post by ID | No |
| GET | `/my-posts` | Get posts created by the logged-in user | `USER`, `ADMIN` |
| PATCH | `/:postId` | Update an existing post | `USER` (Owner), `ADMIN` |
| DELETE | `/:postId` | Delete a post | `USER` (Owner), `ADMIN` |

**Query Parameters (GET `/`):**
- `page`, `limit`: Pagination controls.
- `search`: Search by title or content.
- `tags`: Filter by tags (comma-separated).
- `status`: Filter by `PUBLISHED`, `DRAFT`, or `ARCHIVED`.
- `isFeatured`: Filter featured posts (`true`/`false`).

---

### 💬 Comments (`/comments`)
Base path: `/comments`

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a new comment/reply | `USER`, `ADMIN` |
| GET | `/:commentId` | Get a specific comment | No |
| GET | `/author/:authorId`| Get comments by a specific author | No |
| PATCH | `/:commentId` | Update a comment | `USER` (Owner), `ADMIN` |
| DELETE | `/:commentId` | Delete a comment | `USER` (Owner), `ADMIN` |
| PATCH | `/:commentId/moderate` | Approve or Reject a comment | `ADMIN` |

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
