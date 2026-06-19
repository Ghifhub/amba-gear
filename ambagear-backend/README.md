# AMBA GEAR Backend API

Backend API untuk website AMBA GEAR menggunakan Node.js, Express, dan Supabase.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env` file
   - Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari Supabase Dashboard
   - Generate random string untuk `JWT_SECRET`

3. **Setup database di Supabase:**
   - Buat project baru di [supabase.com](https://supabase.com)
   - Jalankan SQL query di `database.sql` untuk create tables

4. **Run development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (butuh token)

### Products
- `GET /api/products` - Get semua produk (optional: ?category=mouse)
- `GET /api/products/:id` - Get produk by ID
- `POST /api/products` - Create produk baru (admin only)
- `PUT /api/products/:id` - Update produk (admin only)
- `DELETE /api/products/:id` - Delete produk (admin only)

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_super_secret_jwt_key_here
ALLOWED_ORIGINS=https://your-frontend-domain.com
PORT=5000
```

## Database Schema

Tables yang dibutuhkan:
- `users` - User accounts
- `products` - Product catalog
- `orders` - Order history (future feature)

Lihat file `database.sql` untuk schema lengkap.