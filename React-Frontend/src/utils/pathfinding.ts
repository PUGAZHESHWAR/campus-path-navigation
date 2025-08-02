import { RoadPoint, Destination, RouteInfo, Edge } from '../types';
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

// Build adjacency list for road network using edges data
const buildRoadGraph = (roadPoints: RoadPoint[], edges: Edge[]): Map<string, { node: RoadPoint; distance: number }[]> => {
  const graph = new Map<string, { node: RoadPoint; distance: number }[]>();
  
  // Initialize graph
  roadPoints.forEach(point => {
    graph.set(point.id, []);
  });

  // Build connections based on edges data
  edges.forEach(edge => {
    const fromPoint = roadPoints.find(p => p.id === edge.from);
    const toPoint = roadPoints.find(p => p.id === edge.to);
    
    if (fromPoint && toPoint) {
      // Calculate actual distance between connected points
      const distance = calculateDistance(fromPoint.lat, fromPoint.lon, toPoint.lat, toPoint.lon);
      
      // Add bidirectional connection
      graph.get(fromPoint.id)?.push({ node: toPoint, distance });
      graph.get(toPoint.id)?.push({ node: fromPoint, distance });
    }
  });

  return graph;
};

// Dijkstra's algorithm implementation using edges data
const dijkstra = (
  startId: string,
  endId: string,
  roadPoints: RoadPoint[],
  graph: Map<string, { node: RoadPoint; distance: number }[]>
): RoadPoint[] => {
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const visited = new Set<string>();
  
  // Initialize distances
  roadPoints.forEach(point => {
    distances.set(point.id, Infinity);
  });
  distances.set(startId, 0);

  while (visited.size < roadPoints.length) {
    // Find unvisited node with minimum distance
    let minDistance = Infinity;
    let currentId = '';
    
    for (const point of roadPoints) {
      if (!visited.has(point.id) && distances.get(point.id)! < minDistance) {
        minDistance = distances.get(point.id)!;
        currentId = point.id;
      }
    }

    if (currentId === '') break; // No path found
    
    visited.add(currentId);
    
    // If we reached the end, we're done
    if (currentId === endId) break;
    
    // Update distances to neighbors using actual network connections
    const neighbors = graph.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.node.id)) {
        const newDistance = distances.get(currentId)! + neighbor.distance;
        if (newDistance < distances.get(neighbor.node.id)!) {
          distances.set(neighbor.node.id, newDistance);
          previous.set(neighbor.node.id, currentId);
        }
      }
    }
  }

  // Reconstruct path
  const path: RoadPoint[] = [];
  let currentId = endId;
  
  while (currentId !== startId) {
    const currentPoint = roadPoints.find(p => p.id === currentId);
    if (!currentPoint) break;
    
    path.unshift(currentPoint);
    currentId = previous.get(currentId)!;
    
    if (currentId === undefined) {
      // No path found, return empty array
      return [];
    }
  }
  
  // Add start point
  const startPoint = roadPoints.find(p => p.id === startId);
  if (startPoint) {
    path.unshift(startPoint);
  }
  
  return path;
};

export const findShortestPath = (
  startPoint: RoadPoint,
  endPoint: RoadPoint,
  roadPoints: RoadPoint[],
  edges: Edge[]
): RouteInfo => {
  // Build road network graph using edges data
  const graph = buildRoadGraph(roadPoints, edges);
  
  // Find shortest path using Dijkstra's algorithm
  const path = dijkstra(startPoint.id, endPoint.id, roadPoints, graph);
  
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