import * as React from "react";

import {
  ToastActionElement,
  ToastProps,
} from "../components/ui/toast";

type Toast = {
  id: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
} & Omit<ToastProps, 'open'>;

type State = {
  toasts: Toast[];
};

type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

const TOAST_LIMIT = 1;
const DEFAULT_DURATION = 4000; // 4 seconds

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration: number = DEFAULT_DURATION) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({
  variant = "default",
  duration = DEFAULT_DURATION,
  ...props
}: Omit<ToastProps, 'open'> & { duration?: number }) {
  const id = genId();

  const update = (newProps: Omit<ToastProps, 'open'> & { duration?: number }) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...newProps, id, open: true } as Toast,
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      variant,
      duration,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    } as Toast,
  });

  addToRemoveQueue(id, duration);

  return {
    id,
    dismiss,
    update,
  };
}

// Helper functions for different toast types
const toastSuccess = (props: Omit<ToastProps, 'open' | 'variant'> & { duration?: number }) => {
  return toast({ ...props, variant: "success" });
};

const toastError = (props: Omit<ToastProps, 'open' | 'variant'> & { duration?: number }) => {
  return toast({ ...props, variant: "error" });
};

const toastWarning = (props: Omit<ToastProps, 'open' | 'variant'> & { duration?: number }) => {
  return toast({ ...props, variant: "warning" });
};

const toastInfo = (props: Omit<ToastProps, 'open' | 'variant'> & { duration?: number }) => {
  return toast({ ...props, variant: "info" });
};

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast, toastSuccess, toastError, toastWarning, toastInfo, reducer };
