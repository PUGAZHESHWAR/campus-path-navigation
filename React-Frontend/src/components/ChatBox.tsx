import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, MapPin, Navigation, Clock, Info } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  selectedDestination: string | null;
  onDestinationSelect: (destination: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ selectedDestination, onDestinationSelect }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your navigation assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedDestination) {
      const botResponse = `Great! I've set your destination to ${selectedDestination}. The route is now displayed on the map. You can see the optimal path with start and end markers.`;
      addBotMessage(botResponse);
      speakMessage(botResponse);
    }
  }, [selectedDestination]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
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
      response = 'Hello! How can I help you with navigation today?';
    } else if (lowerInput.includes('destination') || lowerInput.includes('where')) {
      response = 'You can select a destination from the dropdown menu or use voice commands. Try saying "Navigate to [destination name]" or use the quick actions below.';
    } else if (lowerInput.includes('navigate') || lowerInput.includes('go to')) {
      const destinationMatch = input.match(/navigate to (.+)/i) || input.match(/go to (.+)/i);
      if (destinationMatch) {
        const destination = destinationMatch[1];
        onDestinationSelect(destination);
        response = `Setting destination to ${destination}. Please check the dropdown to confirm the selection.`;
      } else {
        response = 'Please specify a destination. For example: "Navigate to CSE Block" or "Go to Biotech Block"';
      }
    } else if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
      response = 'I can help you with navigation! I can set destinations, provide route information, and answer questions about campus locations. Try using the quick actions or voice commands.';
    } else if (lowerInput.includes('route') || lowerInput.includes('path')) {
      response = 'The route is displayed on the map with colored dots and lines. Green markers show the start point, red markers show the destination, and the orange line shows the optimal path.';
    } else {
      response = 'I\'m here to help with navigation! You can ask me to set destinations, get route information, or use the quick actions below.';
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

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const quickActions = [
    { text: 'Show Route Info', icon: Info, action: () => {
      const response = 'The route shows the optimal path between your current location and destination. Distance and point count are displayed in the top-left corner.';
      addBotMessage(response);
      speakMessage(response);
    }},
    { text: 'Navigate to CSE Block', icon: MapPin, action: () => {
      onDestinationSelect('CSE Block');
      addUserMessage('Navigate to CSE Block');
    }},
    { text: 'Navigate to Biotech Block', icon: MapPin, action: () => {
      onDestinationSelect('Biotech Block');
      addUserMessage('Navigate to Biotech Block');
    }},
    { text: 'Show All Destinations', icon: Navigation, action: () => {
      const response = 'Available destinations include: CSE Block, Biotech Block, ECE Block, EEE Block, IT Block, Civil Block, Mechanical Dept, and many more. You can select from the dropdown menu.';
      addBotMessage(response);
      speakMessage(response);
    }},
    { text: 'Route Distance', icon: Clock, action: () => {
      const response = selectedDestination 
        ? `The route to ${selectedDestination} shows the distance in kilometers. Check the top-left corner of the map for exact details.`
        : 'Please select a destination first to see the route distance.';
      addBotMessage(response);
      speakMessage(response);
    }}
  ];

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800">Navigation Assistant</h3>
        <p className="text-sm text-gray-600">Ask me about routes, destinations, and navigation</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.isUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-2 px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <action.icon className="w-4 h-4" />
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleVoiceInput}
            disabled={isListening || !isSupported}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isListening
                ? 'bg-red-500 text-white'
                : isSupported
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox; 