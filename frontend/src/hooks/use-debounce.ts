"use client";

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMilliseconds = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMilliseconds);
    return () => window.clearTimeout(timeout);
  }, [delayMilliseconds, value]);

  return debouncedValue;
}
