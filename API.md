# Social Media API

A REST API for user authentication, posts, comments, likes, follows, and personalized feeds.

## Base URL

```text
http://localhost:5000/api
```

## Authentication

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

JWT tokens expire after **1 hour**.

---

## 1. Health Check

### `GET /health`

Check whether the API is running.

**Response `200`**

```json
{
  "success": true,
  "message": "Social App API is running",
  "data": {
    "environment": "development"
  }
}
```

---

# 2. Authentication

## `POST /auth/signup`

Register a new user.

**Body**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success:** `201 Created`

Returns:

- `user`
- `token`

Password is not returned in the user object.

**Possible errors**

- `400` Missing required fields
- `409` Username/email already exists

---

## `POST /auth/login`

Login with email and password.

**Body**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success:** `200 OK`

Returns:

- `user`
- `token`

**Possible errors**

- `400` Missing email/password
- `401` Invalid credentials

---

# 3. Posts

## `GET /posts`

Get published posts.

**Query parameters**

| Parameter   |     Default | Description                                |
| ----------- | ----------: | ------------------------------------------ |
| `page`      |         `1` | Page number                                |
| `limit`     |        `20` | Results per page; max `100`                |
| `search`    |           — | Search title, tags, or author              |
| `sortBy`    | `createdAt` | `createdAt`, `like_count`, `comment_count` |
| `sortOrder` |      `desc` | `asc` or `desc`                            |

**Example**

```http
GET /api/posts?page=1&limit=10&search=node&sortBy=like_count&sortOrder=desc
```

Only published posts are returned.

**Success:** `200 OK`

---

## `GET /posts/:postId`

Get a single published post.

**Success:** `200 OK`

Returns the post with author information.

**Errors**

- `404` Published post not found
- `400` Invalid post ID

---

## `POST /posts`

Create a post.

**Auth:** Required

**Body**

```json
{
  "title": "My First Post",
  "content": "Post content here.",
  "tags": ["nodejs", "backend"]
}
```

A newly created post is **always `draft`**, even if `state: "published"` is supplied.

**Success:** `201 Created`

**Errors**

- `401` Authentication required
- `400` Missing title/content or validation error

---

## `GET /posts/mine`

Get the authenticated user's posts.

**Auth:** Required

**Query parameters**

```text
?page=1&limit=20
```

Optional state filter:

```text
?state=draft
```

or

```text
?state=published
```

**Success:** `200 OK`

**Errors**

- `401` Authentication required
- `400` Invalid state/pagination

---

## `PATCH /posts/:postId`

Update your post.

**Auth:** Required

Only these fields can be updated:

```json
{
  "title": "Updated title",
  "content": "Updated content",
  "tags": ["updated"]
}
```

`author`, `state`, `like_count`, and `comment_count` cannot be changed through this endpoint.

**Success:** `200 OK`

**Errors**

- `401` Authentication required
- `404` Post not found or user is not the owner
- `400` Validation error

---

## `PATCH /posts/:postId/publish`

Publish your draft.

**Auth:** Required

Only the post owner can publish it.

**Success:** `200 OK`

**Errors**

- `401` Authentication required
- `404` Post not found or not the owner
- `400` Post is already published

---

## `DELETE /posts/:postId`

Delete your post.

**Auth:** Required

Associated comments and post likes are also deleted.

**Success:** `200 OK`

**Errors**

- `401` Authentication required
- `404` Post not found or not the owner

---

# 4. Feed

## `GET /feed`

Get the authenticated user's feed.

**Auth:** Required

The feed contains:

- Your published posts
- Published posts from users you follow

**Query parameters**

```text
?page=1&limit=20
```

**Success:** `200 OK`

Posts are ordered newest first.

---

# 5. Comments

## `POST /posts/:postId/comments`

Create a comment on a published post.

**Auth:** Required

**Body**

```json
{
  "content": "Great post!"
}
```

**Success:** `201 Created`

**Errors**

- `401` Authentication required
- `404` Post not found
- `400` Invalid comment content

---

## `GET /posts/:postId/comments`

Get comments for a published post.

**Auth:** Not required

Returns comments with the author's username, newest first.

