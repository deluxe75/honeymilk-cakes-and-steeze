import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// --------------------------------------------------------------------
// PERSISTENT DATA STORE (Mirroring MySQL tables)
// --------------------------------------------------------------------
const DATA_FILE = path.join(process.cwd(), 'database', 'data-store.json');

interface ProductOption {
  id: number;
  option_type: 'size' | 'flavor' | 'filling' | 'addon';
  name: string;
  price_adjustment: number;
  is_default: boolean;
  sort_order: number;
}

interface ProductItem {
  id: number;
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  image_url: string;
  badge?: string;
  is_featured: boolean;
  is_popular: boolean;
  is_available: boolean;
  prep_time_hours: number;
}

interface OrderItem {
  product_id?: number;
  product_name: string;
  size_selected: string;
  flavor_selected: string;
  filling_selected?: string;
  addons_selected?: string[];
  unit_price: number;
  quantity: number;
  subtotal: number;
  item_notes?: string;
}

interface StatusTimelineEntry {
  status: string;
  notes: string;
  created_at: string;
  changed_by: string;
}

interface OrderRecord {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  delivery_type: 'pickup' | 'delivery';
  delivery_state?: string;
  delivery_city?: string;
  delivery_area?: string;
  delivery_address?: string;
  delivery_date: string;
  delivery_time_slot: string;
  cake_message?: string;
  special_instructions?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cash_on_delivery';
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';
  paystack_reference?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  timeline: StatusTimelineEntry[];
}

interface CustomOrderRecord {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  occasion: string;
  cake_type: string;
  flavor: string;
  size: string;
  filling?: string;
  theme?: string;
  color_preference?: string;
  servings: number;
  budget_tier: string;
  event_date: string;
  cake_message?: string;
  special_instructions?: string;
  estimated_price?: number;
  status: 'new' | 'reviewing' | 'quoted' | 'accepted' | 'rejected' | 'converted';
  images: string[];
  created_at: string;
}

interface DataStore {
  products: ProductItem[];
  options: ProductOption[];
  orders: OrderRecord[];
  custom_orders: CustomOrderRecord[];
  reviews: any[];
  settings: Record<string, string>;
}

function loadDataStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading data store, reinitializing:', e);
  }

  // Seed default data matching database/seed.sql
  const initialStore: DataStore = {
    products: [
      {
        id: 1,
        category_slug: 'celebration',
        name: 'The Golden Honeycomb Velvet',
        slug: 'golden-honeycomb-velvet',
        description: 'Our defining masterpiece. Four tiers of wildflower honey sponge soaked in golden bourbon syrup, layered with house-made honeycomb crunch praline and whipped Madagascar vanilla bean cream.',
        base_price: 48000.0,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
        badge: 'Chef Signature',
        is_featured: true,
        is_popular: true,
        is_available: true,
        prep_time_hours: 24
      },
      {
        id: 2,
        category_slug: 'celebration',
        name: 'Steeze Pistachio & Cardamom Noir',
        slug: 'pistachio-cardamom-noir',
        description: 'Raw pistachio dacquoise cake, scented with freshly crushed green cardamom, layered with whipped white chocolate ganache and edged in 24k edible gold dust.',
        base_price: 54000.0,
        image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
        badge: 'Editor Favorite',
        is_featured: true,
        is_popular: true,
        is_available: true,
        prep_time_hours: 24
      },
      {
        id: 3,
        category_slug: 'birthday',
        name: 'Midnight Valrhona & Espresso Ganache',
        slug: 'midnight-valrhona-espresso',
        description: '70% Guanaja single-origin dark chocolate layers layered with smoked espresso buttercream and salted caramel pearls, crowned with obsidian drip.',
        base_price: 46000.0,
        image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80',
        badge: 'Bestseller',
        is_featured: true,
        is_popular: true,
        is_available: true,
        prep_time_hours: 18
      },
      {
        id: 4,
        category_slug: 'wedding',
        name: 'The Alabaster Architectural Tier',
        slug: 'alabaster-architectural-tier',
        description: 'Modern minimalism meeting haute pâtisserie. 3 sculpted white marble tiers filled with champagne sponge and passionfruit-rose curd. Serves up to 75.',
        base_price: 145000.0,
        image_url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=80',
        badge: 'Couture Commission',
        is_featured: true,
        is_popular: false,
        is_available: true,
        prep_time_hours: 72
      },
      {
        id: 5,
        category_slug: 'mini',
        name: 'HoneyMilk Bento Duo Box',
        slug: 'honeymilk-bento-duo-box',
        description: 'Two 4-inch bespoke bento cakes in our signature eco-luxe takeaway box with bamboo forks and beeswax candle. Choose custom messages for each.',
        base_price: 26000.0,
        image_url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=1000&q=80',
        badge: 'Trending',
        is_featured: true,
        is_popular: true,
        is_available: true,
        prep_time_hours: 12
      },
      {
        id: 6,
        category_slug: 'cupcakes',
        name: '24k Honeyed Gold Cupcake Box (Dozen)',
        slug: '24k-gold-cupcake-box',
        description: 'Twelve handcrafted honey cupcakes filled with dulce de leche and topped with Swiss meringue buttercream and genuine 24k gold leaf.',
        base_price: 32000.0,
        image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1000&q=80',
        badge: 'Box of 12',
        is_featured: false,
        is_popular: true,
        is_available: true,
        prep_time_hours: 12
      },
      {
        id: 7,
        category_slug: 'birthday',
        name: 'Red Velvet Steeze & Cream Cheese Silk',
        slug: 'red-velvet-steeze',
        description: 'Traditional Southern red velvet reimagined with cocoa nib crunch, silky Philadelphia cream cheese mousse, and dramatic scarlet velvet spray.',
        base_price: 45000.0,
        image_url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=80',
        badge: 'Classic',
        is_featured: false,
        is_popular: true,
        is_available: true,
        prep_time_hours: 18
      },
      {
        id: 8,
        category_slug: 'anniversary',
        name: 'Strawberries & Normandy Cream Cloud',
        slug: 'strawberries-normandy-cream',
        description: 'Chiffon sponge drenched in elderflower nectar, layered with macerated Japanese strawberries and light-as-air Normandy cultured cream.',
        base_price: 42000.0,
        image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=80',
        badge: 'Fresh Fruit',
        is_featured: true,
        is_popular: false,
        is_available: true,
        prep_time_hours: 24
      },
      {
        id: 9,
        category_slug: 'celebration',
        name: 'Caramelized Pecan & Salted Brown Butter',
        slug: 'pecan-brown-butter-cake',
        description: 'Nutty roasted brown butter cake with slow-cooked bourbon caramel, toasted Georgia pecans, and fleur de sel flakes.',
        base_price: 49000.0,
        image_url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=1000&q=80',
        badge: 'Limited Batch',
        is_featured: false,
        is_popular: true,
        is_available: true,
        prep_time_hours: 24
      },
      {
        id: 10,
        category_slug: 'mini',
        name: 'Matcha Ceremonial & White Peach Mini',
        slug: 'matcha-white-peach-mini',
        description: 'Uji ceremonial grade green tea sponge paired with delicate white peach compote and silky mascarpone frosting.',
        base_price: 28000.0,
        image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1000&q=80',
        badge: 'Single / Duo',
        is_featured: false,
        is_popular: false,
        is_available: true,
        prep_time_hours: 18
      },
      {
        id: 11,
        category_slug: 'dessert_boxes',
        name: 'The Steeze Tasting Flight Box',
        slug: 'steeze-tasting-flight-box',
        description: 'A luxury tasting box containing 6 signature cake slices, 6 French macarons, and a 100ml jar of our artisanal Catskills honey drizzle.',
        base_price: 38000.0,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
        badge: 'Gift Box',
        is_featured: true,
        is_popular: true,
        is_available: true,
        prep_time_hours: 24
      },
      {
        id: 12,
        category_slug: 'wedding',
        name: 'Modern Cascading Pearl 2-Tier',
        slug: 'modern-cascading-pearl-2-tier',
        description: 'Two stately tiers with raw hand-torn wafer paper ruffles and edible sugar pearls. Serves 35-40 guests in sheer opulence.',
        base_price: 92000.0,
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80',
        badge: 'Wedding Tier',
        is_featured: false,
        is_popular: true,
        is_available: true,
        prep_time_hours: 48
      }
    ],
    options: [
      { id: 1, option_type: 'size', name: '6 Inch (6 - 8 Servings)', price_adjustment: 0, is_default: true, sort_order: 1 },
      { id: 2, option_type: 'size', name: '8 Inch (12 - 16 Servings)', price_adjustment: 18000, is_default: false, sort_order: 2 },
      { id: 3, option_type: 'size', name: '10 Inch (20 - 25 Servings)', price_adjustment: 36000, is_default: false, sort_order: 3 },
      { id: 4, option_type: 'size', name: '12 Inch (30 - 38 Servings)', price_adjustment: 58000, is_default: false, sort_order: 4 },
      { id: 5, option_type: 'flavor', name: 'Signature Wildflower Honeycomb', price_adjustment: 0, is_default: true, sort_order: 1 },
      { id: 6, option_type: 'flavor', name: 'Madagascar Bourbon Vanilla', price_adjustment: 0, is_default: false, sort_order: 2 },
      { id: 7, option_type: 'flavor', name: 'Valrhona Dark Chocolate Noir', price_adjustment: 2000, is_default: false, sort_order: 3 },
      { id: 8, option_type: 'flavor', name: 'Red Velvet Steeze', price_adjustment: 2000, is_default: false, sort_order: 4 },
      { id: 9, option_type: 'flavor', name: 'Roasted Pistachio & Cardamom', price_adjustment: 4000, is_default: false, sort_order: 5 },
      { id: 10, option_type: 'filling', name: 'Whipped Honeycomb Buttercream', price_adjustment: 0, is_default: true, sort_order: 1 },
      { id: 11, option_type: 'filling', name: 'Salted Dulce de Leche Caramel', price_adjustment: 1500, is_default: false, sort_order: 2 },
      { id: 12, option_type: 'filling', name: 'Belgian Dark Chocolate Ganache', price_adjustment: 2000, is_default: false, sort_order: 3 },
      { id: 13, option_type: 'addon', name: 'Custom Acrylic Cake Topper', price_adjustment: 4500, is_default: false, sort_order: 1 },
      { id: 14, option_type: 'addon', name: '24K Edible Gold Leaf Accents', price_adjustment: 6000, is_default: false, sort_order: 2 },
      { id: 15, option_type: 'addon', name: 'Handcrafted Organic Fresh Floral Spray', price_adjustment: 7500, is_default: false, sort_order: 3 }
    ],
    orders: [
      {
        id: 1,
        order_number: 'HM-20260915-101',
        customer_name: 'Damilola Adeleke',
        customer_email: 'damilola@example.com',
        customer_phone: '+234 803 123 4567',
        customer_whatsapp: '+234 803 123 4567',
        delivery_type: 'delivery',
        delivery_state: 'Lagos',
        delivery_city: 'Lagos',
        delivery_area: 'Ikoyi',
        delivery_address: 'Plot 12, Alexander Avenue, Ikoyi, Lagos',
        delivery_date: '2026-09-16',
        delivery_time_slot: '1:00 PM - 3:00 PM',
        cake_message: 'Happy 30th Birthday Dami!',
        subtotal: 66000,
        delivery_fee: 4500,
        discount: 0,
        tax: 0,
        total: 70500,
        payment_method: 'paystack',
        payment_status: 'paid',
        order_status: 'preparing',
        paystack_reference: 'PAY_HM_SAMPLE_001',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        items: [
          {
            product_id: 1,
            product_name: 'The Golden Honeycomb Velvet',
            size_selected: '8 Inch (12 - 16 Servings)',
            flavor_selected: 'Signature Wildflower Honeycomb',
            filling_selected: 'Whipped Honeycomb Buttercream',
            addons_selected: ['Custom Acrylic Cake Topper'],
            unit_price: 66000,
            quantity: 1,
            subtotal: 66000,
            item_notes: 'Please pipe inscription in gold calligraphy'
          }
        ],
        timeline: [
          { status: 'pending', notes: 'Order placed by customer', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), changed_by: 'Customer' },
          { status: 'confirmed', notes: 'Payment verified via Paystack', created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(), changed_by: 'Paystack' },
          { status: 'preparing', notes: 'Honey sponge baking in Soho oven', created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(), changed_by: 'Head Baker Simone' }
        ]
      }
    ],
    custom_orders: [
      {
        id: 1,
        reference_id: 'CUSTOM-HM-001248',
        name: 'Zainab Balogun',
        email: 'zainab@example.com',
        phone: '+234 812 555 9012',
        occasion: 'Architectural Wedding',
        cake_type: '3-Tier Sculpture with Wave Textures',
        flavor: 'Champagne & Rose Elderflower',
        size: '3-Tier Grand Statement (75 - 100 servings)',
        budget_tier: '₦250,000 - ₦400,000',
        event_date: '2026-10-12',
        servings: 80,
        cake_message: 'Zainab & Kazeem Forever',
        special_instructions: 'Minimalist brutalist wave textures with raw edible gold leaf accents matching the wedding invitation suite.',
        estimated_price: 320000,
        status: 'reviewing',
        images: ['https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=80'],
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    reviews: [
      { id: 1, author_name: 'Tiwa Savage-Ade', location: 'Victoria Island, Lagos', rating: 5, comment: 'The Golden Honeycomb Velvet was the absolute crown jewel of my 30th birthday dinner. Not overly sugary, decadent moisture, and the honeycomb praline texture was incredible!', created_at: '2026-09-10' },
      { id: 2, author_name: 'David Adeleke Jr.', location: 'Ikoyi, Lagos', 5: 5, comment: 'HoneyMilk Cakes brought unmatched steeze to our brand launch. The architectural tiers looked like modern sculptures and tasted even better. 10/10 recommend.', created_at: '2026-09-12' },
      { id: 3, author_name: 'Dr. Chidinma Okafor', location: 'Lekki Phase 1', rating: 5, comment: 'I ordered the Bento Duo for our anniversary. The presentation, the bespoke calligraphy inscription, and the pistachio cream were unmatched in Lagos.', created_at: '2026-09-14' }
    ],
    settings: {
      bakery_name: 'HoneyMilk Cakes and Steeze',
      bakery_tagline: 'Where Haute Pâtisserie Meets Unapologetic Steeze',
      currency_symbol: '₦',
      currency_code: 'NGN',
      contact_phone: '+234 814 000 2253',
      contact_whatsapp: '+234 814 000 2253',
      contact_email: 'concierge@honeymilksteeze.com',
      studio_address: '14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
      opening_hours: 'Tuesday – Saturday: 9:00 AM – 7:30 PM | Sunday: 10:00 AM – 5:00 PM',
      standard_delivery_fee: '4500.00',
      free_delivery_threshold: '90000.00',
      paystack_public_key: 'pk_test_sample_honeymilk_public_key'
    }
  };

  saveDataStore(initialStore);
  return initialStore;
}

