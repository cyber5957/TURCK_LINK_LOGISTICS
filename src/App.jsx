import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import translations from "./translations";
import { authAPI, truckAPI, bookingAPI } from "./api";
import introAudio from "./assets/media/trucklink-intro.mp3";
import introVideo from "./assets/media/trucklink-intro.mp4";

const OwnerDashboard = lazy(() => import("./pages/Dashboards").then((module) => ({
  default: module.OwnerDashboard,
})));
const CustomerDashboard = lazy(() => import("./pages/Dashboards").then((module) => ({
  default: module.CustomerDashboard,
})));

const heroEssentials = [
  {
    title: "Flexible route planning",
    text: "Choose pickup and delivery locations from an extensive India-wide city list.",
  },
  {
    title: "Streamlined booking requests",
    text: "Share cargo, route, and pickup details through one guided booking flow.",
  },
  {
    title: "Dedicated customer and carrier portals",
    text: "Manage shipment requests and fleet listings in purpose-built workspaces.",
  },
];

const services = [
  "Open truck",
  "Container",
  "Cold chain",
  "Express delivery",
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
    return "Unavailable in demo data";
  }

  return "Marked available in demo data";
}

function getEtaLabel(basePrice, flow) {
  return "Pickup timing to be confirmed by the transport owner";
}

function getTrustHighlights(listing) {
  return [
    listing.verified ? "Demo verification flag" : "Not verified in demo data",
    `${listing.reviewCount || 0} sample reviews`,
    "Performance not validated",
  ];
}

function getRecommendationBadge(listing) {
  return listing.verified ? "Demo listing" : "Sample listing";
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
  showResults = true,
  disabled = false,
}) {
  return (
    <div className={`field-group searchable-field${disabled ? " is-disabled" : ""}`}>
      <span>{label}</span>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {showResults && (
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
      )}
    </div>
  );
}

function IntroOverlay({ onEnter }) {
  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [shouldLoadVideo] = useState(() => (
    !window.matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)").matches
    && !navigator.connection?.saveData
  ));

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
      {shouldLoadVideo && (
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
      )}
      <audio ref={audioRef} loop preload="none">
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

const features = [
  {
    title: "Open truck",
    description: "A flexible option for general cargo and regional deliveries.",
    supporting: "Flexible freight capacity",
  },
  {
    title: "Container",
    description: "Protected transport for packaged goods and consolidated loads.",
    supporting: "Protected cargo transport",
  },
  {
    title: "Cold chain",
    description: "Temperature-controlled transport for sensitive goods.",
    supporting: "Temperature-sensitive freight",
  },
  {
    title: "Express delivery",
    description: "Plan time-sensitive shipments around pickup requirements.",
    supporting: "Time-sensitive delivery",
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
    title: "Review truck options",
    text: "Compare truck types, pricing, ratings, and listing details in one flow.",
  },
  {
    number: "03",
    title: "Submit a booking request",
    text: "Share your shipment details and manage the request through your account.",
  },
];

const bookingOptions = [
  {
    title: "Instant booking",
    text: "Create a shipment request and review available truck options.",
    meta: "Quick booking",
  },
  {
    title: "Scheduled booking",
    text: "Plan your shipment around a preferred pickup date and route.",
    meta: "Planned booking",
  },
  {
    title: "Enterprise contract",
    text: "Recurring contracts and dedicated fleet capacity are opportunities for future expansion.",
    meta: "Growth opportunity",
  },
];

const ownerBenefits = [
  {
    title: "Add a truck listing",
    text: "Manage vehicle type, capacity, routes, pricing, and service details.",
  },
  {
    title: "Review booking requests",
    text: "The owner dashboard shows requests associated with the owner's listed trucks.",
  },
  {
    title: "Update request status",
    text: "Owners can change booking status in the project dashboard. This does not connect to real shipment tracking.",
  },
];

const ownerSignals = [
  { label: "Fleet workspace", value: "Truck listings, routes, and pricing" },
  { label: "Booking management", value: "Review requests and update status" },
];

const coverageStats = [
  { value: `${locationCatalog.length}`, label: "states and union territories in the location directory" },
  {
    value: `${locationCatalog.reduce((total, item) => total + item.cities.length, 0)}+`,
    label: "cities available for route planning",
  },
  { value: "India", label: "location selection for shipment planning" },
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
  { value: "2", label: "account roles: customer and owner" },
  { value: "4", label: "freight categories" },
  { value: "MFA", label: "authenticator-based sign-in support" },
];

const certifications = [
  "Dedicated customer and carrier workspaces",
  "Booking requests with account-based status updates",
  "Authenticator-based multi-factor sign-in",
];

const aboutHighlights = [
  {
    title: "Who we are",
    text: "TruckLink brings shipment discovery, booking requests, and carrier workflows into one digital logistics platform.",
  },
  {
    title: "Mission and values",
    text: "We make freight decisions clearer with structured shipment details, straightforward booking steps, and account-based updates.",
  },
  {
    title: "Safety and reliability",
    text: "Role-based access and secure account workflows provide a foundation for transparent logistics coordination.",
  },
  {
    title: "Our direction",
    text: "We are building a more connected experience for shippers and transport providers.",
  },
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
  if (pageContext === "truck-map") {
    return "Hi, I am TruckMate. I can help you choose a pickup location and understand the next booking steps.";
  }

  if (pageContext === "truck-finder") {
    return "Hi, I am TruckMate. I can help you compare the truck options and sample prices shown here.";
  }

  if (pageContext === "auth") {
    return "Hi, I am TruckMate. I can help you choose the right sign-in or account setup for customers and fleet owners.";
  }

  if (pageContext === "owner-dashboard") {
    return "Hi, I am TruckMate. I can point you to fleet setup, booking requests, and owner account access.";
  }

  if (pageContext === "customer-dashboard") {
    return "Hi, I am TruckMate. I can help you find your bookings, understand shipment statuses, or start a new booking.";
  }

  if (pageContext === "booking") {
    return "Hi, I am TruckMate. I can explain the booking details and what happens after you send a request.";
  }

  return "Hi, I am TruckMate. I can guide you through booking, truck options, pricing information, and fleet owner access.";
}

