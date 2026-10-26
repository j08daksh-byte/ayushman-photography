/**
 * Turso Cloud Database Client
 * 
 * This replaces the ephemeral file-based JSON store with a persistent
 * Turso (LibSQL) cloud database. All writes are durable across Vercel
 * serverless function restarts.
 * 
 * Required env vars:
 *   TURSO_DATABASE_URL  - e.g. libsql://your-db-name.turso.io
 *   TURSO_AUTH_TOKEN    - Token from Turso dashboard
 * 
 * If these are not set, falls back to the file-based store.
 */

import { createClient, Client } from '@libsql/client/web';

// Inline types to avoid circular dependency with db.ts
export interface UserRecord {
  id: string; name: string; email: string; password: string;
  phone?: string | null; address?: string | null; city?: string | null;
  state?: string | null; pincode?: string | null; role: string;
  createdAt: string; updatedAt: string;
}
export interface BookingRecord {
  id: string; userId?: string | null; customerName: string; customerEmail: string;
  customerPhone: string; eventType: string; eventDate: string; city?: string | null;
  address?: string | null; notes?: string | null; packageType: string;
  totalAmount: number; depositAmount: number; paymentStatus: string;
  razorpayOrderId?: string | null; razorpayPaymentId?: string | null;
  razorpaySignature?: string | null; status: string;
  uploadedFiles?: { name: string; size: string; previewUrl?: string; type?: string }[] | null;
  driveLink?: string | null; printInstructions?: string | null;
  whatsappFollowup?: boolean; createdAt: string; updatedAt: string;
}
export interface InquiryRecord {
  id: string; userId?: string | null; name: string; email: string;
  phone: string; eventType: string; date?: string | null; message: string; createdAt: string;
}
export interface CategoryRecord {
  id: string; label: string; icon: string; description?: string;
  createdAt: string; updatedAt: string;
}
export interface PaperOption { label: string; extraPrice: number; }
export interface QuantityOption { qty: number; multiplier: number; }
export interface ProductRecord {
  id: string; customizerId: string; title: string; category: string;
  badge: string; price: string; numericPrice: number; unit: string; image: string;
  description: string; rating?: number; reviews?: number; features?: string[];
  paperOptions?: PaperOption[]; quantityOptions?: QuantityOption[];
  cornerOptions?: string[]; isActive?: boolean; createdAt: string; updatedAt: string;
}
export interface SettingsRecord {
  id: string; shopName: string; proprietor: string; address: string;
  city: string; state: string; pincode: string; phonePrimary: string;
  phoneSecondary: string; whatsappNumber: string; whatsappMessage: string;
  instagramUrl: string; instagramHandle: string; facebookUrl: string;
  youtubeUrl: string; email: string; updatedAt: string;
}
export interface BannerRecord {
  id: string; title: string; subtitle?: string; badge?: string; image: string;
  link?: string; buttonText?: string; displayOrder?: number; isActive: boolean;
  createdAt: string; updatedAt: string;
}

