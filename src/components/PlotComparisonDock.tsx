import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import type { InteractiveMapPlot } from "../types/interactiveMap";

interface PlotComparisonDockProps {
  comparedPlots: InteractiveMapPlot[];
  statusColors?: Record<string, string>;
  onOpenModal: () => void;
  onRemovePlot: (propertyId: number) => void;
  onClearAll: () => void;
  maxPlots?: number;
}

export default function PlotComparisonDock({
  comparedPlots,
  statusColors = {},
  onOpenModal,
  onRemovePlot,
  onClearAll,
  maxPlots = 4,
}: PlotComparisonDockProps) {
  if (comparedPlots.length === 0) return null;

  return (
    <aside
      aria-label="Plot Comparison Dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 px-3 sm:px-4 shadow-2xl border border-white/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Icon & Count */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shadow-md">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-white">
                Compare Plots
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-400/30">
                {comparedPlots.length}/{maxPlots}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {comparedPlots.length === 1
                ? "Select 1 more plot to compare"
                : "Ready to inspect side-by-side"}
            </p>
          </div>
        </div>

        {/* Center: Plot Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full sm:max-w-xs scrollbar-none">
          {comparedPlots.map((plot) => {
            const plotColor =
              plot.custom_color || statusColors[plot.status] || "#10b981";

            return (
              <div
                key={plot.property_id}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-2 py-1 text-xs font-bold shrink-0 transition-colors group"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: plotColor }}
                />
                <span className="text-white text-[11px]">#{plot.plot_no}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlot(plot.property_id);
                  }}
                  className="h-4 w-4 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center cursor-pointer transition-colors ml-0.5"
                  title={`Remove Plot #${plot.plot_no}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <Button
            size="sm"
            onClick={onOpenModal}
            className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span>Compare Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearAll}
            className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
            title="Clear all selected plots"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
