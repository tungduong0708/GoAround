# Test Cases for Create Place Feature

## Feature Overview

**Page**: Manage Places → Add New Place (CreatePlacePage.vue)  
**Feature**: Create a new place (Hotel, Restaurant, Cafe, or Landmark)  
**Access**: From User Profile → Manage Places → "Add New Place" button

---

## 1. Normal Success Test Cases

### TC01: Create Restaurant with required fields only (No optional fields)

**Test Steps:**

1. Navigate to User Profile page
2. Click "Manage Places" menu item
3. Click "Add New Place" button (+ Plus icon)
4. In "Place Name" field, type "Pho 24 Restaurant"
5. In "Category" section, click the "Restaurant" card (with Utensils icon)
6. In "Physical Address" field, type "45 Le Loi Street"
7. Leave "City" field empty (optional)
8. Leave "Country" field empty (optional)
9. Do NOT click "Choose Location on Map" button (skip location selection)
10. In Operating Hours section, leave all days as "Closed" (default state)
11. Leave "Description" field empty
12. Skip Hotel/Restaurant/Cafe/Landmark Details section (leave empty)
13. Skip "Main Image" upload section (do not upload any image)
14. Skip "Additional Images" upload section
15. Leave "Tags" field empty
16. Scroll to bottom and click "Create Place" button

**Expected Result:**

1. All fields accept input correctly; Restaurant category highlighted
2. Location section shows map button (no coordinates); all operating hours show "Closed"
3. Form validates successfully with minimal required fields only
4. Button changes to "Creating..." with spinner and disables all fields
5. Redirects to place details page showing:
   - Name: "Pho 24 Restaurant" | Badge: "Restaurant"
   - Address: "45 Le Loi Street" (no city/country)
   - Default placeholder image, 0 reviews, no tags/description
6. No errors at any step

---

### TC02: Create Cafe with ALL fields (Complete with all optional fields)

**Test Steps:**

1. From Manage Places page, click "Add New Place" button
2. Place Name: "The Coffee House District 1" | Category: "Café" card
3. Address: "74 Nguyen Hue Street, District 1, Ben Nghe Ward" | City: "Ho Chi Minh City" | Country: "Vietnam"
4. Click "Choose Location on Map", pan/zoom to Ben Thanh Market area, click location (red marker appears with coordinates "10.773996, 106.701004"), click "Confirm Location"
5. Operating Hours: Monday - set "07:00" to "23:00", click "Copy" to apply to all days
6. Description: "Popular Vietnamese cafe chain offering premium coffee, tea, and light snacks. Modern and cozy atmosphere perfect for working or meeting friends. Free WiFi available."
7. Cafe Details: Coffee Specialties: "Vietnamese Drip Coffee, Cappuccino, Latte, Cold Brew" | Amenities: "Free WiFi, Air Conditioning, Outdoor Seating, Laptop-friendly" | Price Range: "$"
8. Main Image: Upload "cafe-exterior.jpg" (3MB JPG), preview thumbnail appears with X button
9. Additional Images: Upload 4 files ("cafe-interior-1.jpg", "cafe-interior-2.jpg", "coffee-drinks.jpg", "outdoor-seating.jpg"), 4 thumbnails appear with X buttons, counter shows "4/10 images"
10. Tags: "coffee, cafe, wifi, work friendly, cozy, drinks, vietnamese coffee"
11. Click "Create Place" button

**Expected Result:**

1. All fields accept input; Café category highlighted with blue border
2. Map modal: Opens with OpenStreetMap tiles, interactive pan/zoom, red marker appears at click, coordinates update real-time
3. After location confirm: Modal closes, shows "Location Selected" with coordinates "10.773996, 106.701004" and "Change" button
4. Operating hours: Copy function applies "07:00-23:00" to all 7 days
5. Cafe Details form appears (not other categories); accepts all inputs; "$" selected in price dropdown
6. Main image upload: Preview thumbnail with X button appears after upload completes
7. Additional images: 4 thumbnails in grid, each with X button, counter shows "4/10 images"
8. Button changes to "Creating..." with spinner, all fields disabled
9. Success toast "Place created successfully", redirects to details page
10. Details page displays:
    - Header: Uploaded main image, "The Coffee House District 1", Café badge, full address
    - Details: Description, hours table (07:00-23:00 all days), specialties, amenities, $ price
    - Gallery: 4 additional images (clickable)
    - Map: Marker at exact coordinates
    - Tags: "coffee", "cafe", "wifi" etc. as badges
    - Rating: 0 stars, "Be first to review"
