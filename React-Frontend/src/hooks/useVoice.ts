import { useState, useCallback, useRef } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!isSupported) return;

    // Stop any current speech when starting to listen
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      recognitionRef.current = recognition;
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      onResult(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      stopSpeaking();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and prioritize smooth, clear female voices
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        // Prioritize smooth, clear female voices
        voice.name.includes('Samantha') || 
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Alexandra') ||
        voice.name.includes('Emma') ||
        voice.name.includes('Sophie') ||
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Microsoft Eva') ||
        voice.name.includes('Google US English Female') ||
        voice.name.includes('Google UK English Female') ||
        // Fallback to other good voices
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Daniel')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Smooth, clear, natural speech settings
      utterance.rate = 0.95;       // Slightly slower for clarity
      utterance.pitch = 1.05;      // Natural pitch for clear female voice
      utterance.volume = 0.95;     // Clear volume
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        currentUtteranceRef.current = utterance;
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};