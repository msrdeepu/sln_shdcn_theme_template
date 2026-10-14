import { useState } from "react";
import {
  X,
  Scale,
  Compass,
  Maximize,
  Route,
  IndianRupee,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import type { InteractiveMapPlot } from "../types/interactiveMap";
import type { PropertyDetails } from "./Venture3DCanvas";

type VentureInteractiveMapPlot = InteractiveMapPlot;

interface PlotComparisonMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedPlots: VentureInteractiveMapPlot[];
  allPlots: VentureInteractiveMapPlot[];
  plotDetailsMap: Record<number, PropertyDetails>;
  statusColors?: Record<string, string>;
  ventureName?: string;
  onRemovePlot: (propertyId: number) => void;
  onAddPlot: (plot: VentureInteractiveMapPlot) => void;
  onClearAll: () => void;
  onBookSiteVisit: (plot: VentureInteractiveMapPlot) => void;
  onBookPlot: (plot: VentureInteractiveMapPlot) => void;
  maxPlots?: number;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isValidCost(cost: any): boolean {
  if (cost === undefined || cost === null) return false;
  const num = Number(cost);
  return !isNaN(num) && num > 0;
}

export default function PlotComparisonMatrixModal({
  isOpen,
  onClose,
  comparedPlots,
  allPlots = [],
  plotDetailsMap,
  statusColors = {},
  ventureName = "Venture",
  onRemovePlot,
  onAddPlot,
  onClearAll,
  onBookSiteVisit,
  onBookPlot,
  maxPlots = 4,
}: PlotComparisonMatrixModalProps) {
  const [showAddPicker, setShowAddPicker] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");

  if (!isOpen) return null;

  // Available plots that are not currently in comparison
  const availableToAdd = allPlots.filter(
    (p) => !comparedPlots.some((cp) => cp.property_id === p.property_id)
  );

  const filteredToAdd = availableToAdd.filter((p) => {
    if (!searchFilter.trim()) return true;
    return (
      p.plot_no.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      p.status.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      (p.facing && p.facing.toLowerCase().includes(searchFilter.toLowerCase().trim()))
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Side-by-Side Plot Comparison Matrix"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <header className="p-4 sm:p-5 px-5 sm:px-6 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shrink-0">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                  Side-by-Side Plot Comparison Matrix
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  {comparedPlots.length} of {maxPlots} Selected
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedPlots.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 h-8 px-2.5 rounded-xl cursor-pointer hidden sm:flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close Comparison"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Matrix Body (Scrollable side-by-side columns) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {comparedPlots.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <Scale className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  No Plots in Comparison
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select plots from the 3D world or 2D master plan to compare specifications side-by-side.
                </p>
              </div>
              <Button
                onClick={() => setShowAddPicker(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-4"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Select Plots
              </Button>
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-[280px] sm:auto-cols-[300px] md:auto-cols-[1fr] gap-4 min-w-full pb-4">
              {comparedPlots.map((plot) => {
                const details = plotDetailsMap[plot.property_id];
                const plotColor =
                  plot.custom_color || statusColors[plot.status] || "#10b981";

                const sqFeet =
                  details?.srq_feets ||
                  (plot.sq_yards ? plot.sq_yards * 9 : null);
                const sqYards =
                  details?.srq_yards ||
                  plot.sq_yards ||
                  (sqFeet ? Number((Number(sqFeet) / 9).toFixed(2)) : null);

                const dimensions =
                  details?.dimensions ||
                  (details?.width && details?.length
                    ? `${details.width} × ${details.length} ft`
                    : "—");

                const roadSize = details?.roadsize
                  ? String(details.roadsize).toLowerCase().includes("ft") ||
                    String(details.roadsize).toLowerCase().includes("feet")
                    ? String(details.roadsize)
                    : `${details.roadsize} ft`
                  : "60 ft";

                const sftCostNum = isValidCost(
                  details?.sft_cost || (details as any)?.cost_per_sft
                )
                  ? Number(details?.sft_cost || (details as any)?.cost_per_sft)
                  : null;

                const totalPrice =
                  plot.total_cost ||
                  (sftCostNum && sqFeet ? sftCostNum * Number(sqFeet) : null);

                return (
                  <div
                    key={plot.property_id}
                    className="bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="p-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0"
                          style={{
                            backgroundColor: plotColor,
                            border: "2px solid rgba(255, 255, 255, 0.9)",
                          }}
                        >
                          {plot.plot_no}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                            Plot #{plot.plot_no}
                          </h4>
                          <span
                            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5"
                            style={{
                              backgroundColor: `${plotColor}18`,
                              borderColor: plotColor,
                              color: plotColor,
                            }}
                          >
                            {plot.status}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemovePlot(plot.property_id)}
                        className="h-7 w-7 rounded-full bg-slate-200/60 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Redzone warning if applicable */}
                    {(details?.is_redzone === 1 ||
                      details?.redzone_status ||
                      details?.possible_redzone) && (
                      <div className="bg-rose-50 border-b border-rose-200/80 p-2.5 px-3 flex items-center gap-1.5 text-rose-700 text-[11px] font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Redzone / Overdue Notice</span>
                      </div>
                    )}

                    {/* Metric Rows */}
                    <div className="p-4 space-y-3.5 text-xs flex-1">
                      {/* Facing */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Compass className="h-3.5 w-3.5 text-indigo-500" />
                          Facing
                        </span>
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {plot.facing || details?.facing || "EAST"}
                        </span>
                      </div>

                      {/* Dimensions */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Maximize className="h-3.5 w-3.5 text-indigo-500" />
                          Dimensions
                        </span>
                        <span className="font-bold text-slate-900 truncate">
                          {dimensions}
                        </span>
                      </div>

                      {/* Road Size */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Route className="h-3.5 w-3.5 text-indigo-500" />
                          Road Width
                        </span>
                        <span className="font-bold text-slate-900">
                          {roadSize}
                        </span>
                      </div>

                      {/* Total Area */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                          Plot Area
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">
                            {sqYards ? `${sqYards} sq.yd` : "—"}
                          </span>
                          {sqFeet && (
                            <span className="text-[10px] text-slate-400">
                              ({sqFeet} sq.ft)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cost per Sft */}
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <IndianRupee className="h-3.5 w-3.5 text-indigo-500" />
                          Sft Cost
                        </span>
                        <span className="font-bold text-slate-900">
                          {sftCostNum ? formatCurrency(sftCostNum) : "—"}
                        </span>
                      </div>

                      {/* Total Cost */}
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                          Total Cost
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {totalPrice ? formatCurrency(totalPrice) : "Contact Office"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Plot Placeholder Slot */}
              {comparedPlots.length < maxPlots && (
                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-white/40 hover:bg-white/80 transition-colors min-h-[400px]">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Add Plot to Compare
                    </h4>
                    <p className="text-xs text-slate-500 max-w-[200px] mt-1">
                      Compare up to {maxPlots} plots side-by-side to make the best investment choice.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddPicker(true)}
                    variant="outline"
                    className="border-indigo-200 hover:border-indigo-400 text-indigo-600 rounded-xl text-xs font-bold mt-2"
                  >
                    Browse Venture Plots
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="p-3.5 sm:p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline">
            💡 Tip: Click any plot on the master plan to easily add it to this comparison matrix.
          </span>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs h-9 px-6 ml-auto"
          >
            Close Matrix
          </Button>
        </footer>
      </div>

      {/* Nested Plot Picker Popup */}
      {showAddPicker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select Plot to Compare"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAddPicker(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 flex flex-col gap-3 max-h-[80vh] animate-in zoom-in-95 duration-150 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Select Plot to Compare
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPicker(false)}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Input */}
            <input
              type="text"
              placeholder="Search by plot number, facing, status..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
            />

            {/* Plots Grid */}
            <div className="overflow-y-auto max-h-72 space-y-1.5 pr-1">
              {filteredToAdd.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No matching plots available to add.
                </p>
              ) : (
                filteredToAdd.map((plot) => {
                  const plotColor =
                    plot.custom_color || statusColors[plot.status] || "#10b981";

                  return (
                    <button
                      key={plot.property_id}
                      type="button"
                      onClick={() => {
                        onAddPlot(plot);
                        setShowAddPicker(false);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                          style={{ backgroundColor: plotColor }}
                        >
                          {plot.plot_no}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            Plot #{plot.plot_no}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {plot.facing || "EAST"} • {plot.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {plot.total_cost && (
                          <span className="text-xs font-bold text-slate-700">
                            {formatCurrency(plot.total_cost)}
                          </span>
                        )}
                        <Plus className="h-4 w-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