const DEFAULT_PAPER_OPTIONS: PaperOption[] = [
  { label: '350 GSM Premium Matte', extraPrice: 0 },
  { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
  { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
  { label: 'Spot UV Selective Coating', extraPrice: 150 },
  { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
];
const DEFAULT_QUANTITY_OPTIONS: QuantityOption[] = [
  { qty: 100, multiplier: 1 }, { qty: 250, multiplier: 2.2 },
  { qty: 500, multiplier: 3.8 }, { qty: 1000, multiplier: 6.5 },
];
const DEFAULT_CORNER_OPTIONS: string[] = ['Standard Cut', 'Rounded Corners'];
const DEFAULT_SETTINGS: SettingsRecord = {
  id: 'site-settings', shopName: 'Ayushman Cards & Graphics',
  proprietor: 'Rajesh Saatoliya', address: '63, Varruchi Marg, Freeganj Ujjain',
  city: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001',
  phonePrimary: '9479784979', phoneSecondary: '9893022451',
  whatsappNumber: '+919479784979',
  whatsappMessage: 'Hello Ayushman Cards & Graphics Press, I would like to inquire about wedding cards, visiting cards, flex banners & printing services.',
  instagramUrl: 'https://instagram.com/ayushmancards_ujjain',
  instagramHandle: '@ayushmancards_ujjain',
  facebookUrl: 'https://facebook.com/ayushmancards',
  youtubeUrl: 'https://youtube.com/@ayushmancards',
  email: 'ayushmancardspress@gmail.com',
  updatedAt: '2025-01-01T00:00:00.000Z',
};


// --------------------------------------------------------------------------
// Client singleton
// --------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __tursoClient: Client | undefined;
}

function getTursoClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) return null;

  if (!globalThis.__tursoClient) {
    globalThis.__tursoClient = createClient({
      url,
      authToken: token || undefined,
    });
  }
  return globalThis.__tursoClient;
}

// --------------------------------------------------------------------------
// Schema bootstrap
// --------------------------------------------------------------------------

let schemaInitialized = false;

async function ensureSchema(client: Client): Promise<void> {
  if (schemaInitialized) return;

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  schemaInitialized = true;
}

// --------------------------------------------------------------------------
// Generic get / set helpers
// --------------------------------------------------------------------------

async function kvGet<T>(key: string): Promise<T | null> {
  const client = getTursoClient();
  if (!client) return null;

  await ensureSchema(client);
  const result = await client.execute({
    sql: 'SELECT value FROM kv_store WHERE key = ?',
    args: [key],
  });

  if (result.rows.length === 0) return null;
  try {
    return JSON.parse(result.rows[0][0] as string) as T;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const client = getTursoClient();
  if (!client) return;

  await ensureSchema(client);
  await client.execute({
    sql: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
    args: [key, JSON.stringify(value)],
  });
}

// --------------------------------------------------------------------------
// Default admin user
// --------------------------------------------------------------------------

const DEFAULT_ADMIN_USER: UserRecord = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@ayushmancards.com',
  password: 'AyushmanAdmin@2025',
  role: 'ADMIN',
  phone: '9479784979',
  address: null,
  city: null,
  state: null,
  pincode: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

// --------------------------------------------------------------------------
// Collection helpers
// --------------------------------------------------------------------------

async function getUsers(): Promise<UserRecord[]> {
  const users = await kvGet<UserRecord[]>('users');
  if (!users || users.length === 0) {
    const defaults = [DEFAULT_ADMIN_USER];
    await kvSet('users', defaults);
    return defaults;
  }
  // Ensure admin always exists
  const hasAdmin = users.some((u) => u.email.toLowerCase().trim() === 'admin@ayushmancards.com');
  if (!hasAdmin) {
    users.push(DEFAULT_ADMIN_USER);
    await kvSet('users', users);
  }
  return users;
}

async function getProducts(): Promise<ProductRecord[]> {
  const products = await kvGet<ProductRecord[]>('products');
  if (products === null) {
    // Turso DB starts empty — returns empty array on first use.
    // Admin can add products via the portal, or use /api/admin/migrate to seed from data_store.json
    return [];
  }
  return products;
}

async function getCategories(): Promise<CategoryRecord[]> {
  const categories = await kvGet<CategoryRecord[]>('categories');
  if (categories === null) {
    // Turso DB starts empty — returns empty array on first use.
    return [];
  }
  return categories;
}

async function getBookings(): Promise<BookingRecord[]> {
  return (await kvGet<BookingRecord[]>('bookings')) || [];
}

async function getInquiries(): Promise<InquiryRecord[]> {
  return (await kvGet<InquiryRecord[]>('inquiries')) || [];
}

async function getBanners(): Promise<BannerRecord[]> {
  return (await kvGet<BannerRecord[]>('banners')) || [];
}

async function getSettings(): Promise<SettingsRecord> {
  const settings = await kvGet<SettingsRecord>('settings');
  return settings ? { ...DEFAULT_SETTINGS, ...settings } : { ...DEFAULT_SETTINGS };
}

// --------------------------------------------------------------------------
// ID generator
// --------------------------------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// --------------------------------------------------------------------------
// UserClient
// --------------------------------------------------------------------------

export class TursoUserClient {
  async findUnique(args: { where: { email?: string; id?: string }; select?: unknown }): Promise<UserRecord | null> {
    const users = await getUsers();
    const { email, id } = args.where;
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      return users.find((u) => u.email.toLowerCase().trim() === cleanEmail) || null;
    }
    if (id) {
      return users.find((u) => u.id === id) || null;
    }
    return null;
  }

  async create(args: { data: { name: string; email: string; password: string; phone?: string; role?: string; address?: string; city?: string; state?: string; pincode?: string }; select?: unknown }): Promise<UserRecord> {
    const users = await getUsers();
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: generateId('usr'),
      name: args.data.name,
      email: args.data.email.toLowerCase().trim(),
      password: args.data.password,
      phone: args.data.phone || null,
      address: args.data.address || null,
      city: args.data.city || null,
      state: args.data.state || null,
      pincode: args.data.pincode || null,
      role: args.data.role || 'CLIENT',
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    await kvSet('users', users);
    return newUser;
  }

  async update(args: { where: { id: string }; data: Partial<UserRecord> }): Promise<UserRecord> {
    const users = await getUsers();
    const idx = users.findIndex((u) => u.id === args.where.id);
    if (idx === -1) throw new Error('User not found');
    const updated: UserRecord = { ...users[idx], ...args.data, updatedAt: new Date().toISOString() };
    users[idx] = updated;
    await kvSet('users', users);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const users = await getUsers();
    const initial = users.length;
    const filtered = users.filter((u) => u.id !== args.where.id);
    await kvSet('users', filtered);
    return filtered.length < initial;
  }

  async findMany(): Promise<UserRecord[]> {
    return getUsers();
  }
}

