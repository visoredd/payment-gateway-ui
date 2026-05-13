import type { CardType } from '@/types/payment';

export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardType(value: string): CardType {
  const digits = stripNonDigits(value);

  if (/^4/.test(digits)) {
    return 'visa';
  }

  if (/^3[47]/.test(digits)) {
    return 'amex';
  }

  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));

  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return 'mastercard';
  }

  return 'unknown';
}

export function getCardDigitLimit(cardType: CardType): number {
  return cardType === 'amex' ? 15 : 16;
}

export function formatCardNumber(value: string): string {
  const rawDigits = stripNonDigits(value);
  const detectedType = detectCardType(rawDigits);
  const digits = rawDigits.slice(0, getCardDigitLimit(detectedType));
  const chunks = digits.match(/.{1,4}/g);

  return chunks ? chunks.join(' ') : '';
}

export function formatExpiry(value: string): string {
  const digits = stripNonDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(value: string, cardType: CardType): string {
  const maxLength = cardType === 'amex' ? 4 : 3;
  return stripNonDigits(value).slice(0, maxLength);
}

export function formatAmountInput(value: string): string {
  const sanitized = value.replace(/[^\d.]/g, '');
  const [whole = '', ...decimalParts] = sanitized.split('.');
  const decimal = decimalParts.join('').slice(0, 2);

  if (sanitized.includes('.')) {
    return `${whole}.${decimal}`;
  }

  return whole;
}

export function cardTypeLabel(cardType: CardType): string {
  switch (cardType) {
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'Mastercard';
    case 'amex':
      return 'Amex';
    default:
      return 'Card';
  }
}

export function passesLuhnCheck(value: string): boolean {
  const digits = stripNonDigits(value);

  if (digits.length < 12) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
