"use client";

import React, { useState, useEffect } from "react";
import IconBox from "../IconBox";
import { BottomMenuProps, MenuItem } from "./types";
import styles from "./styles.module.scss";

const BottomMenu: React.FC<BottomMenuProps> = ({
  items,
  isOpen,
  onClose = () => {},
  title,
  showCloseButton = true,
  showHandle = true,
  className = "",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // 애니메이션 시작을 위한 지연
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.container} ${className}`}
      onClick={handleOverlayClick}
    >
      {/* 배경 오버레이 */}
      <div
        className={`${styles.overlay} ${
          isAnimating ? styles.visible : styles.hidden
        }`}
        onClick={() => {
          if (closeOnOverlayClick) onClose();
        }}
      />

      {/* 바텀 메뉴 */}
      <div
        className={`${styles.menu} ${
          isAnimating ? styles.visible : styles.hidden
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        {showHandle && (
          <div className={styles.handle}>
            <div className={styles.handleBar} />
          </div>
        )}

        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h3 className={styles.title}>{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="닫기"
              >
                <IconBox name="close" size={20} />
              </button>
            )}
          </div>
        )}

        {/* 메뉴 아이템들 */}
        <div className={styles.itemsContainer}>
          {items.map((item) => (
            <button
              key={item.id}
              className={`${styles.item} ${
                item.disabled ? styles.disabled : styles.enabled
              }`}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
              tabIndex={item.disabled ? -1 : 0}
              role="menuitem"
              aria-disabled={item.disabled}
            >
              {item.icon && (
                <div className={styles.itemIcon}>
                  {item.icon}
                </div>
              )}
              <span className={styles.itemLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* 하단 여백 */}
        <div className={styles.bottomSpacing} />
      </div>
    </div>
  );
};

export default BottomMenu;