// --------------------------------------------------------------------------
// ProductClient
// --------------------------------------------------------------------------

function enrichProduct(p: ProductRecord): ProductRecord {
  return {
    ...p,
    paperOptions: Array.isArray(p.paperOptions) && p.paperOptions.length > 0 ? p.paperOptions : DEFAULT_PAPER_OPTIONS,
    quantityOptions: Array.isArray(p.quantityOptions) && p.quantityOptions.length > 0 ? p.quantityOptions : DEFAULT_QUANTITY_OPTIONS,
    cornerOptions: Array.isArray(p.cornerOptions) && p.cornerOptions.length > 0 ? p.cornerOptions : DEFAULT_CORNER_OPTIONS,
  };
}

export class TursoProductClient {
  async findMany(args?: { where?: { category?: string; isActive?: boolean } }): Promise<ProductRecord[]> {
    let products = await getProducts();
    if (args?.where?.category && args.where.category !== 'All Products') {
      const catLower = args.where.category.trim().toLowerCase();
      products = products.filter((p) => p.category.trim().toLowerCase() === catLower);
    }
    if (args?.where?.isActive !== undefined) {
      products = products.filter((p) => (p.isActive !== false) === args.where!.isActive);
    }
    return products.map(enrichProduct);
  }

  async findUnique(args: { where: { id: string } }): Promise<ProductRecord | null> {
    const products = await getProducts();
    const cleanId = args.where.id.trim();
    const prod = products.find((p) => p.id.trim() === cleanId) || null;
    return prod ? enrichProduct(prod) : null;
  }

