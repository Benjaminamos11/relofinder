import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Mail,
    ArrowRight,
    Lock,
    Loader2,
    CheckCircle,
    AlertCircle,
    LockKeyhole
} from 'lucide-react';

export default function UnifiedLogin() {
    const [view, setView] = useState<'magic' | 'admin'>('magic');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/agency/dashboard`, // Default redirect for agencies
                },
            });

            if (error) throw error;

            setFeedback({
                type: 'success',
                message: 'Check your email for the secure login link.',
            });
        } catch (err: any) {
            setFeedback({
                type: 'error',
                message: err.message || 'Failed to send magic link.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: 'admin@relofinder.ch',
                password,
            });

            if (error) throw error;

            // Redirect on success
            window.location.href = '/admin/dashboard';
        } catch (err: any) {
            setFeedback({
                type: 'error',
                message: err.message || 'Invalid credentials.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
            {/* Header */}
            <div className="bg-slate-900 px-8 py-8 text-center relative">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#FF6F61]">
                        {view === 'magic' ? <Mail size={24} /> : <Lock size={24} />}
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    {view === 'magic' ? 'Agency Access' : 'Admin Console'}
                </h1>
                <p className="text-slate-400 text-sm">
                    {view === 'magic'
                        ? 'Enter your partner email to receive a secure login link.'
                        : 'Restricted access. Authorized personnel only.'}
                </p>

                {/* Secret Toggle */}
                <button
                    onClick={() => {
                        setView(view === 'magic' ? 'admin' : 'magic');
                        setFeedback(null);
                        setPassword('');
                    }}
                    className="absolute bottom-2 right-2 p-2 text-slate-800 hover:text-slate-600 transition-colors opacity-10 hover:opacity-100"
                    title="Toggle Access Mode"
                >
                    <LockKeyhole size={14} />
                </button>
            </div>

            {/* Body */}
            <div className="p-8">
                {feedback && (
                    <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${feedback.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                        <span className="leading-relaxed">{feedback.message}</span>
                    </div>
                )}

                {view === 'magic' ? (
                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="partner@agency.com"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF6F61] hover:bg-[#ff5d4d] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#FF6F61]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Send Magic Link <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Admin Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all font-mono"
                                autoFocus
                                required
                            />
                            <p className="text-[10px] text-slate-400 ml-1">
                                Logging in as <span className="font-mono text-slate-500">admin@relofinder.ch</span>
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Access Console <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Footer decoration */}
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    ReloFinder Secure Access
                </p>
            </div>
        </div>
    );
}
