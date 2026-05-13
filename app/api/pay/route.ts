import type { PaymentFailureResponse, PaymentSuccessResponse } from '@/types/payment';
import { isPaymentPayload } from '@/utils/typeGuards';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => undefined);

  if (!isPaymentPayload(body)) {
    return Response.json(
      {
        status: 'failed',
        transactionId: 'unknown',
        reason: 'Invalid payment payload.',
      } satisfies PaymentFailureResponse,
      { status: 400 },
    );
  }

  const roll = Math.random();

  if (roll < 0.6) {
    return Response.json({
      status: 'success',
      transactionId: body.transactionId,
      message: 'Payment authorised.',
    } satisfies PaymentSuccessResponse);
  }

  if (roll < 0.85) {
    const failureReasons = ['Insufficient funds', 'Issuer declined the payment', 'Card limit exceeded'];
    const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)] ?? 'Payment declined';

    return Response.json({
      status: 'failed',
      transactionId: body.transactionId,
      reason,
    } satisfies PaymentFailureResponse);
  }

  await sleep(8000);

  return Response.json({
    status: 'failed',
    transactionId: body.transactionId,
    reason: 'Gateway response exceeded the expected time window.',
  } satisfies PaymentFailureResponse);
}
