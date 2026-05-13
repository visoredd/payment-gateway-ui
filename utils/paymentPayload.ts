import type { CardType, PaymentFormValues, PaymentPayload } from '@/types/payment';
import { stripNonDigits } from '@/utils/card';

export function createPaymentPayload(
  values: PaymentFormValues,
  cardType: Exclude<CardType, 'unknown'>,
  transactionId: string,
  attempt: number,
): PaymentPayload {
  const cardDigits = stripNonDigits(values.cardNumber);

  return {
    transactionId,
    amount: Number(values.amount),
    currency: values.currency,
    cardholderName: values.cardholderName.trim(),
    cardLast4: cardDigits.slice(-4),
    cardType,
    attempt,
  };
}
