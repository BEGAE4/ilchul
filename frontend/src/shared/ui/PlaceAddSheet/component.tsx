'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useCourseStore } from '@/shared/lib/stores/useCourseStore';
import { toast } from 'sonner';
import type { BestPlace } from '@/shared/types';

interface PlaceAddSheetProps {
  open: boolean;
  onClose: () => void;
  place: BestPlace | null;
}

export function PlaceAddSheet({ open, onClose, place }: PlaceAddSheetProps) {
  const { myCourses, addStopToMyCourse, addMyCourse } = useCourseStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleConfirm = () => {
    if (!place) return;

    if (selectedCourseId === '__new__') {
      const newCourse = {
        id: `my-${Date.now()}`,
        title: `${place.name} 여행`,
        description: `${place.name}에서 시작하는 나만의 코스`,
        author: '김여행',
        authorAvatar: 'https://i.pravatar.cc/150?u=me',
        thumbnail: place.image,
        location: place.location,
        duration: '1시간',
        tags: [`#${place.category}`],
        bookmarks: 0,
        likes: 0,
        isVerified: false,
        isPublic: false,
        ownerId: 'me',
        scheduledDate: '',
        review: '',
        stops: [
          {
            id: `stop-${Date.now()}`,
            name: place.name,
            category: place.category,
            time: '10:00',
            description: `${place.location} · ${place.category}`,
            isVerified: false,
          },
        ],
      };
      addMyCourse(newCourse);
      setAddedSuccess(true);
      toast.success('새 코스가 생성되었어요!', {
        description: `${place.name}이(가) 추가되었습니다.`,
      });
    } else if (selectedCourseId) {
      addStopToMyCourse(selectedCourseId, {
        id: `stop-${Date.now()}`,
        name: place.name,
        category: place.category,
        time: '12:00',
        description: `${place.location} · ${place.category}`,
        isVerified: false,
      });
      setAddedSuccess(true);
      const courseName = myCourses.find((c) => c.id === selectedCourseId)?.title;
      toast.success(`'${courseName}'에 추가했어요!`, {
        description: `${place.name}이(가) 코스에 담겼습니다.`,
      });
    }
  };

  const handleClose = () => {
    setSelectedCourseId(null);
    setAddedSuccess(false);
    onClose();
  };

  if (!place) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-[430px] mx-auto"
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

              {addedSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-500">
                    <Check size={28} strokeWidth={3} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{place.name}</p>
                  <p className="text-xs text-gray-500 mb-6">장소가 코스에 추가되었어요!</p>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-sky-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform"
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
                      <div className="text-[10px] font-bold text-sky-600">{place.category}</div>
                      <div className="text-sm font-bold text-gray-900 truncate">{place.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin size={10} /> {place.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    <button
                      onClick={() => setSelectedCourseId('__new__')}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedCourseId === '__new__'
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedCourseId === '__new__'
                            ? 'bg-sky-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Plus size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900">새 코스 만들기</div>
                        <div className="text-xs text-gray-400">이 장소로 새 코스를 시작해요</div>
                      </div>
                      {selectedCourseId === '__new__' && (
                        <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>

                    {myCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selectedCourseId === course.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {course.stops.length}개 장소 · {course.location}
                          </div>
                        </div>
                        {selectedCourseId === course.id && (
                          <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}

                    {myCourses.length === 0 && (
                      <div className="text-center py-4 text-xs text-gray-400">
                        아직 생성된 코스가 없어요.
                        <br />
                        &apos;새 코스 만들기&apos;를 선택해주세요!
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedCourseId}
                    className="w-full py-3.5 bg-sky-500 text-white font-bold rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all shrink-0"
                  >
                    {selectedCourseId === '__new__' ? '새 코스 생성하며 담기' : '선택한 코스에 담기'}
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
