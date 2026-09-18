'use client';

interface HeroEmptyProps {
  /** 화면에 보여줄 지역명 */
  regionName: string;
  /** 지역 선택 시트 열기 */
  onPickRegion: () => void;
  /** 전국 인기 장소로 이동 */
  onSeeNationwide: () => void;
}

/**
 * 히어로 자리에 보여줄 빈 상태.
 *
 * 등록된 장소가 없는 시/도를 직접 고르면 주변 장소 응답이 0건으로 온다.
 * (직접 고른 지역은 사용자의 의사이므로 기본 지역으로 자동 폴백하지 않는다.)
 * 이때 캐러셀에 자식이 없어 높이가 0 이 되면 히어로가 통째로 사라지고
 * 지역 바 바로 아래에 목록 섹션이 붙어 레이아웃이 무너진다. 자리를 지키고
 * 다음 행동을 제안한다.
 *
 * 히어로와 같은 응답을 쓰는 "주변 인기 장소"도 함께 비므로, 여기서 제안하는
 * 대체 경로는 다른 API 를 쓰는 전국 인기 장소다.
 */
export const HeroEmpty = ({
  regionName,
  onPickRegion,
  onSeeNationwide,
}: HeroEmptyProps) => (
  <div className="h-60 w-full flex flex-col items-center justify-center gap-3.5 px-6 bg-gradient-to-b from-primary-50 to-accent-50">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.svg" alt="" aria-hidden width={40} height={40} className="opacity-40" />

    <div className="flex flex-col items-center gap-1.5 text-center">
      <p className="text-base font-bold text-gray-900">
        {regionName}에 아직 등록된 장소가 없어요
      </p>
      <p className="text-[13px] text-gray-500">
        다른 지역을 고르거나, 전국 인기 장소를 먼저 둘러보세요
      </p>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPickRegion}
        className="px-[18px] py-2.5 rounded-full bg-primary-500 text-white text-[13px] font-bold active:scale-95 transition-transform"
      >
        다른 지역 고르기
      </button>
      <button
        type="button"
        onClick={onSeeNationwide}
        className="px-[18px] py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-[13px] font-bold active:scale-95 transition-transform"
      >
        전국 인기 장소
      </button>
    </div>
  </div>
);
