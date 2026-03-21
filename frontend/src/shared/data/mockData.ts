import type { Course, Place, Banner, BestPlace, Review, Comment } from '@/shared/types';

export type { Course, Place, Banner, BestPlace, Review, Comment };

// --- Stop 타입은 Course에 포함 ---
export type Stop = Course['stops'][number];

export const POPULAR_KEYWORDS = [
  '강릉 바다',
  '성수동 카페',
  '전주 한옥',
  '부산 힐링',
  '제주 당일치기',
];

export const MOCK_ADDRESSES = [
  { label: '서울역',    coord: { lat: 37.5547, lng: 126.9707 } },
  { label: '강남역',    coord: { lat: 37.4979, lng: 127.0276 } },
  { label: '홍대입구역', coord: { lat: 37.5571, lng: 126.9236 } },
  { label: '여의도역',  coord: { lat: 37.5216, lng: 126.9244 } },
  { label: '성수역',    coord: { lat: 37.5445, lng: 127.0557 } },
  { label: '잠실역',    coord: { lat: 37.5133, lng: 127.1001 } },
];

export const THEME_TAGS = [
  { id: 'healing', label: '🌿 힐링', color: 'bg-green-100 text-green-700' },
  { id: 'food', label: '🥘 맛집탐방', color: 'bg-orange-100 text-orange-700' },
  {
    id: 'activity',
    label: '🏃 액티비티',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'culture',
    label: '🏯 역사문화',
    color: 'bg-amber-100 text-amber-700',
  },
  { id: 'date', label: '💑 데이트', color: 'bg-pink-100 text-pink-700' },
];

export const HOME_BANNERS: Banner[] = [
  {
    id: 1,
    title: '이번 주말, 벚꽃 명소',
    subtitle: '지금 떠나기 좋은',
    image:
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1080&auto=format&fit=crop',
    tag: '봄 시즌 한정',
  },
  {
    id: 2,
    title: '성수동 팝업 지도',
    subtitle: '트렌드세터라면 필수',
    image:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1080&auto=format&fit=crop',
    tag: 'HOT',
  },
  {
    id: 3,
    title: '나홀로 힐링 여행',
    subtitle: '지친 마음 위로하기',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop',
    tag: '추천',
  },
];

export const BEST_PLACES: BestPlace[] = [
  {
    id: 'bp1',
    name: '런던 베이글 뮤지엄',
    category: '맛집',
    location: '서울 강남구',
    image:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=500&auto=format&fit=crop',
    likes: 1240,
  },
  {
    id: 'bp2',
    name: '더현대 서울',
    category: '복합문화',
    location: '서울 영등포구',
    image:
      'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?q=80&w=500&auto=format&fit=crop',
    likes: 980,
  },
  {
    id: 'bp3',
    name: '광안리 해수욕장',
    category: '관광지',
    location: '부산 수영구',
    image:
      'https://images.unsplash.com/photo-1634149023596-189f81664d9b?q=80&w=500&auto=format&fit=crop',
    likes: 850,
  },
  {
    id: 'bp4',
    name: '스타필드 수원',
    category: '쇼핑',
    location: '경기 수원시',
    image:
      'https://images.unsplash.com/photo-1519567241046-7f570eee3d9b?q=80&w=500&auto=format&fit=crop',
    likes: 720,
  },
];

// 주변 인기 장소
export const NEARBY_POPULAR_PLACES: BestPlace[] = [
  {
    id: 'np1',
    name: '성수 카페거리',
    category: '카페',
    location: '서울 성동구',
    image:
      'https://images.unsplash.com/photo-1692103675608-6e635afa077b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMHRyZW5keSUyMGNhZmUlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcwNzM2MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 2340,
  },
  {
    id: 'np2',
    name: '서울숲 피크닉',
    category: '공원',
    location: '서울 성동구',
    image:
      'https://images.unsplash.com/photo-1563299796-b729d0af54a5?q=80&w=1080&auto=format&fit=crop',
    likes: 1870,
  },
  {
    id: 'np3',
    name: '런던 베이글 뮤지엄',
    category: '맛집',
    location: '서울 강남구',
    image:
      'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=500&auto=format&fit=crop',
    likes: 1240,
  },
  {
    id: 'np4',
    name: '더현대 서울',
    category: '복합문화',
    location: '서울 영등포구',
    image:
      'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?q=80&w=500&auto=format&fit=crop',
    likes: 980,
  },
  {
    id: 'np5',
    name: '을지로 골목 투어',
    category: '문화',
    location: '서울 중구',
    image:
      'https://images.unsplash.com/photo-1764147385056-b140f838bbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMG1hcmtldCUyMHN0cmVldHxlbnwxfHx8fDE3NzIwMjM3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 760,
  },
];

