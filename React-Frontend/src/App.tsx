import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Loader } from 'lucide-react';
import MapView from './components/MapView';
import VoiceInput from './components/VoiceInput';
import DestinationSearch from './components/DestinationSearch';
import { getCurrentLocation } from './utils/geolocation';
import 'leaflet/dist/leaflet.css';

function App() {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const position = await getCurrentLocation();
      setCurrentLocation([position.coords.latitude, position.coords.longitude]);
    } catch (error) {
      setLocationError('Unable to get your location. Please enable location services.');
      console.error('Geolocation error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    if (!currentLocation) {
      handleGetCurrentLocation();
    }
  };

  const clearRoute = () => {
    setSelectedDestination(null);
  };

  useEffect(() => {
    // Try to get location on app start
    handleGetCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Layout */}
      <div className="flex flex-col h-screen md:hidden">
        {/* Top Action Area */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Campus Navigator</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DestinationSearch onDestinationSelect={handleDestinationSelect} />
            <VoiceInput onDestinationSelect={handleDestinationSelect} />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {isLoadingLocation ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isLoadingLocation ? 'Locating...' : 'My Location'}
              </span>
            </button>

            {selectedDestination && (
              <button
                onClick={clearRoute}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all duration-200 text-sm font-medium"
              >
                Clear Route
              </button>
            )}
          </div>

          {selectedDestination && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Destination:</strong> {selectedDestination}
              </p>
            </div>
          )}

          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{locationError}</p>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div className="flex-1 p-2">
          <MapView 
            selectedDestination={selectedDestination}
            currentLocation={currentLocation}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar */}
        <div className="w-96 bg-white/90 backdrop-blur-sm shadow-xl p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Campus Navigator</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Destination
              </label>
              <DestinationSearch onDestinationSelect={handleDestinationSelect} />
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>or</span>
                <div className="h-px bg-gray-300 flex-1"></div>
                <span>use voice</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
            </div>

            <div className="flex justify-center">
              <VoiceInput onDestinationSelect={handleDestinationSelect} />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleGetCurrentLocation}
                disabled={isLoadingLocation}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
              >
                {isLoadingLocation ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isLoadingLocation ? 'Locating...' : 'Get Location'}
                </span>
              </button>

              {selectedDestination && (
                <button
                  onClick={clearRoute}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all duration-200 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedDestination && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-1">Active Destination</h3>
                <p className="text-blue-800 font-medium">{selectedDestination}</p>
              </div>
            )}

            {currentLocation && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="font-semibold text-gray-800 mb-1">Current Location</h3>
                <p className="text-sm text-gray-600">
                  Lat: {currentLocation[0].toFixed(6)}<br />
                  Lon: {currentLocation[1].toFixed(6)}
                </p>
              </div>
            )}

            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{locationError}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-semibold mb-2">How to use:</h4>
            <ul className="space-y-1 text-xs">
              <li>• Search for a destination or use voice input</li>
              <li>• Allow location access for navigation</li>
              <li>• Pink roads are inside department blocks</li>
              <li>• Blue roads are outside department blocks</li>
              <li>• Active routes will blink on the map</li>
            </ul>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 p-4">
          <MapView 
            selectedDestination={selectedDestination}
            currentLocation={currentLocation}
          />
        </div>
      </div>
    </div>
  );
}

export default App;