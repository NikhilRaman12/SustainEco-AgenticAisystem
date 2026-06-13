import React, { useState } from "react";
import { Cpu, Terminal, CornerDownRight } from "lucide-react";
import { McpLog } from "../types";

interface Props {
  logs: McpLog[];
}

export default function McpLogsPane({ logs }: Props) {
  const [selectedLog, setSelectedLog] = useState<number | null>(0);

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-xl h-[400px]">
        <Terminal className="w-10 h-10 text-stone-300 mb-2" />
        <p className="text-sm text-stone-550 font-semibold font-sans">No live telemetry actions logged in this session.</p>
        <p className="text-xs text-stone-400 mt-1 font-sans">Boot an active bio-intelligence strategy simulation to capture satellite and ground sensor feeds.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-900 text-stone-200 rounded-xl p-5 border border-stone-800 h-[600px] overflow-hidden shadow-xl font-mono">
      
      {/* Logs list panel */}
      <div className="md:col-span-1 border-r border-stone-800/80 pr-4 overflow-y-auto flex flex-col h-full">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-800">
          <Cpu className="w-5 h-5 text-emerald-450" />
          <h4 className="text-xs font-bold text-stone-400 tracking-wide uppercase font-sans">Telemetry Connectors</h4>
        </div>

        <div className="space-y-2 flex-1">
          {logs.map((log, idx) => {
            const isSelected = selectedLog === idx;
            const cleanedServerName = log.server
              .replace("Server", "Engine API")
              .replace("Soil", "Soil Chemistry")
              .replace("Weather", "NASA Climatology")
              .replace("Research", "Scientific Library")
              .replace("Carbon", "ESG Carbon Audit")
              .replace("Biodiversity", "Flora/Fauna Index");

            return (
              <div
                key={idx}
                onClick={() => setSelectedLog(idx)}
                className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500/50 text-white"
                    : "bg-stone-950 hover:bg-stone-850 border-stone-800 text-stone-400"
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1 font-sans">
                  <span className={isSelected ? "text-emerald-400 font-extrabold" : "text-stone-300 font-semibold"}>
                    {cleanedServerName}
                  </span>
                  <span className="text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-stone-800 text-emerald-500 uppercase">
                    Secured
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] truncate">
                  <CornerDownRight className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                  <span className="font-semibold text-emerald-250">{log.tool}()</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payload Inspect panel */}
      <div className="md:col-span-2 pl-2 overflow-y-auto flex flex-col h-full font-sans">
        {selectedLog !== null && logs[selectedLog] ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800 text-xs text-stone-400">
              <span>INSPECTING INTEGRATION CONNECTOR:</span>
              <span className="text-emerald-400 font-extrabold font-mono">
                {logs[selectedLog].server
                  .replace("Server", "Engine API")
                  .replace("Soil", "Soil Chemistry")
                  .replace("Weather", "NASA Climatology")
                  .replace("Research", "Scientific Library")
                  .replace("Carbon", "ESG Carbon Audit")
                  .replace("Biodiversity", "Flora/Fauna Index")}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {/* RPC Command Line */}
              <div className="bg-stone-950 border border-stone-800 rounded p-3 text-xs">
                <div className="text-stone-450 font-bold mb-2 uppercase tracking-wide text-[10px]">SECURE ENDPOINT METRIC REQUEST</div>
                <div className="flex items-center gap-2 bg-stone-900 p-2 rounded text-emerald-300 overflow-x-auto select-all font-mono">
                  <span>sustainai.telemetry.{logs[selectedLog].tool}({Object.keys(logs[selectedLog].args || {}).join(", ")})</span>
                </div>
              </div>

              {/* Arguments JSON */}
              <div className="bg-stone-950 border border-stone-800 rounded p-3 text-xs">
                <div className="text-stone-450 font-bold mb-2 uppercase tracking-wide text-[10px]">PARAMETERS RETRIEVED / SUBMITTED</div>
                <pre className="text-stone-300 p-2.5 bg-stone-900 rounded overflow-x-auto text-[10.5px] font-mono">
                  {JSON.stringify(logs[selectedLog].args, null, 2)}
                </pre>
              </div>

              {/* Result JSON */}
              <div className="bg-stone-950 border border-stone-800 rounded p-3 text-xs">
                <div className="text-emerald-400 font-bold mb-2 uppercase tracking-wide text-[10px]">ECOLOGICAL INTELLIGENCE VERIFIED DATABASE RESPONSE FEED</div>
                <pre className="text-emerald-200 p-2.5 bg-stone-900 rounded overflow-x-auto text-[10.5px] font-mono">
                  {JSON.stringify(logs[selectedLog].result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-stone-550 text-xs">
            Select a telemetry channel on the left sidebar to inspect the live data stream.
          </div>
        )}
      </div>

    </div>
  );
}
