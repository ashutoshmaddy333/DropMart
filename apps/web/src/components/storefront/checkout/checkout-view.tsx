"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/shared/icon";
import { useCartStore } from "@/modules/cart/store/cart-store";
import { useAppSelector } from "@/store/hooks";
import { apiFetch, ApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  paymentMode: string;
  razorpayKeyId?: string;
  razorpayOrderId?: string;
  amountPaise?: number;
  currency?: string;
  qrCodeImageUrl?: string;
  customer?: { name: string; email: string; phone: string | null };
  status?: string;
  total?: number;
}

export function CheckoutView() {
  const router = useRouter();
  const { token } = useAppSelector((s) => s.auth);
  const { items, subtotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"razorpay_checkout" | "razorpay_qr" | "cod">("razorpay_checkout");
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [serviceable, setServiceable] = useState<boolean | null>(null);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });

  const shipping = subtotal() >= 999 ? 0 : 49;
  const total = subtotal() + shipping;

  const checkPincode = () => {
    setServiceable(pincode.length === 6 && /^\d{6}$/.test(pincode));
    setAddress((a) => ({ ...a, pincode }));
  };

  function loadRazorpayScript() {
    return new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  }

  async function openRazorpayCheckout(res: CheckoutResponse) {
    await loadRazorpayScript();
    if (!window.Razorpay || !res.razorpayKeyId || !res.razorpayOrderId) {
      throw new Error("Razorpay checkout could not start. Try Cash on Delivery or refresh and retry.");
    }

    const rzp = new window.Razorpay({
      key: res.razorpayKeyId,
      amount: res.amountPaise,
      currency: res.currency ?? "INR",
      name: "DropMart",
      description: `Order ${res.orderNumber}`,
      order_id: res.razorpayOrderId,
      prefill: {
        name: res.customer?.name ?? address.name,
        email: res.customer?.email,
        contact: res.customer?.phone ?? address.phone,
      },
      theme: { color: "#10b981" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await apiFetch("/payments/verify", {
            method: "POST",
            token,
            body: JSON.stringify({
              orderId: res.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          clearCart();
          toast.success("Payment successful!", { description: `Order ${res.orderNumber} confirmed` });
          router.push(`/account/orders/${res.orderId}`);
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => toast.info("Payment cancelled"),
      },
    });
    rzp.open();
  }

  async function handlePay() {
    if (!token) {
      toast.error("Please login to checkout");
      router.push("/login?redirect=/checkout");
      return;
    }
    const deliveryPincode = address.pincode || pincode;
    if (!address.name || !address.phone || !address.line1 || !address.city || !deliveryPincode) {
      toast.error("Please fill delivery address (including pincode)");
      return;
    }
    if (deliveryPincode.length !== 6 || !/^\d{6}$/.test(deliveryPincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setQrImage(null);
    try {
      const res = await apiFetch<CheckoutResponse>("/payments/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            variant: i.variant,
          })),
          address: { ...address, pincode: deliveryPincode },
          paymentMode: paymentMethod,
        }),
      });

      if (res.paymentMode === "cod") {
        clearCart();
        toast.success("Order placed!", { description: `Order ${res.orderNumber} — pay on delivery` });
        router.push(`/account/orders/${res.orderId}`);
        return;
      }

      if (res.paymentMode === "razorpay_qr" && res.qrCodeImageUrl) {
        setQrImage(res.qrCodeImageUrl);
        toast.success("Scan UPI QR to pay", { description: `Order ${res.orderNumber} — waiting for payment` });
        return;
      }

      await openRazorpayCheckout(res);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("Session expired — please log in again and retry checkout");
        router.push("/login?redirect=/checkout");
        return;
      }
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty. Add items before checkout.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Delivery Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Arjun Kumar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} placeholder="House no, Street, Area" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Mumbai" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <div className="flex gap-2">
                <Input
                  id="pincode"
                  placeholder="400001"
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPincode(value);
                    setAddress((a) => ({ ...a, pincode: value }));
                    setServiceable(null);
                  }}
                  maxLength={6}
                />
                <Button variant="outline" type="button" onClick={checkPincode}>Check</Button>
              </div>
              {serviceable === true && <p className="text-xs text-emerald-600">✓ Delivery available</p>}
              {serviceable === false && <p className="text-xs text-red-600">Delivery not available to this pincode</p>}
            </div>
          </div>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: "razorpay_checkout" as const, label: "UPI / Card / Netbanking", desc: "Razorpay Checkout (Blinkit-style)" },
              { id: "razorpay_qr" as const, label: "UPI QR Code", desc: "Dynamic QR — scan & pay exact amount" },
              { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when delivered" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all",
                  paymentMethod === method.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex-1">
                  <p className="font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.desc}</p>
                </div>
                <div className={cn("h-4 w-4 rounded-full border-2", paymentMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground")} />
              </button>
            ))}
          </div>
        </section>

        {qrImage && (
          <section className="rounded-xl border border-brand/30 bg-brand/5 p-6 text-center">
            <h3 className="mb-2 font-semibold">Scan to Pay via UPI</h3>
            <p className="mb-4 text-sm text-muted-foreground">Amount: {formatCurrency(total)} — payment confirms automatically via webhook</p>
            <Image src={qrImage} alt="UPI QR Code" width={240} height={240} className="mx-auto rounded-lg border" unoptimized />
          </section>
        )}
      </div>

      <div className="h-fit rounded-xl border p-6">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border">
                <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1 text-sm">
                <p className="line-clamp-1 font-medium">{item.name}</p>
                <p className="text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button
          className="mt-6 w-full"
          size="lg"
          disabled={loading}
          onClick={handlePay}
        >
          <Icon name="shield-check" size={18} className="mr-2 invert dark:invert" />
          {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Icon name="lock" size={12} />
          Secured by Razorpay · HMAC verified webhooks
        </p>
      </div>
    </div>
  );
}
