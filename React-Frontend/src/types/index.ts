export interface RoadPoint {
  id: string;
  lat: number;
  lon: number;
  colour: 'pink' | 'blue';
}

export interface Edge {
  from: string;
  to: string;
  distance: number;
}

export interface Destination {
  id: number;
  name: string;
  lat: number;
  lon: number;
  image_url: string;
}

export interface RouteInfo {
  path: RoadPoint[];
  distance: number;
  startPoint: RoadPoint;
  endPoint: RoadPoint;
}