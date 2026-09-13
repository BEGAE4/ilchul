// 푸터·앱 정보·로그인·약관·개인정보처리방침이 함께 쓰는 운영 정보.
// 사업자등록이 없는 팀 프로젝트이고 판매(통신판매업)도 하지 않아 상호·대표자·사업자등록번호·주소는 표시하지 않는다.
// 이전에는 "(주)일출", 가짜 사업자등록번호, 가상 주소가 들어가 있었다 — 회사가 아닌데 (주)를 쓰면 상법 위반이다.
export const SERVICE_INFO = {
  name: '일출',
  teamName: '베개',
  contestName: '2026 관광데이터 활용 공모전',
  contactEmail: 'begae4@gmail.com',
  privacyOfficer: '장욱',
  copyrightYear: 2026,
} as const;

/** 이용약관·개인정보처리방침 시행일. 내용을 바꾸면 시행일도 함께 바꾼다 */
export const LEGAL_EFFECTIVE_DATE = '2026년 9월 13일';

export const SERVICE_ROUTES = {
  terms: '/terms',
  privacy: '/privacy',
  support: '/profile/inquiry',
} as const;
