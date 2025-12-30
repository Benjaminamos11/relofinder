import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    UserCircle,
    Users,
    Settings,
    LogOut,
    Bell,
    ExternalLink,
    TrendingUp,
    Eye,
    Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProfileEditor from './ProfileEditor';

// Swiss Stats Card
const StatCard = ({ icon: Icon, label, value, trend, trendUp }: any) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <Icon size={20} />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {trend}
                </span>
            )}
        </div>
        <div>
            <h4 className="text-2xl font-bold text-slate-900 font-serif">{value}</h4>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{label}</span>
        </div>
    </div>
);

// High-End Sidebar Item
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 ${active
            ? 'border-[#FF6F61] bg-white/5 text-white'
            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

export default function DashboardLayout() {
    const [view, setView] = useState('profile'); // profile, leads
    const [loading, setLoading] = useState(true);
    const [partner, setPartner] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [stats, setStats] = useState({ views: 0, leads: 0, rating: '5.0' });

    useEffect(() => {
        checkSession();
    }, [refreshKey]);

    useEffect(() => {
        if (partner?.id) fetchStats();
    }, [partner]);

    const fetchStats = async () => {
        if (!partner) return;

        // 1. Real Leads Count
        const { count: leadsCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('relocator_id', partner.id);

        // 2. Views (Real + Exaggerated Logic)
        let views = 0;
        const { data: analytics } = await supabase
            .from('company_analytics')
            .select('views_count')
            .eq('company_id', partner.id)
            .single();

        if (analytics && analytics.views_count > 0) {
            views = analytics.views_count * 3 + 127; // "Exaggerated" as requested
        } else {
            // Fallback exaggeration based on ID to be consistent but "active"
            const idSum = partner.id.split('').reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0);
            views = (idSum % 500) + 840;
        }

        // 3. Rating (Real from DB)
        const rating = partner.rating || partner.google_rating || 5.0;

        setStats({
            leads: leadsCount || 0,
            views: views,
            rating: Number(rating).toFixed(1)
        });
    };

    const checkSession = async () => {
        // DEV MODE BYPASS
        const params = new URLSearchParams(window.location.search);
        if (params.get('dev') === 'true') {
            setPartner({
                id: 'mock-id',
                name: 'Expat Savvy',
                bio: 'FINMA-certified independent insurance broker specializing in comprehensive health insurance solutions and financial services for expatriates relocating to Switzerland.',
                website: 'https://expat-savvy.ch/',
                contact_email: 'contact@expat-savvy.ch',
                logo: null,
                price_tier: 2,
                capacity_status: 'active',
                is_verified: true,
                regions_served: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Zug', 'Vaud', 'Lucerne', 'Ticino'],
                services: ['Home Search', 'Visa & Immigration', 'School Search', 'Settling In', 'Departure Support', 'Short-term Accommodation', 'Spouse Support'],
                languages: ['English', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Russian', 'Mandarin'],
                certifications: ['EuRA Member', 'EuRA Global Quality Seal', 'SARA Member', 'FIDI FAIM', 'CERC', 'IAM', 'Worldwide ERC'],
                founded: 2016,
                employees: '1-10'
            });
            setLoading(false);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/agency/login';
            return;
        }

        let { data: profile, error } = await supabase
            .from('relocators')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

        if (!profile && session.user.email) {
            const domain = session.user.email.split('@')[1];
            let query = supabase.from('relocators').select('*');
            const isGeneric = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain);

            if (domain && !isGeneric) {
                query = query.or(`contact_email.eq.${session.user.email},website.ilike.%${domain}%`);
            } else {
                query = query.or(`contact_email.eq.${session.user.email}`);
            }

            const { data: byEmail } = await query.limit(1).single();

            if (byEmail) {
                profile = byEmail;
                supabase.from('relocators')
                    .update({ auth_user_id: session.user.id })
                    .eq('id', byEmail.id)
                    .then(({ error: updateErr }) => {
                        if (updateErr) console.warn("Could not auto-link auth_id:", updateErr.message);
                    });
            }
        }

        if (profile) setPartner(profile);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/agency/login';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6F61]"></div>
                <span className="text-slate-400 font-serif italic">Authenticating...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-600">
            {/* Dark Sidebar - The "Private Bank" Look */}
            <aside className="fixed top-0 left-0 h-full w-72 bg-[#0F172A] z-40 flex flex-col shadow-2xl">
                <div className="p-8 pb-10 flex items-center border-b border-slate-800/50">
                    <h1 className="text-2xl font-bold tracking-tight text-[#FF6F61]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Relofinder
                    </h1>
                </div>

                <nav className="space-y-1 px-4 flex-1 overflow-y-auto">
                    <SidebarItem
                        icon={UserCircle}
                        label="Company Profile"
                        active={view === 'profile'}
                        onClick={() => setView('profile')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Opportunities"
                        active={view === 'leads'}
                        onClick={() => setView('leads')}
                    />
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        active={view === 'settings'}
                        onClick={() => { }}
                    />
                </nav>

                <div className="p-6 border-t border-slate-800 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                    <div className="mt-8 text-[10px] text-slate-600 uppercase tracking-widest text-center">
                        Secure Partner Portal
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-72 flex-1 min-h-screen pb-32">
                {/* Top Navigation / Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 py-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 font-serif">
                            {view === 'profile' && 'Welcome back, Partner.'}
                            {view === 'leads' && 'Active Opportunities'}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">
                            {view === 'profile' && 'Manage your public presence'}
                            {view === 'leads' && 'View inbound requests'}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <a
                            href={`/companies/${partner?.slug || partner?.name.toLowerCase().replace(/(\s+ag|\s+gmbh|\s+sarl|\s+sa|\s+ltd|\s+services$)/g, '').trim().split(' ').join('-').replace(/[^a-z0-9-]/g, '')}`}
                            target="_blank"
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#FF6F61] transition-colors uppercase tracking-wide"
                        >
                            Public Page <ExternalLink size={12} />
                        </a>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <Bell size={18} />
                            </div>
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF6F61] rounded-full border-2 border-white"></span>
                        </div>
                    </div>
                </header>

                <div className="px-10 py-10 max-w-6xl mx-auto">

                    {/* Performance Stats Widget */}
                    {view === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatCard
                                icon={Eye}
                                label="Profile Impressions"
                                value={stats.views.toLocaleString()}
                                trend="+12%"
                                trendUp={true}
                            />
                            <StatCard
                                icon={Users}
                                label="Active Opportunities"
                                value={stats.leads}
                                trend="Live"
                                trendUp={true}
                            />
                            <StatCard
                                icon={Star}
                                label="Average Rating"
                                value={stats.rating}
                                trend="Verified"
                                trendUp={true}
                            />
                        </div>
                    )}

                    {view === 'profile' && (
                        <ProfileEditor
                            partner={partner}
                            onUpdate={() => setRefreshKey(k => k + 1)}
                        />
                    )}
                    {view === 'leads' && <LeadsView partner={partner} />}
                </div>
            </main>
        </div>
    );
}

const LeadsView = ({ partner }: any) => {
    // Logic: Only "preferred" or "premium" users see leads. "standard" users see the upsell.
    const hasAccess = partner?.tier === 'preferred' || partner?.tier === 'premium';

    if (!hasAccess) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 relative">
                <Users size={32} />
                <div className="absolute -top-1 -right-1 bg-[#FF6F61] text-white p-1.5 rounded-full border-2 border-white">
                    {/* Lock Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 font-serif mb-3">Unlock Active Opportunities</h3>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                You are currently on the <span className="font-semibold text-slate-700 capitalize">{partner?.tier || 'Basic'} Tier</span>.
                Upgrade to a Preferred Partner status to receive direct leads, higher visibility, and verified booking requests.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <a
                    href="mailto:partner@relofinder.ch?subject=Upgrade%20Request%20-%20Preferred%20Partner&body=Hi%20Relofinder%20Team%2C%0A%0AI%20would%20like%20to%20upgrade%20my%20account%20to%20Preferred%20Partner%20status%20to%20access%20leads.%0A%0ACompany%3A%20"
                    className="flex-1 bg-[#0F172A] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    Request Access
                </a>
                <button
                    onClick={() => window.alert('Our team will contact you shortly.')}
                    className="flex-1 bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                    Learn More
                </button>
            </div>

            <p className="text-[10px] text-slate-400 mt-6 uppercase tracking-widest">
                Trusted by 50+ Top Agencies
            </p>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">No Active Opportunities</h3>
            <p className="text-slate-500 max-w-sm">
                Requests from clients matching your criteria will appear here. Ensure your profile is 100% complete to increase visibility.
            </p>
        </div>
    );
};

