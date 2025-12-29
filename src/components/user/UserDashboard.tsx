import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, Calendar, MessageSquare, ArrowRight, Loader2, Play } from 'lucide-react';

interface UserDashboardProps {
    token?: string;
}

export default function UserDashboard({ token: propToken }: UserDashboardProps) {
    const [token, setToken] = useState<string | null>(propToken || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lead, setLead] = useState<any>(null);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

    // Initialize token from URL if not provided as prop
    useEffect(() => {
        if (!propToken && typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const urlToken = searchParams.get('token');
            if (urlToken) {
                setToken(urlToken);
            } else {
                setLoading(false);
                setError('No access token provided.');
            }
        }
    }, [propToken]);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Demo Mode
                if (token === 'demo') {
                    setLead({
                        first_name: 'Sarah',
                        dest: 'Zurich',
                        status: 'quotes_ready'
                    });
                    setQuotes([
                        {
                            id: 'q1',
                            agency_name: 'Prime Relocation',
                            price: 2500,
                            message: 'We specialize in Zurich relocations and have availability for your dates.',
                            status: 'submitted',
                            meeting_link: 'https://calendly.com',
                            agency: { logo: '/images/companies/prime-relocation-logo.png' }
                        },
                        {
                            id: 'q2',
                            agency_name: 'Welcome Service',
                            price: 2800,
                            message: 'Full comprehensive package including school search.',
                            status: 'submitted',
                            meeting_link: 'https://calendly.com',
                            agency: { logo: '/images/companies/welcome-service-logo.jpg' }
                        }
                    ]);
                    setLoading(false);
                    return;
                }

                // 1. Fetch Lead by Token/ID
                const { data: leadData, error: leadError } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('id', token)
                    .single();

                if (leadError || !leadData) {
                    throw new Error('User not found.');
                }
                setLead(leadData);

                // 2. Fetch Quotes
                const { data: quotesData, error: quotesError } = await supabase
                    .from('quotes')
                    .select('*')
                    .eq('lead_id', leadData.id)
                    .eq('status', 'submitted');

                if (quotesError) throw quotesError;
                setQuotes(quotesData || []);

            } catch (err: any) {
                console.error('Error fetching dashboard:', err);
                setError('Could not load your dashboard. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleAccept = async (quote: any) => {
        if (!confirm(`Are you sure you want to accept the quote from ${quote.agency_name || 'this agency'}? This will notify them to schedule a call.`)) return;

        setAcceptingQuoteId(quote.id);

        try {
            // Use Server API for secure processing
            const response = await fetch('/api/leads/accept-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId: quote.id })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to accept quote');
            }

            // Redirect
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            } else {
                alert('Success! The agency will contact you shortly.');
                setAcceptingQuoteId(null);
            }

        } catch (err: any) {
            alert('Error accepting quote: ' + err.message);
            setAcceptingQuoteId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <Loader2 className="w-8 h-8 text-[#FF6F61] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900 font-serif">Access Issue</h2>
                    <p className="text-slate-500 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    // Modern Minimalist Progress Steps
    const steps = [
        { id: 1, label: 'Request', status: 'completed' },
        { id: 2, label: 'Audit', status: 'completed' },
        { id: 3, label: 'Quotes', status: 'active' },
        { id: 4, label: 'Connect', status: 'pending' },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans">
            {/* 1. Ultra-Clean Header (White, Border-b) */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <a href="/" className="text-2xl font-bold tracking-tight text-[#FF6F61]" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Relofinder
                    </a>

                    {/* User Profile Pill */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-slate-900">{lead?.first_name || 'Client'}</p>
                            <p className="text-xs text-slate-500">View Profile</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {(lead?.first_name || 'C').substring(0, 1)}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* 2. Welcome & Status */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-4">
                        Move Dashboard
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                        Welcome back, {lead?.first_name}.
                    </h1>
                    <p className="text-lg text-slate-500 font-light">
                        We are currently managing your relocation process to <span className="font-semibold text-slate-900">{lead?.dest || lead?.destination_canton}</span>.
                    </p>
                </div>

                {/* 3. Minimal Progress Bar */}
                <div className="bg-white border border-slate-100 rounded-2xl p-8 mb-16 shadow-sm">
                    <div className="relative">
                        {/* Line */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -translate-y-1/2 z-0"></div>

                        <div className="relative z-10 flex justify-between">
                            {steps.map((step) => (
                                <div key={step.id} className="flex flex-col items-center gap-3 bg-white px-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                        ${step.status === 'completed' ? 'bg-slate-900 text-white' :
                                            step.status === 'active' ? 'bg-[#FF6F61] text-white shadow-lg shadow-orange-500/20 scale-110' :
                                                'bg-white border border-slate-200 text-slate-300'}`}>
                                        {step.status === 'completed' ? <CheckCircle size={14} /> : step.id}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step.status === 'active' ? 'text-[#FF6F61]' : step.status === 'completed' ? 'text-slate-900' : 'text-slate-300'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Main Content Area */}
                {quotes.length > 0 ? (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 font-serif">Available Proposals</h2>
                            <span className="text-xs font-bold text-white bg-[#FF6F61] px-3 py-1 rounded-full shadow-md shadow-orange-500/20 animate-pulse">
                                Requires Action
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {quotes.map((quote) => (
                                <div key={quote.id} className="group bg-white rounded-xl border border-slate-100 hover:border-slate-200 p-0 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col">

                                    {/* Card Header */}
                                    <div className="p-8 pb-6 border-b border-slate-50 flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-2 shadow-sm">
                                                {quote.agency?.logo ? (
                                                    <img src={quote.agency.logo} alt={quote.agency_name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-300">LOGO</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{quote.agency_name}</h3>
                                                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                                                    <CheckCircle size={12} className="text-slate-900" /> Verified Partner
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quote Body */}
                                    <div className="p-8 pt-6 flex-grow flex flex-col">

                                        <div className="mb-8">
                                            <div className="flex items-start gap-3">
                                                <MessageSquare className="w-4 h-4 text-[#FF6F61] mt-1 flex-shrink-0" />
                                                <p className="text-slate-600 text-sm italic leading-relaxed font-serif">
                                                    "{quote.message}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="flex items-end justify-between mb-8">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Estimate</p>
                                                    <p className="text-3xl font-bold text-slate-900">CHF {quote.price}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAccept(quote)}
                                                disabled={!!acceptingQuoteId}
                                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {acceptingQuoteId === quote.id ? (
                                                    <>Processing...</>
                                                ) : (
                                                    <>Accept Proposal <ArrowRight size={16} className="text-[#FF6F61]" /></>
                                                )}
                                            </button>
                                            <p className="text-xs text-center text-slate-400 mt-4">
                                                No obligation meeting via Calendly.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Waiting State - High End */
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Clock className="w-8 h-8 text-[#FF6F61]" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Auditing the Market</h2>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
                            We are currently negotiating with verified agencies in {lead?.dest || 'your destination'} to secure the best rates for your relocation.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Estimated time: 12 hours
                        </div>
                    </div>
                )}

            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 mt-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400">
                    <div>
                        &copy; {new Date().getFullYear()} Relofinder. All rights reserved.
                    </div>
                    <div className="flex gap-8 font-medium">
                        <a href="https://expat-savvy.ch/legal/privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="https://expat-savvy.ch/legal/terms" className="hover:text-slate-900 transition-colors">Terms</a>
                        <a href="mailto:support@relofinder.ch" className="hover:text-slate-900 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

