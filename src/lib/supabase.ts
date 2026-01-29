// Lightweight local replacement of Supabase client and types.
// This file provides the `Product` type and a tiny in-memory API
// used by the app so we can remove Supabase without touching
// most of the UI code.

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  skin_concerns: string[];
  rating: number;
  ingredients: string;
  created_at: string;
}

export interface ScanHistory {
  id: string;
  user_id?: string;
  image_url?: string;
  analysis_results: Record<string, any>;
  skin_concerns: string[];
  skin_type: string;
  confidence_score: number;
  spots_score: number;
  wrinkles_score: number;
  texture_score: number;
  acne_score: number;
  dark_circles_score: number;
  redness_score: number;
  oiliness_score: number;
  moisture_score: number;
  pores_score: number;
  eye_bags_score: number;
  radiance_score: number;
  firmness_score: number;
  droopy_upper_eyelid_score: number;
  droopy_lower_eyelid_score: number;
  detailed_analysis: string;
  recommendations: string;
  created_at: string;
}

export interface RecommendedProduct {
  id: string;
  scan_id: string;
  product_id: string;
  relevance_score: number;
  created_at: string;
  product?: Product;
}

// --- In-memory data store (mock) ---
const sampleProducts: Product[] = [
  {
    id: 'p1',
    name: 'Gentle Cleanser',
    brand: 'DermaCare',
    description: 'A mild cleanser suitable for sensitive skin',
    image_url: '/image.png',
    price: 12.99,
    category: 'cleanser',
    skin_concerns: ['sensitivity', 'dryness'],
    rating: 4.6,
    ingredients: 'Aqua, Glycerin, ...',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Hydrating Serum',
    brand: 'GlowLab',
    description: 'Boosts moisture and radiance',
    image_url: '/image.png',
    price: 29.5,
    category: 'serum',
    skin_concerns: ['dryness', 'wrinkles'],
    rating: 4.8,
    ingredients: 'Hyaluronic Acid, Vitamin E, ...',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'SPF 50 Mineral',
    brand: 'SunGuard',
    description: 'Lightweight mineral sunscreen',
    image_url: '/image.png',
    price: 19.99,
    category: 'sunscreen',
    skin_concerns: ['sensitivity', 'dark_spots'],
    rating: 4.7,
    ingredients: 'Zinc Oxide, Titanium Dioxide, ...',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Overnight Retinol',
    brand: 'Renew',
    description: 'Targets fine lines and texture',
    image_url: '/image.png',
    price: 34.0,
    category: 'treatment',
    skin_concerns: ['wrinkles', 'texture'],
    rating: 4.5,
    ingredients: 'Retinol, Peptides, ...',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Oil Control Toner',
    brand: 'MatteSkin',
    description: 'Helps reduce oiliness and minimize pores',
    image_url: '/image.png',
    price: 14.25,
    category: 'toner',
    skin_concerns: ['oiliness', 'pores'],
    rating: 4.2,
    ingredients: 'Niacinamide, Witch Hazel, ...',
    created_at: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: 'Soothing Eye Cream',
    brand: 'BrightEyes',
    description: 'Reduces dark circles and puffiness',
    image_url: '/image.png',
    price: 22.0,
    category: 'eye_cream',
    skin_concerns: ['dark_spots', 'eye_bags'],
    rating: 4.4,
    ingredients: 'Caffeine, Vitamin K, ...',
    created_at: new Date().toISOString(),
  },
];

const scanHistoryStore: ScanHistory[] = [];
const recommendedStore: RecommendedProduct[] = [];

// Helper to mimic Supabase response shape { data, error }
function ok<T>(data: T) {
  return { data, error: null } as const;
}

export async function fetchProducts(opts?: { concerns?: string[]; limit?: number }): Promise<{ data: Product[]; error: null }> {
  // simple filter: if concerns provided, return products that include any of them
  let results = [...sampleProducts];
  if (opts?.concerns && opts.concerns.length > 0) {
    results = results.filter((p) => p.skin_concerns.some((c) => opts.concerns!.includes(c)));
  }
  // order by rating desc
  results.sort((a, b) => b.rating - a.rating);
  if (opts?.limit) results = results.slice(0, opts.limit);
  return ok(results);
}

export async function saveScan(scan: Omit<ScanHistory, 'id' | 'created_at'>): Promise<{ data: ScanHistory; error: null }> {
  const id = `s_${Date.now()}`;
  const record: ScanHistory = { id, ...scan, created_at: new Date().toISOString() } as ScanHistory;
  scanHistoryStore.push(record);
  return ok(record);
}

export async function saveRecommendedProducts(recs: Omit<RecommendedProduct, 'id' | 'created_at'>[]): Promise<{ data: RecommendedProduct[]; error: null }> {
  const inserted = recs.map((r, idx) => ({ id: `r_${Date.now()}_${idx}`, ...r, created_at: new Date().toISOString() }));
  recommendedStore.push(...(inserted as RecommendedProduct[]));
  return ok(inserted);
}

export async function getAllProducts(limit?: number): Promise<{ data: Product[]; error: null }> {
  return fetchProducts({ limit });
}

// keep named exports compatible with previous imports for minimal changes
export default {
  fetchProducts,
  saveScan,
  saveRecommendedProducts,
  getAllProducts,
};
