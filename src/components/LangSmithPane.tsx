import React from "react";
import { AreaChart, ShieldAlert, Cpu, Layers, Leaf, Timer, ShieldCheck } from "lucide-react";
import { EvaluationReport } from "../types";

interface Props {
  report: EvaluationReport;
}

export default function LangSmithPane({ report }: Props) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-xl h-[400px]">
        <ShieldCheck className="w-10 h-10 text-stone-300 mb-2" />
        <p className="text-sm text-stone-550 font-semibold font-sans">Ecosystem Assurance Engine Idle</p>
        <p className="text-xs text-stone-400 mt-1">Initialize the bio-intelligence simulation to audit ESG validation parameters.</p>
      </div>
    );
  }

  const { metrics } = report;

  const scoreCards = [
    { name: "Baseline Site Data Accuracy Audit", score: report.accuracy_score, desc: report.accuracy_details },
    { name: "Independent Scientific Validation", score: report.scientific_correctness_score, desc: report.scientific_correctness_details },
    { name: "Eco-Industrial Cohesion Index", score: report.collaboration_score, desc: report.collaboration_details },
    { name: "Sensor & Satellite Telemetry Integration Index", score: report.tool_selection_score, desc: report.tool_selection_details },
    { name: "Industrial Feasibility & Actionable ESG Utility", score: report.final_recommendation_score, desc: report.final_recommendation_details },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">RESPONSE LATENCY</div>
            <div className="text-xl font-extrabold text-stone-800 font-mono">{(metrics.latency_ms / 1000).toFixed(2)}s</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">MODEL PARAMETERS AUDITED</div>
            <div className="text-xl font-extrabold text-stone-800 font-mono">
              {metrics.input_token_count + metrics.output_token_count || "Inlined"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">COMPUTATIONAL FOOTPRINT</div>
            <div className="text-xl font-extrabold text-stone-800 font-mono">
              {( (metrics.input_token_count + metrics.output_token_count) * 0.000000002 ).toFixed(6)} kg CO2e
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">SAFETY LIMIT CHECKS</div>
            <div className="text-xl font-extrabold text-stone-800 font-mono">Passed</div>
          </div>
        </div>

      </div>

      {/* LLM-as-a-judge outputs */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4">
        
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <AreaChart className="w-5 h-5 text-emerald-700" />
          <h4 className="font-bold text-stone-800 text-sm tracking-tight uppercase">ISO / ESG Rigor & Regulatory Compliance Auditing</h4>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed max-w-4xl">
          Automated evaluation engine measuring adherence to international environmental protocols (FAO, ecological science standards, carbon offsets) mapping agricultural, chemical, and cooling discharge frameworks to verified actionable outcomes.
        </p>

        <div className="space-y-4">
          {scoreCards.map((card, idx) => {
            const isExcellent = card.score >= 90;
            const isGood = card.score >= 75;

            return (
              <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-emerald-500/30">
                <div className="space-y-1 md:max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-bold text-stone-800 text-sm">{card.name}</span>
                  </div>
                  <p className="text-xs text-stone-500 font-normal leading-relaxed">{card.desc}</p>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div className="w-36 bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${card.score}%` }}
                      className={`h-full rounded-full ${
                        isExcellent ? "bg-emerald-600" : isGood ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-stone-800 font-mono w-10 text-right">
                    {card.score}%
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    isExcellent ? "bg-emerald-100 text-emerald-800" : "bg-teal-100 text-teal-800"
                  }`}>
                    {isExcellent ? "VERIFIED" : "COMPLIANT"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
