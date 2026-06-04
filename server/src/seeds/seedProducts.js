import 'dotenv/config';
import { createRequire } from 'module';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

const require = createRequire(import.meta.url);
const raw = require('../../../client/src/data/product/product.json');

// Map category display name → slug
const CATEGORY_SLUG = {
  'Fragrance & Body Oils':    'fragrance-body-oils',
  'Air Freshener & Burning Oil': 'air-freshener-burning-oil',
  'Incense':                  'incense',
  'New Arrival':              'new-arrival',
  'Aroma Lamps':              'aroma-lamps',
  'Packaging':                'packaging',
  'Incense Burner':           'incense-burner',
  'Essential Oil':            'essential-oil',
  'Soap':                     'soap',
  'Life Style':               'life-style',
  'Herbs & Smudges':          'herbs-smudges',
  'Skin Care & Hair Product': 'skin-care-hair-product',
  'African Natural Products': 'african-natural-products',
  'Natural Supplements':      'natural-supplements',
  'Cosmetic Base':            'cosmetic-base',
  'Bottle Display':           'bottle-display',
  'Jewelry':                  'jewelry',
};

// Convert JSON id like "gf-fragrance-001" to a URL slug
const toSlug = (id, name) => {
  if (id) return id.toLowerCase().trim();
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

const mapVariants = (variants = []) =>
  variants.map((v) => ({
    sku:            v.sku,
    size:           v.size,
    retailPrice:    toNumber(v.price),
    wholesalePrice: toNumber(v.wholesalePrice),
    weight:         v.weight || '',
    inStock:        v.inStock !== false,
    stockQty:       0,
  }));

const mapReviews = (reviews = []) =>
  reviews.map((r) => ({
    authorName:  r.author?.name  || 'Anonymous',
    authorImage: r.author?.image || '',
    rating:      r.rating || 5,
    content:     r.content || '',
    date:        r.reviewDate || '',
  }));

const calcRating = (reviews) => {
  if (!reviews.length) return 0;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return Math.round(avg * 10) / 10;
};

const run = async () => {
  await connectDB();

  let created = 0, skipped = 0, errors = 0;

  for (const p of raw) {
    try {
      const slug         = toSlug(p.id, p.name);
      const categoryName = p.category || '';
      const categorySlug = CATEGORY_SLUG[categoryName] || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const mappedVariants = mapVariants(p.variants);
      const mappedReviews  = mapReviews(p.reviews);

      const doc = {
        productNumber: p.productNumber || slug.toUpperCase(),
        name:          p.name,
        slug,
        categorySlug,
        categoryName,
        gender:        p.gender || '',
        description:   p.description || '',
        content:       p.content || '',
        image:         p.image || '',
        imageGallery:  p.imageGallery || [],
        isSale:        p.isSale    || false,
        isNew:         p.isNew     || false,
        isFeatured:    p.isFeatured || false,
        isActive:      true,
        isStocked:     p.isStocked !== false,
        tags:          p.filterItems || [],
        variants:      mappedVariants,
        reviews:       mappedReviews,
        rating:        calcRating(mappedReviews),
        reviewCount:   mappedReviews.length,
      };

      const existing = await Product.findOne({ slug });
      if (existing) {
        skipped++;
        continue;
      }

      await Product.create(doc);
      created++;
      console.log(`  ✓ ${p.name}`);
    } catch (err) {
      errors++;
      console.error(`  ✗ ${p.name}: ${err.message}`);
    }
  }

  console.log(`\n✅ Seed complete — ${created} created, ${skipped} skipped, ${errors} errors`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
