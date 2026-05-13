'use client';

import { useMemo, useState } from 'react';
import type { FormErrors, PaymentFormField, PaymentFormValues } from '@/types/payment';
import { detectCardType, formatAmountInput, formatCardNumber, formatCvv, formatExpiry } from '@/utils/card';
import { validatePaymentForm } from '@/utils/validation';

const initialValues: PaymentFormValues = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  amount: '',
  currency: 'INR',
};

type TouchedFields = Partial<Record<PaymentFormField, boolean>>;

export function usePaymentForm() {
  const [values, setValues] = useState<PaymentFormValues>(initialValues);
  const [touched, setTouched] = useState<TouchedFields>({});

  const cardType = useMemo(() => detectCardType(values.cardNumber), [values.cardNumber]);
  const allErrors = useMemo(() => validatePaymentForm(values), [values]);
  const isValid = Object.keys(allErrors).length === 0;

  const visibleErrors = useMemo<FormErrors>(() => {
    const nextErrors: FormErrors = {};

    for (const field of Object.keys(allErrors) as PaymentFormField[]) {
      const fieldValue = values[field];
      const hasUserInteracted = touched[field] || String(fieldValue).trim().length > 0;

      if (hasUserInteracted) {
        nextErrors[field] = allErrors[field];
      }
    }

    return nextErrors;
  }, [allErrors, touched, values]);

  function updateField(field: PaymentFormField, nextValue: string): void {
    setValues((currentValues) => {
      const nextValues = { ...currentValues };

      switch (field) {
        case 'cardNumber': {
          const formattedCard = formatCardNumber(nextValue);
          const nextCardType = detectCardType(formattedCard);
          nextValues.cardNumber = formattedCard;
          nextValues.cvv = formatCvv(currentValues.cvv, nextCardType);
          break;
        }
        case 'expiry':
          nextValues.expiry = formatExpiry(nextValue);
          break;
        case 'cvv':
          nextValues.cvv = formatCvv(nextValue, detectCardType(currentValues.cardNumber));
          break;
        case 'amount':
          nextValues.amount = formatAmountInput(nextValue);
          break;
        case 'currency':
          nextValues.currency = nextValue === 'USD' ? 'USD' : 'INR';
          break;
        case 'cardholderName':
          nextValues.cardholderName = nextValue;
          break;
      }

      return nextValues;
    });

    setTouched((currentTouched) => ({ ...currentTouched, [field]: true }));
  }

  function blurField(field: PaymentFormField): void {
    setTouched((currentTouched) => ({ ...currentTouched, [field]: true }));
  }

  function markAllTouched(): void {
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
      amount: true,
      currency: true,
    });
  }

  function reset(): void {
    setValues(initialValues);
    setTouched({});
  }

  return {
    values,
    errors: visibleErrors,
    allErrors,
    cardType,
    isValid,
    updateField,
    blurField,
    markAllTouched,
    reset,
  };
}
