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
        <div className={`bg-white rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/5 overflow-hidden w-full transition-all duration-300 ${className}`}>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('private')}
                    className={`flex-1 py-5 text-center font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'private'
                        ? 'bg-white text-slate-900 border-b-2 border-[#FF6F61]'
                        : 'bg-slate-50/50 text-slate-400 border-b-2 border-transparent hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    Private Move
                </button>
                <button
                    onClick={() => setActiveTab('corporate')}
                    className={`flex-1 py-5 text-center font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'corporate'
                        ? 'bg-white text-slate-900 border-b-2 border-[#FF6F61]'
                        : 'bg-slate-50/50 text-slate-400 border-b-2 border-transparent hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    Corporate Inquiry
                </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-10">

                {/* Private Tab Content */}
                {activeTab === 'private' && (
                    <form onSubmit={handlePrivateSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-6">

                            {/* When? */}
                            <div className="relative group">
                                <label htmlFor="when-select" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">When?</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6F61] transition-colors duration-300" />
                                    <select
                                        id="when-select"
                                        value={when}
                                        onChange={(e) => setWhen(e.target.value)}
                                        className="w-full pl-12 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#FF6F61]/10 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all duration-300"
                                    >
                                        <option value="" disabled>Select Timeline</option>
                                        <option value="immediately">Immediately</option>
                                        <option value="next-month">Next Month</option>
                                        <option value="3-months">Within 3 Months</option>
                                        <option value="6-months">Within 6 Months</option>
                                        <option value="1-year">Within 1 Year</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>

                            {/* Where? */}
                            <div className="relative group">
                                <label htmlFor="where-select" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Where?</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6F61] transition-colors duration-300" />
                                    <select
                                        id="where-select"
                                        value={where}
                                        onChange={(e) => setWhere(e.target.value)}
                                        className="w-full pl-12 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#FF6F61]/10 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all duration-300"
                                    >
                                        <option value="" disabled>Select Destination</option>
                                        {cantons.map(c => (
                                            <option key={c.code} value={c.slug}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>

                            {/* Service? */}
                            <div className="relative group">
                                <label htmlFor="service-select" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Service Needed</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6F61] transition-colors duration-300" />
                                    <select
                                        id="service-select"
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                        className="w-full pl-12 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#FF6F61]/10 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all duration-300"
                                    >
                                        <option value="" disabled>Select Service</option>
                                        <option value="full-package">Full Package</option>
                                        {services.map(s => (
                                            <option key={s.slug} value={s.slug}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="block w-full py-5 bg-[#FF6F61] hover:bg-[#ff5d4d] text-white font-bold rounded-2xl shadow-lg shadow-[#FF6F61]/30 hover:shadow-xl hover:shadow-[#FF6F61]/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-lg flex items-center justify-center tracking-wide"
                        >
                            See Available Agencies
                        </button>

                        <p className="text-xs text-slate-400 text-center font-medium mt-4 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Compare 50+ vetted agencies. 100% free & anonymous.
                        </p>
                    </form>
                )}

                {/* Corporate Tab Content */}
                {activeTab === 'corporate' && (
                    <form onSubmit={handleCorporateSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-6">

                            {/* Company Name */}
                            <div className="relative group">
                                <label htmlFor="company-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6F61] transition-colors duration-300" />
                                    <input
                                        id="company-name"
                                        type="text"
                                        placeholder="Enter Company Name"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 font-bold focus:bg-white focus:ring-4 focus:ring-[#FF6F61]/10 focus:border-[#FF6F61] outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Yearly Volume */}
                            <div className="relative group">
                                <label htmlFor="yearly-volume" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Yearly Volume</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6F61] transition-colors duration-300" />
                                    <select
                                        id="yearly-volume"
                                        value={yearlyVolume}
                                        onChange={(e) => setYearlyVolume(e.target.value)}
                                        className="w-full pl-12 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#FF6F61]/10 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all duration-300"
                                    >
                                        <option value="" disabled>Select Volume</option>
                                        <option value="1-5">1-5 Moves / Year</option>
                                        <option value="5-20">5-20 Moves / Year</option>
                                        <option value="20+">20+ Moves / Year</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>

                            {/* Primary Destination */}
                            <div className="relative group">
                                <label htmlFor="hub-select" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Primary Destination</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6F61] transition-colors duration-300" />
                                    <select
                                        id="hub-select"
                                        value={primaryDestination}
                                        onChange={(e) => setPrimaryDestination(e.target.value)}
                                        className="w-full pl-12 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-[#FF6F61]/10 focus:border-[#FF6F61] outline-none appearance-none cursor-pointer transition-all duration-300"
                                    >
                                        <option value="" disabled>Select Hub</option>
                                        <option value="zurich">Zurich</option>
                                        <option value="geneva">Geneva</option>
                                        <option value="basel">Basel</option>
                                        <option value="other">Other / Multiple</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none group-hover:text-slate-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="block w-full py-5 bg-[#FF6F61] hover:bg-[#ff5d4d] text-white font-bold rounded-2xl shadow-lg shadow-[#FF6F61]/30 hover:shadow-xl hover:shadow-[#FF6F61]/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-lg flex items-center justify-center tracking-wide"
                        >
                            Start Anonymous Tender
                        </button>

                        <p className="text-xs text-slate-400 text-center font-medium mt-4 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            Streamline your mobility program. Free for HR teams.
                        </p>
                    </form>
                )}

            </div>
        </div>
    );
}