// 전국 인기 장소
export const NATIONWIDE_PLACES: BestPlace[] = [
  {
    id: 'nw1',
    name: '제주 월정리 해변',
    category: '관광지',
    location: '제주 제주시',
    image:
      'https://images.unsplash.com/photo-1758327740342-4e705edea29b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwc2NlbmljJTIwb2NlYW58ZW58MXx8fHwxNzcyMDIzNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 3120,
  },
  {
    id: 'nw2',
    name: '감천문화마을',
    category: '관광지',
    location: '부산 사하구',
    image:
      'https://images.unsplash.com/photo-1762440775708-7dbfe9e10842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGdhbWNoZW9uJTIwdmlsbGFnZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MTk5MDMzMnww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 2580,
  },
  {
    id: 'nw3',
    name: '경주 불국사',
    category: '문화',
    location: '경북 경주시',
    image:
      'https://images.unsplash.com/photo-1653632445017-0da95027672c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGhpc3RvcmljJTIwcGFyayUyMGtvcmVhfGVufDF8fHx8MTc3MjAyMzcxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 2210,
  },
  {
    id: 'nw4',
    name: '속초 해수욕장',
    category: '관광지',
    location: '강원 속초시',
    image:
      'https://images.unsplash.com/photo-1660785462445-f9d21cad7ada?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2tjaG8lMjBiZWFjaCUyMHN1bnJpc2UlMjBrb3JlYXxlbnwxfHx8fDE3NzIwMjM3MTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 1950,
  },
  {
    id: 'nw5',
    name: '전주 한옥마을',
    category: '문화',
    location: '전북 전주시',
    image:
      'https://images.unsplash.com/photo-1670737479946-07fdd0278ba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0ZW1wbGUlMjBhdXR1bW58ZW58MXx8fHwxNzcyMDIzNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    likes: 1780,
  },
  {
    id: 'nw6',
    name: '광안리 해수욕장',
    category: '관광지',
    location: '부산 수영구',
    image:
      'https://images.unsplash.com/photo-1634149023596-189f81664d9b?q=80&w=500&auto=format&fit=crop',
    likes: 1650,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: '성수동 힙플레이스 완전 정복',
    description:
      '요즘 가장 핫한 성수동의 카페와 팝업스토어를 하루만에 돌아보는 알짜배기 코스입니다.',
    author: '힙스터김',
    authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    thumbnail:
      'https://images.unsplash.com/photo-1692103675608-6e635afa077b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMHRyZW5keSUyMGNhZmUlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcwNzM2MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: '서울 성동구',
    duration: '4시간',
    tags: ['#카페투어', '#팝업스토어', '#사진맛집'],
    bookmarks: 89,
    likes: 124,
    isVerified: true,
    stops: [
      {
        id: 's1',
        name: '블루보틀 성수',
        category: '카페',
        time: '11:00',
        description: '성수동의 랜드마크 카페에서 모닝 커피 한 잔',
      },
      {
        id: 's2',
        name: '서울숲 산책',
        category: '공원',
        time: '12:30',
        description: '커피 들고 서울숲 벤치에서 여유 즐기기',
      },
      {
        id: 's3',
        name: 'LCDC SEOUL',
        category: '복합문화공간',
        time: '14:00',
        description: '다양한 편집숍과 팝업 구경하기',
      },
    ],
  },
  {
    id: '2',
    title: '강릉 바다보며 물멍 때리기',
    description:
      '답답한 도시를 떠나 강릉 바다를 보며 마음을 치유하는 당일치기 힐링 여행',
    author: '바다요정',
    authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    thumbnail:
      'https://images.unsplash.com/photo-1703768516086-45eb97f36ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW5nbmV1bmclMjBiZWFjaCUyMG9jZWFuJTIwY2FsbWluZ3xlbnwxfHx8fDE3NzA3MzYxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: '강원 강릉시',
    duration: '6시간',
    tags: ['#오션뷰', '#힐링', '#드라이브'],
    bookmarks: 215,
    likes: 352,
    isVerified: false,
    stops: [
      {
        id: 'g1',
        name: '안목해변 카페거리',
        category: '카페',
        time: '10:00',
        description: '바다가 보이는 카페에서 브런치',
      },
      {
        id: 'g2',
        name: '강문해변 포토존',
        category: '관광지',
        time: '12:00',
        description: '액자 포토존에서 인생샷 남기기',
      },
      {
        id: 'g3',
        name: '동화가든',
        category: '맛집',
        time: '13:30',
        description: '유명한 짬뽕순두부 웨이팅 도전',
      },
      {
        id: 'g4',
        name: '아르떼뮤지엄',
        category: '전시',
        time: '15:30',
        description: '몰입형 미디어아트로 여행 마무리',
      },
    ],
  },
  {
    id: '3',
    title: '북촌 한옥마을 시간 여행',
    description: '고즈넉한 한옥의 정취를 느끼며 걷는 서울 도심 속 역사 여행',
    author: '역사덕후',
    authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    thumbnail:
      'https://images.unsplash.com/photo-1591325478691-c0f3b67c45e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWtjaG9uJTIwaGFub2slMjB2aWxsYWdlJTIwdHJhZGl0aW9uYWwlMjBrb3JlYXxlbnwxfHx8fDE3NzA3MzYxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: '서울 종로구',
    duration: '3시간',
    tags: ['#한옥', '#전통', '#산책'],
    bookmarks: 42,
    likes: 89,
    isVerified: true,
    stops: [
      {
        id: 'b1',
        name: '북촌문화센터',
        category: '문화',
        time: '13:00',
        description: '북촌 여행의 시작점, 지도 챙기기',
      },
      {
        id: 'b2',
        name: '북촌 5경',
        category: '관광지',
        time: '14:00',
        description: '한옥 지붕들이 내려다보이는 최고의 전망',
      },
      {
        id: 'b3',
        name: '삼청동 수제비',
        category: '맛집',
        time: '15:30',
        description: '따뜻한 항아리 수제비 한 그릇',
      },
    ],
  },
  {
    id: '4',
    title: '광장시장 먹방 투어',
    description: '육회, 빈대떡, 마약김밥까지! 배 터지는 시장 투어',
    author: '먹깨비',
    authorAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
    thumbnail:
      'https://images.unsplash.com/photo-1761530455998-3879edbde09b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzdHJlZXQlMjBmb29kJTIwbWFya2V0JTIwdmlicmFudHxlbnwxfHx8fDE3NzA3MzYxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: '서울 종로구',
    duration: '2시간',
    tags: ['#시장', '#먹방', '#가성비'],
    bookmarks: 128,
    likes: 210,
    isVerified: false,
    stops: [
      {
        id: 'm1',
        name: '육회자매집',
        category: '맛집',
        time: '18:00',
        description: '신선한 육회와 소주 한 잔',
      },
      {
        id: 'm2',
        name: '순희네빈대떡',
        category: '맛집',
        time: '19:30',
        description: '겉바속촉 녹두빈대떡 포장 필수',
      },
    ],
  },
];

