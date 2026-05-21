import axios from 'axios';
import type {
  Inquiry,
  InquiryListResponse,
  InquiryCategoriesResponse,
  CreateInquiryRequest,
  UpdateInquiryRequest,
  CreateAnswerRequest,
} from '../types/inquiry.types';

export const fetchMyInquiries = async (): Promise<Inquiry[]> => {
  const res = await axios.get<InquiryListResponse>('/api/inquiry');
  return res.data.inquiries ?? [];
};

export const fetchInquiryDetail = async (id: number): Promise<Inquiry> => {
  const res = await axios.get<Inquiry>(`/api/inquiry/${id}`);
  return res.data;
};

export const createInquiry = async (body: CreateInquiryRequest): Promise<Inquiry> => {
  const res = await axios.post<Inquiry>('/api/inquiry', body);
  return res.data;
};

export const updateInquiry = async (id: number, body: UpdateInquiryRequest): Promise<Inquiry> => {
  const res = await axios.patch<Inquiry>(`/api/inquiry/${id}`, body);
  return res.data;
};

export const deleteInquiry = async (id: number): Promise<void> => {
  await axios.delete(`/api/inquiry/${id}`);
};

export const fetchAllInquiries = async (): Promise<Inquiry[]> => {
  const res = await axios.get<InquiryListResponse>('/api/inquiry/all');
  return res.data.inquiries ?? [];
};

export const fetchInquiryCategories = async (): Promise<InquiryCategoriesResponse['categories']> => {
  const res = await axios.get<InquiryCategoriesResponse>('/api/inquiry/categories');
  return res.data.categories ?? [];
};

export const createAnswer = async (inquiryId: number, body: CreateAnswerRequest): Promise<void> => {
  await axios.post(`/api/inquiry/${inquiryId}/answer`, body);
};
