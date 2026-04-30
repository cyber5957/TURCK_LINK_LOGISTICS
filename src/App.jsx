import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import CountUp from "react-countup";
import QRCode from "qrcode";
import translations from "./translations";
import { authAPI, truckAPI, bookingAPI, ownerAPI, customerAPI } from "./api";
import introVideo from "../first page .mp4";
import introAudio from "../forza_horizon_5_menu.mp3";

const services = [
  "Open truck",
  "Container",
  "Cold chain",
  "Express delivery",
];

const heroEssentials = [
  {
    title: "Pan-India coverage",
    text: "Support for intercity, regional, and long-haul freight movements.",
  },
  {
    title: "Transparent booking flow",
    text: "Compare trucks, estimated pricing, and service quality before you commit.",
  },
  {
    title: "Built for trust",
    text: "Verified partners, customer reviews, and guided booking steps reduce uncertainty.",
  },
];

const locationCatalog = [
  { key: "Andhra Pradesh", lat: 15.9129, lng: 79.74, cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada"] },
  { key: "Arunachal Pradesh", lat: 28.218, lng: 94.7278, cities: ["Itanagar", "Naharlagun", "Tawang", "Ziro", "Pasighat", "Bomdila", "Roing", "Tezu"] },
  { key: "Assam", lat: 26.2006, lng: 92.9376, cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur", "Tinsukia", "Sivasagar"] },
  { key: "Bihar", lat: 25.0961, lng: 85.3131, cities: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Ara", "Begusarai"] },
  { key: "Chhattisgarh", lat: 21.2787, lng: 81.8661, cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Raigarh", "Jagdalpur", "Ambikapur"] },
  { key: "Goa", lat: 15.2993, lng: 74.124, cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Canacona"] },
  { key: "Gujarat", lat: 22.2587, lng: 71.1924, cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"] },
  { key: "Haryana", lat: 29.0588, lng: 76.0856, cities: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Rohtak", "Sonipat"] },
  { key: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, cities: ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur", "Bilaspur", "Chamba"] },
  { key: "Jharkhand", lat: 23.6102, lng: 85.2799, cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh"] },
  { key: "Karnataka", lat: 15.3173, lng: 75.7139, cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi", "Shivamogga", "Ballari"] },
  { key: "Kerala", lat: 10.8505, lng: 76.2711, cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad"] },
  { key: "Madhya Pradesh", lat: 22.9734, lng: 78.6569, cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna"] },
  { key: "Maharashtra", lat: 19.7515, lng: 75.7139, cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur", "Solapur"] },
  { key: "Manipur", lat: 24.6637, lng: 93.9063, cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul", "Senapati", "Kakching", "Tamenglong"] },
  { key: "Meghalaya", lat: 25.467, lng: 91.3662, cities: ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara", "Williamnagar", "Mairang", "Resubelpara"] },
  { key: "Mizoram", lat: 23.1645, lng: 92.9376, cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Lawngtlai", "Mamit"] },
  { key: "Nagaland", lat: 26.1584, lng: 94.5624, cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Phek", "Zunheboto"] },
  { key: "Odisha", lat: 20.9517, lng: 85.0985, cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri", "Berhampur", "Balasore", "Jharsuguda"] },
  { key: "Punjab", lat: 31.1471, lng: 75.3412, cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"] },
  { key: "Rajasthan", lat: 27.0238, lng: 74.2179, cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur"] },
  { key: "Sikkim", lat: 27.533, lng: 88.5122, cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Singtam", "Rangpo", "Jorethang", "Pakyong"] },
  { key: "Tamil Nadu", lat: 11.1271, lng: 78.6569, cities: ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tiruppur", "Vellore", "Thoothukudi"] },
  { key: "Telangana", lat: 18.1124, lng: 79.0193, cities: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam", "Mahbubnagar", "Ramagundam", "Suryapet"] },
  { key: "Tripura", lat: 23.9408, lng: 91.9882, cities: ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia", "Khowai", "Ambassa", "Teliamura"] },
  { key: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, cities: ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj", "Meerut"] },
  { key: "Uttarakhand", lat: 30.0668, lng: 79.0193, cities: ["Dehradun", "Haridwar", "Haldwani", "Rishikesh", "Roorkee", "Kashipur", "Rudrapur", "Almora"] },
  { key: "West Bengal", lat: 22.9868, lng: 87.855, cities: ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Kharagpur", "Haldia", "Darjeeling"] },
  { key: "Andaman and Nicobar Islands", lat: 11.7401, lng: 92.6586, cities: ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Hut Bay", "Car Nicobar", "Bambooflat", "Kamorta"] },
  { key: "Chandigarh", lat: 30.7333, lng: 76.7794, cities: ["Chandigarh"] },
  { key: "Dadra and Nagar Haveli and Daman and Diu", lat: 20.1809, lng: 73.0169, cities: ["Daman", "Diu", "Silvassa", "Dadra", "Naroli", "Vapi"] },
  { key: "Delhi", lat: 28.7041, lng: 77.1025, cities: ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Connaught Place", "Janakpuri", "Pitampura"] },
  { key: "Jammu and Kashmir", lat: 33.7782, lng: 76.5762, cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Udhampur", "Kathua", "Pulwama"] },
  { key: "Ladakh", lat: 34.1526, lng: 77.5771, cities: ["Leh", "Kargil", "Diskit", "Nubra", "Zanskar", "Drass"] },
  { key: "Lakshadweep", lat: 10.5667, lng: 72.6417, cities: ["Kavaratti", "Agatti", "Amini", "Andrott", "Kalpeni", "Minicoy"] },
  { key: "Puducherry", lat: 11.9416, lng: 79.8083, cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Oulgaret", "Villianur"] },
];

const states = locationCatalog.map(({ key, cities }) => ({
  key,
  label: key,
  cities,
  matches: [key.toLowerCase(), ...cities.map((city) => city.toLowerCase())],
}));

const stateLocations = Object.fromEntries(
  locationCatalog.map(({ key, lat, lng }) => [key, { lat, lng }])
);

const bookingStorageKeys = {
  draft: "trucklink-booking-draft",
  confirmation: "trucklink-booking-confirmation",
};

const introStorageKey = "trucklink-intro-dismissed";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getStateSuggestions(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return states;
  }

  return states.filter((state) =>
    state.matches.some((term) => term.includes(normalizedQuery))
  );
}

function getCitySuggestions(stateKey, query) {
  const activeState = states.find((state) => state.key === stateKey);
  const normalizedQuery = normalizeText(query);

  if (!activeState) {
    return [];
  }

  if (!normalizedQuery) {
    return activeState.cities;
  }

  return activeState.cities.filter((city) =>
    normalizeText(city).includes(normalizedQuery)
  );
}

function formatPrice(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function getAvailabilityText(listing) {
  if (!listing.availability) {
    return "Booked";
  }

  return listing.verified ? "Ready for dispatch" : "Limited availability";
}

function getEtaLabel(basePrice, flow) {
  if (flow === "Instant booking") {
    return basePrice > 25000 ? "Pickup in 3-5 hrs" : "Pickup in 60-90 mins";
  }

  if (flow === "Enterprise contract") {
    return "Dedicated fleet scheduling";
  }

  return "Pickup slot available tomorrow";
}

function getTrustHighlights(listing) {
  return [
    listing.verified ? "KYC verified owner" : "Profile under review",
    `${listing.reviewCount || 0}+ booking-backed reviews`,
    listing.rating >= 4.5 ? "High on-time delivery confidence" : "Competitive route pricing",
  ];
}

function getRecommendationBadge(listing) {
  if (listing.verified && (listing.rating || 0) >= 4.7) {
    return "Top Rated";
  }

  if ((listing.basePrice || 0) <= 16000) {
    return "Best Value";
  }

  if ((listing.reviewCount || 0) >= 12) {
    return "Popular Choice";
  }

  return "Fast Pickup";
}

function createBookingDraft(listing, flow, selectedState, selectedCity) {
  return {
    truckId: listing._id,
    truckType: listing.truckType,
    capacity: listing.capacity,
    providerName: listing.owner?.name || "Unknown Owner",
    route: listing.route,
    basePrice: listing.basePrice,
    verified: listing.verified,
    reviewCount: listing.reviewCount || 0,
    rating: listing.rating || 0,
    state: selectedState,
    city: selectedCity,
    flow,
  };
}

function LoadingCard() {
  return (
    <article className="listing-card loading-card" aria-hidden="true">
      <div className="loading-line loading-line-title" />
      <div className="loading-chip-row">
        <span className="loading-chip" />
        <span className="loading-chip" />
        <span className="loading-chip" />
      </div>
      <div className="loading-line" />
      <div className="loading-line loading-line-short" />
    </article>
  );
}

function SearchableSelector({
  label,
  placeholder,
  value,
  query,
  onQueryChange,
  options,
  onSelect,
  emptyMessage,
}) {
  return (
    <div className="field-group searchable-field">
      <span>{label}</span>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
      />
      <div className="search-results" role="listbox" aria-label={label}>
        {options.length > 0 ? (
          options.map((option) => (
            <button
              key={option}
              type="button"
              className={value === option ? "search-option active" : "search-option"}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))
        ) : (
          <div className="search-empty">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}

function IntroOverlay({ onEnter }) {
  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = 0.38;
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (!soundEnabled) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }

    audioRef.current.play().catch(() => {
      setSoundEnabled(false);
    });
  }, [soundEnabled]);

  return (
    <section className="intro-overlay" aria-label="TruckLink intro">
      <video
        className="intro-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={introVideo} type="video/mp4" />
      </video>
      <audio ref={audioRef} autoPlay loop preload="auto">
        <source src={introAudio} type="audio/mpeg" />
      </audio>
      <div className="intro-scrim" />
      <div className="intro-content">
        <div className="intro-topbar">
          <button
            type="button"
            className={soundEnabled ? "intro-sound-button active" : "intro-sound-button"}
            onClick={() => setSoundEnabled((current) => !current)}
          >
            {soundEnabled ? "Sound On" : "Tap For Sound"}
          </button>
        </div>
        <p className="intro-kicker">TruckLink Logistics</p>
        <h1>Freight moves fast. Your booking flow should too.</h1>
        <button
          type="button"
          className="intro-enter"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            onEnter();
          }}
        >
          Open TruckLink
        </button>
      </div>
    </section>
  );
}

function MfaQrCode({ value }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;

    if (!value) {
      setSrc("");
      return () => {
        active = false;
      };
    }

    QRCode.toDataURL(value, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (active) {
          setSrc(dataUrl);
        }
      })
      .catch(() => {
        if (active) {
          setSrc("");
        }
      });

    return () => {
      active = false;
    };
  }, [value]);

  if (!src) {
    return null;
  }

  return (
    <img
      className="mfa-qr-image"
      src={src}
      alt="QR code for MFA setup"
    />
  );
}

const trustStats = [
  { value: "12k+", label: "monthly delivery requests compared" },
  { value: "900+", label: "verified transport partners onboarded" },
  { value: "98.2%", label: "bookings completed without pricing disputes" },
];

const features = [
  {
    title: "Full truckload transport",
    description:
      "Move bulk and commercial shipments with dedicated truck capacity for intercity and regional routes.",
    supporting: "Best for heavy loads, factory dispatches, and wholesale movement.",
  },
  {
    title: "Container movement",
    description:
      "Support container-based freight that needs safer enclosure, route discipline, and predictable handling.",
    supporting: "Useful for electronics, packaged goods, and higher-value cargo.",
  },
  {
    title: "Cold chain logistics",
    description:
      "Handle temperature-sensitive shipments with truck options suited for food, pharma, and perishables.",
    supporting: "Designed for cargo where timing and controlled conditions both matter.",
  },
  {
    title: "Express and urgent dispatch",
    description:
      "Find faster truck availability for shipments that need same-day pickup or tighter turnaround windows.",
    supporting: "Strong fit for emergency replenishment and time-critical stock movement.",
  },
  {
    title: "Warehouse-linked distribution",
    description:
      "Support last-mile and secondary distribution legs for businesses moving stock from hubs to stores or clients.",
    supporting: "Helpful for retail, FMCG, and multi-drop supply runs.",
  },
  {
    title: "Enterprise logistics support",
    description:
      "Create repeat booking flows for businesses that need recurring transport, preferred pricing, and account continuity.",
    supporting: "Built for companies shipping regularly across fixed lanes.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us the load",
    text: "Choose route, weight, cargo type, pickup timing, and any special handling needs.",
  },
  {
    number: "02",
    title: "Compare trusted providers",
    text: "Review service quality, estimated prices, ratings, and security signals in one clear flow.",
  },
  {
    number: "03",
    title: "Book with confidence",
    text: "Confirm the best option and continue into the dedicated booking experience on the next page.",
  },
];

const testimonials = [
  {
    quote:
      "Before this, finding a refrigerated truck at a fair rate took hours. Here we could compare options in one place.",
    name: "Riya Sharma",
    role: "Food Distributor",
  },
  {
    quote:
      "The review-led matching flow makes this feel trustworthy. It saves back-and-forth calls with random brokers.",
    name: "Arjun Mehta",
    role: "Retail Supply Manager",
  },
];

const bookingOptions = [
  {
    title: "Instant booking",
    text: "Best for urgent shipments where customers want quick truck confirmation and estimated pricing immediately.",
    meta: "Fastest option",
  },
  {
    title: "Scheduled booking",
    text: "Useful for planned dispatches where pickup date, route timing, and service type are decided in advance.",
    meta: "For planned delivery",
  },
  {
    title: "Enterprise contract",
    text: "For businesses that move goods regularly and need recurring bookings, preferred pricing, and account support.",
    meta: "For repeat customers",
  },
];

const ownerBenefits = [
  {
    title: "Verified leads, less dead mileage",
    text: "Customer requests arrive with route, timing, and shipment intent already structured for faster decisions.",
  },
  {
    title: "Faster quote wins",
    text: "Owners who respond quickly with clear pricing and trust signals get surfaced as stronger matches.",
  },
  {
    title: "A profile that actually converts",
    text: "Ratings, KYC verification, and route visibility help quality fleets stand out without constant follow-up calls.",
  },
];

const ownerSignals = [
  { label: "Active demand lanes", value: "Delhi -> Jaipur, Mumbai -> Pune, Hyderabad -> Vijayawada" },
  { label: "Target callback speed", value: "Under 15 minutes for urgent bookings" },
  { label: "Best fit fleets", value: "Verified owners with 3 to 20 trucks" },
];

const coverageStats = [
  { value: `${locationCatalog.length}`, label: "states and union territories covered" },
  {
    value: `${locationCatalog.reduce((total, item) => total + item.cities.length, 0)}+`,
    label: "cities mapped for booking discovery",
  },
  { value: "24/7", label: "request intake for urgent and scheduled loads" },
];

const majorCorridors = [
  "Delhi to Jaipur",
  "Mumbai to Pune",
  "Hyderabad to Vijayawada",
  "Bengaluru to Mysuru",
  "Chennai to Coimbatore",
  "Kolkata to Durgapur",
];

const serviceIndustries = [
  "Retail and FMCG",
  "Manufacturing",
  "Food and perishables",
  "Pharmaceutical supply",
  "E-commerce replenishment",
  "Electronics and packaged goods",
];

const trustSignals = [
  { value: "8+", label: "years supporting freight movement" },
  { value: "18k+", label: "shipment requests assisted across the platform" },
  { value: "650+", label: "business clients and transport partners served" },
  { value: "36", label: "states and union territories in service coverage" },
];

const certifications = [
  "KYC-verified transport partners",
  "Documentation-first dispatch process",
  "Audit-ready booking records",
  "Safety and compliance operating checklist",
];

const partnerLogos = [
  "Retail Chain",
  "Pharma Network",
  "Manufacturing Group",
  "FMCG Distributor",
  "E-commerce Fulfillment",
  "Auto Components",
];

const aboutHighlights = [
  {
    title: "Who we are",
    text: "TruckLink is a logistics and truck-booking platform built to connect shippers with trusted transport capacity through a clearer, faster digital workflow.",
  },
  {
    title: "Mission and values",
    text: "We focus on reliability, transparency, operational discipline, and service quality so freight decisions feel less risky and more efficient.",
  },
  {
    title: "Safety and reliability",
    text: "Verified partners, booking records, route visibility, and structured communication help reduce uncertainty during dispatch and delivery.",
  },
  {
    title: "Company story",
    text: "The product direction is built around a simple idea: logistics booking should feel more professional, modern, and trustworthy for both customers and fleet owners.",
  },
];

const contactChannels = [
  { label: "Phone", value: "+91 98765 43210" },
  { label: "Email", value: "operations@trucklinklogistics.com" },
  { label: "Office", value: "Sector 62, Noida, Uttar Pradesh, India" },
  { label: "WhatsApp", value: "+91 98765 43210" },
  { label: "Business hours", value: "Mon-Sat, 8:00 AM to 8:00 PM" },
];

const listings = [
  {
    id: 1,
    provider: "NorthLine Freight Co.",
    truck: "14 ft Open Truck",
    route: "Delhi to Jaipur",
    cargo: "General goods",
    service: "Express delivery",
    rating: 4.8,
    reviews: 214,
    price: 18400,
    eta: "Same day pickup",
    verified: true,
    availability: "2 trucks available",
  },
  {
    id: 2,
    provider: "Polar Mile Logistics",
    truck: "Cold Chain Carrier",
    route: "Noida to Chandigarh",
    cargo: "Perishable cargo",
    service: "Cold chain",
    rating: 4.9,
    reviews: 163,
    price: 26700,
    eta: "Pickup in 4 hrs",
    verified: true,
    availability: "1 truck available",
  },
  {
    id: 3,
    provider: "MetroHaul Network",
    truck: "20 ft Container Truck",
    route: "Mumbai to Pune",
    cargo: "Electronics",
    service: "Container",
    rating: 4.6,
    reviews: 289,
    price: 22300,
    eta: "Next morning",
    verified: true,
    availability: "4 trucks available",
  },
  {
    id: 4,
    provider: "Budget Axle Movers",
    truck: "10 ft Mini Truck",
    route: "Bengaluru to Mysuru",
    cargo: "Light retail stock",
    service: "Open truck",
    rating: 4.3,
    reviews: 121,
    price: 9800,
    eta: "Pickup in 2 hrs",
    verified: false,
    availability: "3 trucks available",
  },
  {
    id: 5,
    provider: "SwiftCargo Fleet",
    truck: "17 ft Closed Body Truck",
    route: "Hyderabad to Vijayawada",
    cargo: "High-value goods",
    service: "Express delivery",
    rating: 4.7,
    reviews: 198,
    price: 19400,
    eta: "Today evening",
    verified: true,
    availability: "2 trucks available",
  },
];

const maxListingPrice = Math.max(...listings.map((listing) => listing.price));

const assistantPrompts = [
  "How do I book a truck?",
  "How is pricing calculated?",
  "I am a truck owner. What should I do?",
  "How do I find verified providers?",
];

const navItems = [
  { label: "Services", sectionId: "services" },
  { label: "How it works", sectionId: "workflow" },
  { label: "Booking", sectionId: "booking" },
  { label: "Reviews", sectionId: "reviews" },
  { label: "Security", sectionId: "security" },
];

function isAppRoute(hashValue) {
  return hashValue.startsWith("#/");
}

function getRouteFromHash() {
  if (!isAppRoute(window.location.hash)) {
    return { path: "/", params: new URLSearchParams() };
  }

  const rawHash = window.location.hash.replace(/^#/, "");

  if (!rawHash || rawHash === "/") {
    return { path: "/", params: new URLSearchParams() };
  }

  const [path, queryString = ""] = rawHash.split("?");

  return {
    path,
    params: new URLSearchParams(queryString),
  };
}

function goToHash(path, params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  window.location.hash = query ? `${path}?${query}` : path;
}

function goToSection(sectionId) {
  if (window.location.hash && !isAppRoute(window.location.hash)) {
    const currentHash = window.location.hash.replace(/^#/, "");

    if (currentHash === sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
  }

  window.location.hash = sectionId;

  window.setTimeout(() => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 40);
}

function getAssistantWelcomeMessage(pageContext) {
  if (pageContext === "truck-finder") {
    return "I am TruckMate. I can guide you through routes, pricing, and verified truck options on this page.";
  }

  if (pageContext === "auth") {
    return "I am TruckMate. I can help you choose between user and owner login or signup.";
  }

  return "I am TruckMate. I can guide users through booking, pricing, truck search, and owner onboarding.";
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}

function HeroFreightScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="hero-scene__aura hero-scene__aura--amber" />
      <div className="hero-scene__aura hero-scene__aura--teal" />
      <div className="hero-scene__floor" />
      <div className="hero-scene__lane hero-scene__lane--one" />
      <div className="hero-scene__lane hero-scene__lane--two" />

      <div className="hero-scene__truck">
        <div className="hero-scene__truck-body" />
        <div className="hero-scene__truck-cabin" />
        <div className="hero-scene__truck-glow" />
        <span className="hero-scene__wheel hero-scene__wheel--front" />
        <span className="hero-scene__wheel hero-scene__wheel--rear" />
      </div>
    </div>
  );
}

function CoverageMapExplorer() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const stateMarkersRef = useRef([]);
  const deferredStateQuery = useDeferredValue(stateQuery);
  const deferredCityQuery = useDeferredValue(cityQuery);
  const visibleStates = useMemo(
    () => getStateSuggestions(deferredStateQuery),
    [deferredStateQuery]
  );
  const visibleCities = useMemo(
    () => getCitySuggestions(selectedState, deferredCityQuery),
    [selectedState, deferredCityQuery]
  );

  function handleStateSelection(stateKey) {
    setSelectedState(stateKey);
    setSelectedCity("");
    setStateQuery(stateKey);
    setCityQuery("");
    setError("");
  }

  function handleCitySelection(city) {
    setSelectedCity(city);
    setCityQuery(city);
    setError("");
  }

  useEffect(() => {
    let isMounted = true;
    let mapInstance = null;

    const loadMap = async () => {
      if (!mapRef.current) {
        return;
      }

      try {
        const [{ default: L }] = await Promise.all([
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);

        if (!isMounted || !mapRef.current || mapRef.current._leaflet_id) {
          return;
        }

        mapInstance = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([22.5937, 78.9629], 5);

        leafletMapRef.current = mapInstance;

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        stateMarkersRef.current = states.map((state) => {
          const location = stateLocations[state.key];
          const marker = L.circleMarker([location.lat, location.lng], {
            radius: 6,
            weight: 1.5,
            color: "#0b3f56",
            fillColor: "#ff9f1c",
            fillOpacity: 0.82,
          })
            .addTo(mapInstance)
            .bindTooltip(state.label, {
              direction: "top",
              offset: [0, -8],
            });

          marker.on("click", () => {
            handleStateSelection(state.key);
            marker.openTooltip();
          });

          return { key: state.key, marker, location };
        });
      } catch (loadError) {
        console.error("Error loading coverage map:", loadError);
        if (isMounted) {
          setError("Map preview is unavailable right now. You can still choose a state below.");
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      stateMarkersRef.current = [];
      leafletMapRef.current = null;
      mapInstance?.remove();
    };
  }, []);

  useEffect(() => {
    stateMarkersRef.current.forEach(({ key, marker, location }) => {
      const isActive = key === selectedState;

      marker.setStyle({
        radius: isActive ? 9 : 6,
        color: isActive ? "#168aad" : "#0b3f56",
        fillColor: isActive ? "#168aad" : "#ff9f1c",
        fillOpacity: isActive ? 0.96 : 0.82,
      });

      if (isActive) {
        marker.openTooltip();
        leafletMapRef.current?.flyTo([location.lat, location.lng], 6, {
          duration: 0.6,
        });
      }
    });
  }, [selectedState]);

  function handleContinue() {
    if (!selectedState || !selectedCity) {
      setError("Please choose both a state and city to continue.");
      return;
    }

    goToHash("/truck-finder", {
      flow: "Scheduled booking",
      state: selectedState,
      city: selectedCity,
    });
  }

  return (
    <div className="coverage-map-shell map-selection-grid">
      <article className="india-map-card coverage-interactive-card">
        <div className="map-card-header">
          <span className="badge warm">Live coverage focus</span>
          <h4>India freight lanes</h4>
        </div>
        <div className="india-map-canvas coverage-map-canvas" ref={mapRef} />
        <div className="map-hint">
          <p>Pick a state on the map to preview supported cities and open the truck finder with that region preloaded.</p>
        </div>
        <div className="state-chip-row">
          {visibleStates.map((state) => (
            <button
              key={state.key}
              type="button"
              className={`state-chip ${selectedState === state.key ? "active" : ""}`}
              onClick={() => handleStateSelection(state.key)}
            >
              {state.label}
            </button>
          ))}
        </div>
      </article>

      <aside className="city-panel coverage-city-panel">
        <div className="panel-header">
          <span className="badge neutral">Priority dispatch corridors</span>
          <h4>{selectedState ? `Cities in ${selectedState}` : "Pick a state first"}</h4>
        </div>

        <p>
          {selectedState
            ? "Choose the city you want to start from. We will open the truck finder with route discovery ready for that region."
            : "Use the map or state list to reveal the cities currently supported in this coverage view."}
        </p>

        <SearchableSelector
          label="Search state"
          placeholder="Type a state or union territory"
          value={selectedState}
          query={stateQuery}
          onQueryChange={setStateQuery}
          options={visibleStates.map((state) => state.key)}
          onSelect={handleStateSelection}
          emptyMessage="No matching state found."
        />

        <SearchableSelector
          label="Search city"
          placeholder={selectedState ? "Type a city" : "Select a state first"}
          value={selectedCity}
          query={cityQuery}
          onQueryChange={setCityQuery}
          options={visibleCities}
          onSelect={handleCitySelection}
          emptyMessage={selectedState ? "No matching city found." : "Choose a state to load cities."}
        />

        {selectedState && visibleCities.length > 0 && (
          <div className="city-grid coverage-city-grid">
            {visibleCities.map((city) => (
              <button
                key={city}
                type="button"
                className={`city-chip ${selectedCity === city ? "active" : ""}`}
                onClick={() => handleCitySelection(city)}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {error && <p className="field-error">{error}</p>}

        <button type="button" className="btn btn-primary full-width" onClick={handleContinue}>
          Open truck finder for this route
        </button>
      </aside>
    </div>
  );
}

function getAssistantIntent(message) {
  const text = message.toLowerCase();

  if (
    text.includes("book a truck") ||
    text.includes("book truck") ||
    text.includes("want to book") ||
    text.includes("booking")
  ) {
    return {
      route: "/truck-finder",
      params: { flow: "Instant booking" },
      label: "booking page",
    };
  }

  if (
    text.includes("owner") ||
    text.includes("provider") ||
    text.includes("connect my truck") ||
    text.includes("connect truck") ||
    text.includes("join as owner")
  ) {
    return {
      route: "/auth",
      params: { role: "owner", mode: "signup" },
      label: "owner signup page",
    };
  }

  if (
    text.includes("login") ||
    text.includes("log in") ||
    text.includes("sign in")
  ) {
    return {
      route: "/auth",
      params: { role: "user", mode: "login" },
      label: "login page",
    };
  }

  if (
    text.includes("signup") ||
    text.includes("sign up") ||
    text.includes("register") ||
    text.includes("create account")
  ) {
    return {
      route: "/auth",
      params: { role: "user", mode: "signup" },
      label: "signup page",
    };
  }

  if (
    text.includes("find truck") ||
    text.includes("search truck") ||
    text.includes("show trucks") ||
    text.includes("truck finder")
  ) {
    return {
      route: "/truck-finder",
      params: { flow: "Scheduled booking" },
      label: "truck finder page",
    };
  }

  return null;
}

function buildAssistantReply(message, pageContext, intent) {
  const text = message.toLowerCase();

  if (intent?.label) {
    return `Taking you to the ${intent.label} now so you can continue faster.`;
  }

  if (text.includes("book") || text.includes("booking")) {
    return pageContext === "truck-finder"
      ? "Choose a truck card, review the fare and provider details, then use the booking action. The next step after this can be account login and booking confirmation."
      : "Start from a booking option on the homepage, then the truck finder page will help compare trucks, pricing, and provider trust before booking.";
  }

  if (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("fare") ||
    text.includes("cost")
  ) {
    return "Pricing depends on route, truck type, service type, urgency, and provider profile. On the truck finder page, the budget slider helps narrow options by estimated fare.";
  }

  if (
    text.includes("owner") ||
    text.includes("provider") ||
    text.includes("connect")
  ) {
    return "Truck owners should use the owner access flow on the auth page. From there, we can later connect onboarding, fleet listing, pricing, and availability management.";
  }

  if (
    text.includes("verified") ||
    text.includes("trust") ||
    text.includes("safe") ||
    text.includes("review")
  ) {
    return "Verified providers are highlighted in the truck finder with trust signals and review context. Security is built around KYC checks, role-based access, and safer booking records.";
  }

  if (
    text.includes("login") ||
    text.includes("signup") ||
    text.includes("account") ||
    text.includes("auth")
  ) {
    return "The auth page supports both user and owner access. Users can book and track shipments, while owners can connect their fleet and manage transport leads.";
  }

  if (
    text.includes("help") ||
    text.includes("guide") ||
    text.includes("start")
  ) {
    if (pageContext === "auth") {
      return "You are on the access page. Pick user or owner, switch between login and signup, and continue with the form that matches your role.";
    }

    if (pageContext === "truck-finder") {
      return "You are on the truck finder page. Use the search box, service filter, budget slider, and verified-only toggle to compare trucks quickly.";
    }

    return "You are on the homepage. Start with a booking flow, then move into the truck finder page to compare trucks, pricing, and providers.";
  }

  return "I can help with booking flow, pricing, owner onboarding, verified providers, login/signup, or using the truck finder. Try one of the quick prompts below.";
}

function AssistantWidget({ pageContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const redirectTimeoutRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: getAssistantWelcomeMessage(pageContext),
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: getAssistantWelcomeMessage(pageContext),
      },
    ]);
  }, [pageContext]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function sendMessage(text) {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    const intent = getAssistantIntent(trimmed);
    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    const assistantMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: buildAssistantReply(trimmed, pageContext, intent),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setIsOpen(true);

    if (intent) {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = window.setTimeout(() => {
        goToHash(intent.route, intent.params);
        redirectTimeoutRef.current = null;
      }, 700);
    }
  }

  return (
    <div className={isOpen ? "assistant-shell assistant-shell-open" : "assistant-shell"}>
      <button
        type="button"
        className="assistant-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open truck assistant"
      >
        <span className="assistant-truck" aria-hidden="true">
          <span className="assistant-truck-cabin" />
          <span className="assistant-truck-body" />
          <span className="assistant-truck-window" />
          <span className="assistant-truck-wheel assistant-truck-wheel-front" />
          <span className="assistant-truck-wheel assistant-truck-wheel-back" />
        </span>
        <span className="assistant-trigger-text">TruckMate</span>
      </button>

      {isOpen && (
        <section className="assistant-panel">
          <div className="assistant-header">
            <div>
              <p className="booking-label">Guided assistant</p>
              <h3>TruckMate</h3>
            </div>
            <button
              type="button"
              className="assistant-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              Close
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "assistant"
                    ? "assistant-bubble assistant-bubble-bot"
                    : "assistant-bubble assistant-bubble-user"
                }
              >
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <div className="assistant-prompts">
            {assistantPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="assistant-prompt"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about booking, pricing, owner access..."
            />
            <button type="submit" className="btn btn-primary assistant-send">
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

function AuthPage({ role, mode, theme, onToggleTheme, t, onToggleLanguage, language, setCurrentUser }) {
  const isOwner = role === "owner";
  const isSignup = mode === "signup";
  const redirectPath = getRouteFromHash().params.get("redirect");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaOtpAuthUrl, setMfaOtpAuthUrl] = useState('');

  function goToPostAuthDestination(user) {
    if (redirectPath && user.role !== "owner") {
      goToHash(redirectPath);
      return;
    }

    if (user.role === 'owner') {
      goToHash('/owner-dashboard');
    } else {
      goToHash('/customer-dashboard');
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    setMfaSecret('');
    setMfaOtpAuthUrl('');

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await authAPI[isSignup ? "signup" : "login"]({
        ...data,
        role: isOwner ? 'owner' : 'user',
      });

      if (response.data.mfaRequired) {
        setMfaStep(true);
        setMfaToken(response.data.mfaToken);
        setMfaSecret(response.data.mfaSecret || '');
        setMfaOtpAuthUrl(response.data.mfaOtpAuthUrl || '');
        setInfo('Enter the 6-digit code from your authenticator app.');
        return;
      }

      if (response.data.mfaSecret) {
        setMfaSecret(response.data.mfaSecret);
        setMfaOtpAuthUrl(response.data.mfaOtpAuthUrl || '');
        setInfo('Save this MFA secret in your authenticator app. Future logins will require it.');
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);

      if (!response.data.mfaSecret) {
        goToPostAuthDestination(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const response = await authAPI.verifyMfa({
        token: mfaToken,
        code: mfaCode,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);
      setMfaStep(false);
      setMfaToken('');
      setMfaCode('');
      goToPostAuthDestination(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            ←
          </button>
          <div className="language-selector">
            <button
              type="button"
              className="language-toggle"
              onClick={onToggleLanguage}
            >
              {t(language === "en" ? "Hindi" : "English")}
            </button>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">{t("Access portal")}</p>
          <h1>
            {isOwner ? t("Owner") : t("User")} {isSignup ? t("signup") : t("login")} {t("for TruckLink Logistics")}
          </h1>
        </div>
      </header>

      <main>
        <section className="auth-layout">
          <article className="auth-intro-card">
            <span className="badge neutral">{t("Role-based access")}</span>
            <h3>{t("One secure entry point for customers and truck owners")}</h3>
            <p>
              {t("Customers can book and track shipments. Owners can onboard their fleet, manage availability, and respond to transport requests.")}
            </p>

            <div className="auth-role-switch">
              <button
                type="button"
                className={
                  !isOwner ? "auth-chip auth-chip-active" : "auth-chip"
                }
                onClick={() =>
                  goToHash("/auth", {
                    role: "user",
                    mode: isSignup ? "signup" : "login",
                  })
                }
              >
                {t("User access")}
              </button>
              <button
                type="button"
                className={
                  isOwner ? "auth-chip auth-chip-active" : "auth-chip"
                }
                onClick={() =>
                  goToHash("/auth", {
                    role: "owner",
                    mode: isSignup ? "signup" : "login",
                  })
                }
              >
                {t("Owner access")}
              </button>
            </div>

            <div className="auth-benefit-list">
              <div>
                <strong>{isOwner ? t("Fleet onboarding") : t("Fast booking")}</strong>
                <span>
                  {isOwner
                    ? t("Add trucks, routes, pricing, and service details.")
                    : t("Compare trucks and move quickly to secure booking.")}
                </span>
              </div>
              <div>
                <strong>{isOwner ? t("Lead management") : t("Trusted providers")}</strong>
                <span>
                  {isOwner
                    ? t("Review requests and manage customer connections.")
                    : t("Find verified partners with reviews and pricing clarity.")}
                </span>
              </div>
              <div>
                <strong>{t("Security first")}</strong>
                <span>
                  {t("Protected access, role-based accounts, and secure platform activity.")}
                </span>
              </div>
            </div>
          </article>

          <article className="auth-form-card">
            <div className="auth-form-header">
              <p className="booking-label">
                {isOwner ? t("Portal") : t("Portal")}
              </p>
              <h3>{isSignup ? t("Create your account") : t("Welcome back")}</h3>
              <p>
                {isSignup
                  ? t("Create an account to continue into the logistics platform.")
                  : t("Log in to continue into your logistics dashboard.")}
              </p>
            </div>

            <div className="auth-mode-tabs">
              <button
                type="button"
                className={!isSignup ? "auth-tab auth-tab-active" : "auth-tab"}
                onClick={() =>
                  goToHash("/auth", {
                    role: isOwner ? "owner" : "user",
                    mode: "login",
                  })
                }
              >
                {t("Login")}
              </button>
              <button
                type="button"
                className={isSignup ? "auth-tab auth-tab-active" : "auth-tab"}
                onClick={() =>
                  goToHash("/auth", {
                    role: isOwner ? "owner" : "user",
                    mode: "signup",
                  })
                }
              >
                {t("Signup")}
              </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {info && <p style={{ color: 'green' }}>{info}</p>}

            {mfaStep ? (
              <div className="auth-mfa-panel">
                <form className="auth-form" onSubmit={handleMfaSubmit}>
                  <label className="field-group">
                    <span>{t('MFA code')}</span>
                    <input
                      type="text"
                      name="mfaCode"
                      value={mfaCode}
                      onChange={(event) => setMfaCode(event.target.value)}
                      placeholder={t('Enter 6-digit code')}
                    />
                  </label>
                  <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                    {loading ? 'Loading...' : t('Verify code')}
                  </button>
                </form>

                {mfaSecret && (
                  <div className="auth-info-card">
                    <div className="auth-info-header">
                      <p>{t('Scan this QR code with your authenticator app:')}</p>
                    </div>
                    {mfaOtpAuthUrl && (
                      <div className="mfa-qr-wrap">
                        <MfaQrCode value={mfaOtpAuthUrl} />
                      </div>
                    )}
                    <p>{t('Or enter this MFA secret manually:')}</p>
                    <strong className="mfa-secret-code">{mfaSecret}</strong>
                  </div>
                )}
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                {isSignup && (
                  <label className="field-group">
                    <span>{isOwner ? t("Company or owner name") : t("Full name")}</span>
                    <input
                      type="text"
                      name="name"
                      placeholder={
                        isOwner ? t("Enter company or owner name") : t("Enter your full name")
                      }
                    />
                  </label>
                )}

                <label className="field-group">
                  <span>{t("Email address")}</span>
                  <input type="email" name="email" placeholder={t("Enter your email")} />
                </label>

                <label className="field-group">
                  <span>{t("Password")}</span>
                  <input type="password" name="password" placeholder={t("Enter your password")} />
                </label>

                {isSignup && (
                  <>
                    <label className="field-group">
                      <span>{isOwner ? t("Business phone") : t("Phone number")}</span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder={
                          isOwner ? t("Enter business phone") : t("Enter your phone number")
                        }
                      />
                    </label>

                    {isOwner && (
                      <label className="field-group">
                        <span>{t("Fleet size")}</span>
                        <select name="fleetSize" defaultValue="">
                          <option value="" disabled>
                            {t("Select your fleet size")}
                          </option>
                          <option>{t("1 to 5 trucks")}</option>
                          <option>{t("6 to 20 trucks")}</option>
                          <option>{t("21 to 50 trucks")}</option>
                          <option>{t("50+ trucks")}</option>
                        </select>
                      </label>
                    )}
                  </>
                )}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Loading...' : (isSignup
                    ? (isOwner ? t("Create owner account") : t("Create user account"))
                    : (isOwner ? t("Login as owner") : t("Login as user")))}
                </button>
              </form>
            )}

            {mfaSecret && (
              <div className="auth-info-card">
                <div className="auth-info-header">
                  <p>{t('Scan this QR code with your authenticator app:')}</p>
                </div>
                {mfaOtpAuthUrl && (
                  <div className="mfa-qr-wrap">
                    <MfaQrCode value={mfaOtpAuthUrl} />
                  </div>
                )}
                <p>{t('Or enter this MFA secret manually:')}</p>
                <strong className="mfa-secret-code">{mfaSecret}</strong>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

function parseValue(value) {
  const normalizedValue = String(value || "").trim();

  if (normalizedValue.includes('k+')) {
    return { end: parseFloat(normalizedValue.replace('k+', '')) * 1000, suffix: 'k+' };
  }
  if (normalizedValue.includes('+')) {
    return { end: parseFloat(normalizedValue.replace('+', '')), suffix: '+' };
  }
  if (normalizedValue.includes('%')) {
    return { end: parseFloat(normalizedValue.replace('%', '')), suffix: '%' };
  }
  return { end: parseFloat(normalizedValue) || 0, suffix: '' };
}

function HomePage({ theme, onToggleTheme, t, onToggleLanguage, language, currentUser }) {
  const [activeBooking, setActiveBooking] = useState("Instant booking");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingSubmitted, setTrackingSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [stats, setStats] = useState({
    totalTrucks: 0,
    totalBookings: 0,
    totalUsers: 0,
    averageRating: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For now, just use the hardcoded stats
        setStats({
          totalTrucks: 12000,
          totalBookings: 1500,
          totalUsers: 450,
          averageRating: 4.8
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback to default stats
        setStats({
          totalTrucks: 12000,
          totalBookings: 1500,
          totalUsers: 450,
          averageRating: 4.8
        });
      }
    };

    fetchStats();
  }, []);

  function handleBookingChoice(title) {
    setActiveBooking(title);
    goToHash("/truck-map", { flow: title });
  }

  function handleTrackingSubmit(event) {
    event.preventDefault();
    if (!trackingNumber.trim()) {
      return;
    }
    setTrackingSubmitted(true);
  }

  function handleContactSubmit(event) {
    event.preventDefault();
    setContactSubmitted(true);
  }

  const dynamicStats = [
    { value: `${stats.totalTrucks}+`, label: "verified transport partners onboarded" },
    { value: `${stats.totalBookings}+`, label: "bookings supported across active corridors" },
    { value: `${stats.averageRating}`, label: "average partner rating" },
  ];

  const heroMetrics = [
    { value: "24/7", label: "dispatch support for urgent and scheduled loads" },
    { value: "36", label: "states and union territories covered" },
    { value: "15 min", label: "target callback for high-intent shipment requests" },
  ];

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">TL</div>
          <div className="brand-text">
            <p className="brand-company">{t("TruckLink")}</p>
            <p className="brand-subtitle">{t("Logistics")}</p>
          </div>
        </div>

        <div className="topbar-spacer"></div>

        <nav className="topnav" aria-label="Primary">
          <button
            type="button"
            className="nav-link-button"
            onClick={() => goToSection("tracking")}
          >
            {t("Tracking")}
          </button>
          <button
            type="button"
            className="nav-link-button"
            onClick={() => goToSection("services")}
          >
            {t("Services")}
          </button>
          <button
            type="button"
            className="nav-link-button"
            onClick={() => goToSection("coverage")}
          >
            {t("Coverage")}
          </button>
          <button
            type="button"
            className="nav-link-button"
            onClick={() => goToSection("security")}
          >
            {t("Security")}
          </button>
          <button
            type="button"
            className="nav-link-button"
            onClick={() => goToSection("contact")}
          >
            {t("Contact")}
          </button>
          {currentUser && (
            <button
              type="button"
              className="nav-link-button nav-dashboard"
              onClick={() => goToHash(currentUser.role === 'owner' ? '/owner-dashboard' : '/customer-dashboard')}
            >
              📊 {t("My Dashboard")}
            </button>
          )}
        </nav>

        <div className="topbar-controls">
          <button
            type="button"
            className="btn btn-primary topbar-cta"
            onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}
          >
            {t("Book a Shipment")}
          </button>
          <button
            type="button"
            className="btn btn-outline topbar-cta"
            onClick={() => goToSection("contact")}
          >
            {t("Talk to Our Team")}
          </button>
          {!currentUser && (
            <button
              type="button"
              className="btn btn-outline topbar-signin"
              onClick={() => goToHash("/auth", { role: "user", mode: "login" })}
            >
              {t("Sign In")}
            </button>
          )}
          <button
            type="button"
            className="control-button language-toggle"
            title={t("Toggle language")}
            onClick={onToggleLanguage}
          >
            <span className="control-icon">🌐</span>
            <span className="control-text">{language === "en" ? "EN" : "HI"}</span>
          </button>
          <button
            type="button"
            className="control-button theme-toggle"
            title={t("Toggle theme")}
            onClick={onToggleTheme}
          >
            <span className="control-icon">{theme === "light" ? "🌙" : "☀️"}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero-card">
          <div className="hero-copy">
            <span className="badge">{t("India-ready logistics platform")}</span>
            <h2>
              {t("Book reliable trucks, compare rates, and move freight with confidence.")}
            </h2>
            <p>
              {t("TruckLink helps businesses and customers find the right truck faster with clear pricing, verified transport partners, and dedicated flows for urgent, scheduled, and repeat shipments.")}
            </p>

            <div className="hero-metric-row" aria-label="Service snapshot">
              {heroMetrics.map((metric) => (
                <article key={metric.label} className="hero-metric-card">
                  <strong>{metric.value}</strong>
                  <span>{t(metric.label)}</span>
                </article>
              ))}
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}
              >
                {t("Book a Shipment")}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => goToHash("/truck-map", { flow: "Scheduled booking" })}
              >
                {t("Get a Quote")}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => goToSection("contact")}
              >
                {t("Talk to Our Team")}
              </button>
            </div>

            <div className="service-pills">
              {services.map((service) => (
                <span key={service}>{service}</span>
              ))}
            </div>

            <div className="hero-essentials" aria-label="Core logistics strengths">
              {heroEssentials.map((item) => (
                <article key={item.title} className="hero-essential-card">
                  <strong>{t(item.title)}</strong>
                  <p>{t(item.text)}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="quote-panel" aria-label="Platform summary">
            <div className="quote-header">
              <p>{t("Operations snapshot")}</p>
              <span>{t("Built for shippers and fleet owners")}</span>
            </div>

            <div className="quote-route">
              <div>
                <strong>{t("Pickup")}</strong>
                <span>{t("Request created")}</span>
              </div>
              <div className="route-line" />
              <div>
                <strong>{t("Delivery")}</strong>
                <span>{t("Tracked journey")}</span>
              </div>
            </div>

            <div className="hero-panel-note">
              <strong>{t("Faster freight decisions")}</strong>
              <p>{t("See service types, trust signals, and booking paths in one place before moving into the full truck finder flow.")}</p>
            </div>

            <HeroFreightScene />

            <div className="quote-grid">
              <div>
                <span>{t("Coverage")}</span>
                <strong>{t("Pan-India service lanes")}</strong>
              </div>
              <div>
                <span>{t("Truck types")}</span>
                <strong>{t("Open, container, and cold chain")}</strong>
              </div>
              <div>
                <span>{t("Booking support")}</span>
                <strong>{t("Instant, scheduled, and enterprise")}</strong>
              </div>
              <div>
                <span>{t("Trust layer")}</span>
                <strong>{t("Verified partners and reviews")}</strong>
              </div>
            </div>
          </aside>
        </section>

        <section className="stats-band" aria-label="Key trust metrics">
          {dynamicStats.map((stat, index) => (
            <article key={stat.label} className="stat-card" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="stat-number">{index + 1}</div>
              <div className="stat-content">
                <strong>
                  <CountUp
                    end={parseValue(stat.value).end}
                    duration={2.5}
                    enableScrollSpy
                    delay={index * 0.3}
                    suffix={parseValue(stat.value).suffix}
                  />
                </strong>
                <span>{t(stat.label)}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="tracking-section" id="tracking">
          <div className="tracking-layout">
            <article className="tracking-card">
              <div className="section-heading">
                <span className="badge neutral">{t("Shipment inquiry")}</span>
                <h3>{t("Add a simple tracking entry point even before live tracking is built")}</h3>
                <p>
                  {t("Customers expect shipment visibility. This inquiry form gives them a quick way to request status using a tracking number, with WhatsApp and team contact as fallback options.")}
                </p>
              </div>

              <form className="tracking-form" onSubmit={handleTrackingSubmit}>
                <label className="field-group">
                  <span>{t("Tracking number")}</span>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(event) => {
                      setTrackingNumber(event.target.value);
                      setTrackingSubmitted(false);
                    }}
                    placeholder={t("Enter shipment or booking number")}
                    required
                  />
                </label>
                <div className="tracking-actions">
                  <button type="submit" className="btn btn-primary">
                    {t("Check shipment status")}
                  </button>
                  <a className="btn btn-outline" href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
                    {t("WhatsApp support")}
                  </a>
                </div>
                {trackingSubmitted && (
                  <p className="form-message">
                    {t("Status inquiry received. Our operations team will share an update through phone, email, or WhatsApp shortly.")}
                  </p>
                )}
              </form>
            </article>

            <aside className="tracking-panel">
              <p className="booking-label">{t("Fallback support")}</p>
              <h4>{t("Need urgent help with dispatch or delivery status?")}</h4>
              <div className="tracking-support-list">
                <div>
                  <span>{t("Call operations")}</span>
                  <strong>+91 98765 43210</strong>
                </div>
                <div>
                  <span>{t("Email support")}</span>
                  <strong>operations@trucklinklogistics.com</strong>
                </div>
                <div>
                  <span>{t("WhatsApp response")}</span>
                  <strong>{t("Quick status follow-up for active shipments")}</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="content-grid" id="services">
          <div className="section-heading">
            <span className="badge neutral">{t("Core services")}</span>
            <h3>{t("The logistics capabilities customers expect should be obvious at a glance")}</h3>
            <p>
              {t("This section now explains the actual transport and supply chain support available on the platform, so visitors can immediately tell whether TruckLink fits their shipment needs.")}
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
                <span className="feature-supporting">{feature.supporting}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading narrow">
            <span className="badge neutral">{t("Booking flow")}</span>
            <h3>{t("A simple experience for a complicated logistics problem")}</h3>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.number} className="step-card">
                <span>{step.number}</span>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="focus-section">
          <article className="focus-card">
            <span className="badge neutral">{t("Minimal by design")}</span>
            <h3>{t("A homepage should guide, not overwhelm")}</h3>
            <p>
              {t("The truck finder, pricing slider, and deeper search filters are better placed on the next page, where users are ready to act.")}
            </p>
          </article>

          <article className="highlight-card">
            <p className="booking-label">{t("Next page preview")}</p>
            <h3>{t("Truck finder, pricing slider, and filters now open on a dedicated booking page")}</h3>
            <a href="#booking" className="btn btn-outline small">
              {t("Explore booking entry points")}
            </a>
          </article>
        </section>

        <section className="booking-section" id="booking">
          <div className="section-heading">
            <span className="badge neutral">{t("Booking options")}</span>
            <h3>{t("Choose a booking flow that matches the shipment need")}</h3>
            <p>
              {t("Different customers book differently. Some need a truck in hours, some plan a dispatch in advance, and some need long-term logistics support. The product should make those options obvious.")}
            </p>
          </div>

          <div className="booking-options-grid">
            {bookingOptions.map((option) => (
              <article
                key={option.title}
                className={
                  activeBooking === option.title
                    ? "booking-card booking-card-active"
                    : "booking-card"
                }
              >
                <span className="booking-meta">{option.meta}</span>
                <h4>{option.title}</h4>
                <p>{option.text}</p>
                <button
                  type="button"
                  className="btn btn-outline small"
                  onClick={() => handleBookingChoice(option.title)}
                >
                  Open truck finder
                </button>
              </article>
            ))}
          </div>

          <div className="booking-banner">
            <div>
              <p className="booking-label">Booking support</p>
              <h4>Each booking choice now opens its own truck finder page with pricing and destination filters</h4>
            </div>
            <p>
              This keeps the homepage elegant while still guiding the user into
              the full booking journey when they are ready.
            </p>
          </div>
        </section>
        <section className="coverage-section" id="coverage">
          <div className="coverage-overview">
            <div className="section-heading wide">
              <span className="badge neutral">{t("Coverage and network")}</span>
              <h3>{t("Customers should instantly see where the platform can move freight")}</h3>
              <p>
                {t("TruckLink already has location coverage data across India, so this section turns that into a business-friendly network view with service scale, active corridors, and shipment-fit industries.")}
              </p>
            </div>

            <div className="coverage-stat-grid">
              {coverageStats.map((stat) => (
                <article key={stat.label} className="coverage-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{t(stat.label)}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="coverage-grid">
            <article className="coverage-map-card">
              <p className="booking-label">{t("High-demand corridors")}</p>
              <h4>{t("Routes where fast matching matters most")}</h4>
              <p className="coverage-note">
                {t("These lanes often combine urgent demand, repeat booking behavior, and the strongest need for verified capacity visibility.")}
              </p>
              <div className="coverage-chip-list coverage-corridors">
                {majorCorridors.map((corridor) => (
                  <span key={corridor}>{t(corridor)}</span>
                ))}
              </div>
            </article>

            <article className="coverage-detail-card">
              <p className="booking-label">{t("Shipment fit")}</p>
              <h4>{t("Commercial use cases the network is built to support")}</h4>
              <div className="coverage-signal-list">
                <div className="coverage-signal-card">
                  <strong>{t("Best for")}</strong>
                  <span>{t("Urgent dispatches, planned lane movements, and repeat B2B transport needs.")}</span>
                </div>
                <div className="coverage-signal-card">
                  <strong>{t("Industries")}</strong>
                  <span>{t("Retail, manufacturing, food, pharma, e-commerce, and packaged goods supply chains.")}</span>
                </div>
              </div>
              <ul className="coverage-industry-list">
                {serviceIndustries.map((industry) => (
                  <li key={industry}>{t(industry)}</li>
                ))}
              </ul>
            </article>
          </div>

          <CoverageMapExplorer />
        </section>

        <section className="trust-section" id="trust">
          <div className="section-heading">
            <span className="badge neutral">{t("Trust signals")}</span>
            <h3>{t("Credibility should be visible before a customer ever places a booking")}</h3>
            <p>
              {t("Logistics decisions are trust-heavy, so the homepage now highlights operating experience, shipment volume, service reach, compliance-minded processes, and customer proof in one place.")}
            </p>
          </div>

          <div className="trust-grid">
            <div className="trust-metric-grid">
              {trustSignals.map((item) => (
                <article key={item.label} className="trust-metric-card">
                  <strong>{item.value}</strong>
                  <span>{t(item.label)}</span>
                </article>
              ))}
            </div>

            <article className="certification-card">
              <p className="booking-label">{t("Compliance and confidence")}</p>
              <h4>{t("Professional operating signals for shippers and procurement teams")}</h4>
              <ul className="trust-list">
                {certifications.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="logo-wall">
            {partnerLogos.map((logo) => (
              <span key={logo} className="logo-chip">{t(logo)}</span>
            ))}
          </div>
        </section>

        <section className="industries-section" id="industries">
          <div className="section-heading">
            <span className="badge neutral">{t("Industries served")}</span>
            <h3>{t("Show businesses that the network is built for real commercial movement")}</h3>
            <p>
              {t("Clear industry targeting helps B2B buyers quickly decide whether the logistics platform fits their dispatch patterns and cargo needs.")}
            </p>
          </div>

          <div className="industries-grid">
            {serviceIndustries.map((industry) => (
              <article key={industry} className="industry-card">
                <strong>{t(industry)}</strong>
                <p>{t("Supported through flexible truck options, route discovery, and structured booking flows.")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <span className="badge neutral">{t("About company")}</span>
            <h3>{t("A logistics website should explain the company behind the booking flow")}</h3>
            <p>
              {t("This section adds a more formal company story so the site feels like a serious logistics business, not just a booking interface.")}
            </p>
          </div>

          <div className="about-grid">
            {aboutHighlights.map((item) => (
              <article key={item.title} className="about-card">
                <h4>{t(item.title)}</h4>
                <p>{t(item.text)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="owner-section" id="owners">
          <div className="owner-section-heading">
            <div className="section-heading">
              <span className="badge warm">For transport owners</span>
              <h3>Bring more trucks onto the platform with a clearer business pitch.</h3>
              <p>
                Serious owners care about consistent demand, faster quotes, stronger trust, and less wasted time. This section makes that value explicit.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => goToHash("/auth", { role: "owner", mode: "signup" })}
            >
              Become a Transport Partner
            </button>
          </div>

          <div className="owner-grid">
            <article className="owner-showcase-card">
              <p className="booking-label">Owner growth snapshot</p>
              <h4>High-intent loads, better visibility, cleaner operations.</h4>
              <div className="owner-signal-list">
                {ownerSignals.map((signal) => (
                  <div key={signal.label} className="owner-signal-item">
                    <strong>{signal.label}</strong>
                    <span>{signal.value}</span>
                  </div>
                ))}
              </div>
            </article>

            <div className="owner-benefit-grid">
              {ownerBenefits.map((benefit) => (
                <article key={benefit.title} className="owner-benefit-card">
                  <h4>{benefit.title}</h4>
                  <p>{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="split-showcase" id="security">
          <article className="dark-panel">
            <span className="badge warm">Security first</span>
            <h3>Trust and protection should be part of the logistics experience</h3>
            <p>
              Since security is one of your main focus areas, the product can
              be built around verified providers, secure authentication,
              protected booking records, and fraud-resistant review systems.
            </p>
            <ul>
              <li>Verified truck owner onboarding and KYC checks</li>
              <li>Customer and provider role-based access control</li>
              <li>Booking history with traceable status updates</li>
              <li>Review moderation and suspicious activity flags</li>
            </ul>
          </article>

          <article className="light-panel">
            <span className="badge neutral">Future-ready features</span>
            <h3>Modern additions we can build next</h3>
            <ul>
              <li>Live map route estimation and location-aware pricing</li>
              <li>AI-based truck recommendations from shipment inputs</li>
              <li>Provider dashboards with availability management</li>
              <li>Booking status tracking and payment integration</li>
            </ul>
          </article>
        </section>

        <section className="reviews-section" id="reviews">
          <div className="section-heading narrow">
            <span className="badge neutral">Social proof</span>
            <h3>The product should feel reliable before anyone books</h3>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.name} className="testimonial-card">
                <p>"{item.quote}"</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-layout">
            <article className="contact-card">
              <div className="section-heading">
                <span className="badge warm">{t("Contact and quote")}</span>
                <h3>{t("Make it easy for visitors to request business immediately")}</h3>
                <p>
                  {t("Prominent contact options help logistics buyers move from browsing into real conversations faster, especially on mobile and during urgent shipment planning.")}
                </p>
              </div>

              <div className="contact-channel-grid">
                {contactChannels.map((item) => (
                  <div key={item.label} className="contact-channel-card">
                    <span>{t(item.label)}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="contact-form-card">
              <p className="booking-label">{t("Quick inquiry")}</p>
              <h4>{t("Get a quote, book a shipment, or talk to our team")}</h4>
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="contact-form-grid">
                  <label className="field-group">
                    <span>{t("Full name")}</span>
                    <input type="text" placeholder={t("Enter your name")} required />
                  </label>
                  <label className="field-group">
                    <span>{t("Company name")}</span>
                    <input type="text" placeholder={t("Enter company name")} />
                  </label>
                  <label className="field-group">
                    <span>{t("Phone number")}</span>
                    <input type="tel" placeholder={t("Enter your phone number")} required />
                  </label>
                  <label className="field-group">
                    <span>{t("Email address")}</span>
                    <input type="email" placeholder={t("Enter your email")} required />
                  </label>
                  <label className="field-group">
                    <span>{t("Request type")}</span>
                    <select defaultValue="">
                      <option value="" disabled>{t("Select request type")}</option>
                      <option>{t("Get a Quote")}</option>
                      <option>{t("Book a Shipment")}</option>
                      <option>{t("Talk to Our Team")}</option>
                    </select>
                  </label>
                  <label className="field-group">
                    <span>{t("Route or requirement")}</span>
                    <input type="text" placeholder={t("Example: Delhi to Jaipur, cold chain load")} />
                  </label>
                </div>
                <label className="field-group">
                  <span>{t("Message")}</span>
                  <textarea rows={4} placeholder={t("Share shipment details, timeline, cargo type, or support request")} />
                </label>
                <div className="tracking-actions">
                  <button type="submit" className="btn btn-primary">{t("Get a Quote")}</button>
                  <button type="button" className="btn btn-outline" onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}>
                    {t("Book a Shipment")}
                  </button>
                </div>
                {contactSubmitted && (
                  <p className="form-message">
                    {t("Thanks. Your inquiry has been noted and the team can follow up through phone, email, or WhatsApp.")}
                  </p>
                )}
              </form>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand-block">
            <div className="brand-mark">TL</div>
            <div className="brand-text">
              <p className="brand-company">{t("TruckLink")}</p>
              <p className="brand-subtitle">{t("Logistics")}</p>
            </div>
          </div>
          <p>{t("Professional truck booking, shipment support, and logistics coordination for businesses moving freight across India.")}</p>
        </div>

        <div className="footer-links">
          <button type="button" className="footer-link-button" onClick={() => goToSection("tracking")}>{t("Tracking")}</button>
          <button type="button" className="footer-link-button" onClick={() => goToSection("coverage")}>{t("Coverage")}</button>
          <button type="button" className="footer-link-button" onClick={() => goToSection("about")}>{t("About")}</button>
          <button type="button" className="footer-link-button" onClick={() => goToSection("contact")}>{t("Contact")}</button>
        </div>

        <div className="footer-cta">
          <button type="button" className="btn btn-primary" onClick={() => goToHash("/truck-map", { flow: "Scheduled booking" })}>
            {t("Get a Quote")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}>
            {t("Book a Shipment")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => goToSection("contact")}>
            {t("Talk to Our Team")}
          </button>
        </div>
      </footer>
    </div>
  );
}

function MapSelectionPage({ flow, theme, onToggleTheme, language, onLanguageChange, t }) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const stateMarkersRef = useRef([]);
  const activeState = states.find((state) => state.key === selectedState);
  const deferredStateQuery = useDeferredValue(stateQuery);
  const deferredCityQuery = useDeferredValue(cityQuery);
  const visibleStates = useMemo(
    () => getStateSuggestions(deferredStateQuery),
    [deferredStateQuery]
  );
  const visibleCities = useMemo(
    () => getCitySuggestions(selectedState, deferredCityQuery),
    [selectedState, deferredCityQuery]
  );

  function handleStateSelection(stateKey) {
    setSelectedState(stateKey);
    setSelectedCity("");
    setStateQuery(stateKey);
    setCityQuery("");
    setError("");
  }

  function handleCitySelection(city) {
    setSelectedCity(city);
    setCityQuery(city);
    setError("");

    goToHash("/truck-finder", {
      flow,
      state: selectedState,
      city,
    });
  }

  useEffect(() => {
    let isMounted = true;
    let mapInstance = null;

    const loadMap = async () => {
      if (!mapRef.current) {
        return;
      }

      try {
        const [{ default: L }] = await Promise.all([
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);

        if (!isMounted || !mapRef.current || mapRef.current._leaflet_id) {
          return;
        }

        mapInstance = L.map(mapRef.current).setView([22.5937, 78.9629], 5);
        leafletMapRef.current = mapInstance;
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        stateMarkersRef.current = states.map((state) => {
          const location = stateLocations[state.key];
          const marker = L.circleMarker([location.lat, location.lng], {
            radius: 6,
            weight: 1.5,
            color: "#0b3f56",
            fillColor: "#ff9f1c",
            fillOpacity: 0.82,
          })
            .addTo(mapInstance)
            .bindTooltip(state.label, {
              direction: "top",
              offset: [0, -8],
            });

          marker.on("click", () => {
            handleStateSelection(state.key);
            marker.openTooltip();
          });

          return { key: state.key, marker, location };
        });
      } catch (loadError) {
        console.error("Error loading map:", loadError);
        if (isMounted) {
          setError("Unable to load the map right now. You can still choose a state below.");
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      stateMarkersRef.current = [];
      leafletMapRef.current = null;
      mapInstance?.remove();
    };
  }, []);

  useEffect(() => {
    stateMarkersRef.current.forEach(({ key, marker, location }) => {
      const isActive = key === selectedState;

      marker.setStyle({
        radius: isActive ? 9 : 6,
        color: isActive ? "#168aad" : "#0b3f56",
        fillColor: isActive ? "#168aad" : "#ff9f1c",
        fillOpacity: isActive ? 0.96 : 0.82,
      });

      if (isActive) {
        marker.openTooltip();
        leafletMapRef.current?.flyTo([location.lat, location.lng], 6, {
          duration: 0.6,
        });
      }
    });
  }, [selectedState]);

  const handleContinue = () => {
    if (!selectedState || !selectedCity) {
      setError("Please select both a state and a city to continue.");
      return;
    }

    goToHash("/truck-finder", {
      flow,
      state: selectedState,
      city: selectedCity,
    });
  };

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/")}> 
            Back to homepage
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">Digital booking map</p>
          <h1>Select your state and city on the India map</h1>
        </div>
      </header>

      <main>
        <section className="finder-hero">
          <div className="section-heading">
            <span className="badge neutral">Smooth map-first booking</span>
            <h3>Start with the route location before you compare truck options.</h3>
            <p>
              Select the state and city where your pickup begins. The next booking page will open with filters preloaded for your chosen region.
            </p>
          </div>
        </section>

        <section className="map-selection-section">
          <div className="map-selection-grid">
            <article className="india-map-card">
              <div className="map-card-header">
                <span className="badge warm">India map</span>
                <h4>Choose your state</h4>
              </div>
              <div className="india-map-canvas" ref={mapRef} />
              <div className="map-hint">
                <p>Use the map markers to select your starting state. The booking page will open with city and route filters preloaded.</p>
              </div>
              <div className="state-chip-row">
                {visibleStates.map((state) => (
                  <button
                    key={state.key}
                    type="button"
                    className={`state-chip ${selectedState === state.key ? 'active' : ''}`}
                    onClick={() => handleStateSelection(state.key)}
                  >
                    {state.label}
                  </button>
                ))}
              </div>
            </article>

            <aside className="city-panel">
              <div className="panel-header">
                <span className="badge neutral">Location details</span>
                <h4>{selectedState ? `Selected ${selectedState}` : "Pick a state first"}</h4>
              </div>

              <div className="city-info">
                <p>
                  {selectedState
                    ? "Now choose the city where you want to start your booking."
                    : "Use the map to select a state and reveal the cities available for booking."}
                </p>
              </div>

              <SearchableSelector
                label="Search state"
                placeholder="Type a state or union territory"
                value={selectedState}
                query={stateQuery}
                onQueryChange={setStateQuery}
                options={visibleStates.map((state) => state.key)}
                onSelect={handleStateSelection}
                emptyMessage="No states match this search."
              />

              <SearchableSelector
                label="Search city"
                placeholder={selectedState ? "Type a city" : "Pick a state first"}
                value={selectedCity}
                query={cityQuery}
                onQueryChange={setCityQuery}
                options={visibleCities}
                onSelect={handleCitySelection}
                emptyMessage={
                  selectedState
                    ? "No cities match this search."
                    : "Select a state to search cities."
                }
              />

              <div className="city-grid">
                {activeState ? (
                  visibleCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className={`city-chip ${selectedCity === city ? 'active' : ''}`}
                      onClick={() => handleCitySelection(city)}
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="city-placeholder">Select a state to see cities</div>
                )}
              </div>

              {error && <p className="field-error">{error}</p>}

              <button
                type="button"
                className="btn btn-primary full-width"
                onClick={handleContinue}
                disabled={!selectedState || !selectedCity}
              >
                Continue to truck finder
              </button>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function TruckFinderPage({ flow, theme, onToggleTheme, language, onLanguageChange, t, selectedState: routeState, selectedCity: routeCity }) {
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState("All services");
  const [selectedState, setSelectedState] = useState(routeState || "");
  const [selectedCity, setSelectedCity] = useState(routeCity || "");
  const [stateQuery, setStateQuery] = useState(routeState || "");
  const [cityQuery, setCityQuery] = useState(routeCity || "");
  const [priceLimit, setPriceLimit] = useState(50000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredStateQuery = useDeferredValue(stateQuery);
  const deferredCityQuery = useDeferredValue(cityQuery);
  const stateSuggestions = useMemo(
    () => getStateSuggestions(deferredStateQuery),
    [deferredStateQuery]
  );
  const citySuggestions = useMemo(
    () => getCitySuggestions(selectedState, deferredCityQuery),
    [selectedState, deferredCityQuery]
  );

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {};
        if (selectedService !== "All services") params.truckType = selectedService;
        if (verifiedOnly) params.verified = "true";
        if (priceLimit < 50000) params.maxPrice = priceLimit;

        const response = await truckAPI.searchTrucks(params);
        setListings(response.data);
      } catch (err) {
        const apiMessage = err.response?.data?.message;
        const networkMessage =
          err.code === "ERR_NETWORK"
            ? "Cannot reach the backend. Check Render URL, CORS, and MongoDB connection."
            : "";
        setError(apiMessage || networkMessage || "Failed to load trucks");
        console.error("Error fetching trucks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [selectedService, verifiedOnly, priceLimit]);

  function handleStateSelect(stateKey) {
    setSelectedState(stateKey);
    setSelectedCity("");
    setStateQuery(stateKey);
    setCityQuery("");
  }

  function handleCitySelect(city) {
    setSelectedCity(city);
    setCityQuery(city);
  }

  function handleStartBooking(listing) {
    const draft = createBookingDraft(listing, flow, selectedState, selectedCity);
    window.sessionStorage.setItem(
      bookingStorageKeys.draft,
      JSON.stringify(draft)
    );

    if (!window.localStorage.getItem("token")) {
      goToHash("/auth", { role: "user", mode: "login", redirect: "/booking" });
      return;
    }

    goToHash("/booking");
  }

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        const routeText = (listing.route || "").toLowerCase();
        const cargoText = listing.cargo || listing.cargoType || "";
        const providerName = listing.owner?.name || listing.provider || "";
        const truckType = listing.truckType || listing.truck || "";
        const matchesText =
          searchText.trim() === "" ||
          `${listing.route || ""} ${cargoText} ${providerName} ${truckType}`
            .toLowerCase()
            .includes(searchText.toLowerCase());

        const matchesState =
          !selectedState ||
          states
            .find((state) => state.key === selectedState)
            ?.matches.some((term) => routeText.includes(term.toLowerCase()));

        const matchesCity =
          !selectedCity || routeText.includes(selectedCity.toLowerCase());

        return matchesText && matchesState && matchesCity;
      }),
    [listings, searchText, selectedState, selectedCity]
  );

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            Back to homepage
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">Truck finder</p>
          <h1>{flow} selected. Now find the right truck for this shipment.</h1>
        </div>
      </header>

      <main>
        <section className="finder-hero">
          <div className="section-heading">
            <span className="badge neutral">Dedicated booking page</span>
            <h3>Compare destination, pricing, service type, and trust signals in one place</h3>
            <p>
              This page now holds all of the truck finder logic so the homepage
              stays minimal while users still get a full search experience after
              choosing a booking flow.
            </p>
          </div>
        </section>

        <section className="truck-finder-section truck-finder-section-active">
          <div className="finder-layout">
            <aside className="finder-panel">
              <div className="finder-heading">
                <h4>Find the right truck</h4>
                <p>Filter by route, state, city, service type, budget, and provider trust.</p>
              </div>

              <label className="field-group">
                <span>Route, truck, cargo, or provider</span>
                <input
                  type="text"
                  placeholder="Try Delhi, container, electronics..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>

              <label className="field-group">
                <span>Service type</span>
                <select
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                >
                  <option>All services</option>
                  {services.map((service) => (
                    <option key={service}>{service}</option>
                  ))}
                </select>
              </label>

              <SearchableSelector
                label="Search state"
                placeholder="Try Maharashtra, Delhi, Kerala..."
                value={selectedState}
                query={stateQuery}
                onQueryChange={setStateQuery}
                options={stateSuggestions.map((state) => state.key)}
                onSelect={handleStateSelect}
                emptyMessage="No states match this search."
              />

              <SearchableSelector
                label="Search city"
                placeholder={selectedState ? "Try Mumbai, Jaipur, Kochi..." : "Pick a state first"}
                value={selectedCity}
                query={cityQuery}
                onQueryChange={setCityQuery}
                options={citySuggestions}
                onSelect={handleCitySelect}
                emptyMessage={
                  selectedState
                    ? "No cities match this search."
                    : "Select a state to unlock city search."
                }
              />

              <div className="map-selector">
                <span>Select your state and city</span>
                <div className="map-grid">
                  {states.map((state) => (
                    <button
                      key={state.key}
                      type="button"
                      className={`map-pin ${selectedState === state.key ? 'active' : ''}`}
                      aria-pressed={selectedState === state.key}
                      onClick={() =>
                        selectedState === state.key
                          ? handleStateSelect("")
                          : handleStateSelect(state.key)
                      }
                    >
                      {state.label}
                    </button>
                  ))}
                </div>
                {selectedState && (
                  <div className="selected-state-pill">
                    <span>{selectedState}</span>
                    <button type="button" onClick={() => {
                      setSelectedState("");
                      setSelectedCity("");
                    }}>
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="field-group">
                <span>Maximum budget</span>
                <div className="slider-wrap">
                  <input
                    type="range"
                    min="8000"
                    max="50000"
                    step="500"
                    value={priceLimit}
                    onChange={(event) =>
                      setPriceLimit(Number(event.target.value))
                    }
                  />
                  <div className="slider-values">
                    <span>Rs 8,000</span>
                    <strong>Up to Rs {priceLimit.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(event) => setVerifiedOnly(event.target.checked)}
                />
                <span>Show only verified providers</span>
              </label>

              <div className="filter-note">
                <strong>{filteredListings.length}</strong>
                <span>matching trucks available</span>
              </div>
            </aside>

            <div className="listing-stack">
              {loading ? (
                <>
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                </>
              ) : error ? (
                <article className="empty-state">
                  <h4>Error loading trucks</h4>
                  <p>{error}</p>
                </article>
              ) : filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <article key={listing._id} className="listing-card">
                    <div className="listing-topline">
                      <div>
                        <p className="listing-provider">{listing.owner?.name || 'Unknown Owner'}</p>
                        <h4>{listing.truckType} - {listing.capacity}</h4>
                        <p className="listing-route">{listing.route}</p>
                      </div>
                      <div className="listing-top-meta">
                        <span className="recommendation-pill">
                          {getRecommendationBadge(listing)}
                        </span>
                        <span
                          className={
                            listing.verified
                              ? "status-pill verified"
                              : "status-pill pending"
                          }
                        >
                          {listing.verified ? "Verified owner" : "Basic profile"}
                        </span>
                        <span className="status-pill neutral-pill">
                          {getEtaLabel(listing.basePrice, flow)}
                        </span>
                      </div>
                    </div>

                    <div className="listing-meta">
                      <span>{listing.capacity}</span>
                      <span>{listing.truckType}</span>
                      <span>{selectedCity || "Flexible pickup city"}</span>
                      <span>{getAvailabilityText(listing)}</span>
                    </div>

                    <div className="listing-insights">
                      {getTrustHighlights(listing).map((item) => (
                        <div key={item} className="listing-insight">
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="listing-bottom">
                      <div className="price-block">
                        <span>Estimated fare</span>
                        <strong>{formatPrice(listing.basePrice)}</strong>
                        <small>Fuel and driver included. Toll billed separately.</small>
                      </div>

                      <div className="rating-block">
                        <strong>{listing.rating}/5</strong>
                        <span>{listing.reviewCount} verified reviews</span>
                        <button
                          type="button"
                          className="btn btn-outline small"
                          onClick={() => setSearchText(listing.route || listing.truckType || "")}
                        >
                          Compare similar
                        </button>
                      </div>
                    </div>

                    <div className="listing-actions">
                      <span className="availability-pill">
                        {listing.availability ? "Available" : "Booked"}
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary small"
                        onClick={() => handleStartBooking(listing)}
                      >
                        Book this truck
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-state">
                  <h4>No trucks match these filters yet</h4>
                  <p>
                    Try increasing the budget slider or clearing the search to
                    see more available options.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline small"
                    onClick={() => {
                      setSearchText("");
                      setSelectedService("All services");
                      setSelectedState("");
                      setSelectedCity("");
                      setStateQuery("");
                      setCityQuery("");
                      setPriceLimit(50000);
                      setVerifiedOnly(false);
                    }}
                  >
                    Reset filters
                  </button>
                </article>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BookingPage({ theme, onToggleTheme, t, onToggleLanguage, language }) {
  const [draft, setDraft] = useState(() => {
    const storedDraft = window.sessionStorage.getItem(bookingStorageKeys.draft);
    return storedDraft ? JSON.parse(storedDraft) : null;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!draft) {
    return (
      <div className="page-shell">
        <section className="empty-state">
          <h4>No booking selected yet</h4>
          <p>Choose a truck first and the booking form will open with that truck preloaded.</p>
          <button type="button" className="btn btn-primary small" onClick={() => goToHash("/truck-finder")}>
            Back to truck finder
          </button>
        </section>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const confirmation = {
      ...draft,
      ...data,
      bookingReference: `TL-${Date.now().toString().slice(-6)}`,
      quotedPrice: draft.basePrice + Math.round((Number(data.weight) || 0) * 18),
      estimatedPickup: getEtaLabel(draft.basePrice, draft.flow),
      status: "Awaiting carrier confirmation",
    };

    try {
      if (window.localStorage.getItem("token")) {
        try {
          await bookingAPI.createBooking({
            truckId: draft.truckId,
            pickupLocation: data.pickupLocation,
            deliveryLocation: data.deliveryLocation,
            cargoType: data.cargoType,
            weight: `${data.weight} tons`,
            pickupDate: data.pickupDate,
            specialInstructions: data.specialInstructions,
          });
        } catch (apiError) {
          console.error("Booking API fallback used:", apiError);
        }
      }

      window.sessionStorage.setItem(
        bookingStorageKeys.confirmation,
        JSON.stringify(confirmation)
      );
      goToHash("/booking-confirmation");
    } catch (error) {
      console.error("Error creating booking:", error);
      setSubmitError("We could not save the booking right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/truck-finder", { flow: draft.flow, state: draft.state, city: draft.city })}>
            Back to truck finder
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <div className="subpage-copy">
          <p className="eyebrow">Booking form</p>
          <h1>Confirm your load details and reserve this truck.</h1>
        </div>
      </header>

      <main className="booking-form-layout">
        <aside className="booking-summary-card">
          <span className="badge neutral">Selected truck</span>
          <h3>{draft.truckType} - {draft.capacity}</h3>
          <p>{draft.route}</p>
          <div className="booking-summary-list">
            <div><strong>Provider</strong><span>{draft.providerName}</span></div>
            <div><strong>Quoted base fare</strong><span>{formatPrice(draft.basePrice)}</span></div>
            <div><strong>Pickup city</strong><span>{draft.city || "Flexible"}</span></div>
            <div><strong>Trust score</strong><span>{draft.rating}/5 from {draft.reviewCount} reviews</span></div>
          </div>
        </aside>

        <section className="booking-form-card">
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field-group">
                <span>Pickup location</span>
                <input type="text" name="pickupLocation" defaultValue={draft.city || ""} required />
              </label>
              <label className="field-group">
                <span>Delivery location</span>
                <input type="text" name="deliveryLocation" placeholder="Enter delivery city or warehouse" required />
              </label>
              <label className="field-group">
                <span>Cargo type</span>
                <input type="text" name="cargoType" placeholder="Electronics, FMCG, machinery..." required />
              </label>
              <label className="field-group">
                <span>Weight in tons</span>
                <input type="number" name="weight" min="1" step="0.5" placeholder="5" required />
              </label>
              <label className="field-group">
                <span>Pickup date</span>
                <input type="date" name="pickupDate" required />
              </label>
              <label className="field-group">
                <span>Contact phone</span>
                <input type="tel" name="phone" placeholder="Customer phone number" required />
              </label>
            </div>

            <label className="field-group">
              <span>Special instructions</span>
              <textarea name="specialInstructions" rows="4" placeholder="Loading window, fragile handling, unloading notes..." />
            </label>

            {submitError && <p className="field-error">{submitError}</p>}

            <div className="booking-form-actions">
              <button type="button" className="btn btn-outline" onClick={() => goToHash("/truck-finder", { flow: draft.flow, state: draft.state, city: draft.city })}>
                Keep comparing
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving booking..." : "Confirm booking"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function BookingConfirmationPage({ theme, onToggleTheme }) {
  const confirmation = useMemo(() => {
    const stored = window.sessionStorage.getItem(bookingStorageKeys.confirmation);
    return stored ? JSON.parse(stored) : null;
  }, []);

  if (!confirmation) {
    return (
      <div className="page-shell">
        <section className="empty-state">
          <h4>No confirmation found</h4>
          <p>Complete a booking form first and the confirmation summary will appear here.</p>
          <button type="button" className="btn btn-primary small" onClick={() => goToHash("/truck-finder")}>
            Back to truck finder
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/")}>
            Back to homepage
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <div className="subpage-copy">
          <p className="eyebrow">Booking confirmation</p>
          <h1>Your truck request has been queued for confirmation.</h1>
        </div>
      </header>

      <main className="confirmation-shell">
        <section className="confirmation-hero">
          <span className="badge warm">Reference {confirmation.bookingReference}</span>
          <h3>{confirmation.truckType} from {confirmation.providerName}</h3>
          <p>{confirmation.status}</p>
        </section>

        <section className="confirmation-grid">
          <article className="confirmation-card">
            <h4>Trip summary</h4>
            <div className="booking-summary-list">
              <div><strong>Pickup</strong><span>{confirmation.pickupLocation}</span></div>
              <div><strong>Drop</strong><span>{confirmation.deliveryLocation}</span></div>
              <div><strong>Cargo</strong><span>{confirmation.cargoType}</span></div>
              <div><strong>Pickup slot</strong><span>{confirmation.pickupDate}</span></div>
            </div>
          </article>
          <article className="confirmation-card">
            <h4>Pricing and timing</h4>
            <div className="booking-summary-list">
              <div><strong>Estimated total</strong><span>{formatPrice(confirmation.quotedPrice)}</span></div>
              <div><strong>Pickup ETA</strong><span>{confirmation.estimatedPickup}</span></div>
              <div><strong>Flow</strong><span>{confirmation.flow}</span></div>
              <div><strong>Support</strong><span>Carrier callback within 15 minutes</span></div>
            </div>
          </article>
        </section>

        <div className="booking-form-actions">
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/truck-finder", { flow: confirmation.flow, state: confirmation.state, city: confirmation.city })}>
            Book another truck
          </button>
          <button type="button" className="btn btn-primary" onClick={() => goToHash("/customer-dashboard")}>
            Open dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

function OwnerDashboard({ theme, onToggleTheme, t, onToggleLanguage, language }) {
  const [dashboardData, setDashboardData] = useState({
    trucks: 0,
    activeBookings: 0,
    totalEarnings: 0
  });
  const [trucks, setTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTruckForm, setShowAddTruckForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, trucksRes, bookingsRes] = await Promise.all([
        ownerAPI.getDashboard(),
        ownerAPI.getTrucks(),
        ownerAPI.getBookings()
      ]);

      setDashboardData({
        trucks: dashboardRes.data.trucks,
        activeBookings: dashboardRes.data.activeBookings,
        totalEarnings: dashboardRes.data.totalEarnings
      });
      setTrucks(trucksRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      await ownerAPI.addTruck(data);
      setShowAddTruckForm(false);
      fetchDashboardData(); // Refresh data
      alert('Truck added successfully!');
    } catch (err) {
      console.error('Error adding truck:', err);
      alert('Error adding truck. Please try again.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await ownerAPI.updateBookingStatus(bookingId, { status: newStatus });
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Error updating booking status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9f1c';
      case 'confirmed': return '#168aad';
      case 'in_transit': return '#ff6b35';
      case 'delivered': return '#52b788';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            ← {t("Back to homepage")}
          </button>
          <div className="language-selector">
            <button
              type="button"
              className="language-toggle"
              onClick={onToggleLanguage}
            >
              {t(language === "en" ? "Hindi" : "English")}
            </button>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">{t("Owner dashboard")}</p>
          <h1>{t("Manage your fleet and leads")}</h1>
        </div>
      </header>

      <main>
        {/* Dashboard Tabs */}
        <section className="dashboard-tabs">
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t("Overview")}
            </button>
            <button
              className={`tab-button ${activeTab === 'fleet' ? 'active' : ''}`}
              onClick={() => setActiveTab('fleet')}
            >
              {t("Fleet Management")}
            </button>
            <button
              className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              {t("Bookings")}
            </button>
          </div>
        </section>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            <section className="overview-stats">
              <div className="stat-card-large">
                <div className="stat-icon">🚛</div>
                <div className="stat-info">
                  <h3>{dashboardData.trucks}</h3>
                  <p>{t("Total Trucks")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{dashboardData.activeBookings}</h3>
                  <p>{t("Active Bookings")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{dashboardData.totalEarnings.toLocaleString()}</h3>
                  <p>{t("Total Earnings")}</p>
                </div>
              </div>
            </section>

            <section className="recent-activity">
              <h3>{t("Recent Bookings")}</h3>
              <div className="activity-list">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking._id} className="activity-item">
                    <div className="activity-info">
                      <strong>{booking.truck?.truckNumber}</strong>
                      <span>{booking.customer?.name}</span>
                      <small>{booking.pickupLocation} → {booking.deliveryLocation}</small>
                    </div>
                    <div className="activity-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Fleet Management Tab */}
        {activeTab === 'fleet' && (
          <div className="dashboard-content">
            <section className="fleet-header">
              <h3>{t("Your Fleet")}</h3>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddTruckForm(!showAddTruckForm)}
              >
                {showAddTruckForm ? t("Cancel") : t("+ Add New Truck")}
              </button>
            </section>

            {showAddTruckForm && (
              <section className="add-truck-form">
                <form onSubmit={handleAddTruck}>
                  <div className="form-grid">
                    <label className="field-group">
                      <span>{t("Truck Number")}</span>
                      <input type="text" name="truckNumber" placeholder="e.g., TRK-001" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Truck Type")}</span>
                      <select name="truckType" required>
                        <option value="">{t("Select type")}</option>
                        <option>{t("Open truck")}</option>
                        <option>{t("Container")}</option>
                        <option>{t("Cold chain")}</option>
                        <option>{t("Express delivery")}</option>
                      </select>
                    </label>
                    <label className="field-group">
                      <span>{t("Capacity")}</span>
                      <input type="text" name="capacity" placeholder="e.g., 10 tons" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Route")}</span>
                      <input type="text" name="route" placeholder="e.g., Delhi to Jaipur" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Base Price (₹)")}</span>
                      <input type="number" name="basePrice" placeholder="5000" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Features (comma separated)")}</span>
                      <input type="text" name="features" placeholder="GPS tracking, Refrigerated" />
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary">{t("Add Truck")}</button>
                </form>
              </section>
            )}

            <section className="fleet-list">
              <div className="trucks-grid">
                {trucks.map(truck => (
                  <div key={truck._id} className="truck-card">
                    <div className="truck-header">
                      <h4>{truck.truckNumber}</h4>
                      <span className={`availability ${truck.availability ? 'available' : 'unavailable'}`}>
                        {truck.availability ? t("Available") : t("Busy")}
                      </span>
                    </div>
                    <div className="truck-details">
                      <p><strong>{t("Type")}:</strong> {truck.truckType}</p>
                      <p><strong>{t("Capacity")}:</strong> {truck.capacity}</p>
                      <p><strong>{t("Route")}:</strong> {truck.route}</p>
                      <p><strong>{t("Price")}:</strong> ₹{truck.basePrice}</p>
                      {truck.features && truck.features.length > 0 && (
                        <p><strong>{t("Features")}:</strong> {truck.features.join(', ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="dashboard-content">
            <section className="bookings-header">
              <h3>{t("Booking Management")}</h3>
            </section>

            <section className="bookings-list">
              <div className="bookings-table">
                <div className="table-header">
                  <span>{t("Customer")}</span>
                  <span>{t("Truck")}</span>
                  <span>{t("Route")}</span>
                  <span>{t("Status")}</span>
                  <span>{t("Price")}</span>
                  <span>{t("Actions")}</span>
                </div>
                {bookings.map(booking => (
                  <div key={booking._id} className="table-row">
                    <div className="customer-info">
                      <strong>{booking.customer?.name}</strong>
                      <small>{booking.customer?.email}</small>
                    </div>
                    <div>{booking.truck?.truckNumber}</div>
                    <div>{booking.pickupLocation} → {booking.deliveryLocation}</div>
                    <div>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div>₹{booking.price}</div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <button
                          className="btn-small btn-confirm"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                        >
                          {t("Confirm")}
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          className="btn-small btn-start"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'in_transit')}
                        >
                          {t("Start Trip")}
                        </button>
                      )}
                      {booking.status === 'in_transit' && (
                        <button
                          className="btn-small btn-deliver"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'delivered')}
                        >
                          {t("Mark Delivered")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function CustomerDashboard({ theme, onToggleTheme, t, onToggleLanguage, language }) {
  const [dashboardData, setDashboardData] = useState({
    user: { name: '', email: '', phone: '' },
    stats: { totalBookings: 0, activeBookings: 0, completedBookings: 0, totalSpent: 0 },
    recentBookings: []
  });
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, bookingsRes] = await Promise.all([
        customerAPI.getDashboard(),
        customerAPI.getBookings()
      ]);

      setDashboardData(dashboardRes.data);
      setAllBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      await customerAPI.updateProfile(data);
      fetchDashboardData(); // Refresh data
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile.');
    }
  };

  const handleAddReview = async (bookingId) => {
    try {
      await customerAPI.addReview({
        bookingId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: '' });
      fetchDashboardData();
      alert('Review added successfully!');
    } catch (err) {
      console.error('Error adding review:', err);
      alert('Error adding review.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await customerAPI.cancelBooking(bookingId);
      fetchDashboardData();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Error cancelling booking.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'in_transit': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            ← {t("Back to homepage")}
          </button>
          <div className="language-selector">
            <button
              type="button"
              className="language-toggle"
              onClick={onToggleLanguage}
            >
              {t(language === "en" ? "Hindi" : "English")}
            </button>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">{t("Customer dashboard")}</p>
          <h1>{t("Manage your shipments")}</h1>
        </div>
      </header>

      <main>
        {/* Dashboard Tabs */}
        <section className="dashboard-tabs">
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t("Overview")}
            </button>
            <button
              className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              {t("My Bookings")}
            </button>
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              {t("Profile")}
            </button>
          </div>
        </section>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            <section className="overview-stats">
              <div className="stat-card-large">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.totalBookings}</h3>
                  <p>{t("Total Bookings")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.activeBookings}</h3>
                  <p>{t("Active Shipments")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.completedBookings}</h3>
                  <p>{t("Completed")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{dashboardData.stats.totalSpent.toLocaleString()}</h3>
                  <p>{t("Total Spent")}</p>
                </div>
              </div>
            </section>

            <section className="recent-activity">
              <h3>{t("Recent Bookings")}</h3>
              <div className="activity-list">
                {dashboardData.recentBookings.map(booking => (
                  <div key={booking._id} className="activity-item">
                    <div className="activity-info">
                      <strong>{booking.truck?.truckNumber} - {booking.truck?.truckType}</strong>
                      <span>{booking.pickupLocation} → {booking.deliveryLocation}</span>
                      <small>₹{booking.price} • {new Date(booking.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="activity-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="dashboard-content">
            <section className="bookings-section">
              <h3>{t("All My Bookings")}</h3>
              <div className="bookings-list">
                {allBookings.map(booking => (
                  <div key={booking._id} className="booking-card-detailed">
                    <div className="booking-header">
                      <div className="booking-title">
                        <h4>{booking.truck?.truckNumber} - {booking.truck?.truckType}</h4>
                        <span className="booking-date">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="booking-price">
                        <strong>₹{booking.price}</strong>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span><strong>{t("Route")}:</strong> {booking.pickupLocation} → {booking.deliveryLocation}</span>
                        <span><strong>{t("Cargo")}:</strong> {booking.cargoType} ({booking.weight})</span>
                      </div>
                      <div className="detail-row">
                        <span><strong>{t("Pickup Date")}:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</span>
                        <span><strong>{t("Instructions")}:</strong> {booking.specialInstructions || 'None'}</span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      {booking.status === 'delivered' && !booking.review && (
                        <button
                          className="btn-small btn-primary"
                          onClick={() => setShowReviewForm(booking._id)}
                        >
                          {t("Write Review")}
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          {t("Cancel Booking")}
                        </button>
                      )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm === booking._id && (
                      <div className="review-form">
                        <h5>{t("Write a Review")}</h5>
                        <div className="rating-input">
                          <label>{t("Rating")}:</label>
                          <select
                            value={reviewData.rating}
                            onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 stars)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 stars)</option>
                            <option value={3}>⭐⭐⭐ (3 stars)</option>
                            <option value={2}>⭐⭐ (2 stars)</option>
                            <option value={1}>⭐ (1 star)</option>
                          </select>
                        </div>
                        <textarea
                          placeholder={t("Share your experience...")}
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                          rows={3}
                        />
                        <div className="review-actions">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => handleAddReview(booking._id)}
                          >
                            {t("Submit Review")}
                          </button>
                          <button
                            className="btn-small btn-outline"
                            onClick={() => setShowReviewForm(null)}
                          >
                            {t("Cancel")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dashboard-content">
            <section className="profile-section">
              <h3>{t("My Profile")}</h3>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-grid">
                  <label className="field-group">
                    <span>{t("Full Name")}</span>
                    <input
                      type="text"
                      name="name"
                      defaultValue={dashboardData.user.name}
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span>{t("Email Address")}</span>
                    <input
                      type="email"
                      name="email"
                      value={dashboardData.user.email}
                      disabled
                    />
                  </label>
                  <label className="field-group">
                    <span>{t("Phone Number")}</span>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={dashboardData.user.phone}
                    />
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">
                  {t("Update Profile")}
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(() => getRouteFromHash());
  const [showIntro, setShowIntro] = useState(() => {
    return window.sessionStorage.getItem(introStorageKey) !== "true";
  });
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("trucklink-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });
  const [language, setLanguage] = useState(() => {
    const savedLang = window.localStorage.getItem("trucklink-language");
    return savedLang === "hi" ? "hi" : "en";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = window.localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const t = (key) => translations[language][key] || key;

  useEffect(() => {
    const handleHashChange = () => {
      if (isAppRoute(window.location.hash)) {
        setRoute(getRouteFromHash());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("trucklink-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("trucklink-language", language);
  }, [language]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }

  function toggleLanguage() {
    setLanguage((currentLang) => (currentLang === "en" ? "hi" : "en"));
  }

  function dismissIntro() {
    window.sessionStorage.setItem(introStorageKey, "true");
    setShowIntro(false);
  }

  if (showIntro && route.path === "/") {
    return <IntroOverlay onEnter={dismissIntro} />;
  }

  if (route.path === "/truck-map") {
    const flow = route.params.get("flow") || "Scheduled booking";
    return (
      <>
      <MapSelectionPage
        flow={flow}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onLanguageChange={setLanguage}
        t={t}
      />
      <AssistantWidget pageContext="truck-map" />
      </>
    );
  }

  if (route.path === "/truck-finder") {
    const flow = route.params.get("flow") || "Scheduled booking";
    const selectedState = route.params.get("state") || "";
    const selectedCity = route.params.get("city") || "";
    return (
      <>
      <TruckFinderPage
        flow={flow}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onLanguageChange={setLanguage}
        t={t}
        selectedState={selectedState}
        selectedCity={selectedCity}
      />
      <AssistantWidget pageContext="truck-finder" />
      </>
    );
  }

  if (route.path === "/auth") {
    const role = route.params.get("role") === "owner" ? "owner" : "user";
    const mode = route.params.get("mode") === "signup" ? "signup" : "login";

    return (
      <>
      <AuthPage
        role={role}
        mode={mode}
        theme={theme}
        onToggleTheme={toggleTheme}
        t={t}
        onToggleLanguage={toggleLanguage}
        language={language}
        setCurrentUser={setCurrentUser}
      />
      <AssistantWidget pageContext="auth" />
      </>
    );
  }

  if (route.path === "/booking") {
    return (
      <>
      <BookingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        t={t}
        onToggleLanguage={toggleLanguage}
        language={language}
      />
      <AssistantWidget pageContext="booking" />
      </>
    );
  }

  if (route.path === "/booking-confirmation") {
    return (
      <>
      <BookingConfirmationPage theme={theme} onToggleTheme={toggleTheme} />
      <AssistantWidget pageContext="booking" />
      </>
    );
  }

  if (route.path === "/owner-dashboard") {
    return (
      <>
      <OwnerDashboard theme={theme} onToggleTheme={toggleTheme} t={t} onToggleLanguage={toggleLanguage} language={language} />
      <AssistantWidget pageContext="owner-dashboard" />
      </>
    );
  }

  if (route.path === "/customer-dashboard") {
    return (
      <>
      <CustomerDashboard theme={theme} onToggleTheme={toggleTheme} t={t} onToggleLanguage={toggleLanguage} language={language} />
      <AssistantWidget pageContext="customer-dashboard" />
      </>
    );
  }

  return (
    <>
      <HomePage theme={theme} onToggleTheme={toggleTheme} t={t} onToggleLanguage={toggleLanguage} language={language} currentUser={currentUser} />
      <AssistantWidget pageContext="home" t={t} />
    </>
  );
}
