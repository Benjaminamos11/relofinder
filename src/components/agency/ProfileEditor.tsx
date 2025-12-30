
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Upload, MapPin, Globe, Loader2, Mail, Phone, User, Briefcase, Award } from 'lucide-react';

const REGIONS_OPTIONS = ['Zurich', 'Geneva', 'Basel', 'Bern', 'Zug', 'Vaud', 'Lucerne', 'Ticino'];
const SERVICES_OPTIONS = ['Home Search', 'Visa & Immigration', 'School Search', 'Settling In', 'Departure Support', 'Short-term Accommodation', 'Spouse Support'];
const LANGUAGES_OPTIONS = ['English', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Russian', 'Mandarin'];
const CERTIFICATIONS_OPTIONS = ['EuRA Member', 'EuRA Global Quality Seal', 'SARA Member', 'FIDI FAIM', 'CERC', 'IAM', 'Worldwide ERC'];

export default function ProfileEditor({ partner, onUpdate }: { partner: any, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (partner) {
            setFormData({
                name: partner.name || '',
                founded_year: partner.founded_year || '',
                employee_count: partner.employee_count || '',
                website: partner.website || '',
                bio: partner.bio || '',
                address_street: partner.address_street || '',
                address_city: partner.address_city || '',
                address_zip: partner.address_zip || '',
                phone_number: partner.phone_number || '',
                contact_email: partner.contact_email || '', // Critical: Matches DB column
                regions_served: partner.regions_served || [],
                services: partner.services || [],
                languages: partner.languages || [],
                manager_name: partner.manager_name || '',
                manager_title: partner.manager_title || '',
                manager_email: partner.manager_email || '',
                manager_phone: partner.manager_phone || '',
                logo: partner.logo || '',
                meeting_url: partner.meeting_url || '',
                certifications: partner.certifications || []
            });
        }
    }, [partner]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (field: string, value: string) => {
        setFormData((prev: any) => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter((item: string) => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Explicit payload to avoid sending unwanted fields
            const payload = {
                name: formData.name,
                founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
                employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
                website: formData.website,
                bio: formData.bio,
                address_street: formData.address_street,
                address_city: formData.address_city,
                address_zip: formData.address_zip,
                phone_number: formData.phone_number,
                contact_email: formData.contact_email,
                regions_served: formData.regions_served,
                services: formData.services,
                languages: formData.languages,
                manager_name: formData.manager_name,
                manager_title: formData.manager_title,
                manager_email: formData.manager_email,
                manager_phone: formData.manager_phone,
                logo: formData.logo,
                meeting_url: formData.meeting_url,
                certifications: formData.certifications
            };

            const { error } = await supabase
                .from('relocators')
                .update(payload)
                .eq('id', partner.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            onUpdate(); // Refresh parent state
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    if (!formData) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto pb-40">

            {/* Sticky Header with Actions */}
            <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200 mb-6 flex justify-between items-center -mx-4 px-4 md:-mx-8 md:px-8">
                <div>
                    <h2 className="text-xl font-serif font-bold text-slate-900">Edit Profile</h2>
                    <p className="text-sm text-slate-500">Update your agency details and visibility settings.</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Core Identity & Contact */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Section A: Company Identity */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Globe size={18} className="text-slate-400" /> Company Identity
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* LOGO INPUT - SIMPLIFIED */}
                                <div className="shrink-0 w-full md:w-auto">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Company Logo</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="w-32 h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                                            {formData.logo ? (
                                                <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <span className="text-xs text-slate-400">No Logo</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                                            <input
                                                type="url"
                                                name="logo"
                                                value={formData.logo}
                                                onChange={handleChange}
                                                placeholder="https://..."
                                                className="w-full md:w-48 px-2 py-1 text-xs border border-slate-200 rounded focus:border-slate-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none font-bold text-slate-900" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                                            <div className="relative">
                                                <Globe size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-slate-600" placeholder="https://" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Founded Year</label>
                                            <input type="number" name="founded_year" value={formData.founded_year} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Employees</label>
                                            <input type="number" name="employee_count" value={formData.employee_count} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600 focus:border-slate-400 outline-none" rows={4} placeholder="Describe your agency..." />
                            </div>
                        </div>
                    </div>

                    {/* Section B: Contact & Address */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <MapPin size={18} className="text-slate-400" />
                            <h3 className="font-bold text-slate-800">Contact Details</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                                    <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Bahnhofstrasse 1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                    <input type="text" name="address_city" value={formData.address_city} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Zurich" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code</label>
                                    <input type="text" name="address_zip" value={formData.address_zip} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="8001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">General Phone</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                                        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">General Email</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                                        <input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Calendar / Booking Link</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">https://</span>
                                        <input type="text" name="meeting_url" value={formData.meeting_url ? formData.meeting_url.replace('https://', '') : ''} onChange={(e) => setFormData({ ...formData, meeting_url: 'https://' + e.target.value.replace('https://', '') })} className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg outline-none focus:border-slate-400" placeholder="calendly.com/..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Operations & Manager */}
                <div className="space-y-6">

                    {/* Section D: Dedicated Manager */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <User size={18} className="text-slate-400" />
                            <h3 className="font-bold text-slate-800">Team Manager</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input type="text" name="manager_name" value={formData.manager_name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                <input type="text" name="manager_title" value={formData.manager_title} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Direct Email</label>
                                <input type="email" name="manager_email" value={formData.manager_email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Section C: Operations Tags */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <Briefcase size={18} className="text-slate-400" />
                            <h3 className="font-bold text-slate-800">Capabilities</h3>
                        </div>
                        <div className="p-6 space-y-6">

                            {/* REGIONS */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Regions Served</label>
                                <div className="flex flex-wrap gap-2">
                                    {REGIONS_OPTIONS.map(region => (
                                        <button
                                            key={region}
                                            type="button"
                                            onClick={() => handleMultiSelect('regions_served', region)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase border transition-all ${formData.regions_served.includes(region)
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {region}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SERVICES */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Services</label>
                                <div className="flex flex-wrap gap-2">
                                    {SERVICES_OPTIONS.map(service => (
                                        <button
                                            key={service}
                                            type="button"
                                            onClick={() => handleMultiSelect('services', service)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase border transition-all ${formData.services.includes(service)
                                                ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* LANGUAGES - ADDED */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Languages</label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES_OPTIONS.map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => handleMultiSelect('languages', lang)}
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${formData.languages.includes(lang)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CERTIFICATIONS */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Certifications</label>
                                <div className="flex flex-wrap gap-2">
                                    {CERTIFICATIONS_OPTIONS.map(cert => (
                                        <button
                                            key={cert}
                                            type="button"
                                            onClick={() => handleMultiSelect('certifications', cert)}
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${formData.certifications?.includes(cert)
                                                ? 'bg-green-600 text-white border-green-600'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {cert}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </form>
    );
}
