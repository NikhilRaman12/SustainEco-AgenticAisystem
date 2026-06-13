import React, { useState, useEffect } from "react";
import { Folder, FileCode, Check, Copy, ChevronRight, ChevronDown, BookOpen } from "lucide-react";

interface CodebaseItem {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: CodebaseItem[];
  size?: number;
}

export default function CodeExplorer() {
  const [codebase, setCodebase] = useState<CodebaseItem[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("README.md");
  const [fileContents, setFileContents] = useState<string>("");
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ "": true });
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCodebase();
  }, []);

  useEffect(() => {
    if (currentFile) {
      loadFileContents(currentFile);
    }
  }, [currentFile]);

  const fetchCodebase = async () => {
    try {
      const res = await fetch("/api/codebase");
      const data = await res.json();
      if (data.success) {
        setCodebase(data.codebase);
      }
    } catch (err) {
      console.error("Error loading model files directory:", err);
    }
  };

  const loadFileContents = async (filePath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/codebase/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.success) {
        setFileContents(data.contents);
      } else {
        setFileContents(`# Error loading directive ruleset: ${data.error}`);
      }
    } catch (err) {
      setFileContents(`# Request failure loading parameter: ${filePath}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContents);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (items: CodebaseItem[], depth = 0) => {
    return items.map((item) => {
      const isDir = item.type === "directory";
      const isExpanded = !!expandedDirs[item.path];
      const isSelected = currentFile === item.path;
      
      const localizedName = item.name
        .replace(".ts", " [Rules Module]")
        .replace(".py", " [Scientific Solver]")
        .replace(".json", " [Config Schema]")
        .replace(".md", " [Core Blueprint Outline]");

      return (
        <div key={item.path} style={{ paddingLeft: `${depth * 14}px` }} className="select-none font-sans">
          {isDir ? (
            <div
              onClick={() => toggleDirectory(item.path)}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-emerald-500/10 rounded cursor-pointer text-xs font-semibold text-stone-700 transition uppercase tracking-wide"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              )}
              <Folder className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
              <span>{item.name.toUpperCase()} REGISTRY</span>
            </div>
          ) : (
            <div
              onClick={() => setCurrentFile(item.path)}
              className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-xs transition ${
                isSelected
                  ? "bg-emerald-700 text-white font-medium shadow"
                  : "hover:bg-emerald-500/10 text-stone-650"
              }`}
            >
              <div className="w-3.5" />
              <FileCode className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-emerald-700"}`} />
              <span>{localizedName}</span>
              {item.size && (
                <span className={`text-[9px] font-mono ml-auto ${isSelected ? "text-emerald-200" : "text-stone-400"}`}>
                  {(item.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          )}
          {isDir && isExpanded && item.children && renderTree(item.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm h-[700px]">
      
      {/* Sidebar: Navigation Structure */}
      <div className="lg:col-span-1 border-r border-stone-200 bg-stone-50 p-4 overflow-y-auto flex flex-col font-sans">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-3">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h4 className="font-bold text-stone-850 text-xs tracking-wider uppercase font-sans">Ecology & Compliance Framework Rules</h4>
        </div>
        
        <div className="flex-1 space-y-1">
          <div
            onClick={() => setCurrentFile("README.md")}
            className={`flex items-center gap-2 py-2 px-2.5 rounded cursor-pointer text-xs mb-3 transition font-semibold tracking-wider uppercase ${
              currentFile === "README.md" ? "bg-emerald-700 text-white shadow" : "hover:bg-emerald-500/10 bg-stone-105 text-stone-700"
            }`}
          >
            <Folder className="w-4 h-4 text-emerald-300" />
            <span>Root Model Frameworks</span>
          </div>
          {renderTree(codebase)}
        </div>
        
        <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-400 font-sans tracking-wide">
          * Secured read-only reference of functional constraints, agricultural calculations, and policy guidelines implemented on the core compute server.
        </div>
      </div>

      {/* Editor Body */}
      <div className="lg:col-span-3 flex flex-col h-full bg-stone-900 border-l border-stone-800">
        <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="w-3 h-3 rounded-full bg-emerald-550" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-stone-350 text-xs font-mono ml-3 border border-stone-800 px-2.5 py-0.5 rounded bg-stone-900">
              sustainai.policy/{currentFile}
            </span>
          </div>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white hover:bg-stone-800 px-3 py-1.5 rounded border border-stone-800 transition font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Reference!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Blueprint Code</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-stone-300 leading-relaxed bg-stone-900/95 selection:bg-emerald-700 selection:text-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 gap-2 font-sans">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Streaming blueprint directive parameters...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap">{fileContents || "# Select a tactical rules schema on the left struct tree to read parameters."}</pre>
          )}
        </div>
      </div>

    </div>
  );
}
