import type { CardType, PaymentFormValues } from '@/types/payment';
import { cardTypeLabel } from '@/utils/card';

interface CardPreviewProps {
  values: PaymentFormValues;
  cardType: CardType;
}

export function CardPreview({ values, cardType }: CardPreviewProps) {
  const displayNumber = values.cardNumber || '•••• •••• •••• ••••';
  const displayName = values.cardholderName.trim() || 'YOUR NAME';
  const displayExpiry = values.expiry || 'MM/YY';

  return (
    <section className="card-preview" aria-label="Live card preview">
      <div className="card-preview__topline">
        <span>Payment Card</span>
        <span className={`card-badge card-badge--${cardType}`}>{cardTypeLabel(cardType)}</span>
      </div>
      <div className="card-preview__number" aria-label="Preview card number">
        {displayNumber}
      </div>
      <div className="card-preview__footer">
        <div>
          <span className="card-preview__label">Cardholder</span>
          <strong>{displayName.toUpperCase()}</strong>
        </div>
        <div>
          <span className="card-preview__label">Expires</span>
          <strong>{displayExpiry}</strong>
        </div>
      </div>
    </section>
  );
}
