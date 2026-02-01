# ForgeReview

A modern, high-performance web portal for discovering and reviewing digital products. ForgeReview prioritizes community trust through a tiered reviewer system and verified moderation.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI/Styling**: Shadcn UI + Tailwind CSS
- **Animations**: Framer Motion
- **Database**: MongoDB (via Mongoose)
- **Caching/Rate Limiting**: Upstash Redis
- **Auth**: NextAuth.js (Google OAuth)
- **File Storage**: UploadThing

## 🚀 Features

### 1. The Upload Engine
Users can submit products in three ways:
- **Direct Package**: .apk, .zip, or .ipa files (via UploadThing)
- **Direct Link**: URL for Web Apps/SaaS
- **Store Redirect**: Deep links to Apple App Store or Google Play

### 2. Tiered Community Roles
- **User**: Submit apps, write basic reviews, upvote others
- **Verified Reviewer**: Reviews highlighted with badge; higher weight in "Pulse Score"
- **Super Reviewer**: Exclusive access to "Early Access" apps; can write long-form editorial reviews
- **Moderator**: Flagging, deleting spam, and verifying app safety

### 3. Redis Integration
- **Trending Apps**: Redis ZSET to track views and votes in real-time
- **Rate Limiting**: Prevent review spam
- **Session Caching**: Cache frequently accessed app metadata

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Login/Register
│   ├── (community)/      # Feed, Leaderboards, Moderator Dashboard
│   ├── apps/             # App listings & Individual Review Pages
│   │   ├── [id]/
│   │   └── upload/       # Multi-step upload form
│   ├── api/              # API routes
│   └── layout.tsx
├── components/
│   ├── shared/           # Navbar, Footer
│   ├── reviews/          # ReviewCard, StarRating
│   ├── apps/             # AppCard
│   ├── upload/           # AppUploadForm
│   └── ui/               # Shadcn components
├── lib/
│   ├── db.ts             # MongoDB Connection
│   ├── redis.ts          # Redis Client
│   ├── auth.ts           # NextAuth config
│   └── utils.ts          # Utility functions
└── models/               # Mongoose Schemas
```

## 📝 Database Schema

### App
```typescript
{
  title: String,
  description: String,
  category: ["Web", "Mobile", "Desktop"],
  submissionType: ["package", "link", "store"],
  downloadUrl: String,
  tags: String[],
  uploader: ObjectId (Ref: User),
  averageRating: Number,
  isVerified: Boolean,
  status: ["pending", "approved", "rejected"],
  pulseScore: Number
}
```

### Review
```typescript
{
  appId: ObjectId (Ref: App),
  authorId: ObjectId (Ref: User),
  content: String,
  rating: Number (1-5),
  isSuperReview: Boolean,
  likes: Number,
  createdAt: Date
}
```

## ⚡ Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/forge-review.git
cd forge-review
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Copy `.env.local.example` to `.env.local` and fill in your credentials:
```bash
cp .env.local.example .env.local
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔧 Configuration

### MongoDB
Set up a MongoDB database (MongoDB Atlas recommended) and add the connection string to `MONGODB_URI`.

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Upstash Redis
1. Create an account at [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and token to your `.env.local`

### UploadThing
1. Create an account at [UploadThing](https://uploadthing.com/)
2. Create a new project
3. Copy the token to your `.env.local`

## 🎨 Design Philosophy

To avoid the "AI-generated" look, we implement:
- **High-Contrast Borders**: Using `border-input` and ring offsets to define sections clearly
- **Bento Grid Layouts**: Organizing app discovery cards in asymmetrical, modular grids
- **Authentic Imagery**: Real screenshots and community-uploaded media
- **Micro-interactions**: Snappy, physics-based transitions using Framer Motion

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.
