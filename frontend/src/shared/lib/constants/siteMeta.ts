// 서비스 이름·태그라인. 브라우저 탭 제목(metadata / document.title)과 매니페스트가 같은 문구를 쓴다.
// "일단 출발!" 은 서비스 키워드라 루트 제목·설명·키워드에 모두 들어간다. 문구를 바꿀 때는 여기만 고친다.
export const SITE_NAME = '일출';
export const SITE_TAGLINE = '일단 출발!';
export const SITE_SUBTITLE = '맞춤형 당일치기 힐링 플래너';
export const SITE_TITLE = `${SITE_NAME} - ${SITE_TAGLINE} ${SITE_SUBTITLE}`;
export const SITE_DESCRIPTION = `${SITE_TAGLINE} ${SITE_SUBTITLE} ${SITE_NAME}. 지금 내 주변과 전국의 힐링 장소로 오늘의 당일치기 코스를 만들어보세요.`;
export const SITE_KEYWORDS = [
  SITE_NAME,
  SITE_TAGLINE,
  '일단 출발',
  '일단출발',
  '당일치기',
  '힐링 여행',
  '여행 플래너',
  '코스 추천',
  '힐링 플래너',
];

// 클라이언트 페이지가 document.title 을 직접 정할 때 쓰는 접미사 (예: "마이페이지 · 일출 일단 출발!")
export const pageTitle = (name: string): string => `${name} · ${SITE_NAME} ${SITE_TAGLINE}`;