// 지금 뜨는 여행지 (검색 페이지용 — 좋아요 top5)
export const TRENDING_PLACES: BestPlace[] = [
  { id: 'np1', name: '성수 카페거리', category: '카페', location: '서울 성동구', image: 'https://images.unsplash.com/photo-1692103675608-6e635afa077b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW91bCUyMHRyZW5keSUyMGNhZmUlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcwNzM2MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080', likes: 2340 },
  { id: 'nw1', name: '제주 월정리 해변', category: '관광지', location: '제주 제주시', image: 'https://images.unsplash.com/photo-1758327740342-4e705edea29b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwc2NlbmljJTIwb2NlYW58ZW58MXx8fHwxNzcyMDIzNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080', likes: 3120 },
  { id: 'nw2', name: '감천문화마을', category: '관광지', location: '부산 사하구', image: 'https://images.unsplash.com/photo-1762440775708-7dbfe9e10842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGdhbWNoZW9uJTIwdmlsbGFnZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MTk5MDMzMnww&ixlib=rb-4.1.0&q=80&w=1080', likes: 2580 },
  { id: 'nw5', name: '전주 한옥마을', category: '문화', location: '전북 전주시', image: 'https://images.unsplash.com/photo-1670737479946-07fdd0278ba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0ZW1wbGUlMjBhdXR1bW58ZW58MXx8fHwxNzcyMDIzNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080', likes: 1780 },
  { id: 'nw3', name: '경주 불국사', category: '문화', location: '경북 경주시', image: 'https://images.unsplash.com/photo-1653632445017-0da95027672c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGhpc3RvcmljJTIwcGFyayUyMGtvcmVhfGVufDF8fHx8MTc3MjAyMzcxNHww&ixlib=rb-4.1.0&q=80&w=1080', likes: 2210 },
];

