import type { IPlace, IForumPost } from "@/utils/interfaces";

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

export const mockForumPosts: IForumPost[] = [
  {
    id: "1",
    title: "Hidden gems in Kyoto/Osaka?",
    contentSnippet:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",
    content:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    author: {
      id: "user1",
      username: "Elon Musk",
    },
    tags: [
      { id: "tag-japan", name: "Japan" },
      { id: "tag-food", name: "Food" },
    ],
    replyCount: 13100,
    createdAt: "2025-05-29T10:00:00Z",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d9b152c6d1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "2",
    title: "Best time to visit Iceland?",
    contentSnippet:
      "Planning a trip to see the Northern Lights. Is November too cold? Any advice on driving conditions?",
    content:
      "I really want to see the Aurora Borealis. I heard November is good but I am worried about the roads.",
    author: {
      id: "user2",
      username: "Traveler Joe",
    },
    tags: [
      { id: "tag-iceland", name: "Iceland" },
      { id: "tag-nature", name: "Nature" },
      { id: "tag-aurora", name: "Aurora" },
    ],
    replyCount: 45,
    createdAt: "2025-12-01T15:30:00Z",
    images: [
      "https://images.unsplash.com/photo-1476900543704-4312b78632f8?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "3",
    title: "Backpacking unrelated question",
    contentSnippet:
      "Just checking if this forum supports text only posts. Lorem ipsum dolor sit amet.",
    content: "Full content of the text only post.",
    author: {
      id: "user3",
      username: "Alice",
    },
    tags: [{ id: "tag-budget", name: "Budget" }],
    replyCount: 2,
    createdAt: "2025-12-02T09:00:00Z",
    replies: [],
  },
  {
    id: "4",
    title: "Remote work visas in Europe – real experiences?",
    contentSnippet:
      "I am considering applying for a digital nomad visa in Portugal or Spain. Curious about taxes and cost of living.",
    content:
      "I have been working remotely for a US company and am thinking about moving to Europe under a digital nomad visa. Portugal and Spain seem popular, but I would love to hear first-hand experiences regarding taxation, healthcare, and long-term feasibility.",
    author: {
      id: "user4",
      username: "NomadNina",
    },
    tags: [
      { id: "tag-europe", name: "Europe" },
      { id: "tag-remote", name: "Remote Work" },
      { id: "tag-visa", name: "Visa" },
    ],
    replyCount: 312,
    createdAt: "2025-12-03T11:45:00Z",
    images: [],
    replies: [],
  },
  {
    id: "5",
    title: "Beginner-friendly hiking trails in Colorado?",
    contentSnippet:
      "Looking for scenic hikes that are not too technical. Going with family, including kids.",
    content:
      "We are planning a summer trip to Colorado and want to do some hiking. Ideally trails under 5 miles with good views and minimal elevation gain. Any recommendations near Denver or Boulder?",
    author: {
      id: "user5",
      username: "OutdoorDad",
    },
    tags: [
      { id: "tag-usa", name: "USA" },
      { id: "tag-hiking", name: "Hiking" },
      { id: "tag-family", name: "Family Travel" },
    ],
    replyCount: 87,
    createdAt: "2025-12-04T08:20:00Z",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "6",
    title: "Is learning Japanese worth it for short-term travel?",
    contentSnippet:
      "I will be in Japan for about three weeks. Wondering how far English alone will get me.",
    content:
      "I am debating whether to invest time in learning basic Japanese before my trip. For those who have traveled recently, is English signage and communication sufficient, or does basic Japanese significantly improve the experience?",
    author: {
      id: "user6",
      username: "LinguaLeo",
    },
    tags: [
      { id: "tag-japan", name: "Japan" },
      { id: "tag-language", name: "Language" },
      { id: "tag-travel-tips", name: "Travel Tips" },
    ],
    replyCount: 204,
    createdAt: "2025-12-05T19:10:00Z",
    images: [],
    replies: [],
  },
  {
    id: "7",
    title: "Solo travel safety tips for South America",
    contentSnippet:
      "First time traveling solo and a bit nervous. Planning to visit Peru and Colombia.",
    content:
      "I have traveled internationally before, but never solo. This time I am planning a trip through Peru and Colombia. Any safety advice, common scams to watch out for, or cities that are particularly solo-traveler friendly?",
    author: {
      id: "user7",
      username: "WanderSafe",
    },
    tags: [
      { id: "tag-south-america", name: "South America" },
      { id: "tag-solo", name: "Solo Travel" },
      { id: "tag-safety", name: "Safety" },
    ],
    replyCount: 529,
    createdAt: "2025-12-06T13:55:00Z",
    images: [
      "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "8",
    title: "Photography gear advice for travel blogging",
    contentSnippet:
      "Trying to balance image quality with weight. Mirrorless vs compact?",
    content:
      "I am starting a travel blog and want to improve my photography. I am torn between carrying a mirrorless camera with interchangeable lenses or sticking with a high-end compact camera. Any recommendations from experienced travel photographers?",
    author: {
      id: "user8",
      username: "PixelPath",
    },
    tags: [
      { id: "tag-photography", name: "Photography" },
      { id: "tag-gear", name: "Gear" },
      { id: "tag-blogging", name: "Blogging" },
    ],
    replyCount: 64,
    createdAt: "2025-06-07T07:40:00Z",
    images: [
      "https://images.unsplash.com/photo-1519183071298-a2962be96c8a?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "9",
    title: "Jet lag recovery strategies that actually work?",
    contentSnippet:
      "Flying from Asia to Europe and struggling with sleep disruption every time.",
    content:
      "No matter how often I travel long-haul, jet lag always hits me hard. I have tried melatonin, light exposure, and caffeine control with mixed results. Curious what has genuinely worked for others.",
    author: {
      id: "user9",
      username: "SleepDeprived",
    },
    tags: [
      { id: "tag-health", name: "Health" },
      { id: "tag-jetlag", name: "Jet Lag" },
      { id: "tag-longhaul", name: "Long-Haul Travel" },
    ],
    replyCount: 18,
    createdAt: "2025-06-08T22:15:00Z",
    images: [],
    replies: [],
  },
  {
    id: "10",
    title: "Zero replies test post",
    contentSnippet:
      "This is a low-engagement post used for testing UI edge cases.",
    content:
      "Posting this to test how the system handles posts with no replies, no images, and minimal engagement.",
    author: {
      id: "user10",
      username: "QA_Tester",
    },
    tags: [{ id: "tag-meta", name: "Meta" }],
    replyCount: 0,
    createdAt: "2025-06-09T05:00:00Z",
    images: [],
    replies: [],
  },
  {
    id: "11",
    title: "Street food recommendations in Osaka",
    contentSnippet:
      "I keep hearing Osaka is the food capital of Japan. What should I absolutely not miss?",
    content:
      "I will be spending four days in Osaka and plan to eat my way through the city. Looking for street food stalls, markets, or casual spots locals love. Takoyaki and okonomiyaki are already on my list.",
    author: {
      id: "user11",
      username: "FoodTrail",
    },
    tags: [
      { id: "tag-japan", name: "Japan" },
      { id: "tag-food", name: "Food" },
    ],
    replyCount: 412,
    createdAt: "2025-06-10T12:10:00Z",
    images: [
      "https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "12",
    title: "Northern Lights without renting a car in Iceland?",
    contentSnippet:
      "Trying to avoid winter driving but still want to see the Aurora.",
    content:
      "I am visiting Iceland in late autumn and would prefer not to rent a car due to road conditions. Are guided tours from Reykjavik reliable for Aurora sightings, or is a car basically required?",
    author: {
      id: "user12",
      username: "ColdFeet",
    },
    tags: [
      { id: "tag-iceland", name: "Iceland" },
      { id: "tag-aurora", name: "Aurora" },
      { id: "tag-nature", name: "Nature" },
    ],
    replyCount: 96,
    createdAt: "2025-06-11T18:25:00Z",
    images: [],
    replies: [],
  },
  {
    id: "13",
    title: "Is backpacking Europe still affordable in 2025?",
    contentSnippet:
      "Prices seem higher than before. Wondering if budget travel is still realistic.",
    content:
      "I backpacked through Europe years ago on a tight budget. Now I am seeing higher accommodation and transport costs. Curious if people are still managing low-cost trips and what compromises are necessary.",
    author: {
      id: "user13",
      username: "EuroPack",
    },
    tags: [
      { id: "tag-europe", name: "Europe" },
      { id: "tag-budget", name: "Budget" },
    ],
    replyCount: 178,
    createdAt: "2025-06-12T09:35:00Z",
    images: [],
    replies: [],
  },
  {
    id: "14",
    title: "Traveling solo but staying connected with family",
    contentSnippet: "Any tips for balancing independence and safety check-ins?",
    content:
      "I enjoy solo travel but my family worries if they do not hear from me regularly. How do other solo travelers manage communication expectations while still enjoying freedom?",
    author: {
      id: "user14",
      username: "SoloMiles",
    },
    tags: [
      { id: "tag-solo", name: "Solo Travel" },
      { id: "tag-safety", name: "Safety" },
    ],
    replyCount: 34,
    createdAt: "2025-06-12T21:00:00Z",
    images: [],
    replies: [],
  },
  {
    id: "15",
    title: "Lightweight camera setup for long trips",
    contentSnippet:
      "Trying to minimize gear while keeping image quality decent.",
    content:
      "For those who travel long-term, what camera setups have you settled on? I am aiming to reduce weight while still being able to capture landscapes and street scenes.",
    author: {
      id: "user15",
      username: "CarryOnOnly",
    },
    tags: [
      { id: "tag-photography", name: "Photography" },
      { id: "tag-gear", name: "Gear" },
    ],
    replyCount: 59,
    createdAt: "2025-06-13T06:50:00Z",
    images: [
      "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "16",
    title: "Managing jet lag on frequent long-haul flights",
    contentSnippet:
      "Flying intercontinentally every month and feeling burned out.",
    content:
      "My job requires frequent long-haul flights, and jet lag is starting to impact my health and productivity. Looking for sustainable strategies rather than quick fixes.",
    author: {
      id: "user16",
      username: "FrequentFly",
    },
    tags: [
      { id: "tag-health", name: "Health" },
      { id: "tag-jetlag", name: "Jet Lag" },
      { id: "tag-longhaul", name: "Long-Haul Travel" },
    ],
    replyCount: 22,
    createdAt: "2025-06-13T23:30:00Z",
    images: [],
    replies: [],
  },
  {
    id: "17",
    title: "Remote work while traveling the US national parks",
    contentSnippet:
      "Combining hiking with remote work. Curious about connectivity.",
    content:
      "I am planning a road trip across the US with stops near national parks. Has anyone successfully balanced remote work with hiking? Concerned about internet reliability and time management.",
    author: {
      id: "user17",
      username: "TrailLaptop",
    },
    tags: [
      { id: "tag-usa", name: "USA" },
      { id: "tag-remote", name: "Remote Work" },
      { id: "tag-hiking", name: "Hiking" },
    ],
    replyCount: 141,
    createdAt: "2025-06-14T14:15:00Z",
    images: [],
    replies: [],
  },
  {
    id: "18",
    title: "Meta: How are reply counts calculated?",
    contentSnippet: "Noticing some posts have very high engagement numbers.",
    content:
      "Out of curiosity, does the reply count include nested replies or only top-level responses? Just trying to understand how engagement is measured on this platform.",
    author: {
      id: "user18",
      username: "CuriousMind",
    },
    tags: [{ id: "tag-meta", name: "Meta" }],
    replyCount: 5,
    createdAt: "2025-06-15T10:05:00Z",
    images: [],
    replies: [],
  },
  {
    id: "19",
    title: "First impressions of Hanoi street life",
    contentSnippet:
      "The traffic, the food, the noise — it was overwhelming at first but fascinating.",
    content:
      "Landing in Hanoi was a sensory overload. Crossing the street felt like a skill to master, but the street food culture and energy quickly won me over. Curious how others adjusted during their first few days.",
    author: {
      id: "user19",
      username: "UrbanNomad",
    },
    tags: [
      { id: "tag-food", name: "Food" },
      { id: "tag-travel-tips", name: "Travel Tips" },
    ],
    replyCount: 156,
    createdAt: "2025-06-16T09:10:00Z",
    images: [
      "https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "20",
    title: "Is Vietnam still a top budget travel destination?",
    contentSnippet: "Comparing costs from my last visit a decade ago.",
    content:
      "I traveled through Vietnam years ago on a very small daily budget. For those who have visited recently, how affordable is accommodation, food, and transport now compared to the past?",
    author: {
      id: "user20",
      username: "OldBackpacker",
    },
    tags: [{ id: "tag-budget", name: "Budget" }],
    replyCount: 243,
    createdAt: "2025-06-16T14:40:00Z",
    images: [],
    replies: [],
  },
  {
    id: "21",
    title: "Motorbike travel from Hue to Hoi An",
    contentSnippet: "One of the most scenic rides I have ever done.",
    content:
      "Riding a motorbike over the Hai Van Pass was a highlight of my Vietnam trip. The views were incredible, but weather and road conditions mattered a lot. Sharing my experience and curious to hear others’ tips.",
    author: {
      id: "user21",
      username: "TwoWheels",
    },
    tags: [
      { id: "tag-nature", name: "Nature" },
      { id: "tag-safety", name: "Safety" },
    ],
    replyCount: 98,
    createdAt: "2025-06-17T07:55:00Z",
    images: [
      "https://images.unsplash.com/photo-1504788363733-507549153474?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "22",
    title: "Solo travel experience in Ho Chi Minh City",
    contentSnippet:
      "Fast-paced, chaotic, but surprisingly easy to navigate alone.",
    content:
      "I spent a week solo in Ho Chi Minh City and felt safe overall, though it took time to adapt to the traffic and pace. Happy to share lessons learned and hear how others found solo travel there.",
    author: {
      id: "user22",
      username: "CitySolo",
    },
    tags: [
      { id: "tag-solo", name: "Solo Travel" },
      { id: "tag-safety", name: "Safety" },
    ],
    replyCount: 121,
    createdAt: "2025-06-17T18:30:00Z",
    images: [],
    replies: [],
  },
  {
    id: "23",
    title: "Vietnamese food I miss the most after leaving",
    contentSnippet:
      "Pho, bun cha, banh mi — but also many lesser-known dishes.",
    content:
      "After returning home, I realized how much I miss everyday meals in Vietnam. Beyond the famous dishes, there were regional foods that really stood out. What meals left the biggest impression on you?",
    author: {
      id: "user23",
      username: "TasteMemory",
    },
    tags: [{ id: "tag-food", name: "Food" }],
    replyCount: 305,
    createdAt: "2025-06-18T11:20:00Z",
    images: [
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "24",
    title: "Ha Long Bay vs Ninh Binh experience",
    contentSnippet: "Both beautiful, but very different travel vibes.",
    content:
      "I visited both Ha Long Bay and Ninh Binh on my Vietnam trip. One felt more touristic, the other more peaceful. Sharing a comparison in case others are deciding between the two.",
    author: {
      id: "user24",
      username: "SlowExplorer",
    },
    tags: [
      { id: "tag-nature", name: "Nature" },
      { id: "tag-photography", name: "Photography" },
    ],
    replyCount: 187,
    createdAt: "2025-06-18T16:45:00Z",
    images: [
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=900&q=80",
    ],
    replies: [],
  },
  {
    id: "25",
    title: "Language barrier experiences in rural Vietnam",
    contentSnippet: "Minimal English, but communication still happened.",
    content:
      "Outside major cities, English was limited, but gestures and patience went a long way. Sharing a few memorable interactions and wondering how others handled language challenges.",
    author: {
      id: "user25",
      username: "HandsAndSmiles",
    },
    tags: [{ id: "tag-language", name: "Language" }],
    replyCount: 64,
    createdAt: "2025-06-19T08:05:00Z",
    images: [],
    replies: [],
  },
  {
    id: "26",
    title: "Working remotely from cafes in Da Nang",
    contentSnippet: "Surprisingly productive with the right setup.",
    content:
      "I spent a month in Da Nang working remotely. Internet quality was generally solid, and the cafe culture made it easy to settle into a routine. Happy to answer questions about my setup.",
    author: {
      id: "user26",
      username: "BeachWiFi",
    },
    tags: [{ id: "tag-remote", name: "Remote Work" }],
    replyCount: 211,
    createdAt: "2025-06-19T13:50:00Z",
    images: [],
    replies: [],
  },
  {
    id: "27",
    title: "Overnight trains in Vietnam – worth the experience?",
    contentSnippet: "Not luxurious, but memorable in its own way.",
    content:
      "I took multiple overnight trains while traveling north to south. Sleep was hit or miss, but it saved time and money. Curious how others rate this experience.",
    author: {
      id: "user27",
      username: "RailMiles",
    },
    tags: [
      { id: "tag-budget", name: "Budget" },
      { id: "tag-travel-tips", name: "Travel Tips" },
    ],
    replyCount: 89,
    createdAt: "2025-06-20T06:30:00Z",
    images: [],
    replies: [],
  },
  {
    id: "28",
    title: "What surprised me most about traveling Vietnam",
    contentSnippet: "Kindness, resilience, and everyday hospitality.",
    content:
      "I expected great food and scenery, but what stayed with me most was the generosity of people I met along the way. Sharing a few moments that reshaped my expectations of travel.",
    author: {
      id: "user28",
      username: "OpenRoad",
    },
    tags: [
      { id: "tag-solo", name: "Solo Travel" },
      { id: "tag-travel-tips", name: "Travel Tips" },
    ],
    replyCount: 267,
    createdAt: "2025-06-20T20:10:00Z",
    images: [],
    replies: [],
  },
];

// Mock replies for forum posts - used for paginated replies on post detail view
export const mockForumReplies: Record<
  string,
  import("@/utils/interfaces").IForumReply[]
> = {
  "1": [
    {
      id: "reply-1",
      content:
        "This is such a great question! I visited Kyoto last spring and found some amazing hidden spots. The Philosopher's Path early in the morning is magical - barely any tourists and the cherry blossoms were incredible.",
      user: {
        id: "user101",
        username: "SakuraLover",
        avatarUrl:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=SakuraLover",
      },
      createdAt: "2025-05-30T08:15:00Z",
      likeCount: 42,
    },
    {
      id: "reply-2",
      content:
        "Don't miss Fushimi Inari at night! Most tourists leave by sunset, but the shrine is actually open 24/7. Walking through the torii gates with just lantern light is an unforgettable experience.",
      user: {
        id: "user102",
        username: "NightOwlTraveler",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=NightOwl",
      },
      createdAt: "2025-05-30T14:22:00Z",
      likeCount: 89,
    },
    {
      id: "reply-3",
      content:
        "For Osaka, I highly recommend the Shinsekai district. It feels like stepping back in time - amazing kushikatsu and a completely different vibe from the modern city.",
      user: {
        id: "user103",
        username: "FoodieExplorer",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Foodie",
      },
      createdAt: "2025-05-31T09:45:00Z",
      likeCount: 67,
    },
    {
      id: "reply-4",
      content:
        "If you're into traditional crafts, check out the Nishijin Textile Center in Kyoto. They have beautiful kimono demonstrations and you can even try weaving yourself!",
      user: {
        id: "user104",
        username: "CraftHunter",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Craft",
      },
      createdAt: "2025-06-01T11:30:00Z",
      likeCount: 34,
    },
    {
      id: "reply-5",
      content:
        "The Arashiyama Bamboo Grove is famous but overcrowded. Instead, try Sagano for similar vibes with way fewer people. The whole area is perfect for cycling!",
      user: {
        id: "user105",
        username: "BicycleBob",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
      createdAt: "2025-06-02T16:00:00Z",
      likeCount: 156,
    },
    {
      id: "reply-6",
      content:
        "Totally agree with @BicycleBob! Renting a bike in Kyoto is the best way to explore. The city is very bike-friendly and you can cover so much more ground.",
      user: {
        id: "user106",
        username: "PedalPower",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedal",
      },
      createdAt: "2025-06-02T18:45:00Z",
      parentReplyId: "reply-5",
      likeCount: 23,
    },
    {
      id: "reply-7",
      content:
        "For authentic Japanese breakfast, find a local kissaten (traditional coffee shop). They serve thick toast with butter and serve amazing coffee in a retro atmosphere.",
      user: {
        id: "user107",
        username: "MorningCoffee",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Coffee",
      },
      createdAt: "2025-06-03T07:00:00Z",
      likeCount: 45,
    },
    {
      id: "reply-8",
      content:
        "Osaka Castle Park is beautiful, especially during cherry blossom season. But the real gem is the Nishinomaru Garden next to it - much more peaceful.",
      user: {
        id: "user108",
        username: "ParkWanderer",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Park",
      },
      createdAt: "2025-06-04T14:20:00Z",
      likeCount: 78,
    },
    {
      id: "reply-9",
      content:
        "Has anyone tried the local craft beer scene? I found some amazing microbreweries in Osaka that weren't in any guidebook!",
      user: {
        id: "user109",
        username: "CraftBeerFan",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beer",
      },
      createdAt: "2025-06-05T20:30:00Z",
      likeCount: 31,
    },
    {
      id: "reply-10",
      content:
        "The Gion district at dusk is magical. You might even spot a geisha heading to an appointment. Just remember to be respectful and not chase them for photos!",
      user: {
        id: "user110",
        username: "RespectfulTraveler",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Respect",
      },
      createdAt: "2025-06-06T17:45:00Z",
      likeCount: 112,
    },
    {
      id: "reply-11",
      content:
        "Pro tip: Get a JR Pass if you're planning to visit both cities. The shinkansen is incredibly convenient and scenic!",
      user: {
        id: "user111",
        username: "TrainEnthusiast",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Train",
      },
      createdAt: "2025-06-07T09:00:00Z",
      likeCount: 203,
    },
    {
      id: "reply-12",
      content:
        "Kurama Onsen is a hidden gem north of Kyoto. Natural hot springs in the mountains with incredible views. The hike there is beautiful too!",
      user: {
        id: "user112",
        username: "OnsenLover",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Onsen",
      },
      createdAt: "2025-06-08T11:30:00Z",
      likeCount: 88,
    },
  ],
};
