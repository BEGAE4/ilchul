

```jsx
src/
├── app/                                    # 앱 설정 및 초기화
│   ├── providers/
│   │   ├── StoreProvider.tsx              # Zustand 스토어 프로바이더
│   │   ├── ThemeProvider.tsx              # 테마 프로바이더
│   │   ├── QueryProvider.tsx              # React Query 프로바이더
│   │   └── index.ts
│   ├── store/                             # 전역 상태 관리 (Zustand)
│   │   ├── appStore.ts                    # 앱 전역 상태
│   │   ├── authStore.ts                   # 인증 상태
│   │   ├── modalStore.ts                  # 모달 상태
│   │   └── index.ts
│   ├── router/
│   │   ├── Router.tsx                     # 라우터 설정
│   │   ├── routes.ts                      # 라우트 정의
│   │   ├── guards/                        # 라우트 가드
│   │   │   ├── AuthGuard.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── styles/                            # 전역 스타일
│   │   ├── globals.scss                   # 전역 CSS
│   │   ├── variables.module.scss          # SCSS 변수
│   │   ├── mixins.module.scss             # SCSS 믹스인
│   │   ├── reset.scss                     # CSS 리셋
│   │   └── themes.module.scss             # 테마 정의
│   └── index.tsx
│
├── pages/                                 # 페이지 컴포넌트
│   ├── home/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.module.scss
│   │   ├── HomePage.stories.tsx           # Storybook 스토리
│   │   └── index.ts
│   ├── emotion-analysis/
│   │   ├── EmotionAnalysisPage.tsx
│   │   ├── EmotionAnalysisPage.module.scss
│   │   ├── EmotionAnalysisPage.stories.tsx
│   │   └── index.ts
│   ├── course-recommendation/
│   │   ├── CourseRecommendationPage.tsx
│   │   ├── CourseRecommendationPage.module.scss
│   │   ├── CourseRecommendationPage.stories.tsx
│   │   └── index.ts
│   ├── course-detail/
│   │   ├── CourseDetailPage.tsx
│   │   ├── CourseDetailPage.module.scss
│   │   ├── CourseDetailPage.stories.tsx
│   │   └── index.ts
│   ├── my-page/
│   │   ├── MyPage.tsx
│   │   ├── MyPage.module.scss
│   │   ├── MyPage.stories.tsx
│   │   └── index.ts
│   └── community/
│       ├── CommunityPage.tsx
│       ├── CommunityPage.module.scss
│       ├── CommunityPage.stories.tsx
│       └── index.ts
│
├── features/                              # 주요 비즈니스 기능들
│   ├── emotion-analysis/
│   │   ├── api/
│   │   │   ├── emotionApi.ts              # 감정 분석 API
│   │   │   ├── emotionApi.mock.ts         # MSW 목 데이터
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── EmotionAnalysisWidget/
│   │   │   │   ├── EmotionAnalysisWidget.tsx
│   │   │   │   ├── EmotionAnalysisWidget.module.scss
│   │   │   │   ├── EmotionAnalysisWidget.stories.tsx
│   │   │   │   ├── EmotionAnalysisWidget.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── EmotionResultCard/
│   │   │   │   ├── EmotionResultCard.tsx
│   │   │   │   ├── EmotionResultCard.module.scss
│   │   │   │   ├── EmotionResultCard.stories.tsx
│   │   │   │   ├── EmotionResultCard.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── EmotionChart/
│   │   │   │   ├── EmotionChart.tsx
│   │   │   │   ├── EmotionChart.module.scss
│   │   │   │   ├── EmotionChart.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useEmotionAnalysis.ts      # 감정 분석 훅
│   │   │   ├── useEmotionHistory.ts       # 감정 히스토리 훅
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── emotionStore.ts            # Zustand 감정 상태
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── emotion.ts                 # 감정 관련 타입
│   │   │   ├── api.ts                     # API 응답 타입
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── emotionUtils.ts            # 감정 계산 유틸
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── course-recommendation/
│   │   ├── api/
│   │   │   ├── courseApi.ts               # 코스 API
│   │   │   ├── tourApi.ts                 # Tour API 호출
│   │   │   ├── courseApi.mock.ts          # MSW 목 데이터
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── CourseCard/
│   │   │   │   ├── CourseCard.tsx
│   │   │   │   ├── CourseCard.module.scss
│   │   │   │   ├── CourseCard.stories.tsx
│   │   │   │   ├── CourseCard.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── CourseFilter/
│   │   │   │   ├── CourseFilter.tsx
│   │   │   │   ├── CourseFilter.module.scss
│   │   │   │   ├── CourseFilter.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── CourseMap/
│   │   │   │   ├── CourseMap.tsx
│   │   │   │   ├── CourseMap.module.scss
│   │   │   │   ├── CourseMap.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useRecommendation.ts
│   │   │   ├── useCourseData.ts
│   │   │   ├── useCourseFilter.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── courseStore.ts             # Zustand 코스 상태
│   │   │   ├── filterStore.ts             # 필터 상태
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── course.ts
│   │   │   ├── recommendation.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── courseUtils.ts
│   │   │   ├── distanceUtils.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── course-detail/
│   │   ├── api/
│   │   │   ├── courseDetailApi.ts
│   │   │   ├── reviewApi.ts
│   │   │   ├── courseDetailApi.mock.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── CourseInfo/
│   │   │   │   ├── CourseInfo.tsx
│   │   │   │   ├── CourseInfo.module.scss
│   │   │   │   ├── CourseInfo.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── StampMap/
│   │   │   │   ├── StampMap.tsx
│   │   │   │   ├── StampMap.module.scss
│   │   │   │   ├── StampMap.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ReviewSection/
│   │   │   │   ├── ReviewSection.tsx
│   │   │   │   ├── ReviewSection.module.scss
│   │   │   │   ├── ReviewSection.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useCourseDetail.ts
│   │   │   ├── useStampCollection.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── courseDetailStore.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── courseDetail.ts
│   │   │   ├── stamp.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── user-authentication/
│   │   ├── api/
│   │   │   ├── authApi.ts
│   │   │   ├── authApi.mock.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.module.scss
│   │   │   │   ├── LoginForm.stories.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SignupForm/
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── SignupForm.module.scss
│   │   │   │   ├── SignupForm.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SocialLogin/
│   │   │   │   ├── SocialLogin.tsx
│   │   │   │   ├── SocialLogin.module.scss
│   │   │   │   ├── SocialLogin.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   ├── useSignup.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── authStore.ts               # 인증 상태 (Zustand)
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── community/
│   │   ├── api/
│   │   │   ├── postApi.ts
│   │   │   ├── commentApi.ts
│   │   │   ├── communityApi.mock.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── PostList/
│   │   │   │   ├── PostList.tsx
│   │   │   │   ├── PostList.module.scss
│   │   │   │   ├── PostList.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── PostDetail/
│   │   │   │   ├── PostDetail.tsx
│   │   │   │   ├── PostDetail.module.scss
│   │   │   │   ├── PostDetail.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── CommentSection/
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── CommentSection.module.scss
│   │   │   │   ├── CommentSection.stories.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── usePosts.ts
│   │   │   ├── useComments.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── communityStore.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── post.ts
│   │   │   ├── comment.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── healing-diary/
│       ├── api/
│       │   ├── diaryApi.ts
│       │   ├── diaryApi.mock.ts
│       │   └── index.ts
│       ├── components/
│       │   ├── DiaryEntry/
│       │   │   ├── DiaryEntry.tsx
│       │   │   ├── DiaryEntry.module.scss
│       │   │   ├── DiaryEntry.stories.tsx
│       │   │   └── index.ts
│       │   ├── DiaryCalendar/
│       │   │   ├── DiaryCalendar.tsx
│       │   │   ├── DiaryCalendar.module.scss
│       │   │   ├── DiaryCalendar.stories.tsx
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useDiary.ts
│       │   ├── useDiaryAnalytics.ts
│       │   └── index.ts
│       ├── store/
│       │   ├── diaryStore.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── diary.ts
│       │   └── index.ts
│       └── index.ts
│
├── entities/                              # 비즈니스 엔티티
│   ├── user/
│   │   ├── api/
│   │   │   ├── userApi.ts
│   │   │   ├── userApi.mock.ts
│   │   │   └── index.ts
│   │   ├── model/
│   │   │   ├── types.ts                   # User 관련 타입
│   │   │   ├── transforms.ts              # API ↔ Domain 변환
│   │   │   ├── validators.ts              # 데이터 검증
│   │   │   ├── user.ts                    # User 클래스
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── course/
│   │   ├── api/
│   │   │   ├── courseApi.ts
│   │   │   ├── tourApi.ts                 # Tour API 연동
│   │   │   ├── courseApi.mock.ts
│   │   │   └── index.ts
│   │   ├── model/
│   │   │   ├── types.ts                   # Course, Location 타입
│   │   │   ├── transforms.ts              # Tour API 변환
│   │   │   ├── course.ts                  # Course 클래스
│   │   │   ├── location.ts                # Location 클래스
│   │   │   ├── recommendation.ts          # 추천 로직
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── emotion/
│   │   ├── api/
│   │   │   ├── emotionApi.ts
│   │   │   ├── emotionApi.mock.ts
│   │   │   └── index.ts
│   │   ├── model/
│   │   │   ├── types.ts                   # EmotionProfile 타입
│   │   │   ├── emotion-analyzer.ts        # 감정 분석 로직
│   │   │   ├── healing-matcher.ts         # 감정-힐링 매칭
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── location/
│       ├── api/
│       │   ├── locationApi.ts
│       │   ├── weatherApi.ts              # 기상청 API
│       │   ├── locationApi.mock.ts
│       │   └── index.ts
│       ├── model/
│       │   ├── types.ts                   # Location, Weather 타입
│       │   ├── location.ts                # Location 클래스
│       │   ├── weather.ts                 # 날씨 로직
│       │   ├── geo-utils.ts               # 지리 계산
│       │   └── index.ts
│       └── index.ts
│
├── shared/                                # 공통 코드
│   ├── ui/                               # 재사용 UI 컴포넌트
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.scss
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   ├── Modal.module.scss
│   │   │   ├── Modal.stories.tsx
│   │   │   ├── Modal.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.module.scss
│   │   │   ├── Input.stories.tsx
│   │   │   ├── Input.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.module.scss
│   │   │   ├── Card.stories.tsx
│   │   │   ├── Card.test.tsx
│   │   │   └── index.ts
│   │   ├── Map/
│   │   │   ├── Map.tsx
│   │   │   ├── Map.module.scss
│   │   │   ├── Map.stories.tsx
│   │   │   └── index.ts
│   │   ├── Loading/
│   │   │   ├── Loading.tsx
│   │   │   ├── Loading.module.scss
│   │   │   ├── Loading.stories.tsx
│   │   │   └── index.ts
│   │   ├── Toast/
│   │   │   ├── Toast.tsx
│   │   │   ├── Toast.module.scss
│   │   │   ├── Toast.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── lib/                              # 유틸리티 라이브러리
│   │   ├── api/
│   │   │   ├── apiClient.ts              # Axios/Fetch 클라이언트
│   │   │   ├── interceptors.ts           # 요청/응답 인터셉터
│   │   │   ├── tourApiClient.ts          # Tour API 전용 클라이언트
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── localStorage.ts           # 로컬 스토리지 관리
│   │   │   ├── sessionStorage.ts
│   │   │   └── index.ts
│   │   ├── validation/
│   │   │   ├── schemas.ts                # 검증 스키마
│   │   │   ├── validators.ts             # 검증 함수들
│   │   │   └── index.ts
│   │   ├── format/
│   │   │   ├── dateUtils.ts              # 날짜 포맷
│   │   │   ├── numberUtils.ts            # 숫자 포맷
│   │   │   ├── textUtils.ts              # 텍스트 유틸
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── api.ts                    # API 상수
│   │   │   ├── routes.ts                 # 라우트 상수
│   │   │   ├── emotions.ts               # 감정 관련 상수
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/                            # 공통 커스텀 훅
│   │   ├── useGeolocation.ts             # GPS 위치
│   │   ├── useDebounce.ts                # 디바운스
│   │   ├── useLocalStorage.ts            # 로컬 스토리지
│   │   ├── useIntersectionObserver.ts    # 인터섹션 옵저버
│   │   ├── useWindowSize.ts              # 윈도우 크기
│   │   └── index.ts
│   │
│   ├── types/                            # 공통 타입 정의
│   │   ├── api.ts                        # 공통 API 타입
│   │   ├── common.ts                     # 공통 유틸 타입
│   │   ├── tourapi.ts                    # Tour API 타입
│   │   ├── emotions.ts                   # 감정 관련 타입
│   │   └── index.ts
│   │
│   └── config/                           # 설정 파일
│       ├── api.ts                        # API 설정
│       ├── routes.ts                     # 라우트 설정
│       ├── constants.ts                  # 앱 상수
│       ├── env.ts                        # 환경 변수
│       └── index.ts
│
├── widgets/                              # 복합 위젯
│   ├── header/
│   │   ├── Header.tsx
│   │   ├── Header.module.scss
│   │   ├── Header.stories.tsx
│   │   └── index.ts
│   ├── navigation/
│   │   ├── Navigation.tsx
│   │   ├── Navigation.module.scss
│   │   ├── Navigation.stories.tsx
│   │   └── index.ts
│   ├── course-list/
│   │   ├── CourseListWidget.tsx
│   │   ├── CourseListWidget.module.scss
│   │   ├── CourseListWidget.stories.tsx
│   │   └── index.ts
│   ├── emotion-dashboard/
│   │   ├── EmotionDashboard.tsx
│   │   ├── EmotionDashboard.module.scss
│   │   ├── EmotionDashboard.stories.tsx
│   │   └── index.ts
│   └── index.ts
│
├── mocks/                                # MSW 설정
│   ├── handlers/
│   │   ├── authHandlers.ts               # 인증 API 목킹
│   │   ├── courseHandlers.ts             # 코스 API 목킹
│   │   ├── emotionHandlers.ts            # 감정 API 목킹
│   │   ├── tourApiHandlers.ts            # Tour API 목킹
│   │   └── index.ts
│   ├── data/
│   │   ├── mockUsers.ts                  # 가짜 사용자 데이터
│   │   ├── mockCourses.ts                # 가짜 코스 데이터
│   │   ├── mockEmotions.ts               # 가짜 감정 데이터
│   │   └── index.ts
│   ├── browser.ts                        # 브라우저용 MSW 설정
│   ├── server.ts                         # Node.js용 MSW 설정
│   └── index.ts
│
├── styles/                               # 전역 스타일
│   ├── globals.scss                      # 전역 CSS
│   ├── variables.module.scss             # SCSS 변수
│   ├── mixins.module.scss                # SCSS 믹스인
│   ├── reset.scss                        # CSS 리셋
│   └── themes/
│       ├── light.module.scss             # 라이트 테마
│       ├── dark.module.scss              # 다크 테마
│       └── index.ts
│
├── types/                                # 전역 타입
│   ├── global.d.ts                       # 전역 타입 선언
│   ├── env.d.ts                          # 환경 변수 타입
│   └── modules.d.ts                      # 모듈 타입 선언
│
├── utils/                                # 전역 유틸리티
│   ├── test-utils.tsx                    # 테스트 유틸
│   └── storybook-utils.ts                # Storybook 유틸
│
└── index.tsx                             # 앱 진입점

# 프로젝트 루트 설정 파일들
├── .storybook/                           # Storybook 설정
│   ├── main.ts
│   ├── preview.ts
│   ├── manager.ts
│   └── theme.ts
├── package.json
├── tsconfig.json
├── vite.config.ts                        # Vite 설정
├── .env.local                            # 환경 변수
├── .env.example
├── jest.config.js                        # Jest 설정
├── .eslintrc.js
├── .prettierrc
└── README.md

# 주요 기술별 사용법

## Zustand 상태 관리
- app/store/: 전역 상태
- features/*/store/: 기능별 상태
- 상태 구독 및 업데이트

## Module SCSS
- 모든 컴포넌트마다 .module.scss 파일
- 전역 변수는 styles/variables.module.scss
- 테마는 styles/themes/ 폴더

## Storybook
- 모든 컴포넌트마다 .stories.tsx 파일
- UI 컴포넌트 문서화 및 테스트
- 디자인 시스템 구축

## MSW (Mock Service Worker)
- mocks/ 폴더에 모든 목킹 설정
- 개발/테스트 환경에서 API 목킹
- 실제 API 없이도 개발 가능
```

