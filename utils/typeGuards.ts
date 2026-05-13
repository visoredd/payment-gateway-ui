import type { CardType, Currency, PaymentPayload, PaymentResponse } from '@/types/payment';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCurrency(value: unknown): value is Currency {
  return value === 'INR' || value === 'USD';
}

function isConcreteCardType(value: unknown): value is Exclude<CardType, 'unknown'> {
  return value === 'visa' || value === 'mastercard' || value === 'amex';
}

export function isPaymentPayload(value: unknown): value is PaymentPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.transactionId === 'string' &&
    value.transactionId.length > 0 &&
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount) &&
    value.amount > 0 &&
    isCurrency(value.currency) &&
    typeof value.cardholderName === 'string' &&
    value.cardholderName.trim().length > 0 &&
    typeof value.cardLast4 === 'string' &&
    /^\d{4}$/.test(value.cardLast4) &&
    isConcreteCardType(value.cardType) &&
    typeof value.attempt === 'number' &&
    Number.isInteger(value.attempt) &&
    value.attempt >= 1
  );
}

export function isPaymentResponse(value: unknown): value is PaymentResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (value.status === 'success') {
    return typeof value.transactionId === 'string' && typeof value.message === 'string';
  }

  if (value.status === 'failed') {
    return typeof value.transactionId === 'string' && typeof value.reason === 'string';
  }

  return false;
}
