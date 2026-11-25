import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'store.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
const isIdentifier = (value) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(value));

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      password_hash TEXT NOT NULL,
      email_confirmed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      rating REAL NOT NULL DEFAULT 5,
      reviews INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      event TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      "userName" TEXT NOT NULL,
      "userImage" TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      "productName" TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      total_price REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);
}

const TABLES = {
  profiles: {
    columns: ['id', 'email', 'name', 'avatar_url', 'role', 'email_confirmed_at', 'created_at'],
    publicRead: false,
    writeRoles: [],
  },
  products: {
    columns: ['id', 'name', 'price', 'description', 'category', 'image', 'rating', 'reviews', 'stock', 'event', 'created_at', 'updated_at'],
    publicRead: true,
    writeRoles: ['admin', 'staff'],
  },
  categories: {
    columns: ['id', 'name', 'created_at'],
    publicRead: true,
    writeRoles: ['admin', 'staff'],
  },
  reviews: {
    columns: ['id', 'userName', 'userImage', 'rating', 'comment', 'date', 'productName', 'created_at'],
    publicRead: true,
    writeRoles: ['admin', 'staff', 'user'],
  },
  orders: {
    columns: ['id', 'user_id', 'status', 'payment_status', 'total_price', 'created_at', 'updated_at'],
    publicRead: false,
    writeRoles: ['admin', 'staff', 'user'],
  },
  order_items: {
    columns: ['id', 'order_id', 'product_id', 'quantity', 'price'],
    publicRead: false,
    writeRoles: ['admin', 'staff', 'user'],
  },
};

const RUNWAY_LOOKS = [
  ['Look 01', 'A modern heirloom in ivory and woven gold.'],
  ['Look 02', 'Soft cotton and intricate hand-finished Tibeb.'],
  ['Look 03', 'A fluid silhouette with a deep indigo border.'],
  ['Look 04', 'A statement of red, white and woven pattern.'],
  ['Look 05', 'A contemporary take on the traditional shemma.'],
  ['Look 06', 'Warm earth tones, finished by hand in Addis.'],
  ['Look 07', 'Lightweight layers with a signature woven edge.'],
  ['Look 08', 'A sculptural occasion look made for the runway.'],
];

const SAMPLE_PRODUCTS = [
  ['sample-1', 'Signature Silk Gift Box', 189, 'A hand-finished keepsake box lined with silk, perfect for birthdays and anniversaries.', 'Gift Boxes', '/product-1.svg', 5, 42, 24, 'Birthday'],
  ['sample-2', 'Midnight Rose Perfume', 245, 'An elegant floral fragrance presented in a faceted glass flacon.', 'Personalized', '/product-2.svg', 4.8, 31, 12, 'Anniversary'],
  ['sample-3', 'Blossom Bouquet', 96, 'A curated arrangement of seasonal blooms wrapped in artisan paper.', 'Flowers', '/product-3.svg', 4.9, 58, 30, 'Wedding'],
  ['sample-4', 'Heritage Gold Watch', 420, 'A timeless timepiece with a brushed gold case and Italian leather strap.', 'Jewelry', '/product-4.svg', 4.7, 19, 6, 'Corporate'],
  ['sample-5', 'Artisan Chocolate Collection', 78, 'Twenty-four handcrafted pralines in a foil-stamped gift portfolio.', 'Gift Boxes', '/product-5.svg', 4.9, 87, 45, "Valentine's Day"],
  ['sample-6', 'Executive Leather Satchel', 310, 'Full-grain leather with brass detailing, made to be carried for years.', 'Corporate', '/product-6.svg', 4.6, 14, 9, 'Graduation'],
];

function run(sql, ...params) {
  return db.prepare(sql).run(...params);
}

function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}

function get(sql, ...params) {
  return db.prepare(sql).get(...params);
}

