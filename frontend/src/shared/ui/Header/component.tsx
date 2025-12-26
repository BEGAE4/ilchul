import React from 'react';
import IconBox from '../IconBox';
import { HeaderProps } from './types';
import styles from './styles.module.scss';

const DefaultLeftIcon = ({ color = 'rgb(55, 65, 81)' }: { color?: string }) => (
  <IconBox name="arrow-left" size={24} color={color} />
);

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  leftIcon,
  rightIcon,
  rightIcons,
  center,
  title,
  onLeftClick,
  onRightClick,
  onRightIconClick,
  className = '',
}) => {
  const renderLeftButton = () => {
    if (variant === 'withBackground') {
      return (
        <button
          className={styles.leftButtonWithBg}
          onClick={onLeftClick}
          aria-label="뒤로가기"
          type="button"
        >
          {leftIcon || <DefaultLeftIcon color="#ffffff" />}
        </button>
      );
    }

    if (variant === 'withTitle') {
      return (
        <button
          className={styles.leftButton}
          onClick={onLeftClick}
          aria-label="뒤로가기"
          type="button"
        >
          {leftIcon || <DefaultLeftIcon color="#5188f1" />}
        </button>
      );
    }

    // default variant
    return (
      <button
        className={styles.leftButton}
        onClick={onLeftClick}
        aria-label="뒤로가기"
        type="button"
      >
        {leftIcon || <DefaultLeftIcon />}
      </button>
    );
  };

  const renderRightButtons = () => {
    if (variant === 'withBackground') {
      if (rightIcons && rightIcons.length > 0) {
        return (
          <div className={styles.rightButtonsGroup}>
            {rightIcons.map((icon, index) => (
              <button
                key={index}
                className={styles.rightButtonWithBg}
                onClick={() => onRightIconClick?.(index)}
                aria-label={`오른쪽 버튼 ${index + 1}`}
                type="button"
              >
                {icon}
              </button>
            ))}
          </div>
        );
      }
      // rightIcons가 없으면 rightIcon 사용
      if (rightIcon) {
        return (
          <button
            className={styles.rightButtonWithBg}
            onClick={onRightClick}
            aria-label="오른쪽 버튼"
            type="button"
          >
            {rightIcon}
          </button>
        );
      }
      return null;
    }

    if (variant === 'withTitle' && rightIcon) {
      return (
        <button
          className={styles.rightButton}
          onClick={onRightClick}
          aria-label="오른쪽 버튼"
          type="button"
        >
          {rightIcon}
        </button>
      );
    }

    if (rightIcon) {
      return (
        <button
          className={styles.rightButton}
          onClick={onRightClick}
          aria-label="오른쪽 버튼"
          type="button"
        >
          {rightIcon}
        </button>
      );
    }

    return null;
  };

  const renderCenter = () => {
    if (variant === 'withTitle' && title) {
      return <div className={styles.center}>{title}</div>;
    }

    if (center) {
      return <div className={styles.center}>{center}</div>;
    }

    return null;
  };

  return (
    <header className={`${styles.header} ${styles[variant]} ${className}`}>
      {renderLeftButton()}
      {renderCenter()}
      {renderRightButtons()}
    </header>
  );
};

export default Header;
