interface ApiErrorShape {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

/**
 * 统一提取后端错误文案，避免各页面重复使用 any。
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiErrorShape | null;
  const message = apiError?.response?.data?.message;
  if (Array.isArray(message)) return message.join('；');
  if (typeof message === 'string' && message.trim()) return message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

/**
 * Antd 表单校验失败时会抛出带 errorFields 的对象。
 */
export function isFormValidationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return 'errorFields' in error;
}
