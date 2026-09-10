// 홈·주변 목록에서 쓰는 시/도 17개와 대표 좌표.
//
// 주변 API 는 좌표 반경 10km 로 조회하므로, 대표 좌표는 "행정 중심"이 아니라
// **여행 수요가 몰리는 곳**으로 잡는다. 도청 소재지를 그대로 쓰면(예: 강원 → 춘천,
// 전남 → 무안) 반경 안에 등록된 장소가 거의 없어 빈 화면이 되기 쉽다.
export interface Region {
  id: string;
  /** 화면에 보이는 짧은 이름 */
  name: string;
  /** 대표 좌표를 어디로 잡았는지 — 목록의 보조 설명으로 쓴다 */
  landmark: string;
  /** 이 지역을 고르면 실제로 조회할 좌표 */
  lat: number;
  lng: number;
  /**
   * GPS 좌표가 어느 지역인지 **판정할 때만** 추가로 쓰는 보조 좌표.
   * 대표 좌표 하나로만 비교하면 넓은 도에서 오판이 난다
   * (예: 안동은 경주보다 대구에 가까워 경북 대신 대구로 잡힘).
   * 조회 좌표로는 쓰지 않는다.
   */
  detectAnchors?: [lat: number, lng: number][];
}

export const REGIONS: Region[] = [
  {
    id: 'seoul', name: '서울', landmark: '시청', lat: 37.5665, lng: 126.978,
    detectAnchors: [[37.4979, 127.0276], [37.5572, 126.9245], [37.5665, 127.0499]],
  },
  {
    id: 'busan', name: '부산', landmark: '서면', lat: 35.1579, lng: 129.0594,
    detectAnchors: [[35.1587, 129.1604], [35.0968, 129.0356]],
  },
  {
    id: 'daegu', name: '대구', landmark: '동성로', lat: 35.8693, lng: 128.5955,
    detectAnchors: [[35.8295, 128.5378]],
  },
  {
    id: 'incheon', name: '인천', landmark: '송도', lat: 37.3826, lng: 126.6435,
    detectAnchors: [[37.4563, 126.7052], [37.7469, 126.488]],
  },
  { id: 'gwangju', name: '광주', landmark: '상무지구', lat: 35.1521, lng: 126.8514 },
  { id: 'daejeon', name: '대전', landmark: '둔산동', lat: 36.3515, lng: 127.3782 },
  { id: 'ulsan', name: '울산', landmark: '삼산동', lat: 35.5384, lng: 129.3114 },
  { id: 'sejong', name: '세종', landmark: '정부세종청사', lat: 36.48, lng: 127.289 },
  {
    id: 'gyeonggi', name: '경기', landmark: '수원', lat: 37.2636, lng: 127.0286,
    detectAnchors: [[37.6584, 126.832], [37.4201, 127.1265], [37.8315, 127.5095], [37.7599, 126.78], [37.2411, 127.1776]],
  },
  // 도청(춘천) 대신 여행 수요가 큰 강릉
  {
    id: 'gangwon', name: '강원', landmark: '강릉', lat: 37.7519, lng: 128.8761,
    detectAnchors: [[37.8813, 127.73], [38.207, 128.5918], [37.3422, 127.9202], [37.3705, 128.3902]],
  },
  {
    id: 'chungbuk', name: '충북', landmark: '청주', lat: 36.6424, lng: 127.489,
    detectAnchors: [[36.991, 127.9259], [37.1326, 128.191]],
  },
  // 도청(홍성) 대신 접근성이 좋은 천안
  {
    id: 'chungnam', name: '충남', landmark: '천안', lat: 36.8151, lng: 127.1139,
    detectAnchors: [[36.3333, 126.6127], [36.4465, 127.119], [36.7456, 126.2979]],
  },
  {
    id: 'jeonbuk', name: '전북', landmark: '전주 한옥마을', lat: 35.8151, lng: 127.153,
    detectAnchors: [[35.9676, 126.737], [35.4164, 127.3905]],
  },
  // 도청(무안) 대신 여행 수요가 큰 여수
  {
    id: 'jeonnam', name: '전남', landmark: '여수', lat: 34.7604, lng: 127.6622,
    detectAnchors: [[34.9506, 127.4872], [34.8118, 126.3922], [35.3211, 126.9882]],
  },
  // 도청(안동) 대신 여행 수요가 큰 경주
  {
    id: 'gyeongbuk', name: '경북', landmark: '경주', lat: 35.8562, lng: 129.2247,
    detectAnchors: [[36.5684, 128.7294], [36.019, 129.3435], [36.5866, 128.1867]],
  },
  {
    id: 'gyeongnam', name: '경남', landmark: '창원', lat: 35.2279, lng: 128.6811,
    detectAnchors: [[34.8544, 128.4331], [35.18, 128.1076], [35.5372, 128.7462]],
  },
  {
    id: 'jeju', name: '제주', landmark: '제주시', lat: 33.4996, lng: 126.5312,
    detectAnchors: [[33.2541, 126.56]],
  },
];

/** 위치를 쓸 수 없을 때의 기본 지역 */
export const DEFAULT_REGION: Region = REGIONS[0];

export function findRegionById(id: string | null | undefined): Region | null {
  if (!id) return null;
  return REGIONS.find((r) => r.id === id) ?? null;
}