// 지금 뜨는 코스 (검색 페이지용 — 좋아요 top5, NATIONWIDE_COURSES 기반)
export const TRENDING_COURSES_IDS = ['nc1', 'nc2', 'nc3', '1', '2'];

// 전국 인기 코스
export const NATIONWIDE_COURSES: Course[] = [
  {
    id: 'nc1',
    title: '제주 동쪽 해안 드라이브',
    description: '성산일출봉부터 월정리까지 제주 동부의 매력을 한번에',
    author: '제주러버',
    authorAvatar: 'https://i.pravatar.cc/150?u=nc1',
    thumbnail:
      'https://images.unsplash.com/photo-1758327740342-4e705edea29b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwc2NlbmljJTIwb2NlYW58ZW58MXx8fHwxNzcyMDIzNzEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: '제주 제주시',
    duration: '5시간',
    tags: ['#드라이브', '#제주', '#오션뷰'],
    bookmarks: 312,
    likes: 487,
    isVerified: true,
    stops: [
      {
        id: 'nc1s1',
        name: '성산일출봉',
        category: '관광지',
        time: '09:00',
        description: '유네스코 세계자연유산',
      },
      {
        id: 'nc1s2',
        name: '월정리 해변',
        category: '관광지',
        time: '11:00',
        description: '에메랄드빛 바다',
      },
      {
        id: 'nc1s3',
        name: '세화해변 카페',
        category: '카페',
        time: '13:00',
        description: '바다 뷰 브런치',
      },
    ],
  },
  {
    id: 'nc2',
    title: '부산 감성 골목 여행',
    description: '감천문화마을과 부산의 숨은 골목들을 탐험하는 코스',
    author: '부산토박이',
    authorAvatar: 'https://i.pravatar.cc/150?u=nc2',
    thumbnail:
      'https://images.unsplash.com/photo-1762440775708-7dbfe9e10842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGdhbWNoZW9uJTIwdmlsbGFnZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MTk5MDMzMnww&ixlib=rb-4.1.0&q=80&w=1080',
    location: '부산 사하구',
    duration: '4시간',
    tags: ['#감성', '#골목', '#부산'],
    bookmarks: 178,
    likes: 321,
    isVerified: false,
    stops: [
      {
        id: 'nc2s1',
        name: '감천문화마을',
        category: '관광지',
        time: '10:00',
        description: '알록달록 마을 산책',
      },
      {
        id: 'nc2s2',
        name: '자갈치시장',
        category: '맛집',
        time: '12:00',
        description: '신선한 회 한 접시',
      },
    ],
  },
  {
    id: 'nc3',
    title: '경주 역사 탐방 코스',
    description: '천년 고도 경주의 유적지를 하루 만에 둘러보기',
    author: '역사탐험가',
    authorAvatar: 'https://i.pravatar.cc/150?u=nc3',
    thumbnail:
      'https://images.unsplash.com/photo-1653632445017-0da95027672c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdqdSUyMGhpc3RvcmljJTIwcGFyayUyMGtvcmVhfGVufDF8fHx8MTc3MjAyMzcxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    location: '경북 경주시',
    duration: '6시간',
    tags: ['#역사', '#경주', '#문화유산'],
    bookmarks: 195,
    likes: 276,
    isVerified: true,
    stops: [
      {
        id: 'nc3s1',
        name: '불국사',
        category: '문화',
        time: '09:00',
        description: '유네스코 세계문화유산',
      },
      {
        id: 'nc3s2',
        name: '석굴암',
        category: '문화',
        time: '11:00',
        description: '신라의 걸작',
      },
      {
        id: 'nc3s3',
        name: '첨성대',
        category: '관광지',
        time: '14:00',
        description: '동양 최고의 천문대',
      },
    ],
  },
];

