export interface ProductVariant {
  id?: number;
  product_id?: number;
  size: string;
  color: string;
  shape: string;
  image: string;
  stock_status?: "In Stock" | "Low Stock" | "Pre-Order" | "Out of Stock";
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stockStatus: "In Stock" | "Low Stock" | "Pre-Order" | "Out of Stock";
  stock_status?: "In Stock" | "Low Stock" | "Pre-Order" | "Out of Stock";
  image: string;
  description: string;
  featured?: boolean;
  is_new?: boolean;
  has_options?: boolean;
  variants?: ProductVariant[];
}

export const products: Product[] = [
  // ---- RPM ----
  { id: 1, name: "RPM Q2", brand: "RPM", price: 13000, stockStatus: "In Stock", image: "/paddles/Q2.png", description: "A premium paddle designed for balanced power and control, suitable for competitive players.", featured: true },
  { id: 2, name: "RPM Friction Pro V2", brand: "RPM", price: 13000, stockStatus: "In Stock", image: "/paddles/RPMFPRO2.png", description: "A Gen. 2 paddle with an advanced carbon fiber face for maximum friction and spin, with a responsive core.", featured: true },
  { id: 3, name: "RPM Friction Pro", brand: "RPM", price: 13000, stockStatus: "In Stock", image: "/paddles/RPMFP.png", description: "The Gen. 1 paddle featuring a high-friction carbon weave face with a 16mm core for maximum spin generation.", featured: false },

  // ---- CRBN ----
  { id: 4, name: "CRBN TruFoam Barrage", brand: "CRBN", price: 12000, stockStatus: "In Stock", image: "/paddles/CRBNBARRAGE.png", description: "A modern hybrid shape with AeroCurve for faster swings and a TruFoam core for an expanded sweet spot.", featured: true },

  // ---- Honolulu ----
  { id: 5, name: "Honolulu J6CR", brand: "Honolulu", price: 13000, stockStatus: "In Stock", image: "/paddles/J6CR.png", description: "Carbon resin infused paddle built for aggressive players who demand power and precision.", featured: false },
  { id: 6, name: "Honolulu J2CR Crystal Blue", brand: "Honolulu", price: 14000, stockStatus: "In Stock", image: "/paddles/J2CR.png", description: "Features a Crystal Blue Endurance Surface for enhanced durability and consistent spin.", featured: true },
  { id: 7, name: "Honolulu J6CR Crystal Blue", brand: "Honolulu", price: 14000, stockStatus: "In Stock", image: "/paddle-depot-logo.png", description: "Combines the J6CR's power with the Crystal Blue Endurance Surface for maximum performance.", featured: true },

  // ---- Franklin ----
  { id: 8, name: "Franklin C45 (Anna Leigh Waters)", brand: "Franklin", price: 14000, stockStatus: "In Stock", image: "/paddles/C45ANNA.png", description: "Anna Leigh Waters' signature paddle, engineered with a C45 carbon fiber face for elite power and touch.", featured: true },

  // ---- Kamito ----
  { id: 9, name: "Kamito Alpha X (Her Power)", brand: "Kamito", price: 10000, stockStatus: "In Stock", image: "/paddles/HERPOWER.png", description: "A special edition paddle celebrating female players, offering a blend of control and pop.", featured: true },
  { id: 10, name: "Kamito Alpha X", brand: "Kamito", price: 10000, stockStatus: "In Stock", image: "/paddles/ALPHA.png", description: "The standard Alpha X, designed for all-court players seeking a reliable and responsive paddle.", featured: false },
  { id: 11, name: "Kamito Genesis", brand: "Kamito", price: 10000, stockStatus: "In Stock", image: "/paddles/GENESIS.png", description: "A great entry-point into the Kamito line, offering a forgiving face and comfortable grip.", featured: false },

  // ---- Selkirk ----
  { id: 12, name: "Selkirk Boomstik 1766 Capsule", brand: "Selkirk", price: 20000, stockStatus: "In Stock", image: "/paddles/SK1766.png", description: "A limited edition capsule release of the high-performance Boomstik paddle.", featured: true },
  { id: 13, name: "Selkirk Labs Project Boomstik", brand: "Selkirk", price: 17000, stockStatus: "In Stock", image: "/paddles/SKBS.png", description: "Raw carbon fiber surface from the Selkirk LABS series, designed for maximum spin and a crisp feel.", featured: false },
  { id: 14, name: "Selkirk Boomstik Jack Sock", brand: "Selkirk", price: 18000, stockStatus: "In Stock", image: "/paddles/SKJS.png", description: "The signature paddle of tennis pro Jack Sock, optimized for power and aggressive play.", featured: true },
  { id: 15, name: "Selkirk Labs Project Boomstik ASIA", brand: "Selkirk", price: 14000, stockStatus: "In Stock", image: "/paddles/SKASIAN.png", description: "A special edition of the Boomstik designed for the Asian market with unique aesthetics.", featured: false },
  { id: 16, name: "Selkirk SLK Dauntless", brand: "Selkirk", price: 9000, stockStatus: "In Stock", image: "/paddles/DAUNTLESS.png", description: "A reliable paddle from the SLK line, offering a large sweet spot and consistent performance.", featured: false },
  { id: 17, name: "Selkirk SLK Era Power", brand: "Selkirk", price: 9000, stockStatus: "In Stock", image: "/paddles/ERA.png", description: "Engineered for power players, this SLK paddle features a harder face for increased pop.", featured: false },

  // ---- Bread and Butter ----
  { id: 18, name: "Bread and Butter Loco", brand: "Bread and Butter", price: 13500, stockStatus: "In Stock", image: "/paddles/BNDLOCO.png", description: "The flagship paddle known for its unique design and all-around playability.", featured: true },
  { id: 19, name: "Bread and Butter Loco Azul", brand: "Bread and Butter", price: 14500, stockStatus: "In Stock", image: "/paddles/LOCOAZUL.png", description: "An elongated hybrid shape version of the Loco, providing extra reach and power in a stylish blue design.", featured: true },

  // ---- Sypik ----
  { id: 20, name: "Sypik Avatar Ultimate Pro QD", brand: "Sypik", price: 12500, stockStatus: "In Stock", image: "/paddles/AVATAR.png", description: "The ultimate pro version of the Avatar, co-designed with Quang Duong for peak performance.", featured: true },
  { id: 21, name: "Sypik Triton 5 Ultimate Pro", brand: "Sypik", price: 10000, stockStatus: "In Stock", image: "/paddles/TRITON.png", description: "A versatile all-court paddle with a hybrid carbon/fiberglass face for balanced performance.", featured: false },

  // ---- Luzz ----
  { id: 22, name: "Luzz Inferno", brand: "Luzz", price: 13000, stockStatus: "In Stock", image: "/paddles/LUZZINFERNO.png", description: "A high-performance paddle designed for aggressive players who favor power and spin.", featured: true },

  // ---- Friday ----
  { id: 23, name: "Friday Aura Pro (Elongated)", brand: "Friday", price: 10000, stockStatus: "In Stock", image: "/paddles/FRIDAY.png", description: "An elongated shape paddle with a gritty surface for enhanced spin and reach at the net.", featured: true },

  // ---- JOOLA ----
  {
    id: 24,
    name: "JOOLA Ben Johns Hyperion 3S 16mm",
    brand: "JOOLA",
    price: 13000,
    stockStatus: "In Stock",
    image: "/paddle-depot-logo.png",
    description: "Co-designed with Ben Johns, this Gen. 3 paddle offers a unique shape for enhanced swing speed and power.",
    featured: true,
  },
  { id: 25, name: "JOOLA Hyperion 3S Dual", brand: "JOOLA", price: 12000, stockStatus: "In Stock", image: "/paddle-depot-logo.png", description: "Features a dual-sided face with different textures, allowing players to switch between spin and control.", featured: false },
  {
    id: 26,
    name: "JOOLA Perseus Pro V",
    brand: "JOOLA",
    price: 17700,
    stockStatus: "In Stock",
    image: "/paddle-depot-logo.png",
    description: "The next evolution of the Perseus line, this Gen. 5 paddle features Pro-V technology for an optimized sweet spot and feel.",
    featured: true,
  },
  { id: 27, name: "JOOLA Kosmos Pro V", brand: "JOOLA", price: 17700, stockStatus: "In Stock", image: "/paddle-depot-logo.png", description: "A wide-body Gen. 5 paddle with Pro-V technology, offering a massive sweet spot and unmatched forgiveness.", featured: false },
  { id: 28, name: "JOOLA Scorpeus Pro V", brand: "JOOLA", price: 17700, stockStatus: "In Stock", image: "/paddle-depot-logo.png", description: "A Gen. 5 paddle designed for quick hands at the net, providing exceptional maneuverability and response.", featured: false },
  { id: 29, name: "JOOLA Hyperion Pro V", brand: "JOOLA", price: 17700, stockStatus: "In Stock", image: "/paddle-depot-logo.png", description: "An all-court Gen. 5 paddle featuring Pro-V Technology for a perfect blend of power, control, and spin.", featured: false },
  {
    id: 30,
    name: "JOOLA Andre Agassi Pro V",
    brand: "JOOLA",
    price: 18500,
    stockStatus: "In Stock",
    image: "/paddle-depot-logo.png",
    description: "The signature Gen. 5 paddle of tennis legend Andre Agassi, designed for players who dictate the point.",
    featured: true,
  },
];

