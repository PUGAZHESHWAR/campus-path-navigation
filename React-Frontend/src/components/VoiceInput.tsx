import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

interface VoiceInputProps {
  onDestinationSelect: (destination: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onDestinationSelect }) => {
  const { isListening, isSupported, startListening, speak } = useVoice();

  const handleVoiceInput = () => {
    if (!isSupported) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    speak('Where would you like to go?');
    
    setTimeout(() => {
      startListening((text) => {
        onDestinationSelect(text);
        speak(`Navigating to ${text}`);
      });
    }, 2000);
  };

  return (
    <button
      onClick={handleVoiceInput}
      disabled={isListening || !isSupported}
      className={`
        relative overflow-hidden p-4 rounded-full shadow-lg transition-all duration-300
        ${isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-blue-500 hover:bg-blue-600'
        }
        ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        text-white
      `}
    >
      {isListening ? (
        <MicOff className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
      
      {isListening && (
        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
      )}
    </button>
  );
};

export default VoiceInput;