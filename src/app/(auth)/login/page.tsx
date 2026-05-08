"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/home");
      router.refresh();
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col px-6 pt-24 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-3xl gradient-neon flex items-center justify-center mb-8"
        >
          <Flame className="w-10 h-10 text-background" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <h1 className="text-3xl font-display font-bold text-text-primary text-center mb-2">Welcome Back</h1>
          <p className="text-text-secondary text-center mb-8">Sign in to your ZEERA account</p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-8">
            Don't have an account? <button onClick={() => router.push("/signup")} className="text-neon-blue font-medium">Sign Up</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
