'use client';

import { useEffect, useRef } from 'react';
import { MAX_PAYMENT_ATTEMPTS } from '@/types/constants';
import type { PaymentStatus, Transaction } from '@/types/payment';
import { formatDateTime, formatMoney } from '@/utils/formatters';

interface StatusScreenProps {
  status: PaymentStatus;
  transaction?: Transaction;
  canRetry: boolean;
  onRetry: () => Promise<void> | void;
  onStartNew: () => void;
}

function statusTitle(status: PaymentStatus): string {
  switch (status) {
    case 'idle':
      return 'Ready for payment';
    case 'processing':
      return 'Processing payment';
    case 'success':
      return 'Payment successful';
    case 'failed':
      return 'Payment failed';
    case 'timeout':
      return 'Payment timed out';
  }
}

export function StatusScreen({ status, transaction, canRetry, onRetry, onStartNew }: StatusScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const attempts = transaction?.attempts ?? 1;
  const isRetryableResult = status === 'failed' || status === 'timeout';
  const isFinalFailure = isRetryableResult && attempts >= MAX_PAYMENT_ATTEMPTS;

  useEffect(() => {
    if (status !== 'idle') {
      headingRef.current?.focus();
    }
  }, [status, attempts]);

  return (
    <section className={`status-panel status-panel--${status}`} aria-live="polite">
      <h2 ref={headingRef} tabIndex={-1}>
        {statusTitle(status)}
      </h2>

      {status === 'idle' && (
        <p>Fill in the card details. The submit button will unlock only when every field is valid.</p>
      )}

      {status === 'processing' && (
        <div className="status-content">
          <div className="spinner" aria-hidden="true" />
          <p>Attempt {attempts} of {MAX_PAYMENT_ATTEMPTS}. Please do not close or refresh this page.</p>
        </div>
      )}

      {status === 'success' && transaction && (
        <div className="status-content">
          <p>Your payment was authorised successfully.</p>
          <dl className="status-details">
            <div>
              <dt>Transaction ID</dt>
              <dd>{transaction.id}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatMoney(transaction.amount, transaction.currency)}</dd>
            </div>
            <div>
              <dt>Completed</dt>
              <dd>{formatDateTime(transaction.updatedAt)}</dd>
            </div>
          </dl>
          <button className="secondary-button" type="button" onClick={onStartNew}>
            Make another payment
          </button>
        </div>
      )}

      {status === 'failed' && transaction && (
        <div className="status-content">
          <p>{transaction.reason ?? 'The gateway declined this payment.'}</p>
          <p className="attempt-copy">Attempt {attempts} of {MAX_PAYMENT_ATTEMPTS}</p>
          {isFinalFailure ? (
            <p className="final-message">Retry limit reached. Please start a new transaction.</p>
          ) : (
            <button
              className="primary-button"
              type="button"
              disabled={!canRetry}
              onClick={() => {
                void onRetry();
              }}
            >
              Retry same transaction
            </button>
          )}
          <button className="ghost-button" type="button" onClick={onStartNew}>
            Start over
          </button>
        </div>
      )}

      {status === 'timeout' && transaction && (
        <div className="status-content">
          <p>{transaction.reason ?? 'The gateway took too long to respond.'}</p>
          <p className="attempt-copy">Attempt {attempts} of {MAX_PAYMENT_ATTEMPTS}</p>
          {isFinalFailure ? (
            <p className="final-message">Retry limit reached. Please start a new transaction.</p>
          ) : (
            <button
              className="primary-button"
              type="button"
              disabled={!canRetry}
              onClick={() => {
                void onRetry();
              }}
            >
              Retry same transaction
            </button>
          )}
          <button className="ghost-button" type="button" onClick={onStartNew}>
            Start over
          </button>
        </div>
      )}
    </section>
  );
}
