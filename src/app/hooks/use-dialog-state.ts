import { useState } from "react";

export function useDialogState<T>() {
  const [{ isOpen, data }, setState] = useState<{
    isOpen: boolean;
    data?: T;
  }>({ isOpen: false });

  return {
    isOpen,
    data,
    open: (data?: T) => setState({ isOpen: true, data }),
    close: () => setState({ isOpen: false, data: undefined }),
  };
}
