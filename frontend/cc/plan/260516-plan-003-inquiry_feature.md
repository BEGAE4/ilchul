# 문의 기능 구현 계획

생성일: 2026-05-16

## 개요

SettingsPage의 "고객센터 / 문의" 메뉴에서 `/profile/inquiry` 라우트로 연결되는 문의 기능 구현.

## 구현 범위

1. 문의 작성 (사용자)
2. 문의 수정 (사용자, pending 상태만)
3. 문의 삭제 (사용자, pending 상태만)
4. 내 문의 조회 - 답변 대기/완료 탭
5. 모든 문의 조회 (관리자)
6. 문의 답변 작성 (관리자)
7. 문의 카테고리 조회

## 파일 구조

```
src/features/inquiry/
├── types/inquiry.types.ts
├── api/inquiry.api.ts
├── components/
│   ├── InquiryPage.tsx
│   ├── InquiryListSection.tsx
│   ├── InquiryDetailSection.tsx
│   ├── InquiryFormSection.tsx
│   ├── InquiryCard.tsx
│   ├── AdminInquiryListSection.tsx
│   └── AdminAnswerFormSection.tsx
└── index.ts

src/app/
├── profile/inquiry/page.tsx
└── api/inquiry/
    ├── route.ts
    ├── [id]/route.ts
    ├── [id]/answer/route.ts
    ├── all/route.ts
    └── categories/route.ts
```

## 관리자 구분

`useUserStore`의 `user.isAdmin` 플래그로 관리자 여부 판단.
테스트 시 `isAdmin: true`로 설정하면 관리자 뷰 활성화.

## 수정된 기존 파일

- `src/features/profile/components/SettingsPage.tsx:383` — onClick 라우터 연결
- `src/shared/lib/stores/useUserStore.ts` — UserProfile에 `isAdmin?` 추가
