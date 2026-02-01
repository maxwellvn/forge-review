import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Category Schema (inline to avoid import issues)
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 50 },
    type: { type: String, required: true, enum: ['discussion', 'app', 'review'] },
    description: { type: String, trim: true, maxlength: 200 },
    color: { type: String, required: true, default: 'gray' },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1, type: 1 }, { unique: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const defaultCategories = [
  // Discussion categories
  { name: 'General', slug: 'general', type: 'discussion', color: 'gray', order: 0 },
  { name: 'Feedback', slug: 'feedback', type: 'discussion', color: 'blue', order: 1 },
  { name: 'Bug Report', slug: 'bug_report', type: 'discussion', color: 'red', order: 2 },
  { name: 'Feature Request', slug: 'feature_request', type: 'discussion', color: 'purple', order: 3 },
  { name: 'Showcase', slug: 'showcase', type: 'discussion', color: 'green', order: 4 },
  { name: 'Question', slug: 'question', type: 'discussion', color: 'yellow', order: 5 },

  // App platform categories
  { name: 'Web', slug: 'web', type: 'app', color: 'blue', order: 0 },
  { name: 'Mobile', slug: 'mobile', type: 'app', color: 'green', order: 1 },
  { name: 'Desktop', slug: 'desktop', type: 'app', color: 'purple', order: 2 },

  // Review categories
  { name: 'Positive', slug: 'positive', type: 'review', color: 'green', order: 0 },
  { name: 'Critical', slug: 'critical', type: 'review', color: 'red', order: 1 },
  { name: 'Feature Review', slug: 'feature_review', type: 'review', color: 'blue', order: 2 },
  { name: 'Comparison', slug: 'comparison', type: 'review', color: 'purple', order: 3 },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected!');

    let created = 0;
    let skipped = 0;

    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ slug: cat.slug, type: cat.type });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created: ${cat.type}/${cat.name}`);
        created++;
      } else {
        console.log(`Skipped (exists): ${cat.type}/${cat.name}`);
        skipped++;
      }
    }

    console.log(`\nDone! Created ${created} categories, skipped ${skipped} existing.`);
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
