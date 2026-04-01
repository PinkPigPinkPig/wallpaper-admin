import { postMessageHandler } from '@/components/ui/ToastMessage';

export type TToastType = 'network' | 'timeout' | 'server' | 'unauthorized';

const ERROR_MESSAGES: Record<TToastType, string> = {
  network: 'Network error. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  server: 'An error occurred. Please try again.',
  unauthorized: 'Session expired. Please log in again.',
};

export function showToast(
  type: TToastType,
  serverMessage?: string,
  extra?: { url?: string; status?: number },
) {
  const message = serverMessage ?? ERROR_MESSAGES[type];

  const statusStr =
    extra?.status?.toString() ??
    (type === 'network' ? 'NETWORK' : 'UNKNOWN');

  const id = `ERR:${extra?.url ?? 'unknown'}:${statusStr}:${message.slice(0, 20)}`;

  postMessageHandler({ id, type: 'error', text: message });
}

export type TSuccessAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'save';

const SUCCESS_MESSAGES: Record<TSuccessAction, string> = {
  login: 'Login successful!',
  logout: 'Logged out successfully',
  create: 'Created successfully',
  update: 'Updated successfully',
  delete: 'Deleted successfully',
  save: 'Saved successfully',
};

export function showSuccessToast(
  action: TSuccessAction,
  queryKey?: string,
  customMessage?: string,
) {
  const message = customMessage ?? SUCCESS_MESSAGES[action];

  const id = `success:${queryKey ?? ''}:${action}`;

  postMessageHandler({ id, type: 'success', text: message });
}