※ test.tsx 

## Next 라우터 구조 설정

1. 페이지 단위의 globals.css 는 가능한 생성 지양

```java
src/app/
├── layout.tsx                    # 전역 CSS import(필수)
├── globals.css                   # 전역 스타일
├── (public)/
│   ├── page.tsx
│   └── styles/                   # (선택) 섹션별 스타일
│       └── public.css
├── (auth)/
│   ├── layout.tsx                # (선택) 섹션 전용 글로벌 CSS import
│   ├── login/
│   │   ├── page.tsx
│   │   └── login.module.css      # (선택) 페이지별 CSS 모듈
│   └── styles/
│       └── auth.css              # (선택) 섹션별 스타일
└── (dashboard)/
    ├── layout.tsx                # (선택) 섹션 전용 글로벌 CSS import
    ├── page.tsx
    └── dashboard.module.css      # (선택) 페이지별 CSS 모듈
```

1. 기본 참고 구조 예시

```java
src/
├── app/
│   ├── layout.tsx                    # 전역 CSS import(필수)
│   ├── (public)/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx                # (선택) 섹션 전용 글로벌 CSS import
│   │   └── login/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx                # (선택) 섹션 전용 글로벌 CSS import
│       └── page.tsx
│
├── styles/                           # ✅ 전역 레이어
│   ├── globals.scss                  # 전역 reset/base/utilities
│   ├── tokens/                       # 디자인 토큰(CSS 변수 중심)
│   │   ├── _colors.scss
│   │   ├── _spacing.scss
│   │   ├── _typography.scss
│   │   └── _zindex.scss
│   ├── mixins/                       # SCSS 함수/믹스인
│   │   ├── _media.scss
│   │   └── _a11y.scss
│   ├── themes/                       # 테마 스코프
│   │   ├── _light.scss
│   │   └── _dark.scss
│   └── utilities/                    # 유틸리티 클래스(드물게 필요)
│       └── _utilities.scss
│
├── features/                         # ✅ 기능(Feature) 단위
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginForm.module.scss # 컴포넌트 캡슐화
│   │   ├── styles/
│   │   │   └── auth.feature.scss     # (선택) 섹션 공통 패턴(전역 import 금지)
│   │   └── index.ts
│   └── posts/
│       ├── components/
│       │   ├── PostList.tsx
│       │   └── PostList.module.scss
│       └── styles/
│           └── posts.feature.scss
│
└── shared/
└── components/ui/
├── Button.tsx
└── Button.module.scss        # 디자인 시스템 컴포넌트
```