function seedDatabase() {
  const seeded = get("SELECT value FROM meta WHERE key = 'seed_version'");
  if (seeded) return;

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, price, description, category, image, rating, reviews, stock, event, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCategory = db.prepare('INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)');
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, "userName", "userImage", rating, comment, date, "productName", created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, email, name, avatar_url, role, password_hash, email_confirmed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const base = Date.now();

  RUNWAY_LOOKS.forEach(([title, description], lookIndex) => {
    const names = [`${title} Tibeb blouse`, `${title} Handwoven skirt`, `${title} Cotton shawl`];
    const prices = [145 + lookIndex * 7, 185 + lookIndex * 9, 95 + lookIndex * 5];
    names.forEach((name, pieceIndex) => {
      const created = new Date(base - (lookIndex * 3 + pieceIndex) * 86400000).toISOString();
      insertProduct.run(
        `runway-${lookIndex + 1}-${pieceIndex + 1}`,
        name,
        prices[pieceIndex],
        `${description} Made in Ethiopia.`,
        'Tibeb Collection',
        `/runway-models/ethiopian-look-${String(lookIndex + 1).padStart(2, '0')}.jpg`,
        5,
        8 + lookIndex,
        6,
        title,
        created,
        created,
      );
    });
  });

  SAMPLE_PRODUCTS.forEach(([id, name, price, description, category, image, rating, reviewCount, stock, event], index) => {
    const created = new Date(base - (index + 30) * 86400000).toISOString();
    insertProduct.run(id, name, price, description, category, image, rating, reviewCount, stock, event, created, created);
  });

  ['Tibeb Collection', 'Gift Boxes', 'Personalized', 'Flowers', 'Jewelry', 'Corporate'].forEach((name, index) => {
    insertCategory.run(uuid(), name, new Date(base - index * 86400000).toISOString());
  });

  insertReview.run(
    'sample-r1',
    'Selamawit Tadesse',
    '/avatar-1.svg',
    5,
    'The Signature Silk Gift Box surpassed all my expectations. The presentation was flawless!',
    '2 days ago',
    'Signature Silk Gift Box',
    new Date(base - 2 * 86400000).toISOString(),
  );
  insertReview.run(
    'sample-r2',
    'Dawit Girma',
    '/avatar-2.svg',
    5,
    'I ordered the Executive Leather Satchel for my father\'s birthday. The quality is exceptional.',
    '1 week ago',
    'Executive Leather Satchel',
    new Date(base - 7 * 86400000).toISOString(),
  );

  const demoUsers = [
    ['admin@ethiodesign.test', 'Admin123!', 'Store Administrator', 'admin'],
    ['staff@ethiodesign.test', 'Staff123!', 'Showroom Staff', 'staff'],
    ['customer@ethiodesign.test', 'Customer123!', 'Dawit Girma', 'user'],
  ];

  let customerId = null;
  demoUsers.forEach(([email, password, name, role]) => {
    const id = uuid();
    const confirmed = now();
    insertProfile.run(id, email, name, null, role, hashPassword(password), confirmed, confirmed);
    if (role === 'user') customerId = id;
  });

  if (customerId) {
    const orderId = uuid();
    const createdAt = new Date(base - 2 * 86400000).toISOString();
    run(
      'INSERT INTO orders (id, user_id, status, payment_status, total_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      orderId,
      customerId,
      'pending',
      'unpaid',
      339,
      createdAt,
      createdAt,
    );
    run('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)', uuid(), orderId, 'runway-1-1', 1, 145);
    run('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)', uuid(), orderId, 'runway-2-2', 1, 194);
    run('UPDATE products SET stock = MAX(stock - 1, 0) WHERE id IN (?, ?)', 'runway-1-1', 'runway-2-2');
  }

  run("INSERT INTO meta (key, value) VALUES ('seed_version', '1')");
}

createSchema();
seedDatabase();

const sessions = {
  create(user) {
    const token = crypto.randomBytes(32).toString('hex');
    run('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)', token, user.id, now());
    return { token, session: sessions.describe(token, user) };
  },
  describe(token, user) {
    return {
      access_token: token,
      token_type: 'bearer',
      expires_in: 60 * 60 * 24 * 7,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at || user.created_at,
        created_at: user.created_at,
        user_metadata: { name: user.name, role: user.role },
      },
    };
  },
  find(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return { token: null, user: null };
    const row = get('SELECT user_id FROM sessions WHERE token = ?', token);
    if (!row) return { token: null, user: null };
    const user = get(
      'SELECT id, email, name, avatar_url, role, email_confirmed_at, created_at FROM profiles WHERE id = ?',
      row.user_id,
    );
    return { token, user: user || null };
  },
};

function publicProfile(profile) {
  if (!profile) return null;
  const { password_hash, ...rest } = profile;
  return rest;
}

