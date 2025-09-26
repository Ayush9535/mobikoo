const pool = require('../config/db');
const { get } = require('../routes/auth');
// Get all shop owners (for admin)
async function getAllShopOwners() {
  const [rows] = await pool.query(`
    SELECT s.shop_code, s.shop_name, s.shop_address, s.contact_number, u.email
    FROM shop_owners s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.id
  `);
  return rows;
}

// Get all managers (for admin)
async function getAllManagers() {
  const [rows] = await pool.query(`
    SELECT m.manager_code, m.manager_name, m.contact_number, u.email
    FROM managers m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.id
  `);
  return rows;
}

// Get manager by email
async function getManagerByEmail(email) {
  const [rows] = await pool.query(`
    SELECT m.*, u.email, u.role
    FROM managers m
    JOIN users u ON m.user_id = u.id
    WHERE u.email = ?
  `, [email]);
  return rows[0];
}

// User roles: 'admin', 'user'
// Table: users (id, email, password, role, otp, otp_expiry)

async function createUser(email, password, role = 'user') {
  const [result] = await pool.query(
    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
    [email, password, role]
  );
  return result.insertId;
}

async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function getShopOwnerByEmail(email) {
  const [rows] = await pool.query(`
    SELECT s.*, u.email, u.role
    FROM shop_owners s
    JOIN users u ON s.user_id = u.id
    WHERE u.email = ? AND u.role = 'shopowner'
  `, [email]);
  return rows[0];
}

async function setUserOTP(email, otp, expiry) {
  await pool.query('UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?', [otp, expiry, email]);
}

async function updateUserPassword(email, password) {
  await pool.query('UPDATE users SET password = ? WHERE email = ?', [password, email]);
}


// Role-specific insert functions
async function createAdmin(userId, admin_name, admin_code) {
  await pool.query(
    'INSERT INTO admins (user_id, admin_name, admin_code) VALUES (?, ?, ?)',
    [userId, admin_name, admin_code]
  );
}

async function createShopOwner(userId, shop_name, shop_address, contact_number, shop_code) {
  await pool.query(
    'INSERT INTO shop_owners (user_id, shop_name, shop_address, contact_number, shop_code) VALUES (?, ?, ?, ?, ?)',
    [userId, shop_name, shop_address, contact_number, shop_code]
  );
}

async function createManager(userId, manager_name, contact_number, manager_code) {
  await pool.query(
    'INSERT INTO managers (user_id, manager_name, contact_number, manager_code) VALUES (?, ?, ?, ?)',
    [userId, manager_name, contact_number, manager_code]
  );
}

// Role-specific get functions (optional, for future use)
async function getAdminByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM admins WHERE user_id = ?', [userId]);
  return rows[0];
}
async function getShopOwnerByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM shop_owners WHERE user_id = ?', [userId]);
  return rows[0];
}
async function getManagerByUserId(userId) {
  const [rows] = await pool.query(`
    SELECT m.*, u.email
    FROM managers m
    JOIN users u ON m.user_id = u.id
    WHERE m.user_id = ?
  `, [userId]);
  return rows[0];
}

async function getAdminByEmail(email) {
  const [rows] = await pool.query(`
    SELECT a.*, u.email, u.role
    FROM admins a
    JOIN users u ON a.user_id = u.id
    WHERE u.email = ?
  `, [email]);
  return rows[0];
}

module.exports = {
  createUser,
  getUserByEmail,
  getManagerByUserId,
  getAllManagers,
  getAllShopOwners,
  getShopOwnerByUserId,
  createAdmin,
  createShopOwner,
  createManager,
  getAdminByUserId,
  getShopOwnerByUserId,
  getManagerByUserId
  ,getAllShopOwners
  ,getAllManagers,
  getShopOwnerByEmail,
  getManagerByEmail,
  getAdminByEmail,
};
