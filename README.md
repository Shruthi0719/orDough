# orDough - Bakery Website

A modern, full-stack React bakery website with TypeScript, Vite, Three.js 3D graphics, and a Node.js/MongoDB backend.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **pnpm** (recommended) or npm
- **MongoDB** (local or Atlas connection string)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd orDough-main
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables** (see [Environment Setup](#environment-setup) below)

## 🏃 Running the Project

### Option 1: Frontend Only (Local Development)

```bash
PORT=5173 BASE_PATH="/" pnpm --filter @workspace/ordough dev
```

Then open: `http://localhost:5173`

### Option 2: Backend Only (API Server)

```bash
PORT=3001 DATABASE_URL="mongodb://localhost:27017/ordough" \
  ADMIN_USERNAME="admin" \
  ADMIN_PASSWORD="your_password" \
  SESSION_SECRET="your_secret_key" \
  pnpm --filter @workspace/api-server dev
```

The API runs on: `http://localhost:3001`

### Option 3: Both Frontend + Backend (Full Development)

```bash
PORT=5173 BASE_PATH="/" \
PORT_API=3001 DATABASE_URL="mongodb://localhost:27017/ordough" \
  ADMIN_USERNAME="admin" \
  ADMIN_PASSWORD="your_password" \
  SESSION_SECRET="your_secret_key" \
  pnpm dev
```

## 🔧 Environment Setup

### Frontend (ordough)

Create `.env` in `artifacts/ordough/`:

```env
PORT=5173
BASE_PATH=/
VITE_API_URL=http://localhost:3001
```

### Backend (api-server)

Create `.env` in `artifacts/api-server/`:

```env
PORT=3001
DATABASE_URL=mongodb://localhost:27017/ordough
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_random_secret_key_min_32_chars
NODE_ENV=development
```

### MongoDB Setup

#### Local MongoDB
```bash
# Install MongoDB Community Edition
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB:
brew services start mongodb-community

# Default connection: mongodb://localhost:27017
```

#### MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/ordough`
5. Use this as `DATABASE_URL`

## 📁 Project Structure

```
orDough-main/
├── artifacts/
│   ├── ordough/              # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   │   └── ThreeHero.tsx   # 3D doughnut visualization
│   │   │   └── lib/          # Utilities
│   │   └── vite.config.ts
│   ├── api-server/           # Backend (Node.js/Express)
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middlewares/
│   │   │   └── lib/
│   │   └── package.json
│   └── mockup-sandbox/       # UI component previews
├── lib/
│   ├── api-client-react/     # React API client
│   ├── api-zod/              # Zod schemas
│   ├── api-spec/             # OpenAPI spec
│   └── db/                   # Database schemas
└── package.json              # Root monorepo config
```

## 🎯 Key Features

- **3D Visualization**: Interactive Three.js doughnut with animations
- **Modern UI**: Tailwind CSS with responsive design
- **Full-Stack**: TypeScript throughout frontend and backend
- **API**: RESTful API with authentication
- **Database**: MongoDB integration
- **Hot Reload**: Vite for fast development

## 📝 Available Scripts

```bash
# Install all dependencies
pnpm install

# Frontend development
pnpm --filter @workspace/ordough dev

# Backend development
pnpm --filter @workspace/api-server dev

# Build for production
pnpm build

# Generate API clients
pnpm --filter @workspace/api-spec generate
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/reviews` | Get approved reviews |
| POST | `/api/reviews` | Create new review |
| GET | `/api/health` | Health check |

## 🐛 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux: Find and kill process
lsof -i :5173
kill -9 <PID>

# Or use a different port
PORT=5174 pnpm --filter @workspace/ordough dev
```

### MongoDB Connection Error
- Verify MongoDB is running: `brew services list` (macOS)
- Check connection string in `.env`
- Ensure database name is correct

### Dependencies Not Installing
```bash
# Clear pnpm cache and reinstall
pnpm store prune
pnpm install
```

### Hot Reload Not Working
- Check that `PORT` and `BASE_PATH` environment variables are set
- Restart the dev server
- Clear browser cache

## 🚢 Production Build

```bash
# Build all packages
pnpm build

# Frontend output: artifacts/ordough/dist/public/
# Backend output: artifacts/api-server/build/
```

## 📚 Documentation

- **Frontend**: See `artifacts/ordough/README.md`
- **Backend**: See `artifacts/api-server/README.md`
- **API Spec**: `lib/api-spec/openapi.yaml`

## 🤝 Development Notes

- Uses **pnpm workspaces** for monorepo management
- **TypeScript** for type safety
- **Framer Motion** for animations
- **Three.js** for 3D graphics
- **React Query** for server state management
- **Tailwind CSS** for styling

## 📄 License

All rights reserved © 2024 orDough Bakery
