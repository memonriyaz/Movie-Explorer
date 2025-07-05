"use client";

import { useState, useCallback } from "react";

interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "warning" | "info";
  onConfirm: (() => void) | (() => Promise<void>);
}

const defaultState: ConfirmationModalState = {
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "danger",
  onConfirm: () => {},
};

export const useConfirmationModal = () => {
  const [modalState, setModalState] = useState<ConfirmationModalState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);

  const showModal = useCallback((config: Partial<ConfirmationModalState>) => {
    setModalState({
      ...defaultState,
      ...config,
      isOpen: true,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(defaultState);
    setIsLoading(false);
  }, []);

  const confirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await modalState.onConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
      hideModal();
    }
  }, [modalState.onConfirm, hideModal]);

  return {
    modalState,
    isLoading,
    showModal,
    hideModal,
    confirm,
  };
};
