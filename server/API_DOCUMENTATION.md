# Student Dashboard API Documentation

## Base URL
`/api/students`

## Endpoints

### 1. Get All Requests for a Student
**GET** `/api/students/:userId/requests`

Get all maintenance requests submitted by a specific student.

**Query Parameters:**
- `search` (optional): Search requests by title/name (case-insensitive)
- `sortBy` (optional): Sort by `timestamp` or `status` (default: `timestamp`)
- `order` (optional): Sort order `asc` or `desc` (default: `desc` for timestamp, `asc` for status)
- `status` (optional): Filter by status - `PENDING`, `IN_PROGRESS`, or `RESOLVED`

**Example Requests:**
```
GET /api/students/1/requests
GET /api/students/1/requests?search=window
GET /api/students/1/requests?status=RESOLVED&sortBy=timestamp&order=desc
GET /api/students/1/requests?search=broken&sortBy=status&order=asc
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Broken Window in Room 301",
    "description": "The window in Room 301 has a large crack...",
    "location": "Building A - Room 301",
    "urgency": "HIGH",
    "status": "IN_PROGRESS",
    "photo_url": "https://example.com/image.jpg",
    "created_at": "2025-11-01T10:30:00.000Z",
    "user_id": 1,
    "assigned_to": 5,
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "assigned_to_name": "Tech Smith"
  }
]
```

### 2. Get Single Request Detail
**GET** `/api/students/:userId/requests/:requestId`

Get detailed information about a specific request, including resolution details if available.

**Example Request:**
```
GET /api/students/1/requests/5
```

**Response:**
```json
{
  "id": 5,
  "title": "Broken Window in Room 301",
  "description": "The window in Room 301 has a large crack...",
  "location": "Building A - Room 301",
  "urgency": "HIGH",
  "status": "RESOLVED",
  "photo_url": "https://example.com/image.jpg",
  "created_at": "2025-11-01T10:30:00.000Z",
  "user_id": 1,
  "assigned_to": 5,
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "assigned_to_name": "Tech Smith",
  "assigned_to_email": "tech@example.com",
  "admin_notes": "Window replaced successfully",
  "resolution_photo_url": "https://example.com/resolution.jpg",
  "resolved_at": "2025-11-05T14:20:00.000Z",
  "categories": [
    { "id": 1, "name": "Facilities" }
  ]
}
```

### 3. Update Request
**PATCH** `/api/students/:userId/requests/:requestId`

Update a specific request. Only the fields provided in the request body will be updated.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "location": "New Location",
  "urgency": "MEDIUM",
  "status": "IN_PROGRESS",
  "photo_url": "https://example.com/new-image.jpg"
}
```

**Note:** 
- `urgency` must be one of: `LOW`, `MEDIUM`, `HIGH`
- `status` must be one of: `PENDING`, `IN_PROGRESS`, `RESOLVED`
- When a request is marked as `RESOLVED`, it stays in the database but will only appear when filtering by `status=RESOLVED`

**Example Request:**
```
PATCH /api/students/1/requests/5
Content-Type: application/json

{
  "status": "RESOLVED",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 5,
  "title": "Broken Window in Room 301",
  "description": "Updated description",
  "location": "Building A - Room 301",
  "urgency": "HIGH",
  "status": "RESOLVED",
  "photo_url": "https://example.com/image.jpg",
  "created_at": "2025-11-01T10:30:00.000Z",
  "user_id": 1,
  "assigned_to": 5
}
```

### 4. Delete Request
**DELETE** `/api/students/:userId/requests/:requestId`

Delete a specific request. This will also delete related records (categories and resolutions).

**Example Request:**
```
DELETE /api/students/1/requests/5
```

**Response:**
```json
{
  "message": "Request deleted successfully",
  "id": 5
}
```

## Status Values
- `PENDING`: Request is awaiting review
- `IN_PROGRESS`: Request is being worked on
- `RESOLVED`: Request has been completed (stays in database, only shown when filtered)

## Error Responses

**404 Not Found:**
```json
{
  "error": "Request not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid status value"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

