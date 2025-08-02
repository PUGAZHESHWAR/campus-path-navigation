import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DestinationSearch from './components/DestinationSearch';
import ChatBox from './components/ChatBox';
import { getCurrentLocation } from './utils/geolocation';

function App() {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurrentLocation = async () => {
      try {
        const position = await getCurrentLocation();
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      } catch (error) {
        console.error('Error getting current location:', error);
        // Set a default location if geolocation fails
        setCurrentLocation([12.193116, 79.084481]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentLocation();
  }, []);

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header Banner */}
      <div className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center px-6 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800">Campus Navigation Guide</h1>
        <div className="ml-auto text-sm text-gray-600">
          Find the best route to your destination
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Controls */}
        <div className="w-80 bg-white shadow-lg flex flex-col overflow-hidden">
          <DestinationSearch 
            onDestinationSelect={handleDestinationSelect}
            selectedDestination={selectedDestination}
          />
        </div>

        {/* Center - Map */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <MapView 
            selectedDestination={selectedDestination}
            currentLocation={currentLocation}
          />
        </div>

        {/* Right Side - ChatBox */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-hidden">
          <ChatBox 
            selectedDestination={selectedDestination}
            onDestinationSelect={handleDestinationSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default App;