'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, MapPin, Loader2 } from 'lucide-react';
import Image, { PLACEHOLDER_IMAGE } from '@/shared/ui/SafeImage';
import { toast } from 'sonner';
import type { BestPlace } from '@/shared/types';
import { fetchMyPlans } from '@/features/my-page/api/my-page.api';
import type { MyPlan } from '@/features/my-page/types/plan.types';
import { fetchPlanDetail, updatePlanPlaces } from '@/features/plan/api/plan.api';
import { toNumericPlaceId } from '@/features/place/utils/placeId';
import { useUserStore } from '@/shared/lib/stores/useUserStore';

const NEW_PLAN_ID = '__new__';
const FALLBACK_THUMB =
  PLACEHOLDER_IMAGE;

interface PlaceAddSheetProps {
  open: boolean;
  onClose: () => void;
  place: BestPlace | null;
}

// 장소를 내 플랜에 담는 바텀시트.
// - 내 플랜 목록: GET /api/mypage/plans
// - 담기: GET /api/plan/{planId} 로 기존 장소를 읽은 뒤 POST /api/plan-place/{planId}/update 로 맨 뒤에 추가
// - 새 플랜 만들기: /create (플랜 생성 플로우)로 이동
export function PlaceAddSheet({ open, onClose, place }: PlaceAddSheetProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<MyPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [addedPlanTitle, setAddedPlanTitle] = useState('');
  const authChecked = useUserStore((s) => s.authChecked);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  // 비로그인이면 내 플랜 조회(401) 대신 로그인 안내를 보여준다 (QA A #9)
  const needsLogin = authChecked && !isLoggedIn;

  // 시트가 열릴 때마다 내 플랜 목록을 새로 조회한다
  useEffect(() => {
    if (!open || needsLogin) return;
    let cancelled = false;
    (async () => {
      setIsLoadingPlans(true);
      setPlansError(null);
      try {
        const list = await fetchMyPlans();
        if (!cancelled) setPlans(list);
      } catch {
        if (!cancelled) {
          setPlansError('내 플랜을 불러오지 못했어요.');
          toast.error('내 플랜을 불러오지 못했어요.');
        }
      } finally {
        if (!cancelled) setIsLoadingPlans(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, needsLogin]);

  const handleConfirm = async () => {
    if (!place || isSubmitting) return;

    if (selectedPlanId === NEW_PLAN_ID) {
      handleClose();
      router.push('/create');
      return;
    }

    if (!selectedPlanId) return;

    const numericPlaceId = toNumericPlaceId(place.id);
    if (numericPlaceId === null) {
      toast.error('이 장소는 플랜에 담을 수 없어요.');
      return;
    }

    const planId = Number(selectedPlanId);
    const planTitle = plans.find((p) => p.planId === planId)?.planTitle ?? '';

    setIsSubmitting(true);
    try {
      const detail = await fetchPlanDetail(planId);
      const existing = [...(detail.planPlaceDetailDtos ?? [])].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );

      if (existing.some((p) => p.placeId === numericPlaceId)) {
        toast.info('이미 이 플랜에 담긴 장소예요.');
        return;
      }

      const nextOrder = existing.length
        ? Math.max(...existing.map((p) => p.orderIndex)) + 1
        : 1;

      await updatePlanPlaces(planId, {
        departurePoint: detail.departurePoint ?? undefined,
        places: [
          ...existing.map((p) => ({
            planPlaceId: p.planPlaceId,
            placeId: p.placeId,
            order: p.orderIndex,
          })),
          { placeId: numericPlaceId, order: nextOrder },
        ],
      });

      setAddedPlanTitle(planTitle);
      setAddedSuccess(true);
      toast.success(`'${planTitle}'에 추가했어요!`, {
        description: `${place.name}이(가) 플랜에 담겼습니다.`,
      });
    } catch {
      toast.error('플랜에 담지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPlanId(null);
    setAddedSuccess(false);
    setAddedPlanTitle('');
    onClose();
  };

  if (!place) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 시트·배경은 하단 네비(z-index 100)보다 위에 둔다 — 시트 하단 버튼이 네비에 가려 눌리지 않던 문제 (QA A) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 app-frame bg-black/50 z-[110]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 app-frame z-[120]"
          >
            <div className="bg-white rounded-t-2xl px-5 pt-3 pb-8 max-h-[70vh] flex flex-col">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />

              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="font-bold text-gray-900">
                  {addedSuccess ? '추가 완료!' : '어디에 담을까요?'}
                </h3>
                <button onClick={handleClose} className="p-1 text-gray-400 active:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {needsLogin ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <p className="text-sm font-bold text-gray-900 mb-1">로그인이 필요해요</p>
                  <p className="text-xs text-gray-500 mb-6">
                    장소를 내 플랜에 담으려면 먼저 로그인해주세요.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      router.push('/login');
                    }}
                    className="w-full py-3 bg-primary-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform"
                  >
                    로그인하러 가기
                  </button>
                </div>
              ) : addedSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-3 text-primary-500">
                    <Check size={28} strokeWidth={3} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{place.name}</p>
                  <p className="text-xs text-gray-500 mb-6">
                    {addedPlanTitle ? `'${addedPlanTitle}'에 추가되었어요!` : '장소가 플랜에 추가되었어요!'}
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-primary-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform"
                  >
                    확인
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4 shrink-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={place.image}
                        alt={place.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-primary-600">{place.category}</div>
                      <div className="text-sm font-bold text-gray-900 truncate">{place.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin size={10} /> {place.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    <button
                      onClick={() => setSelectedPlanId(NEW_PLAN_ID)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPlanId === NEW_PLAN_ID
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedPlanId === NEW_PLAN_ID
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Plus size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900">새 플랜 만들기</div>
                        <div className="text-xs text-gray-400">플랜 만들기 화면으로 이동해요</div>
                      </div>
                      {selectedPlanId === NEW_PLAN_ID && (
                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>

                    {isLoadingPlans && (
                      <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
                        <Loader2 size={14} className="animate-spin" /> 내 플랜을 불러오는 중...
                      </div>
                    )}

                    {!isLoadingPlans && plansError && (
                      <div className="text-center py-4 text-xs text-gray-400">{plansError}</div>
                    )}

                    {!isLoadingPlans &&
                      !plansError &&
                      plans.map((plan) => {
                        const id = String(plan.planId);
                        const selected = selectedPlanId === id;
                        return (
                          <button
                            key={plan.planId}
                            onClick={() => setSelectedPlanId(id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              selected ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'
                            }`}
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                              <Image
                                src={plan.planImages?.[0] || FALLBACK_THUMB}
                                alt={plan.planTitle}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">
                                {plan.planTitle}
                              </div>
                              <div className="text-xs text-gray-400">
                                {plan.tripStartDate ? plan.tripStartDate.slice(0, 10) : '날짜 미정'}
                                {plan.requiredTime ? ` · ${plan.requiredTime}분` : ''}
                              </div>
                            </div>
                            {selected && (
                              <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}

                    {!isLoadingPlans && !plansError && plans.length === 0 && (
                      <div className="text-center py-4 text-xs text-gray-400">
                        아직 생성된 플랜이 없어요.
                        <br />
                        &apos;새 플랜 만들기&apos;를 선택해주세요!
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedPlanId || isSubmitting}
                    className="w-full py-3.5 bg-primary-500 text-white font-bold rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all shrink-0"
                  >
                    {isSubmitting
                      ? '담는 중...'
                      : selectedPlanId === NEW_PLAN_ID
                        ? '새 플랜 만들러 가기'
                        : '선택한 플랜에 담기'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