export const MY_COURSES_DATA: Course[] = [
  {
    id: 'my1',
    title: '주말 힐링 드라이브',
    description: '혼자 조용히 다녀오기 좋은 근교 드라이브 코스',
    author: '김여행',
    authorAvatar: 'https://i.pravatar.cc/150?u=me',
    thumbnail:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop',
    location: '경기 파주시',
    duration: '3시간',
    tags: ['#드라이브', '#혼여행'],
    bookmarks: 0,
    likes: 0,
    isVerified: false,
    isPublic: true,
    ownerId: 'me',
    scheduledDate: '2024-05-20',
    review:
      '날씨가 너무 좋아서 급하게 떠났는데 정말 좋았음. 특히 노을 질 때 뷰가 최고!',
    stops: [
      {
        id: 'mp1',
        name: '파주 출판단지',
        category: '문화',
        time: '14:00',
        description: '지혜의 숲에서 책 읽기',
        isVerified: true,
      },
      {
        id: 'mp2',
        name: '프로방스 마을',
        category: '관광지',
        time: '16:00',
        description: '이국적인 풍경 산책',
        isVerified: false,
      },
    ],
  },
  {
    id: 'my2',
    title: '퇴근 후 급번개',
    description: '친구들과 스트레스 풀러 가는 매운맛 코스',
    author: '김여행',
    authorAvatar: 'https://i.pravatar.cc/150?u=me',
    thumbnail:
      'https://images.unsplash.com/photo-1767412729950-3e1a776eaed4?q=80&w=1080',
    location: '서울 강남구',
    duration: '2시간',
    tags: ['#맛집', '#스트레스해소'],
    bookmarks: 0,
    likes: 0,
    isVerified: false,
    isPublic: false,
    ownerId: 'me',
    scheduledDate: '2024-06-01',
    stops: [
      {
        id: 'mk1',
        name: '땀땀',
        category: '맛집',
        time: '19:00',
        description: '매운 소곱창 쌀국수',
        isVerified: false,
      },
      {
        id: 'mk2',
        name: '카페 알베르',
        category: '카페',
        time: '20:30',
        description: '넓은 야외 테라스에서 수다',
        isVerified: false,
      },
    ],
  },
];

