"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-24 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-neon-blue" />
            </div>
          </div>
          
          <h1 className="text-3xl font-display font-bold text-text-primary text-center mb-2">New Password</h1>
          <p className="text-text-secondary text-center mb-8">Set a strong password for your account</p>

          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-neon-green/10 border border-neon-green/30 rounded-2xl p-8 text-center"
            >
              <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-4" />
              <p className="text-text-primary font-bold mb-2">Password Updated!</p>
              <p className="text-text-muted text-sm">Redirecting you to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full py-4 px-5 bg-surface rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 border border-border/50"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full py-4 px-5 bg-surface rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 border border-border/50"
                />
              </div>

              {error && (
                <p className="text-neon-red text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl gradient-neon text-background font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 mt-2"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
