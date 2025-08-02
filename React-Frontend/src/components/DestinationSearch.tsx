import React, { useState } from 'react';
import { Destination } from '../types';
import { destinations } from '../data/destinations.ts';
import VoiceInput from './VoiceInput';
import { MapPin, Navigation, Search, Mic } from 'lucide-react';

interface DestinationSearchProps {
  onDestinationSelect: (destination: string) => void;
  selectedDestination: string | null;
}

const DestinationSearch: React.FC<DestinationSearchProps> = ({ 
  onDestinationSelect, 
  selectedDestination 
}) => {
  const [isListening, setIsListening] = useState(false);

  const handleDestinationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value) {
      onDestinationSelect(value);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    // Find destination that matches the voice input
    const matchedDestination = destinations.find(dest => 
      dest.name.toLowerCase().includes(transcript.toLowerCase())
    );
    
    if (matchedDestination) {
      onDestinationSelect(matchedDestination.name);
    }
  };

  const popularDestinations = [
    'CSE Block',
    'Biotech Block', 
    'ECE Block',
    'IT Block',
    'Mechanical Dept',
    'Civil Block'
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Navigation</h2>
        <p className="text-sm text-gray-600">Choose your destination</p>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Search className="w-5 h-5 text-gray-400" />
            <label htmlFor="destination-select" className="text-sm font-medium text-gray-700">
              Select Destination
            </label>
          </div>
          <select
            id="destination-select"
            value={selectedDestination || ''}
            onChange={handleDestinationChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-gray-900"
          >
            <option value="">Choose a destination...</option>
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.name}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Mic className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Voice Input</span>
          </div>
          <div className="flex justify-center">
            <VoiceInput 
              onTranscript={handleVoiceInput}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          </div>
        </div>
      </div>

      {/* Selected Destination */}
      {selectedDestination && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Selected Destination</span>
          </div>
          <p className="text-blue-900 font-medium">{selectedDestination}</p>
        </div>
      )}

      {/* Popular Destinations */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Destinations</h3>
        <div className="grid grid-cols-1 gap-2">
          {popularDestinations.map((dest) => (
            <button
              key={dest}
              onClick={() => onDestinationSelect(dest)}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${
                selectedDestination === dest
                  ? 'bg-blue-100 border border-blue-300 text-blue-800'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{dest}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Free Space */}
      <div className="flex-1"></div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Tips</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Use voice input for hands-free navigation</p>
          <p>• Chat with the assistant for help</p>
          <p>• View route details on the map</p>
        </div>
      </div>
    </div>
  );
};

export default DestinationSearch;