// 카카오 로컬 서비스(JS SDK services 라이브러리) 래퍼.
// SDK가 아직 로드되지 않았거나 실패한 경우 조용히 null/[]을 반환해
// 호출부가 폴백 UI로 처리할 수 있게 한다.

export interface Coord {
  lat: number;
  lng: number;
}

export interface KeywordPlaceResult {
  id: string;
  name: string;
  address: string;
  coord: Coord;
}

function isKakaoServicesReady(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof kakao !== 'undefined' &&
    Boolean(kakao.maps) &&
    Boolean(kakao.maps.services)
  );
}

// 좌표 → 주소 (역지오코딩). 도로명 주소 우선, 없으면 지번 주소.
export function coordToAddress(coord: Coord): Promise<string | null> {
  return new Promise((resolve) => {
    if (!isKakaoServicesReady()) return resolve(null);
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(coord.lng, coord.lat, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || result.length === 0) {
        return resolve(null);
      }
      const item = result[0];
      resolve(item.road_address?.address_name || item.address?.address_name || null);
    });
  });
}

// 키워드로 장소 검색 (역·주소·장소명)
export function searchPlacesByKeyword(query: string, limit = 7): Promise<KeywordPlaceResult[]> {
  return new Promise((resolve) => {
    if (!isKakaoServicesReady() || !query.trim()) return resolve([]);
    const places = new kakao.maps.services.Places();
    places.keywordSearch(query, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return resolve([]);
      resolve(
        result.slice(0, limit).map((r) => ({
          id: r.id,
          name: r.place_name,
          address: r.road_address_name || r.address_name,
          coord: { lat: Number(r.y), lng: Number(r.x) },
        }))
      );
    });
  });
}
