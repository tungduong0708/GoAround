import type { IPlace, ITrip } from "@/utils/interfaces";

export const mockPlaces: IPlace[] = [
  {
    id: "1",
    name: "Misty Mountain Retreat",
    placeType: "hotel",
    address: "12 Pine Ridge",
    city: "Da Lat",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [108.458, 11.94],
    },
    mainImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.8,
    reviewCount: 124,
    description:
      "Cozy cabins tucked away in the pine forests with panoramic valley views.",
    pricePerNight: 120,
    amenities: ["spa", "breakfast", "wifi"],
    tags: [
      { id: "tag-mountain", name: "Mountain" },
      { id: "tag-nature", name: "Nature" },
      { id: "tag-relax", name: "Relax" },
    ],
  },
  {
    id: "2",
    name: "Sunset Coastline Walk",
    placeType: "landmark",
    address: "Bai Truoc Promenade",
    city: "Vung Tau",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [107.084, 10.346],
    },
    mainImageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.6,
    reviewCount: 203,
    description:
      "Experience golden hour along a dramatic shoreline filled with hidden coves.",
    tags: [
      { id: "tag-beach", name: "Beach" },
      { id: "tag-sunset", name: "Sunset" },
      { id: "tag-walk", name: "Walk" },
    ],
    priceRange: "$$",
  },
  {
    id: "3",
    name: "Old Quarter Coffee Crawl",
    placeType: "restaurant",
    address: "36 Hang Gai",
    city: "Hanoi",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [105.848, 21.033],
    },
    mainImageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.7,
    reviewCount: 89,
    description:
      "Discover heritage coffee houses and modern brews in the heart of the city.",
    priceRange: "$$",
    cuisineType: "Cafe",
    openingHours: {
      mon: "7-22",
      tue: "7-22",
      wed: "7-22",
      thu: "7-22",
      fri: "7-23",
      sat: "7-23",
      sun: "7-22",
    },
    tags: [
      { id: "tag-coffee", name: "Coffee" },
      { id: "tag-culture", name: "Culture" },
      { id: "tag-city", name: "City" },
    ],
  },
  {
    id: "4",
    name: "Riverfront Night Market",
    placeType: "restaurant",
    address: "Hoa Binh Street",
    city: "Da Nang",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [108.202, 16.067],
    },
    mainImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.5,
    reviewCount: 310,
    description:
      "Street food, lanterns, and river breezes make this a lively evening stop.",
    priceRange: "$",
    tags: [
      { id: "tag-streetfood", name: "Street Food" },
      { id: "tag-nightlife", name: "Nightlife" },
      { id: "tag-market", name: "Market" },
    ],
  },
  {
    id: "5",
    name: "Cascading Rice Terraces",
    placeType: "landmark",
    address: "Mu Cang Chai",
    city: "Yen Bai",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [104.138, 21.856],
    },
    mainImageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.9,
    reviewCount: 142,
    description: "Layered terraces that glow golden at harvest season.",
    tags: [
      { id: "tag-rice", name: "Rice Terraces" },
      { id: "tag-nature2", name: "Nature" },
      { id: "tag-photo", name: "Photography" },
    ],
  },
  {
    id: "6",
    name: "Hidden Rooftop Bar",
    placeType: "restaurant",
    address: "45 Nguyen Trai",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    location: { type: "Point", coordinates: [106.695, 10.776] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.4,
    reviewCount: 78,
    description: "Craft cocktails and skyline views above the city lights.",
    priceRange: "$$$",
    tags: [
      { id: "tag-rooftop", name: "Rooftop" },
      { id: "tag-cocktails", name: "Cocktails" },
      { id: "tag-night", name: "Nightlife" },
    ],
  },
  {
    id: "7",
    name: "Lan Ha Bay Kayak",
    placeType: "landmark",
    address: "Lan Ha Bay",
    city: "Hai Phong",
    country: "Vietnam",
    location: { type: "Point", coordinates: [107.055, 20.784] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.9,
    reviewCount: 256,
    description: "Paddle through limestone karsts and emerald waters.",
    ticketPrice: 35,
    tags: [
      { id: "tag-kayak", name: "Kayak" },
      { id: "tag-sea", name: "Sea" },
      { id: "tag-adventure", name: "Adventure" },
    ],
  },
  {
    id: "8",
    name: "Hoi An Lantern Stay",
    placeType: "hotel",
    address: "21 Tran Phu",
    city: "Hoi An",
    country: "Vietnam",
    location: { type: "Point", coordinates: [108.325, 15.879] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.7,
    reviewCount: 133,
    description: "Boutique rooms tucked inside the Ancient Town.",
    pricePerNight: 95,
    amenities: ["breakfast", "bikes", "wifi"],
    tags: [
      { id: "tag-heritage", name: "Heritage" },
      { id: "tag-lantern", name: "Lanterns" },
      { id: "tag-riverside", name: "Riverside" },
    ],
  },
  {
    id: "9",
    name: "Sapa Cloud Trail",
    placeType: "landmark",
    address: "Fansipan Road",
    city: "Sa Pa",
    country: "Vietnam",
    location: { type: "Point", coordinates: [103.844, 22.336] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.8,
    reviewCount: 198,
    description: "Mountain trek with clouds rolling over terraced hills.",
    tags: [
      { id: "tag-hike", name: "Hiking" },
      { id: "tag-mountain2", name: "Mountains" },
      { id: "tag-cold", name: "Cool Weather" },
    ],
  },
  {
    id: "10",
    name: "Hue Imperial Feast",
    placeType: "restaurant",
    address: "2 Le Loi",
    city: "Hue",
    country: "Vietnam",
    location: { type: "Point", coordinates: [107.58, 16.463] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.6,
    reviewCount: 112,
    description: "Royal recipes with a view of the Perfume River.",
    priceRange: "$$$",
    cuisineType: "Vietnamese",
    tags: [
      { id: "tag-royal", name: "Royal Cuisine" },
      { id: "tag-river", name: "Riverside" },
      { id: "tag-fine", name: "Fine Dining" },
    ],
  },
  {
    id: "11",
    name: "Desert Dunes Camp",
    placeType: "hotel",
    address: "Erg Chebbi",
    city: "Merzouga",
    country: "Morocco",
    location: { type: "Point", coordinates: [-3.995, 31.11] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.7,
    reviewCount: 94,
    description: "Luxury tents under the Sahara stars.",
    pricePerNight: 210,
    amenities: ["dinner", "camel ride", "wifi"],
    tags: [
      { id: "tag-desert", name: "Desert" },
      { id: "tag-glamping", name: "Glamping" },
      { id: "tag-stargaze", name: "Stargazing" },
    ],
  },
  {
    id: "12",
    name: "Northern Lights Lodge",
    placeType: "hotel",
    address: "Arctic Circle 12",
    city: "Tromsø",
    country: "Norway",
    location: { type: "Point", coordinates: [18.955, 69.649] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.9,
    reviewCount: 221,
    description: "Glass-roof cabins for aurora watching.",
    pricePerNight: 320,
    amenities: ["sauna", "breakfast", "wifi"],
    tags: [
      { id: "tag-aurora", name: "Aurora" },
      { id: "tag-cabin", name: "Cabin" },
      { id: "tag-snow", name: "Snow" },
    ],
  },
  {
    id: "13",
    name: "Santorini Cliff Suites",
    placeType: "hotel",
    address: "Oia Caldera",
    city: "Santorini",
    country: "Greece",
    location: { type: "Point", coordinates: [25.375, 36.461] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1505739775417-85f81d90c356?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.8,
    reviewCount: 305,
    description: "Infinity pools with sweeping Aegean views.",
    pricePerNight: 450,
    amenities: ["pool", "breakfast", "wifi"],
    tags: [
      { id: "tag-sunset2", name: "Sunset" },
      { id: "tag-view", name: "View" },
      { id: "tag-lux", name: "Luxury" },
    ],
  },
  {
    id: "14",
    name: "Tokyo Night Food Tour",
    placeType: "restaurant",
    address: "Shinjuku",
    city: "Tokyo",
    country: "Japan",
    location: { type: "Point", coordinates: [139.7, 35.689] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.7,
    reviewCount: 188,
    description: "Street eats, izakayas, and neon-lit alleys.",
    priceRange: "$$",
    cuisineType: "Japanese",
    tags: [
      { id: "tag-street", name: "Street Food" },
      { id: "tag-night2", name: "Night" },
      { id: "tag-tour", name: "Guided Tour" },
    ],
  },
  {
    id: "15",
    name: "Patagonia Glacier Hike",
    placeType: "landmark",
    address: "Perito Moreno",
    city: "El Calafate",
    country: "Argentina",
    location: { type: "Point", coordinates: [-72.998, -50.483] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.9,
    reviewCount: 167,
    description: "Ice trekking with thundering glacier views.",
    ticketPrice: 65,
    tags: [
      { id: "tag-glacier", name: "Glacier" },
      { id: "tag-hike2", name: "Hike" },
      { id: "tag-ice", name: "Ice" },
    ],
  },
  {
    id: "16",
    name: "Cappadocia Balloon Dawn",
    placeType: "landmark",
    address: "Goreme Valley",
    city: "Cappadocia",
    country: "Turkey",
    location: { type: "Point", coordinates: [34.852, 38.643] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.8,
    reviewCount: 284,
    description: "Sunrise balloons over fairy chimneys.",
    ticketPrice: 180,
    tags: [
      { id: "tag-balloon", name: "Balloon" },
      { id: "tag-sunrise", name: "Sunrise" },
      { id: "tag-photo2", name: "Photography" },
    ],
  },
  {
    id: "17",
    name: "Lisbon Tile Walk",
    placeType: "landmark",
    address: "Alfama",
    city: "Lisbon",
    country: "Portugal",
    location: { type: "Point", coordinates: [-9.13, 38.713] },
    mainImageUrl:
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.5,
    reviewCount: 119,
    description: "Tram rides, azulejo alleys, and miradouros.",
    tags: [
      { id: "tag-tram", name: "Tram" },
      { id: "tag-tiles", name: "Azulejos" },
      { id: "tag-view2", name: "Viewpoint" },
    ],
  },
];

export const mockTrips: ITrip[] = [
  {
    id: "trip-1",
    tripName: "Vietnam Coastal Adventure",
    startDate: "2025-12-12",
    endDate: "2025-12-18",
    stopCount: 5,
    stops: [
      {
        id: "stop-1-1",
        place: mockPlaces[1]!, // Sunset Coastline Walk
        stopOrder: 1,
        arrivalTime: "2025-12-12T14:00:00",
        notes: "Start with a relaxing beach walk at sunset",
      },
      {
        id: "stop-1-2",
        place: mockPlaces[3]!, // Riverfront Night Market
        stopOrder: 2,
        arrivalTime: "2025-12-13T18:00:00",
        notes: "Evening food tour and market exploration",
      },
      {
        id: "stop-1-3",
        place: mockPlaces[7]!, // Hoi An Lantern Stay
        stopOrder: 3,
        arrivalTime: "2025-12-14T15:00:00",
        notes: "Check-in for 2 nights at the heritage hotel",
      },
      {
        id: "stop-1-4",
        place: mockPlaces[6]!, // Lan Ha Bay Kayak
        stopOrder: 4,
        arrivalTime: "2025-12-16T08:00:00",
        notes: "Full day kayaking adventure",
      },
      {
        id: "stop-1-5",
        place: mockPlaces[9]!, // Hue Imperial Feast
        stopOrder: 5,
        arrivalTime: "2025-12-17T19:00:00",
        notes: "Final dinner with royal cuisine",
      },
    ],
  },
  {
    id: "trip-2",
    tripName: "Northern Vietnam Escape",
    startDate: "2025-11-05",
    endDate: "2025-11-10",
    stopCount: 4,
    stops: [
      {
        id: "stop-2-1",
        place: mockPlaces[2]!, // Old Quarter Coffee Crawl
        stopOrder: 1,
        arrivalTime: "2025-11-05T10:00:00",
        notes: "Morning coffee tour in Hanoi",
      },
      {
        id: "stop-2-2",
        place: mockPlaces[8]!, // Sapa Cloud Trail
        stopOrder: 2,
        arrivalTime: "2025-11-06T09:00:00",
        notes: "Hiking through mountain trails",
      },
      {
        id: "stop-2-3",
        place: mockPlaces[4]!, // Cascading Rice Terraces
        stopOrder: 3,
        arrivalTime: "2025-11-08T11:00:00",
        notes: "Photography session at the terraces",
      },
      {
        id: "stop-2-4",
        place: mockPlaces[0]!, // Misty Mountain Retreat
        stopOrder: 4,
        arrivalTime: "2025-11-09T16:00:00",
        notes: "Relaxing spa retreat to end the trip",
      },
    ],
  },
  {
    id: "trip-3",
    tripName: "City Highlights Tour",
    startDate: "2025-10-20",
    endDate: "2025-10-23",
    stopCount: 3,
    stops: [
      {
        id: "stop-3-1",
        place: mockPlaces[2]!, // Old Quarter Coffee Crawl
        stopOrder: 1,
        arrivalTime: "2025-10-20T09:00:00",
        notes: "Start with local coffee culture",
      },
      {
        id: "stop-3-2",
        place: mockPlaces[3]!, // Riverfront Night Market
        stopOrder: 2,
        arrivalTime: "2025-10-21T18:30:00",
        notes: "Street food exploration",
      },
      {
        id: "stop-3-3",
        place: mockPlaces[5]!, // Hidden Rooftop Bar
        stopOrder: 3,
        arrivalTime: "2025-10-22T20:00:00",
        notes: "Sunset cocktails with city views",
      },
    ],
  },
  {
    id: "trip-4",
    tripName: "Europe Grand Tour",
    startDate: "2026-06-15",
    endDate: "2026-06-28",
    stopCount: 6,
    stops: [
      {
        id: "stop-4-1",
        place: mockPlaces[16]!, // Lisbon Tile Walk
        stopOrder: 1,
        arrivalTime: "2026-06-15T10:00:00",
        notes: "Explore Portuguese architecture and trams",
      },
      {
        id: "stop-4-2",
        place: mockPlaces[12]!, // Santorini Cliff Suites
        stopOrder: 2,
        arrivalTime: "2026-06-18T14:00:00",
        notes: "3 nights in luxury cliff suites",
      },
      {
        id: "stop-4-3",
        place: mockPlaces[15]!, // Cappadocia Balloon Dawn
        stopOrder: 3,
        arrivalTime: "2026-06-22T05:00:00",
        notes: "Sunrise hot air balloon experience",
      },
      {
        id: "stop-4-4",
        place: mockPlaces[13]!, // Tokyo Night Food Tour
        stopOrder: 4,
        arrivalTime: "2026-06-24T19:00:00",
        notes: "Extended layover food tour",
      },
      {
        id: "stop-4-5",
        place: mockPlaces[11]!, // Northern Lights Lodge
        stopOrder: 5,
        arrivalTime: "2026-06-26T16:00:00",
        notes: "Aurora viewing in glass cabins",
      },
      {
        id: "stop-4-6",
        place: mockPlaces[10]!, // Desert Dunes Camp
        stopOrder: 6,
        arrivalTime: "2026-06-27T18:00:00",
        notes: "Final night under the Sahara stars",
      },
    ],
  },
];
