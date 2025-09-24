# Mobikoo Backend

## Setup

1. Copy `.env` and fill in your MySQL and email credentials.
2. Run `npm install` to install dependencies.
3. Start server: `node index.js`

## Tech Stack
- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- bcrypt
- nodemailer
- dotenv
- cors

## Features
- Admin creates users (email + auto password, credentials sent via email)
- JWT-based login (email, role in token)
- Forgot password (OTP via email, reset password)
- Role-based access (admin, user)

## Next Steps
- Implement user and auth routes
- Add MySQL models
- Integrate nodemailer for email/OTP

---

Replace all placeholder values in `.env` before running.