function sessionFor(user, token) {
  return sessions.describe(token, user);
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: { message } });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 15 * 1024 * 1024) {
        reject(Object.assign(new Error('Request body is too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve(null);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Invalid JSON body'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function parseFilters(url) {
  const raw = url.searchParams.get('filters');
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error('Invalid filters'), { status: 400 });
  }
  if (!Array.isArray(parsed)) throw Object.assign(new Error('Invalid filters'), { status: 400 });
  return parsed;
}

function parseOrder(url, table) {
  const raw = url.searchParams.get('order');
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [column, direction = 'asc'] = part.split('.');
      if (!TABLES[table].columns.includes(column)) {
        throw Object.assign(new Error(`Unknown order column: ${column}`), { status: 400 });
      }
      return `${quote(column)} ${direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC'}`;
    });
}

function parseLimit(url) {
  const raw = url.searchParams.get('limit');
  if (!raw) return null;
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 0) {
    throw Object.assign(new Error('Invalid limit'), { status: 400 });
  }
  return limit;
}

function buildWhere(table, filters) {
  const clauses = [];
  const params = [];
  const columns = TABLES[table].columns;

  filters.forEach((filter) => {
    if (!Array.isArray(filter) || filter.length < 3) {
      throw Object.assign(new Error('Invalid filter'), { status: 400 });
    }
    const [column, operator, value] = filter;
    if (!columns.includes(column)) {
      throw Object.assign(new Error(`Unknown filter column: ${column}`), { status: 400 });
    }

    if (operator === 'in') {
      if (!Array.isArray(value) || value.length === 0) {
        clauses.push('0 = 1');
        return;
      }
      clauses.push(`${quote(column)} IN (${value.map(() => '?').join(', ')})`);
      params.push(...value);
      return;
    }

    const operators = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' };
    const sqlOperator = operators[operator];
    if (!sqlOperator) throw Object.assign(new Error(`Unsupported filter operator: ${operator}`), { status: 400 });
    clauses.push(`${quote(column)} ${sqlOperator} ?`);
    params.push(value);
  });

  return { clause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

function readRows(table, filters = [], order = [], limit = null) {
  const columns = TABLES[table].columns.map(quote).join(', ');
  const { clause, params } = buildWhere(table, filters);
  let sql = `SELECT ${columns} FROM ${quote(table)} ${clause}`;
  if (order.length) sql += ` ORDER BY ${order.join(', ')}`;
  if (limit !== null) sql += ` LIMIT ${Number(limit)}`;
  return all(sql, ...params);
}

function attachProducts(items) {
  if (!items.length) return items;
  const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];
  if (!productIds.length) return items.map((item) => ({ ...item, product: null }));
  const products = readRows('products', [['id', 'in', productIds]]);
  const byId = new Map(products.map((product) => [product.id, { ...product, image_url: product.image }]));
  return items.map((item) => ({ ...item, product: byId.get(item.product_id) || null }));
}

function attachOrderItems(orders) {
  if (!orders.length) return orders;
  const orderIds = orders.map((order) => order.id);
  const items = all(
    `SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(', ')})`,
    ...orderIds,
  );
  const enriched = attachProducts(items);
  return orders.map((order) => ({
    ...order,
    items: enriched.filter((item) => item.order_id === order.id),
  }));
}

function decorate(table, rows) {
  if (table === 'products') return rows.map((row) => ({ ...row, image_url: row.image }));
  if (table === 'profiles') return rows.map(publicProfile);
  if (table === 'order_items') return attachProducts(rows);
  if (table === 'orders') return attachOrderItems(rows);
  return rows;
}

function requireUser(req, res) {
  const { token, user } = sessions.find(req);
  if (!user) {
    sendError(res, 401, 'Please sign in to continue.');
    return null;
  }
  return { token, user };
}

function canWrite(table, user) {
  if (!user) return false;
  if (table === 'orders' || table === 'order_items') return true;
  return TABLES[table].writeRoles.includes(user.role);
}

function normalizePayload(table, body) {
  const rows = Array.isArray(body) ? body : [body];
  return rows.filter((row) => row && typeof row === 'object').map((row) => {
    const clean = {};
    Object.entries(row).forEach(([key, value]) => {
      if (TABLES[table].columns.includes(key) && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        clean[key] = value;
      }
    });
    return clean;
  });
}

function readSingleOrArray(table, filters, order, limit) {
  const rows = readRows(table, filters, order, limit);
  return decorate(table, rows);
}

async function handleAuth(req, res, pathname) {
  if (pathname === '/api/auth/signup' && req.method === 'POST') {
    const body = (await readBody(req)) || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim();
    const role = ['admin', 'staff', 'user'].includes(body.role) ? body.role : 'user';

    if (!email || !email.includes('@')) return sendError(res, 400, 'A valid email address is required.');
    if (password.length < 6) return sendError(res, 400, 'Password must be at least 6 characters.');
    if (get('SELECT id FROM profiles WHERE email = ?', email)) {
      return sendError(res, 409, 'An account with this email already exists. Try signing in instead.');
    }

    const id = uuid();
    const createdAt = now();
    run(
      'INSERT INTO profiles (id, email, name, avatar_url, role, password_hash, email_confirmed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id,
      email,
      name || email.split('@')[0],
      null,
      role,
      hashPassword(password),
      createdAt,
      createdAt,
    );

    const user = get('SELECT id, email, name, avatar_url, role, email_confirmed_at, created_at FROM profiles WHERE id = ?', id);
    const { token, session } = sessions.create(user);
    return sendJson(res, 201, { user: session.user, session });
  }

  if (pathname === '/api/auth/signin' && req.method === 'POST') {
    const body = (await readBody(req)) || {};
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = get('SELECT * FROM profiles WHERE email = ?', email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return sendError(res, 401, 'Incorrect email or password. Please try again.');
    }
    const { token, session } = sessions.create(user);
    return sendJson(res, 200, { user: session.user, session });
  }

  if (pathname === '/api/auth/session' && req.method === 'GET') {
    const { token, user } = sessions.find(req);
    if (!token || !user) return sendError(res, 401, 'Session not found.');
    run('UPDATE sessions SET created_at = ? WHERE token = ?', now(), token);
    return sendJson(res, 200, { user: sessionFor(user, token).user, session: sessionFor(user, token) });
  }

  if (pathname === '/api/auth/signout' && req.method === 'POST') {
    const { token } = sessions.find(req);
    if (token) run('DELETE FROM sessions WHERE token = ?', token);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/auth/resend' && req.method === 'POST') {
    return sendJson(res, 200, { ok: true });
  }

  return sendError(res, 404, 'Unknown auth endpoint.');
}

async function handleDb(req, res, url, table) {
  if (!TABLES[table]) return sendError(res, 404, 'Unknown table.');

  const { user } = sessions.find(req);
  const filters = parseFilters(url);
  const order = parseOrder(url, table);
  const limit = parseLimit(url);

  if (req.method === 'GET') {
    if (!TABLES[table].publicRead && !user) return sendError(res, 401, 'Please sign in to continue.');

    const scopedFilters = [...filters];

    if (table === 'orders') {
      if (!user) return sendError(res, 401, 'Please sign in to continue.');
      if (!['admin', 'staff'].includes(user.role)) {
        scopedFilters.push(['user_id', 'eq', user.id]);
      }
    }

    if (table === 'profiles') {
      if (!user) return sendError(res, 401, 'Please sign in to continue.');
      if (!['admin', 'staff'].includes(user.role)) {
        scopedFilters.push(['id', 'eq', user.id]);
      }
    }

    if (table === 'order_items') {
      if (!user) return sendError(res, 401, 'Please sign in to continue.');
      if (!['admin', 'staff'].includes(user.role)) {
        const orderRows = readRows('orders', [['user_id', 'eq', user.id]]);
        const ids = orderRows.map((row) => row.id);
        if (!ids.length) return sendJson(res, 200, []);
        scopedFilters.push(['order_id', 'in', ids]);
      }
    }

    return sendJson(res, 200, readSingleOrArray(table, scopedFilters, order, limit));
  }

  if (req.method === 'POST') {
    if (!canWrite(table, user)) return sendError(res, 403, 'You do not have permission to do that.');
    if (table === 'profiles') return sendError(res, 403, 'Profiles are managed through authentication.');

    const body = await readBody(req);
    const rows = normalizePayload(table, body);
    if (!rows.length) return sendError(res, 400, 'No data provided.');

    if (table === 'orders') {
      const ownerId = user.id;
      const inserted = rows.map((row) => {
        const id = uuid();
        const createdAt = now();
        run(
          'INSERT INTO orders (id, user_id, status, payment_status, total_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          id,
          ownerId,
          row.status || 'pending',
          'unpaid',
          0,
          createdAt,
          createdAt,
        );
        return get('SELECT * FROM orders WHERE id = ?', id);
      });
      return sendJson(res, 201, decorate('orders', inserted));
    }

    if (table === 'order_items') {
      const prepared = [];
      for (const row of rows) {
        const orderId = row.order_id;
        const productId = row.product_id;
        const quantity = Math.max(1, Number.parseInt(row.quantity, 10) || 1);
        const order = get('SELECT * FROM orders WHERE id = ?', orderId);
        if (!order) return sendError(res, 400, 'Order not found.');
        if (!['admin', 'staff'].includes(user.role) && order.user_id !== user.id) {
          return sendError(res, 403, 'You do not have permission to modify this order.');
        }
        const product = get('SELECT * FROM products WHERE id = ?', productId);
        if (!product) return sendError(res, 400, `Product ${productId} was not found.`);
        if (product.stock < quantity) {
          return sendError(res, 409, `${product.name} only has ${product.stock} left in stock.`);
        }
        prepared.push({ orderId, productId, product, quantity });
      }

      db.exec('BEGIN');
      try {
        const inserted = [];
        for (const item of prepared) {
          const id = uuid();
          run(
            'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
            id,
            item.orderId,
            item.productId,
            item.quantity,
            item.product.price,
          );
          run('UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?', item.quantity, item.productId);
          inserted.push(get('SELECT * FROM order_items WHERE id = ?', id));
        }

        const orderIds = [...new Set(prepared.map((item) => item.orderId))];
        for (const orderId of orderIds) {
          const total = get(
            'SELECT COALESCE(SUM(quantity * price), 0) AS total FROM order_items WHERE order_id = ?',
            orderId,
          );
          run('UPDATE orders SET total_price = ?, updated_at = ? WHERE id = ?', Number(total.total) || 0, now(), orderId);
        }
        db.exec('COMMIT');
        return sendJson(res, 201, decorate('order_items', inserted));
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }

    if (table === 'products') {
      const inserted = rows.map((row) => {
        const id = row.id || uuid();
        const createdAt = now();
        run(
          'INSERT INTO products (id, name, price, description, category, image, rating, reviews, stock, event, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          id,
          String(row.name || 'Untitled piece'),
          Number(row.price) || 0,
          String(row.description || ''),
          String(row.category || 'Tibeb Collection'),
          String(row.image || ''),
          Number(row.rating) || 5,
          Number(row.reviews) || 0,
          Number(row.stock) || 0,
          row.event || null,
          createdAt,
          createdAt,
        );
        return get('SELECT * FROM products WHERE id = ?', id);
      });
      return sendJson(res, 201, decorate('products', inserted));
    }

    if (table === 'categories') {
      const inserted = rows.map((row) => {
        const id = row.id || uuid();
        const name = String(row.name || '').trim();
        if (!name) throw Object.assign(new Error('Category name is required.'), { status: 400 });
        if (get('SELECT id FROM categories WHERE name = ?', name)) {
          throw Object.assign(new Error('That category already exists.'), { status: 409 });
        }
        run('INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)', id, name, now());
        return get('SELECT * FROM categories WHERE id = ?', id);
      });
      return sendJson(res, 201, inserted);
    }

    if (table === 'reviews') {
      const inserted = rows.map((row) => {
        const id = row.id || uuid();
        const createdAt = now();
        run(
          'INSERT INTO reviews (id, "userName", "userImage", rating, comment, date, "productName", created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          id,
          String(row.userName || user.name || 'Guest'),
          String(row.userImage || ''),
          Number(row.rating) || 5,
          String(row.comment || ''),
          String(row.date || 'Just now'),
          String(row.productName || ''),
          createdAt,
        );
        return get('SELECT * FROM reviews WHERE id = ?', id);
      });
      return sendJson(res, 201, inserted);
    }

    return sendError(res, 400, 'Unsupported table.');
  }

  if (req.method === 'PATCH') {
    if (!canWrite(table, user)) return sendError(res, 403, 'You do not have permission to do that.');
    if (table === 'profiles') return sendError(res, 403, 'Profiles are managed through authentication.');
    if ((table === 'orders' || table === 'order_items') && !['admin', 'staff'].includes(user.role)) {
      return sendError(res, 403, 'Only staff can update orders.');
    }

    const body = await readBody(req);
    const rows = normalizePayload(table, body);
    if (!rows.length) return sendError(res, 400, 'No data provided.');

    const updates = rows[0];
    if (!Object.keys(updates).length) return sendError(res, 400, 'No data provided.');
    if (TABLES[table].columns.includes('updated_at')) updates.updated_at = now();
    const keys = Object.keys(updates);

    const assignments = keys.map((key) => `${quote(key)} = ?`).join(', ');
    const values = keys.map((key) => updates[key]);
    const { clause, params } = buildWhere(table, filters);
    if (!clause) return sendError(res, 400, 'An id filter is required for updates.');

    const targets = readRows(table, filters);
    run(`UPDATE ${quote(table)} SET ${assignments} ${clause}`, ...values, ...params);
    return sendJson(res, 200, decorate(table, targets.map((target) => ({
      ...target,
      ...updates,
    }))));
  }

  if (req.method === 'DELETE') {
    if (!canWrite(table, user)) return sendError(res, 403, 'You do not have permission to do that.');
    if (!['admin', 'staff'].includes(user.role) && table !== 'order_items') {
      return sendError(res, 403, 'You do not have permission to do that.');
    }
    const { clause, params } = buildWhere(table, filters);
    if (!clause) return sendError(res, 400, 'A filter is required for deletes.');
    const targets = readRows(table, filters);
    run(`DELETE FROM ${quote(table)} ${clause}`, ...params);
    return sendJson(res, 200, targets);
  }

  return sendError(res, 405, 'Method not allowed.');
}

async function handleUpload(req, res) {
  const { user } = requireUser(req, res);
  if (!user) return;
  if (!['admin', 'staff'].includes(user.role)) return sendError(res, 403, 'Only staff can upload images.');

  const body = (await readBody(req)) || {};
  const target = String(body.path || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const bucket = String(body.bucket || 'product-images');
  if (!target || target.includes('..') || !/^[A-Za-z0-9._/-]+$/.test(target)) {
    return sendError(res, 400, 'Invalid upload path.');
  }
  if (!body.dataBase64) return sendError(res, 400, 'No file data provided.');

  const destination = path.join(UPLOAD_DIR, bucket, target);
  const resolved = path.resolve(destination);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return sendError(res, 400, 'Invalid upload path.');
  }

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, Buffer.from(String(body.dataBase64), 'base64'));

  return sendJson(res, 201, {
    path: target,
    publicUrl: `/uploads/${bucket}/${target}`,
    bucket,
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  fs.createReadStream(filePath).pipe(res);
}

function tryServeStatic(req, res, pathname, staticMode) {
  if (pathname.startsWith('/uploads/')) {
    const relative = decodeURIComponent(pathname.slice('/uploads/'.length)).replace(/\\/g, '/');
    if (relative.includes('..')) return false;
    const filePath = path.resolve(UPLOAD_DIR, relative);
    if (!filePath.startsWith(path.resolve(UPLOAD_DIR))) return false;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      serveFile(res, filePath);
      return true;
    }
    return false;
  }

  if (!staticMode && !fs.existsSync(DIST_DIR)) return false;

  let requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(DIST_DIR, `.${requested}`);
  if (!filePath.startsWith(path.resolve(DIST_DIR))) return false;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(res, filePath);
    return true;
  }

  const fallback = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(fallback)) {
    serveFile(res, fallback);
    return true;
  }

  return false;
}

const args = process.argv.slice(2);
const staticMode = args.includes('--static');
const portIndex = args.indexOf('--port');
const PORT = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.API_PORT || 3101);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'ethio-design-and-tibeb', time: now() });
    }

    if (pathname.startsWith('/api/auth/')) {
      return await handleAuth(req, res, pathname);
    }

    if (pathname === '/api/storage/upload' && req.method === 'POST') {
      return await handleUpload(req, res);
    }

    if (pathname.startsWith('/api/db/')) {
      const table = decodeURIComponent(pathname.slice('/api/db/'.length));
      return await handleDb(req, res, url, table);
    }

    if (tryServeStatic(req, res, pathname, staticMode)) return;

    sendError(res, 404, 'Not found.');
  } catch (error) {
    console.error('API error:', error);
    if (res.headersSent) return res.end();
    sendError(res, Number(error.status) || 500, error.message || 'Internal server error.');
  }
});

server.listen(PORT, () => {
  console.log(`[api] Ethio Design and Tibeb backend running on http://localhost:${PORT}`);
  if (staticMode) console.log(`[api] Serving production build from ${DIST_DIR}`);
});
