"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiFetch } from "@/lib/api/client";
import { getClientApiBase } from "@/lib/api/api-base-url";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const OTP_TIMEOUT_MS = 120_000;

const OTP_LOG = "[DropMart OTP]";

interface OtpSendResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  retryAfter?: number;
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
  const [justSent, setJustSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    type: "success" | "error" | "rate-limit" | "pending";
    message: string;
  } | null>(null);
  const lastSentEmail = useRef("");
  const justSentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    return () => {
      if (justSentTimerRef.current) clearTimeout(justSentTimerRef.current);
    };
  }, []);

  function showSentState(trimmed: string) {
    lastSentEmail.current = trimmed;
    onEmailChange(trimmed);
    setOtpSent(true);
    setJustSent(true);
    setDevOtpHint(null);

    if (justSentTimerRef.current) clearTimeout(justSentTimerRef.current);
    justSentTimerRef.current = setTimeout(() => setJustSent(false), 2500);
  }

  function startCooldown(seconds: number) {
    setCountdown(Math.max(1, seconds));
  }

  async function sendOtp() {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (countdown > 0 && trimmed === lastSentEmail.current) return;
    if (inFlight) return;

    showSentState(trimmed);
    setInFlight(true);
    setSendStatus({ type: "pending", message: "Sending code to your email…" });

    const apiUrl = `${getClientApiBase()}/auth/otp/send`;
    const startedAt = performance.now();
    console.info(`${OTP_LOG} Request started`, { email: trimmed, url: apiUrl });

    try {
      const res = await apiFetch<OtpSendResponse>("/auth/otp/send", {
        method: "POST",
        skipCsrf: true,
        timeoutMs: OTP_TIMEOUT_MS,
        body: JSON.stringify({ email: trimmed }),
      });

      const elapsedMs = Math.round(performance.now() - startedAt);
      startCooldown(res.retryAfter ?? 60);

      if (res.emailSent) {
        const msg = `Email sent successfully to ${trimmed} (${elapsedMs}ms)`;
        setSendStatus({ type: "success", message: msg });
        console.info(`${OTP_LOG} SUCCESS`, { ...res, elapsedMs, email: trimmed });
        toast.success("OTP sent!", { description: `Check ${trimmed} and spam folder` });
      } else if (res.devOtp) {
        setDevOtpHint(res.devOtp);
        setSendStatus({ type: "success", message: `Dev OTP generated (${elapsedMs}ms)` });
        console.info(`${OTP_LOG} DEV SUCCESS`, { ...res, elapsedMs, email: trimmed });
        toast.success("Dev mode: code shown below");
      } else {
        const msg = res.message || "Server accepted request but email status unknown";
        setSendStatus({ type: "success", message: msg });
        console.warn(`${OTP_LOG} OK but emailSent=false`, { ...res, elapsedMs });
        toast.message(msg);
      }
    } catch (err: unknown) {
      const elapsedMs = Math.round(performance.now() - startedAt);

      if (err instanceof ApiError && err.status === 429) {
        startCooldown(err.retryAfter ?? 60);
        setOtpSent(true);
        const msg = err.message;
        setSendStatus({ type: "rate-limit", message: msg });
        console.warn(`${OTP_LOG} RATE LIMITED (429)`, {
          email: trimmed,
          retryAfter: err.retryAfter,
          elapsedMs,
          message: err.message,
        });
        toast.message(msg);
        return;
      }

      setOtpSent(false);
      setJustSent(false);
      setCountdown(0);
      const msg = err instanceof Error ? err.message : "Failed to send code";
      setSendStatus({ type: "error", message: msg });
      console.error(`${OTP_LOG} FAILED`, {
        email: trimmed,
        elapsedMs,
        error: err,
        status: err instanceof ApiError ? err.status : undefined,
      });
      toast.error(msg);
    } finally {
      setInFlight(false);
    }
  }

  const buttonLabel = justSent
    ? "Sent"
    : inFlight
      ? "Sent"
      : countdown > 0
        ? `${countdown}s`
        : otpSent
          ? "Resend"
          : "Send OTP";

  const buttonDisabled =
    disabled ||
    inFlight ||
    (countdown > 0 && email.trim().toLowerCase() === lastSentEmail.current) ||
    !email.trim();

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
                  setJustSent(false);
                  setDevOtpHint(null);
                  setSendStatus(null);
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
            disabled={buttonDisabled}
            onClick={() => void sendOtp()}
          >
            {(justSent || otpSent) && (
              <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
            )}
            {buttonLabel}
          </Button>
        </div>
        {sendStatus && (
          <p
            className={cn(
              "rounded-lg px-3 py-2 text-xs",
              sendStatus.type === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              sendStatus.type === "pending" && "bg-muted text-muted-foreground",
              sendStatus.type === "rate-limit" && "bg-amber-500/10 text-amber-800 dark:text-amber-200",
              sendStatus.type === "error" && "bg-destructive/10 text-destructive",
            )}
          >
            {sendStatus.type === "success" && "✓ "}
            {sendStatus.type === "error" && "✗ "}
            {sendStatus.type === "rate-limit" && "⏳ "}
            {sendStatus.message}
            <span className="mt-1 block text-[10px] opacity-70">
              Open browser console (F12) and filter &quot;DropMart OTP&quot; for full details.
            </span>
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
            "text-center font-mono text-lg tracking-[0.35em] sm:text-xl sm:tracking-[0.45em]",
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
            Code sent — check inbox &amp; spam (expires in 10 minutes)
          </p>
        )}
      </div>
    </div>
  );
}
