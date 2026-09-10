export function delay(milliseconds: number) {
  return new Promise<void>((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

export async function withMinimumDelay<T>(promise: Promise<T>, milliseconds = 300) {
  const [result] = await Promise.all([promise, delay(milliseconds)]);
  return result;
}

export async function withLoading<T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
) {
  setLoading(true);
  try {
    return await operation();
  } finally {
    setLoading(false);
  }
}
