"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb } from "lucide-react";

type Suggestion = { hook: string; skipRatePrediction: number; principle: string };

type ImproveResult = {
  originalHook: string;
  actualSkipRate: number;
  weakestLever: string;
  issues: string[];
  reasoning: string;
  suggestions: Suggestion[];
};

export function ReelImproveHook({ hook, skipRate }: { hook?: string; skipRate: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImproveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only offer this where the hook is actually the problem AND we have the actual script hook (not just the caption).
  if (!hook || skipRate < 30) return null;

  async function handleImprove() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/improve-hook-from-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hook, skipRate }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch {
      setError("Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-3 ml-20">
      {!result && (
        <Button type="button" size="sm" variant="outline" onClick={handleImprove} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Lightbulb className="w-4 h-4 mr-1" />}
          How do I lower this skip rate?
        </Button>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {result && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-amber-900 uppercase">
              Why this leaked — weakest lever: {result.weakestLever}
            </p>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-xs text-amber-600 hover:text-amber-800 shrink-0"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-amber-800">{result.reasoning}</p>

          {result.issues.length > 0 && (
            <ul className="space-y-1">
              {result.issues.map((issue, i) => (
                <li key={i} className="text-xs text-amber-800">• {issue}</li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-amber-900 uppercase">Use one of these next time</p>
            {result.suggestions.map((s, i) => (
              <div key={i} className="bg-white p-2 rounded border border-amber-100">
                <p className="text-sm text-amber-900 font-medium mb-1" dir="auto">{s.hook}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      s.skipRatePrediction < 30
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    ~{s.skipRatePrediction}% skip
                  </span>
                  <span className="text-xs text-amber-600">{s.principle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
