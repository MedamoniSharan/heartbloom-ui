export {};

declare global {
  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayConstructorOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name?: string;
    description?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    handler: (response: RazorpaySuccessResponse) => void;
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
  }

  class Razorpay {
    constructor(options: RazorpayConstructorOptions);
    open(): void;
  }

  interface Window {
    Razorpay: typeof Razorpay;
  }
}
