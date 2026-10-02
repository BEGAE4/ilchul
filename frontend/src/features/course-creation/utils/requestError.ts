import { isAxiosError } from 'axios';

export function courseRequestError(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const messages: Record<string, string> = {
    P0002: '조건에 맞는 코스를 찾지 못했어요. 장소 수를 줄이거나 시간을 늘려주세요.',
    P0003: '추천 서비스를 잠시 이용할 수 없어요. 잠시 후 다시 시도해주세요.',
    P0006: '추천 결과를 확인하지 못했어요. 잠시 후 다시 시도해주세요.',
    P0005: '추천 요청이 많아요. 진행 중인 추천을 기다리거나 잠시 후 다시 시도해주세요.',
    PP007: '귀환을 포함한 이동·체류 시간이 설정한 시간을 넘어요. 장소를 줄이거나 시간을 늘려주세요.',
    PP008: '이동 경로를 계산하지 못했어요. 잠시 후 다시 시도해주세요.',
    G001: '여행 시간과 출발지를 확인한 뒤 다시 시도해주세요.',
  };
  return messages[error.response?.data?.code] ?? fallback;
}
