import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  isSupported: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceInput,
  isSupported,
  isListening,
  onStartListening,
  onStopListening
}) => {
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setInterimTranscript('');
    };

    recognitionInstance.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interimTranscript);

      if (finalTranscript) {
        onVoiceInput(finalTranscript);
        setInterimTranscript('');
      }
    };

    recognitionInstance.onend = () => {
      setInterimTranscript('');
    };

    setRecognition(recognitionInstance);
  }, [isSupported, onVoiceInput]);

  const handleVoiceToggle = () => {
    if (isListening) {
      onStopListening();
      if (recognition) {
        recognition.stop();
      }
    } else {
      onStartListening();
      if (recognition) {
        recognition.start();
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed"
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleVoiceToggle}
        className={`p-3 rounded-xl transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Voice indicator */}
      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="bg-red-100 border border-red-200 rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-700 font-medium">Listening...</span>
            </div>
            {interimTranscript && (
              <div className="mt-1 text-xs text-red-600 max-w-xs">
                "{interimTranscript}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;