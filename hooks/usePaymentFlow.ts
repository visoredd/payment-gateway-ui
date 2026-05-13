'use client';

import { useCallback } from 'react';
import type { PaymentPayload, Transaction, TransactionStatus } from '@/types/payment';
import { MAX_PAYMENT_ATTEMPTS, MIN_PROCESSING_MS, PAYMENT_TIMEOUT_MS } from '@/types/constants';
import { usePaymentStore } from '@/store/paymentStore';
import { isAbortError, PaymentGatewayError, submitPayment } from '@/utils/api';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function transactionFromPayload(payload: PaymentPayload, status: TransactionStatus, reason?: string): Transaction {
  const now = new Date().toISOString();

  return {
    id: payload.transactionId,
    amount: payload.amount,
    currency: payload.currency,
    status,
    timestamp: now,
    updatedAt: now,
    attempts: payload.attempt,
    cardholderName: payload.cardholderName,
    cardLast4: payload.cardLast4,
    cardType: payload.cardType,
    reason,
  };
}

function friendlyUnknownErrorMessage(error: unknown): string {
  if (error instanceof PaymentGatewayError) {
    return error.message;
  }

  return 'Something went wrong while contacting the payment gateway. Please retry.';
}

export function usePaymentFlow() {
  const setProcessing = usePaymentStore((state) => state.setProcessing);
  const completePayment = usePaymentStore((state) => state.completePayment);
  const resetFlow = usePaymentStore((state) => state.resetFlow);
  const activePayload = usePaymentStore((state) => state.activePayload);
  const status = usePaymentStore((state) => state.status);

  const executePayment = useCallback(
    async (payload: PaymentPayload): Promise<void> => {
      setProcessing(payload);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), PAYMENT_TIMEOUT_MS);
      const minimumProcessing = sleep(MIN_PROCESSING_MS);

      try {
        const response = await submitPayment(payload, controller.signal);
        await minimumProcessing;

        if (response.status === 'success') {
          completePayment(transactionFromPayload(payload, 'success'));
          return;
        }

        completePayment(transactionFromPayload(payload, 'failed', response.reason));
      } catch (error: unknown) {
        await minimumProcessing;

        if (isAbortError(error)) {
          completePayment(
            transactionFromPayload(
              payload,
              'timeout',
              'The payment gateway did not respond within 6 seconds.',
            ),
          );
          return;
        }

        completePayment(transactionFromPayload(payload, 'failed', friendlyUnknownErrorMessage(error)));
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [completePayment, setProcessing],
  );

  const retryPayment = useCallback(async (): Promise<void> => {
    if (!activePayload || activePayload.attempt >= MAX_PAYMENT_ATTEMPTS || status === 'processing') {
      return;
    }

    await executePayment({ ...activePayload, attempt: activePayload.attempt + 1 });
  }, [activePayload, executePayment, status]);

  const canRetry =
  activePayload !== undefined &&
    activePayload.attempt < MAX_PAYMENT_ATTEMPTS &&
    (status === 'failed' || status === 'timeout');

  return {
    executePayment,
    retryPayment,
    resetFlow,
    canRetry,
  };
}
