# RESTful API Specs

Base URL: `http://goaround.onrender.com/api/v1`

## Adjusted

- Error envelope.
- Maybe add paging to some user stuff.

## Header

- ContentType: `application/json`
- Authentication: `Authentication: Bearer <token>`

## Response envelope

### Success (`200 OK`, `201 CREATED`)

```json
{
  "data": ...,          // object | array
  "meta": {             // object | null
    "page": 1,          // number
    "limit": 20,        // number
    "total_items": 150  // number
  }
}
```

The `"meta"` field is non-null only in

- GET `/places`
- GET `/places/{id}/reviews`
- GET `/trips`
- GET `/lists`
- GET `/lists/{id}`
- GET `/forum/posts`
- GET `/forum/posts/{id}`
- GET `/admin/reports`

### Error (`4xx`, `5xx`)

```json
{
  "detail": "error message" // string
}
```

## Schemas

- `UserStats`

  ```json
  {
    "reviews_count": 0, // number
    "posts_count": 0, // number
    "photos_count": 0, // number
    "public_trips_count": 0 // number
  }
  ```

- `UserCreate`

  ```json
  {
    "username": "tcthanh23", // string | null
    "full_name": "Test User", // string | null
    "avatar_url": null, // string | null
    "signup_type": "Traveler" // string % "Traveler" | "Business"
  }
  ```

- `UserUpdate`

  ```json
  {
    "username": "tcthanh23", // string | null
    "full_name": "Test User", // string | null
    "avatar_url": null // string | null
  }
  ```

- `UserPublic`

  ```json
  {
    "username": "tcthanh23", // string | null
    "full_name": "Test User", // string | null
    "avatar_url": null, // string | null
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "role": "Traveler", // string % "Admin" | "Traveler" | "Business"
    "is_verified_business": false, // boolean
    "stats": {
      // object | null % UserStats
      "reviews_count": 0,
      "posts_count": 0,
      "photos_count": 0,
      "public_trips_count": 2
    },
    "joined_at": "2025-12-17T10:17:53.788867Z" // string | datetime
  }
  ```

- `UserDetail`

  ```json
  {
    "username": "tcthanh23", // string | null
    "full_name": "Test User", // string | null
    "avatar_url": null, // string | null
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "role": "Traveler", // string % "Admin" | "Traveler" | "Business"
    "is_verified_business": false, // boolean
    "stats": {
      // object | null % UserStats
      "reviews_count": 0,
      "posts_count": 0,
      "photos_count": 0,
      "public_trips_count": 2
    },
    "joined_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "email": "tcthanh23@apcs.fitus.edu.vn" // string | null
  }
  ```

- `UserReviewResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e",   // string % UUID
    "place": {                                      // object % PlaceMinimal
      "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e",
      "name": "Ha Noi",
      "created_at": "2025-12-17T10:17:53.788867Z",
    }
    "rating": 4,                                    // number
    "review_text": "Beautiful place, but crowded.", // string | null
    "created_at": "2025-12-17T10:17:53.788867Z",    // string % datetime
    "images": [                                     // array[object] % [ReviewImageSchema]
      {
        "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e",
        "image_url": "https://e.com/i.png",
        "created_at": "2025-12-17T10:17:53.788867Z"
      }
    ]
  }
  ```

- `PlaceMinimal`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "Ha Noi", // string
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `ReviewImageSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "image_url": "https://e.com/i.png", // string
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `UserPostResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "title": "Where should I go in Ha Noi", // string
    "content_snippet": "I have just landed...", // string
    "reply_count": 0, // number
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `UserTripResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "trip_name": "Ha Noi Trip", // string
    "start_date": "2025-12-17", // string % date
    "end_date": "2025-12-20", // string % date
    "stop": 0 // number
  }
  ```

- `UserPhotoResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "image_url": "https://e.com/i.png", // string
    "source_type": "review", // string % "review" | "post"
    "source_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e" // string % UUID
  }
  ```

- `ReviewerSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "username": "tcthanh23", // string | null
    "avatar_url": "https://e.com/avatar.png" // string | null
  }
  ```

- `ReviewCreate`

  ```json
  {
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID (required)
    "rating": 4, // number (1-5) (required)
    "review_text": "Beautiful place to visit!", // string | null (optional)
    "images": [
      // array[string] (optional)
      "https://e.com/img1.png",
      "https://e.com/img2.png"
    ]
  }
  ```

- `ReviewUpdate`

  ```json
  {
    "rating": 5, // number (1-5) (optional)
    "review_text": "Updated review text", // string | null (optional)
    "images": [
      // array[string] | null (optional)
      "https://e.com/new_img.png"
    ]
  }
  ```