11. No errors, all data persists, responsive layout

---

## 2. Edge Cases ("Hiểm" - Tricky/Dangerous Cases)

### TC03: Create Restaurant with place name exceeding maximum length (102 characters)

**Test Steps:**

1. Navigate to User Profile page
2. Click "Manage Places" menu item
3. Click "Add New Place" button (+ Plus icon)
4. In "Place Name" field, type 102 characters (exceeds max of 100): "A" repeated 102 times
5. In "Category" section, click the "Restaurant" card (with Utensils icon)
6. In "Physical Address" field, type "45 Le Loi Street"
7. Leave all other fields empty (City, Country, Location, Operating Hours, Description, Images, Tags)
8. Scroll to bottom and click "Create Place" button

**Expected Result:**

1. Place Name field prevents typing beyond 100 characters (HTML maxlength attribute)
2. Character counter displays current length (e.g., "45/100 characters")
3. User cannot exceed limit; form can be submitted with valid length
4. No backend error occurs; smooth user experience

**Actual Result:**

1. Place Name field has maxlength="100" attribute preventing input beyond limit
2. Character counter shows "X/100 characters" in real-time
3. User cannot type beyond 100 characters; browser enforces limit
4. Form submits successfully with valid length; no backend errors

**Status**: ✅ PASSED - Frontend enforces 100-character limit with maxlength attribute and character counter

---

### TC04: Enter negative or invalid numbers in numeric fields

**Test Steps:**

1. Navigate to User Profile → Manage Places → Add New Place
2. Fill required fields: Place Name: "Test Hotel" | Address: "123 Test St"
3. Select "Hotel" category
4. In Hotel Details section:
   - Hotel Star Rating: Try typing "-3", then "0", then "6"
   - Price Per Night: Try typing "-100.50", then "abc"
5. Switch to "Landmark" category
6. In Landmark Details:
   - Ticket Price: Try typing "-50.99", then "abc"
7. Try to submit form with invalid values

**Expected Result:**

1. Hotel Star Rating: HTML5 validation prevents values below 1 or above 5; browser shows validation message
2. Price Per Night and Ticket Price: HTML5 validation prevents negative numbers; non-numeric input blocked
3. Form submission blocked with invalid values; fields may highlight in red

---

### TC05: Fill operating hours with invalid time ranges

**Test Steps:**

1. Go to Add New Place page
2. Fill required fields: Place Name: "Test Restaurant" | Category: "Restaurant" | Address: "123 Test St"
3. In Operating Hours section:
   - Monday: Click "Open"
     - Open time: "22:00" (10:00 PM)
     - Close time: "08:00" (8:00 AM - closes before it opens!)
4. Click "Create Place"

**Expected Result:**

1. Time inputs show red border when close time < open time
2. Error message displays: "Close time must be after open time" below the time fields
3. "Create Place" button is disabled; form cannot be submitted
4. Error clears when user corrects the time range

**Actual Result:**

1. Time inputs display red border when close time < open time
2. Shows "❌ Invalid hours: Close time must be after open time" below time inputs in red color
3. "Create Place" button disabled; submission blocked until times are valid
4. Also validates incomplete hours (only open or only close filled)

**Status**: ✅ PASSED - Validation prevents invalid time ranges; clear error feedback

---

## Summary Statistics

- **Total Test Cases**: 5
- **Normal Success Cases**: 2 (TC01-TC02)
- **Edge Cases ("Hiểm")**: 3 (TC03-TC05)
- **Categories Covered**: Hotel, Restaurant, Cafe, Landmark
- **Features Tested**:
  - Form validation
  - Image upload (single & multiple)
  - Map location picker
  - Operating hours management
  - Category-specific fields
  - Security (XSS prevention)
  - Error handling
  - UI/UX behavior

---

## Defect Reports

### All Defects Resolved ✅

Both identified defects have been fixed:

1. **Character Limit Validation**: Added `maxlength` attributes to all fields (Place Name: 100, City: 100, Country: 100, etc.) with real-time character counter for Place Name field
2. **Operating Hours Validation**: Added validation that prevents submission when hours are invalid (incomplete or close time before open time); shows red border and clear error message
