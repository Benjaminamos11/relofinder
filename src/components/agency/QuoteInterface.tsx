import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, MapPin, DollarSign, Calendar, MessageSquare, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface QuoteInterfaceProps {
    token?: string;
}

export default function QuoteInterface({ token: propToken }: QuoteInterfaceProps) {
    const [token, setToken] = useState<string | null>(propToken || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [quoteData, setQuoteData] = useState<any>(null);
    const [lead, setLead] = useState<any>(null);

    // Initialize token from URL if not provided as prop
    useEffect(() => {
        if (!propToken && typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const urlToken = searchParams.get('token');
            if (urlToken) {
                setToken(urlToken);
            } else {
                // Only error if we are on client and no token is present
                setLoading(false);
                setError('No access token provided.');
            }
        }
    }, [propToken]);

    // Form State
    const [price, setPrice] = useState('');
    const [availability, setAvailability] = useState<'available' | 'fully_booked'>('available');
    const [message, setMessage] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (token === 'demo') {
                setQuoteData({ id: 'demo-quote-123', status: 'pending' });
                setLead({
                    dest: 'Zurich',
                    origin: 'London',
                    budget: 'CHF 4,500',
                    move_date: '2025-05-15',
                    services_needed: ['Home Search', 'Settling In'],
                    message: 'Moving with a dog and requires a garden.'
                });
                setLoading(false);
                return;
            }

            if (!token) {
                // Wait for token to be set by the other effect
                return;
            }

            try {
                // 1. Fetch Quote based on Token
                const { data: quote, error: quoteFetchError } = await supabase
                    .from('quotes')
                    .select('*, lead:leads(*)')
                    .eq('token', token)
                    .single();

                if (quoteFetchError || !quote) {
                    console.error('Error fetching quote:', quoteFetchError);
                    setError('Quote request not found or link expired.');
                    setLoading(false);
                    return;
                }

                if (quote.status === 'submitted') {
                    setSuccess(true); // Already submitted
                }

                setQuoteData(quote);
                setLead(quote.lead);

                // Pre-fill if editing allowed later
                if (quote.price) setPrice(quote.price);
                if (quote.message) setMessage(quote.message);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error: updateError } = await supabase
                .from('quotes')
                .update({
                    price: parseFloat(price),
                    availability,
                    message,
                    meeting_link: meetingLink,
                    status: 'submitted',
                    updated_at: new Date().toISOString()
                })
                .eq('id', quoteData.id);

            if (updateError) throw updateError;
            setSuccess(true);
        } catch (err: any) {
            alert('Error submitting quote: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F61]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FF6F61]">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Quote Submitted!</h2>
                    <p className="text-slate-500 mb-6">Thank you. The client has been notified of your proposal.</p>
                    <div className="bg-slate-50 rounded-lg p-4 text-left text-sm text-slate-600">
                        <p className="font-bold mb-1">Your Proposal:</p>
                        <p>CHF {price}</p>
                        <p className="italic">"{message}"</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 px-8 py-8 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-2xl font-bold tracking-tight mb-6 text-[#FF6F61] font-serif">Relofinder</div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">New Opportunity</p>
                                <h1 className="text-3xl font-bold font-serif">Relocation to {lead?.dest || lead?.destination_canton}</h1>
                                <p className="text-slate-400 mt-2 opacity-90">Request ID: #{quoteData?.id.substring(0, 8)}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Client Budget</p>
                                <p className="text-xl font-bold text-white">{lead?.budget || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Lead Stats */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                        <div className="p-6 text-center">
                            <Clock className="w-6 h-6 text-[#FF6F61] mx-auto mb-2" />
                            <p className="text-xs text-slate-400 uppercase font-bold">Move Date</p>
                            <p className="text-slate-900 font-medium">{lead?.move_date || 'Flexible'}</p>
                        </div>
                        <div className="p-6 text-center">
                            <MapPin className="w-6 h-6 text-[#FF6F61] mx-auto mb-2" />
                            <p className="text-xs text-slate-400 uppercase font-bold">Origin</p>
                            <p className="text-slate-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{lead?.origin || 'International'}</p>
                        </div>
                        <div className="p-6 text-center">
                            <CheckCircle className="w-6 h-6 text-[#FF6F61] mx-auto mb-2" />
                            <p className="text-xs text-slate-400 uppercase font-bold">Services</p>
                            <p className="text-slate-900 font-medium">{lead?.services_needed?.length || 0} requested</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Client Profile (Anonymized)</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            {lead?.message || "Client is looking for relocation assistance. Please review the requirements and submit your best offer."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {lead?.services_needed?.map((s: string) => (
                                <span key={s} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Proposal Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900">Submit Your Proposal</h2>
                        <p className="text-sm text-slate-500">Your quote will be sent directly to the client dashboard.</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <DollarSign size={16} className="text-[#FF6F61]" /> Estimated Price (CHF)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 2500"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF6F61] focus:border-[#FF6F61] outline-none transition-all text-lg font-medium"
                                />
                                <p className="text-xs text-slate-400">Indicate an initial estimate. Final scope and price can be refined during the client meeting.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Calendar size={16} className="text-[#FF6F61]" /> Availability
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAvailability('available')}
                                        className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all text-center ${availability === 'available' ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Available
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAvailability('fully_booked')}
                                        className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all text-center ${availability === 'fully_booked' ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        Fully Booked
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <MessageSquare size={16} className="text-[#FF6F61]" /> Personal Message
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Dear client, based on your needs we can offer..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF6F61] focus:border-[#FF6F61] outline-none transition-all text-slate-600"
                            ></textarea>
                            <p className="text-xs text-slate-400">Explain your value proposition or ask clarifying questions.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <LinkIcon size={16} className="text-[#FF6F61]" /> Discovery Call Link (Optional)
                            </label>
                            <input
                                type="url"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="https://calendly.com/your-agency/intro"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#FF6F61] focus:border-[#FF6F61] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#FF6F61] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-[#e53222] transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Sending Proposal...' : 'Submit Proposal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
