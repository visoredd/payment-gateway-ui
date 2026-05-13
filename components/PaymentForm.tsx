'use client';

import type { CardType, FormErrors, PaymentFormField, PaymentFormValues } from '@/types/payment';
import { CardInput } from '@/components/CardInput';
import { FieldError } from '@/components/FieldError';

interface PaymentFormProps {
  values: PaymentFormValues;
  errors: FormErrors;
  cardType: CardType;
  isValid: boolean;
  disabled: boolean;
  isProcessing: boolean;
  onFieldChange: (field: PaymentFormField, value: string) => void;
  onFieldBlur: (field: PaymentFormField) => void;
  onSubmit: () => void;
}

export function PaymentForm({
  values,
  errors,
  cardType,
  isValid,
  disabled,
  isProcessing,
  onFieldChange,
  onFieldBlur,
  onSubmit,
}: PaymentFormProps) {
  function describedBy(field: PaymentFormField): string | undefined {
    return errors[field] ? `${field}-error` : undefined;
  }

  return (
    <form
      className="payment-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="field-group">
        <label htmlFor="cardholderName">Cardholder name</label>
        <input
          id="cardholderName"
          name="cardholderName"
          type="text"
          autoComplete="cc-name"
          placeholder="Aarav Sharma"
          value={values.cardholderName}
          disabled={disabled}
          aria-invalid={Boolean(errors.cardholderName)}
          aria-describedby={describedBy('cardholderName')}
          onChange={(event) => onFieldChange('cardholderName', event.target.value)}
          onBlur={() => onFieldBlur('cardholderName')}
        />
        <FieldError id="cardholderName-error" message={errors.cardholderName} />
      </div>

      <CardInput
        value={values.cardNumber}
        cardType={cardType}
        error={errors.cardNumber}
        disabled={disabled}
        onChange={(value) => onFieldChange('cardNumber', value)}
        onBlur={() => onFieldBlur('cardNumber')}
      />

      <div className="form-row">
        <div className="field-group">
          <label htmlFor="expiry">Expiry date</label>
          <input
            id="expiry"
            name="expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={values.expiry}
            disabled={disabled}
            aria-invalid={Boolean(errors.expiry)}
            aria-describedby={describedBy('expiry')}
            onChange={(event) => onFieldChange('expiry', event.target.value)}
            onBlur={() => onFieldBlur('expiry')}
          />
          <FieldError id="expiry-error" message={errors.expiry} />
        </div>

        <div className="field-group">
          <label htmlFor="cvv">CVV</label>
          <input
            id="cvv"
            name="cvv"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={cardType === 'amex' ? '1234' : '123'}
            value={values.cvv}
            disabled={disabled}
            aria-invalid={Boolean(errors.cvv)}
            aria-describedby={describedBy('cvv')}
            onChange={(event) => onFieldChange('cvv', event.target.value)}
            onBlur={() => onFieldBlur('cvv')}
          />
          <FieldError id="cvv-error" message={errors.cvv} />
        </div>
      </div>

      <div className="amount-row">
        <div className="field-group field-group--amount">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="1000.00"
            value={values.amount}
            disabled={disabled}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={describedBy('amount')}
            onChange={(event) => onFieldChange('amount', event.target.value)}
            onBlur={() => onFieldBlur('amount')}
          />
          <FieldError id="amount-error" message={errors.amount} />
        </div>

        <div className="field-group field-group--currency">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={values.currency}
            disabled={disabled}
            onChange={(event) => onFieldChange('currency', event.target.value)}
            onBlur={() => onFieldBlur('currency')}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <button className="primary-button" type="submit" disabled={disabled || !isValid}>
        {isProcessing ? 'Processing payment...' : 'Pay now'}
      </button>
    </form>
  );
}
