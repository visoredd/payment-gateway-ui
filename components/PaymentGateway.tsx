'use client';

import { CardPreview } from '@/components/CardPreview';
import { PaymentForm } from '@/components/PaymentForm';
import { StatusScreen } from '@/components/StatusScreen';
import { TransactionHistory } from '@/components/TransactionHistory';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { usePaymentStore } from '@/store/paymentStore';
import { createPaymentPayload } from '@/utils/paymentPayload';
import { isConcreteCardType } from '@/utils/validation';

export function PaymentGateway() {
  const form = usePaymentForm();
  const status = usePaymentStore((state) => state.status);
  const activeTransaction = usePaymentStore((state) => state.activeTransaction);
  const { executePayment, retryPayment, resetFlow, canRetry } = usePaymentFlow();

  const formLocked = status !== 'idle';
  const isProcessing = status === 'processing';

  function handleSubmit(): void {
    form.markAllTouched();

    if (!form.isValid || formLocked || !isConcreteCardType(form.cardType)) {
      return;
    }

    const payload = createPaymentPayload(form.values, form.cardType, crypto.randomUUID(), 1);
    void executePayment(payload);
  }

  function handleStartNew(): void {
    resetFlow();
    form.reset();
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Mock payment gateway</p>
        <h1>Secure checkout simulation</h1>
        <p>
          A Next.js App Router payment flow with real-time validation, retry-safe transaction IDs,
          local transaction history, and a simulated gateway route.
        </p>
      </header>

      <main>
        <div className="gateway-grid">
          <section className="panel" aria-labelledby="payment-form-heading">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Step 1</p>
                <h2 id="payment-form-heading">Payment details</h2>
              </div>
            </div>
            <PaymentForm
              values={form.values}
              errors={form.errors}
              cardType={form.cardType}
              isValid={form.isValid}
              disabled={formLocked}
              isProcessing={isProcessing}
              onFieldChange={form.updateField}
              onFieldBlur={form.blurField}
              onSubmit={handleSubmit}
            />
          </section>

          <aside className="side-stack" aria-label="Payment preview and status">
            <CardPreview values={form.values} cardType={form.cardType} />
            <StatusScreen
              status={status}
              transaction={activeTransaction}
              canRetry={canRetry}
              onRetry={retryPayment}
              onStartNew={handleStartNew}
            />
          </aside>
        </div>

        <TransactionHistory />
      </main>
    </div>
  );
}
