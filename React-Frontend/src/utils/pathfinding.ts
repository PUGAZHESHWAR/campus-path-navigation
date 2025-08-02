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

// Build adjacency list for road network using series connections
const buildRoadGraph = (roadPoints: RoadPoint[]): Map<number, { node: RoadPoint; distance: number }[]> => {
  const graph = new Map<number, { node: RoadPoint; distance: number }[]>();
  
  // Initialize graph
  roadPoints.forEach(point => {
    graph.set(point.sno, []);
  });

  // Build connections based on the series field
  roadPoints.forEach(point => {
    // Find the node that this point connects to
    const connectedPoint = roadPoints.find(p => p.sno === point.series);
    if (connectedPoint) {
      // Calculate actual distance between connected points
      const distance = calculateDistance(point.lat, point.lon, connectedPoint.lat, connectedPoint.lon);
      
      // Add bidirectional connection
      graph.get(point.sno)?.push({ node: connectedPoint, distance });
      graph.get(connectedPoint.sno)?.push({ node: point, distance });
    }
  });

  return graph;
};

// Dijkstra's algorithm implementation using series connections
const dijkstra = (
  startSno: number,
  endSno: number,
  roadPoints: RoadPoint[],
  graph: Map<number, { node: RoadPoint; distance: number }[]>
): RoadPoint[] => {
  const distances = new Map<number, number>();
  const previous = new Map<number, number>();
  const visited = new Set<number>();
  
  // Initialize distances
  roadPoints.forEach(point => {
    distances.set(point.sno, Infinity);
  });
  distances.set(startSno, 0);

  while (visited.size < roadPoints.length) {
    // Find unvisited node with minimum distance
    let minDistance = Infinity;
    let currentSno = -1;
    
    for (const point of roadPoints) {
      if (!visited.has(point.sno) && distances.get(point.sno)! < minDistance) {
        minDistance = distances.get(point.sno)!;
        currentSno = point.sno;
      }
    }

    if (currentSno === -1) break; // No path found
    
    visited.add(currentSno);
    
    // If we reached the end, we're done
    if (currentSno === endSno) break;
    
    // Update distances to neighbors using actual network connections
    const neighbors = graph.get(currentSno) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.node.sno)) {
        const newDistance = distances.get(currentSno)! + neighbor.distance;
        if (newDistance < distances.get(neighbor.node.sno)!) {
          distances.set(neighbor.node.sno, newDistance);
          previous.set(neighbor.node.sno, currentSno);
        }
      }
    }
  }

  // Reconstruct path
  const path: RoadPoint[] = [];
  let currentSno = endSno;
  
  while (currentSno !== startSno) {
    const currentPoint = roadPoints.find(p => p.sno === currentSno);
    if (!currentPoint) break;
    
    path.unshift(currentPoint);
    currentSno = previous.get(currentSno)!;
    
    if (currentSno === undefined) {
      // No path found, return empty array
      return [];
    }
  }
  
  // Add start point
  const startPoint = roadPoints.find(p => p.sno === startSno);
  if (startPoint) {
    path.unshift(startPoint);
  }
  
  return path;
};

export const findShortestPath = (
  startPoint: RoadPoint,
  endPoint: RoadPoint,
  roadPoints: RoadPoint[]
): RouteInfo => {
  // Build road network graph using series connections
  const graph = buildRoadGraph(roadPoints);
  
  // Find shortest path using Dijkstra's algorithm
  const path = dijkstra(startPoint.sno, endPoint.sno, roadPoints, graph);
  
  // Calculate total distance using actual distances between connected points
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