- `ReviewSchema`
  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "rating": 4, // number
    "review_text": "Beautiful place to visit!", // string | null
    "created_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "images": [
      // array[object] % [ReviewImageSchema]
      {
        "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e",
        "image_url": "https://e.com/i.png",
        "created_at": "2025-12-17T10:17:53.788867Z"
      }
    ],
    "user": {
      // object | null % ReviewerSchema
      "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e",
      "username": "tcthanh23",
      "avatar_url": "https://e.com/avatar.png"
    }
  }
  ```

## Users

### POST `/users`

- Status: Implemented.
- Description: Create a profile for a new user.
- Authentication: Yes.
- Metadata: No.
- Request Payload: `UserCreate`.
- Response Payload: `UserDetail`.
- Errors:
  - `409 CONFLICT`: `{ "detail": "Profile already exists" }`

### GET `/users/me`

- Status: Implemented.
- Description: Get current logged-in user profile.
- Authentication: Yes.
- Metadata: No.
- Request Payload: None.
- Response Payload: `UserDetail`.
- Errors:
  - `404 NOT FOUND`: `{ "detail": "User profile not found" }`

### PUT `/users/me`

- Status: Implemented.
- Description: Update profile.
- Authentication: Yes.
- Metadata: No.
- Request Payload: `UserUpdate`.
- Response Payload: `UserDetail`.
- Errors:
  - `409 CONFLICT`: `{ "detail": "Username already exists" }`
  - `404 NOT FOUND`: `{ "detail": "User profile not found" }`

### GET `/users/{id}`

- Status: Implemented.
- Description: Get public profile.
- Authentication: No.
- Metadata: No.
- Request Payload: None.
- Response Payload: `UserPublic`.
- Errors:
  - `404 NOT FOUND`: `{ "detail": "User profile not found" }`

### GET `/users/{id}/reviews`

- Status: Implemented.
- Description: Get list of reviews written by a specific user.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of `UserReviewResponse`.
- Errors: None.

### GET `/users/{id}/posts`

- Status: Implemented.
- Description: Get list of forum threads created by a specific user.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of `UserPostResponse`.
- Errors: None.

### GET `/users/{id}/trips`

- Status: Implemented.
- Description: Get list of public trips created by a specific user.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of `UserTripResponse`.
- Errors: None.

### GET `/users/{id}/photos`

- Status: Implemented.
- Description: Get gallery of photos uploaded by the user (aggregated from reviews and posts).
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of `UserPhotoResponse`.
- Errors: None.

### POST `/user/{id}/ban`

- Status: Unimplemented.
- Description: Admin action to ban a user.
- Authentication: No.
- Metadata: No.
- Request Payload: None.
- Response Payload: None.
- Errors:
  - `404 NOT FOUND`: `{ "detail": "User profile not found" }`

## Reviews

### GET `/places/{id}/reviews`

- Status: Implemented.
- Description: List reviews for a specific place.
- Authentication: No.
- Metadata: Yes.
- Query Parameters:
  - `page`: Page number (default: 1).
  - `limit`: Number of items per page (default: 20).
- Request Payload: None.
- Response Payload: Array of `ReviewSchema`.
- Errors:
  - `404 NOT FOUND`: `{ "detail": "Place not found" }`

### POST `/reviews`

- Status: Implemented.
- Description: Create a review for a place.
- Authentication: Yes.
- Metadata: No.
- Request Payload: `ReviewCreate`.
- Response Payload: `ReviewSchema`.
- Errors:
  - `404 NOT FOUND`: `{ "detail": "Place not found" }`

### GET `/reviews/{id}`

- Status: Implemented.
- Description: Get a specific review by ID.
- Authentication: No.
- Metadata: No.
- Request Payload: None.
- Response Payload: `ReviewSchema`.
- Errors:
  - `404 NOT FOUND`: `{ "detail": "Review not found" }`

### PUT `/reviews/{id}`

- Status: Implemented.
- Description: Update a review.
- Authentication: Yes.
- Metadata: No.
- Request Payload: `ReviewUpdate`.
- Response Payload: `ReviewSchema`.
- Errors:
  - `403 FORBIDDEN`: `{ "detail": "Not allowed" }`
  - `404 NOT FOUND`: `{ "detail": "Review not found" }`

### DELETE `/reviews/{id}`

- Status: Implemented.
- Description: Delete a review.
- Authentication: Yes.
- Metadata: No.
- Request Payload: None.
- Response Payload: `{ "message": "Review deleted" }`.
- Errors:
  - `403 FORBIDDEN`: `{ "detail": "Not allowed" }`
  - `404 NOT FOUND`: `{ "detail": "Review not found" }`
