"use client";

import styles from "./modal.module.css";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary", // primary, danger, warning, success
}) {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "danger":
        return styles.confirmButtonDanger;
      case "warning":
        return styles.confirmButtonWarning;
      case "success":
        return styles.confirmButtonSuccess;
      default:
        return styles.confirmButton;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={`${styles.modalButton} ${styles.cancelButton}`}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${styles.modalButton} ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