function saveDataStore(store: DataStore) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving data store:', e);
  }
}

// In-memory data store instance
const db = loadDataStore();

// --------------------------------------------------------------------
// SSE (SERVER-SENT EVENTS) REAL-TIME BROADCASTER
// --------------------------------------------------------------------
const sseClients: { id: number; res: express.Response }[] = [];
let nextClientId = 1;

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// --------------------------------------------------------------------
// API ROUTES
// --------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), bakery: 'HoneyMilk Cakes and Steeze' });
});

// 1. SSE Real-Time Stream: GET /api/orders/stream
app.get('/api/orders/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const clientId = nextClientId++;
  sseClients.push({ id: clientId, res });

  // Initial connection handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to HoneyMilk live order stream', clientId, timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// 2. Products API
app.get('/api/products', (req, res) => {
  let list = [...db.products];
  const { category, search, min_price, max_price, sort_by } = req.query;

  if (category && category !== 'all') {
    list = list.filter((p) => p.category_slug === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (min_price) {
    list = list.filter((p) => p.base_price >= parseFloat(min_price as string));
  }

  if (max_price) {
    list = list.filter((p) => p.base_price <= parseFloat(max_price as string));
  }

  if (sort_by === 'price_asc') {
    list.sort((a, b) => a.base_price - b.base_price);
  } else if (sort_by === 'price_desc') {
    list.sort((a, b) => b.base_price - a.base_price);
  } else if (sort_by === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // featured
    list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }

  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find((p) => p.id === parseInt(req.params.id, 10));
  if (!product) {
    res.status(404).json({ success: false, message: 'Cake product not found' });
    return;
  }

  // Attach options
  const sizes = db.options.filter((o) => o.option_type === 'size');
  const flavors = db.options.filter((o) => o.option_type === 'flavor');
  const fillings = db.options.filter((o) => o.option_type === 'filling');
  const addons = db.options.filter((o) => o.option_type === 'addon');

  res.json({
    success: true,
    data: {
      ...product,
      options: { sizes, flavors, fillings, addons }
    }
  });
});

// Admin Product CRUD
app.post('/api/products', (req, res) => {
  const { name, category_slug, description, base_price, image_url, badge, is_featured, is_popular, is_available } = req.body;
  if (!name || !base_price || !image_url) {
    res.status(400).json({ success: false, message: 'Name, price, and image URL required' });
    return;
  }

  const newId = db.products.length ? Math.max(...db.products.map((p) => p.id)) + 1 : 1;
  const newProduct: ProductItem = {
    id: newId,
    name: name.trim(),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category_slug: category_slug || 'celebration',
    description: description || '',
    base_price: parseFloat(base_price),
    image_url: image_url.trim(),
    badge: badge?.trim() || undefined,
    is_featured: Boolean(is_featured),
    is_popular: Boolean(is_popular),
    is_available: is_available !== undefined ? Boolean(is_available) : true,
    prep_time_hours: 24
  };

  db.products.unshift(newProduct);
  saveDataStore(db);
  res.json({ success: true, message: 'Product added to catalog', data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  db.products[idx] = { ...db.products[idx], ...req.body, id };
  saveDataStore(db);
  res.json({ success: true, message: 'Product updated', data: db.products[idx] });
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    db.products.splice(idx, 1);
    saveDataStore(db);
  }
  res.json({ success: true, message: 'Product removed from catalog' });
});

// 3. Orders API
// Public Order Tracking: GET /api/orders/track?order_number=...&phone=...
app.get('/api/orders/track', (req, res) => {
  const orderNumber = ((req.query.order_number || req.query.query || req.query.ref) as string)?.trim();
  const phone = (req.query.phone as string)?.trim();

  if (!orderNumber) {
    res.status(400).json({ success: false, message: 'Order reference number is required' });
    return;
  }

  const order = db.orders.find((o) => {
    const numMatch = o.order_number.toLowerCase() === orderNumber.toLowerCase();
    if (!numMatch) return false;
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const oPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
      const oWa = (o.customer_whatsapp || '').replace(/[^0-9]/g, '');
      return oPhone.includes(cleanPhone) || oWa.includes(cleanPhone) || cleanPhone.includes(oPhone);
    }
    return true;
  });

  if (!order) {
    res.status(404).json({ success: false, message: 'No cake order found with this reference and contact.' });
    return;
  }

  res.json({ success: true, data: order });
});

// Place Order (With Server-Side Price Calculation & Verification!)
app.post('/api/orders', (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    customer_whatsapp,
    items,
    delivery_type,
    delivery_state,
    delivery_city,
    delivery_area,
    delivery_address,
    delivery_date,
    delivery_time_slot,
    cake_message,
    special_instructions,
    payment_method
  } = req.body;

  // Validation
  if (!customer_name || !customer_email || !customer_phone) {
    res.status(400).json({ success: false, message: 'Name, email, and phone number are required.' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: 'Cake bag cannot be empty.' });
    return;
  }

  if (delivery_type === 'delivery' && !delivery_address) {
    res.status(400).json({ success: false, message: 'Delivery address is required for courier dispatch.' });
    return;
  }

  // SERVER-SIDE PRICE CALCULATION (Never trust frontend amount)
  let serverSubtotal = 0;
  const verifiedItems: OrderItem[] = [];

  for (const it of items) {
    const catalogItem = db.products.find((p) => p.id === it.product_id);
    const basePrice = catalogItem ? catalogItem.base_price : (it.base_price || 45000);
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);

    // Calculate options
    let sizeAdj = 0;
    if (it.size) {
      const match = db.options.find((o) => o.option_type === 'size' && o.name.toLowerCase() === it.size.toLowerCase());
      if (match) sizeAdj = match.price_adjustment;
      else if (/8\s*inch/i.test(it.size)) sizeAdj = 18000;
      else if (/10\s*inch/i.test(it.size)) sizeAdj = 36000;
      else if (/12\s*inch/i.test(it.size)) sizeAdj = 58000;
    }

    let flavorAdj = 0;
    if (it.flavor) {
      const match = db.options.find((o) => o.option_type === 'flavor' && o.name.toLowerCase() === it.flavor.toLowerCase());
      if (match) flavorAdj = match.price_adjustment;
    }

    let fillingAdj = 0;
    if (it.filling) {
      const match = db.options.find((o) => o.option_type === 'filling' && o.name.toLowerCase() === it.filling.toLowerCase());
      if (match) fillingAdj = match.price_adjustment;
    }

    let addonsAdj = 0;
    const addonsList: string[] = Array.isArray(it.addons) ? it.addons : [];
    for (const add of addonsList) {
      const match = db.options.find((o) => o.option_type === 'addon' && o.name.toLowerCase() === add.toLowerCase());
      addonsAdj += match ? match.price_adjustment : 3500;
    }

    const unitPrice = basePrice + sizeAdj + flavorAdj + fillingAdj + addonsAdj;
    const itemSubtotal = unitPrice * qty;
    serverSubtotal += itemSubtotal;

    verifiedItems.push({
      product_id: catalogItem?.id,
      product_name: catalogItem?.name || it.name || 'Signature Steeze Cake',
      size_selected: it.size || '6 Inch (6 - 8 Servings)',
      flavor_selected: it.flavor || 'Signature Wildflower Honeycomb',
      filling_selected: it.filling || 'Whipped Honeycomb Buttercream',
      addons_selected: addonsList,
      unit_price: unitPrice,
      quantity: qty,
      subtotal: itemSubtotal,
      item_notes: it.notes?.trim() || undefined
    });
  }

  // Calculate delivery fee
  const deliveryFee = delivery_type === 'delivery' ? (serverSubtotal >= 90000 ? 0 : 4500) : 0;
  const serverTotal = serverSubtotal + deliveryFee;

  // Generate unique order number #HM-YYYYMMDD-XXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = String(Math.floor(100 + Math.random() * 900));
  const orderNumber = `HM-${dateStr}-${randNum}`;

  const newOrder: OrderRecord = {
    id: db.orders.length ? Math.max(...db.orders.map((o) => o.id)) + 1 : 1,
    order_number: orderNumber,
    customer_name: customer_name.trim(),
    customer_email: customer_email.trim(),
    customer_phone: customer_phone.trim(),
    customer_whatsapp: customer_whatsapp?.trim() || customer_phone.trim(),
    delivery_type: delivery_type === 'delivery' ? 'delivery' : 'pickup',
    delivery_state: delivery_state?.trim() || 'Lagos',
    delivery_city: delivery_city?.trim() || 'Lagos',
    delivery_area: delivery_area?.trim() || '',
    delivery_address: delivery_address?.trim() || '',
    delivery_date: delivery_date || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    delivery_time_slot: delivery_time_slot || '12:00 PM - 3:00 PM',
    cake_message: cake_message?.trim() || undefined,
    special_instructions: special_instructions?.trim() || undefined,
    subtotal: serverSubtotal,
    delivery_fee: deliveryFee,
    discount: 0,
    tax: 0,
    total: serverTotal,
    payment_method: payment_method || 'paystack',
    payment_status: (payment_method === 'cash_on_pickup' || payment_method === 'cash_on_delivery') ? 'cash_on_delivery' : 'pending',
    order_status: 'pending',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    items: verifiedItems,
    timeline: [
      {
        status: 'pending',
        notes: 'Order placed by customer via online bakery',
        created_at: now.toISOString(),
        changed_by: 'Customer'
      }
    ]
  };

  db.orders.unshift(newOrder);
  saveDataStore(db);

  // REAL-TIME BROADCAST TO ADMIN OVER SSE!
  broadcastSSE('new_order', {
    order_id: newOrder.id,
    order_number: newOrder.order_number,
    customer_name: newOrder.customer_name,
    customer_phone: newOrder.customer_phone,
    total: newOrder.total,
    delivery_type: newOrder.delivery_type,
    items_count: newOrder.items.length,
    created_at: newOrder.created_at
  });

  res.json({
    success: true,
    message: 'Order created with verified server-side pricing',
    data: newOrder
  });
});

// Admin list orders
app.get('/api/orders', (req, res) => {
  let list = [...db.orders];
  const { status, payment_status, search } = req.query;

  if (status && status !== 'all') {
    list = list.filter((o) => o.order_status === status);
  }

  if (payment_status && payment_status !== 'all') {
    list = list.filter((o) => o.payment_status === payment_status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((o) =>
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    );
  }

  res.json({ success: true, count: list.length, data: list });
});

// Admin update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const { order_status, payment_status, notes } = req.body;
  const now = new Date().toISOString();

  if (order_status && order_status !== order.order_status) {
    order.order_status = order_status;
    order.timeline.push({
      status: order_status,
      notes: notes || `Order marked as ${order_status.replace(/_/g, ' ')}`,
      created_at: now,
      changed_by: 'Admin'
    });
  }

  if (payment_status) {
    order.payment_status = payment_status;
  }

  order.updated_at = now;
  saveDataStore(db);

  // Broadcast status update
  broadcastSSE('order_status_updated', {
    order_id: order.id,
    order_number: order.order_number,
    order_status: order.order_status,
    payment_status: order.payment_status
  });

  res.json({ success: true, message: 'Order status updated successfully', data: order });
});

