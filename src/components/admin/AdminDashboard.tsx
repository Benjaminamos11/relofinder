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
    X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Agency } from '../../lib/types/agencies';

const LANGUAGES_OPTIONS = ['English', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Russian', 'Mandarin'];
const SERVICES_OPTIONS = ['Home Search', 'Visa & Immigration', 'School Search', 'Settling In', 'Departure Support', 'Short-term Accommodation', 'Spouse Support'];
const CERTIFICATIONS_OPTIONS = ['EuRA Member', 'EuRA Global Quality Seal', 'SARA Member', 'FIDI FAIM', 'CERC', 'IAM', 'Worldwide ERC'];
const REGIONS_OPTIONS = ['Zurich', 'Geneva', 'Basel', 'Zug', 'Lausanne', 'Bern', 'Lucerne', 'Lugano'];

interface ConsultantOverviewProps {
    consultantId: string;
    consultantName: string;
}

const ConsultantOverview = ({ consultantId, consultantName }: ConsultantOverviewProps) => {
    const [affiliations, setAffiliations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAffiliations = async () => {
            const { data } = await supabase
                .from('relocator_consultants')
                .select('role, relocators(name)')
                .eq('consultant_id', consultantId);
            if (data) setAffiliations(data);
            setLoading(false);
        };
        fetchAffiliations();
    }, [consultantId]);

    return (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cross-Company Intel: {consultantName}</h4>
            {loading ? (
                <div className="text-xs text-slate-400">Loading intel...</div>
            ) : affiliations.length > 1 ? (
                <div className="space-y-1">
                    {affiliations.map((a, i) => (
                        <div key={i} className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{a.relocators.name}</span>
                            <span className="text-slate-400 italic text-[10px]">{a.role || 'Consultant'}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-xs text-slate-400 italic">No other affiliations found.</div>
            )}
        </div>
    );
};

export default function AdminDashboard() {
    const [view, setView] = useState('cockpit'); // cockpit, partners, leads
    const [stats, setStats] = useState({
        unassignedValues: 0,
        pendingRequests: 0,
        activePartners: 0
    });

    // Real Data State
    const [partners, setPartners] = useState<Agency[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State - Leads
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
    const [leadFilter, setLeadFilter] = useState<'individuals' | 'corporates'>('individuals');
    const [corporateLeads, setCorporateLeads] = useState<any[]>([]);

    // Modal State - Partners
    const [editingPartner, setEditingPartner] = useState<Agency | null>(null);
    const [activeTab, setActiveTab] = useState<'admin' | 'offices' | 'team' | 'operational'>('admin');
    const [isSaving, setIsSaving] = useState(false);
    const [activeConsultantIntel, setActiveConsultantIntel] = useState<string | null>(null);



    // Manual Tag State
    const [customTags, setCustomTags] = useState({
        languages: '',
        regions_served: '',
        services: '',
        certifications: ''
    });

    const handleAddCustomTag = (field: keyof Agency) => {
        const val = (customTags as any)[field]?.trim();
        if (!val || !editingPartner) return;
        const current = (editingPartner[field] as string[]) || [];
        if (!current.includes(val)) {
            setEditingPartner({ ...editingPartner, [field]: [...current, val] });
        }
        setCustomTags({ ...customTags, [field]: '' });
    };

    const handleAddOffice = () => {
        if (!editingPartner) return;
        const newOffice = { street: '', zip: '', city: '', is_main: false };
        setEditingPartner({
            ...editingPartner,
            offices: [...(editingPartner.offices || []), newOffice]
        });
    };

    const handleRemoveOffice = (index: number) => {
        if (!editingPartner) return;
        const newOffices = [...(editingPartner.offices || [])];
        newOffices.splice(index, 1);
        setEditingPartner({ ...editingPartner, offices: newOffices });
    };

    const handleOfficeChange = (index: number, field: string, value: string) => {
        if (!editingPartner) return;
        const newOffices = [...(editingPartner.offices || [])];
        newOffices[index] = { ...newOffices[index], [field]: value };
        setEditingPartner({ ...editingPartner, offices: newOffices });
    };

    const handleAddTeamMember = () => {
        if (!editingPartner) return;
        const newMember = { consultant_id: '', consultant: { id: '', name: '', email: '' }, role: '' };
        setEditingPartner({
            ...editingPartner,
            team: [...(editingPartner.team || []), newMember as any]
        });
    };

    const handleRemoveTeamMember = (index: number) => {
        if (!editingPartner) return;
        const newTeam = [...(editingPartner.team || [])];
        newTeam.splice(index, 1);
        setEditingPartner({ ...editingPartner, team: newTeam });
    };

    const handleTeamMemberChange = (index: number, field: string, value: string) => {
        if (!editingPartner) return;
        const newTeam = [...(editingPartner.team || [])];
        if (field === 'name' || field === 'email') {
            newTeam[index] = {
                ...newTeam[index],
                consultant: { ...newTeam[index].consultant, [field]: value } as any
            };
        } else {
            newTeam[index] = { ...newTeam[index], [field]: value };
        }
        setEditingPartner({ ...editingPartner, team: newTeam });
    };

    const handleAssignClick = (lead: any) => {
        setSelectedLead(lead);
        setSelectedPartners([]); // Reset selection
        setAssignmentModalOpen(true);
    };

    const handleDistribute = async () => {
        if (!selectedLead) return;

        // 1. Create Quotes for each selected partner
        // In a real app, this would be a server action or API call to ensure atomicity
        const newQuotes = selectedPartners.map(partnerId => ({
            lead_id: selectedLead.id,
            agency_id: partnerId,
            status: 'pending',
            token: crypto.randomUUID() // Generate a token for the agency link
        }));

        const { error: quoteError } = await supabase
            .from('quotes')
            .insert(newQuotes);

        if (quoteError) {
            console.error('Error creating quotes:', quoteError);
            alert('Failed to distribute leads: ' + quoteError.message);
            return;
        }

        // 2. Update Lead Status and Assigned Agencies
        const { error: leadError } = await supabase
            .from('leads')
            .update({
                status: 'distributed',
                assigned_agencies: selectedPartners
            })
            .eq('id', selectedLead.id);

        if (leadError) {
            console.error('Error updating lead:', leadError);
            alert('Failed to update lead status: ' + leadError.message);
            return;
        }

        // 3. Update Local State
        if (leadFilter === 'individuals') {
            const updatedLeads = leads.map((l: any) => {
                if (l.id === selectedLead.id) {
                    return { ...l, status: 'distributed', assigned_agencies: selectedPartners };
                }
                return l;
            });
            setLeads(updatedLeads);
        } else {
            // Corporate logic if needed
            const updatedCorpLeads = corporateLeads.map((c: any) => {
                if (c.id === selectedLead.id) {
                    return { ...c, status: 'distributed' };
                }
                return c;
            });
            setCorporateLeads(updatedCorpLeads);
        }

        setStats(prev => ({
            ...prev,
            unassignedValues: Math.max(0, prev.unassignedValues - 1)
        }));

        setAssignmentModalOpen(false);
        alert(`Lead successfully distributed to ${selectedPartners.length} partner(s)!`);
    };

    const togglePartnerSelection = (id: string) => {
        if (selectedPartners.includes(id)) {
            setSelectedPartners(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedPartners(prev => [...prev, id]);
        }
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
                console.error('Error fetching partners with relations:', error);
                // Fallback to basic fetch if relation query fails
                const { data: basicData, error: basicError } = await supabase
                    .from('relocators')
                    .select('*')
                    .order('name');
                if (basicError) throw basicError;
                setPartners(basicData || []);
            } else {
                setPartners(data || []);
            }
        } catch (err: any) {
            console.error('Final Partner Fetch Error:', err.message);
            alert('Failed to load partners: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeads = async () => {
        try {
            // 1. Fetch Individuals (leads table)
            const { data: individualLeads, error: individualError } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            // 2. Fetch Corporations (corporate_leads table)
            const { data: corpLeads, error: corpError } = await supabase
                .from('corporate_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (individualError) console.error('Error fetching leads:', individualError);
            if (corpError) console.error('Error fetching corporate leads:', corpError);

            // Transform leads to unified UI format
            const processedLeads = (individualLeads || []).map(l => {
                // Determine source label
                let sourceLabel = 'Individual';
                if (l.source_page === 'contact_page') sourceLabel = 'Contact Form';
                else if (l.source_page === 'quote_wizard') sourceLabel = 'Quote Wizard';
                else if (l.source_page === 'consultation_request') sourceLabel = 'Consultation';
                else if (l.source_page) sourceLabel = l.source_page.replace(/_/g, ' ');

                if (l.intent === 'consultation') sourceLabel = 'Consultation';

                return {
                    ...l,
                    source: sourceLabel,
                    dest: l.destination_canton || 'Not specified',
                    move_date: l.move_date,
                    services: l.services_needed || [],
                    // Ensure requested_agencies is an array
                    requested_agencies: Array.isArray(l.requested_agencies) ? l.requested_agencies : [],
                    raw: l
                };
            });

            // Demo data if empty
            if (processedLeads.length === 0) {
                setLeads([
                    {
                        id: 'demo-1',
                        name: 'Alexander Schmidt',
                        email: 'alex.schmidt@techcorp.de',
                        phone: '+49 176 1234567',
                        message: 'Moving from Berlin to Zurich. Need home search.',
                        created_at: new Date().toISOString(),
                        status: 'new',
                        source: 'Premium Match',
                        dest: 'Zurich',
                        move_date: '2025-03-01',
                        services: ['Home Search'],
                        partners_selected: ['Prime Relocation']
                    },
                    {
                        id: 'demo-2',
                        name: 'Sarah O\'Connor',
                        email: 'sarah.oc@gmail.com',
                        phone: '+353 87 9876543',
                        message: 'Relocating to Geneva.',
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        status: 'assigned',
                        source: 'Direct Profile',
                        dest: 'Geneva',
                        move_date: '2025-02-15',
                        services: ['Settling In'],
                        partners_selected: ['Auris Relocation']
                    }
                ]);
            } else {
                setLeads(processedLeads);
            }

            if ((corpLeads || []).length === 0) {
                setCorporateLeads([
                    {
                        id: 'demo-corp-1',
                        company_name: 'Novartis AG',
                        hr_name: 'Dr. Markus Weber',
                        hr_email: 'markus.weber@novartis.com',
                        moves_per_year: '50-100',
                        status: 'new',
                        destinations: ['Basel'],
                        pain_points: ['High costs'],
                        created_at: new Date().toISOString(),
                        metadata: { services_requested: ['Corporate Housing'] }
                    }
                ]);
            } else {
                setCorporateLeads(corpLeads || []);
            }

            setStats(prev => ({
                ...prev,
                unassignedValues: (processedLeads.filter((l: any) => l.status === 'new').length) + (corpLeads?.filter((l: any) => l.status === 'new').length || 0)
            }));

        } catch (err) {
            console.error('Error in fetchLeads:', err);
        }
    };

    const handleUpdatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPartner) return;

        setIsSaving(true);
        // 1. Update basic fields
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
                regions_served: editingPartner.regions_served
            })
            .eq('id', editingPartner.id);

        if (updateError) {
            alert('Error updating partner: ' + updateError.message);
            setIsSaving(false);
            return;
        }

        // 2. Handle Offices
        if (editingPartner.offices) {
            // Simple approach: delete existing and re-insert (fine for admin panel)
            await supabase.from('relocator_offices').delete().eq('relocator_id', editingPartner.id);
            const officesToInsert = editingPartner.offices
                .filter(o => o.street && o.city)
                .map(o => ({ ...o, relocator_id: editingPartner.id }));
            if (officesToInsert.length > 0) {
                await supabase.from('relocator_offices').insert(officesToInsert);
            }
        }

        // 3. Handle Team (Complex due to many-to-many and people)
        if (editingPartner.team) {
            for (const member of editingPartner.team) {
                if (!member.consultant?.name) continue;

                // Create or update the person
                let consultantId = member.consultant_id;
                if (!consultantId) {
                    const { data: newPerson } = await supabase
                        .from('relocation_consultants')
                        .insert({
                            name: member.consultant.name,
                            email: member.consultant.email
                        })
                        .select()
                        .single();
                    if (newPerson) consultantId = newPerson.id;
                } else {
                    await supabase
                        .from('relocation_consultants')
                        .update({
                            name: member.consultant.name,
                            email: member.consultant.email
                        })
                        .eq('id', consultantId);
                }

                // Ensure junction entry exists
                if (consultantId) {
                    await supabase
                        .from('relocator_consultants')
                        .upsert({
                            consultant_id: consultantId,
                            relocator_id: editingPartner.id,
                            role: member.role
                        }, { onConflict: 'consultant_id,relocator_id' });
                }
            }
        }

        await fetchPartners();
        setEditingPartner(null);
        alert('Partner data and cross-intel updated successfully!');
        setIsSaving(false);
    };

    // Filter Logic for Matchmaker
    const suggestedPartners = (selectedLead && partners)
        ? partners.filter((p: any) => {
            // Robust Match Logic: Check regions_served, regions, or region property
            const pRegions = p.regions_served || p.regions || (p.region ? [p.region] : []) || [];
            const leadDest = selectedLead.dest || selectedLead.destinations?.[0] || '';

            if (!Array.isArray(pRegions) || !leadDest) return false;

            return pRegions.includes(leadDest) || pRegions.includes('All Switzerland');
        })
        : [];

    useEffect(() => {
        fetchPartners();
        fetchLeads();

        // Load Sandbox Stats
        const params = new URLSearchParams(window.location.search);
        const isDev = params.get('dev') === 'true';

        if (isDev) {
            setStats(prev => ({
                ...prev,
                pendingRequests: 1,
                activePartners: 14
            }));
        }
    }, []);

    const SidebarItem = ({ icon: Icon, label, id }: any) => (
        <button
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${view === id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div
            className="flex bg-slate-100 font-sans text-slate-900"
            style={{ height: '100vh', minHeight: '100vh', width: '100%' }}
        >

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20" style={{ height: '100%' }}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <span
                        className="text-2xl font-bold tracking-tight text-[#FF6F61]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Relofinder
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
                        Admin
                    </span>
                </div>

                <div className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Mission Control</div>
                    <SidebarItem icon={LayoutDashboard} label="Cockpit" id="cockpit" />
                    <SidebarItem icon={Briefcase} label="Evaluations" id="leads" />
                    <SidebarItem icon={Users} label="Partner Registry" id="partners" />

                    <div className="mt-6 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">System</div>
                    <SidebarItem icon={Settings} label="Global Settings" id="settings" />
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FF6F61]/10 flex items-center justify-center text-xs font-bold text-[#FF6F61]">
                            SA
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">Super Admin</p>
                            <p className="text-xs text-slate-500 truncate">admin@relo.ch</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-100 p-8" style={{ height: '100%' }}>
                {/* View: Cockpit */}
                {view === 'cockpit' && (
                    <div className="space-y-8 max-w-7xl mx-auto h-full">
                        <h1 className="text-2xl font-bold text-slate-900">Cockpit Overview</h1>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Unassigned Leads</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.unassignedValues}</h3>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stats.unassignedValues > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Briefcase size={20} />
                                    </div>
                                </div>
                                {stats.unassignedValues > 0 && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingRequests}</h3>
                                    </div>
                                    <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                                        <Edit3 size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Active Partners</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.activePartners}</h3>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                        <Users size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mock */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800">Recent Activity</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="px-6 py-4 flex items-center text-sm">
                                        <span className="text-slate-400 w-24">2 mins ago</span>
                                        <span className="text-slate-900 font-medium mr-2">New Lead:</span>
                                        <span className="text-slate-600">Relocation to Zurich (Google Inc.)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Partner Registry */}
                {view === 'partners' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Partner Registry</h1>
                                <p className="text-slate-500 text-sm mt-1">Manage partner profiles, logos, and verification status.</p>
                            </div>
                            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
                                <Plus size={16} /> Invite New Partner
                            </button>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Partner</th>
                                        <th className="px-6 py-3">Tier</th>
                                        <th className="px-6 py-3">Verification</th>
                                        <th className="px-6 py-3">Regions</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                                                    Loading partners...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : partners.map((p: Agency) => (
                                        <tr key={p.id} className="hover:bg-slate-50 group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                                                        {p.logo ? (
                                                            <img src={p.logo} alt={p.name} className="max-w-full max-h-full object-contain" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-300">{p.name.substring(0, 2)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{p.name}</div>
                                                        <div className="text-xs text-slate-400 capitalize">{p.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.tier === 'preferred'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : p.tier === 'partner'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                    {p.tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.is_verified ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        <CheckCircle size={14} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-400 border border-slate-100">
                                                        <XCircle size={14} /> Not Vetted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {p.regions_served ? (
                                                    <span className="text-xs">{p.regions_served.length} Regions</span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setEditingPartner(p)}
                                                    className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                                                >
                                                    <Edit3 size={14} /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* View: Matchmaker / Leads */}
                {view === 'leads' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Evaluations & Assignments</h1>
                                <p className="text-slate-500 text-sm mt-1">Review inquiries and coordinate partner matches.</p>
                            </div>

                            {/* Tab Selection */}
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button
                                    onClick={() => setLeadFilter('individuals')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${leadFilter === 'individuals' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Individuals
                                </button>
                                <button
                                    onClick={() => setLeadFilter('corporates')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${leadFilter === 'corporates' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Corporates
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white px-4 py-4 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{leadFilter === 'individuals' ? leads.length : corporateLeads.length}</p>
                            </div>
                            <div className="bg-red-50/50 px-4 py-4 rounded-xl border border-red-100 shadow-sm">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Urgent / New</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {leadFilter === 'individuals'
                                        ? leads.filter(l => l.status === 'new').length
                                        : corporateLeads.filter(l => l.status === 'new').length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                            {leadFilter === 'individuals' ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Submission</th>
                                            <th className="px-6 py-3">Contact</th>
                                            <th className="px-6 py-3">Move Details</th>
                                            <th className="px-6 py-3">Requested Partners</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leads.map((l: any) => (
                                            <tr key={l.id} className="hover:bg-slate-50 group">
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-medium text-slate-500">{new Date(l.created_at).toLocaleDateString()}</div>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${l.status === 'new' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{l.name}</div>
                                                    <div className="text-xs text-slate-500">{l.email}</div>
                                                    {l.phone && <div className="text-[10px] text-slate-400 mt-0.5">{l.phone}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-slate-900 font-medium">
                                                        <MapPin size={14} className="text-[#FF6F61]" /> {l.dest}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-1">
                                                        {l.services?.slice(0, 2).map((s: string) => (
                                                            <span key={s} className="bg-slate-100 px-1 rounded">{s}</span>
                                                        ))}
                                                        {(l.services?.length > 2) && <span>+{l.services.length - 2} more</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex -space-x-2">
                                                        {(l.requested_agencies || []).map((p: string, i: number) => (
                                                            <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm" title={p}>
                                                                <span className="text-[9px] font-bold text-slate-400">{p.substring(0, 2).toUpperCase()}</span>
                                                            </div>
                                                        ))}
                                                        {(!l.requested_agencies || l.requested_agencies.length === 0) && <span className="text-xs text-slate-300">No preference</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {l.status === 'distributed' ? (
                                                        <span className="text-xs text-green-600 font-medium">Distributed</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLead(l);
                                                                // Pre-select requested agencies if any, matching against partner IDs or Names
                                                                // Assuming requested_agencies contains Names for now, need to map to IDs or handle Strings
                                                                // For this implementation, let's assume we map simply or start empty if no match
                                                                // Ideally requested_agencies stores IDs
                                                                const preSelected = (l.requested_agencies || [])
                                                                    .map((reqName: string) => partners.find(p => p.name === reqName)?.id)
                                                                    .filter(Boolean) as string[];

                                                                setSelectedPartners(preSelected);
                                                                setAssignmentModalOpen(true);
                                                            }}
                                                            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                                                        >
                                                            Review & Distribute
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Company</th>
                                            <th className="px-6 py-3">HR Point of Contact</th>
                                            <th className="px-6 py-3">Inquiry Scope</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {corporateLeads.map((c: any) => (
                                            <tr key={c.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{c.company_name}</div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        <Briefcase size={10} /> {c.moves_per_year} moves/year
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800">{c.hr_name}</div>
                                                    <div className="text-xs text-slate-500 underline">{c.hr_email}</div>
                                                    {c.hr_title && <div className="text-[10px] text-slate-400">{c.hr_title}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-slate-700 flex flex-wrap gap-1">
                                                        {c.destinations?.map((d: string) => (
                                                            <span key={d} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-100">{d}</span>
                                                        ))}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-2 italic truncate max-w-[200px]">
                                                        {c.specific_request || c.pain_points?.join(', ')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                                    <span className={`px-2 py-1 rounded ${c.status === 'new' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedLead(c)}
                                                        className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
                                                    >
                                                        Review RFP
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div >
                )
                }
            </main >

            {/* Partner Edit Modal */}
            {
                editingPartner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setEditingPartner(null)}
                        ></div>
                        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Partner Settings</h1>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Registry ID: {editingPartner.id}</p>
                                </div>
                                <button
                                    onClick={() => setEditingPartner(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <XCircle size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div className="flex border-b border-slate-100 px-8 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setActiveTab('admin')}
                                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'admin'
                                        ? 'border-[#FF6F61] text-[#FF6F61]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Partnership & Identity
                                </button>
                                <button
                                    onClick={() => setActiveTab('offices')}
                                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'offices'
                                        ? 'border-[#FF6F61] text-[#FF6F61]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Locations & Offices
                                </button>
                                <button
                                    onClick={() => setActiveTab('team')}
                                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'team'
                                        ? 'border-[#FF6F61] text-[#FF6F61]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Team Roster
                                </button>
                                <button
                                    onClick={() => setActiveTab('operational')}
                                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'operational'
                                        ? 'border-[#FF6F61] text-[#FF6F61]'
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Tags & Chip Selection
                                </button>
                            </div>

                            <form onSubmit={handleUpdatePartner} className="flex-1 overflow-y-auto p-8 space-y-8">
                                {activeTab === 'admin' && (
                                    <>
                                        {/* Section: Basic Identity */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                Identity & Branding
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingPartner.name}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo URL</label>
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                                                            {editingPartner.logo ? (
                                                                <img src={editingPartner.logo} alt="Preview" className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <Plus className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="url"
                                                            value={editingPartner.logo || ''}
                                                            onChange={(e) => setEditingPartner({ ...editingPartner, logo: e.target.value })}
                                                            placeholder="https://..."
                                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Status & Verification */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                Status & Verification
                                            </h3>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Partnership Tier</label>
                                                    <select
                                                        value={editingPartner.tier}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, tier: e.target.value as any })}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all cursor-pointer"
                                                    >
                                                        <option value="standard">Standard</option>
                                                        <option value="partner">Partner</option>
                                                        <option value="preferred">Preferred</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vetted Status</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingPartner({ ...editingPartner, is_verified: !editingPartner.is_verified })}
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${editingPartner.is_verified
                                                            ? 'bg-green-50 border-green-200 text-green-700'
                                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                                            }`}
                                                    >
                                                        <span className="text-sm font-bold uppercase tracking-tight">Verified Provider</span>
                                                        {editingPartner.is_verified ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Contact Data */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                Internal POC (Manager)
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingPartner.manager_name || ''}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, manager_name: e.target.value })}
                                                        placeholder="e.g. Thomas Muller"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Email</label>
                                                    <input
                                                        type="email"
                                                        value={editingPartner.manager_email || ''}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, manager_email: e.target.value })}
                                                        placeholder="t.muller@agency.ch"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={editingPartner.manager_phone || ''}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, manager_phone: e.target.value })}
                                                        placeholder="+41 ..."
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'offices' && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                Main Office
                                            </h3>
                                            <div className="grid grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street & Number</label>
                                                    <input
                                                        type="text"
                                                        value={editingPartner.address_street || ''}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, address_street: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ZIP</label>
                                                    <input
                                                        type="text"
                                                        value={editingPartner.address_zip || ''}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, address_zip: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        value={editingPartner.address_city || ''}
                                                        onChange={(e) => setEditingPartner({ ...editingPartner, address_city: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6F61] transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Additional Offices */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                                    Additional Branch Offices
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={handleAddOffice}
                                                    className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:underline"
                                                >
                                                    <Plus size={14} /> Add Office
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(editingPartner.offices || []).map((office, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOffice(idx)}
                                                            className="absolute -top-2 -right-2 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full hover:text-red-600 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                        <div className="space-y-3">
                                                            <input
                                                                value={office.street}
                                                                onChange={(e) => handleOfficeChange(idx, 'street', e.target.value)}
                                                                placeholder="Street"
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                                                            />
                                                            <div className="flex gap-2">
                                                                <input
                                                                    value={office.zip}
                                                                    onChange={(e) => handleOfficeChange(idx, 'zip', e.target.value)}
                                                                    placeholder="ZIP"
                                                                    className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                                                                />
                                                                <input
                                                                    value={office.city}
                                                                    onChange={(e) => handleOfficeChange(idx, 'city', e.target.value)}
                                                                    placeholder="City"
                                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'team' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                                                Team & Relocation Consultants
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={handleAddTeamMember}
                                                className="text-xs font-bold text-green-600 flex items-center gap-1.5 hover:underline"
                                            >
                                                <Plus size={14} /> Add Member
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {(editingPartner.team || []).map((member, idx) => (
                                                <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl relative group shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTeamMember(idx)}
                                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                                        <div className="md:col-span-1 flex justify-center">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                                <UserCircle2 size={32} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-11 space-y-4">
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="col-span-1">
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                                                                    <input
                                                                        value={member.consultant?.name || ''}
                                                                        onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)}
                                                                        className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold"
                                                                        placeholder="e.g. Sarah Jenkins"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email (Optional)</label>
                                                                    <input
                                                                        value={member.consultant?.email || ''}
                                                                        onChange={(e) => handleTeamMemberChange(idx, 'email', e.target.value)}
                                                                        className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="s.jenkins@agency.ch"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role / Position</label>
                                                                    <input
                                                                        value={member.role || ''}
                                                                        onChange={(e) => handleTeamMemberChange(idx, 'role', e.target.value)}
                                                                        className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="Senior Advisor"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {member.consultant_id && (
                                                                <div className="pt-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveConsultantIntel(activeConsultantIntel === member.consultant_id ? null : member.consultant_id)}
                                                                        className="text-[10px] font-bold text-[#FF6F61] flex items-center gap-1 hover:underline uppercase tracking-wide"
                                                                    >
                                                                        <ExternalLink size={12} /> {activeConsultantIntel === member.consultant_id ? 'Hide Intel' : 'Show Partner Overlap Intel'}
                                                                    </button>
                                                                    {activeConsultantIntel === member.consultant_id && (
                                                                        <ConsultantOverview
                                                                            consultantId={member.consultant_id}
                                                                            consultantName={member.consultant?.name || 'this consultant'}
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'operational' && (
                                    <div className="space-y-10">
                                        {/* Spoken Languages */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                    Spoken Languages
                                                </h3>
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                                    <input
                                                        placeholder="Add custom..."
                                                        value={customTags.languages}
                                                        onChange={(e) => setCustomTags({ ...customTags, languages: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag('languages'))}
                                                        className="bg-transparent text-xs outline-none border-none w-28"
                                                    />
                                                    <button type="button" onClick={() => handleAddCustomTag('languages')} className="text-[#FF6F61] hover:text-[#e56357] transition-colors"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {[...LANGUAGES_OPTIONS, ...(editingPartner.languages || []).filter(l => !LANGUAGES_OPTIONS.includes(l))].map(lang => (
                                                    <button
                                                        key={lang}
                                                        type="button"
                                                        onClick={() => handleMultiSelect('languages', lang)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${editingPartner.languages?.includes(lang)
                                                            ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-md shadow-[#FF6F61]/10'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF6F61]/30'
                                                            }`}
                                                    >
                                                        {lang}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Regions */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                    Regions Served
                                                </h3>
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                                    <input
                                                        placeholder="Add custom..."
                                                        value={customTags.regions_served}
                                                        onChange={(e) => setCustomTags({ ...customTags, regions_served: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag('regions_served' as any))}
                                                        className="bg-transparent text-xs outline-none border-none w-28"
                                                    />
                                                    <button type="button" onClick={() => handleAddCustomTag('regions_served' as any)} className="text-[#FF6F61] hover:text-[#e56357] transition-colors"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {[...REGIONS_OPTIONS, ...(editingPartner.regions_served || []).filter(r => !REGIONS_OPTIONS.includes(r))].map(reg => (
                                                    <button
                                                        key={reg}
                                                        type="button"
                                                        onClick={() => handleMultiSelect('regions_served' as any, reg)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${editingPartner.regions_served?.includes(reg)
                                                            ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-md shadow-[#FF6F61]/10'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF6F61]/30'
                                                            }`}
                                                    >
                                                        {reg}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Services */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                    Service Offering
                                                </h3>
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                                    <input
                                                        placeholder="Add custom..."
                                                        value={customTags.services}
                                                        onChange={(e) => setCustomTags({ ...customTags, services: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag('services'))}
                                                        className="bg-transparent text-xs outline-none border-none w-28"
                                                    />
                                                    <button type="button" onClick={() => handleAddCustomTag('services')} className="text-[#FF6F61] hover:text-[#e56357] transition-colors"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {[...SERVICES_OPTIONS, ...(editingPartner.services || []).filter(s => !SERVICES_OPTIONS.includes(s))].map(service => (
                                                    <button
                                                        key={service}
                                                        type="button"
                                                        onClick={() => handleMultiSelect('services', service)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${editingPartner.services?.includes(service)
                                                            ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-md shadow-[#FF6F61]/10'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF6F61]/30'
                                                            }`}
                                                    >
                                                        {service}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-[#FF6F61] rounded-full"></span>
                                                    Certifications
                                                </h3>
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                                    <input
                                                        placeholder="Add custom..."
                                                        value={customTags.certifications}
                                                        onChange={(e) => setCustomTags({ ...customTags, certifications: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag('certifications'))}
                                                        className="bg-transparent text-xs outline-none border-none w-28"
                                                    />
                                                    <button type="button" onClick={() => handleAddCustomTag('certifications')} className="text-[#FF6F61] hover:text-[#e56357] transition-colors"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {[...CERTIFICATIONS_OPTIONS, ...(editingPartner.certifications || []).filter(c => !CERTIFICATIONS_OPTIONS.includes(c))].map(cert => (
                                                    <button
                                                        key={cert}
                                                        type="button"
                                                        onClick={() => handleMultiSelect('certifications', cert)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${editingPartner.certifications?.includes(cert)
                                                            ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-md shadow-[#FF6F61]/10'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#FF6F61]/30'
                                                            }`}
                                                    >
                                                        {cert}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>



                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingPartner(null)}
                                    className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleUpdatePartner}
                                    disabled={isSaving}
                                    className="flex-2 bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all text-sm shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Check size={18} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Assignment / Distribution Modal */}
            {
                selectedLead && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Distribute Lead</h3>
                                    <p className="text-sm text-slate-500">Review details and select partners for distribution.</p>
                                </div>
                                <button onClick={() => { setSelectedLead(null); setAssignmentModalOpen(false); }} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Left: Lead Details */}
                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Lead Profile</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-slate-500">Client Name</label>
                                                    <div className="font-medium text-slate-900">{selectedLead.name || selectedLead.company_name}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-slate-500">Destination</label>
                                                        <div className="font-medium text-slate-900">{selectedLead.dest || selectedLead.destinations?.[0]}</div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500">Move Date</label>
                                                        <div className="font-medium text-slate-900">{selectedLead.move_date || 'Flexible'}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Budget / Requirements</label>
                                                    <div className="font-medium text-slate-900">{selectedLead.budget || 'Not specified'}</div>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {selectedLead.services?.map((s: string) => (
                                                            <span key={s} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs text-slate-600">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Message</label>
                                                    <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-1 max-h-32 overflow-y-auto">
                                                        {selectedLead.message || selectedLead.notes || 'No message provided.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requested Agencies</h4>
                                            {selectedLead.requested_agencies?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedLead.requested_agencies.map((agencyName: string) => (
                                                        <span key={agencyName} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                                            {agencyName}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No specific agencies requested.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Partner Selection */}
                                    <div className="flex flex-col h-full bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Select Partners to Quote ({selectedPartners.length})</h4>

                                        <div className="mb-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Search partners..."
                                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 overflow-y-auto max-h-[400px]">
                                            <div className="divide-y divide-slate-100">
                                                {partners.map(partner => (
                                                    <div
                                                        key={partner.id}
                                                        onClick={() => togglePartnerSelection(partner.id)}
                                                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${selectedPartners.includes(partner.id) ? 'bg-slate-50' : 'hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPartners.includes(partner.id)
                                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                                : 'border-slate-300'
                                                                }`}>
                                                                {selectedPartners.includes(partner.id) && <Check size={10} />}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-900">{partner.name}</div>
                                                                <div className="text-[10px] text-slate-500">{partner.regions_served?.length || 0} regions • {partner.tier}</div>
                                                            </div>
                                                        </div>
                                                        {partner.is_verified && <CheckCircle size={14} className="text-green-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button
                                    onClick={() => { setSelectedLead(null); setAssignmentModalOpen(false); }}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                {selectedLead.status === 'distributed' ? (
                                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <CheckCircle size={16} /> Already Distributed
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleDistribute}
                                        disabled={selectedPartners.length === 0}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${selectedPartners.length > 0
                                            ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md transform hover:-translate-y-0.5'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Distribute to {selectedPartners.length} Partners <ExternalLink size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
