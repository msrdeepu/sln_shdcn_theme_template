export interface InteractiveMapPlot {
  property_id: number;
  plot_no: string;
  x_percent: number;
  y_percent: number;
  width_percent?: number | null;
  height_percent?: number | null;
  width_px?: number | null;
  height_px?: number | null;
  font_size?: number | null;
  rotation?: number;
  shape?: 'rectangle' | 'pill' | 'circle' | 'square' | string;
  custom_color?: string | null;
  status: string;
  facing?: string | null;
  sq_yards?: number | null;
  srq_yards?: number | null;
  sq_feet?: number | null;
  srq_feets?: number | null;
  total_cost?: number | null;
  paid?: number | null;
  outstanding?: number | null;
  sft_cost?: number | string | null;
  cost_per_sft?: number | string | null;
  dimensions?: string | null;
  width?: number | string | null;
  length?: number | string | null;
  roadsize?: string | null;
}

export interface InteractiveMapAmenity {
  id: number | string;
  title: string;
  badge?: string;
  description?: string;
  category?: string;
  category_group?: string;
  icon?: string;
  icon_image?: string;
  icon_image_url?: string;
  color?: string;
  x_percent: number;
  y_percent: number;
}

export interface InteractiveMapData {
  venture: {
    id: number | string;
    name: string;
    code?: string;
    location?: string;
  };
  map: {
    id: number;
    title: string;
    image_url: string;
    natural_width: number;
    natural_height: number;
  };
  status_colors: Record<string, string>;
  global_styles?: {
    font_size?: number;
    padding_x?: number;
    padding_y?: number;
    border_radius?: number;
  };
  stats: {
    total_placed: number;
    total_amenities?: number;
    available: number;
    booked: number;
    sold: number;
    blocked: number;
  };
  plots: InteractiveMapPlot[];
  amenities?: InteractiveMapAmenity[];
}

export interface InteractiveMapResponse {
  success: boolean;
  status?: string;
  message?: string;
  data: InteractiveMapData;
}
