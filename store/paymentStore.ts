'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PaymentPayload, PaymentStatus, Transaction } from '@/types/payment';

interface PaymentStore {
  status: PaymentStatus;
  activePayload?: PaymentPayload;
  activeTransaction?: Transaction;
  history: Transaction[];
  selectedTransactionId?: string;
  setProcessing: (payload: PaymentPayload) => void;
  completePayment: (transaction: Transaction) => void;
  resetFlow: () => void;
  selectTransaction: (transactionId: string) => void;
  clearSelectedTransaction: () => void;
}

function findExistingTransaction(history: Transaction[], id: string): Transaction | undefined {
  return history.find((transaction) => transaction.id === id);
}

function upsertTransaction(history: Transaction[], transaction: Transaction): Transaction[] {
  const existing = findExistingTransaction(history, transaction.id);

  if (!existing) {
    return [transaction, ...history];
  }

  return history.map((item) =>
    item.id === transaction.id
      ? {
          ...item,
          ...transaction,
          timestamp: item.timestamp,
        }
      : item,
  );
}

function transactionFromPayload(payload: PaymentPayload, status: Exclude<PaymentStatus, 'idle'>, existing?: Transaction): Transaction {
  const now = new Date().toISOString();

  return {
    id: payload.transactionId,
    amount: payload.amount,
    currency: payload.currency,
    status,
    timestamp: existing?.timestamp ?? now,
    updatedAt: now,
    attempts: payload.attempt,
    cardholderName: payload.cardholderName,
    cardLast4: payload.cardLast4,
    cardType: payload.cardType,
  };
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      status: 'idle',
      history: [],
      setProcessing: (payload) => {
        const existing = findExistingTransaction(get().history, payload.transactionId);
        const transaction = transactionFromPayload(payload, 'processing', existing);

        set((state) => ({
          status: 'processing',
          activePayload: payload,
          activeTransaction: transaction,
          history: upsertTransaction(state.history, transaction),
          selectedTransactionId: transaction.id,
        }));
      },
      completePayment: (transaction) => {
        set((state) => {
          const existing = findExistingTransaction(state.history, transaction.id);
          const mergedTransaction = existing
            ? {
                ...existing,
                ...transaction,
                timestamp: existing.timestamp,
              }
            : transaction;

          return {
            status: mergedTransaction.status,
            activeTransaction: mergedTransaction,
            history: upsertTransaction(state.history, mergedTransaction),
            selectedTransactionId: mergedTransaction.id,
          };
        });
      },
      resetFlow: () => {
        set({
          status: 'idle',
          activePayload: undefined,
          activeTransaction: undefined,
          selectedTransactionId: undefined,
        });
      },
      selectTransaction: (transactionId) => {
        set({ selectedTransactionId: transactionId });
      },
      clearSelectedTransaction: () => {
        set({ selectedTransactionId: undefined });
      },
    }),
    {
      name: 'payment-gateway-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ history: state.history }),
    },
  ),
);
