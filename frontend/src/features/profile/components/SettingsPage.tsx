'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  LogOut,
  Trash2,
  Info,
  Shield,
  HelpCircle,
  Camera,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { updateMyPageProfile } from '@/features/my-page/api';

type SettingsSection = 'main' | 'editProfile' | 'notification' | 'privacy' | 'about';

export function SettingsPage() {
  const router = useRouter();
  const { user, settings, updateSettings, updateProfile, setLoggedIn } = useUserStore();
  const [section, setSection] = useState<SettingsSection>('main');

  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;

    try {
      setIsSaving(true);
      const updated = await updateMyPageProfile({
        newUserNickname: editName,
        newUserIntro: editTitle,
        newUserProfileImg: user.avatar,
      });

      // 응답 데이터로 로컬 스토어 갱신
      updateProfile({
        name: updated.userNickname,
        avatar: updated.userImg,
        title: updated.userIntro,
        bio: updated.userIntro,
      });

      setSection('main');
      toast.success('프로필이 수정되었어요!');
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      toast.error('프로필 수정에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setShowLogoutModal(false);
    toast.success('로그아웃 되었어요.');
    router.push('/');
  };

  const SectionHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
      <div className="flex items-center p-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-lg ml-2">{title}</span>
      </div>
    </div>
  );

  const ToggleSwitch = ({
    enabled,
    onToggle,
  }: {
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-sky-500' : 'bg-gray-300'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  );

  const MenuItem = ({
    icon: Icon,
    label,
    sublabel,
    onClick,
    rightContent,
  }: {
    icon: React.ElementType;
    label: string;
    sublabel?: string;
    onClick?: () => void;
    rightContent?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-gray-50 transition-colors text-gray-700"
    >
      <Icon size={20} className="text-gray-400" />
      <div className="flex-1 text-left">
        <div className="text-sm font-medium">{label}</div>
        {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
      </div>
      {rightContent ?? <ChevronRight size={16} className="text-gray-300" />}
    </button>
  );

  // === Edit Profile ===
  if (section === 'editProfile') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SectionHeader title="프로필 수정" onBack={() => setSection('main')} />
        <div className="flex-1 p-5">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={user.avatar}
                  alt="Profile"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                <Camera size={14} />
              </button>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">닉네임</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={12}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:outline-none focus:border-sky-400"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{editName.length}/12</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">한줄 소개</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={20}
                placeholder="나를 소개하는 한줄"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:outline-none focus:border-sky-400"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {editTitle.length}/20
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSaveProfile}
            disabled={!editName.trim() || isSaving}
            className="w-full bg-sky-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    );
  }

  // === Notification Settings ===
  if (section === 'notification') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SectionHeader title="알림 설정" onBack={() => setSection('main')} />
        <div className="flex-1">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">푸시 알림</div>
                <div className="text-xs text-gray-400 mt-0.5">댓글, 좋아요, 팔로우 알림</div>
              </div>
              <ToggleSwitch
                enabled={settings.pushNotification}
                onToggle={() =>
                  updateSettings('pushNotification', !settings.pushNotification)
                }
              />
            </div>
          </div>
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">마케팅 알림</div>
                <div className="text-xs text-gray-400 mt-0.5">이벤트, 매거진, 추천 코스</div>
              </div>
              <ToggleSwitch
                enabled={settings.marketingNotification}
                onToggle={() =>
                  updateSettings('marketingNotification', !settings.marketingNotification)
                }
              />
            </div>
          </div>
          <div className="px-5 py-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              알림을 끄면 중요한 여행 정보를 놓칠 수 있어요.
              <br />
              기기 설정에서도 알림을 관리할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // === Privacy Settings ===
  if (section === 'privacy') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SectionHeader title="개인정보 및 보안" onBack={() => setSection('main')} />
        <div className="flex-1">
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">비공개 프로필</div>
                <div className="text-xs text-gray-400 mt-0.5">다른 유저에게 프로필 숨기기</div>
              </div>
              <ToggleSwitch
                enabled={settings.privateProfile}
                onToggle={() => updateSettings('privateProfile', !settings.privateProfile)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === About ===
  if (section === 'about') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SectionHeader title="앱 정보" onBack={() => setSection('main')} />
        <div className="flex-1 p-5">
          <div className="text-center mb-8 mt-6">
            <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🗺️</span>
            </div>
            <h2 className="font-bold text-lg text-gray-900 mb-1">일출</h2>
            <p className="text-xs text-gray-500">버전 1.0.0</p>
          </div>
          <div className="space-y-1 mb-8">
            {['이용약관', '개인정보처리방침', '오픈소스 라이선스', '고객센터'].map((label) => (
              <button
                key={label}
                onClick={() => toast.info('준비 중이에요.')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl active:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              (주)일출 | 대표: 김일출
              <br />
              사업자등록번호: 123-45-67890
              <br />
              서울시 강남구 테헤란로 123
              <br />
              <br />
              Copyright &copy; 2024 일출. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // === Main Settings ===
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-lg ml-2">설정</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 프로필 미리보기 */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div
            onClick={() => {
              setEditName(user.name);
              setEditTitle(user.title);
              setSection('editProfile');
            }}
            className="flex items-center gap-4 cursor-pointer active:bg-gray-50 -mx-2 px-2 py-2 rounded-xl transition-colors"
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <Image
                src={user.avatar}
                alt="Profile"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{user.title}</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        </div>

        <div className="py-2">
          <div className="px-5 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              알림 및 보안
            </span>
          </div>
          <MenuItem
            icon={Bell}
            label="알림 설정"
            sublabel={settings.pushNotification ? '푸시 알림 켜짐' : '푸시 알림 꺼짐'}
            onClick={() => setSection('notification')}
          />
          <MenuItem
            icon={Shield}
            label="개인정보 및 보안"
            onClick={() => setSection('privacy')}
          />
        </div>

        <div className="h-2 bg-gray-50" />

        <div className="py-2">
          <div className="px-5 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              앱 정보
            </span>
          </div>
          <MenuItem
            icon={Info}
            label="앱 정보"
            sublabel="버전 1.0.0"
            onClick={() => setSection('about')}
          />
          <MenuItem icon={HelpCircle} label="고객센터 / 문의" onClick={() => toast.info('준비 중이에요.')} />
        </div>

        <div className="h-2 bg-gray-50" />

        <div className="py-2">
          <div className="px-5 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              계정
            </span>
          </div>
          <MenuItem icon={LogOut} label="로그아웃" onClick={() => setShowLogoutModal(true)} />
          <MenuItem
            icon={Trash2}
            label="계정 탈퇴"
            onClick={() => setShowDeleteModal(true)}
          />
        </div>

        <div className="h-10" />
      </div>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[300px] relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3 text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="font-bold text-lg text-gray-900 mb-2">로그아웃 하시겠어요?</h2>
            <p className="text-sm text-gray-500 mb-5">
              다시 로그인하면 여행 기록을 확인할 수 있어요.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-sky-500 font-bold rounded-xl text-sm text-white"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 탈퇴 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[300px] relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="font-bold text-lg text-gray-900 mb-2">정말 탈퇴하시겠어요?</h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              탈퇴하면 모든 여행 기록과 코스가 영구 삭제되며, 복구할 수 없습니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600"
              >
                돌아가기
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  router.push('/');
                }}
                className="flex-1 py-3 bg-red-500 font-bold rounded-xl text-sm text-white"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
