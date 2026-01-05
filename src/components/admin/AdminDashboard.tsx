import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Settings,
    Search,
    Bell,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Edit3,
    MapPin,
    Mail,
    Filter,
    Plus,
    Check,
    Building2,
    UserCircle2,
    BriefcaseIcon,
    Trash2,
    ExternalLink,
    Database,
    Phone,
    X,
    Globe,
    Calendar,
    Award,
    FileText,
    Star,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Agency } from '../../lib/types/agencies';

const LANGUAGES_OPTIONS = ['English', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Russian', 'Mandarin', 'Japanese', 'Arabic'];
const SERVICES_OPTIONS = ['Home Search', 'Visa & Immigration', 'School Search', 'Settling In', 'Departure Support', 'Short-term Accommodation', 'Spouse Support', 'Pet Relocation', 'Tax & Legal'];
const CERTIFICATIONS_OPTIONS = ['EuRA Member', 'EuRA Global Quality Seal', 'SARA Member', 'FIDI FAIM', 'CERC', 'IAM', 'Worldwide ERC', 'ISO 9001'];
const REGIONS_OPTIONS = ['Zurich', 'Geneva', 'Basel', 'Zug', 'Lausanne', 'Bern', 'Lucerne', 'Lugano', 'St. Gallen', 'Neuchâtel', 'All Switzerland'];

export default function AdminDashboard() {
    const [view, setView] = useState('leads'); // cockpit, partners, leads
    const [stats, setStats] = useState({
        unassignedValues: 0,
        pendingRequests: 0,
        activePartners: 0
    });

    // Real Data State
    const [leads, setLeads] = useState<any[]>([]);
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State for Leads View
    const [leadsFilter, setLeadsFilter] = useState<'individuals' | 'corporate'>('individuals');
    const [corporateLeads, setCorporateLeads] = useState<any[]>([]);

    // UI State for Partners View
    const [partnerTab, setPartnerTab] = useState<'identity' | 'contact' | 'offices' | 'team' | 'operational' | 'seo'>('identity');
    const [editingPartner, setEditingPartner] = useState<Agency | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Distribution Modal State
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);

    useEffect(() => {
        checkAuth();
        fetchLeads();
        fetchPartners();

        const params = new URLSearchParams(window.location.search);
        if (params.get('dev') === 'true') {
            setStats(prev => ({ ...prev, pendingRequests: 1, activePartners: 14 }));
        }
    }, []);

    const checkAuth = async () => {
        // Relaxing auth for password-only protected dashboard
        const { data: { user } } = await supabase.auth.getUser();
        // Only redirect if no user at all, but keep it loose for now
        if (!user) {
            // window.location.href = '/login'; 
            console.log('Admin Dashboard: No auth user detected, but allowing access for password-only area.');
        }
    };

    const fetchLeads = async () => {
        try {
            const { data: individualLeads, error: iError } = await supabase
                .from('leads')
                .select(`*, quotes(id, status, price_estimated, agency:relocators(name))`)
                .order('created_at', { ascending: false });

            if (iError) console.error('Error fetching individual leads:', iError);

            const { data: corporateData, error: cError } = await supabase
                .from('corporate_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (cError) console.error('Error fetching corporate leads:', cError);

            const processedLeads = (individualLeads || []).map((l: any) => {
                let sourceLabel = 'Individual';
                if (l.source_page === 'contact_page') sourceLabel = 'Contact Form';
                else if (l.source_page === 'quote_wizard') sourceLabel = 'Quote Wizard';
                else if (l.source_page) sourceLabel = l.source_page.replace(/_/g, ' ');

                return {
                    ...l,
                    source: sourceLabel,
                    dest: l.destination_canton || 'Not specified',
                    move_date: l.move_date,
                    services: l.services_needed || [],
                    requested_agencies: Array.isArray(l.requested_agencies) ? l.requested_agencies : [],
                    raw: l
                };
            });

            setLeads(processedLeads);
            setCorporateLeads(corporateData || []);
            setStats(prev => ({
                ...prev,
                unassignedValues: (processedLeads.filter((l: any) => l.status === 'new').length),
                activePartners: partners.length
            }));
        } catch (err) {
            console.error('Error in fetchLeads:', err);
        }
    };

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('relocators')
                .select(`
                    *,
                    offices:relocator_offices(*),
                    team:relocator_consultants(
                        *,
                        consultant:relocation_consultants(*)
                    )
                `)
                .order('name');

            if (error) {
                console.error('Error fetching partners:', error);
            } else {
                setPartners(data || []);
            }
        } catch (err) {
            console.error('Fetch Partner Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClick = (lead: any) => {
        setSelectedLead(lead);
        const preSelected = (lead.requested_agencies || [])
            .map((reqName: string) => partners.find(p => p.name === reqName)?.id)
            .filter(Boolean) as string[];

        setSelectedPartners(preSelected);
        setAssignmentModalOpen(true);
    };

    const togglePartnerSelection = (id: string) => {
        if (selectedPartners.includes(id)) {
            setSelectedPartners(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPartners(prev => [...prev, id]);
        }
    };

    const handleDistribute = async () => {
        if (!selectedLead) return;
        const newQuotes = selectedPartners.map(partnerId => ({
            lead_id: selectedLead.id,
            agency_id: partnerId,
            status: 'pending',
            token: crypto.randomUUID()
        }));

        const { error: quoteError } = await supabase.from('quotes').insert(newQuotes);
        if (quoteError) { alert('Distribution failed: ' + quoteError.message); return; }

        await supabase.from('leads').update({
            status: 'distributed',
            assigned_agencies: selectedPartners
        }).eq('id', selectedLead.id);

        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: 'distributed', assigned_agencies: selectedPartners } : l));
        setAssignmentModalOpen(false);
        alert(`Distributed to ${selectedPartners.length} partners.`);
    };

    const handleUpdatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPartner) return;
        setIsSaving(true);

        const { error: updateError } = await supabase
            .from('relocators')
            .update({
                name: editingPartner.name,
                logo: editingPartner.logo,
                tier: editingPartner.tier,
                is_verified: editingPartner.is_verified,
                manager_name: editingPartner.manager_name,
                manager_email: editingPartner.manager_email,
                manager_phone: editingPartner.manager_phone,
                address_street: editingPartner.address_street,
                address_city: editingPartner.address_city,
                address_zip: editingPartner.address_zip,
                founded_year: editingPartner.founded_year,
                employee_count: editingPartner.employee_count,
                website: editingPartner.website,
                contact_email: editingPartner.contact_email,
                phone_number: editingPartner.phone_number,
                languages: editingPartner.languages,
                services: editingPartner.services,
                certifications: editingPartner.certifications,
                regions_served: editingPartner.regions_served,
                meeting_url: editingPartner.meeting_url,
                internal_notes: editingPartner.internal_notes,
                google_maps_url: editingPartner.google_maps_url,
                google_place_id: editingPartner.google_place_id,
                bio: editingPartner.bio,
                meta_title: editingPartner.meta_title,
                meta_description: editingPartner.meta_description,
                seo_summary: editingPartner.seo_summary,
                accepting_new_customers: editingPartner.accepting_new_customers,
                contact_through_us: editingPartner.contact_through_us
            })
            .eq('id', editingPartner.id);

        if (updateError) {
            alert('Error updating partner: ' + updateError.message);
            setIsSaving(false);
            return;
        }

        if (editingPartner.offices) {
            await supabase.from('relocator_offices').delete().eq('relocator_id', editingPartner.id);
            const officesToInsert = editingPartner.offices
                .filter(o => o.street && o.city)
                .map(o => ({
                    relocator_id: editingPartner.id,
                    street: o.street,
                    city: o.city,
                    zip: o.zip,
                    is_main: o.is_main || false
                }));
            if (officesToInsert.length > 0) {
                await supabase.from('relocator_offices').insert(officesToInsert);
            }
        }

        if (editingPartner.team) {
            // 1. Remove existing team links for this relocator (sync strategy)
            const { error: deleteError } = await supabase
                .from('relocator_consultants')
                .delete()
                .eq('relocator_id', editingPartner.id);

            if (deleteError) {
                console.error('Error clearing old team links:', deleteError);
            }

            const newLinks = [];

            // 2. Process each team member in the UI state
            for (const member of editingPartner.team) {
                let consultantId = member.consultant_id;
                const consultantData = (member.consultant || {}) as any;

                // Only proceed if we have at least a name
                if (!consultantData.name) continue;

                if (consultantId) {
                    // Start updates, but don't await to block loop unless necessary? 
                    // Better to await to ensure data integrity before linking.
                    await supabase
                        .from('relocation_consultants')
                        .update({
                            name: consultantData.name,
                            email: consultantData.email,
                            // phone: consultantData.phone, // Add if in future UI
                            // bio: consultantData.bio      // Add if in future UI
                        })
                        .eq('id', consultantId);
                } else {
                    // Create new consultant
                    const { data: newConsultant, error: createError } = await supabase
                        .from('relocation_consultants')
                        .insert({
                            name: consultantData.name,
                            email: consultantData.email,
                            // phone: consultantData.phone,
                            // bio: consultantData.bio
                        })
                        .select()
                        .single();

                    if (!createError && newConsultant) {
                        consultantId = newConsultant.id;
                    } else {
                        console.error('Error creating consultant:', createError);
                        continue;
                    }
                }

                if (consultantId) {
                    newLinks.push({
                        relocator_id: editingPartner.id,
                        consultant_id: consultantId,
                        role: member.role || 'Consultant',
                        is_primary: member.is_primary || false
                    });
                }
            }

            // 3. Insert new links
            if (newLinks.length > 0) {
                const { error: linkError } = await supabase
                    .from('relocator_consultants')
                    .insert(newLinks);

                if (linkError) {
                    console.error('Error linking consultants:', linkError);
                    alert('Warning: Some team members might not have been linked correctly.');
                }
            }
        }

        await fetchPartners();
        setEditingPartner(null);
        setIsSaving(false);
    };

    const handleMultiSelect = (field: keyof Agency, value: string) => {
        if (!editingPartner) return;
        const current = (editingPartner[field] as string[]) || [];
        if (current.includes(value)) {
            setEditingPartner({ ...editingPartner, [field]: current.filter((item: string) => item !== value) });
        } else {
            setEditingPartner({ ...editingPartner, [field]: [...current, value] });
        }
    };

    // Office and Team Helpers
    const handleAddOffice = () => setEditingPartner({ ...editingPartner!, offices: [...(editingPartner?.offices || []), { street: '', zip: '', city: '', is_main: false } as any] });
    const handleRemoveOffice = (idx: number) => {
        const newOffices = [...(editingPartner?.offices || [])];
        newOffices.splice(idx, 1);
        setEditingPartner({ ...editingPartner!, offices: newOffices });
    };
    const handleOfficeChange = (idx: number, field: string, val: string) => {
        const newOffices = [...(editingPartner?.offices || [])];
        newOffices[idx] = { ...newOffices[idx], [field]: val };
        setEditingPartner({ ...editingPartner!, offices: newOffices });
    };

    const handleAddTeamMember = () => setEditingPartner({ ...editingPartner!, team: [...(editingPartner?.team || []), { consultant_id: '', consultant: {}, role: '' } as any] });
    const handleRemoveTeamMember = (idx: number) => {
        const newTeam = [...(editingPartner?.team || [])];
        newTeam.splice(idx, 1);
        setEditingPartner({ ...editingPartner!, team: newTeam });
    };
    const handleTeamChange = (idx: number, field: string, val: string) => {
        const newTeam = [...(editingPartner?.team || [])];
        if (['name', 'email'].includes(field)) {
            newTeam[idx] = { ...newTeam[idx], consultant: { ...newTeam[idx].consultant, [field]: val } as any };
        } else {
            newTeam[idx] = { ...newTeam[idx], [field]: val };
        }
        setEditingPartner({ ...editingPartner!, team: newTeam });
    };

    const suggestedPartners = (selectedLead && partners) ? partners.filter((p: any) => {
        const regions = p.regions_served || [];
        const dest = selectedLead.dest;
        return regions.includes(dest) || regions.includes('All Switzerland');
    }) : [];

    const SidebarItem = ({ icon: Icon, label, id }: any) => (
        <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${view === id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="flex bg-slate-100 font-sans text-slate-900 h-screen w-full">
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 h-full">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <span className="text-2xl font-bold tracking-tight text-[#FF6F61]" style={{ fontFamily: "'Playfair Display', serif" }}>Relofinder</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">Admin</span>
                </div>
                <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Cockpit" id="cockpit" />
                    <SidebarItem icon={Briefcase} label="Evaluations" id="leads" />
                    <SidebarItem icon={Users} label="Partner Registry" id="partners" />
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-100 p-8 h-full">
                {/* VIEWS */}
                {view === 'cockpit' && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome back, Admin</h1>
                            <p className="text-gray-500">Here is what's happening today.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#FF6F61] text-white p-6 rounded-2xl shadow-lg shadow-[#FF6F61]/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <BriefcaseIcon size={24} className="text-white" />
                                    </div>
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">Action Needed</span>
                                </div>
                                <div className="text-4xl font-bold mb-1">{stats.unassignedValues}</div>
                                <div className="text-white/80 text-sm font-medium">New Leads (Unassigned)</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-100 rounded-xl">
                                        <Users size={24} className="text-slate-600" />
                                    </div>
                                    {stats.activePartners > 0 && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Healthy</span>}
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{stats.activePartners}</div>
                                <div className="text-slate-500 text-sm font-medium">Active Partners</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-100 rounded-xl">
                                        <Database size={24} className="text-slate-600" />
                                    </div>
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">Total</span>
                                </div>
                                <div className="text-4xl font-bold text-slate-900 mb-1">{leads.length}</div>
                                <div className="text-slate-500 text-sm font-medium">Total Evaluations</div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'partners' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">Partner Registry</h1>
                            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex gap-2"><Plus size={16} /> New Partner</button>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500"><tr><th className="px-6 py-3">Partner</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Edit</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {partners.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-bold">{p.name}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs bg-slate-100 border">{p.tier}</span></td>
                                            <td className="px-6 py-4 text-right"><button onClick={() => setEditingPartner(p)}><Edit3 size={16} className="text-slate-400 hover:text-slate-900" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'leads' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">Evaluations</h1>
                            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setLeadsFilter('individuals')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${leadsFilter === 'individuals' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Individuals
                                </button>
                                <button
                                    onClick={() => setLeadsFilter('corporate')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${leadsFilter === 'corporate' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Corporate
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3">{leadsFilter === 'corporate' ? 'Company' : 'Lead'}</th>
                                        <th className="px-6 py-3">{leadsFilter === 'corporate' ? 'Contact' : 'Dest'}</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leadsFilter === 'individuals' ? (
                                        leads.map(l => (
                                            <tr key={l.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">{l.name}</div>
                                                    <div className="text-[10px] text-slate-400">{l.email}</div>
                                                </td>
                                                <td className="px-6 py-4">{l.dest}</td>
                                                <td className="px-6 py-4 text-right"><button onClick={() => handleAssignClick(l)} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold">Review</button></td>
                                            </tr>
                                        ))
                                    ) : (
                                        corporateLeads.map(l => (
                                            <tr key={l.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">{l.company_name}</div>
                                                    <div className="text-[10px] text-slate-400">{l.destinations?.join(', ')}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{l.hr_name}</div>
                                                    <div className="text-[10px] text-slate-400">{l.hr_email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => setSelectedLead(l)} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold hover:bg-slate-200">View RFP</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* PARTNER EDITING MODAL */}
            {editingPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-slate-900">Partner Settings: {editingPartner.name}</h1>
                            <button onClick={() => setEditingPartner(null)}><XCircle size={24} className="text-slate-400" /></button>
                        </div>

                        <div className="flex border-b border-slate-100 px-8">
                            {[
                                { id: 'identity', label: 'Identity & Story' },
                                { id: 'contact', label: 'Contact & Mgmt' },
                                { id: 'offices', label: 'Locations' },
                                { id: 'team', label: 'Team' },
                                { id: 'operational', label: 'Operations' },
                                { id: 'seo', label: 'SEO & Reviews' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setPartnerTab(tab.id as any)}
                                    className={`px-4 py-4 text-sm font-bold border-b-2 transition-all ${partnerTab === tab.id ? 'border-[#FF6F61] text-[#FF6F61]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form onSubmit={handleUpdatePartner} className="space-y-8">
                                {/* TAB: IDENTITY */}
                                {partnerTab === 'identity' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Company Name</label>
                                            <input value={editingPartner.name} onChange={e => setEditingPartner({ ...editingPartner, name: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white transition-colors" />
                                        </div>

                                        <div className="col-span-2 space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Description / Bio (Markdown Supported)</label>
                                            <textarea value={editingPartner.bio || ''} onChange={e => setEditingPartner({ ...editingPartner, bio: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50 h-32" placeholder="Company description..." />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Website URL</label>
                                            <div className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50">
                                                <Globe size={16} className="text-slate-400" />
                                                <input value={editingPartner.website || ''} onChange={e => setEditingPartner({ ...editingPartner, website: e.target.value })} className="bg-transparent w-full outline-none" placeholder="https://..." />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Logo URL</label>
                                            <div className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50">
                                                <ExternalLink size={16} className="text-slate-400" />
                                                <input value={editingPartner.logo || ''} onChange={e => setEditingPartner({ ...editingPartner, logo: e.target.value })} className="bg-transparent w-full outline-none" placeholder="https://..." />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Founded Year</label>
                                            <input type="number" value={editingPartner.founded_year || ''} onChange={e => setEditingPartner({ ...editingPartner, founded_year: parseInt(e.target.value) })} className="w-full border p-3 rounded-lg bg-slate-50" />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Employee Count</label>
                                            <select value={editingPartner.employee_count || ''} onChange={e => setEditingPartner({ ...editingPartner, employee_count: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50">
                                                <option value="">Select size...</option>
                                                <option value="1-5">1-5 Employees</option>
                                                <option value="6-20">6-20 Employees</option>
                                                <option value="21-50">21-50 Employees</option>
                                                <option value="50+">50+ Employees</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Consultation Calendar Link (Meeting URL)</label>
                                            <div className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50">
                                                <Calendar size={16} className="text-slate-400" />
                                                <input value={editingPartner.meeting_url || ''} onChange={e => setEditingPartner({ ...editingPartner, meeting_url: e.target.value })} className="bg-transparent w-full outline-none" placeholder="https://calendly.com/..." />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: CONTACT */}
                                {partnerTab === 'contact' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2"><h3 className="font-bold text-sm border-b pb-2 mb-4">Public Contact Channels</h3></div>
                                            <div className="space-y-4">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">General Email</label>
                                                <div className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50">
                                                    <Mail size={16} className="text-slate-400" />
                                                    <input value={editingPartner.contact_email || ''} onChange={e => setEditingPartner({ ...editingPartner, contact_email: e.target.value })} className="bg-transparent w-full outline-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">General Phone</label>
                                                <div className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50">
                                                    <Phone size={16} className="text-slate-400" />
                                                    <input value={editingPartner.phone_number || ''} onChange={e => setEditingPartner({ ...editingPartner, phone_number: e.target.value })} className="bg-transparent w-full outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2"><h3 className="font-bold text-sm border-b pb-2 mb-4 text-[#FF6F61]">Internal POC (Manager)</h3></div>
                                            <div className="col-span-2 space-y-4">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Manager Name</label>
                                                <input value={editingPartner.manager_name || ''} onChange={e => setEditingPartner({ ...editingPartner, manager_name: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50" placeholder="e.g. Thomas Muller" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Manager Email</label>
                                                <input value={editingPartner.manager_email || ''} onChange={e => setEditingPartner({ ...editingPartner, manager_email: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Manager Phone</label>
                                                <input value={editingPartner.manager_phone || ''} onChange={e => setEditingPartner({ ...editingPartner, manager_phone: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: OFFICES */}
                                {partnerTab === 'offices' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-sm">Registered Locations</h3>
                                            <button type="button" onClick={handleAddOffice} className="text-blue-600 text-xs font-bold">+ Add Office</button>
                                        </div>

                                        {/* Main Office Card */}
                                        <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                                            <div className="flex justify-between mb-2">
                                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Main HQ Address</h4>
                                                <span className="text-[10px] bg-slate-200 px-2 rounded text-slate-600 font-bold">PRIMARY</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <input value={editingPartner.address_street || ''} onChange={e => setEditingPartner({ ...editingPartner, address_street: e.target.value })} placeholder="Street Address" className="col-span-3 w-full border p-2 rounded bg-white" />
                                                <input value={editingPartner.address_zip || ''} onChange={e => setEditingPartner({ ...editingPartner, address_zip: e.target.value })} placeholder="ZIP" className="w-full border p-2 rounded bg-white" />
                                                <input value={editingPartner.address_city || ''} onChange={e => setEditingPartner({ ...editingPartner, address_city: e.target.value })} placeholder="City" className="col-span-2 w-full border p-2 rounded bg-white" />
                                            </div>
                                        </div>

                                        {(editingPartner.offices || []).map((off, idx) => (
                                            <div key={idx} className="border border-slate-200 p-4 rounded-xl relative group hover:border-slate-300 transition-all">
                                                <button type="button" onClick={() => handleRemoveOffice(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Branch Office</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input value={off.street || ''} onChange={e => handleOfficeChange(idx, 'street', e.target.value)} placeholder="Branch Street" className="col-span-3 w-full border p-2 rounded" />
                                                    <input value={off.zip || ''} onChange={e => handleOfficeChange(idx, 'zip', e.target.value)} placeholder="ZIP" className="w-full border p-2 rounded" />
                                                    <input value={off.city || ''} onChange={e => handleOfficeChange(idx, 'city', e.target.value)} placeholder="City" className="col-span-2 w-full border p-2 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: TEAM */}
                                {partnerTab === 'team' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-sm">Consultant Roster</h3>
                                            <button type="button" onClick={handleAddTeamMember} className="text-blue-600 text-xs font-bold">+ Add Consultant</button>
                                        </div>
                                        {(editingPartner.team || []).map((m, idx) => (
                                            <div key={idx} className="border border-slate-200 p-4 rounded-xl relative flex gap-4 items-start">
                                                <button type="button" onClick={() => handleRemoveTeamMember(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <UserCircle2 size={24} />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input value={m.consultant?.name || ''} onChange={e => handleTeamChange(idx, 'name', e.target.value)} placeholder="Full Name" className="w-full border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 bg-transparent" />
                                                    <input value={m.consultant?.email || ''} onChange={e => handleTeamChange(idx, 'email', e.target.value)} placeholder="Email Address" className="w-full text-sm text-slate-500 border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none bg-transparent" />
                                                    <input value={m.role || ''} onChange={e => handleTeamChange(idx, 'role', e.target.value)} placeholder="Role / Job Title" className="w-full text-xs text-slate-400 border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none bg-transparent" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB: OPERATIONAL */}
                                {partnerTab === 'operational' && (
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">Services Provided</label>
                                            <div className="flex flex-wrap gap-2">
                                                {SERVICES_OPTIONS.map(s => (
                                                    <button key={s} type="button" onClick={() => handleMultiSelect('services', s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editingPartner.services?.includes(s) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">Languages Spoken</label>
                                            <div className="flex flex-wrap gap-2">
                                                {LANGUAGES_OPTIONS.map(l => (
                                                    <button key={l} type="button" onClick={() => handleMultiSelect('languages', l)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editingPartner.languages?.includes(l) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{l}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">Regions Served</label>
                                            <div className="flex flex-wrap gap-2">
                                                {REGIONS_OPTIONS.map(r => (
                                                    <button key={r} type="button" onClick={() => handleMultiSelect('regions_served', r)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editingPartner.regions_served?.includes(r) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{r}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">Certifications & Accreditations</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CERTIFICATIONS_OPTIONS.map(c => (
                                                    <button key={c} type="button" onClick={() => handleMultiSelect('certifications', c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${editingPartner.certifications?.includes(c) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                                                        <Award size={14} className={editingPartner.certifications?.includes(c) ? 'text-green-600' : 'text-slate-300'} />
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-2">Partnership Tier</label>
                                                <select value={editingPartner.tier} onChange={e => setEditingPartner({ ...editingPartner, tier: e.target.value as any })} className="w-full border p-3 rounded-lg bg-slate-50">
                                                    <option value="standard">Standard - Basic Listing</option>
                                                    <option value="partner">Partner - Verified & Active</option>
                                                    <option value="preferred">Preferred - Top Priority</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2 pt-6">
                                                <button type="button" onClick={() => setEditingPartner({ ...editingPartner, accepting_new_customers: !editingPartner.accepting_new_customers })} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${editingPartner.accepting_new_customers ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {editingPartner.accepting_new_customers ? <ToggleRight className="text-green-600" /> : <ToggleLeft className="text-slate-400" />}
                                                    Accepting new clients
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB: SEO & GOOGLE */}
                                {partnerTab === 'seo' && (
                                    <div className="space-y-6">
                                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-orange-800 mb-6">
                                            <Star size={18} className="shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-sm">Google Reviews Integration</h4>
                                                <p className="text-xs mt-1 opacity-90">Enter the Google Maps URL to automatically fetch reviews via SerpApi. The Place ID will be extracted automatically if possible.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Google Maps URL</label>
                                            <div className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50">
                                                <MapPin size={16} className="text-slate-400" />
                                                <input value={editingPartner.google_maps_url || ''} onChange={e => setEditingPartner({ ...editingPartner, google_maps_url: e.target.value })} className="bg-transparent w-full outline-none" placeholder="https://maps.google.com/?cid=..." />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Google Place ID (Optional)</label>
                                            <input value={editingPartner.google_place_id || ''} onChange={e => setEditingPartner({ ...editingPartner, google_place_id: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50" placeholder="ChIJ..." />
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 space-y-4">
                                            <h3 className="font-bold text-sm text-slate-900">SEO & AI Content</h3>

                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">AI Generated Summary (seo_summary)</span>
                                                <textarea value={editingPartner.seo_summary || ''} onChange={e => setEditingPartner({ ...editingPartner, seo_summary: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50 h-32 text-sm" placeholder="AI generated summary of the agency..." />
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Title</span>
                                                <input value={editingPartner.meta_title || ''} onChange={e => setEditingPartner({ ...editingPartner, meta_title: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50" placeholder="Agency Name - Top Rated Relocation Services in Zurich" />
                                            </div>

                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</span>
                                                <textarea value={editingPartner.meta_description || ''} onChange={e => setEditingPartner({ ...editingPartner, meta_description: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50 h-24" placeholder="Brief description for search engines..." />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Internal Notes (Admin Only)</label>
                                            <textarea value={editingPartner.internal_notes || ''} onChange={e => setEditingPartner({ ...editingPartner, internal_notes: e.target.value })} className="w-full border p-3 rounded-lg bg-slate-50 h-24" placeholder="Private notes about this partnership..." />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setEditingPartner(null)} className="px-6 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={handleUpdatePartner} disabled={isSaving} className="px-6 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            {assignmentModalOpen && selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center"><h3 className="text-lg font-bold text-slate-900">Distribute Lead: {selectedLead.name}</h3><button onClick={() => setAssignmentModalOpen(false)}><X size={20} className="text-slate-400" /></button></div>
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-400 text-xs uppercase">Lead Details</h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                    <p><strong>Dest:</strong> {selectedLead.dest}</p><p><strong>Date:</strong> {selectedLead.move_date}</p><p className="text-sm text-slate-600">"{selectedLead.message}"</p>
                                    <div className="mt-4"><h5 className="text-xs font-bold uppercase text-slate-400">Requested by User</h5><div className="flex flex-wrap gap-2 mt-1">{(selectedLead.requested_agencies || []).length > 0 ? (selectedLead.requested_agencies.map((req: string) => <span key={req} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{req}</span>)) : <span className="text-xs text-slate-400 italic">None</span>}</div></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-400 text-xs uppercase">Select Partners ({selectedPartners.length})</h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {suggestedPartners.map((p: any) => (<div key={p.id} onClick={() => togglePartnerSelection(p.id)} className={`p-3 rounded border cursor-pointer flex justify-between items-center ${selectedPartners.includes(p.id) ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}><div><div className="font-bold text-sm">{p.name}</div><div className="text-[10px] opacity-70">{p.tier}</div></div>{selectedPartners.includes(p.id) && <Check size={14} />}</div>))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3"><button onClick={() => setAssignmentModalOpen(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button><button onClick={handleDistribute} disabled={selectedPartners.length === 0} className="px-6 py-2 bg-[#FF6F61] text-white font-bold rounded-lg shadow-lg disabled:opacity-50">Distribute</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
