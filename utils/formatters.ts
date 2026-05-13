import type { Currency, PaymentStatus } from '@/types/payment';

export function formatMoney(amount: number, currency: Currency): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function statusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'idle':
      return 'Idle';
    case 'processing':
      return 'Processing';
    case 'success':
      return 'Success';
    case 'failed':
      return 'Failed';
    case 'timeout':
      return 'Timeout';
  }
}
