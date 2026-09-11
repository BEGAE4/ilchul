# MyCourseDetailPage 서버 전환 + 스탬프/프리뷰/사진 관리 연동 결과

> 기준 명세: [cc/api/v5/260705-v5-004-plan.md](../api/v5/260705-v5-004-plan.md), [260705-v5-005-plan-place.md](../api/v5/260705-v5-005-plan-place.md)
> 선행 작업: [260705-result-015-plan_mock_removal_error_ui.md](260705-result-015-plan_mock_removal_error_ui.md)
> 작업일: 2026-07-05 / 브랜치: `feature-fe-admin`

## 개요

계획했던 ⓪→①→②→③을 모두 구현했다.

- ⓪ `MyCourseDetailPage` 서버 전환 (목 스토어 제거 + 에러 UI)
- ① 스탬프 인증 API 연동 (기존 인증 UI 재사용)
- ② 생성/수정 프리뷰 API 연동
- ③ 플랜 사진 관리 UI 신설 + 업로드 연동

## 1. plan 모듈 API 추가 (`src/features/plan/`)

| 함수 | 엔드포인트 |
| --- | --- |
| `updatePlanPreview` | POST `/api/plan-place/{planId}/preview` |
| `createPlanPreview` | POST `/api/plan-place/preview` |
| `stampPlanPlace` | POST `/api/plan-place/{planPlaceId}/stamp` (multipart: `image` + `location` JSON Blob) |
| `uploadPlanImages` | POST `/api/plan/{planId}/images` (multipart `images`) |
| `deletePlanImages` | DELETE `/api/plan/{planId}/images?imageIds=` |

타입 추가: `PlanPreviewResponse`/`PlanPreviewPlace`, `StampPlanPlaceResponse`

## 2. ⓪ `MyCourseDetailPage.tsx` — 서버 기반 전면 재작성

- `useCourseStore` 완전 제거 → `usePlanDetail(courseId)` 서버 조회. 로딩 스켈레톤 + **에러 UI(다시 시도/돌아가기)**.
- 필드 매핑: `planTitle`, `isPlanVisible`(공개 배지), `createAt`, `tripStartDate/EndDate`(일정·phase 판정), `requiredTime`(예상 소요 — 서버 계산값 사용), `planPlaceDetailDtos`(`orderIndex` 정렬, `isStamped` 진행률/Visited 스탬프, `stayTime`/`travelTime` 체류·이동 표시).
- 이름 수정/삭제: 서버 API만 호출, 실패 시 에러 토스트. 성공 시 refetch/이동.
- 복제: `clonePlan(planId, { scheduledDate })` + 시간은 `updatePlan(tripStartDate/EndDate)`으로 후속 반영 → `/my-course/{newId}` 이동.
- 여행 기록(리뷰) 섹션: **v5에 저장 API 부재** → 화면 로컬 상태로 유지(사진은 실제 파일 선택으로 교체, 목 샘플 사진 제거). 백엔드 추가 시 연동 예정으로 주석 표기.

## 3. ① 스탬프 인증

- 기존 인증 모달 재사용. "카메라 켜기" → `<input type="file" capture="environment">` 실행.
- 사진 선택 시 Geolocation(5초 타임아웃, 거부 시 좌표 없이 진행) 조회 후 `stampPlanPlace` 호출.
- 성공: 토스트 + refetch(서버 `isStamped` 반영), 전체 인증 완료 시 완주 축하 오버레이.
- 실패: "인증에 실패했어요" 에러 토스트 + 안내.

## 4. ② 프리뷰

- **수정 프리뷰**: 순서 편집 완료 시 `updatePlanPreview` 호출 → "예상 소요시간 X → Y / 총 이동거리 A → B" 비교 확인 모달 → "저장하기" 시 `updatePlanPlaces` 확정 + refetch. 순서 변화 없으면 바로 종료. 프리뷰/저장 실패 시 각각 에러 토스트.
- **생성 프리뷰**: `CourseCreationFlow`에서 장소 선택 → 최종 플랜 진입 시 `createPlanPreview` 호출, 성공 시 일정표 헤더에 "예상 소요 X / 총 이동 Ykm" 배너 표시. 실패 시 "경로 예상 정보를 불러오지 못했어요" 안내(저장 진행에는 영향 없음).

## 5. ③ 플랜 사진 관리

- 더보기 메뉴에 "플랜 사진 관리" 항목 신설 → 바텀시트: 3열 그리드(기존 `planImages` 썸네일, 탭하면 미리보기) + "추가" 타일(multiple 파일 선택).
- 업로드: `uploadPlanImages` → 성공 토스트 + refetch. 실패 시 에러 토스트.
- **삭제 미지원**: `PlanDetailDto.planImages`가 URL 문자열 배열이라 `deleteImages`가 요구하는 `imageIds`와 매핑 불가 → 시트에 안내 문구 표기. **서버에 이미지 ID 포함 응답 요청 필요.**

## 백엔드 확인/요청 필요 항목

| 항목 | 내용 |
| --- | --- |
| 플랜 이미지 ID | `PlanDetailDto`의 `planImages`에 이미지 ID가 없어 삭제 연동 불가 → `{ imageId, url }[]` 형태 요청 |
| 여행 기록(리뷰) 저장 | 플랜 후기/기록 저장 엔드포인트 부재 |
| 스탬프 `location` 파트 형식 | multipart의 `location`을 JSON Blob으로 전송 — 서버 `@RequestPart` 매핑 확인 필요 |
| 복제 시 시간 설정 | `PlanCopyRequestDto`가 날짜만 지원 → 시간은 updatePlan으로 우회 중 |

## 검증

- `yarn tsc --noEmit` 통과
- `yarn build` 성공 (12.2s)
