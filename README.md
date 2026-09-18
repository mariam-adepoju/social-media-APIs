# Social Media API

A RESTful social media API built with **Node.js, Express, MongoDB, and Mongoose**. The API supports authentication, posts, comments, likes, following, personalized feeds, pagination, search, and sorting.

## Features

* User signup and login with JWT authentication
* JWT tokens expire after 1 hour
* Password hashing with bcrypt
* Create, update, publish, and delete posts
* Draft and published post states
* Public published-post listing
* Search posts by title, tags, and author information
* Sort posts by likes, comments, or creation date
* Pagination with configurable page and limit
* Authenticated user's own posts with state filtering
* Follow and unfollow users
* Followers and following lists
* Personalized feed containing posts from the user and followed users
* Like and unlike posts
* Like and unlike comments
* Create, update, retrieve, and delete comments
* Centralized error handling
* Request logging with Morgan
* Security headers with Helmet
* Automated API tests using Jest, Supertest, and MongoMemoryServer

## Tech Stack

* **Node.js**
* **Express 5**
* **MongoDB**
* **Mongoose**
* **JWT (jsonwebtoken)**
* **bcryptjs**
* **Jest**
* **Supertest**
* **MongoMemoryServer**
* **Helmet**
* **CORS**
* **Morgan**

## Project Structure

```text
social-media-api/
├── config/
│   └── db.js
├── controllers/
│   ├── auth.controller.js
│   ├── comment.controller.js
│   ├── feed.controller.js
│   ├── follow.controller.js
│   ├── like.controller.js
│   └── post.controller.js
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── pagination.js
├── models/
│   ├── user.model.js
│   ├── post.model.js
│   ├── comment.model.js
│   ├── follow.model.js
│   └── like.model.js
├── routes/
│   ├── auth.routes.js
│   ├── post.routes.js
│   ├── comment.routes.js
│   ├── feed.routes.js
│   ├── follow.routes.js
│   └── like.routes.js
├── services/
│   ├── auth.service.js
│   ├── post.service.js
│   ├── comment.service.js
│   ├── feed.service.js
│   ├── follow.service.js
│   └── like.service.js
├── utils/
│   ├── asyncHandler.js
│   ├── createError.js
│   ├── errorResponse.js
│   ├── escapeRegex.js
│   ├── generateToken.js
│   └── successResponse.js
├── tests/
├── app.js
├── server.js
├── jest.config.js
└── package.json
```

## Architecture

The API follows a layered structure:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

* **Routes** define API endpoints and middleware.
* **Controllers** handle HTTP requests and responses.
* **Services** contain application/business logic.
* **Models** define MongoDB schemas and indexes.
* **Middlewares** handle authentication, pagination, and errors.
* **Utils** contain reusable helpers.

## Getting Started

### Prerequisites

* Node.js
* npm
* MongoDB database

### Installation

```bash
git clone <repository-url>
cd social-media-APIs
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Run the Application

Development:

```bash
npm run dev
```

Production/start:

```bash
npm start
```

The API runs on:

```text
http://localhost:5000
```

## API Endpoints

### Health

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/signup
POST /api/auth/login
```

### Posts

```http
POST   /api/posts
GET    /api/posts
GET    /api/posts/:postId
GET    /api/posts/mine
PATCH  /api/posts/:postId
PATCH  /api/posts/:postId/publish
DELETE /api/posts/:postId
```

### Feed

```http
GET /api/feed
```

### Following

```http
POST   /api/users/:userId/follow
DELETE /api/users/:userId/follow
GET    /api/users/following
GET    /api/users/followers
```

### Comments

```http
POST   /api/posts/:postId/comments
GET    /api/posts/:postId/comments
PATCH  /api/comments/:commentId
DELETE /api/comments/:commentId
```

### Likes

```http
POST   /api/posts/:postId/like
DELETE /api/posts/:postId/like

POST   /api/comments/:commentId/like
DELETE /api/comments/:commentId/like
```

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Post Workflow

New posts are always created as `draft`, even if a different state is included in the request.

```text
Create Post
    ↓
  Draft
    ↓
Owner publishes
    ↓
Published
```

Only the post owner can publish, update, or delete their post.

## Pagination

Paginated endpoints accept:

```text
?page=1&limit=20
```

* `page` defaults to `1`
* `limit` defaults to `20`
* `limit` cannot exceed `100`

Paginated responses include:

```json
{
  "page": 1,
  "limit": 20,
  "total": 50,
  "pages": 3
}
```

## API Response Format

Successful responses use:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Testing

Tests use **Jest**, **Supertest**, and **MongoMemoryServer**.

MongoMemoryServer provides an isolated in-memory MongoDB instance for the test suite, so tests do not need to use the development database.

Run tests:

```bash
npm test
```

Watch tests:

```bash
npm run watch
```

Generate coverage:

```bash
npm run coverage
```

## Available Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm start`        | Start the API              |
| `npm run dev`      | Start the API with Nodemon |
| `npm test`         | Run the test suite         |
| `npm run watch`    | Run Jest in watch mode     |
| `npm run coverage` | Generate test coverage     |

## API Documentation

For detailed request parameters, endpoint behavior, response examples, and status codes, see:

**[API Documentation](./API.md)**

## License

ISC
