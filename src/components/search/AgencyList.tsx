import React, { useState, useMemo, useEffect } from 'react';
import { Star, CheckCircle, ShieldCheck, MapPin, Filter, ArrowUpDown, X, Scale, Info, Check, MessageSquare } from 'lucide-react';
import ComparisonBar from '../ComparisonBar';

interface Agency {
    id: string;
    name: string;
    logo: string | null;
    avg_rating: number;
    reviews_count: number;
    verified: boolean;
    corporate_ready: boolean;
    description: string;
    tags: string[];
    price_tier: 1 | 2 | 3;
    slug: string;
}

interface ComparisonData {
    consultation_fee: string;
    free_intro: boolean;
    packages: boolean;
    languages: string[];
}

interface AgencyListProps {
    agencies: Agency[];
    initialCanton: string;
    initialService?: string;
    initialWhen?: string;
    isCorporate?: boolean;
}

// Mock detailed data for comparison (until DB has it)
const getMockComparisonData = (id: string): ComparisonData => {
    const data: Record<string, ComparisonData> = {
        'PRIME': { consultation_fee: 'Free', free_intro: true, packages: true, languages: ['English', 'German', 'French'] },
        'WELCOME': { consultation_fee: 'CHF 150', free_intro: true, packages: true, languages: ['English', 'German'] },
        'default': { consultation_fee: 'From CHF 120', free_intro: true, packages: true, languages: ['English', 'German'] }
    };
    return data[id] || data['default'];
};

export default function AgencyList({ agencies, initialCanton, initialService, initialWhen, isCorporate }: AgencyListProps) {
    const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_asc'>('recommended');
    const isComparisonMode = false; // Disabled selection-based comparison

    const handleRequestAssessment = () => {
        // @ts-ignore
        if (window.openAssessmentModal) {
            // @ts-ignore
            window.openAssessmentModal(isCorporate ? 'corporate' : 'full-package', initialCanton);
        }
    };

    // Sorting Logic
    const sortedAgencies = useMemo(() => {
        return [...agencies].sort((a, b) => {
            if (sortBy === 'rating') return b.avg_rating - a.avg_rating;
            if (sortBy === 'price_asc') return a.price_tier - b.price_tier;
            if (a.verified && !b.verified) return -1;
            if (!a.verified && b.verified) return 1;
            return b.avg_rating - a.avg_rating;
        });
    }, [agencies, sortBy]);

    const getPriceLabel = (tier: number) => {
        return 'CHF ' + '$'.repeat(tier);
    };

    if (agencies.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No agencies found in {initialCanton} yet.</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Our network is expanding. Contact our concierge for manual assistance.
                </p>
                <button
                    // @ts-ignore
                    onClick={() => window.universalOpenModal('concierge')}
                    className="px-6 py-2.5 bg-[#FF6F61] text-white font-bold rounded-lg hover:bg-[#f65d4e] transition-colors"
                >
                    Contact Concierge
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">

            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Results</span>
                        <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                        {isComparisonMode ? (
                            <span>Selected Agencies <span className="text-slate-400 font-normal ml-2">({agencies.length})</span></span>
                        ) : (
                            <>
                                {isCorporate ? 'Authorized Enterprise Partners' : 'Top-Rated Agencies'}
                                <span className="text-slate-400 font-normal ml-2">({agencies.length} providers)</span>
                            </>
                        )}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-[#FF6F61] outline-none appearance-none cursor-pointer hover:border-slate-300 transition-all font-medium"
                        >
                            <option value="recommended">Recommended First</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price_asc">Price: Low to High</option>
                        </select>
                        <ArrowUpDown className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <Filter className="absolute right-2.5 top-3 w-4 h-4 text-slate-400 pointer-events-none opacity-0" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4 mb-32">
                {sortedAgencies.map((agency) => (
                    <div
                        key={agency.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 md:flex overflow-hidden relative group hover:shadow-xl hover:border-slate-300"
                        onClick={handleRequestAssessment}
                    >
                        {/* Left: Branding */}
                        <div className="md:w-56 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 bg-slate-50/30">
                            <div className="w-28 h-28 mb-4 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-3 shadow-sm group-hover:shadow-md transition-shadow">
                                {agency.logo ? (
                                    <img src={agency.logo} alt={agency.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-xs font-bold text-slate-300">LOGO</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-slate-800">{agency.avg_rating.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">TrustScore</span>
                            </div>
                        </div>

                        {/* Middle: Content */}
                        <div className="flex-1 p-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">{agency.name}</h3>
                                {agency.verified && (
                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#FF6F61] bg-[#FF6F61]/5 px-2.5 py-1 rounded-full border border-[#FF6F61]/10">
                                        <CheckCircle className="w-3 h-3" /> Preferred Provider
                                    </span>
                                )}
                                {agency.corporate_ready && (
                                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                        <ShieldCheck className="w-3 h-3" /> B2B Qualified
                                    </span>
                                )}
                            </div>
                            {/* REMOVED INCORRECT TEXT BLOCK HERE */}
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 max-w-2xl">
                                {agency.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {agency.tags.slice(0, 5).map(tag => (
                                    <span key={tag} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="md:w-64 p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-50 bg-slate-50/20">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pricing</span>
                                    <span className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-100">{getPriceLabel(agency.price_tier)}</span>
                                </div>
                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Free Intro Call
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Package Pricing
                                    </div>
                                </div>
                            </div>

                            <div
                                className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-200 text-slate-500 bg-white group-hover:border-[#FF6F61] group-hover:text-[#FF6F61] transition-all font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {isCorporate ? 'Start Anonymous Tender' : 'Get Professional Quote'}
                            </div>
                        </div>
                    </div>
                ))
                }
            </div>

            {/* Removed comparison bar and managed tender overlay to enforce concatenated concierge flow */}

        </div >
    );
}
