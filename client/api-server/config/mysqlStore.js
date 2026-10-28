import mysql from 'mysql2/promise';

let pool = null;
let isConnected = false;

export const getMySQLPool = () => {
  const uri = process.env.DATABASE_URL || process.env.MYSQL_URI;
  if (!uri || !uri.startsWith('mysql')) return null;

  if (!pool) {
    try {
      pool = mysql.createPool({
        uri,
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } catch (e) {
      console.warn('⚠️ [MySQL] Pool creation warning:', e.message);
      return null;
    }
  }
  return pool;
};

export const isMySQLConnected = () => isConnected;

export const initMySQL = async () => {
  const p = getMySQLPool();
  if (!p) {
    isConnected = false;
    return false;
  }

  try {
    const connection = await p.getConnection();
    console.log('✅ [Database] TiDB Cloud MySQL Connected successfully.');
    isConnected = true;

    // 1. Ensure products table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tamilName VARCHAR(255),
        category VARCHAR(100),
        categoryName VARCHAR(150),
        price DECIMAL(10,2) NOT NULL,
        originalPrice DECIMAL(10,2),
        weight VARCHAR(50),
        stock INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 4.8,
        reviewsCount INT DEFAULT 0,
        badge VARCHAR(100),
        image VARCHAR(500),
        description TEXT,
        ingredients JSON,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Ensure orders table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        orderId VARCHAR(64) PRIMARY KEY,
        customer JSON NOT NULL,
        items JSON NOT NULL,
        pricing JSON NOT NULL,
        payment JSON NOT NULL,
        orderStatus VARCHAR(50) DEFAULT 'Placed',
        orderTimeline JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Ensure categories table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tamilName VARCHAR(255),
        icon VARCHAR(50) DEFAULT '✨',
        image VARCHAR(500),
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [catCountRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (catCountRows[0].count === 0) {
      const { DEFAULT_CATEGORIES } = await import('../data/mockCategoryStore.js');
      for (const c of DEFAULT_CATEGORIES) {
        await connection.query(
          `INSERT INTO categories (id, name, tamilName, icon, image, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [c.id, c.name, c.tamilName || '', c.icon || '✨', c.image || '', c.description || '']
        );
      }
      console.log('📂 [Database] Seeded categories into TiDB MySQL.');
    }

    // 4. Seed initial products if table is empty
    const [countRows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (countRows[0].count === 0) {
      const { SEED_CATALOG } = await import('../data/mockProductStore.js');
      for (const p of SEED_CATALOG) {
        await connection.query(
          `INSERT INTO products (id, name, tamilName, category, categoryName, price, originalPrice, weight, stock, rating, reviewsCount, badge, image, description, ingredients, isActive)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.name,
            p.tamilName || '',
            p.category || '',
            p.categoryName || '',
            p.price,
            p.originalPrice || null,
            p.weight || '250g',
            p.stock || 20,
            p.rating || 4.8,
            p.reviewsCount || 0,
            p.badge || '',
            p.image || '',
            p.description || '',
            JSON.stringify(p.ingredients || []),
            1
          ]
        );
      }
      console.log('🌱 [Database] Seeded 18 products into TiDB MySQL.');
    } else {
      // Ensure existing database records have distinct product images
      const { SEED_CATALOG } = await import('../data/mockProductStore.js');
      for (const p of SEED_CATALOG) {
        if (p.image && p.image.startsWith('/images/products/')) {
          await connection.query(
            'UPDATE products SET image = ? WHERE id = ? AND (image LIKE "/images/cat-%" OR image = "/images/prod-podi.jpg" OR image = "/images/prod-laddu.jpg")',
            [p.image, p.id]
          );
        }
      }
    }

    connection.release();
    return true;
  } catch (err) {
    console.warn('⚠️ [Database] TiDB / MySQL connection notice:', err.message);
    isConnected = false;
    return false;
  }
};

// Helper: Format MySQL row to product object
const formatProductRow = (row) => {
  if (!row) return null;
  let ingredients = [];
  try {
    ingredients = typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients || [];
  } catch {
    ingredients = [];
  }
  return {
    id: row.id,
    name: row.name,
    tamilName: row.tamilName || '',
    category: row.category,
    categoryName: row.categoryName,
    price: Number(row.price),
    originalPrice: row.originalPrice ? Number(row.originalPrice) : null,
    weight: row.weight,
    stock: Number(row.stock),
    rating: Number(row.rating || 4.8),
    reviewsCount: Number(row.reviewsCount || 0),
    badge: row.badge || '',
    image: row.image,
    description: row.description,
    ingredients,
    inStock: Number(row.stock) > 0,
    isActive: Boolean(row.isActive)
  };
};

// ==========================================
// MySQL Product Operations
// ==========================================
export const mysqlGetAllProducts = async (includeInactive = false) => {
  const p = getMySQLPool();
  if (!p) return null;
  try {
    const sql = includeInactive ? 'SELECT * FROM products ORDER BY id ASC' : 'SELECT * FROM products WHERE isActive = 1 ORDER BY id ASC';
    const [rows] = await p.query(sql);
    return rows.map(formatProductRow);
  } catch (err) {
    console.warn('⚠️ [MySQL] getAllProducts error:', err.message);
    return null;
  }
};

export const mysqlGetProductById = async (id) => {
  const p = getMySQLPool();
  if (!p || !id) return null;
  try {
    const [rows] = await p.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    return formatProductRow(rows[0]);
  } catch (err) {
    console.warn('⚠️ [MySQL] getProductById error:', err.message);
    return null;
  }
};

export const mysqlSaveProduct = async (prod) => {
  const p = getMySQLPool();
  if (!p || !prod) return null;
  try {
    const [existing] = await p.query('SELECT id FROM products WHERE id = ?', [prod.id]);
    if (existing && existing.length > 0) {
      // Update
      await p.query(
        `UPDATE products SET name = ?, tamilName = ?, category = ?, categoryName = ?, price = ?, originalPrice = ?, weight = ?, stock = ?, badge = ?, image = ?, description = ?, ingredients = ?, isActive = ? WHERE id = ?`,
        [
          prod.name,
          prod.tamilName || '',
          prod.category || '',
          prod.categoryName || '',
          prod.price,
          prod.originalPrice || null,
          prod.weight || '250g',
          prod.stock || 0,
          prod.badge || '',
          prod.image || '',
          prod.description || '',
          JSON.stringify(prod.ingredients || []),
          prod.isActive !== false ? 1 : 0,
          prod.id
        ]
      );
    } else {
      // Insert
      await p.query(
        `INSERT INTO products (id, name, tamilName, category, categoryName, price, originalPrice, weight, stock, rating, reviewsCount, badge, image, description, ingredients, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.id,
          prod.name,
          prod.tamilName || '',
          prod.category || '',
          prod.categoryName || '',
          prod.price,
          prod.originalPrice || null,
          prod.weight || '250g',
          prod.stock || 0,
          prod.rating || 4.8,
          prod.reviewsCount || 0,
          prod.badge || '',
          prod.image || '',
          prod.description || '',
          JSON.stringify(prod.ingredients || []),
          prod.isActive !== false ? 1 : 0
        ]
      );
    }
    return await mysqlGetProductById(prod.id);
  } catch (err) {
    console.warn('⚠️ [MySQL] saveProduct error:', err.message);
    return null;
  }
};

export const mysqlUpdateProductStock = async (id, newStock) => {
  const p = getMySQLPool();
  if (!p || !id) return null;
  try {
    await p.query('UPDATE products SET stock = ? WHERE id = ?', [Math.max(0, newStock), id]);
    return await mysqlGetProductById(id);
  } catch (err) {
    console.warn('⚠️ [MySQL] updateStock error:', err.message);
    return null;
  }
};

export const mysqlDeactivateProduct = async (id) => {
  const p = getMySQLPool();
  if (!p || !id) return null;
  try {
    await p.query('UPDATE products SET isActive = 0 WHERE id = ?', [id]);
    return await mysqlGetProductById(id);
  } catch (err) {
    console.warn('⚠️ [MySQL] deactivateProduct error:', err.message);
    return null;
  }
};

// ==========================================
// MySQL Order Operations
// ==========================================
const formatOrderRow = (row) => {
  if (!row) return null;
  const parseJson = (val) => {
    if (!val) return null;
    return typeof val === 'string' ? JSON.parse(val) : val;
  };
  return {
    orderId: row.orderId,
    customer: parseJson(row.customer),
    items: parseJson(row.items),
    pricing: parseJson(row.pricing),
    payment: parseJson(row.payment),
    orderStatus: row.orderStatus,
    orderTimeline: parseJson(row.orderTimeline),
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString()
  };
};

export const mysqlSaveOrder = async (order) => {
  const p = getMySQLPool();
  if (!p || !order) return null;
  try {
    await p.query(
      `INSERT INTO orders (orderId, customer, items, pricing, payment, orderStatus, orderTimeline, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE orderStatus = VALUES(orderStatus), orderTimeline = VALUES(orderTimeline), updatedAt = NOW()`,
      [
        order.orderId,
        JSON.stringify(order.customer || {}),
        JSON.stringify(order.items || []),
        JSON.stringify(order.pricing || {}),
        JSON.stringify(order.payment || {}),
        order.orderStatus || 'Placed',
        JSON.stringify(order.orderTimeline || []),
        order.createdAt ? new Date(order.createdAt) : new Date()
      ]
    );
    return await mysqlGetOrderById(order.orderId);
  } catch (err) {
    console.warn('⚠️ [MySQL] saveOrder error:', err.message);
    return null;
  }
};

export const mysqlGetOrderById = async (orderId) => {
  const p = getMySQLPool();
  if (!p || !orderId) return null;
  try {
    const [rows] = await p.query('SELECT * FROM orders WHERE orderId = ?', [orderId]);
    if (!rows || rows.length === 0) return null;
    return formatOrderRow(rows[0]);
  } catch (err) {
    console.warn('⚠️ [MySQL] getOrderById error:', err.message);
    return null;
  }
};

export const mysqlGetAllOrders = async () => {
  const p = getMySQLPool();
  if (!p) return null;
  try {
    const [rows] = await p.query('SELECT * FROM orders ORDER BY createdAt DESC');
    return rows.map(formatOrderRow);
  } catch (err) {
    console.warn('⚠️ [MySQL] getAllOrders error:', err.message);
    return null;
  }
};

export const mysqlUpdateOrderStatus = async (orderId, newStatus, timeline) => {
  const p = getMySQLPool();
  if (!p || !orderId) return null;
  try {
    await p.query(
      'UPDATE orders SET orderStatus = ?, orderTimeline = ?, updatedAt = NOW() WHERE orderId = ?',
      [newStatus, JSON.stringify(timeline || []), orderId]
    );
    return await mysqlGetOrderById(orderId);
  } catch (err) {
    console.warn('⚠️ [MySQL] updateOrderStatus error:', err.message);
    return null;
  }
};


export const mysqlGetAllCategories = async () => {
  const p = getMySQLPool();
  if (!p) return null;
  try {
    const [rows] = await p.query('SELECT * FROM categories ORDER BY id ASC');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      tamilName: r.tamilName || '',
      icon: r.icon || '✨',
      image: r.image || '',
      description: r.description || ''
    }));
  } catch (err) {
    console.warn('⚠️ [MySQL] getAllCategories error:', err.message);
    return null;
  }
};

export const mysqlSaveCategory = async (cat) => {
  const p = getMySQLPool();
  if (!p || !cat || !cat.id) return null;
  try {
    await p.query(
      `INSERT INTO categories (id, name, tamilName, icon, image, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), tamilName = VALUES(tamilName), icon = VALUES(icon), image = VALUES(image), description = VALUES(description), updatedAt = NOW()`,
      [cat.id, cat.name, cat.tamilName || '', cat.icon || '✨', cat.image || '', cat.description || '']
    );
    return cat;
  } catch (err) {
    console.warn('⚠️ [MySQL] saveCategory error:', err.message);
    return null;
  }
};

export const mysqlDeleteCategory = async (id) => {
  const p = getMySQLPool();
  if (!p || !id) return false;
  try {
    const [res] = await p.query('DELETE FROM categories WHERE id = ?', [id]);
    return res.affectedRows > 0;
  } catch (err) {
    console.warn('⚠️ [MySQL] deleteCategory error:', err.message);
    return false;
  }
};
