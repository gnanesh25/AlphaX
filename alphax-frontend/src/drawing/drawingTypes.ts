export type DrawingToolType =
  | 'cursor'
  | 'horizontal_line'
  | 'vertical_line'
  | 'trend_line'
  | 'ray'
  | 'rectangle'
  | 'fibonacci_retracement'
  | 'fibonacci_extension'
  | 'price_range'
  | 'date_range'
  | 'text_note';

export interface Point {
  x: number; // Pixel x
  y: number; // Pixel y
  time?: number; // Normalized chart time
  price?: number; // Normalized chart price
}

export interface DrawingShape {
  id: string;
  tool: DrawingToolType;
  points: Point[]; // 1 point for H/V line, 2 for trend/fib/rect, 3 for fib extension
  color: string;
  lineWidth: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  fillColor?: string;
  text?: string;
  selected?: boolean;
  locked?: boolean;
}
