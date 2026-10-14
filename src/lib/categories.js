import Category from '@/models/Category';
import { DEFAULT_CATEGORIES } from './category-options';

let seedPromise;
export function seedCategories() {
  if (!seedPromise) seedPromise = (async () => {
    await Category.init();
    await Category.bulkWrite(DEFAULT_CATEGORIES.map((category) => ({
      updateOne: { filter: { slug: category.slug }, update: { $setOnInsert: category }, upsert: true },
    })));
  })().catch((error) => { seedPromise = undefined; throw error; });
  return seedPromise;
}
export async function categoryExists(slug) {
  if (typeof slug !== 'string') return false;
  if (DEFAULT_CATEGORIES.some((category) => category.slug === slug)) return true;
  return !!(await Category.exists({ slug }));
}
