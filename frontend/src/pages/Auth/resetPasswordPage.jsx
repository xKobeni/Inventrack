import { GalleryVerticalEnd } from "lucide-react";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 to-white dark:from-background dark:to-muted/40">
      <div className="w-full max-w-md p-0 bg-white dark:bg-background rounded-2xl shadow-2xl border border-muted/30 flex flex-col overflow-hidden">
        <div className="flex flex-col items-center gap-2 px-8 pt-8 pb-4 bg-primary/5 border-b border-muted/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight">InvenTrack</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Step 2: Reset Password
          </div>
          <h2 className="text-center text-xl font-semibold mb-1">Reset Your Password</h2>
          <p className="text-center text-muted-foreground text-sm mb-2">Set a new password for your account below.</p>
        </div>
        <div className="px-8 py-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
} 