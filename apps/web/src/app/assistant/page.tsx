'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, Send, Bot, User, Zap, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STARTERS = [
  'What is the current factory energy status?',
  'Which machines are consuming the most power?',
  'Explain the latest AI decision',
  'How can I reduce peak demand?',
  'What anomalies have been detected today?',
  'Give me an energy optimization summary',
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm the POWERGUARD AI Assistant. I can help you understand factory energy patterns, explain AI decisions, analyze machine performance, and answer questions about your industrial energy management system. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setInput('');

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const context = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetchApi('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: content.trim(), context }),
      });
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.data?.reply || res.reply || 'I could not generate a response at this time.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `a-err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. Please ensure the AI microservice is running on port 8000.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask questions about your factory, energy patterns, and AI decisions"
        icon={MessageSquareCode}
      />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-tr from-emerald-600 to-cyan-500'
                : 'bg-gradient-to-tr from-purple-600 to-blue-500'
            }`}>
              {msg.role === 'assistant' ? <Zap className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'card-industrial border border-white/8 text-slate-200 rounded-tl-sm'
                  : 'bg-gradient-to-br from-emerald-600/30 to-cyan-600/20 border border-emerald-500/20 text-white rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-600 font-mono px-1">
                {msg.role === 'assistant' ? 'POWERGUARD AI' : (user?.name || 'You')} · {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="card-industrial border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="card-industrial rounded-2xl border border-white/10 p-3 flex gap-3 items-end">
        <textarea
          ref={inputRef}
          id="assistant-chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about energy consumption, machine status, AI decisions..."
          rows={2}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
        />
        <button
          id="assistant-send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
      <p className="text-[10px] text-slate-600 text-center mt-2 font-mono">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