// 4. Paystack Payments API
app.post('/api/payments/initialize', (req, res) => {
  const { order_number, callback_url } = req.body;
  const order = db.orders.find((o) => o.order_number === order_number);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const reference = `PAY_${order.order_number}_${Math.random().toString(36).substring(2, 9)}`;
  order.paystack_reference = reference;
  saveDataStore(db);

  // Return Paystack authorization details
  const simulatedUrl = (callback_url || `http://localhost:3000/order-confirmation/${order.order_number}`) +
    `?reference=${reference}&status=success`;

  res.json({
    success: true,
    message: 'Payment initialized',
    data: {
      authorization_url: simulatedUrl,
      reference,
      amount: order.total * 100,
      email: order.customer_email
    }
  });
});

app.get('/api/payments/verify/:reference', (req, res) => {
  const { reference } = req.params;
  const order = db.orders.find((o) => o.paystack_reference === reference);

  if (order) {
    order.payment_status = 'paid';
    if (order.order_status === 'pending') {
      order.order_status = 'confirmed';
      order.timeline.push({
        status: 'confirmed',
        notes: 'Payment verified via Paystack',
        created_at: new Date().toISOString(),
        changed_by: 'Paystack Gateway'
      });
    }
    saveDataStore(db);

    broadcastSSE('payment_verified', {
      order_number: order.order_number,
      payment_status: 'paid',
      order_status: order.order_status
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order_number: order.order_number,
        payment_status: 'paid',
        order_status: order.order_status
      }
    });
    return;
  }

  res.status(404).json({ success: false, message: 'Payment reference not found' });
});

