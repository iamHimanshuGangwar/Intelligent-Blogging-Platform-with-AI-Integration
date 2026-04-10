"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDeny: () => void;
}

export default function ConsentModal({
  isOpen,
  onAccept,
  onDeny,
}: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-surface-container border border-outline-variant/20 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl shadow-black/50">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface text-center mb-2">
          Welcome to AiBlog
        </h2>

        {/* Description */}
        <p className="text-sm text-on-surface-variant text-center mb-6">
          To get started, please review and accept our terms and privacy policy.
        </p>

        {/* Consent Items */}
        <div className="space-y-3 mb-6 rounded-xl bg-surface-container-low p-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 w-4 h-4 rounded cursor-pointer accent-primary"
              readOnly
            />
            <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
              I agree to the{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 w-4 h-4 rounded cursor-pointer accent-primary"
              readOnly
            />
            <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
              I understand that my data will be processed according to our policies
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 w-4 h-4 rounded cursor-pointer accent-primary"
              readOnly
            />
            <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
              I accept the Terms of Service
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onDeny}
            variant="outline"
            className="flex-1 border-outline-variant/20 text-on-surface rounded-lg font-semibold h-10"
          >
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 bg-primary text-on-primary rounded-lg font-semibold h-10 hover:bg-primary/90"
          >
            Accept & Continue
          </Button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-on-surface-variant text-center mt-4">
          You can change these settings in your dashboard settings later
        </p>
      </div>
    </div>
  );
}
