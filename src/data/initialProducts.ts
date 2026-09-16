import { Product, Order, CustomOrder } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'The Golden Honeycomb Velvet',
    description: 'Our defining signature. Four layers of wildflower honey sponge soaked in golden bourbon syrup, layered with honeycomb crunch praline and whipped Madagascar vanilla cream.',
    price: 78.0,
    category: 'signature',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    badge: 'Chef Signature',
    flavor_options: ['Wildflower Honeycomb & Cream', 'Salted Caramel Bourbon', 'Tahitian Vanilla Buttercream'],
    size_options: ['6 Inch (6-8 Servings) - $78', '8 Inch (12-16 Servings) - $115', '10 Inch (20-25 Servings) - $160'],
    is_available: true,
    created_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Steeze Pistachio & Cardamom Noir',
    description: 'Raw pistachio dacquoise cake, scented with crushed green cardamom, layered with whipped white chocolate ganache and edged in 24k edible gold dust.',
    price: 86.0,
    category: 'signature',
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80',
    badge: 'Trending Steeze',
    flavor_options: ['Pistachio Cardamom Ganache', 'Matcha Milk Crème', 'Almond Blossom'],
    size_options: ['6 Inch (6-8 Servings) - $86', '8 Inch (12-16 Servings) - $128', '10 Inch (20-25 Servings) - $175'],
    is_available: true,
    created_at: '2026-03-02T10:00:00Z'
  },
  {
    id: 3,
    name: 'Midnight Espresso & Dulce Cloud',
    description: 'Dark Valrhona chocolate infused with ristretto espresso, filled with slow-cooked dulce de leche and frosted with whipped milk chocolate silk.',
    price: 74.0,
    category: 'birthday',
    image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80',
    badge: 'Bestseller',
    flavor_options: ['Espresso Dulce Silk', 'Triple Dark Fudge', 'Mocha Toffee Crunch'],
    size_options: ['6 Inch (6-8 Servings) - $74', '8 Inch (12-16 Servings) - $108', '10 Inch (20-25 Servings) - $152'],
    is_available: true,
    created_at: '2026-03-03T10:00:00Z'
  },
  {
    id: 4,
    name: 'Ethereal Pearl Wedding Tier',
    description: 'A breathtaking sculpted architectural cake with hand-ruffled sugar petals, champagne sponge, passion fruit curd, and silky Italian meringue buttercream.',
    price: 420.0,
    category: 'wedding',
    image_url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=80',
    badge: 'Bespoke Tier',
    flavor_options: ['Champagne & Passion Fruit', 'Vanilla Bean & Raspberry Rose', 'Earl Grey Lavender'],
    size_options: ['2-Tier (35-40 Servings) - $420', '3-Tier (65-75 Servings) - $680', '4-Tier Grand (100+ Servings) - $980'],
    is_available: true,
    created_at: '2026-03-04T10:00:00Z'
  },
  {
    id: 5,
    name: 'Strawberry Milk & White Blossom',
    description: 'Fluffy Japanese-style milk sponge layered with organic macerated strawberries, Hokkaido milk custard, and airy mascarpone chantilly.',
    price: 68.0,
    category: 'birthday',
    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
    badge: 'Crowd Favorite',
    flavor_options: ['Strawberry Hokkaido Milk', 'Raspberry Lychee', 'Peaches & Cream'],
    size_options: ['6 Inch (6-8 Servings) - $68', '8 Inch (12-16 Servings) - $98', '10 Inch (20-25 Servings) - $140'],
    is_available: true,
    created_at: '2026-03-05T10:00:00Z'
  },
  {
    id: 6,
    name: 'The Steeze Bento Duo Box',
    description: 'Two aesthetic 4-inch mini bento cakes packaged in custom eco-boxes. One honey-caramel drip and one vintage piped cocoa with custom calligraphy message.',
    price: 42.0,
    category: 'bento',
    image_url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=1000&q=80',
    badge: 'Gift Ready',
    flavor_options: ['Honey Caramel + Cocoa Fudge', 'Red Velvet + Vanilla Bean', 'Matcha Milk + Strawberry'],
    size_options: ['Set of 2 Bento Cakes - $42', 'Set of 4 Bento Cakes - $78'],
    is_available: true,
    created_at: '2026-03-06T10:00:00Z'
  },
  {
    id: 7,
    name: 'Toasted Pecan Honey Butter Cake',
    description: 'Southern-inspired brown butter sponge with caramelized Georgia pecans, drizzled with clover honey glaze and finished with fleur de sel.',
    price: 72.0,
    category: 'birthday',
    image_url: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=1000&q=80',
    badge: 'New Drop',
    flavor_options: ['Pecan Brown Butter', 'Spiced Maple Cinnamon', 'Salted Honey Pecan'],
    size_options: ['6 Inch (6-8 Servings) - $72', '8 Inch (12-16 Servings) - $105', '10 Inch (20-25 Servings) - $148'],
    is_available: true,
    created_at: '2026-03-07T10:00:00Z'
  },
  {
    id: 8,
    name: 'Boutique Steeze Cupcake Flight',
    description: '12 handcrafted couture cupcakes: 3 Golden Honeycomb, 3 Pistachio Rose, 3 Espresso Dulce, and 3 Miso Caramel Buttercream.',
    price: 48.0,
    category: 'cupcakes',
    image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1000&q=80',
    badge: 'Bestseller',
    flavor_options: ['Curated Steeze Assortment', 'All Honeycomb & Cream', 'Chocolate Lovers Quad'],
    size_options: ['Box of 6 - $26', 'Box of 12 - $48', 'Party Box of 24 - $90'],
    is_available: true,
    created_at: '2026-03-08T10:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'HM-8821',
    customer_name: 'Zoe Campbell',
    contact: 'zoe.c@example.com',
    items: [
      {
        id: 'cart-1',
        productId: 1,
        name: 'The Golden Honeycomb Velvet',
        price: 78,
        quantity: 1,
        size: '6 Inch (6-8 Servings) - $78',
        flavor: 'Wildflower Honeycomb & Cream',
        notes: "Piped text: 'Happy 30th Steeze Zoe'",
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    total: 78.0,
    status: 'baking',
    delivery_type: 'pickup',
    delivery_date: '2026-09-18',
    special_instructions: 'Please pack in our gold ribbon carrier box!'
  },
  {
    id: 2,
    order_number: 'HM-8822',
    customer_name: 'Marcus Vance',
    contact: '555-019-3382',
    items: [
      {
        id: 'cart-2',
        productId: 3,
        name: 'Midnight Espresso & Dulce Cloud',
        price: 108,
        quantity: 1,
        size: '8 Inch (12-16 Servings) - $108',
        flavor: 'Espresso Dulce Silk',
        image_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80'
      },
      {
        id: 'cart-3',
        productId: 8,
        name: 'Boutique Steeze Cupcake Flight',
        price: 48,
        quantity: 1,
        size: 'Box of 12 - $48',
        flavor: 'Curated Steeze Assortment',
        image_url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1000&q=80'
      }
    ],
    total: 156.0,
    status: 'confirmed',
    delivery_type: 'delivery',
    delivery_address: '442 Orchard Boulevard, Suite 5B, New York, NY 10002',
    delivery_date: '2026-09-19',
    special_instructions: 'Gate code #4021. Ring intercom upon arrival.'
  }
];

export const INITIAL_CUSTOM_ORDERS: CustomOrder[] = [
  {
    id: 1,
    reference_id: 'CUST-701',
    name: 'Aria Sterling',
    contact: 'aria.sterling@gmail.com',
    occasion: 'Editorial Brand Launch',
    flavor: 'Wildflower Honeycomb & Green Cardamom',
    size: '3-Tier Sculptural (70-80 servings)',
    budget: '$500 - $800',
    event_date: '2026-09-29',
    reference_image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=80',
    notes: 'Need architectural brutalist-meets-baroque style with drip honey elements and minimalist floral accents matching our moodboard.',
    status: 'reviewing'
  },
  {
    id: 2,
    reference_id: 'CUST-702',
    name: 'Devon & Chloe Miller',
    contact: 'devon.miller@example.com | 555-882-9912',
    occasion: 'Modern Romance Wedding',
    flavor: 'Champagne, Passion Fruit & White Chocolate Miso',
    size: '2-Tier (40-50 servings)',
    budget: '$350 - $500',
    event_date: '2026-10-06',
    reference_image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
    notes: 'Matte cream finish with edible gold foil leaf accents and textured palette knife wave pattern.',
    status: 'quoted'
  }
];
