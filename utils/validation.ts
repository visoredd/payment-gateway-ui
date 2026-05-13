import type { CardType, FormErrors, PaymentFormValues } from '@/types/payment';
import { detectCardType, getCardDigitLimit, passesLuhnCheck, stripNonDigits } from '@/utils/card';

function isExpiryInFuture(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (month < 1 || month > 12) {
    return false;
  }

  const fullYear = 2000 + year;
  const lastMomentOfExpiryMonth = new Date(fullYear, month, 0, 23, 59, 59, 999);

  return lastMomentOfExpiryMonth >= new Date();
}

export function validatePaymentForm(values: PaymentFormValues): FormErrors {
  const errors: FormErrors = {};
  const name = values.cardholderName.trim();
  const digits = stripNonDigits(values.cardNumber);
  const cardType = detectCardType(digits);
  const amount = Number(values.amount);

  if (name.length < 2) {
    errors.cardholderName = 'Enter the cardholder name.';
  }

  if (cardType === 'unknown') {
    errors.cardNumber = 'Use a Visa, Mastercard, or Amex card number.';
  } else if (digits.length !== getCardDigitLimit(cardType)) {
    errors.cardNumber = `${cardType === 'amex' ? 'Amex' : 'This card'} must have ${getCardDigitLimit(cardType)} digits.`;
  } else if (!passesLuhnCheck(digits)) {
    errors.cardNumber = 'Enter a valid card number.';
  }

  if (!/^\d{2}\/\d{2}$/.test(values.expiry)) {
    errors.expiry = 'Use MM/YY format.';
  } else if (!isExpiryInFuture(values.expiry)) {
    errors.expiry = 'Expiry date cannot be in the past.';
  }

  const cvvDigits = stripNonDigits(values.cvv);
  const requiredCvvLength = cardType === 'amex' ? 4 : 3;
  if (cvvDigits.length !== requiredCvvLength) {
    errors.cvv = `CVV must be ${requiredCvvLength} digits.`;
  }

  if (values.amount.trim() === '') {
    errors.amount = 'Enter an amount.';
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  } else if (amount > 1_000_000) {
    errors.amount = 'Amount cannot exceed 1,000,000.';
  }

  return errors;
}

export function isConcreteCardType(cardType: CardType): cardType is Exclude<CardType, 'unknown'> {
  return cardType !== 'unknown';
}
