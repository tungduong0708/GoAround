# RESTful API Specs

Base URL: `http://goaround.onrender.com/api/v1`

## Adjusted

* Success envelope simplified (removed "status" field).
* Error envelope.
* Maybe add paging to some user stuff.

## Header

* ContentType: `application/json`
* Authentication: `Authentication: Bearer <token>`

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

* GET `/places`
* GET `/places/{id}/reviews`
* GET `/trips`
* GET `/lists`
* GET `/lists/{id}`
* GET `/forum/posts`
* GET `/forum/posts/{id}`
* GET `/admin/reports`


### Error (`4xx`, `5xx`)

``` json
{
  "detail": "error message" // string
}
```

## Schemas

- `AddPlaceToListRequest`

  ```json
  {
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e" // string % UUID
  }
  ```

- `AdminPendingPlace`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "string", // string
    "place_type": "hotel", // string % "hotel" | "restaurant" | "landmark" | "cafe"
    "owner": "string", // string
    "submitted_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "verification_status": "pending" // string % "pending" | "approved" | "rejected"
  }
  ```

- `AdminPlaceOwner`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "username": "string" // string
  }
  ```

- `HTTPError`

  ```json
  {
    "detail": "string" // string
  }
  ```

- `LocationSchema`

  ```json
  {
    "lat": 0, // number
    "lng": 0 // number
  }
  ```

- `Message`

  ```json
  {
    "message": "string" // string
  }
  ```

- `MetaData`

  ```json
  {
    "page": 0, // number
    "limit": 0, // number
    "total_items": 0 // number
  }
  ```

- `OwnerSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "username": "string", // string
    "avatar_url": "string", // string
    "full_name": "string" // string
  }
  ```

- `PlaceCreate`

  ```json
  {
    "name": "string", // string
    "address": "string", // string
    "city": "string", // string
    "country": "string", // string
    "location": "{...} // object % LocationSchema",
    "description": "string", // string
    "opening_hours": "string", // string
    "place_type": "hotel", // string % "hotel" | "restaurant" | "landmark" | "cafe"
    "main_image_url": "string", // string
    "images": ["string1", "string2"], // array[string]
    "tags": ["string1", "string2"], // array[string]
    "hotel_class": "string", // string
    "price_per_night": "string", // string
    "amenities": "string", // string
    "cuisine_type": "string", // string
    "price_range": "string", // string
    "ticket_price": "string", // string
    "coffee_specialties": "string" // string
  }
  ```

- `PlaceDetail`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "string", // string
    "place_type": "hotel", // string % "hotel" | "restaurant" | "landmark" | "cafe"
    "address": "string", // string
    "city": "string", // string
    "country": "string", // string
    "location": "string", // string
    "main_image_url": "string", // string
    "average_rating": 0, // number
    "review_count": 0, // number
    "opening_hours": "string", // string
    "price_range": "string", // string
    "tags": ["string1", "string2"], // array[string]
    "verification_status": "pending", // string % "pending" | "approved" | "rejected"
    "created_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "description": "string", // string
    "hotel_class": "string", // string
    "price_per_night": "string", // string
    "cuisine_type": "string", // string
    "ticket_price": "string", // string
    "coffee_specialties": "string", // string
    "amenities": "string", // string
    "images": [], // array[object] % [PlaceImageSchema]
    "owner": "string", // string
    "my_review": "string" // string
  }
  ```

- `PlaceImageSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "url": "string", // string
    "caption": "string" // string
  }
  ```

- `PlaceMinimal`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "string", // string
    "main_image_url": "string" // string
  }
  ```

- `PlacePublic`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "string", // string
    "place_type": "hotel", // string % "hotel" | "restaurant" | "landmark" | "cafe"
    "address": "string", // string
    "city": "string", // string
    "country": "string", // string
    "location": "string", // string
    "main_image_url": "string", // string
    "average_rating": 0, // number
    "review_count": 0, // number
    "opening_hours": "string", // string
    "price_range": "string", // string
    "tags": ["string1", "string2"], // array[string]
    "verification_status": "pending", // string % "pending" | "approved" | "rejected"
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `PlaceUpdate`

  ```json
  {
    "name": "string", // string
    "address": "string", // string
    "location": "string", // string
    "description": "string", // string
    "opening_hours": "string", // string
    "city": "string", // string
    "country": "string", // string
    "main_image_url": "string", // string
    "images": "string", // string
    "tags": "string", // string
    "hotel_class": "string", // string
    "price_per_night": "string", // string
    "amenities": "string", // string
    "cuisine_type": "string", // string
    "price_range": "string", // string
    "ticket_price": "string", // string
    "coffee_specialties": "string" // string
  }
  ```

