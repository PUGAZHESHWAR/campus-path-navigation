import { RoadPoint, Destination, RouteInfo } from '../types';
import { calculateDistance } from './geolocation';

export const findNearestRoadPoint = (
  targetLat: number, 
  targetLon: number, 
  roadPoints: RoadPoint[]
): RoadPoint => {
  let nearestPoint = roadPoints[0];
  let minDistance = calculateDistance(targetLat, targetLon, nearestPoint.lat, nearestPoint.lon);

  for (const point of roadPoints) {
    const distance = calculateDistance(targetLat, targetLon, point.lat, point.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }

  return nearestPoint;
};

export const findShortestPath = (
  startPoint: RoadPoint,
  endPoint: RoadPoint,
  roadPoints: RoadPoint[]
): RouteInfo => {
  // Simple path finding along the road points array
  // In a real scenario, you'd implement Dijkstra's algorithm or A*
  const startIndex = roadPoints.findIndex(p => p.sno === startPoint.sno);
  const endIndex = roadPoints.findIndex(p => p.sno === endPoint.sno);
  
  let path: RoadPoint[];
  if (startIndex <= endIndex) {
    path = roadPoints.slice(startIndex, endIndex + 1);
  } else {
    path = roadPoints.slice(endIndex, startIndex + 1).reverse();
  }

  const distance = path.reduce((total, point, index) => {
    if (index === 0) return 0;
    const prevPoint = path[index - 1];
    return total + calculateDistance(prevPoint.lat, prevPoint.lon, point.lat, point.lon);
  }, 0);

  return {
    path,
    distance,
    startPoint,
    endPoint
  };
};