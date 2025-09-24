const { getAllShopOwners, getAllManagers } = require('../models/user');
// Get all shop owners (admin)
exports.getAllShopOwners = async (req, res) => {
  try {
    const shopOwners = await getAllShopOwners();
    res.json(shopOwners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shop owners', details: err.message });
  }
};

// Get all managers (admin)
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await getAllManagers();
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch managers', details: err.message });
  }
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  createUser,
  getUserByEmail,
  setUserOTP,
  updateUserPassword,
  createAdmin,
  createShopOwner,
  createManager
} = require('../models/user');
const { sendEmail } = require('../utils/email');

exports.adminCreateUser = async (req, res) => {
  const { email, role, admin_name, admin_code, shop_name, shop_address, contact_number, manager_name } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Email and role required' });
  const password = crypto.randomBytes(6).toString('hex');
  console.log(`Generated password for ${email}: ${password}`);
  const hash = await bcrypt.hash(password, 10);
  try {
    const pool = require('../config/db');
    // Create user
    const userId = await createUser(email, hash, role);
    // Insert into role-specific table
    if (role === 'admin') {
      await createAdmin(userId, admin_name || '', admin_code || null);
    } else if (role === 'shopowner') {
      // Auto-generate shop_code: SP001, SP002, ... (find max numeric part)
      const [rows] = await pool.query("SELECT MAX(CAST(SUBSTRING(shop_code, 3) AS UNSIGNED)) as max_code FROM shop_owners");
      let nextNum = 1;
      if (rows.length && rows[0].max_code) {
        nextNum = rows[0].max_code + 1;
      }
      const shop_code = `SP${String(nextNum).padStart(3, '0')}`;
      await createShopOwner(userId, shop_name || '', shop_address || '', contact_number || '', shop_code);
    } else if (role === 'manager') {
      // Auto-generate manager_code: MN001, MN002, ... (find max numeric part)
      const [rows] = await pool.query("SELECT MAX(CAST(SUBSTRING(manager_code, 3) AS UNSIGNED)) as max_code FROM managers");
      let nextNum = 1;
      if (rows.length && rows[0].max_code) {
        nextNum = rows[0].max_code + 1;
      }
      const manager_code = `MN${String(nextNum).padStart(3, '0')}`;
      await createManager(userId, manager_name || '', contact_number || '', manager_code);
    }
    // await sendEmail(
    //   email,
    //   'Your Account Credentials',
    //   `Your login email: ${email}\nPassword: ${password}\nPlease change your password after login.`
    // );
    console.log(`Created user: ${email}, password: ${password}`);
    res.json({ message: 'User created', password });
  } catch (err) {
    res.status(500).json({ error: 'User creation failed', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  console.log(user);
  const match = await bcrypt.compare(password, user.password);
  console.log(password, user.password, match);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await setUserOTP(email, otp, expiry);
  await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);
  res.json({ message: 'OTP sent to email' });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await getUserByEmail(email);
  if (!user || user.otp !== otp || !user.otp_expiry || new Date() > user.otp_expiry) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(email, hash);
  await setUserOTP(email, null, null);
  res.json({ message: 'Password updated' });
};
