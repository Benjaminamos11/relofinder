import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Save,
    Upload,
    Globe,
    MapPin,
    Briefcase,
    Award,
    Phone,
    Mail,
    Calendar,
    Check,
    Languages,
    Building2
} from 'lucide-react';
import { regions } from '../../data/regions'; // Fallback or use DB
import { services as servicesList } from '../../data/services'; // Fallback or use DB

export default function ProfileEditor({ partner, onUpdate }: any) {
    const [formData, setFormData] = useState(partner || {});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (partner) setFormData(partner);
    }, [partner]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleArrayToggle = (field: string, value: string) => {
        setFormData((prev: any) => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter((item: string) => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('relocators')
                .update({
                    name: formData.name,
                    bio: formData.bio,
                    website: formData.website,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone,
                    logo: formData.logo,
                    founded: formData.founded,
                    employees: formData.employees,
                    address_street: formData.address_street,
                    address_city: formData.address_city,
                    address_zip: formData.address_zip,
                    calendar_link: formData.calendar_link,
                    regions_served: formData.regions_served,
                    services: formData.services,
                    languages: formData.languages,
                    certifications: formData.certifications,
                    manager_name: formData.manager_name,
                    manager_role: formData.manager_role,
                    manager_email: formData.manager_email
                })
                .eq('id', partner.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
            if (onUpdate) onUpdate();
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setSaving(false);
        }
    };

    // --- SUB-COMPONENTS FOR REUSE ---

    const SectionHeader = ({ icon: Icon, title }: any) => (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-slate-50 text-[#FF6F61] rounded-lg">
                <Icon size={18} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-serif tracking-tight">{title}</h3>
        </div>
    );

    const InputField = ({ label, name, type = "text", placeholder, width = "w-full" }: any) => (
        <div className={width}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
            <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-lg text-slate-700 text-sm focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#FF6F61]/20 outline-none transition-all placeholder:text-slate-300"
            />
        </div>
    );

    const SmartChip = ({ label, active, onClick }: any) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all border ${active
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md transform scale-105'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                }`}
        >
            {label}
        </button>
    );

    // --- DATA LISTS ---
    const allServices = ['Home Search', 'Visa & Immigration', 'School Search', 'Settling In', 'Departure Support', 'Short-term Accommodation', 'Spouse Support', 'Moving Managment', 'Legal Advice', 'Tax Advice'];
    const allRegions = ['Zurich', 'Geneva', 'Basel', 'Bern', 'Zug', 'Vaud', 'Lucerne', 'Ticino', 'St. Gallen', 'Fribourg', 'Valais'];
    const allLanguages = ['English', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Russian', 'Mandarin', 'Arabic', 'Japanese'];
    const allCerts = ['EuRA Member', 'EuRA Global Quality Seal', 'SARA Member', 'FIDI FAIM', 'CERC', 'IAM', 'Worldwide ERC'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg shadow-slate-200/50 sticky top-24 z-20 border border-slate-50/50">
                <div>
                    {message && (
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </span>
                    )}
                    {!message && <span className="text-sm text-slate-400 italic">Example tip: Keep your bio concise.</span>}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                    {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Identity & Contact */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Identity Card */}
                    <section className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                        <SectionHeader icon={Globe} title="Company Identity" />

                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            {/* Logo */}
                            <div className="shrink-0 flex flex-col items-center gap-3">
                                <div className="w-32 h-32 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group relative">
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo" className={`w-24 h-24 object-contain ${formData.name?.includes('AM Relocation') ? 'invert' : ''}`} />
                                    ) : (
                                        <span className="text-xs text-slate-300 font-bold uppercase">No Logo</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                </div>
                                <div className="w-full">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-center">Image URL</label>
                                    <input
                                        type="url" name="logo" value={formData.logo || ''} onChange={handleChange}
                                        className="w-32 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded text-center focus:bg-white focus:ring-1 border-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* Core Fields */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Company Name" name="name" placeholder="e.g. Swiss Relo" />
                                <InputField label="Website" name="website" placeholder="https://" />
                                <InputField label="Founded Year" name="founded" type="number" placeholder="2010" />
                                <InputField label="Team Size" name="employees" placeholder="1-10" />
                            </div>
                        </div>

                        <div className="w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-lg text-slate-700 text-sm focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#FF6F61]/20 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                            />
                        </div>
                    </section>

                    {/* Contact Card */}
                    <section className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                        <SectionHeader icon={MapPin} title="Contact & Location" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-3">
                                <InputField label="Street Address" name="address_street" placeholder="Bahnhofstrasse 1" />
                            </div>
                            <div className="md:col-span-2">
                                <InputField label="City" name="address_city" placeholder="Zurich" />
                            </div>
                            <InputField label="Postal Code" name="address_zip" placeholder="8001" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InputField label="General Phone" name="contact_phone" placeholder="+41 ..." />
                            <InputField label="General Email" name="contact_email" placeholder="hello@company.ch" />
                        </div>

                        {/* Calendar Link - Special Styling */}
                        <div className="w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Calendar size={12} className="text-[#FF6F61]" /> Booking Link
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-400 text-sm font-medium">https://</span>
                                <input
                                    type="text"
                                    name="calendar_link"
                                    value={formData.calendar_link?.replace('https://', '') || ''}
                                    onChange={(e) => handleChange({ target: { name: 'calendar_link', value: 'https://' + e.target.value.replace('https://', '') } })}
                                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-transparent rounded-lg text-slate-700 text-sm focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#FF6F61]/20 outline-none transition-all"
                                    placeholder="calendly.com/your-org"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 px-1">Adding a calendar link increases conversion by 30%.</p>
                        </div>
                    </section>
                </div>

                {/* Right Column: Capabilities & Team */}
                <div className="space-y-8">

                    {/* Team Manager */}
                    <section className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/40">
                        <SectionHeader icon={Briefcase} title="Team Manager" />
                        <div className="space-y-5">
                            <InputField label="Full Name" name="manager_name" placeholder="John Doe" />
                            <InputField label="Job Title" name="manager_role" placeholder="Head of Global Mobility" />
                            <InputField label="Direct Email" name="manager_email" placeholder="john@company.ch" />
                        </div>
                    </section>

                    {/* Capabilities */}
                    <section className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/40">
                        <SectionHeader icon={Award} title="Capabilities" />

                        {/* Regions */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <MapPin size={12} /> Switzerland Regions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allRegions.map((region) => (
                                    <SmartChip
                                        key={region}
                                        label={region}
                                        active={formData.regions_served?.includes(region)}
                                        onClick={() => handleArrayToggle('regions_served', region)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Building2 size={12} /> Services
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allServices.map((service) => (
                                    <SmartChip
                                        key={service}
                                        label={service}
                                        active={formData.services?.includes(service)}
                                        onClick={() => handleArrayToggle('services', service)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Languages size={12} /> Languages
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allLanguages.map((lang) => (
                                    <SmartChip
                                        key={lang}
                                        label={lang}
                                        active={formData.languages?.includes(lang)}
                                        onClick={() => handleArrayToggle('languages', lang)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div>
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Award size={12} /> Certifications
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allCerts.map((cert) => (
                                    <SmartChip
                                        key={cert}
                                        label={cert}
                                        active={formData.certifications?.includes(cert)}
                                        onClick={() => handleArrayToggle('certifications', cert)}
                                    />
                                ))}
                            </div>
                        </div>

                    </section>
                </div>
            </div>
        </div>
    );
}
