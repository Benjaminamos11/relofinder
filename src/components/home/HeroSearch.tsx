import React, { useState } from 'react';
import { MapPin, Home, FileText, ChevronDown, Building2, Calendar, Briefcase } from 'lucide-react';

const cantons = [
    { name: "Zurich", code: "ZH", slug: "zurich" },
    { name: "Geneva", code: "GE", slug: "geneva" },
    { name: "Basel-Stadt", code: "BS", slug: "basel-stadt" },
    { name: "Zug", code: "ZG", slug: "zug" },
    { name: "Vaud", code: "VD", slug: "vaud" },
    { name: "Bern", code: "BE", slug: "bern" },
    { name: "Lucerne", code: "LU", slug: "lucerne" },
    { name: "St. Gallen", code: "SG", slug: "st-gallen" }
];

const services = [
    { name: "Housing Search", slug: "housing-search" },
    { name: "Visa & Immigration", slug: "visa-immigration" },
    { name: "Moving Logistics", slug: "moving-logistics" },
    { name: "School Search", slug: "school-search" },
    { name: "Strategic Advisory", slug: "advisory" }
];

interface HeroSearchProps {
    initialDestination?: string;
    initialService?: string;
    className?: string;
}

export default function HeroSearch({ initialDestination = '', initialService = '', className = '' }: HeroSearchProps) {
    const [activeTab, setActiveTab] = useState<'private' | 'corporate'>('private');

    // Form State - Private
    const [when, setWhen] = useState('');
    const [where, setWhere] = useState(initialDestination); // Pre-fill
    const [service, setService] = useState(initialService);

    // Form State - Corporate
    const [companyName, setCompanyName] = useState('');
    const [yearlyVolume, setYearlyVolume] = useState('');
    const [primaryDestination, setPrimaryDestination] = useState(initialDestination); // Pre-fill

    const handlePrivateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (when) params.set('when', when);
        if (where) params.set('where', where);
        if (service) params.set('service', service);
        window.location.href = `/search/results?${params.toString()}`;
    };

    const handleCorporateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (companyName) params.set('company', companyName);
        if (yearlyVolume) params.set('volume', yearlyVolume);
        if (primaryDestination) params.set('where', primaryDestination);

        // Redirect to specialized corporate search results page
        window.location.href = `/corporate/search?${params.toString()}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden w-full transition-all duration-300">

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('private')}
                    className={`flex-1 py-4 text-center font-semibold text-sm transition-all ${activeTab === 'private'
                        ? 'bg-white text-slate-800 border-b-2 border-[#FF6F61]'
                        : 'bg-slate-50 text-slate-500 border-b-2 border-transparent hover:text-slate-700 hover:bg-slate-100'
                        }`}
                >
                    Private Move
                </button>
                <button
                    onClick={() => setActiveTab('corporate')}
                    className={`flex-1 py-4 text-center font-semibold text-sm transition-all ${activeTab === 'corporate'
                        ? 'bg-white text-slate-800 border-b-2 border-[#FF6F61]'
                        : 'bg-slate-50 text-slate-500 border-b-2 border-transparent hover:text-slate-700 hover:bg-slate-100'
                        }`}
                >
                    Corporate Inquiry
                </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">

                {/* Private Tab Content */}
                {activeTab === 'private' && (
                    <form onSubmit={handlePrivateSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-5">

                            {/* When? */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">When?</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        value={when}
                                        onChange={(e) => setWhen(e.target.value)}
                                        className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all font-medium"
                                    >
                                        <option value="" disabled>Select Timeline</option>
                                        <option value="immediately">Immediately</option>
                                        <option value="next-month">Next Month</option>
                                        <option value="3-months">Within 3 Months</option>
                                        <option value="6-months">Within 6 Months</option>
                                        <option value="1-year">Within 1 Year</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Where? */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">Where?</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        value={where}
                                        onChange={(e) => setWhere(e.target.value)}
                                        className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all font-medium"
                                    >
                                        <option value="" disabled>Select Destination</option>
                                        {cantons.map(c => (
                                            <option key={c.code} value={c.slug}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Service? */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">Service Needed</label>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                        className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all font-medium"
                                    >
                                        <option value="" disabled>Select Service</option>
                                        <option value="full-package">Full Package</option>
                                        {services.map(s => (
                                            <option key={s.slug} value={s.slug}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="block w-full py-4 bg-[#FF6F61] hover:bg-[#f65d4e] text-white font-bold rounded-lg shadow-lg shadow-[#FF6F61]/20 transition-all transform hover:-translate-y-0.5 text-lg flex items-center justify-center"
                        >
                            See Available Agencies
                        </button>

                        <p className="text-xs text-slate-400 text-center font-medium mt-3">
                            Compare 50+ vetted agencies. 100% free & anonym.
                        </p>
                    </form>
                )}

                {/* Corporate Tab Content */}
                {activeTab === 'corporate' && (
                    <form onSubmit={handleCorporateSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-5">

                            {/* Company Name */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter Company Name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Yearly Volume */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">Yearly Volume</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        value={yearlyVolume}
                                        onChange={(e) => setYearlyVolume(e.target.value)}
                                        className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all font-medium"
                                    >
                                        <option value="" disabled>Select Volume</option>
                                        <option value="1-5">1-5 Moves / Year</option>
                                        <option value="5-20">5-20 Moves / Year</option>
                                        <option value="20+">20+ Moves / Year</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Primary Destination */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-left">Primary Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                                    <select
                                        value={primaryDestination}
                                        onChange={(e) => setPrimaryDestination(e.target.value)}
                                        className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all font-medium"
                                    >
                                        <option value="" disabled>Select Hub</option>
                                        <option value="zurich">Zurich</option>
                                        <option value="geneva">Geneva</option>
                                        <option value="basel">Basel</option>
                                        <option value="other">Other / Multiple</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="block w-full py-4 bg-[#FF6F61] hover:bg-[#f65d4e] text-white font-bold rounded-lg shadow-lg shadow-[#FF6F61]/20 transition-all transform hover:-translate-y-0.5 text-lg flex items-center justify-center"
                        >
                            Start Anonymous Tender
                        </button>

                        <p className="text-xs text-slate-400 text-center font-medium mt-3">
                            Streamline your mobility program. Free for HR teams.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
