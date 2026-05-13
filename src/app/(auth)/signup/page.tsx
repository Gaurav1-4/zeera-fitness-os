"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-20 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex justify-center mb-6">
            <Flame className="w-12 h-12 text-neon-green" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-text-primary text-center mb-2">
            {success ? "Check Your Mail" : "Create Account"}
          </h1>
          <p className="text-text-secondary text-center mb-8">
            {success ? "We've sent a verification link to your email. Please verify to continue." : "Join ZEERA to transform your fitness"}
          </p>

          {success ? (
            <div className="space-y-6">
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-2xl p-6 text-center">
                <p className="text-text-primary text-sm font-medium mb-2">Verification Email Sent!</p>
                <p className="text-text-muted text-xs">Once verified, you'll be able to log in and start your journey.</p>
              </div>
              <button 
                onClick={() => router.push("/login")}
                className="w-full py-4 rounded-xl gradient-neon text-background font-bold active:scale-[0.98] transition-transform"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full py-4 px-5 bg-surface rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 border border-border/50"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-4 px-5 bg-surface rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 border border-border/50"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="w-full py-4 rounded-xl bg-neon-blue text-background font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 mt-2"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-border/50" />
            <span className="text-text-muted text-xs font-medium uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-border/50" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-xl bg-surface border border-border flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-text-primary font-medium">Continue with Google</span>
          </button>

          <p className="text-center text-text-secondary text-sm mt-8">
            Already have an account? <button onClick={() => router.push("/login")} className="text-neon-green font-medium">Log In</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