export const RECOMMENDED_PLACES: Place[] = [
  {
    id: 'p1',
    name: '하늘공원 전망대',
    category: '관광지',
    time: '60분',
    description: '탁 트인 하늘과 노을을 감상할 수 있는 곳',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop',
    address: '서울 마포구 하늘공원로 95',
    phone: '02-3153-8300',
    tags: ['#노을맛집', '#산책', '#인생샷'],
  },
  {
    id: 'p2',
    name: '숲속 작은 책방',
    category: '문화',
    time: '90분',
    description: '조용히 책 읽으며 마음을 정리하는 공간',
    image:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1080&auto=format&fit=crop',
    address: '서울 종로구 숲속길 42',
    phone: '02-732-1234',
    tags: ['#북카페', '#힐링', '#조용함'],
  },
  {
    id: 'p3',
    name: '유기농 브런치 카페',
    category: '카페',
    time: '60분',
    description: '건강한 재료로 만든 브런치',
    image:
      'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1080&auto=format&fit=crop',
    address: '서울 성동구 뚝섬로 13길',
    phone: '02-466-7890',
    tags: ['#브런치', '#비건', '#건강식'],
  },
  {
    id: 'p4',
    name: '도심 속 족욕 카페',
    category: '힐링',
    time: '45분',
    description: '따뜻한 물에 발 담그고 피로 풀기',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1080&auto=format&fit=crop',
    address: '서울 강남구 테헤란로 5길',
    phone: '02-555-5678',
    tags: ['#족욕', '#피로회복', '#데이트'],
  },
  {
    id: 'p5',
    name: '한강 피크닉',
    category: '공원',
    time: '120분',
    description: '강바람 맞으며 즐기는 여유',
    image:
      'https://images.unsplash.com/photo-1563299796-b729d0af54a5?q=80&w=1080&auto=format&fit=crop',
    address: '서울 영등포구 여의동로 330',
    phone: '02-3780-0561',
    tags: ['#피크닉', '#한강라면', '#물멍'],
  },
];

export const PLACE_COORDS: Record<string, { lat: number; lng: number }> = {
  p1: { lat: 37.5667, lng: 126.8851 },
  p2: { lat: 37.5735, lng: 126.9769 },
  p3: { lat: 37.5477, lng: 127.0441 },
  p4: { lat: 37.5059, lng: 127.0262 },
  p5: { lat: 37.5258, lng: 126.9325 },
};

export const DEFAULT_START_COORD = { lat: 37.5547, lng: 126.9707 };

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'cm1',
    user: '여행꿈나무',
    avatar: 'https://i.pravatar.cc/150?u=cm1',
    text: '이 코스 따라갔는데 진짜 완벽했어요! 특히 두 번째 장소가 최고 👍',
    date: '2일 전',
    likes: 12,
  },
  {
    id: 'cm2',
    user: '맛집헌터',
    avatar: 'https://i.pravatar.cc/150?u=cm2',
    text: '주말에 가봤는데 사람이 좀 많았어요. 평일 추천합니다~',
    date: '5일 전',
    likes: 8,
  },
  {
    id: 'cm3',
    user: '힐링마니아',
    avatar: 'https://i.pravatar.cc/150?u=cm3',
    text: '코스 순서 그대로 따라가면 동선이 딱 맞아요. 짱입니다!',
    date: '1주 전',
    likes: 24,
  },
  {
    id: 'cm4',
    user: '사진작가',
    avatar: 'https://i.pravatar.cc/150?u=cm4',
    text: '인생샷 포인트 알려주셔서 감사합니다 📸',
    date: '2주 전',
    likes: 5,
  },
];

// --- 매거진 타입 & 데이터 ---

export interface MagazineArticle {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  tag: string;
  sections: {
    type: 'text' | 'image' | 'place';
    content?: string;
    image?: string;
    caption?: string;
    placeName?: string;
    placeLocation?: string;
    placeDescription?: string;
  }[];
  relatedCourseIds: string[];
}

