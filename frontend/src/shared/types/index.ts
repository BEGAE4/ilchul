import { z } from 'zod';

// --- Base Schemas ---

export const StopSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  time: z.string(),
  description: z.string(),
  isVerified: z.boolean().optional(),
  verifiedImage: z.string().optional(),
});

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string(),
  author: z.string(),
  authorAvatar: z.string(),
  thumbnail: z.string(),
  location: z.string(),
  duration: z.string(),
  tags: z.array(z.string()),
  bookmarks: z.number().min(0).default(0),
  likes: z.number().min(0),
  stops: z.array(StopSchema),
  isVerified: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  ownerId: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledStartTime: z.string().optional(),
  scheduledEndTime: z.string().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().optional(),
  review: z.string().optional(),
  ranking: z.number().optional(),
});

export const PlaceSchema = StopSchema.extend({
  image: z.string(),
  address: z.string(),
  phone: z.string(),
  tags: z.array(z.string()),
});

// --- Survey Schemas ---

export const SurveyDataSchema = z.object({
  mindState: z.string().min(1, '마음 상태를 선택해주세요'),
  transport: z.string().min(1, '이동 수단을 선택해주세요'),
  transportTime: z.string().min(1, '이동 시간을 선택해주세요'),
  startDate: z.string().min(1, '시작 날짜를 입력해주세요'),
  startTime: z.string(),
  endDate: z.string().min(1, '종료 날짜를 입력해주세요'),
  endTime: z.string(),
  startPoint: z.string().optional(),
});

// --- Other Schemas ---

export const BannerSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string(),
  image: z.string(),
  tag: z.string(),
});

export const BestPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  location: z.string(),
  image: z.string(),
  likes: z.number(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  user: z.string(),
  avatar: z.string(),
  image: z.string(),
  comment: z.string(),
  place: z.string(),
});

export const CommentSchema = z.object({
  id: z.string(),
  user: z.string(),
  avatar: z.string(),
  text: z.string(),
  date: z.string(),
  likes: z.number(),
});

// --- Type Exports (inferred from Zod) ---

export type Stop = z.infer<typeof StopSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type SurveyData = z.infer<typeof SurveyDataSchema>;
export type Banner = z.infer<typeof BannerSchema>;
export type BestPlace = z.infer<typeof BestPlaceSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Comment = z.infer<typeof CommentSchema>;

// --- Course Creation Types ---

export interface StartingPoint {
  type: 'current' | 'custom' | 'suggestion';
  address: string;
  coord: { lat: number; lng: number };
}

// --- User Types ---

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  level: number;
  travelType: string;
  courseCount: number;
  certCount: number;
  savedCount: number;
  followerCount: number;
  followingCount: number;
}
