"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Send, Sparkles, User, Dumbbell, Utensils } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function CoachScreen() {
  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({ api: "/api/chat" }),
  });
  const isLoading = status === "submitted" || status === "streaming";
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: any, customData?: any) => {
    if (e?.preventDefault) e.preventDefault();
    const msg = customData?.data?.message || input;
    if (!msg.trim()) return;
    sendMessage({ text: msg });
    if (!customData?.data?.message) {
      setInput("");
    }
  };
  
  const { user, streak, meals } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate today's macros from local store for the Welcome State
  const todayMeals = meals.filter((m) => {
    const today = new Date().toISOString().split("T")[0];
    return m.date.startsWith(today);
  });
  
  const currentCalories = todayMeals.reduce((sum, m) => sum + (m.foodItem.calories * m.quantity), 0);
  const currentProtein = todayMeals.reduce((sum, m) => sum + (m.foodItem.protein * m.quantity), 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestActions = [
    "What should I eat tonight?",
    "Review my progress",
    "How can I hit my protein target?",
    "Generate tomorrow's workout",
  ];

  const handleSuggestionClick = (action: string) => {
    handleSubmit(new Event('submit') as any, { data: { message: action }});
    // For a cleaner implementation, we could simulate an event or set the input, 
    // but the simplest is to invoke handleSubmit with synthetic event.
    // However, useChat allows sending messages via `append`
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">FitCoach AI</h1>
            <p className="text-xs text-text-muted">Always online</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full space-y-8"
          >
            {/* Welcome Dashboard */}
            <div className="w-full bg-surface rounded-3xl p-6 border border-border/50 shadow-xl space-y-6">
              <h2 className="text-2xl font-bold text-text-primary">Good Evening, {user.name || "Gaurav"}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-2xl p-4 border border-border/50 flex flex-col items-center justify-center">
                  <Flame className="w-6 h-6 text-neon-orange mb-2" />
                  <span className="text-sm text-text-muted">Current Streak</span>
                  <span className="text-xl font-bold text-text-primary">{streak} Days</span>
                </div>
                
                <div className="bg-background rounded-2xl p-4 border border-border/50 flex flex-col items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-neon-blue mb-2" />
                  <span className="text-sm text-text-muted">Today's Workout</span>
                  <span className="text-xl font-bold text-text-primary">Push Day</span>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-4 h-4 text-neon-green" />
                  <span className="text-sm font-bold text-text-primary">Nutrition</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">Calories</span>
                      <span className="text-text-primary font-medium">{Math.round(currentCalories)} / {user.calorieTarget}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neon-green" 
                        style={{ width: `${Math.min((currentCalories / (user.calorieTarget || 2000)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-muted">Protein</span>
                      <span className="text-text-primary font-medium">{Math.round(currentProtein)}g / {user.proteinTarget}g</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-lighter rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neon-purple" 
                        style={{ width: `${Math.min((currentProtein / (user.proteinTarget || 150)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {suggestActions.map((action, i) => (
                <button
                  key={i}
                  // We use a hack here to set the input value instead since append isn't available from useChat in this context easily without destructuring it
                  onClick={() => {
                    const fakeEvent = { target: { value: action } } as any;
                    handleInputChange(fakeEvent);
                  }}
                  className="px-4 py-2 bg-surface border border-border/50 rounded-full text-sm text-text-secondary hover:text-neon-green hover:border-neon-green/50 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    m.role === "user" 
                      ? "bg-neon-green text-black rounded-tr-sm" 
                      : "bg-surface border border-border/50 text-text-primary rounded-tl-sm whitespace-pre-wrap"
                  }`}
                >
                  {m.parts.filter(p => p.type === 'text').map(p => (p as any).text).join('')}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-surface border border-border/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-24 left-0 w-full px-6 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-4 pointer-events-none">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-md mx-auto pointer-events-auto"
        >
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask your coach anything..."
              className="w-full bg-surface border border-border focus:border-neon-green/50 rounded-full pl-6 pr-14 py-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-neon-green/50 transition-all shadow-lg shadow-black/20"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 w-10 h-10 bg-neon-green text-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-surface-lighter disabled:text-text-muted transition-colors active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
