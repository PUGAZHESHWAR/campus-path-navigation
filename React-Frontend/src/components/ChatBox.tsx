import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, MapPin, Navigation, Clock, Info, Bot, User, Sparkles, X, Play, Pause } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBoxProps {
  selectedDestination: string | null;
  onDestinationSelect: (destination: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ selectedDestination, onDestinationSelect }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI navigation assistant. How can I help you find your way around campus today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedDestination) {
      const botResponse = `Perfect! I've set your destination to ${selectedDestination}. The optimal route is now displayed on the map with detailed navigation information.`;
      addBotMessage(botResponse);
      speakMessage(botResponse);
    }
  }, [selectedDestination]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const stopCurrentSpeech = () => {
    if (currentUtterance) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      stopCurrentSpeech();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and select a better one
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Alex') || 
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('David')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Faster, more natural AI-like speech
      utterance.rate = 1.1;
      utterance.pitch = 1.2;
      utterance.volume = 0.95;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentUtterance(utterance);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      addUserMessage(inputText);
      processUserInput(inputText);
      setInputText('');
    }
  };

  const processUserInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    let response = '';

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      response = 'Hello! I\'m here to help you navigate around campus. You can ask me about destinations, routes, or use voice commands for hands-free navigation.';
    } else if (lowerInput.includes('destination') || lowerInput.includes('where')) {
      response = 'You can select a destination from the dropdown menu or use voice commands. Try saying "Navigate to [destination name]" or use the quick actions below for popular locations.';
    } else if (lowerInput.includes('navigate') || lowerInput.includes('go to')) {
      const destinationMatch = input.match(/navigate to (.+)/i) || input.match(/go to (.+)/i);
      if (destinationMatch) {
        const destination = destinationMatch[1];
        onDestinationSelect(destination);
        response = `Setting destination to ${destination}. The route is now being calculated and displayed on the map.`;
      } else {
        response = 'Please specify a destination. For example: "Navigate to CSE Block" or "Go to Biotech Block". You can also use the quick actions below.';
      }
    } else if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      response = 'I\'m your AI navigation assistant! I can help you set destinations, provide route information, answer questions about campus locations, and offer real-time navigation guidance. Try using voice commands or the quick actions for a seamless experience.';
    } else if (lowerInput.includes('route') || lowerInput.includes('path')) {
      response = 'The route is displayed on the map with interactive markers. Green markers show your starting point, red markers indicate the destination, and the orange path shows the optimal route with distance and time information.';
    } else if (lowerInput.includes('stop') || lowerInput.includes('cancel')) {
      stopCurrentSpeech();
      response = 'I\'ve stopped the current voice response. How else can I help you?';
    } else {
      response = 'I\'m here to help with navigation! You can ask me to set destinations, get route information, or use the quick actions below for popular locations.';
    }

    setTimeout(() => {
      addBotMessage(response);
      speakMessage(response);
    }, 500);
  };

  const handleVoiceInput = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop any current speech when starting voice input
    stopCurrentSpeech();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      recognitionRef.current = recognition;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText(finalTranscript);
        addUserMessage(finalTranscript);
        processUserInput(finalTranscript);
        setInputText('');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const quickActions = [
    { 
      text: 'Route Information', 
      icon: Info, 
      action: () => {
        const response = 'The route displays the optimal path between your current location and destination. You can see distance, estimated time, and turn-by-turn navigation details on the map.';
        addBotMessage(response);
        speakMessage(response);
      }
    },
    { 
      text: 'Navigate to CSE Block', 
      icon: MapPin, 
      action: () => {
        onDestinationSelect('CSE Block');
        addUserMessage('Navigate to CSE Block');
      }
    },
    { 
      text: 'Navigate to Biotech Block', 
      icon: MapPin, 
      action: () => {
        onDestinationSelect('Biotech Block');
        addUserMessage('Navigate to Biotech Block');
      }
    },
    { 
      text: 'Available Destinations', 
      icon: Navigation, 
      action: () => {
        const response = 'Available destinations include: CSE Block, Biotech Block, ECE Block, EEE Block, IT Block, Civil Block, Mechanical Dept, Library, Cafeteria, and many more campus locations. You can select from the dropdown menu or use voice commands.';
        addBotMessage(response);
        speakMessage(response);
      }
    },
    { 
      text: 'Route Distance', 
      icon: Clock, 
      action: () => {
        const response = selectedDestination 
          ? `The route to ${selectedDestination} shows the distance in kilometers with detailed path information. Check the top-left corner of the map for exact distance and navigation details.`
          : 'Please select a destination first to see the route distance and navigation information.';
        addBotMessage(response);
        speakMessage(response);
      }
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">AI Navigation Assistant</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by AI • Voice Enabled
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-2 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Animation Control */}
      {isSpeaking && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Google-style voice animation */}
              <div className="flex items-center space-x-1">
                <div className="w-2 h-8 bg-blue-500 rounded-full voice-wave"></div>
                <div className="w-2 h-8 bg-blue-500 rounded-full voice-wave"></div>
                <div className="w-2 h-8 bg-blue-500 rounded-full voice-wave"></div>
                <div className="w-2 h-8 bg-blue-500 rounded-full voice-wave"></div>
                <div className="w-2 h-8 bg-blue-500 rounded-full voice-wave"></div>
              </div>
              <span className="text-sm text-blue-700 font-medium gradient-text">AI is speaking...</span>
            </div>
            <button
              onClick={stopCurrentSpeech}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200 voice-pulse"
              title="Stop speaking"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-2 px-4 py-3 text-xs bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              <action.icon className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message or use voice..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <button
            onClick={isListening ? stopVoiceInput : handleVoiceInput}
            disabled={!isSupported}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600 voice-input-active enhanced-pulse'
                : isSupported
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {isListening && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs voice-input-active">
              <div className="w-2 h-2 bg-red-500 rounded-full enhanced-pulse"></div>
              <span>Listening...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox; 