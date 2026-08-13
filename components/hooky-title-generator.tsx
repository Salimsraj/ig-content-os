"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Copy, Check } from "lucide-react";

export function HookyTitleGenerator({
  script,
  hook,
  onTitleGenerated,
}: {
  script: string;
  hook?: string;
  onTitleGenerated: (title: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  if (!script || script.trim().length < 20) return null;

  async function generateTitles() {
    setIsLoading(true);
    setError(null);
    setTitles([]);
    try {
      const res = await fetch("/api/generate-hooky-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, hook }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (data.titles && Array.isArray(data.titles)) {
        setTitles(data.titles);
        onTitleGenerated(data.titles[0]);
      } else {
        setError("Invalid response format");
      }
    } catch {
      setError("Failed to generate titles");
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={generateTitles}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        Generate 3 Hooky Titles
      </Button>

      {titles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-900 uppercase mb-2">First 3 Seconds — Pick One</p>
          {titles.map((title, idx) => (
            <div key={idx} className="bg-white p-3 rounded border border-blue-100 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-blue-900 flex-1" dir="auto">
                  {idx + 1}. {title}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(title, idx)}
                  className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Copy"
                >
                  {copied === idx ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-blue-600 mt-3">
            💡 Add as text overlay on your video (first 3 seconds). Each option emphasizes a different angle of the same benefit.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
