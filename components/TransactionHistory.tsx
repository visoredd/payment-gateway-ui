'use client';

import { useMemo } from 'react';
import type { Transaction } from '@/types/payment';
import { usePaymentStore } from '@/store/paymentStore';
import { cardTypeLabel } from '@/utils/card';
import { formatDateTime, formatMoney, statusLabel } from '@/utils/formatters';

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  return (
    <aside className="transaction-details" aria-label="Selected transaction details">
      <h3>Transaction details</h3>
      <dl>
        <div>
          <dt>ID</dt>
          <dd>{transaction.id}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{statusLabel(transaction.status)}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd>{formatMoney(transaction.amount, transaction.currency)}</dd>
        </div>
        <div>
          <dt>Card</dt>
          <dd>{cardTypeLabel(transaction.cardType)} ending {transaction.cardLast4}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{transaction.attempts}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(transaction.timestamp)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(transaction.updatedAt)}</dd>
        </div>
        {transaction.reason && (
          <div>
            <dt>Reason</dt>
            <dd>{transaction.reason}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
}

export function TransactionHistory() {
  const history = usePaymentStore((state) => state.history);
  const selectedTransactionId = usePaymentStore((state) => state.selectedTransactionId);
  const selectTransaction = usePaymentStore((state) => state.selectTransaction);
  const clearSelectedTransaction = usePaymentStore((state) => state.clearSelectedTransaction);

  const sortedHistory = useMemo(
    () => [...history].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)),
    [history],
  );

  const selectedTransaction = useMemo(
    () => history.find((transaction) => transaction.id === selectedTransactionId),
    [history, selectedTransactionId],
  );

  return (
    <section className="history-section" aria-labelledby="history-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Local history</p>
          <h2 id="history-heading">Transaction history</h2>
        </div>
        {selectedTransaction && (
          <button className="ghost-button" type="button" onClick={clearSelectedTransaction}>
            Clear selection
          </button>
        )}
      </div>

      {sortedHistory.length === 0 ? (
        <p className="empty-state">No transactions yet. Completed, failed, timed-out, and in-flight attempts will appear here.</p>
      ) : (
        <div className="history-layout">
          <div className="history-list" role="list">
            {sortedHistory.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                className="history-item"
                aria-pressed={transaction.id === selectedTransactionId}
                onClick={() => selectTransaction(transaction.id)}
              >
                <span>
                  <strong>{transaction.id.slice(0, 8)}</strong>
                  <small>{formatDateTime(transaction.updatedAt)}</small>
                </span>
                <span>{formatMoney(transaction.amount, transaction.currency)}</span>
                <span className={`status-pill status-pill--${transaction.status}`}>{statusLabel(transaction.status)}</span>
              </button>
            ))}
          </div>

          {selectedTransaction && <TransactionDetails transaction={selectedTransaction} />}
        </div>
      )}
    </section>
  );
}
