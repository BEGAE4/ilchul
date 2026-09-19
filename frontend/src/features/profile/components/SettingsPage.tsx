'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Avatar from '@/shared/ui/Avatar';
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  Trash2,
  Info,
  HelpCircle,
  Camera,
  X,
  Loader2,
} from 'lucide-react';
import { useUserStore } from '@/shared/lib/stores/useUserStore';
import { SERVICE_ROUTES } from '@/shared/lib/constants/service';
import ServiceFooter from '@/shared/ui/ServiceFooter';
import {
  deleteProfileImage,
  fetchMyPageProfile,
  updateMyPageProfile,
  uploadProfileImage,
} from '@/features/my-page/api';
import { profileImageErrorMessage } from '@/features/my-page/utils/profileImageError';
import { canLoadImage } from '@/shared/lib/image';
import { logout, deleteUser } from '@/features/authentication/api';

// 알림 설정·개인정보 및 보안(비공개 프로필) 화면은 뺐다. 토글이 스토어 메모리만 바꾸고 서버에 저장하지 않아
// 새로고침하면 초기화됐고, 비공개 프로필을 켜도 실제로 숨겨지지 않았다. 서버 기능이 생기면 되살린다.
type SettingsSection = 'main' | 'editProfile' | 'about';

const ABOUT_LINKS = [
  { label: '이용약관', href: SERVICE_ROUTES.terms },
  { label: '개인정보처리방침', href: SERVICE_ROUTES.privacy },
  { label: '고객센터', href: SERVICE_ROUTES.support },
] as const;

