import type { PaymentPayload, PaymentResponse } from '@/types/payment';
import { isPaymentResponse } from '@/utils/typeGuards';

export class PaymentGatewayError extends Error {
  constructor(
    public readonly kind: 'network' | 'invalid-response',
    message: string,
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}

export async function submitPayment(payload: PaymentPayload, signal: AbortSignal): Promise<PaymentResponse> {
  const response = await fetch('/api/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new PaymentGatewayError('network', 'The payment gateway is unavailable. Please try again.');
  }

  const data: unknown = await response.json();

  if (!isPaymentResponse(data)) {
    throw new PaymentGatewayError('invalid-response', 'We received an unexpected gateway response. Please retry.');
  }

  return data;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
