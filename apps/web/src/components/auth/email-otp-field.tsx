"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface EmailOtpFieldProps {
  email: string;
  otp: string;
  onEmailChange: (email: string) => void;
  onOtpChange: (otp: string) => void;
  disabled?: boolean;
}

export function EmailOtpField({
  email,
  otp,
  onEmailChange,
  onOtpChange,
  disabled,
}: EmailOtpFieldProps) {
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function sendOtp() {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }

    setSending(true);
    try {
      await apiFetch("/auth/otp/send", {
        method: "POST",
        skipCsrf: true,
        body: JSON.stringify({ email: trimmed }),
      });
      setOtpSent(true);
      setCountdown(60);
      onEmailChange(trimmed);
      toast.success("Verification code sent", { description: `Check ${trimmed}` });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand/20 bg-brand/5 p-4">
      <div>
        <p className="text-sm font-medium">Email Verification</p>
        <p className="text-xs text-muted-foreground">We&apos;ll send a 6-digit code to verify your email</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email *</Label>
        <div className="flex gap-2">
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              onEmailChange(e.target.value);
              setOtpSent(false);
            }}
            required
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={disabled || sending || countdown > 0 || !email.trim()}
            onClick={sendOtp}
          >
            {sending ? "Sending..." : countdown > 0 ? `${countdown}s` : otpSent ? "Resend" : "Send OTP"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-otp">Verification Code *</Label>
        <Input
          id="register-otp"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          disabled={disabled}
          className={cn("tracking-[0.3em] font-mono text-lg", otp.length === 6 && "border-brand")}
        />
        {otpSent && (
          <p className="text-xs text-emerald-600">Code sent — expires in 10 minutes</p>
        )}
      </div>
    </div>
  );
}
