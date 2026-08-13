"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, RefreshCw, Loader2 } from "lucide-react";

type Levers = { contrast: number; context: number; specificity: number; proof: number; register: number };

type Evaluation = {
  score: number;
  skipRatePrediction: number;
  retentionPrediction: number;
  levers: Levers;
  weakestLever: string;
  issues: string[];
  strengths: string[];
  reasoning: string;
};

type Suggestion = {
  hook: string;
  skipRatePrediction: number;
  principle: string;
  improvement: number;
  sourceTemplate: { category: string; template: string } | null;
  sourceHook: { hook: string; score: number } | null;
};

type Regenerated = {
  originalSkipRate: number;
  weakestLever: string;
  suggestions: Suggestion[];
};

function skipTone(rate: number) {
  if (rate < 30) return "text-green-700 bg-green-50 border-green-200";
  if (rate < 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
  return "text-red-700 bg-red-50 border-red-200";
}

export function HookEvaluator({
  hook,
  script,
  onUseSuggestion,
}: {
  hook: string;
  script?: string;
  onUseSuggestion: (hook: string) => void;
}) {
  const [busy, setBusy] = useState<"eval" | "regen" | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [regenerated, setRegenerated] = useState<Regenerated | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coreIdea, setCoreIdea] = useState<string>("");

  async function run(kind: "eval" | "regen") {
    if (!hook.trim()) return;
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(kind === "eval" ? "/api/evaluate-hook" : "/api/regenerate-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook,
          coreIdea: kind === "regen" ? coreIdea : undefined,
          script: kind === "regen" ? script : undefined
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (kind === "eval") {
        setEvaluation(data.evaluation);
        setRegenerated(null);
      } else {
        setRegenerated(data);
        setEvaluation(null);
      }
    } catch {
      setError("Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-xs text-gray-600">
          <label className="font-medium">Core idea (optional)</label>
          <p className="text-gray-500 mt-0.5">What's the unchanging essence? e.g., "17-year-old built fitness app and sold for $50M"</p>
        </div>
        <input
          type="text"
          value={coreIdea}
          onChange={(e) => setCoreIdea(e.target.value)}
          placeholder="Describe the core message..."
          className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:border-gray-400 focus:outline-none"
          dir="auto"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => run("eval")}
          disabled={busy !== null || !hook.trim()}
        >
          {busy === "eval" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
          Estimate Skip Rate
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => run("regen")}
          disabled={busy !== null || !hook.trim()}
        >
          {busy === "regen" ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          Regenerate Hook
        </Button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {evaluation && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Predicted performance</h4>
            <button
              type="button"
              onClick={() => setEvaluation(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded border border-gray-200">
              <p className="text-[10px] text-gray-500 font-medium uppercase">Score</p>
              <p className="text-xl font-bold text-gray-900">{evaluation.score}</p>
            </div>
            <div className={`p-2 rounded border ${skipTone(evaluation.skipRatePrediction)}`}>
              <p className="text-[10px] font-medium uppercase opacity-80">Skip rate</p>
              <p className="text-xl font-bold">{evaluation.skipRatePrediction}%</p>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <p className="text-[10px] text-gray-500 font-medium uppercase">Retention</p>
              <p className="text-xl font-bold text-gray-900">{evaluation.retentionPrediction}%</p>
            </div>
          </div>

          <p
            className={`text-xs font-medium ${
              evaluation.skipRatePrediction < 30 ? "text-green-700" : "text-red-700"
            }`}
          >
            {evaluation.skipRatePrediction < 30
              ? "Under your 30% target — good to post."
              : `Above your 30% target. Weakest lever: ${evaluation.weakestLever}.`}
          </p>

          <div className="grid grid-cols-5 gap-1">
            {Object.entries(evaluation.levers).map(([name, value]) => (
              <div key={name} className="text-center">
                <div className="h-12 bg-white border border-gray-200 rounded flex items-end overflow-hidden">
                  <div
                    className={`w-full ${value >= 7 ? "bg-green-400" : value >= 4 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ height: `${value * 10}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-1 capitalize">{name}</p>
                <p className="text-[10px] font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-700">{evaluation.reasoning}</p>

          {evaluation.strengths.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-green-700 uppercase mb-1">Working</p>
              <ul className="space-y-0.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-700">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.issues.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-red-700 uppercase mb-1">Fix</p>
              <ul className="space-y-0.5">
                {evaluation.issues.map((s, i) => (
                  <li key={i} className="text-xs text-gray-700">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {regenerated && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Stronger hooks — current: {regenerated.originalSkipRate}% skip
            </h4>
            <button
              type="button"
              onClick={() => setRegenerated(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {(() => {
              // Only the FIRST match gets the badge — otherwise every
              // suggestion whose principle happens to mention the weakest
              // lever gets marked "BEST", which defeats the point of it.
              const bestIndex = regenerated.suggestions.findIndex((s) =>
                s.principle.toLowerCase().includes(regenerated.weakestLever.toLowerCase())
              );
              return regenerated.suggestions.map((s, i) => {
                const isRecommended = i === bestIndex;
                return (
                  <div key={i} className={`bg-white p-3 rounded border ${isRecommended ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-gray-900 font-medium flex-1" dir="auto">{s.hook}</p>
                      {isRecommended && (
                        <span className="text-xs font-bold text-blue-700 px-2 py-1 bg-blue-100 rounded ml-2 flex-shrink-0">
                          ⭐ BEST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${skipTone(s.skipRatePrediction)}`}>
                        ~{s.skipRatePrediction}% skip
                      </span>
                      {s.improvement > 0 && (
                        <span className="text-xs font-semibold text-green-700">
                          −{s.improvement} pts vs current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{s.principle}</p>

                    {(s.sourceTemplate || s.sourceHook) && (
                      <div className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 rounded p-1.5 mb-2 space-y-1">
                        {s.sourceTemplate && (
                          <p>
                            <span className="font-semibold">Inspired by [{s.sourceTemplate.category}]:</span>{" "}
                            "{s.sourceTemplate.template}"
                          </p>
                        )}
                        {s.sourceHook && (
                          <p>
                            <span className="font-semibold">Register match (score {s.sourceHook.score}):</span>{" "}
                            <span dir="auto">"{s.sourceHook.hook}"</span>
                          </p>
                        )}
                      </div>
                    )}

                    <Button type="button" size="sm" variant="outline" onClick={() => onUseSuggestion(s.hook)}>
                      Use this
                    </Button>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
