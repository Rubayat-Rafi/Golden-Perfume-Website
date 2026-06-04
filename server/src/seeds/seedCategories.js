import 'dotenv/config';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';

const categories = [
  { name: 'Fragrance & Body Oils',       slug: 'fragrance-body-oils',       image: '/assets/brand/cat-fragrance.jpg',     order: 1  },
  { name: 'Air Freshener & Burning Oil', slug: 'air-freshener-burning-oil', image: '/assets/brand/cat-oils-flowers.jpg',  order: 2  },
  { name: 'Incense',                     slug: 'incense',                   image: '/assets/brand/cat-incense.jpg',       order: 3  },
  { name: 'New Arrival',                 slug: 'new-arrival',               image: '/assets/brand/cat-perfume-flowers.jpg', order: 4 },
  { name: 'Aroma Lamps',                 slug: 'aroma-lamps',               image: '/assets/brand/cat-aromatherapy.jpg',  order: 5  },
  { name: 'Packaging',                   slug: 'packaging',                 image: '/assets/brand/cat-retro.jpg',         order: 6  },
  { name: 'Incense Burner',              slug: 'incense-burner',            image: '/assets/brand/cat-spa.jpg',           order: 7  },
  { name: 'Essential Oil',               slug: 'essential-oil',             image: '/assets/brand/cat-essential.jpg',     order: 8  },
  { name: 'Soap',                        slug: 'soap',                      image: '/assets/brand/cat-soap.jpg',          order: 9  },
  { name: 'Life Style',                  slug: 'life-style',                image: '/assets/brand/cat-lifestyle.jpg',     order: 10 },
  { name: 'Herbs & Smudges',             slug: 'herbs-smudges',             image: '/assets/brand/cat-herbs.jpg',         order: 11 },
  { name: 'Skin Care & Hair Product',    slug: 'skin-care-hair-product',    image: '/assets/brand/cat-skincare.jpg',      order: 12 },
  { name: 'African Natural Products',    slug: 'african-natural-products',  image: '/assets/brand/cat-african.jpg',       order: 13 },
  { name: 'Natural Supplements',         slug: 'natural-supplements',       image: '/assets/brand/cat-lavender.jpg',      order: 14 },
  { name: 'Cosmetic Base',               slug: 'cosmetic-base',             image: '/assets/brand/cat-cream.jpg',         order: 15 },
  { name: 'Bottle Display',              slug: 'bottle-display',            image: '/assets/brand/cat-bottles.jpg',       order: 16 },
  { name: 'Jewelry',                     slug: 'jewelry',                   image: '/assets/brand/cat-stone.jpg',         order: 17 },
];

const run = async () => {
  await connectDB();

  // Upsert each category by slug so re-running is safe
  let created = 0, updated = 0;
  for (const cat of categories) {
    const result = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true, returnDocument: 'after' }
    );
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`✅ Seed complete — ${created} created, ${updated} already existed`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });