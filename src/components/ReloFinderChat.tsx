/**
 * ReloFinderChat — Floating AI chat widget
 * Alpine slate (#2C3E50) + Coral (#FF6F61) color scheme
 * Rich cards: AgencyCards, ComparisonTable, CostTable, ReviewCard
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolData?: Record<string, any>;
}

// ─── Rich Card Components ───

function AgencyCards({ agencies }: { agencies: any[] }) {
  if (!agencies?.length) return null;
  return (
    <div className="space-y-2 mt-2">
      <div className="bg-[#2C3E50] text-white px-3 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        Top Matches
      </div>
      {agencies.map((a, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 bg-white">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#2C3E50]">{a.name}</span>
                {a.is_verified && (
                  <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Verified</span>
                )}
                {a.tier === 'preferred' && (
                  <span className="bg-[#FF6F61]/10 text-[#FF6F61] text-[9px] font-bold px-1.5 py-0.5 rounded-full">Preferred</span>
                )}
              </div>
              {a.tagline && <p className="text-[10px] text-gray-500 mt-0.5">{a.tagline}</p>}
            </div>
            {a.rating && (
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-[#2C3E50]">{a.rating}</span>
                  <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <span className="text-[9px] text-gray-400">{a.review_count} reviews</span>
              </div>
            )}
          </div>
          {a.services && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(a.services as string[]).slice(0, 4).map((s, j) => (
                <span key={j} className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <a href={a.profile_url} target="_blank" rel="noopener" className="flex-1 text-center py-1.5 text-[10px] font-semibold border border-[#2C3E50] text-[#2C3E50] rounded-lg hover:bg-[#2C3E50]/5 transition-colors">
              View Profile
            </a>
            {a.meeting_url && (
              <a href={a.meeting_url} target="_blank" rel="noopener" className="flex-1 text-center py-1.5 text-[10px] font-semibold bg-[#FF6F61] text-white rounded-lg hover:bg-[#FF6F61]/90 transition-colors">
                Book Call
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonTable({ agencies }: { agencies: any[] }) {
  if (!agencies?.length) return null;
  return (
    <div className="mt-2 overflow-x-auto">
      <div className="bg-[#2C3E50] text-white px-3 py-2 rounded-t-xl text-xs font-semibold">Side-by-Side Comparison</div>
      <table className="w-full text-[10px] border border-gray-200 rounded-b-xl overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1.5 text-left text-gray-500"></th>
            {agencies.map((a, i) => (
              <th key={i} className="px-2 py-1.5 text-center font-semibold text-[#2C3E50]">{a.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-2 py-1.5 text-gray-500">Rating</td>
            {agencies.map((a, i) => (
              <td key={i} className="px-2 py-1.5 text-center font-semibold">{a.rating ? `${a.rating} ★` : '—'}</td>
            ))}
          </tr>
          <tr className="border-t bg-gray-50/50">
            <td className="px-2 py-1.5 text-gray-500">Reviews</td>
            {agencies.map((a, i) => (
              <td key={i} className="px-2 py-1.5 text-center">{a.review_count}</td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-2 py-1.5 text-gray-500">Tier</td>
            {agencies.map((a, i) => (
              <td key={i} className="px-2 py-1.5 text-center capitalize">{a.tier}</td>
            ))}
          </tr>
          <tr className="border-t bg-gray-50/50">
            <td className="px-2 py-1.5 text-gray-500">Verified</td>
            {agencies.map((a, i) => (
              <td key={i} className="px-2 py-1.5 text-center">{a.is_verified ? '✓' : '—'}</td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-2 py-1.5 text-gray-500">Services</td>
            {agencies.map((a, i) => (
              <td key={i} className="px-2 py-1.5 text-center">{(a.services || []).length}</td>
            ))}
          </tr>
          <tr className="border-t bg-gray-50/50">
            <td className="px-2 py-1.5 text-gray-500">Positives</td>
            {agencies.map((a, i) => (
              <td key={i} className="px-2 py-1.5 text-[9px] text-green-700">{(a.positives || []).join(', ') || '—'}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="flex gap-2 mt-2">
        {agencies.map((a, i) => (
          <a key={i} href={a.profile_url} target="_blank" rel="noopener" className="flex-1 text-center py-1.5 text-[10px] font-semibold border border-[#2C3E50] text-[#2C3E50] rounded-lg hover:bg-[#2C3E50]/5 transition-colors">
            {a.name} →
          </a>
        ))}
      </div>
    </div>
  );
}

function CostTable({ costs, total, city }: { costs: Record<string, number>; total: number; city: string }) {
  return (
    <div className="mt-2">
      <div className="bg-[#2C3E50] text-white px-3 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2">
        <span>CHF</span> Monthly Costs — {city.charAt(0).toUpperCase() + city.slice(1)}
      </div>
      <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden">
        {Object.entries(costs).map(([key, val], i) => (
          <div key={key} className={`flex justify-between px-3 py-1.5 text-xs ${i % 2 ? 'bg-gray-50' : ''}`}>
            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="font-medium text-[#2C3E50]">CHF {val.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between px-3 py-2 bg-[#FF6F61]/10 text-sm font-bold border-t">
          <span className="text-[#2C3E50]">Total</span>
          <span className="text-[#FF6F61]">CHF {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Simple Markdown Renderer ───

function renderMarkdown(text: string) {
  // Split into lines for block-level parsing
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-0.5 my-1">
          {listItems.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    // List items (- or * or numbered)
    const listMatch = line.match(/^[\s]*[-*•]\s+(.+)/) || line.match(/^[\s]*\d+\.\s+(.+)/);
    if (listMatch) {
      listItems.push(listMatch[1]);
      return;
    }
    flushList();

    // Headers
    if (line.match(/^###\s+/)) {
      elements.push(<p key={i} className="font-bold text-xs mt-2 mb-0.5">{renderInline(line.replace(/^###\s+/, ''))}</p>);
    } else if (line.match(/^##\s+/)) {
      elements.push(<p key={i} className="font-bold text-sm mt-2 mb-0.5">{renderInline(line.replace(/^##\s+/, ''))}</p>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>);
    }
  });
  flushList();

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Process bold, italic, and links with regex
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    // Link [text](url)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)/s);

    // Find earliest match
    let earliestType: string | null = null;
    let earliestIndex = remaining.length;

    if (boldMatch && boldMatch[1].length < earliestIndex) {
      earliestIndex = boldMatch[1].length;
      earliestType = 'bold';
    }
    if (linkMatch && linkMatch[1].length < earliestIndex) {
      earliestIndex = linkMatch[1].length;
      earliestType = 'link';
    }

    if (earliestType === 'bold' && boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else if (earliestType === 'link' && linkMatch) {
      if (linkMatch[1]) parts.push(<span key={key++}>{linkMatch[1]}</span>);
      parts.push(
        <a key={key++} href={linkMatch[3]} target="_blank" rel="noopener" className="text-[#FF6F61] underline hover:text-[#e5635a]">
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ─── Main Chat Component ───

export default function ReloFinderChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summarySentRef = useRef(false);
  const allToolsUsedRef = useRef<string[]>([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('relofinder:open-chat', handler);
    return () => window.removeEventListener('relofinder:open-chat', handler);
  }, []);

  // Inactivity timer — send transcript email after 3 min of no new messages
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    summarySentRef.current = false; // allow re-send if user continues chatting
    inactivityTimer.current = setTimeout(() => {
      if (summarySentRef.current) return;
      // Need at least 2 messages (1 user + 1 assistant) to be worth sending
      const currentMessages = messagesRef.current;
      if (currentMessages.length < 2) return;
      summarySentRef.current = true;
      fetch('/api/chat-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          toolsUsed: allToolsUsedRef.current,
          pageUrl: window.location.href,
        }),
      }).catch(() => {}); // fire-and-forget
    }, 3 * 60 * 1000); // 3 minutes
  }, []);

  // Keep a ref to messages so the timer callback sees the latest
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      // Track tools used for summary email
      if (data.toolsUsed?.length) {
        allToolsUsedRef.current = [...new Set([...allToolsUsedRef.current, ...data.toolsUsed])];
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        toolData: data.toolData,
      }]);
      resetInactivityTimer();
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'I need help moving to Zurich',
    'Compare top agencies',
    'What permits do I need?',
    'Living costs in Switzerland',
  ];

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#2C3E50] to-[#1a252f] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[400px] sm:h-[620px] flex flex-col bg-white sm:rounded-2xl sm:shadow-2xl sm:border border-gray-200 overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#1a252f] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FF6F61] rounded-full flex items-center justify-center text-xs font-bold">RF</div>
              <div>
                <p className="font-semibold text-sm">ReloFinder AI</p>
                <p className="text-[10px] text-gray-300">Find your perfect agency</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#2C3E50] rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">RF</span>
                </div>
                <p className="text-sm font-semibold text-[#2C3E50] mb-1">Welcome to ReloFinder AI</p>
                <p className="text-xs text-gray-500 mb-4 max-w-[280px] mx-auto">
                  I'll help you find and compare the best relocation agencies in Switzerland.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(p)}
                      className="px-3 py-1.5 text-[11px] font-medium border border-[#2C3E50]/20 rounded-full text-[#2C3E50] hover:bg-[#2C3E50]/5 hover:border-[#2C3E50]/40 transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 bg-[#2C3E50] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-[8px] font-bold">RF</span>
                  </div>
                )}
                <div className={`max-w-[85%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#2C3E50] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}>
                    {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                  </div>
                  {/* Rich cards */}
                  {m.toolData?.agencies && <AgencyCards agencies={m.toolData.agencies} />}
                  {m.toolData?.comparison && <ComparisonTable agencies={m.toolData.comparison} />}
                  {m.toolData?.costs && <CostTable costs={m.toolData.costs} total={m.toolData.costsTotal} city={m.toolData.costsCity} />}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-[#2C3E50] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[8px] font-bold">RF</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white px-3 py-2 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about agencies, permits, costs..."
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#FF6F61] focus:ring-0 focus:outline-none bg-gray-50"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-[#FF6F61] text-white rounded-xl text-sm font-semibold hover:bg-[#e5635a] transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-1">Powered by ReloFinder AI · Responses may not be 100% accurate</p>
          </div>
        </div>
      )}
    </>
  );
}