- `ReviewCreate`

  ```json
  {
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "rating": 0, // number
    "review_text": "string", // string
    "images": ["string1", "string2"] // array[string]
  }
  ```

- `ReviewImageSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "image_url": "string", // string
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `ReviewSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "rating": 0, // number
    "review_text": "string", // string
    "created_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "images": [], // array[object] % [ReviewImageSchema]
    "user": "string" // string
  }
  ```

- `ReviewUpdate`

  ```json
  {
    "rating": "string", // string
    "review_text": "string", // string
    "images": "string" // string
  }
  ```

- `ReviewerSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "username": "string", // string
    "avatar_url": "string" // string
  }
  ```

- `SavedListCreate`

  ```json
  {
    "name": "string" // string
  }
  ```

- `SavedListDetailSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "string", // string
    "created_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "items": [] // array[object] % [SavedListItemWithPlace]
  }
  ```

- `SavedListItemWithPlace`

  ```json
  {
    "place": "{...} // object % PlacePublic",
    "saved_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `SavedListSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "name": "string", // string
    "created_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "item_count": 0 // number
  }
  ```

- `TransferOwnershipRequest`

  ```json
  {
    "new_owner_email": "string" // string
  }
  ```

- `TripCreate`

  ```json
  {
    "trip_name": "string", // string
    "start_date": "string", // string
    "end_date": "string", // string
    "tags": ["string1", "string2"], // array[string]
    "stops": [] // array[object] % [TripStopCreate]
  }
  ```

- `TripListSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "trip_name": "string", // string
    "start_date": "string", // string
    "end_date": "string", // string
    "stop_count": 0 // number
  }
  ```

- `TripSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "trip_name": "string", // string
    "start_date": "string", // string
    "end_date": "string", // string
    "tags": ["string1", "string2"], // array[string]
    "stops": [] // array[object] % [TripStopWithPlace]
  }
  ```

- `TripStopCreate`

  ```json
  {
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "stop_order": "string", // string
    "arrival_time": "2025-12-17T10:17:53.788867Z", // string % datetime
    "notes": "string" // string
  }
  ```

- `TripStopSchema`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "trip_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "place_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "stop_order": 0, // number
    "arrival_time": "string", // string
    "notes": "string" // string
  }
  ```

- `TripStopUpdate`

  ```json
  {
    "order_index": "string", // string
    "arrival_time": "string", // string
    "notes": "string" // string
  }
  ```

- `TripStopWithPlace`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "trip_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "stop_order": 0, // number
    "arrival_time": "string", // string
    "notes": "string", // string
    "place": "string" // string
  }
  ```

- `TripUpdate`

  ```json
  {
    "trip_name": "string", // string
    "start_date": "string", // string
    "end_date": "string", // string
    "tags": "string" // string
  }
  ```

- `UserCreate`

  ```json
  {
    "username": "string", // string
    "full_name": "string", // string
    "avatar_url": "string", // string
    "signup_type": "Traveler" // string % "Traveler" | "Business"
  }
  ```

- `UserDetail`

  ```json
  {
    "username": "string", // string
    "full_name": "string", // string
    "avatar_url": "string", // string
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "role": "Admin", // string % "Admin" | "Traveler" | "Business"
    "is_verified_business": false, // boolean
    "stats": "string", // string
    "joined_at": "string", // string
    "email": "string" // string
  }
  ```

- `UserPhotoResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "image_url": "string", // string
    "source_type": "review", // string % "review" | "post"
    "source_id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e" // string % UUID
  }
  ```

- `UserPostResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "title": "string", // string
    "content_snippet": "string", // string
    "reply_count": 0, // number
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

- `UserPublic`

  ```json
  {
    "username": "string", // string
    "full_name": "string", // string
    "avatar_url": "string", // string
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "role": "Admin", // string % "Admin" | "Traveler" | "Business"
    "is_verified_business": false, // boolean
    "stats": "string", // string
    "joined_at": "string" // string
  }
  ```

- `UserReviewResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "place": "{...} // object % PlaceMinimal",
    "rating": 0, // number
    "review_text": "string", // string
    "created_at": "2025-12-17T10:17:53.788867Z", // string % datetime
    "images": [] // array[object] % [ReviewImageSchema]
  }
  ```

