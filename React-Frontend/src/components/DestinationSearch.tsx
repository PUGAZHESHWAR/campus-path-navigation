import React, { useState, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { destinations } from '../data/destinations';

interface DestinationSearchProps {
  onDestinationSelect: (destination: string) => void;
}

const DestinationSearch: React.FC<DestinationSearchProps> = ({ onDestinationSelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredDestinations = useMemo(() => {
    if (!query) return destinations;
    return destinations.filter(dest =>
      dest.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleSelect = (destinationName: string) => {
    onDestinationSelect(destinationName);
    setQuery(destinationName);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search destinations..."
          className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {isOpen && filteredDestinations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
          {filteredDestinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => handleSelect(dest.name)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 flex items-center space-x-3 border-b border-gray-50 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-gray-800 font-medium">{dest.name}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DestinationSearch;