export const MOCK_MAGAZINES: MagazineArticle[] = [
  {
    id: 'mag1',
    title: '떠나기 좋은 5월의 여행지',
    subtitle: '에디터가 직접 다녀온 숨은 명소 5곳',
    coverImage:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1080&auto=format&fit=crop',
    author: '에디터 윤슬',
    authorAvatar: 'https://i.pravatar.cc/150?u=editor1',
    date: '2026.02.20',
    readTime: '5분',
    tag: 'MAY ISSUE',
    sections: [
      {
        type: 'text',
        content:
          '5월은 여행의 계절이에요. 따사로운 햇살, 적당한 바람, 그리고 어디를 가도 싱그러운 초록빛이 반겨주는 달이죠. 오늘은 제가 직접 다녀온 5곳의 숨은 명소를 소개할게요. 하나같이 이런 곳이 있었어?라는 감탄이 절로 나오는 곳들이에요.',
      },
      {
        type: 'image',
        image:
          'https://images.unsplash.com/photo-1591325478691-c0f3b67c45e0?q=80&w=1080&auto=format&fit=crop',
        caption: '한옥 마을에 봄이 오면, 시간이 멈춘 듯한 고요함이 있어요.',
      },
      {
        type: 'place',
        placeName: '전주 한옥마을 숨은 골목길',
        placeLocation: '전북 전주시 완산구',
        placeDescription:
          '관광객이 몰리는 메인 거리 대신, 골목 안쪽으로 한 발짝만 들어가면 정말 조용한 한옥들을 만날 수 있어요.',
      },
      {
        type: 'text',
        content:
          '두 번째로 소개할 곳은 강릉의 숨은 해안 산책로예요. 유명한 해변 대신 조금 더 남쪽으로 내려가면, 사람 없는 절벽 위 둘레길이 나타나요.',
      },
      {
        type: 'image',
        image:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop',
        caption: '바다를 끼고 걷는 절벽길. 바람 소리만 들리는 곳.',
      },
      {
        type: 'place',
        placeName: '강릉 해안 절벽 둘레길',
        placeLocation: '강원 강릉시 강동면',
        placeDescription:
          '네비게이션에도 잘 나오지 않는 곳이에요. 주차장에서 10분만 걸으면 탁 트인 바다가 펼쳐지고, 절벽 위 벤치에 앉으면 시간 가는 줄 몰라요.',
      },
      {
        type: 'text',
        content:
          '여행은 거창한 계획이 아니어도 괜찮아요. 이번 주말, 한 곳만이라도 가보시는 건 어떨까요? 🌿',
      },
    ],
    relatedCourseIds: ['2', '3'],
  },
  {
    id: 'mag2',
    title: '혼자 떠나도 외롭지 않은 여행법',
    subtitle: '나를 위한 시간, 솔로 여행 가이드',
    coverImage:
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1080&auto=format&fit=crop',
    author: '에디터 한결',
    authorAvatar: 'https://i.pravatar.cc/150?u=editor2',
    date: '2026.02.15',
    readTime: '4분',
    tag: 'SOLO TRIP',
    sections: [
      {
        type: 'text',
        content:
          '혼자 여행한다고 하면 주변에서 외롭지 않아?라고 물어봐요. 하지만 솔로 여행의 매력은 온전히 나에게 집중할 수 있다는 거예요.',
      },
      {
        type: 'image',
        image:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1080&auto=format&fit=crop',
        caption: '나 홀로 걷는 길은 세상에서 가장 조용한 명상.',
      },
      {
        type: 'text',
        content:
          '솔로 여행 팁: 카페를 베이스캠프로 삼으세요. 좋은 카페 하나를 정해두고 그 주변을 탐험하는 방식이 부담도 적고, 언제든 돌아올 곳이 있다는 안정감이 생겨요.',
      },
    ],
    relatedCourseIds: ['1', '3'],
  },
];

// --- 신고 사유 ---
export const REPORT_REASONS = [
  '허위 정보가 포함되어 있어요',
  '부적절한 내용이 있어요',
  '스팸 또는 광고 코스예요',
  '저작권을 침해하고 있어요',
  '기타',
];

export const RECENT_REVIEWS: Review[] = [
  {
    id: 'r1',
    user: '여행조아',
    avatar: 'https://i.pravatar.cc/150?u=1',
    image:
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=300&auto=format&fit=crop',
    comment: '친퀘테레 느낌 나는 부산 흰여울마을! 인생샷 건졌어요',
    place: '부산 영도구',
  },
  {
    id: 'r2',
    user: '먹스타그램',
    avatar: 'https://i.pravatar.cc/150?u=2',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop',
    comment: '웨이팅 1시간이었지만 후회 없는 맛... 육즙 대박입니다',
    place: '서울 용산구',
  },
  {
    id: 'r3',
    user: '감성충만',
    avatar: 'https://i.pravatar.cc/150?u=3',
    image:
      'https://images.unsplash.com/photo-1493857676977-45f35ee61bbd?q=80&w=300&auto=format&fit=crop',
    comment: '조용하게 책 읽기 좋은 북카페, 주말에도 한적해서 좋았어요.',
    place: '경기 파주시',
  },
];
