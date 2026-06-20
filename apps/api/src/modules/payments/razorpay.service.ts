import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import Razorpay from "razorpay";

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private client: Razorpay | null = null;

  private getClient() {
    if (this.client) return this.client;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }
    this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return this.client;
  }

  isConfigured() {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  getKeyId() {
    return process.env.RAZORPAY_KEY_ID ?? "";
  }

  async createOrder(params: {
    amountPaise: number;
    receipt: string;
    notes?: Record<string, string>;
  }) {
    const rz = this.getClient();
    return rz.orders.create({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    });
  }

  async createQrCode(params: {
    amountPaise: number;
    orderId: string;
    description: string;
  }) {
    const rz = this.getClient();
    return rz.qrCode.create({
      type: "upi_qr",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: params.amountPaise,
      description: params.description,
      notes: { order_id: params.orderId },
    });
  }

  async fetchPayment(paymentId: string) {
    const rz = this.getClient();
    return rz.payments.fetch(paymentId);
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;
    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn("RAZORPAY_WEBHOOK_SECRET not set — webhook rejected");
      return false;
    }
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