// 5. Custom Cake Orders API
app.post('/api/custom-orders', (req, res) => {
  const {
    name,
    email,
    phone,
    whatsapp,
    occasion,
    cake_type,
    flavor,
    size,
    filling,
    theme,
    color_preference,
    servings,
    budget_tier,
    event_date,
    cake_message,
    notes,
    reference_images,
    reference_image
  } = req.body;

  if (!name || !email || !phone || !occasion || !event_date) {
    res.status(400).json({ success: false, message: 'Name, email, phone, occasion, and event date are required.' });
    return;
  }

  const refId = `CUSTOM-HM-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const images = Array.isArray(reference_images) ? reference_images : (reference_image ? [reference_image] : []);

  const newCustom: CustomOrderRecord = {
    id: db.custom_orders.length ? Math.max(...db.custom_orders.map((c) => c.id)) + 1 : 1,
    reference_id: refId,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    whatsapp: whatsapp?.trim() || phone.trim(),
    occasion: occasion.trim(),
    cake_type: cake_type || 'Bespoke Sculptural Tier',
    flavor: flavor || 'Signature Wildflower Honeycomb',
    size: size || '2-Tier (35 - 50 servings)',
    filling: filling || 'Whipped Honeycomb Buttercream',
    theme: theme?.trim() || undefined,
    color_preference: color_preference?.trim() || undefined,
    servings: parseInt(servings, 10) || 30,
    budget_tier: budget_tier || '₦100,000 - ₦200,000',
    event_date,
    cake_message: cake_message?.trim() || undefined,
    special_instructions: notes?.trim() || undefined,
    status: 'new',
    images,
    created_at: new Date().toISOString()
  };

  db.custom_orders.unshift(newCustom);
  saveDataStore(db);

  // Broadcast to Admin
  broadcastSSE('new_custom_order', {
    reference_id: newCustom.reference_id,
    name: newCustom.name,
    occasion: newCustom.occasion,
    event_date: newCustom.event_date
  });

  res.json({
    success: true,
    message: 'Custom cake inquiry received with Steeze!',
    data: newCustom
  });
});

app.get('/api/custom-orders', (req, res) => {
  res.json({ success: true, count: db.custom_orders.length, data: db.custom_orders });
});

app.patch('/api/custom-orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const custom = db.custom_orders.find((c) => c.id === id);
  if (!custom) {
    res.status(404).json({ success: false, message: 'Custom inquiry not found' });
    return;
  }

  const { status, estimated_price } = req.body;
  if (status) custom.status = status;
  if (estimated_price !== undefined) custom.estimated_price = parseFloat(estimated_price);

  saveDataStore(db);
  res.json({ success: true, message: 'Custom commission updated', data: custom });
});

// 6. Admin Authentication: POST /api/auth/admin-login
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (
    (username === 'admin' || username === 'simone') &&
    (password === 'Admin@HoneyMilk2026' || password === 'honeymilk2026!')
  ) {
    res.json({
      success: true,
      message: 'Welcome back, Head Baker Simone',
      token: 'jwt_admin_token_' + Date.now(),
      admin: {
        id: 1,
        username: 'admin',
        name: 'Simone Laurent',
        role: 'super_admin'
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin username or password' });
  }
});

// 7. Settings API
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDataStore(db);
  res.json({ success: true, message: 'Bakery settings updated', data: db.settings });
});

// 8. Reviews API
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: db.reviews });
});

app.post('/api/reviews', (req, res) => {
  const { author_name, location, rating, comment } = req.body;
  if (!author_name || !comment) {
    res.status(400).json({ success: false, message: 'Name and comment are required' });
    return;
  }

  const newReview = {
    id: db.reviews.length + 1,
    author_name: author_name.trim(),
    location: location?.trim() || 'Lagos, Nigeria',
    rating: parseInt(rating, 10) || 5,
    comment: comment.trim(),
    created_at: new Date().toISOString().slice(0, 10)
  };

  db.reviews.unshift(newReview);
  saveDataStore(db);
  res.json({ success: true, message: 'Thank you for your review!', data: newReview });
});

// --------------------------------------------------------------------
// VITE MIDDLEWARE (Development & Production)
// --------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
      if (req.path === '/admin') req.url = '/admin.html';
      next();
    });
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/admin', (_req, res) => {
      res.sendFile(path.join(distPath, 'admin.html'));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HoneyMilk Cakes and Steeze server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
