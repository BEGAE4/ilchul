import {
  MOCK_COURSES,
  NATIONWIDE_COURSES,
  NATIONWIDE_PLACES,
  NEARBY_POPULAR_PLACES,
  type BestPlace,
  type Course,
} from '@/shared/data/mockData';
import type {
  PaginatedResponse,
  PopularPlace,
  PopularPlan,
} from '../types';

const MAX_LIMIT = 50;
const CATALOG_COPIES = 6;

function clampPagination(rawLimit?: number, rawPage?: number, fallbackLimit = 5) {
  const limit = Math.max(
    1,
    Math.min(MAX_LIMIT, Number.isFinite(rawLimit) && (rawLimit as number) > 0 ? (rawLimit as number) : fallbackLimit)
  );
  const page = Math.max(
    1,
    Number.isFinite(rawPage) && (rawPage as number) > 0 ? (rawPage as number) : 1
  );
  return { limit, page };
}

function buildPlaceCatalog(seed: BestPlace[]): PopularPlace[] {
  const out: PopularPlace[] = [];
  let rank = 1;
  for (let copy = 0; copy < CATALOG_COPIES; copy++) {
    seed.forEach((p) => {
      out.push({
        id: copy === 0 ? p.id : `${p.id}-d${copy}`,
        name: copy === 0 ? p.name : `${p.name} ${copy + 1}호점`,
        category: p.category,
        location: p.location,
        image: p.image,
        likes: Math.max(1, p.likes - copy * 50),
        ranking: rank++,
      });
    });
  }
  return out;
}

function buildPlanCatalog(seed: Course[]): PopularPlan[] {
  const out: PopularPlan[] = [];
  let rank = 1;
  for (let copy = 0; copy < CATALOG_COPIES; copy++) {
    seed.forEach((c) => {
      out.push({
        id: copy === 0 ? c.id : `${c.id}-d${copy}`,
        title: copy === 0 ? c.title : `${c.title} (${copy + 1}편)`,
        description: c.description,
        thumbnail: c.thumbnail,
        location: c.location,
        duration: c.duration,
        tags: c.tags,
        likes: Math.max(1, c.likes - copy * 30),
        ranking: rank++,
      });
    });
  }
  return out;
}

function paginate<T>(catalog: T[], limit: number, page: number): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const data = catalog.slice(start, start + limit);
  return {
    status: 200,
    message: '성공',
    data,
    page,
    limit,
    hasNext: page * limit < catalog.length,
    totalCount: catalog.length,
  };
}

const nearbyPlaceCatalog = buildPlaceCatalog(NEARBY_POPULAR_PLACES);
const nationwidePlaceCatalog = buildPlaceCatalog(NATIONWIDE_PLACES);
const nearbyPlanCatalog = buildPlanCatalog(MOCK_COURSES);
const nationwidePlanCatalog = buildPlanCatalog(NATIONWIDE_COURSES);

export function buildMockNearbyPlaces(
  rawLimit?: number,
  rawPage?: number
): PaginatedResponse<PopularPlace> {
  const { limit, page } = clampPagination(rawLimit, rawPage, 5);
  return paginate(nearbyPlaceCatalog, limit, page);
}

export function buildMockNationwidePlaces(
  rawLimit?: number,
  rawPage?: number
): PaginatedResponse<PopularPlace> {
  const { limit, page } = clampPagination(rawLimit, rawPage, 6);
  return paginate(nationwidePlaceCatalog, limit, page);
}

export function buildMockNearbyPlans(
  rawLimit?: number,
  rawPage?: number
): PaginatedResponse<PopularPlan> {
  const { limit, page } = clampPagination(rawLimit, rawPage, 5);
  return paginate(nearbyPlanCatalog, limit, page);
}

export function buildMockNationwidePlans(
  rawLimit?: number,
  rawPage?: number
): PaginatedResponse<PopularPlan> {
  const { limit, page } = clampPagination(rawLimit, rawPage, 3);
  return paginate(nationwidePlanCatalog, limit, page);
}

export { clampPagination };
