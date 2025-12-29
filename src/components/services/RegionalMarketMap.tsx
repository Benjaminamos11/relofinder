import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Wallet, Building2, MapPin } from 'lucide-react';
import swissMapImg from '../../assets/swiss-map-static.png';

const cities = [
    {
        id: 'zurich',
        name: 'Zürich',
        short: 'ZH',
        difficulty: 'Extreme',
        badgeColor: 'bg-red-100 text-[#FF6F61]',
        stats: {
            vacancy: '0.06%',
            price: 'CHF 3.5k - 5.5k',
            priceLabel: 'High'
        },
        vibe: 'Fast-paced. Leases signed in 24h.',
        commute_title: 'Smart Commuter',
        commute_text: <>Can't find in the city? Look to the <strong className="text-slate-900">Silver Coast</strong> (Kilchberg, Thalwil) or <strong className="text-slate-900">Glattal</strong> (Wallisellen).</>,
        link: '/regions/zurich'
    },
    {
        id: 'zug',
        name: 'Zug',
        short: 'ZG',
        difficulty: 'Locked',
        badgeColor: 'bg-red-100 text-[#FF6F61]',
        stats: {
            vacancy: '0.04%',
            price: 'CHF 4.0k - 6.5k',
            priceLabel: 'High Rent, Low Tax'
        },
        vibe: 'New modern builds, crypto/finance focus.',
        commute_title: 'Smart Commuter',
        commute_text: <>Inventory is scarce. Look to <strong className="text-slate-900">Walchwil</strong> for views or <strong className="text-slate-900">Cham/Rotkreuz</strong> for quick access.</>,
        link: '/regions/zug'
    },
    {
        id: 'basel',
        name: 'Basel',
        short: 'BS',
        difficulty: 'Moderate',
        badgeColor: 'bg-yellow-100 text-yellow-700',
        stats: {
            vacancy: '1.1%',
            price: 'CHF 2.5k - 4.5k',
            priceLabel: 'Moderate'
        },
        vibe: 'Driven by Roche/Novartis campuses.',
        commute_title: 'Smart Commuter',
        commute_text: <>Avoid cross-border tax complexity. Look to <strong className="text-slate-900">Binningen</strong> or <strong className="text-slate-900">Bottmingen</strong> for greenery.</>,
        link: '/regions/basel'
    },
    {
        id: 'lausanne',
        name: 'Lausanne',
        short: 'VD',
        difficulty: 'High',
        badgeColor: 'bg-orange-100 text-orange-700',
        stats: {
            vacancy: '0.5%',
            price: 'CHF 3.0k - 4.5k',
            priceLabel: 'High Demand'
        },
        vibe: 'Hills, Lake Views, Metro access.',
        commute_title: 'M2 Strategy',
        commute_text: <>The M2 Metro is the lifeline. Look at <strong className="text-slate-900">Epalinges</strong> for space or <strong className="text-slate-900">Pully/Lutry</strong> for vineyards.</>,
        link: '/regions/lausanne'
    },
    {
        id: 'geneva',
        name: 'Geneva',
        short: 'GE',
        difficulty: 'High + Admin',
        badgeColor: 'bg-orange-100 text-orange-700',
        stats: {
            vacancy: '0.1%',
            price: 'CHF 4k - 6.5k',
            priceLabel: 'Very High'
        },
        vibe: 'Formal applications, strict "3x Salary" rule.',
        commute_title: 'Smart Commuter',
        commute_text: <>Families often move to <strong className="text-slate-900">Terre Sainte</strong> (Coppet, Founex) in Vaud for villas and lower taxes.</>,
        link: '/regions/geneva'
    }
];

export default function RegionalMarketMap() {
    const [selectedCityId, setSelectedCityId] = useState('zurich');
    const [isPaused, setIsPaused] = useState(false);

    const selectedCity = cities.find(c => c.id === selectedCityId) || cities[0];

    // Auto-slide effect
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            const currentIndex = cities.findIndex(c => c.id === selectedCityId);
            const nextIndex = (currentIndex + 1) % cities.length;
            setSelectedCityId(cities[nextIndex].id);
        }, 4000); // 4 seconds

        return () => clearInterval(interval);
    }, [selectedCityId, isPaused]);

    return (
        <div className="w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>

            {/* Navigation Tabs - Placed Top Centered or aligned with Grid? 
          User image had them separated. Let's put them above the grid for clear control.
      */}
            <div className="flex justify-center md:justify-end mb-6">
                <div className="flex gap-2 p-1 bg-slate-50 rounded-full border border-slate-100">
                    {cities.map(city => (
                        <button
                            key={city.id}
                            onClick={() => setSelectedCityId(city.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${city.id === selectedCityId
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                }`}
                        >
                            {city.short}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">

                {/* Left Column: Map Image */}
                <div className="relative w-full min-h-[500px] h-full bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center p-8 overflow-hidden group select-none">
                    {/* Static Image */}
                    <img
                        src={swissMapImg.src}
                        alt="Map of Switzerland with key housing markets"
                        className="w-full h-full object-contain mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                {/* Right Column: The Details Card */}
                <div className="flex flex-col h-full min-h-[500px]">

                    {/* Card Container - Clean Info Card */}
                    <div className="flex-grow w-full bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 relative overflow-hidden flex flex-col justify-between transition-shadow duration-300 hover:shadow-lg">

                        {/* Progress Bar for Auto-Slide */}
                        {!isPaused && (
                            <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
                                <div key={selectedCityId} className="h-full bg-orange-400 animate-[progress_4s_linear]" style={{ width: '100%' }}></div>
                            </div>
                        )}

                        {/* Content Wrapper */}
                        <div key={selectedCity.id} className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500 flex-grow flex flex-col">

                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-5xl font-bold text-slate-900 tracking-tight mb-2">{selectedCity.name}</h3>
                                    <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Switzerland • Housing Market</p>
                                </div>
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm ${selectedCity.badgeColor}`}>
                                    {selectedCity.difficulty}
                                </span>
                            </div>

                            {/* Key Stats Row */}
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-0">
                                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Building2 className="w-3 h-3" /> Vacancy Rate
                                    </div>
                                    <div className="text-slate-900 font-bold text-3xl">{selectedCity.stats.vacancy}</div>
                                </div>
                                <div className="p-0">
                                    <div className="flex items-center gap-2 mb-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Wallet className="w-3 h-3" /> Average Rent
                                    </div>
                                    <div className="text-slate-900 font-bold text-3xl leading-none mb-1">{selectedCity.stats.priceLabel}</div>
                                    <div className="text-slate-400 text-xs font-medium">{selectedCity.stats.price}</div>
                                </div>
                            </div>

                            <hr className="border-slate-100 mb-10" />

                            {/* Narrative Section */}
                            <div className="space-y-8 flex-grow">
                                <div className="relative">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
                                        The Vibe
                                    </h4>
                                    <p className="text-slate-600 text-lg leading-relaxed font-light">
                                        {selectedCity.vibe}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" /> {selectedCity.commute_title}
                                    </h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {selectedCity.commute_text}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-12 pt-0 flex justify-end items-center group/link cursor-pointer">
                            <a
                                href={selectedCity.link}
                                className="inline-flex items-center text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-0.5 hover:text-orange-500 hover:border-orange-500 transition-colors"
                            >
                                View Full Analysis
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
         @keyframes progress {
           from { width: 0%; }
           to { width: 100%; }
         }
       `}</style>
        </div>
    );
}