function ThemeToggle({ theme, onToggle, language = "en" }) {
  const targetTheme = theme === "light" ? "dark" : "light";
  const targetLabel = language === "hi"
    ? targetTheme === "dark" ? "\u0921\u093e\u0930\u094d\u0915" : "\u0932\u093e\u0907\u091f"
    : targetTheme === "dark" ? "Dark" : "Light";
  return (
    <button
      type="button"
      className="control-button theme-toggle"
      onClick={onToggle}
      aria-label={language === "hi" ? `\u0925\u0940\u092e \u0915\u094b ${targetLabel} \u092e\u094b\u0921 \u092e\u0947\u0902 \u092c\u0926\u0932\u0947\u0902` : `Switch to ${targetTheme} theme`}
      title={language === "hi" ? `\u0925\u0940\u092e \u092c\u0926\u0932\u0947\u0902: ${targetLabel}` : `Switch to ${targetTheme} theme`}
    >
      <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
        {theme === "light" ? (
          <path d="M20.2 15.3A8.6 8.6 0 0 1 8.7 3.8 8.7 8.7 0 1 0 20.2 15.3Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        )}
      </svg>
      <span>{targetLabel}</span>
    </button>
  );
}

function LanguageToggle({ language, onToggle }) {
  const current = language === "en" ? "EN" : "हिंदी";
  const next = language === "en" ? "हिंदी" : "EN";

  return (
    <button
      type="button"
      className="control-button language-toggle"
      onClick={onToggle}
      aria-label={language === "en" ? "Switch language to Hindi" : "Switch language to English"}
      title={language === "en" ? "हिंदी में बदलें" : "Switch to English"}
    >
      <span className="language-current">{current}</span>
      <span className="language-arrow" aria-hidden="true">{"\u2192"}</span>
      <span className="language-next">{next}</span>
    </button>
  );
}

function getAssistantIntent(message) {
  const text = message.toLowerCase();

  if (
    text.includes("book a truck") ||
    text.includes("book truck") ||
    text.includes("want to book") ||
    text.includes("make a booking") ||
    text.includes("start a booking") ||
    text.includes("new shipment") ||
    text.includes("book a shipment")
  ) {
    return {
      route: "/truck-map",
      params: { flow: "Instant booking" },
      label: "shipment planner",
    };
  }

  if (
    text.includes("truck owner") ||
    text.includes("fleet owner") ||
    text.includes("owner signup") ||
    text.includes("owner sign up") ||
    text.includes("connect my truck") ||
    text.includes("connect truck") ||
    text.includes("join as owner") ||
    text.includes("list my truck") ||
    text.includes("provider signup") ||
    text.includes("provider sign up")
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
    text.includes("truck finder") ||
    text.includes("truck options")
  ) {
    return {
      route: "/truck-map",
      params: { flow: "Scheduled booking" },
      label: "pickup planner",
    };
  }

  return null;
}

function buildAssistantReply(message, pageContext, intent) {
  const text = message.toLowerCase();

  if (intent?.label) {
    return `I’ll open the ${intent.label} so you can continue.`;
  }

  if (text.includes("book") || text.includes("booking")) {
    return pageContext === "truck-finder"
      ? "Review the listed truck, route, and displayed price, then choose its booking action. Listings and prices shown as sample data should be confirmed before making a real shipment decision."
      : "Choose Book a Shipment to select a pickup location, review matching truck options, and submit a booking request. A request is not confirmed until its status is updated.";
  }

  if (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("fare") ||
    text.includes("cost")
  ) {
    return "Displayed prices can vary by route, truck type, cargo, and availability. Treat any sample listing prices as illustrative and confirm the final amount with the provider before booking.";
  }

  if (
    text.includes("verified") ||
    text.includes("trust") ||
    text.includes("safe") ||
    text.includes("review")
  ) {
    return "Some sample listings may display a verification label, but it is demo information and is not proof of a live KYC or provider background check.";
  }

  if (
    text.includes("owner") ||
    text.includes("provider") ||
    text.includes("connect")
  ) {
    return "Choose owner sign up to create a fleet account. Once signed in, the owner dashboard lets you add trucks, manage availability, and review booking requests.";
  }

  if (
    text.includes("login") ||
    text.includes("signup") ||
    text.includes("account") ||
    text.includes("auth")
  ) {
    return "The sign-in page separates customer and fleet owner access. Customers manage shipment requests; owners manage fleet listings and booking requests.";
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
      return "You are viewing truck options. Review the route and displayed details, and remember that sample listings need confirmation before a real booking.";
    }

    if (pageContext === "owner-dashboard") {
      return "Use Fleet Management to add trucks or update availability, and Bookings to review incoming customer requests.";
    }

    if (pageContext === "customer-dashboard") {
      return "Use My Bookings to review shipment details and status. Choose Book a Shipment whenever you need to start a new request.";
    }

    if (pageContext === "truck-map") {
      return "Choose a pickup state and city on the map or with search, then continue to review matching truck options.";
    }

    return "Choose Book a Shipment to select a pickup location, then review the truck options and booking details.";
  }

  return "I can guide you around the booking flow, explain displayed pricing, or help you find the right account area. Choose a prompt below or ask a question.";
}

function AssistantWidget({ pageContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const redirectTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
        aria-label={isOpen ? "Close TruckMate assistant" : "Open TruckMate assistant"}
        aria-expanded={isOpen}
        aria-controls="truckmate-panel"
      >
        <span className="assistant-truck" aria-hidden="true">
          <span className="assistant-truck-cabin" />
          <span className="assistant-truck-body" />
          <span className="assistant-truck-window" />
          <span className="assistant-truck-wheel assistant-truck-wheel-front" />
          <span className="assistant-truck-wheel assistant-truck-wheel-back" />
        </span>
        <span className="assistant-trigger-copy">
          <span className="assistant-trigger-text">TruckMate</span>
          <span className="assistant-trigger-caption">Guided support</span>
        </span>
        <span className="assistant-trigger-status" aria-hidden="true">Ask</span>
      </button>

      {isOpen && (
        <section className="assistant-panel" id="truckmate-panel" aria-label="TruckMate guided support">
          <div className="assistant-header">
            <div className="assistant-identity">
              <span className="assistant-avatar" aria-hidden="true">TM</span>
              <div>
                <p className="assistant-header-eyebrow">TRUCKLINK SUPPORT</p>
                <h3>TruckMate</h3>
                <span className="assistant-header-caption">Guided help for this page</span>
              </div>
            </div>
            <button
              type="button"
              className="assistant-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <span aria-hidden="true">×</span>
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
                <span className="assistant-message-author">
                  {message.role === "assistant" ? "TruckMate" : "You"}
                </span>
                <p>{message.text}</p>
              </article>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="assistant-prompt-area">
            <p className="assistant-prompt-label">QUICK QUESTIONS</p>
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
          </div>

          <form
            className="assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about booking, pricing, owner access..."
              aria-label="Ask TruckMate a question"
            />
            <button type="submit" className="btn btn-primary assistant-send" disabled={!input.trim()}>
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
        setInfo(response.data.mfaEnrollment
          ? 'Scan the setup QR code, then enter the code to finish creating your account.'
          : 'Enter the 6-digit code from your authenticator app.');
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);

      goToPostAuthDestination(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.request
          ? 'Could not reach the signup server. Check that the backend is running and try again.'
          : 'Unable to submit the form. Please try again.')
      );
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
    <div className="page-shell auth-page">
      <header className="subpage-topbar auth-page-header">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            {"\u2190"}
          </button>
          <LanguageToggle language={language} onToggle={onToggleLanguage} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">TRUCKLINK ACCOUNT SECURITY</p>
          <h1>{isOwner ? "Carrier workspace access" : "Customer workspace access"}</h1>
          <p className="auth-page-subtitle">
            {isSignup
              ? "Create your account with clear, role-based access."
              : "A dedicated sign-in for your logistics workspace."}
          </p>
        </div>
      </header>

      <main>
        <section className="auth-layout">
          <article className="auth-intro-card">
            <div className="auth-security-visual" aria-hidden="true">
              <div className="auth-security-orbit auth-security-orbit-outer" />
              <div className="auth-security-orbit auth-security-orbit-inner" />
              <div className="auth-security-core">
                <svg viewBox="0 0 48 48" fill="none">
                  <path d="M24 5.5 39 11v11.2c0 9.8-6.2 16.5-15 20.3-8.8-3.8-15-10.5-15-20.3V11l15-5.5Z" />
                  <rect x="17" y="21" width="14" height="11" rx="2.5" />
                  <path d="M20 21v-3a4 4 0 0 1 8 0v3" />
                  <circle cx="24" cy="26" r="1.2" />
                  <path d="M24 27.2v2" />
                </svg>
              </div>
              <span className="auth-security-signal auth-security-signal-one" />
              <span className="auth-security-signal auth-security-signal-two" />
              <span className="auth-security-signal auth-security-signal-three" />
              <span className="auth-security-tag">IDENTITY&nbsp; / &nbsp;ACCESS</span>
            </div>
            <span className="auth-trust-kicker">{isOwner ? "CARRIER ACCOUNT ACCESS" : "CUSTOMER ACCOUNT ACCESS"}</span>
            <h3>{isOwner ? "Your fleet deserves a secure place to operate." : "Your shipments deserve a secure place to manage."}</h3>
            <p>
              {isOwner
                ? "Sign in to manage fleet listings and booking requests in your dedicated carrier workspace."
                : "Sign in to manage shipment requests and review booking updates in your customer workspace."}
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
                <span className="auth-benefit-icon" aria-hidden="true">01</span>
                <span className="auth-benefit-copy">
                  <strong>{isOwner ? "Your fleet workspace" : "Your shipment workspace"}</strong>
                  <span>
                    {isOwner
                      ? "Manage truck listings, service details, and availability."
                      : "Review bookings and keep shipment details together."}
                  </span>
                </span>
              </div>
              <div>
                <span className="auth-benefit-icon" aria-hidden="true">02</span>
                <span className="auth-benefit-copy">
                  <strong>Access matched to your role</strong>
                  <span>
                    {isOwner
                      ? "Owner accounts open the carrier dashboard."
                      : "Customer accounts open the shipment dashboard."}
                  </span>
                </span>
              </div>
              <div>
                <span className="auth-benefit-icon auth-benefit-icon-shield" aria-hidden="true">✓</span>
                <span className="auth-benefit-copy">
                  <strong>Authenticator verification</strong>
                  <span>
                    {isSignup
                      ? "New accounts set up an authenticator app during registration."
                      : "If enabled on your account, you’ll confirm sign-in with an authenticator code."}
                  </span>
                </span>
              </div>
            </div>

            <p className="auth-security-footnote">
              Account access is role-based. Use a unique password and keep your authenticator codes private.
            </p>
          </article>

          <article className="auth-form-card">
            <div className="auth-form-header">
              <p className="auth-form-kicker">{isOwner ? "CARRIER PORTAL" : "CUSTOMER PORTAL"}</p>
              <h3>{isSignup ? t("Create your account") : isOwner ? "Welcome back" : t("Welcome back")}</h3>
              <p>
                {isSignup
                  ? "Set up your account to access your dedicated workspace."
                  : "Enter your credentials to continue to your workspace."}
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

            {error && <p className="auth-message auth-message-error" role="alert">{error}</p>}
            {info && <p className="auth-message auth-message-info" role="status">{info}</p>}

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
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
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
                      required
                      placeholder={
                        isOwner ? t("Enter company or owner name") : t("Enter your full name")
                      }
                    />
                  </label>
                )}

                <label className="field-group">
                  <span>{t("Email address")}</span>
                  <input type="email" name="email" placeholder={t("Enter your email")} required />
                </label>

                <label className="field-group">
                  <span>{t("Password")}</span>
                  <input
                    type="password"
                    name="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    placeholder={t("Enter your password")}
                    minLength={isSignup ? 8 : undefined}
                    required
                  />
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
                <p className="auth-form-security-note">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.2 16 4.4v4.5c0 4-2.5 6.8-6 8.4-3.5-1.6-6-4.4-6-8.4V4.4l6-2.2Z" /><path d="m7.5 9.8 1.7 1.7 3.5-3.7" /></svg>
                  {isSignup
                    ? "Your password is protected with a one-way hash. Authenticator setup follows account creation."
                    : "Sign-in is protected by your password and, when enabled, an authenticator code."}
                </p>
              </form>
            )}

          </article>
        </section>
      </main>
    </div>
  );
}

