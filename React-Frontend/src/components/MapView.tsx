import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, CircleMarker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { RoadPoint, Destination, RouteInfo, Edge } from '../types';
import { destinations } from '../data/destinations.ts';
import { findNearestRoadPoint, findShortestPath } from '../utils/pathfinding';
import { getCurrentLocation } from '../utils/geolocation';
import roadPathData from '../data/road_path.json';
import edgesData from '../data/edges_with_distances.json';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  selectedDestination: string | null;
  currentLocation: [number, number] | null;
}

const BlinkingMarker: React.FC<{ position: [number, number]; color: string }> = ({ 
  position, 
  color 
}) => {
  const map = useMap();
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.circleMarker(position, {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
      className: 'animate-pulse'
    });

    marker.addTo(map);
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [position, color, map]);

  return null;
};

const FrequencyCircle: React.FC<{ 
  position: [number, number]; 
  color: string; 
  type: 'start' | 'end' 
}> = ({ position, color, type }) => {
  const map = useMap();
  const circleRef = useRef<L.Circle | null>(null);
  const [radius, setRadius] = useState(15);

  useEffect(() => {
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    const circle = L.circle(position, {
      radius: radius,
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 0.6,
      fillOpacity: 0.3,
      className: 'animate-pulse'
    });

    circle.addTo(map);
    circleRef.current = circle;

    // Animate the radius for frequency effect
    const interval = setInterval(() => {
      setRadius(prev => {
        const newRadius = prev === 15 ? 25 : 15;
        if (circleRef.current) {
          circleRef.current.setRadius(newRadius);
        }
        return newRadius;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [position, color, map]);

  return null;
};

// Component to handle map zoom and fit bounds
const MapController: React.FC<{ 
  activeRoute: RouteInfo | null; 
  currentLocation: [number, number] | null;
  selectedDestination: string | null;
}> = ({ activeRoute, currentLocation, selectedDestination }) => {
  const map = useMap();

  useEffect(() => {
    // Force map to invalidate size after a short delay
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    if (activeRoute && activeRoute.path.length > 0) {
      // Create bounds that include the entire route
      const bounds = L.latLngBounds([
        ...activeRoute.path.map(point => [point.lat, point.lon] as [number, number]),
        ...(currentLocation ? [currentLocation] : [])
      ]);

      // Add some padding to the bounds
      map.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 18,
        animate: true
      });
    } else if (currentLocation) {
      // If no route, just center on current location
      map.setView(currentLocation, 16, { animate: true });
    }

    return () => clearTimeout(timer);
  }, [activeRoute, currentLocation, selectedDestination, map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ selectedDestination, currentLocation }) => {
  const [roadPoints, setRoadPoints] = useState<RoadPoint[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0); // Force re-render

  useEffect(() => {
    const loadRoadData = async () => {
      try {
        // Load road points from JSON
        setRoadPoints(roadPathData as RoadPoint[]);
        
        // Load edges from JSON
        setEdges(edgesData as Edge[]);
        
        setIsLoading(false);
        // Force map re-render after data loads
        setMapKey(prev => prev + 1);
      } catch (error) {
        console.error('Error loading road data:', error);
        setIsLoading(false);
      }
    };

    loadRoadData();
  }, []);

  useEffect(() => {
    if (!selectedDestination || !currentLocation || roadPoints.length === 0) {
      setActiveRoute(null);
      return;
    }

    const destination = destinations.find((d: Destination) => 
      d.name.toLowerCase().includes(selectedDestination.toLowerCase())
    );

    if (!destination) return;

    const startPoint = findNearestRoadPoint(currentLocation[0], currentLocation[1], roadPoints);
    const endPoint = findNearestRoadPoint(destination.lat, destination.lon, roadPoints);
    const route = findShortestPath(startPoint, endPoint, roadPoints, edges);
    
    setActiveRoute(route);
  }, [selectedDestination, currentLocation, roadPoints, edges]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = currentLocation || [12.193116, 79.084481];

  const pinkPoints = roadPoints.filter(p => p.colour === 'pink');
  const bluePoints = roadPoints.filter(p => p.colour === 'blue');

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={16}
        className="w-full h-full"
        zoomControl={true}
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '400px'
        }}
        attributionControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
          minZoom={3}
        />

        {/* Map Controller for zoom and bounds */}
        <MapController 
          activeRoute={activeRoute}
          currentLocation={currentLocation}
          selectedDestination={selectedDestination}
        />

        {/* Road points as dots with click functionality */}
        {pinkPoints.map((point) => (
          <CircleMarker
            key={`pink-${point.id}`}
            center={[point.lat, point.lon]}
            radius={4}
            fillColor="#ec4899"
            color="#ec4899"
            weight={1}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => {
                alert(`Point ID: ${point.id}\nColour: ${point.colour}`);
              }
            }}
          />
        ))}
        
        {bluePoints.map((point) => (
          <CircleMarker
            key={`blue-${point.id}`}
            center={[point.lat, point.lon]}
            radius={4}
            fillColor="#3b82f6"
            color="#3b82f6"
            weight={1}
            opacity={1}
            fillOpacity={0.8}
            eventHandlers={{
              click: () => {
                alert(`Point ID: ${point.id}\nColour: ${point.colour}`);
              }
            }}
          />
        ))}

        {/* Destination markers */}
        {destinations.map((dest: Destination) => (
          <Marker
            key={dest.id}
            position={[dest.lat, dest.lon]}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{dest.name}</h3>
                <img 
                  src={dest.image_url} 
                  alt={dest.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <p className="text-sm text-gray-600">
                  <strong>Coordinates:</strong><br />
                  Lat: {dest.lat.toFixed(6)}<br />
                  Lon: {dest.lon.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current location marker */}
        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>
              <div className="text-center p-2">
                <strong>Your Current Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active route with blinking markers */}
        {activeRoute && activeRoute.path.length > 0 && (
          <>
            <Polyline
              positions={activeRoute.path.map(p => [p.lat, p.lon] as [number, number])}
              color="#f59e0b"
              weight={8}
              opacity={0.9}
              className="animate-pulse"
            />
            
            {activeRoute.path.map((point, index) => (
              <BlinkingMarker
                key={`route-${point.id}`}
                position={[point.lat, point.lon]}
                color={point.colour === 'pink' ? '#ec4899' : '#3b82f6'}
              />
            ))}

            {/* Start point frequency circle */}
            <FrequencyCircle
              position={[activeRoute.path[0].lat, activeRoute.path[0].lon]}
              color="#10b981"
              type="start"
            />

            {/* End point frequency circle */}
            <FrequencyCircle
              position={[activeRoute.path[activeRoute.path.length - 1].lat, activeRoute.path[activeRoute.path.length - 1].lon]}
              color="#ef4444"
              type="end"
            />
          </>
        )}
      </MapContainer>

      {/* Route info overlay - positioned inside map */}
      {activeRoute && activeRoute.path.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000] border border-gray-200">
          <h4 className="font-semibold text-sm mb-1 text-gray-800">Active Route</h4>
          <p className="text-xs text-gray-600">Distance: {(activeRoute.distance / 1000).toFixed(2)} km</p>
          <p className="text-xs text-gray-600">Points: {activeRoute.path.length}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600">Start</span>
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse ml-2"></div>
            <span className="text-xs text-gray-600">End</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;