**Success:** `200 OK`

---

## `PATCH /comments/:commentId`

Update your comment.

**Auth:** Required

**Body**

```json
{
  "content": "Updated comment"
}
```

Only the comment author can update it.

**Success:** `200 OK`

**Errors**

- `401` Authentication required
- `404` Comment not found or unauthorized

---

## `DELETE /comments/:commentId`

Delete your comment.

**Auth:** Required

Only the comment author can delete it.

**Success:** `200 OK`

---

# 6. Likes

Likes require authentication.

## `POST /posts/:postId/like`

Like a published post.

**Auth:** Required

**Success:** `200 OK`

**Errors**

- `401` Authentication required
- `404` Published post not found
- `409` Post already liked

---

## `DELETE /posts/:postId/like`

Unlike a post.

**Auth:** Required

**Success:** `200 OK`

**Errors**

- `404` Post not found / post was not liked

---

## `POST /comments/:commentId/like`

Like a comment.

**Auth:** Required

**Success:** `200 OK`

**Errors**

- `404` Comment not found
- `409` Comment already liked

---

## `DELETE /comments/:commentId/like`

Unlike a comment.

**Auth:** Required

**Success:** `200 OK`

**Errors**

- `404` Comment not found / comment was not liked

---

# 7. Follows

All follow endpoints require authentication.

## `POST /users/:userId/follow`

Follow another user.

**Success:** `201 Created`

**Errors**

- `400` Cannot follow yourself
- `404` User not found
- `409` Already following user

---

## `DELETE /users/:userId/follow`

Unfollow a user.

**Success:** `200 OK`

**Errors**

- `404` You do not follow this user

---

## `GET /users/following`

Get users you follow.

**Query**

```text
?page=1&limit=20
```

**Success:** `200 OK`

---

## `GET /users/followers`

Get users following you.

**Query**

```text
?page=1&limit=20
```

**Success:** `200 OK`

---

# 8. Pagination

Supported endpoints use:

```text
?page=1&limit=20
```

Rules:

- `page` must be a positive integer.
- `limit` must be between `1` and `100`.
- Default `page`: `1`
- Default `limit`: `20`

Paginated responses use:

```json
{
  "posts": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0
  }
}
```

---

# 9. Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

---

# 10. Common Status Codes

| Status | Meaning                         |
| ------ | ------------------------------- |
| `200`  | Successful request              |
| `201`  | Resource created                |
| `400`  | Validation/bad request          |
| `401`  | Authentication required/invalid |
| `404`  | Resource not found              |
| `409`  | Duplicate/conflicting resource  |
| `500`  | Internal server error           |

## Endpoint Summary

| Method | Endpoint                        | Auth |
| ------ | ------------------------------- | ---- |
| GET    | `/api/health`                   | No   |
| POST   | `/api/auth/signup`              | No   |
| POST   | `/api/auth/login`               | No   |
| GET    | `/api/posts`                    | No   |
| GET    | `/api/posts/:postId`            | No   |
| POST   | `/api/posts`                    | Yes  |
| GET    | `/api/posts/mine`               | Yes  |
| PATCH  | `/api/posts/:postId`            | Yes  |
| PATCH  | `/api/posts/:postId/publish`    | Yes  |
| DELETE | `/api/posts/:postId`            | Yes  |
| GET    | `/api/feed`                     | Yes  |
| POST   | `/api/posts/:postId/comments`   | Yes  |
| GET    | `/api/posts/:postId/comments`   | No   |
| PATCH  | `/api/comments/:commentId`      | Yes  |
| DELETE | `/api/comments/:commentId`      | Yes  |
| POST   | `/api/posts/:postId/like`       | Yes  |
| DELETE | `/api/posts/:postId/like`       | Yes  |
| POST   | `/api/comments/:commentId/like` | Yes  |
| DELETE | `/api/comments/:commentId/like` | Yes  |
| POST   | `/api/users/:userId/follow`     | Yes  |
| DELETE | `/api/users/:userId/follow`     | Yes  |
| GET    | `/api/users/following`          | Yes  |
| GET    | `/api/users/followers`          | Yes  |
