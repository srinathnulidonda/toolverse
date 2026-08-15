// lib/tools.ts
export {
  CATEGORIES,
  getCategoryBySlug,
  getCategoriesWithCount,
  type Category,
  type CategoryWithCount,
} from "@/data/categories";

export {
  TOOLS,
  getToolBySlug,
  getToolsByCategory,
  getAllTools,
  getNewTools,
  type Tool,
} from "@/data/tools";

export { COLLECTIONS, type Collection } from "@/data/collections";
export { POPULAR_TOOLS, TRENDING_TOOLS, FEATURED_TOOLS } from "@/data/popular";