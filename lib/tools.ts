// lib/tools.ts - Re-export from data
export {
  CATEGORIES,
  getCategoryBySlug,
  getCategoriesWithCount,
  type Category,
  type CategoryWithCount,
} from "@/data/categories";

export { TOOLS, getToolBySlug, getToolsByCategory, getAllTools, type Tool } from "@/data/tools";

export { COLLECTIONS, type Collection } from "@/data/collections";
export { POPULAR_TOOLS, TRENDING_TOOLS, FEATURED_TOOLS } from "@/data/popular";
