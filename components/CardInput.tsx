import type { CardType } from '@/types/payment';
import { cardTypeLabel } from '@/utils/card';
import { FieldError } from '@/components/FieldError';

interface CardInputProps {
  value: string;
  cardType: CardType;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function CardInput({ value, cardType, error, disabled, onChange, onBlur }: CardInputProps) {
  const errorId = 'cardNumber-error';

  return (
    <div className="field-group">
      <label htmlFor="cardNumber">Card number</label>
      <div className="card-input-shell">
        <input
          id="cardNumber"
          name="cardNumber"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <span className={`card-badge card-badge--${cardType}`} aria-live="polite">
          {cardTypeLabel(cardType)}
        </span>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
