"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";
import { DropdownMenuProps } from "./types";
import styles from "./style.module.scss";

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  triggerType = "button",
  placement = "bottom",
  width = "auto",
  variant = "default",
  className = "",
  onOpenChange,
  closeOnSelect = true,
  closeOnClickOutside = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnClickOutside &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeOnClickOutside]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    if (triggerType === "select") {
      setSelectedItem(item);
    }

    item.onClick?.();

    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  const renderTrigger = () => {
    if (trigger) {
      return trigger;
    }

    switch (triggerType) {
      case "select":
        return (
          <div className={styles.selectTrigger}>
            <span className={styles.selectText}>
              {selectedItem?.label || "선택하세요"}
            </span>
            {isOpen ? (
              <ChevronUp className={styles.selectIcon} />
            ) : (
              <ChevronDown className={styles.selectIcon} />
            )}
          </div>
        );
      case "custom":
        return null;
      default:
        return (
          <button className={styles.buttonTrigger}>
            <MoreVertical className={styles.buttonIcon} />
          </button>
        );
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={styles.trigger}
      >
        {renderTrigger()}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`${styles.dropdown} ${styles[placement]} ${styles[width]} ${styles[variant]}`}
        >
          <div className={styles.itemsContainer}>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider ? (
                  <div className={styles.divider} />
                ) : (
                  <button
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
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