- `UserStats`

  ```json
  {
    "reviews_count": 0, // number
    "posts_count": 0, // number
    "photos_count": 0, // number
    "public_trips_count": 0 // number
  }
  ```

- `UserTripResponse`

  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "trip_name": "string", // string
    "start_date": "string", // string
    "end_date": "string", // string
    "stop_count": 0 // number
  }
  ```

- `UserUpdate`

  ```json
  {
    "username": "string", // string
    "full_name": "string", // string
    "avatar_url": "string" // string
  }
  ```

- `VerifyPlaceRequest`

  ```json
  {
    "status": "approved", // string % "approved" | "rejected"
    "rejection_reason": "string" // string
  }
  ```

- `VerifyPlaceResponse`
  ```json
  {
    "id": "5f7f5d0e-728c-46fe-b138-ce05e547f48e", // string % UUID
    "verification_status": "pending", // string % "pending" | "approved" | "rejected"
    "created_at": "2025-12-17T10:17:53.788867Z" // string % datetime
  }
  ```

## Admin

### GET `/admin/places/pending`

- Status: Implemented.
- Description: Fetch list of places waiting for verification.
  Admin only.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of AdminPendingPlace.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`

### PUT `/admin/places/{id}/verify`

- Status: Implemented.
- Description: Approve or Reject a place listing.
  Admin only.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: VerifyPlaceRequest.
- Response Payload: VerifyPlaceResponse.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

## Lists

### GET `/lists`

- Status: Implemented.
- Description: List Lists
- Authentication: Yes.
- Metadata: Yes.
- Query Parameters:
  - `page` (default: 1).
  - `limit` (default: 20).
- Request Payload: None.
- Response Payload: listSavedListSchema.
- Errors: None.

### POST `/lists`

- Status: Implemented.
- Description: Create List
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: SavedListCreate.
- Response Payload: SavedListSchema.
- Errors: None.

### GET `/lists/{list_id}`

- Status: Implemented.
- Description: Get List
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: SavedListDetailSchema.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### POST `/lists/{list_id}/places`

- Status: Implemented.
- Description: Add Place
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: AddPlaceToListRequest.
- Response Payload: Message.
- Errors:
  - `404`: `{ "detail": "List or place not found" }`

### DELETE `/lists/{list_id}/places/{place_id}`

- Status: Implemented.
- Description: Remove Place
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Message.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

## Places

### GET `/places`

- Status: Implemented.
- Description: Search places by keyword, tags, price, or location (radius).
  Only approved places are shown unless the user is an Admin.
- Authentication: No.
- Metadata: Yes.
- Query Parameters:
  - `q`.
  - `category`.
  - `location`.
  - `radius` (default: 5.0).
  - `tags`.
  - `amenities`.
  - `price_range`.
  - `rating`.
  - `sort_by` (default: rating).
  - `page` (default: 1).
  - `limit` (default: 20).
  - `place_type`.
- Request Payload: None.
- Response Payload: Array of PlacePublic.
- Errors:
  - `400`: `{ "detail": "Bad Request" }`

### POST `/places`

- Status: Implemented.
- Description: Create a new place. Place will be pending admin approval.
  Only verified business accounts can create places.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: PlaceCreate.