  async create(args: { data: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'> }): Promise<ProductRecord> {
    const products = await getProducts();
    const now = new Date().toISOString();
    const newProduct: ProductRecord = {
      ...args.data,
      id: generateId('prd'),
      paperOptions: Array.isArray(args.data.paperOptions) && args.data.paperOptions.length > 0 ? args.data.paperOptions : DEFAULT_PAPER_OPTIONS,
      quantityOptions: Array.isArray(args.data.quantityOptions) && args.data.quantityOptions.length > 0 ? args.data.quantityOptions : DEFAULT_QUANTITY_OPTIONS,
      cornerOptions: Array.isArray(args.data.cornerOptions) && args.data.cornerOptions.length > 0 ? args.data.cornerOptions : DEFAULT_CORNER_OPTIONS,
      isActive: args.data.isActive !== undefined ? args.data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    products.unshift(newProduct);
    await kvSet('products', products);
    return newProduct;
  }

  async update(args: { where: { id: string }; data: Partial<ProductRecord> }): Promise<ProductRecord> {
    const products = await getProducts();
    const cleanId = args.where.id.trim();
    const idx = products.findIndex((p) => p.id.trim() === cleanId);
    if (idx === -1) throw new Error('Product not found');
    const updated: ProductRecord = { ...products[idx], ...args.data, updatedAt: new Date().toISOString() };
    products[idx] = updated;
    await kvSet('products', products);
    return enrichProduct(updated);
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const products = await getProducts();
    const cleanId = args.where.id.trim();
    const initial = products.length;
    const filtered = products.filter((p) => p.id.trim() !== cleanId);
    await kvSet('products', filtered);
    return filtered.length < initial;
  }
}

// --------------------------------------------------------------------------
// CategoryClient
// --------------------------------------------------------------------------

export class TursoCategoryClient {
  async findMany(): Promise<CategoryRecord[]> {
    return getCategories();
  }

  async findUnique(args: { where: { id: string } }): Promise<CategoryRecord | null> {
    const categories = await getCategories();
    const cleanId = args.where.id.trim().toLowerCase();
    return categories.find((c) => c.id.trim().toLowerCase() === cleanId || c.label.trim().toLowerCase() === cleanId) || null;
  }

  async create(args: { data: { id: string; label: string; icon?: string; description?: string } }): Promise<CategoryRecord> {
    const categories = await getCategories();
    const now = new Date().toISOString();
    const catId = args.data.id.trim();
    const cleanId = catId.toLowerCase();

    const existingIdx = categories.findIndex((c) => c.id.trim().toLowerCase() === cleanId);
    if (existingIdx !== -1) {
      categories[existingIdx] = {
        ...categories[existingIdx],
        label: args.data.label.trim(),
        icon: args.data.icon || categories[existingIdx].icon || 'tag',
        description: args.data.description !== undefined ? args.data.description : categories[existingIdx].description,
        updatedAt: now,
      };
      await kvSet('categories', categories);
      return categories[existingIdx];
    }

    const newCat: CategoryRecord = {
      id: catId,
      label: args.data.label.trim(),
      icon: args.data.icon || 'tag',
      description: args.data.description || '',
      createdAt: now,
      updatedAt: now,
    };
    categories.push(newCat);
    await kvSet('categories', categories);
    return newCat;
  }

  async update(args: { where: { id: string }; data: Partial<CategoryRecord> }): Promise<CategoryRecord> {
    const categories = await getCategories();
    const cleanId = args.where.id.trim().toLowerCase();
    const idx = categories.findIndex((c) => c.id.trim().toLowerCase() === cleanId);
    if (idx === -1) throw new Error('Category not found');
    const updated: CategoryRecord = { ...categories[idx], ...args.data, updatedAt: new Date().toISOString() };
    categories[idx] = updated;
    await kvSet('categories', categories);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const categories = await getCategories();
    const cleanId = args.where.id.trim().toLowerCase();
    const initial = categories.length;
    const filtered = categories.filter((c) => c.id.trim().toLowerCase() !== cleanId && c.label.trim().toLowerCase() !== cleanId);
    await kvSet('categories', filtered);
    return filtered.length < initial;
  }
}

// --------------------------------------------------------------------------
// BannerClient
// --------------------------------------------------------------------------

export class TursoBannerClient {
  async findMany(args?: { where?: { isActive?: boolean } }): Promise<BannerRecord[]> {
    let banners = await getBanners();
    if (args?.where?.isActive !== undefined) {
      banners = banners.filter((b) => (b.isActive !== false) === args.where!.isActive);
    }
    return banners.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async findUnique(args: { where: { id: string } }): Promise<BannerRecord | null> {
    const banners = await getBanners();
    return banners.find((b) => b.id === args.where.id) || null;
  }

  async create(args: { data: Omit<BannerRecord, 'id' | 'createdAt' | 'updatedAt'> }): Promise<BannerRecord> {
    const banners = await getBanners();
    const now = new Date().toISOString();
    const newBanner: BannerRecord = {
      ...args.data,
      id: generateId('bnr'),
      isActive: args.data.isActive !== undefined ? args.data.isActive : true,
      displayOrder: args.data.displayOrder || (banners.length + 1),
      createdAt: now,
      updatedAt: now,
    };
    banners.push(newBanner);
    await kvSet('banners', banners);
    return newBanner;
  }

  async update(args: { where: { id: string }; data: Partial<BannerRecord> }): Promise<BannerRecord> {
    const banners = await getBanners();
    const idx = banners.findIndex((b) => b.id === args.where.id);
    if (idx === -1) throw new Error('Banner not found');
    const updated: BannerRecord = { ...banners[idx], ...args.data, updatedAt: new Date().toISOString() };
    banners[idx] = updated;
    await kvSet('banners', banners);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const banners = await getBanners();
    const initial = banners.length;
    const filtered = banners.filter((b) => b.id !== args.where.id);
    await kvSet('banners', filtered);
    return filtered.length < initial;
  }
}

// --------------------------------------------------------------------------
// BookingClient
// --------------------------------------------------------------------------

export class TursoBookingClient {
  async create(args: { data: Omit<BookingRecord, 'id' | 'createdAt' | 'updatedAt'> }): Promise<BookingRecord> {
    const bookings = await getBookings();
    const now = new Date().toISOString();
    const newBooking: BookingRecord = { ...args.data, id: generateId('bk'), createdAt: now, updatedAt: now };
    bookings.push(newBooking);
    await kvSet('bookings', bookings);
    return newBooking;
  }

  async update(args: { where: { razorpayOrderId?: string; id?: string }; data: Partial<BookingRecord> }): Promise<BookingRecord> {
    const bookings = await getBookings();
    const { razorpayOrderId, id } = args.where;
    const idx = bookings.findIndex((b) => (razorpayOrderId && b.razorpayOrderId === razorpayOrderId) || (id && b.id === id));
    if (idx === -1) {
      const syntheticBooking: BookingRecord = {
        id: id || generateId('bk'),
        customerName: 'Customer',
        customerEmail: 'customer@ayushmancards.com',
        customerPhone: '9479784979',
        eventType: 'Print Order',
        eventDate: new Date().toISOString().split('T')[0],
        packageType: 'Custom Order',
        totalAmount: 1000,
        depositAmount: 1000,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args.data,
      };
      bookings.push(syntheticBooking);
      await kvSet('bookings', bookings);
      return syntheticBooking;
    }
    const updated: BookingRecord = { ...bookings[idx], ...args.data, updatedAt: new Date().toISOString() };
    bookings[idx] = updated;
    await kvSet('bookings', bookings);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const bookings = await getBookings();
    const initial = bookings.length;
    const filtered = bookings.filter((b) => b.id !== args.where.id);
    await kvSet('bookings', filtered);
    return filtered.length < initial;
  }

  async findMany(args?: { where?: { customerEmail?: string; userId?: string }; orderBy?: unknown; take?: number }): Promise<BookingRecord[]> {
    let bookings = await getBookings();
    if (args?.where?.customerEmail) {
      const cleanEmail = args.where.customerEmail.toLowerCase().trim();
      bookings = bookings.filter((b) => b.customerEmail.toLowerCase().trim() === cleanEmail);
    }
    if (args?.where?.userId) {
      bookings = bookings.filter((b) => b.userId === args.where!.userId);
    }
    return bookings;
  }

  async findFirst(args?: { where?: { razorpayOrderId?: string } }): Promise<BookingRecord | null> {
    const bookings = await getBookings();
    if (args?.where?.razorpayOrderId) {
      return bookings.find((b) => b.razorpayOrderId === args.where!.razorpayOrderId) || null;
    }
    return bookings[0] || null;
  }

  async findUnique(args: { where: { id: string } }): Promise<BookingRecord | null> {
    const bookings = await getBookings();
    return bookings.find((b) => b.id === args.where.id) || null;
  }

  async updateMany(args: { where: { razorpayOrderId?: string; status?: string; paymentStatus?: string }; data: Partial<BookingRecord> }): Promise<number> {
    const bookings = await getBookings();
    let count = 0;
    const updated = bookings.map((b) => {
      let matches = true;
      if (args.where.razorpayOrderId && b.razorpayOrderId !== args.where.razorpayOrderId) matches = false;
      if (args.where.status && b.status !== args.where.status) matches = false;
      if (args.where.paymentStatus && b.paymentStatus !== args.where.paymentStatus) matches = false;
      if (matches) {
        count++;
        return { ...b, ...args.data, updatedAt: new Date().toISOString() };
      }
      return b;
    });
    await kvSet('bookings', updated);
    return count;
  }
}

// --------------------------------------------------------------------------
// InquiryClient
// --------------------------------------------------------------------------

export class TursoInquiryClient {
  async create(args: { data: Omit<InquiryRecord, 'id' | 'createdAt'> }): Promise<InquiryRecord> {
    const inquiries = await getInquiries();
    const newInquiry: InquiryRecord = { ...args.data, id: generateId('inq'), createdAt: new Date().toISOString() };
    inquiries.push(newInquiry);
    await kvSet('inquiries', inquiries);
    return newInquiry;
  }

  async findMany(args?: { where?: { email?: string; userId?: string }; orderBy?: unknown; take?: number }): Promise<InquiryRecord[]> {
    let inquiries = await getInquiries();
    if (args?.where?.email) {
      const cleanEmail = args.where.email.toLowerCase().trim();
      inquiries = inquiries.filter((i) => i.email.toLowerCase().trim() === cleanEmail);
    }
    return inquiries;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const inquiries = await getInquiries();
    const initial = inquiries.length;
    const filtered = inquiries.filter((i) => i.id !== args.where.id);
    await kvSet('inquiries', filtered);
    return filtered.length < initial;
  }
}

// --------------------------------------------------------------------------
// SettingsClient
// --------------------------------------------------------------------------

export class TursoSettingsClient {
  async get(): Promise<SettingsRecord> {
    return getSettings();
  }

  async update(data: Partial<SettingsRecord>): Promise<SettingsRecord> {
    const current = await getSettings();
    const updated: SettingsRecord = { ...current, ...data, updatedAt: new Date().toISOString() };
    await kvSet('settings', updated);
    return updated;
  }
}

// --------------------------------------------------------------------------
// Check if Turso is configured
// --------------------------------------------------------------------------

export function isTursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

// --------------------------------------------------------------------------
// Turso DB export (drop-in replacement for db from db.ts)
// --------------------------------------------------------------------------

export const tursoDb = {
  user: new TursoUserClient(),
  booking: new TursoBookingClient(),
  inquiry: new TursoInquiryClient(),
  category: new TursoCategoryClient(),
  product: new TursoProductClient(),
  banner: new TursoBannerClient(),
  settings: new TursoSettingsClient(),
};
