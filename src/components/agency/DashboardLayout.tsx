
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    UserCircle,
    Users,
    Settings,
    LogOut,
    Bell,
    ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProfileEditor from './ProfileEditor';

// Sidebar Item
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
            ? 'bg-[#FF6F61]/10 text-[#FF6F61]'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
    const [refreshKey, setRefreshKey] = useState(0); // Trigger re-fetching

    useEffect(() => {
        checkSession();
    }, [refreshKey]);

    const checkSession = async () => {
        // DEV MODE BYPASS
        const params = new URLSearchParams(window.location.search);
        if (params.get('dev') === 'true') {
            console.log("⚠️ DEV MODE: Bypassing Auth");
            setPartner({
                id: 'mock-id',
                name: 'Mock Relocation Ltd.',
                bio: 'This is a mock agency for development purposes.',
                website: 'https://example.com',
                contact_email: 'dev@relofinder.ch',
                logo: null,
                price_tier: 2,
                capacity_status: 'active',
                is_verified: true,
                regions_served: ['Zurich', 'Zug'],
                services: ['Home Search'],
                languages: ['English', 'German']
            });
            setLoading(false);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            window.location.href = '/agency/login';
            return;
        }

        // Fetch Partner Profile
        // 1. Try by Auth User ID (Linked Account)
        let { data: profile, error } = await supabase
            .from('relocators')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

        // 2. Fallback: Try by Email or Domain (Auto-Link logic)
        if (!profile && session.user.email) {
            const domain = session.user.email.split('@')[1];

            // Construct query: match contact_email directly OR email directly OR website domain
            let query = supabase.from('relocators').select('*');

            // If we have a valid domain (and not generic like gmail), check website too
            // Note: Preventing generic domains is hard without a list, but assuming B2B emails.
            const isGeneric = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain);

            if (domain && !isGeneric) {
                query = query.or(`contact_email.eq.${session.user.email},website.ilike.%${domain}%`);
            } else {
                query = query.or(`contact_email.eq.${session.user.email}`);
            }

            const { data: byEmail } = await query.limit(1).single();

            if (byEmail) {
                console.log("✅ Managed to link profile by Email/Domain", byEmail.name);
                profile = byEmail;

                // Optional: Attempt to link this user permanently to the relocator row
                // This might fail if RLS prevents update, so we silence the error
                supabase.from('relocators')
                    .update({ auth_user_id: session.user.id })
                    .eq('id', byEmail.id)
                    .then(({ error: updateErr }) => {
                        if (updateErr) console.warn("Could not auto-link auth_id (RLS likely):", updateErr.message);
                    });
            }
        }

        if (!profile) {
            console.error("Profile fetch error or not found for user:", session.user.email);
            // Optionally redirect to an 'Access Denied' or 'Onboarding' page
        } else {
            setPartner(profile);
        }

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/agency/login';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6F61]"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-center">
                    <span
                        className="text-2xl font-bold tracking-tight text-[#FF6F61]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Relofinder
                    </span>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    <SidebarItem
                        icon={UserCircle}
                        label="My Profile"
                        active={view === 'profile'}
                        onClick={() => setView('profile')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="My Leads"
                        active={view === 'leads'}
                        onClick={() => setView('leads')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100 mt-auto">
                    <SidebarItem
                        icon={LogOut}
                        label="Sign Out"
                        active={false}
                        onClick={handleLogout}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64 min-h-screen transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto pb-48">

                    {/* Header */}
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-serif">
                                {view === 'profile' && 'Company Profile'}
                                {view === 'leads' && 'Active Opportunities'}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                {view === 'profile' && 'Manage your public presence and team details.'}
                                {view === 'leads' && 'View and manage your incoming relocation requests.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {partner?.logo && (
                                <div className="hidden md:block h-10 w-auto">
                                    <img src={partner.logo} alt={partner.name} className={`h-full w-auto object-contain ${partner.name.includes('AM Relocation') ? 'invert' : ''}`} />
                                </div>
                            )}
                            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
                            <a href={`/companies/${partner?.id || 'mock-id'}`} target="_blank" className="flex items-center gap-2 text-sm text-[#FF6F61] font-medium hover:underline">
                                <ExternalLink size={14} />
                                View Public Profile
                            </a>
                            <div className="h-8 w-px bg-slate-200 mx-2"></div>
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors shadow-sm">
                                <Bell size={20} />
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="min-h-[600px]">
                        {view === 'profile' && (
                            <ProfileEditor
                                partner={partner}
                                onUpdate={() => setRefreshKey(k => k + 1)}
                            />
                        )}
                        {view === 'leads' && <LeadsView />}
                    </div>
                </div>
            </main>

        </div>
    );
}

const LeadsView = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400">
        <Users size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-slate-900">No Active Leads</h3>
        <p className="text-sm">New opportunities will appear here.</p>
    </div>
);

