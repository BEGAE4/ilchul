import axios from 'axios';
import { MyPlan } from '../types/plan.types';

// 내 플랜 목록 조회 API
export const fetchMyPlans = async (): Promise<MyPlan[]> => {
  const response = await axios.get<MyPlan[]>('/api/mypage/plans');
  return response.data;
};

