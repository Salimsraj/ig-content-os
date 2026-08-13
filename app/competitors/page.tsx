"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Hook = {
  id: string;
  account: string;
  videoUrl: string;
  hook: string;
  transcript: string;
  template: string | null;
};

type Account = {
  handle: string;
  label: string;
};

export default function CompetitorsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAccount, setActiveAccount] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/viral-hooks");
        const data = await res.json();
        setAccounts(data.accounts || []);
        setHooks(data.hooks || []);
        if (data.accounts?.length > 0 && !activeAccount) {
          setActiveAccount(data.accounts[0].label);
        }
      } catch (error) {
        console.error("Failed to fetch viral hooks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredHooks = hooks.filter((h) => h.account === activeAccount);

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 bg-white min-h-screen" dir="auto">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-semibold text-black">Creators</h1>
          <p className="text-sm text-gray-500 mt-1">
            Viral scripts & hooks from top Arabic creators — reuse them as templates
          </p>
        </div>
      </div>

      {/* Account Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {accounts.map((acct) => {
          const count = hooks.filter((h) => h.account === acct.label).length;
          return (
            <button
              key={acct.label}
              onClick={() => setActiveAccount(acct.label)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeAccount === acct.label
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              @{acct.handle} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading scripts...</div>
      ) : filteredHooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHooks.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <video
                  src={item.videoUrl}
                  controls
                  className="w-full aspect-[9/16] bg-black object-contain"
                  preload="metadata"
                />

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Hook</p>
                    <p className="text-sm text-black font-medium leading-relaxed">{item.hook}</p>
                  </div>

                  {item.template && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-xs font-medium text-blue-700 uppercase mb-1">Template</p>
                      <p className="text-sm text-blue-900 leading-relaxed">{item.template}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-black mt-auto pt-2"
                  >
                    {isExpanded ? (
                      <>
                        Hide full script <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        View full script <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {item.transcript}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No scripts transcribed yet for this account.</p>
      )}
    </div>
  );
}