- Response Payload: PlaceDetail.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`

### GET `/places/mine/all`

- Status: Implemented.
- Description: Get places owned by the current user.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of PlacePublic.
- Errors: None.

### GET `/places/{id}`

- Status: Implemented.
- Description: Get detailed information for a single place.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: PlaceDetail.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### PUT `/places/{id}`

- Status: Implemented.
- Description: Update a place. Only the owner can perform this action.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: PlaceUpdate.
- Response Payload: PlaceDetail.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

### DELETE `/places/{id}`

- Status: Implemented.
- Description: Delete a place. Only the owner can perform this action.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Message.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

### GET `/places/{id}/reviews`

- Status: Implemented.
- Description: List Reviews For Place
- Authentication: No.
- Metadata: Yes.
- Query Parameters:
  - `page` (default: 1).
  - `limit` (default: 20).
- Request Payload: None.
- Response Payload: listReviewSchema.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### POST `/places/{id}/transfer`

- Status: Implemented.
- Description: Transfer ownership of a place to another verified business account via email.
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: TransferOwnershipRequest.
- Response Payload: Message.
- Errors:
  - `400`: `{ "detail": "Bad Request" }`
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

## Private

### GET `/private/me`

- Status: Implemented.
- Description: Decoded Token
- Authentication: Yes.
- Metadata: No.
- Request Payload: None.
- Response Payload: TokenPayload.
- Errors: None.

## Reviews

### POST `/reviews`

- Status: Implemented.
- Description: Create Review
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: ReviewCreate.
- Response Payload: ReviewSchema.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### GET `/reviews/{review_id}`

- Status: Implemented.
- Description: Read Review
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: ReviewSchema.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### PUT `/reviews/{review_id}`

- Status: Implemented.
- Description: Update Review
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: ReviewUpdate.
- Response Payload: ReviewSchema.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

### DELETE `/reviews/{review_id}`

- Status: Implemented.
- Description: Delete Review
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Message.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

## Trips

### GET `/trips`

- Status: Implemented.
- Description: List Trips
- Authentication: Yes.
- Metadata: Yes.
- Query Parameters:
  - `page` (default: 1).
  - `limit` (default: 20).
- Request Payload: None.
- Response Payload: listTripListSchema.
- Errors: None.

### POST `/trips`

- Status: Implemented.
- Description: Create Trip
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: TripCreate.
- Response Payload: TripSchema.
- Errors: None.

### GET `/trips/{trip_id}`

- Status: Implemented.
- Description: Get Trip
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: TripSchema.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### PUT `/trips/{trip_id}`

- Status: Implemented.
- Description: Update Trip
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: TripUpdate.
- Response Payload: TripSchema.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

### POST `/trips/generate`

- Status: Implemented.
- Description: Generate Trip
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: None.
- Errors:
  - `501`: `{ "detail": "Successful Response" }`

### POST `/trips/{trip_id}/places`

- Status: Implemented.
- Description: Add Stop
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: TripStopCreate.
- Response Payload: TripStopSchema.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

### PUT `/trips/{trip_id}/places/{stop_id}`

- Status: Implemented.
- Description: Update Stop
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: TripStopUpdate.
- Response Payload: TripStopSchema.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`
  - `404`: `{ "detail": "Not Found" }`

### DELETE `/trips/{trip_id}/places/{stop_id}`

- Status: Implemented.
- Description: Remove Stop
- Authentication: Yes.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Message.
- Errors:
  - `403`: `{ "detail": "Forbidden" }`

## Users

### GET `/users/me`

- Status: Implemented.
- Description: Get current user profile. Authentication required.
- Authentication: Yes.
- Metadata: No.
- Request Payload: None.
- Response Payload: UserDetail.
- Errors:
  - `404`: `{ "detail": "User profile not found" }`

### PUT `/users/me`

- Status: Implemented.
- Description: Update current user profile. Authentication required.
- Authentication: Yes.
- Metadata: No.
- Request Payload: UserUpdate.
- Response Payload: UserDetail.
- Errors:
  - `404`: `{ "detail": "Not Found" }`
  - `409`: `{ "detail": "Conflict" }`

### POST `/users`

- Status: Implemented.
- Description: Create a user profile, after `auth.users` table has been updated.
- Authentication: Yes.
- Metadata: No.
- Request Payload: UserCreate.
- Response Payload: UserDetail.
- Errors:
  - `409`: `{ "detail": "Conflict" }`

### GET `/users/{user_id}`

- Status: Implemented.
- Description: Get public profile of another user with activity statistics.
- Authentication: No.
- Metadata: No.
- Request Payload: None.
- Response Payload: UserPublic.
- Errors:
  - `404`: `{ "detail": "Not Found" }`

### GET `/users/{user_id}/reviews`

- Status: Implemented.
- Description: Get list of reviews written by a specific user.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of UserReviewResponse.
- Errors: None.

### GET `/users/{user_id}/posts`

- Status: Implemented.
- Description: Get list of forum threads created by a specific user.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of UserPostResponse.
- Errors: None.

### GET `/users/{user_id}/trips`

- Status: Implemented.
- Description: Get list of public trips created by a specific user.
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of UserTripResponse.
- Errors: None.

### GET `/users/{user_id}/photos`

- Status: Implemented.
- Description: Get gallery of photos uploaded by the user (aggregated from reviews and posts).
- Authentication: No.
- Metadata: Yes.
- Request Payload: None.
- Response Payload: Array of UserPhotoResponse.
- Errors: None.

## Utils

### GET `/utils/health`

- Status: Implemented.
- Description: Health
- Authentication: No.
- Metadata: No.
- Request Payload: None.
- Response Payload: HealthInfo.
- Errors: None.