export function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, setLoggedIn } = useUserStore();
  const [section, setSection] = useState<SettingsSection>('main');

  // userIntro/userNickname 는 서버에서 null 로 내려올 수 있다(자기소개 미입력 신규 가입자).
  // null 이 그대로 들어오면 아래 글자수 카운터({editTitle.length})에서 크래시가 난다 (QA P-01).
  const [editName, setEditName] = useState(user.name ?? '');
  const [editTitle, setEditTitle] = useState(user.title ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 스토어가 비어 있으면(직접 진입 등) 프로필을 API에서 채운다
  useEffect(() => {
    if (user.name) return;
    let isMounted = true;
    fetchMyPageProfile()
      .then((data) => {
        if (!isMounted) return;
        updateProfile({
          name: data.userNickname ?? '',
          avatar: data.userImg ?? '',
          title: data.userIntro ?? '',
          bio: data.userIntro ?? '',
        });
        setEditName(data.userNickname ?? '');
        setEditTitle(data.userIntro ?? '');
      })
      .catch((err) => console.error('프로필 정보 로드 실패:', err));
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;

    try {
      setIsSaving(true);
      const updated = await updateMyPageProfile({
        newUserNickname: editName,
        newUserIntro: editTitle,
      });

      // 응답 데이터로 로컬 스토어 갱신 (null → '' 정규화, P-01)
      updateProfile({
        name: updated.userNickname ?? '',
        avatar: updated.userImg ?? '',
        title: updated.userIntro ?? '',
        bio: updated.userIntro ?? '',
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

  // ── 프로필 사진 (2026-09-18 백엔드 추가: POST/DELETE /api/mypage/profile/image) ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageBusy, setImageBusy] = useState<'upload' | 'delete' | null>(null);

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 같은 사진을 다시 골라도 onChange 가 터지도록 비운다
    e.target.value = '';
    if (!file || imageBusy) return;
    if (!file.type.startsWith('image/')) {
      toast.error('사진 파일만 올릴 수 있어요.');
      return;
    }
    setImageBusy('upload');
    try {
      const updated = await uploadProfileImage(file);
      // 닉네임·소개는 수정 중일 수 있으므로 사진만 갱신한다
      updateProfile({ avatar: updated.userImg ?? '' });
      // 서버가 200 을 줘도 돌려준 주소가 안 열릴 수 있다 — 조용히 기본 아바타로 떨어지지 않게 확인한다
      if (updated.userImg && (await canLoadImage(updated.userImg))) {
        toast.success('프로필 사진을 바꿨어요.');
      } else {
        toast.warning('사진은 저장됐지만 아직 표시할 수 없어요.', {
          description: '잠시 후 다시 확인해주세요. 계속되면 고객센터로 알려주세요.',
        });
      }
    } catch (err) {
      console.error('프로필 사진 업로드 실패:', err);
      const decodeFailed = err instanceof Error && err.message === 'image_decode_failed';
      toast.error(
        decodeFailed ? '이 사진은 열 수 없어요. 다른 사진을 골라주세요.' : profileImageErrorMessage(err)
      );
    } finally {
      setImageBusy(null);
    }
  };

  const handleResetImage = async () => {
    if (imageBusy) return;
    setImageBusy('delete');
    try {
      const updated = await deleteProfileImage();
      updateProfile({ avatar: updated.userImg ?? '' });
      toast.success('기본 이미지로 바꿨어요.');
    } catch (err) {
      console.error('프로필 사진 삭제 실패:', err);
      toast.error('기본 이미지로 바꾸지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setImageBusy(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('로그아웃 실패:', err);
    } finally {
      setLoggedIn(false);
      setShowLogoutModal(false);
      toast.success('로그아웃 되었어요.');
      router.push('/');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUser();
      setLoggedIn(false);
      setShowDeleteModal(false);
      toast.success('회원 탈퇴가 완료되었어요.');
      router.push('/');
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      toast.error('회원 탈퇴에 실패했어요. 다시 시도해 주세요.');
      setIsDeleting(false);
    }
  };

  const SectionHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
      <div className="flex items-center p-4">
        <button
          onClick={onBack}
          aria-label="뒤로가기"
          className="p-2 -ml-2 text-gray-700 rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-lg ml-2">{title}</span>
      </div>
    </div>
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
      <div className="flex flex-col min-h-dvh bg-white">
        <SectionHeader title="프로필 수정" onBack={() => setSection('main')} />
        <div className="flex-1 p-5">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Avatar src={user.avatar} alt="프로필" size={92} />
              </div>
              {imageBusy && (
                <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-primary-500" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePickImage}
                className="hidden"
                aria-hidden
                tabIndex={-1}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageBusy !== null}
                aria-label="프로필 사진 변경"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white active:scale-95 transition-transform disabled:bg-gray-300"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>
          <div className="text-center -mt-5 mb-6 space-y-1">
            <p className="text-[11px] text-gray-400">
              {imageBusy === 'upload'
                ? '사진을 올리는 중이에요...'
                : 'JPG · PNG · WEBP 사진을 올릴 수 있어요.'}
            </p>
            {user.avatar && (
              <button
                type="button"
                onClick={handleResetImage}
                disabled={imageBusy !== null}
                className="text-xs font-bold text-gray-500 underline underline-offset-2 disabled:text-gray-300"
              >
                {imageBusy === 'delete' ? '바꾸는 중...' : '기본 이미지로 변경'}
              </button>
            )}
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">닉네임</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={12}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:outline-none focus:border-primary-400"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{(editName ?? '').length}/12</div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">한줄 소개</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={20}
                placeholder="나를 소개하는 한줄"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-base focus:outline-none focus:border-primary-400"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {(editTitle ?? '').length}/20
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSaveProfile}
            disabled={!editName.trim() || isSaving}
            className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300 active:scale-[0.98] transition-all"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    );
  }

  // === About ===
  if (section === 'about') {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
        <SectionHeader title="앱 정보" onBack={() => setSection('main')} />
        <div className="flex-1 p-5">
          <div className="text-center mb-8 mt-6">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {/* next/image 는 dangerouslyAllowSVG 없이 로컬 SVG 를 400 으로 거절한다 (로그인·홈과 동일) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" aria-hidden width={48} height={48} />
            </div>
            <h2 className="font-bold text-lg text-gray-900 mb-1">일출</h2>
            <p className="text-xs text-gray-500">버전 1.0.0</p>
          </div>
          <div className="space-y-1 mb-8">
            {ABOUT_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl active:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
          <ServiceFooter showLinks={false} />
        </div>
      </div>
    );
  }

  // === Main Settings ===
  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            aria-label="뒤로가기"
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
          <button
            type="button"
            onClick={() => {
              setEditName(user.name ?? '');
              setEditTitle(user.title ?? '');
              setSection('editProfile');
            }}
            className="w-full text-left flex items-center gap-4 cursor-pointer active:bg-gray-50 -mx-2 px-2 py-2 rounded-xl transition-colors"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <Avatar src={user.avatar} alt="프로필" size={52} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">{user.title}</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        </div>

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
          <MenuItem
            icon={HelpCircle}
            label="고객센터 / 문의"
            onClick={() => router.push(SERVICE_ROUTES.support)}
          />
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
        <div className="fixed inset-y-0 app-frame bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[300px] relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              aria-label="닫기"
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
                className="flex-1 py-3 bg-primary-500 font-bold rounded-xl text-sm text-white"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 탈퇴 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-y-0 app-frame bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[300px] relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              aria-label="닫기"
              className="absolute top-3 right-3 text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="font-bold text-lg text-gray-900 mb-2">정말 탈퇴하시겠어요?</h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              탈퇴하면 모든 여행 기록과 플랜이 영구 삭제되며, 복구할 수 없습니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm text-gray-600 disabled:opacity-50"
              >
                돌아가기
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 font-bold rounded-xl text-sm text-white disabled:opacity-50"
              >
                {isDeleting ? '탈퇴 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