function HomePage({ theme, onToggleTheme, t, onToggleLanguage, language, currentUser, onLogout }) {
  const [activeBooking, setActiveBooking] = useState("Instant booking");
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [conversationTopic, setConversationTopic] = useState("Shipment planning");
  const [conversationBrief, setConversationBrief] = useState("");
  const [briefCopyMessage, setBriefCopyMessage] = useState("");
  const conversationDialogRef = useRef(null);

  useEffect(() => {
    if (isConversationOpen && conversationDialogRef.current && !conversationDialogRef.current.open) {
      conversationDialogRef.current.showModal();
    }
  }, [isConversationOpen]);

  function closeConversation() {
    conversationDialogRef.current?.close();
  }

  function handleBookingChoice(title) {
    setActiveBooking(title);
    goToHash("/truck-map", { flow: title });
  }

  function handleConversationBrief(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const details = String(formData.get("details") || "").trim();

    setConversationBrief([
      "TRUCKLINK — CONVERSATION BRIEF",
      `Topic: ${conversationTopic}`,
      `Name: ${name}`,
      `Work email: ${email}`,
      ...(company ? [`Company: ${company}`] : []),
      ...(details ? [`What I'd like to discuss: ${details}`] : []),
    ].join("\n"));
    setBriefCopyMessage("");
  }

  async function handleCopyConversationBrief() {
    try {
      await navigator.clipboard.writeText(conversationBrief);
      setBriefCopyMessage("Brief copied. It is ready to paste into your message.");
    } catch (error) {
      console.error("Unable to copy conversation brief:", error);
      setBriefCopyMessage("Copy is unavailable in this browser. Select and copy the brief above.");
    }
  }

  const heroMetrics = [
    { value: "2", label: "Customer and carrier portals" },
    { value: "4", label: "Freight categories" },
    { value: "1", label: "Connected booking workflow" },
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
            onClick={() => setIsConversationOpen(true)}
          >
            {t("Contact")}
          </button>
          {currentUser && (
            <button
              type="button"
              className="nav-link-button nav-dashboard"
              onClick={() => goToHash(currentUser.role === 'owner' ? '/owner-dashboard' : '/customer-dashboard')}
            >
              {"\u{1F4CA}"} {t("My Dashboard")}
            </button>
          )}
        </nav>

        <div className="topbar-controls">
          <button
            type="button"
            className="btn btn-outline topbar-cta topbar-contact-link"
            onClick={() => setIsConversationOpen(true)}
          >
            {t("Talk to Our Team")}
          </button>
          <LanguageToggle language={language} onToggle={onToggleLanguage} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
          <button
            type="button"
            className="btn btn-primary topbar-cta"
            onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}
          >
            {t("Book a Shipment")}
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
          {currentUser && (
            <button type="button" className="btn btn-outline topbar-signin" onClick={onLogout}>
              {t("Logout")}
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero-card">
          <div className="hero-copy">
            <span className="badge">Freight booking, simplified</span>
            <h2>
              Move freight with confidence—from booking request to delivery updates.
            </h2>
            <p>
              TruckLink brings shipment discovery, booking requests, and account-based status updates together in one streamlined logistics experience.
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
                onClick={() => setIsConversationOpen(true)}
              >
                {t("Talk to Our Team")}
              </button>
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
              <div>
                <p>{t("Shipment workflow")}</p>
                <span>From shipment details to status updates</span>
              </div>
              <span className="shipment-flow-count">3 steps</span>
            </div>

            <div className="shipment-flow" aria-label="Shipment booking steps">
              {[
                {
                  title: "Share shipment details",
                  detail: "Set pickup, destination, cargo, and date.",
                },
                {
                  title: "Review truck options",
                  detail: "Compare available trucks for your shipment.",
                },
                {
                  title: "Send a booking request",
                  detail: "Follow request status from your account.",
                },
              ].map((step, index) => (
                <article className="shipment-flow-step" key={step.title}>
                  <span className="shipment-flow-index">{`0${index + 1}`}</span>
                  <div>
                    <strong>{t(step.title)}</strong>
                    <p>{t(step.detail)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="shipment-flow-note">
              <span>{t("A request is not a confirmed booking")}</span>
              <p>Confirmation and status updates follow review of your request.</p>
            </div>
          </aside>
        </section>

        <section className="stats-band" aria-label="Project capabilities">
          {heroMetrics.map((stat, index) => (
            <article key={stat.label} className="stat-card" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="stat-content">
                <strong>{stat.value}</strong>
                <span>{t(stat.label)}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="tracking-section" id="tracking">
          <div className="tracking-layout">
            <article className="tracking-card">
              <div className="section-heading">
                <span className="badge neutral">Shipment updates</span>
                <h3>Stay up to date on your shipment</h3>
                <p>
                  Sign in to review booking details and status updates for shipments booked through TruckLink.
                </p>
              </div>

              <button type="button" className="btn btn-primary" onClick={() => goToHash("/auth", { role: "user", mode: "login" })}>
                Sign in to view shipment updates
              </button>
            </article>
          </div>
        </section>

        <section className="content-grid" id="services">
          <div className="section-heading">
            <span className="badge neutral">Freight solutions</span>
            <h3>One platform for a range of shipment needs</h3>
            <p>
              Choose the transport category that best fits your cargo, route, and delivery requirements.
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
            <h3>A streamlined path from planning to booking</h3>
            <p>
              Capture shipment details, review truck options, and submit a booking request through one guided workflow.
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
                  disabled={option.title === "Enterprise contract"}
                  onClick={() => handleBookingChoice(option.title)}
                >
                  {option.title === "Enterprise contract" ? "Growth opportunity" : "Explore booking"}
                </button>
              </article>
            ))}
          </div>

          <div className="booking-banner">
            <div>
              <p className="booking-label">Booking support</p>
              <h4>Every request starts with the shipment details that matter</h4>
            </div>
            <p>
              Add your route, cargo, and pickup timing to create a clear request for review.
            </p>
          </div>
        </section>
        <section className="coverage-section" id="coverage">
          <div className="coverage-overview">
            <div className="section-heading wide">
              <span className="badge neutral">Route planning</span>
              <h3>Plan routes across India</h3>
              <p>
                Select from a broad directory of Indian states and cities. Carrier availability is confirmed as part of the booking process.
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
            <article className="coverage-detail-card">
              <p className="booking-label">{t("Shipment fit")}</p>
              <h4>Example shipment scenarios</h4>
              <div className="coverage-signal-list">
                <div className="coverage-signal-card">
                  <strong>{t("Best for")}</strong>
                  <span>Urgent dispatches, planned trips, and recurring transport requirements.</span>
                </div>
                <div className="coverage-signal-card">
                  <strong>{t("Industries")}</strong>
                  <span>Retail, manufacturing, food, pharmaceuticals, e-commerce, and packaged goods.</span>
                </div>
              </div>
              <ul className="coverage-industry-list">
                {serviceIndustries.map((industry) => (
                  <li key={industry}>{t(industry)}</li>
                ))}
              </ul>
            </article>
          </div>

        </section>

        <section className="trust-section" id="trust">
          <div className="section-heading">
            <span className="badge neutral">A trusted foundation</span>
            <h3>Clear, secure logistics workflows</h3>
            <p>
              Role-based accounts, secure sign-in, and booking status visibility support transparent customer and carrier workflows.
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
              <p className="booking-label">Platform capabilities</p>
              <h4>Designed for confident coordination</h4>
              <ul className="trust-list">
                {certifications.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            </article>
          </div>

        </section>

        <section className="industries-section" id="industries">
          <div className="section-heading">
            <span className="badge neutral">Industry applications</span>
            <h3>Freight workflows for diverse sectors</h3>
            <p>
              A flexible booking flow can support the distinct shipment requirements of industries across the supply chain.
            </p>
          </div>

          <div className="industries-grid">
            {serviceIndustries.map((industry) => (
              <article key={industry} className="industry-card">
                <strong>{t(industry)}</strong>
                <p>Plan shipments around the cargo, route, and pickup requirements of your business.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <span className="badge neutral">{t("About company")}</span>
            <h3>Making freight decisions simpler</h3>
            <p>
              TruckLink brings shipment discovery, booking coordination, and carrier tools together in a single digital experience.
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
              <h3>Manage your fleet and booking requests.</h3>
              <p>
                Keep truck listings, route details, pricing, and customer requests organized in one workspace.
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
              <p className="booking-label">Carrier workspace</p>
              <h4>Fleet and booking management</h4>
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
            <h3>Security built into every account workflow</h3>
            <p>
              Role-based access and authenticator-based multi-factor sign-in help protect customer and carrier accounts.
            </p>
            <ul>
              <li>Customer and owner account roles</li>
              <li>JWT-based authentication and authenticator MFA support</li>
              <li>Booking records with status updates</li>
              <li>Reviews for completed bookings</li>
            </ul>
          </article>

          <article className="light-panel">
            <span className="badge neutral">Growth opportunities</span>
            <h3>Building toward a more connected supply chain</h3>
            <ul>
              <li>Live map route estimation and location-aware pricing</li>
              <li>AI-based truck recommendations from shipment inputs</li>
              <li>GPS-connected shipment tracking</li>
              <li>Online payments and an operator verification workflow</li>
            </ul>
          </article>
        </section>

        {isConversationOpen && (
        <dialog
          ref={conversationDialogRef}
          className="conversation-dialog"
          aria-labelledby="conversation-dialog-title"
          onClose={() => setIsConversationOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeConversation();
            }
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeConversation();
            }
          }}
        >
        <section className="contact-section" id="contact">
          <button
            type="button"
            className="conversation-close"
            aria-label="Close contact dialog"
            onClick={closeConversation}
          >
            <span aria-hidden="true">×</span>
          </button>
          <div className="conversation-heading">
            <span className="badge warm">Let's talk business</span>
            <h3 id="conversation-dialog-title">Good logistics starts with the right conversation.</h3>
            <p>Tell us what you have in mind. We’ll help shape a clear starting point for your discussion.</p>
          </div>

          <div className="conversation-layout">
            <article className="conversation-intro-card">
              <div className="conversation-orbit" aria-hidden="true">
                <span className="conversation-orbit-core">TL</span>
                <i className="conversation-node conversation-node-one" />
                <i className="conversation-node conversation-node-two" />
                <i className="conversation-node conversation-node-three" />
              </div>
              <span className="conversation-card-kicker">A MORE FOCUSED FIRST MEETING</span>
              <h4>Bring the challenge.<br />We’ll map the next step.</h4>
              <p>Prepare a short brief around your shipment needs, fleet opportunity, or platform questions.</p>
              <div className="conversation-points">
                <span><b>01</b> Choose a discussion topic</span>
                <span><b>02</b> Add a little context</span>
                <span><b>03</b> Copy your ready-to-share brief</span>
              </div>
            </article>

            <article className="conversation-builder">
              <form className="conversation-form" onSubmit={handleConversationBrief}>
                <fieldset className="conversation-topic-field">
                  <legend>What would you like to discuss?</legend>
                  <div className="conversation-topic-grid">
                    {[
                      { title: "Shipment planning", detail: "Routes, cargo, and booking needs", icon: "↗" },
                      { title: "Fleet partnership", detail: "Carrier onboarding and operations", icon: "▤" },
                      { title: "Platform walkthrough", detail: "Product, workflow, and capabilities", icon: "◎" },
                    ].map((topic) => (
                      <button
                        key={topic.title}
                        type="button"
                        className={`conversation-topic${conversationTopic === topic.title ? " is-selected" : ""}`}
                        aria-pressed={conversationTopic === topic.title}
                        onClick={() => {
                          setConversationTopic(topic.title);
                          setConversationBrief("");
                          setBriefCopyMessage("");
                        }}
                      >
                        <span className="conversation-topic-icon" aria-hidden="true">{topic.icon}</span>
                        <span className="conversation-topic-title">{topic.title}</span>
                        <span className="conversation-topic-detail">{topic.detail}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="conversation-form-grid">
                  <label className="field-group">
                    <span>Your name</span>
                    <input name="name" type="text" autoComplete="name" placeholder="Name" required />
                  </label>
                  <label className="field-group">
                    <span>Work email</span>
                    <input name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
                  </label>
                </div>
                <label className="field-group">
                  <span>Company <small>Optional</small></span>
                  <input name="company" type="text" autoComplete="organization" placeholder="Company name" />
                </label>
                <label className="field-group">
                  <span>What would make this conversation useful? <small>Optional</small></span>
                  <textarea name="details" rows="3" placeholder="Share a route, business goal, or question..." />
                </label>

                <button type="submit" className="btn btn-primary conversation-submit">
                  Prepare my conversation brief <span aria-hidden="true">→</span>
                </button>
                <p className="conversation-privacy-note">Your details stay in this page. This demo prepares a brief; it does not send or store an inquiry.</p>
              </form>

              {conversationBrief && (
                <div className="conversation-brief" aria-live="polite">
                  <div>
                    <span className="conversation-card-kicker">YOUR BRIEF IS READY</span>
                    <button type="button" className="conversation-copy-button" onClick={handleCopyConversationBrief}>
                      Copy brief
                    </button>
                  </div>
                  <pre>{conversationBrief}</pre>
                  {briefCopyMessage && <p role="status">{briefCopyMessage}</p>}
                </div>
              )}
            </article>
          </div>
        </section>
        </dialog>
        )}
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
          <p>Digital workflows for truck discovery, shipment booking, and carrier operations.</p>
        </div>

        <div className="footer-links">
          <button type="button" className="footer-link-button" onClick={() => goToSection("tracking")}>{t("Tracking")}</button>
          <button type="button" className="footer-link-button" onClick={() => goToSection("coverage")}>{t("Coverage")}</button>
          <button type="button" className="footer-link-button" onClick={() => goToSection("about")}>{t("About")}</button>
          <button type="button" className="footer-link-button" onClick={() => setIsConversationOpen(true)}>{t("Contact")}</button>
        </div>

        <div className="footer-cta">
          <button type="button" className="btn btn-primary" onClick={() => goToHash("/truck-map", { flow: "Scheduled booking" })}>
            {t("Get a Quote")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}>
            {t("Book a Shipment")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setIsConversationOpen(true)}>
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
            weight: 2,
            color: "#ffffff",
            fillColor: "#188a8a",
            fillOpacity: 0.92,
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
        radius: isActive ? 10 : 6,
        color: "#ffffff",
        fillColor: isActive ? "#f28c28" : "#188a8a",
        fillOpacity: isActive ? 1 : 0.92,
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
    <div className="page-shell location-page">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/")}>
            Back to homepage
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">PLAN YOUR SHIPMENT</p>
          <h1>Where should we pick up?</h1>
          <p className="location-page-intro">
            Choose a pickup location to see truck options for your route.
          </p>
        </div>
      </header>

      <main>
        <ol className="location-steps" aria-label="Booking progress">
          <li className="is-current" aria-current="step">
            <span>01</span>
            <div><strong>Pickup location</strong><small>Choose a state and city</small></div>
          </li>
          <li>
            <span>02</span>
            <div><strong>Truck options</strong><small>Compare available listings</small></div>
          </li>
          <li>
            <span>03</span>
            <div><strong>Booking details</strong><small>Review and submit</small></div>
          </li>
        </ol>

        <section className="map-selection-section">
          <div className="map-selection-grid">
            <article className="india-map-card">
              <div className="map-card-header">
                <div>
                  <span className="location-card-eyebrow">PICKUP AREA</span>
                  <h2>Explore the map</h2>
                </div>
                <span className="map-live-label"><i /> Interactive map</span>
              </div>
              <div className="india-map-canvas" ref={mapRef} />
              <div className="map-footer">
                <span className="map-legend-dot" aria-hidden="true" />
                <p>Choose a marker or search for a state to get started.</p>
              </div>
            </article>

            <aside className="city-panel">
              <div className="location-panel-heading">
                <div>
                  <span className="location-card-eyebrow">YOUR PICKUP</span>
                  <h2>{selectedState ? activeState?.label : "Choose a location"}</h2>
                </div>
                <span className={`location-step-number${selectedState ? " is-complete" : ""}`}>
                  {selectedState ? "✓" : "01"}
                </span>
              </div>

              <p className="location-panel-copy">
                {selectedState
                  ? "Now select the city where your shipment will be picked up."
                  : "Select a state on the map or use the search below."}
              </p>

              <SearchableSelector
                label="State or union territory"
                placeholder="Search states and territories"
                value={selectedState}
                query={stateQuery}
                onQueryChange={setStateQuery}
                options={visibleStates.map((state) => state.key)}
                onSelect={handleStateSelection}
                emptyMessage="No states match this search."
                showResults={stateQuery !== selectedState}
              />

              <SearchableSelector
                label="Pickup city"
                placeholder={selectedState ? "Search cities" : "Choose a state first"}
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
                showResults={Boolean(selectedState) && cityQuery !== selectedCity}
                disabled={!selectedState}
              />

              <div className={`city-grid${cityQuery !== selectedCity ? " is-searching" : ""}`}>
                {activeState ? (
                  visibleCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className={`city-chip ${selectedCity === city ? 'active' : ''}`}
                      onClick={() => handleCitySelection(city)}
                      aria-pressed={selectedCity === city}
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="city-placeholder">
                    <span aria-hidden="true">⌖</span>
                    <p>Available cities will appear here</p>
                  </div>
                )}
              </div>

              {error && <p className="field-error">{error}</p>}

              <button
                type="button"
                className="btn btn-primary full-width"
                onClick={handleContinue}
                disabled={!selectedState || !selectedCity}
              >
                View truck options <span aria-hidden="true">→</span>
              </button>
              <p className="location-secure-note">You can review your selection before submitting a booking.</p>
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
  const [retryCount, setRetryCount] = useState(0);
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
        setError("Unable to load truck options.");
        console.error("Error fetching trucks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [selectedService, verifiedOnly, priceLimit, retryCount]);

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
    <div className="page-shell truck-finder-page">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            Back to homepage
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">SHIPMENT PLANNING <span>/</span> {flow.toUpperCase()}</p>
          <h1>Find the right truck for your shipment</h1>
          <p className="finder-page-intro">
            Compare truck options and refine your search to match your cargo and budget.
          </p>
        </div>
      </header>

      <main>
        <section className="truck-finder-section truck-finder-section-active">
          <div className="finder-layout">
            <aside className="finder-panel">
              <div className="finder-heading">
                <div>
                  <span className="finder-panel-kicker">REFINE YOUR SEARCH</span>
                  <h2>Filters</h2>
                </div>
                <span className="finder-filter-icon" aria-hidden="true">≡</span>
              </div>

              <label className="field-group finder-field">
                <span>Route, truck, cargo, or provider</span>
                <input
                  type="text"
                  placeholder="Try Delhi, container, electronics..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>

              <label className="field-group finder-field">
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
                showResults={stateQuery !== selectedState}
              />

              <SearchableSelector
                label="Pickup city"
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
                showResults={Boolean(selectedState) && cityQuery !== selectedCity}
                disabled={!selectedState}
              />

              <div className="field-group finder-field">
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
                <span>Show listings marked as verified</span>
              </label>

              <button
                type="button"
                className="finder-reset-button"
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
                Reset all filters
              </button>
            </aside>

            <div className="listing-stack">
              <div className="listing-results-header">
                <div>
                  <span className="finder-panel-kicker">MATCHING OPTIONS</span>
                  <h2>Available trucks</h2>
                </div>
                <span className="listing-result-count">
                  {loading ? "Searching..." : `${filteredListings.length} ${filteredListings.length === 1 ? "option" : "options"}`}
                </span>
              </div>
              <p className="listing-data-note">
                Listing details and prices are indicative and should be confirmed with the provider before booking.
              </p>
              {loading ? (
                <>
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                </>
              ) : error ? (
                <article className="empty-state">
                  <h4>Ohh, sorry—we couldn't load truck options right now.</h4>
                  <p>Please try again in a moment. Your search filters will stay in place.</p>
                  <button
                    type="button"
                    className="btn btn-primary small"
                    onClick={() => setRetryCount((count) => count + 1)}
                  >
                    Try again
                  </button>
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
                          {listing.verified ? "Demo verification flag" : "Sample profile"}
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
                        <small>Confirm final pricing and inclusions with the provider.</small>
                      </div>

                      <div className="rating-block">
                        <strong>{listing.rating}/5</strong>
                        <span>{listing.reviewCount} sample reviews</span>
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
                        {listing.availability ? "Availability to be confirmed" : "Currently unavailable"}
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
                  <h4>
                    {selectedState
                      ? `Ohh, sorry—we couldn't find truck options for ${selectedState} with this search.`
                      : "Ohh, sorry—we couldn't find any truck options for this search."}
                  </h4>
                  <p>
                    {selectedState
                      ? "Please try another city or adjust your filters to explore other options."
                      : "Please adjust your filters or search another location and we’ll check again."}
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
    try {
      if (!window.localStorage.getItem("token")) {
        goToHash("/auth", { role: "user", mode: "login", redirect: "/booking" });
        return;
      }

      const response = await bookingAPI.createBooking({
        truckId: draft.truckId,
        pickupLocation: data.pickupLocation,
        deliveryLocation: data.deliveryLocation,
        cargoType: data.cargoType,
        weight: `${data.weight} tons`,
        contactPhone: data.phone,
        pickupDate: data.pickupDate,
        specialInstructions: data.specialInstructions,
      });
      const savedBooking = response.data.booking;
      if (!savedBooking?._id || !savedBooking.bookingReference) {
        throw new Error("The server did not return a saved booking record.");
      }

      const confirmation = {
        ...draft,
        ...data,
        bookingId: savedBooking._id,
        bookingReference: savedBooking.bookingReference,
        customerEmail: response.data.email?.recipient || "",
        quotedPrice: savedBooking.price,
        estimatedPickup: "To be confirmed by the transport owner",
        status: "Request received; awaiting carrier confirmation",
        bookingSaved: true,
        emailSent: response.data.email?.sent === true,
        emailReason: response.data.email?.reason || "",
      };

      window.sessionStorage.setItem(
        bookingStorageKeys.confirmation,
        JSON.stringify(confirmation)
      );
      goToHash("/booking-confirmation");
    } catch (error) {
      console.error("Error creating booking:", error);
      setSubmitError(error.response?.data?.message || error.message || "We could not save the booking right now. Please try again.");
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
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>
        <div className="subpage-copy">
          <p className="eyebrow">Booking form</p>
          <h1>Enter shipment details and send a booking request.</h1>
        </div>
      </header>

      <main className="booking-form-layout">
        <aside className="booking-summary-card">
          <span className="badge neutral">Selected truck</span>
          <h3>{draft.truckType} - {draft.capacity}</h3>
          <p>{draft.route}</p>
          <div className="booking-summary-list">
            <div><strong>Provider</strong><span>{draft.providerName}</span></div>
            <div><strong>Sample base price</strong><span>{formatPrice(draft.basePrice)}</span></div>
            <div><strong>Pickup city</strong><span>{draft.city || "Flexible"}</span></div>
              <div><strong>Demo rating</strong><span>{draft.rating}/5 from {draft.reviewCount} sample reviews</span></div>
          </div>
          <p className="booking-price-note">Demo estimate only. Pricing has not been validated with a transport provider.</p>
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
                <input type="date" name="pickupDate" min={new Date().toISOString().split("T")[0]} required />
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
                {submitting ? "Saving request..." : "Send booking request"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function BookingConfirmationPage({ theme, onToggleTheme, language }) {
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

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char]);

  function downloadReceipt() {
    const rows = [
      ["Reference", confirmation.bookingReference],
      ["Customer email", confirmation.customerEmail],
      ["Truck", `${confirmation.truckType} - ${confirmation.capacity}`],
      ["Transport partner", confirmation.providerName],
      ["Pickup", confirmation.pickupLocation],
      ["Delivery", confirmation.deliveryLocation],
      ["Cargo", confirmation.cargoType],
      ["Weight", `${confirmation.weight} tons`],
      ["Pickup date", confirmation.pickupDate],
      ["Estimated total", formatPrice(confirmation.quotedPrice)],
      ["Pickup estimate", confirmation.estimatedPickup],
      ["Status", confirmation.status],
    ];
    const tableRows = rows.map(([label, value]) =>
      `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "Not provided")}</td></tr>`
    ).join("");
    const receipt = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TruckLink booking receipt ${escapeHtml(confirmation.bookingReference)}</title><style>body{font:16px/1.5 Arial,sans-serif;color:#17202b;max-width:760px;margin:40px auto;padding:24px}header{border-bottom:3px solid #f99a2e;padding-bottom:18px;margin-bottom:24px}h1{margin:0;color:#123044}p{color:#52616d}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid #dfe5e9}th{width:34%;color:#52616d}.ref{font-size:1.15rem;font-weight:bold;color:#0b6171}@media print{body{margin:0 auto}}</style><body><header><h1>TruckLink Logistics</h1><p>Booking receipt</p><div class="ref">Reference ${escapeHtml(confirmation.bookingReference)}</div></header><table>${tableRows}</table><p>This receipt confirms that your booking request was received. Carrier confirmation may follow.</p></body></html>`;
    const blob = new Blob([receipt], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TruckLink-Receipt-${String(confirmation.bookingReference || "booking").replace(/[^a-z0-9-]/gi, "")}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="page-shell">
      <header className="subpage-topbar">
        <div className="subpage-actions">
          <button type="button" className="btn btn-outline" onClick={() => goToHash("/")}>
            Back to homepage
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>
        <div className="subpage-copy">
          <p className="eyebrow">Booking confirmation</p>
          <h1>Your booking request was saved.</h1>
        </div>
      </header>

      <main className="confirmation-shell">
        <section className="confirmation-hero">
          <span className="confirmation-success-icon" aria-hidden="true">{"\u2713"}</span>
          <span className="badge warm">Reference {confirmation.bookingReference}</span>
          <h3>{confirmation.truckType} from {confirmation.providerName}</h3>
          <p>{confirmation.status}</p>
          {confirmation.emailSent ? (
            <p className="confirmation-email-note">Booking request receipt sent to {confirmation.customerEmail}. A transport owner still needs to confirm availability.</p>
          ) : (
            <p className="confirmation-email-note">Booking request saved. {confirmation.emailReason === "not_configured" ? "Email delivery is not configured for this project." : "A confirmation email was not sent; you can download a local receipt below."}</p>
          )}
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
              <div><strong>Pickup timing</strong><span>To be confirmed by the transport owner</span></div>
              <div><strong>Flow</strong><span>{confirmation.flow}</span></div>
                  <div><strong>Next step</strong><span>The carrier must confirm availability</span></div>
            </div>
          </article>
        </section>

        <div className="booking-form-actions">
          <button type="button" className="btn btn-primary" onClick={downloadReceipt}>
            Download booking receipt
          </button>
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

  const t = (key) => translations[language]?.[key] ?? translations.en?.[key] ?? key;

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

  function handleLogout() {
    const logoutRequest = authAPI.logout();
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    window.sessionStorage.setItem(introStorageKey, "true");
    setCurrentUser(null);
    setShowIntro(false);
    goToHash("/");

    logoutRequest.catch((error) => {
      console.error("Could not revoke the server session during logout:", error.message);
    });
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
      <BookingConfirmationPage theme={theme} onToggleTheme={toggleTheme} language={language} />
      <AssistantWidget pageContext="booking" />
      </>
    );
  }

  if (route.path === "/owner-dashboard") {
    return (
      <>
      <Suspense fallback={<div className="dashboard-loading" role="status">Loading your workspace...</div>}>
        <OwnerDashboard theme={theme} onToggleTheme={toggleTheme} t={t} onToggleLanguage={toggleLanguage} language={language} onLogout={handleLogout} goToHash={goToHash} ThemeToggle={ThemeToggle} LanguageToggle={LanguageToggle} />
      </Suspense>
      <AssistantWidget pageContext="owner-dashboard" />
      </>
    );
  }

  if (route.path === "/customer-dashboard") {
    return (
      <>
      <Suspense fallback={<div className="dashboard-loading" role="status">Loading your workspace...</div>}>
        <CustomerDashboard theme={theme} onToggleTheme={toggleTheme} t={t} onToggleLanguage={toggleLanguage} language={language} onLogout={handleLogout} goToHash={goToHash} ThemeToggle={ThemeToggle} LanguageToggle={LanguageToggle} />
      </Suspense>
      <AssistantWidget pageContext="customer-dashboard" />
      </>
    );
  }

  return (
    <>
      <HomePage theme={theme} onToggleTheme={toggleTheme} t={t} onToggleLanguage={toggleLanguage} language={language} currentUser={currentUser} onLogout={handleLogout} />
      <AssistantWidget pageContext="home" t={t} />
    </>
  );
}
