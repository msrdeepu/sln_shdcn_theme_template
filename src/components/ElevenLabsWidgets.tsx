import React, { useState, useEffect, useRef } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Volume2,
} from 'lucide-react';

interface ChatMessage {
  id: number | string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ElevenLabsWidgetsProps {
  chatbotAgentId?: string;
  voicebotAgentId?: string;
}

// -------------------------------------------------------------
// VOICEBOT COMPONENT (Bottom Left)
// -------------------------------------------------------------
function VoiceBotInner({ agentId }: { agentId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage(null);
      setIsExpanded(true);
    },
    onDisconnect: () => {
      setCallDuration(0);
    },
    onError: (err) => {
      console.warn('Voicebot connection error:', err);
      setErrorMessage('Could not connect. Please ensure microphone access is allowed.');
    },
  });

  const { status, isSpeaking, isListening, isMuted, setMuted } = conversation;
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  // Call timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleCall = async () => {
    setErrorMessage(null);
    if (isConnected || isConnecting) {
      conversation.endSession();
      setIsExpanded(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsExpanded(true);
        conversation.startSession({ agentId });
      } catch (err) {
        console.warn('Microphone permission denied:', err);
        setErrorMessage('Microphone access is required for voice calls.');
        setIsExpanded(true);
      }
    }
  };

  return (
    <>
      {/* Active Call Floating Panel */}
      {isExpanded && (
        <div
          role="region"
          aria-label="AI Voice Call Assistant"
          className="fixed bottom-24 left-6 z-50 w-80 max-w-[calc(100vw-3rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-5 text-white animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isConnected ? 'bg-emerald-500' : isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </span>
              <div>
                <h4 className="text-sm font-semibold leading-tight tracking-wide text-slate-100">
                  SLN Voice Assistant
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isConnected ? `In Call • ${formatTime(callDuration)}` : isConnecting ? 'Connecting live call...' : 'Idle'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isConnected || isConnecting) conversation.endSession();
                setIsExpanded(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close Voice Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-200 text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Visual Waveform / Call State */}
          <div className="py-6 flex flex-col items-center justify-center gap-3">
            {isConnecting ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-300">Connecting to voice agent...</span>
              </div>
            ) : isConnected ? (
              <div className="flex flex-col items-center gap-3">
                {/* Dynamic Waveform Bars */}
                <div className="flex items-center gap-1.5 h-10 px-4">
                  {[40, 75, 55, 95, 65, 85, 45].map((height, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isSpeaking
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                          : isListening
                          ? 'bg-gradient-to-t from-blue-500 to-indigo-300'
                          : 'bg-slate-700'
                      }`}
                      style={{
                        height: isSpeaking || isListening ? `${height}%` : '20%',
                        animation:
                          isSpeaking || isListening
                            ? `pulse 0.8s ease-in-out infinite ${idx * 0.1}s`
                            : 'none',
                      }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      isSpeaking
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isListening
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Volume2 className="w-3 h-3 animate-pulse" /> Speaking...
                      </>
                    ) : isListening ? (
                      <>
                        <Mic className="w-3 h-3 animate-pulse" /> Listening to you...
                      </>
                    ) : (
                      'Connected'
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 px-2">
                Click the call button to start an instant voice conversation with our AI assistant.
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-800/80">
            {isConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => setMuted(!isMuted)}
                  className={`p-3 rounded-full border transition-all ${
                    isMuted
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleCall}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-lg shadow-red-900/40 transition-all hover:scale-105"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleToggleCall}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Start Voice Call'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-50 group">
        <button
          type="button"
          onClick={handleToggleCall}
          aria-label={isConnected ? 'End voice call' : 'Talk with AI Assistant'}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-white ${
            isConnected
              ? 'bg-red-600 hover:bg-red-500 shadow-red-900/50 ring-4 ring-red-400/40'
              : isConnecting
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/50 ring-4 ring-amber-400/40'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40 hover:shadow-emerald-600/50 ring-2 ring-emerald-400/30'
          }`}
        >
          {isConnected ? (
            <PhoneOff className="w-6 h-6 animate-pulse" />
          ) : isConnecting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <PhoneCall className="w-6 h-6" />
          )}

          {/* Pulse ring when active */}
          {isConnected && (
            <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none opacity-60" />
          )}
        </button>

        {/* Hover Tooltip */}
        {!isExpanded && (
          <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 border border-slate-700/60 hidden sm:block">
            {isConnected ? 'In Call • Click to End' : 'Talk with AI Voice Assistant'}
          </span>
        )}
      </div>
    </>
  );
}

// -------------------------------------------------------------
// CHATBOT COMPONENT (Bottom Right)
// -------------------------------------------------------------
function ChatBotInner({ agentId }: { agentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your AI Property Assistant. How can I help you explore this project today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Chatbot connected');
    },
    onDisconnect: () => {
      console.log('Chatbot disconnected');
      setIsTyping(false);
    },
    onMessage: (payload) => {
      if (payload && payload.message) {
        const isUser = payload.role === 'user' || payload.source === 'user';
        if (!isUser) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              sender: 'ai',
              text: payload.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
    },
    onError: (err) => {
      console.warn('Chatbot error:', err);
      setIsTyping(false);
    },
  });

  const { status } = conversation;

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Connect session on first open if needed
  useEffect(() => {
    if (isOpen && status === 'disconnected') {
      try {
        conversation.startSession({ agentId, textOnly: true });
      } catch (err) {
        console.warn('Failed to start chat session:', err);
      }
    }
  }, [isOpen, status, agentId, conversation]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Add user message to history
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (status === 'connected') {
        conversation.sendUserMessage(text);
      } else {
        conversation.startSession({ agentId, textOnly: true });
        // Attempt sending once connection finishes
        setTimeout(() => {
          try {
            conversation.sendUserMessage(text);
          } catch {
            // fallback
          }
        }, 1200);
      }
    } catch (err) {
      console.warn('Error sending user message:', err);
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'Available plot sizes & pricing',
    'Clubhouse & amenities list',
    'How do I schedule a site visit?',
  ];

  return (
    <>
      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          role="region"
          aria-label="AI Chat Assistant"
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 leading-tight">
                  SLN Assistant
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {status === 'connected' ? 'Online • Ready to help' : 'Connecting AI...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200/80' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0 text-blue-200 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-slate-400">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/60 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about this project..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-blue-900/30"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close chat' : 'Chat with AI Assistant'}
          className={`relative p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-white ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-700 shadow-slate-950/50 ring-2 ring-slate-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40 hover:shadow-blue-600/50 ring-2 ring-blue-400/30'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}

          {/* Notification dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          )}
        </button>

        {/* Hover Tooltip */}
        {!isOpen && (
          <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 border border-slate-700/60 hidden sm:block">
            Chat with AI Assistant
          </span>
        )}
      </div>
    </>
  );
}

// -------------------------------------------------------------
// MAIN EXPORTED COMPONENT
// -------------------------------------------------------------
export default function ElevenLabsWidgets({
  chatbotAgentId = 'agent_5801ky7b7a2ce9prsm6nvbs4vd1y',
  voicebotAgentId = 'agent_8301ky7bmb15eyhr96n57zev4a26',
}: ElevenLabsWidgetsProps) {
  const hasVoice = Boolean(voicebotAgentId && voicebotAgentId.trim() !== '');
  const hasChat = Boolean(chatbotAgentId && chatbotAgentId.trim() !== '');

  return (
    <>
      {/* Voicebot on Bottom Left */}
      {hasVoice && (
        <ConversationProvider>
          <VoiceBotInner agentId={voicebotAgentId} />
        </ConversationProvider>
      )}

      {/* Chatbot on Bottom Right */}
      {hasChat && (
        <ConversationProvider>
          <ChatBotInner agentId={chatbotAgentId} />
        </ConversationProvider>
      )}
    </>
  );
}
