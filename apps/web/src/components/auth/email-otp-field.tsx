"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const OTP_TIMEOUT_MS = 120_000;

interface OtpSendResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  emailSent?: boolean;
  devOtp?: string;
}

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
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendPhase, setSendPhase] = useState<"idle" | "connecting" | "waking">("idle");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const lastSentEmail = useRef("");
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  async function sendOtp() {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (sending) return;
    if (countdown > 0 && trimmed === lastSentEmail.current) return;

    setSending(true);
    setSendPhase("connecting");
    setDevOtpHint(null);
    slowTimerRef.current = setTimeout(() => setSendPhase("waking"), 6000);

    try {
      const res = await apiFetch<OtpSendResponse>("/auth/otp/send", {
        method: "POST",
        skipCsrf: true,
        timeoutMs: OTP_TIMEOUT_MS,
        body: JSON.stringify({ email: trimmed }),
      });

      lastSentEmail.current = trimmed;
      onEmailChange(trimmed);
      setOtpSent(true);
      setCountdown(60);

      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
        toast.success("Dev mode: code shown below");
      } else {
        toast.success("Code sent!", { description: `Check ${trimmed} (and spam folder)` });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setSending(false);
      setSendPhase("idle");
    }
  }

  const buttonLabel = sending
    ? sendPhase === "waking"
      ? "Waking server…"
      : "Connecting…"
    : countdown > 0
      ? `${countdown}s`
      : otpSent
        ? "Resend"
        : "Send OTP";

  return (
    <div className="space-y-4 rounded-xl border border-brand/20 bg-brand/5 p-3 sm:p-4">
      <div>
        <p className="text-sm font-medium">Email Verification</p>
        <p className="text-xs text-muted-foreground">
          We&apos;ll email a 6-digit code to verify your address
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email *</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                onEmailChange(e.target.value);
                if (e.target.value.trim().toLowerCase() !== lastSentEmail.current) {
                  setOtpSent(false);
                  setCountdown(0);
                  setDevOtpHint(null);
                }
              }}
              required
              disabled={disabled}
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto sm:min-w-[120px]"
            disabled={
              disabled ||
              sending ||
              (countdown > 0 && email.trim().toLowerCase() === lastSentEmail.current) ||
              !email.trim()
            }
            onClick={() => void sendOtp()}
          >
            {sending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : otpSent && countdown > 0 ? (
              <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
            ) : null}
            {buttonLabel}
          </Button>
        </div>
        {sending && sendPhase === "waking" && (
          <p className="text-xs text-muted-foreground">
            Free-tier server is waking up — this can take up to 2 minutes on first request.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-otp">Verification Code *</Label>
        <Input
          id="register-otp"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          disabled={disabled}
          autoComplete="one-time-code"
          className={cn(
            "text-center tracking-[0.35em] font-mono text-lg sm:text-xl sm:tracking-[0.45em]",
            otp.length === 6 && "border-brand ring-1 ring-brand/30",
          )}
        />
        {devOtpHint && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center font-mono text-base tracking-widest text-amber-800 dark:text-amber-200 sm:text-lg">
            Dev code: {devOtpHint}
          </p>
        )}
        {otpSent && !devOtpHint && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Check inbox &amp; spam — code expires in 10 minutes
          </p>
        )}
      </div>
    </div>
  );
}
