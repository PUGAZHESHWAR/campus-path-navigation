import React, { useState, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import { destinations } from '../data/destinations.ts';
import { Destination } from '../types';
import { Mic, MapPin, Bot, Sparkles, HelpCircle, Navigation, MessageCircle, Lightbulb, Star, Zap } from 'lucide-react';

interface DestinationSearchProps {
  onDestinationSelect: (destination: string) => void;
  selectedDestination: string | null;
}

const AnimatedMessages: React.FC<{ isListening: boolean; isActive: boolean }> = ({ isListening, isActive }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [messageType, setMessageType] = useState<'welcome' | 'tip' | 'status' | 'help'>('welcome');

  const messages = [
    {
      text: "Welcome to Campus Navigation! 🗺️",
      type: 'welcome' as const,
      icon: Navigation,
      color: 'blue',
      animation: 'fade-in'
    },
    {
      text: "Try saying 'CSE Block' or 'Library'",
      type: 'tip' as const,
      icon: Lightbulb,
      color: 'yellow',
      animation: 'slide-up'
    },
    {
      text: "I can help you find any destination!",
      type: 'help' as const,
      icon: MessageCircle,
      color: 'green',
      animation: 'bounce'
    },
    {
      text: "Voice commands make navigation easy",
      type: 'tip' as const,
      icon: Mic,
      color: 'purple',
      animation: 'pulse'
    },
    {
      text: "Select from dropdown or use voice",
      type: 'help' as const,
      icon: Sparkles,
      color: 'pink',
      animation: 'glow'
    },
    {
      text: "Real-time route calculation",
      type: 'status' as const,
      icon: Zap,
      color: 'orange',
      animation: 'slide-right'
    }
  ];

  useEffect(() => {
    if (isListening) {
      setMessageType('status');
      return;
    }

    if (isActive) {
      setMessageType('help');
      return;
    }

    // Auto-cycle through messages
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isListening, isActive, messages.length]);

  const getCurrentMessageData = () => {
    if (isListening) {
      return {
        text: "Listening to your voice... 🎤",
        type: 'status' as const,
        icon: Mic,
        color: 'red',
        animation: 'pulse'
      };
    }
    
    if (isActive) {
      return {
        text: "Processing your request... ⚡",
        type: 'status' as const,
        icon: Zap,
        color: 'blue',
        animation: 'bounce'
      };
    }

    return messages[currentMessage];
  };

  const messageData = getCurrentMessageData();
  const IconComponent = messageData.icon;

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'fade-in': return 'animate-fade-in';
      case 'slide-up': return 'animate-slide-up';
      case 'bounce': return 'animate-bounce';
      case 'pulse': return 'animate-pulse';
      case 'glow': return 'animate-glow';
      case 'slide-right': return 'animate-slide-right';
      default: return '';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'green': return 'bg-green-50 border-green-200 text-green-800';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'pink': return 'bg-pink-50 border-pink-200 text-pink-800';
      case 'orange': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'red': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="relative">
      {/* Animated Message Display */}
      <div className={`
        bg-white rounded-xl shadow-lg border-2 p-6 text-center
        ${getColorClasses(messageData.color)}
        ${getAnimationClass(messageData.animation)}
        transition-all duration-500 transform
        hover:scale-105
      `}>
        
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${getColorClasses(messageData.color).replace('bg-', 'bg-').replace('border-', 'border-')}
          `}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Message Text */}
        <div className="text-lg font-semibold mb-2">
          {messageData.text}
        </div>

        {/* Status Indicators */}
        {isListening && (
          <div className="flex justify-center space-x-1 mt-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}

        {isActive && !isListening && (
          <div className="flex justify-center space-x-1 mt-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* Progress Dots */}
        {!isListening && !isActive && (
          <div className="flex justify-center space-x-1 mt-3">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentMessage 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DestinationSearch: React.FC<DestinationSearchProps> = ({ 
  onDestinationSelect, 
  selectedDestination 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isRobotActive, setIsRobotActive] = useState(false);
  const [robotGuidance, setRobotGuidance] = useState<string>('');

  const handleVoiceInput = (transcript: string) => {
    setIsRobotActive(true);
    setRobotGuidance(`I heard: "${transcript}". Let me help you find that destination!`);
    
    // Simulate robot processing
    setTimeout(() => {
      const matchingDestination = destinations.find(dest => 
        dest.name.toLowerCase().includes(transcript.toLowerCase())
      );
      
      if (matchingDestination) {
        onDestinationSelect(matchingDestination.name);
        setRobotGuidance(`Perfect! I found "${matchingDestination.name}". Let me show you the route!`);
      } else {
        setRobotGuidance(`I couldn't find "${transcript}". Try saying a destination from the list above!`);
      }
      
      setTimeout(() => {
        setIsRobotActive(false);
        setRobotGuidance('');
      }, 3000);
    }, 1000);
  };

  const handleVoiceStart = () => {
    setIsListening(true);
    setIsRobotActive(true);
    setRobotGuidance('Hello! I\'m your navigation assistant. What destination would you like to go to?');
  };

  const handleVoiceStop = () => {
    setIsListening(false);
  };

  const getRobotTips = () => {
    const tips = [
      "Say 'CSE Block' to navigate to the Computer Science building",
      "Try 'Library' for the main library location",
      "Say 'Canteen' to find the food court",
      "Use 'Auditorium' for the main hall",
      "Try 'Parking' for the parking area"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Navigation className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Navigation Assistant</h2>
        </div>
        <p className="text-sm text-gray-600">Your AI-powered campus guide</p>
      </div>

      {/* Animated Messages */}
      <div className="flex flex-col items-center space-y-4">
        <AnimatedMessages isListening={isListening} isActive={isRobotActive} />
        
        {robotGuidance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-800">{robotGuidance}</p>
          </div>
        )}
      </div>

      {/* Destination Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Select Destination</h3>
        </div>
        
        <select
          value={selectedDestination || ''}
          onChange={(e) => onDestinationSelect(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Choose a destination...</option>
          {destinations.map((dest: Destination) => (
            <option key={dest.id} value={dest.name}>
              {dest.name}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Mic className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Voice Assistant</h3>
        </div>
        
        <VoiceInput 
          onTranscript={handleVoiceInput}
          onListeningStart={handleVoiceStart}
          onListeningStop={handleVoiceStop}
          isListening={isListening}
        />
      </div>

      {/* Selected Destination Display */}
      {selectedDestination && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Selected Destination</h3>
          </div>
          <p className="text-green-700 font-medium">{selectedDestination}</p>
          <p className="text-sm text-green-600 mt-1">Route is being calculated...</p>
        </div>
      )}

      {/* Robot Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Voice Tips</h3>
        </div>
        <p className="text-sm text-blue-700">{getRobotTips()}</p>
      </div>

      {/* Free Space */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Bot className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">How to use</h3>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Select a destination from the dropdown</li>
          <li>• Or use voice commands to navigate</li>
          <li>• The assistant will guide you through the process</li>
          <li>• View the route on the map</li>
        </ul>
      </div>
    </div>
  );
};

export default DestinationSearch;