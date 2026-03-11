'use client';

import { useEffect } from 'react';
import { X, Link2, MessageCircle, Share2 } from 'lucide-react';
import styles from './styles.module.scss';

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export function ShareBottomSheet({ isOpen, onClose, title, url }: ShareBottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('링크가 복사되었습니다!');
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
    onClose();
  };

  const handleKakaoShare = () => {
    alert('카카오톡 공유 (연동 예정)');
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl });
    } else {
      handleCopyLink();
    }
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <span className={styles.title}>공유하기</span>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>
        <p className={styles.courseTitle}>{title}</p>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleCopyLink}>
            <div className={styles.actionIcon}>
              <Link2 size={22} />
            </div>
            <span>링크 복사</span>
          </button>
          <button className={styles.actionBtn} onClick={handleKakaoShare}>
            <div className={`${styles.actionIcon} ${styles.kakao}`}>
              <MessageCircle size={22} />
            </div>
            <span>카카오톡</span>
          </button>
          <button className={styles.actionBtn} onClick={handleNativeShare}>
            <div className={`${styles.actionIcon} ${styles.more}`}>
              <Share2 size={22} />
            </div>
            <span>더 보기</span>
          </button>
        </div>
      </div>
    </>
  );
}
