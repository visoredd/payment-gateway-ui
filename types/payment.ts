export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout';
export type TransactionStatus = Exclude<PaymentStatus, 'idle'>;
export type Currency = 'INR' | 'USD';
export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

export type PaymentFormField = keyof PaymentFormValues;
export type FormErrors = Partial<Record<PaymentFormField, string>>;

export interface PaymentPayload {
  transactionId: string;
  amount: number;
  currency: Currency;
  cardholderName: string;
  cardLast4: string;
  cardType: Exclude<CardType, 'unknown'>;
  attempt: number;
}

export interface PaymentSuccessResponse {
  status: 'success';
  transactionId: string;
  message: string;
}

export interface PaymentFailureResponse {
  status: 'failed';
  transactionId: string;
  reason: string;
}

export type PaymentResponse = PaymentSuccessResponse | PaymentFailureResponse;

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  timestamp: string;
  updatedAt: string;
  attempts: number;
  cardholderName: string;
  cardLast4: string;
  cardType: Exclude<CardType, 'unknown'>;
  reason?: string;
}
