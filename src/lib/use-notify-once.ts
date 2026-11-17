"use client";

import { useEffect, useRef } from "react";

export function useNotifyOnce<State>(state: State, shouldNotify: boolean, notify: () => void) {
  const notifiedState = useRef(state);
  const notifyRef = useRef(notify);

  useEffect(() => {
    notifyRef.current = notify;
  });

  useEffect(() => {
    if (!shouldNotify || notifiedState.current === state) return;

    notifiedState.current = state;
    notifyRef.current();
  }, [state, shouldNotify]);
}
