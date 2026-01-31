'use client';

import React from 'react';
import { IconProps, IconName } from './types';
import { icons } from './icons';

interface IconComponentProps extends IconProps {
  name: IconName;
}

export default function IconBox({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className = '',
  onClick,
  disabled = false,
  title,
  'aria-label': ariaLabel
}: IconComponentProps) {
  const IconComponent = icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      className={`icon icon-${name} ${className}`}
      onClick={onClick}
      // disabled={disabled}
      // title={title}
      aria-label={ariaLabel || title}
      role={onClick ? 'button' : 'img'}
      style={{ 
        color: color,
        cursor: 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    />
  );
}