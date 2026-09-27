import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe2,
  Sparkles,
  ExternalLink,
  KanbanSquare,
  Mail,
  Search,
  Bookmark,
  Check,
  Building,
  Clock,
  Calendar,
  DollarSign,
  GraduationCap,
  Award,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  AlertCircle,
  Key
} from 'lucide-react';
import { TrendingOpportunity, OpportunityTier } from '../types';
import { VERIFIED_TRENDING_OPPORTUNITIES } from '../data/trendingOpportunities';
import { fetchTrendingOpportunities, getActiveAiConfig, isAiAvailable, setAiApiKey, detectProvider } from '../utils/ai';

interface TrendingOpportunitiesProps {
  onPrepareEmail: (opp: TrendingOpportunity) => void;
  onAddToTracker: (opp: TrendingOpportunity) => void;
}

export const TrendingOpportunities: React.FC<TrendingOpportunitiesProps> = ({
  onPrepareEmail,
  onAddToTracker,
}) => {
  const [opportunities, setOpportunities] = useState<TrendingOpportunity[]>(() => {
    // Check if we have cached AI opportunities in sessionStorage
    try {
      const cached = sessionStorage.getItem('winter_trending_opps');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return VERIFIED_TRENDING_OPPORTUNITIES;
  });

  const [activeTier, setActiveTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [addedTrackerIds, setAddedTrackerIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('winter_saved_opp_ids');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [activeAi, setActiveAi] = useState(() => getActiveAiConfig());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(activeAi?.key || '');

  const handleSaveKey = () => {
    setAiApiKey(apiKeyInput);
    setActiveAi(getActiveAiConfig());
    setShowKeyModal(false);
    setAiError(null);
  };

  // Save to sessionStorage whenever opportunities update
  useEffect(() => {
    try {
      sessionStorage.setItem('winter_trending_opps', JSON.stringify(opportunities));
    } catch {
      // ignore
    }
  }, [opportunities]);

  // Handle bookmarking
  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('winter_saved_opp_ids', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Add to tracker with feedback
  const handleAdd = (opp: TrendingOpportunity) => {
    onAddToTracker(opp);
    setAddedTrackerIds((prev) => new Set(prev).add(opp.id));
    setTimeout(() => {
      setAddedTrackerIds((prev) => {
        const next = new Set(prev);
        next.delete(opp.id);
        return next;
      });
    }, 2500);
  };

  // Fetch live from Gemma AI
  const handleFetchAi = async (customTopic?: string) => {
    if (!isAiAvailable()) {
      setShowKeyModal(true);
      return;
    }

    setLoadingAi(true);
    setAiError(null);
    try {
      const newItems = await fetchTrendingOpportunities(customTopic || searchQuery || activeTier);
      // Merge unique
      setOpportunities((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newItems.filter((item) => !existingIds.has(item.id));
        return [...filteredNew, ...prev];
      });
    } catch (err: any) {
      setAiError(err.message || 'Failed to fetch live AI opportunities. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return opportunities.filter((item) => {
      // Tier filter
      if (activeTier === 'indian_premier' && item.tier !== 'indian_premier') return false;
      if (activeTier === 'global_elite' && item.tier !== 'global_elite') return false;
      if (activeTier === 'funded' && !item.stipend.toLowerCase().includes('₹') && !item.stipend.toLowerCase().includes('$') && !item.stipend.toLowerCase().includes('chf')) return false;
      if (activeTier === 'saved' && !savedIds.has(item.id)) return false;

      // Tag filter
      if (selectedTag && !item.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchInst = item.institution.toLowerCase().includes(q);
        const matchDept = item.department.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchTitle || matchInst || matchDept || matchLoc || matchTags || matchDesc;
      }

      return true;
    });
  }, [opportunities, activeTier, selectedTag, searchQuery, savedIds]);

  // Collect unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach((o) => o.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 14);
  }, [opportunities]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Hero Banner with Modern Rich Aesthetic */}
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-white via-[#FAF7F2] to-teal-50/50 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100/80 text-teal-900 border border-teal-300 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Live Academic Opportunities Feed</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-stone-700 border border-stone-200 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Portals & Stipends</span>
            </span>
            {activeAi && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-stone-900 text-stone-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeAi.modelName} Active</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            Trending Research Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
            Verified visiting fellowships and student research internships across premier academia: <strong>IITs, NITs, IIITs, IISc, MIT, Harvard, Stanford, ETH Zurich, and CERN</strong>. Each entry provides verified eligibility, stipend packages, official portal links, and one-click outreach.
          </p>

          {/* Quick AI Trigger Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFetchAi()}
                disabled={loadingAi}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-800 hover:bg-teal-900 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : 'text-amber-300'}`} />
                <span>{loadingAi ? 'Gemma AI is Discovering Programs...' : 'Fetch Latest Opportunities via Gemma AI'}</span>
              </button>
              <button
                onClick={() => {
                  setApiKeyInput(activeAi?.key || '');
                  setShowKeyModal(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs transition-colors cursor-pointer"
                title="Configure Gemma API Key"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[11px] text-stone-500">
              {opportunities.length} programs loaded • {opportunities.filter((o) => o.tier === 'global_elite').length} Global Elite • {opportunities.filter((o) => o.tier === 'indian_premier').length} Indian Premier
            </span>
          </div>
        </div>

        {/* Ambient decorative elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 right-16 w-48 h-48 rounded-full bg-amber-200/20 blur-2xl pointer-events-none" />
      </div>

      {/* Error alert if any */}
      {aiError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{aiError}</span>
          </div>
          <button
            onClick={() => setAiError(null)}
            className="text-red-700 font-bold hover:text-red-900 ml-4 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Tier Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-200">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Opportunities', count: opportunities.length },
              { id: 'indian_premier', label: 'IITs, NITs & Indian Premier', count: opportunities.filter((o) => o.tier === 'indian_premier').length },
              { id: 'global_elite', label: 'Global Elite (MIT, Harvard, ETH...)', count: opportunities.filter((o) => o.tier === 'global_elite').length },
              { id: 'funded', label: 'Funded / High Stipend', count: opportunities.filter((o) => o.stipend.includes('₹') || o.stipend.includes('$') || o.stipend.includes('CHF')).length },
              { id: 'saved', label: `Saved (${savedIds.size})`, count: savedIds.size },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTier(tab.id);
                  setSelectedTag(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTier === tab.id
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTier === tab.id ? 'bg-teal-800 text-teal-100' : 'bg-stone-100 text-stone-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IIT, MIT, AI, Robotics, Physics..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-700 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-stone-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Focus Area:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-teal-700 text-white font-medium shadow-xs'
                  : 'bg-stone-100/80 hover:bg-stone-200 text-stone-700 border border-stone-200/60'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[11px] text-teal-800 underline font-medium ml-1 cursor-pointer"
            >
              Clear Tag
            </button>
          )}
        </div>
      </div>

      {/* Loading state indicator */}
      {loadingAi && (
        <div className="p-8 rounded-2xl border border-teal-200 bg-teal-50/60 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-teal-950 text-base">
              Querying Google Gemma 4 (26B)...
            </h4>
            <p className="text-xs text-teal-800 mt-1 max-w-md">
              Synthesizing active, verified research internships across IITs, NITs, IIITs, MIT, Harvard, Stanford, and ETH Zurich.
            </p>
          </div>
        </div>
      )}

      {/* Opportunities Card Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-stone-200 space-y-3">
          <p className="text-sm text-stone-600 font-medium">No opportunities match your current filters.</p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setActiveTier('all');
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => handleFetchAi(searchQuery)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white cursor-pointer"
            >
              Search via Gemma AI
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((opp) => {
            const isSaved = savedIds.has(opp.id);
            const isAdded = addedTrackerIds.has(opp.id);

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-stone-200 hover:border-teal-300 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Header Section */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {opp.tier === 'global_elite' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <Globe2 className="w-3 h-3 text-indigo-600" />
                          Global Elite
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                          <Award className="w-3 h-3 text-amber-700" />
                          Premier Indian Academia
                        </span>
                      )}

                      {opp.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          AI Live Verified
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600">
                        {opp.season}
                      </span>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => toggleSave(opp.id)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'text-amber-600 fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug group-hover:text-teal-900 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-xs font-medium text-teal-800 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{opp.institution}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500 font-normal">{opp.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                {/* Key Metrics Grid (4 tiles) */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" /> Stipend / Grant
                    </span>
                    <p className="text-[11px] font-medium text-stone-900 line-clamp-2">
                      {opp.stipend}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-600" /> Duration
                    </span>
                    <p className="text-[11px] font-medium text-stone-900">
                      {opp.duration}
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-1 border-t border-stone-200/50">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" /> Deadline / Cycle
                    </span>
                    <p className="text-[11px] font-semibold text-stone-900">
                      {opp.deadline}
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-1 border-t border-stone-200/50">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-indigo-600" /> Eligibility
                    </span>
                    <p className="text-[11px] font-medium text-stone-800 line-clamp-2" title={opp.eligibility}>
                      {opp.eligibility}
                    </p>
                  </div>
                </div>

                {/* Key Highlights */}
                {opp.highlights && opp.highlights.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-stone-600">
                    {opp.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {opp.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-teal-50 text-stone-600 hover:text-teal-900 border border-stone-200/60 transition-colors cursor-pointer"
                    >
                      #{t}
                    </button>
                  ))}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={opp.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdd(opp)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 shadow-xs'
                      }`}
                      title="Add to My Applications Tracker"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Tracked!</span>
                        </>
                      ) : (
                        <>
                          <KanbanSquare className="w-3.5 h-3.5 text-stone-600" />
                          <span>Track</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onPrepareEmail(opp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-all cursor-pointer"
                      title="Draft outreach email in Email Studio"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-200" />
                      <span>Draft Email</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key Setup Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-800">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 leading-snug">Gemma AI Settings</h3>
                  <p className="text-[11px] text-stone-500">Live Research Feed & Opportunity Discovery</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-teal-900 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Model: <strong>{activeAi.modelName}</strong> ({activeAi.provider === 'gemma' ? 'Google AI Studio' : 'Groq'})</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-800">
                  Gemma / Google API Key
                </label>
                {apiKeyInput && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                    {detectProvider(apiKeyInput) === 'gemma' ? '✓ Google Gemma' : (detectProvider(apiKeyInput) === 'groq' ? '✓ Groq' : '')}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AQ... or AIza..."
                className="w-full text-xs font-mono px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 bg-stone-50/50"
              />
              <p className="text-[11px] text-stone-400">
                Supports Google AI Studio keys starting with <code className="text-[10px] bg-stone-100 px-1 rounded">AQ.</code> or <code className="text-[10px] bg-stone-100 px-1 rounded">AIza...</code>
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  setAiApiKey('');
                  setShowKeyModal(false);
                }}
                className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
              >
                Reset Key
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveKey();
                    handleFetchAi();
                  }}
                  className="px-4 py-1.5 text-xs font-medium bg-teal-800 hover:bg-teal-900 text-white rounded-lg transition-colors shadow-subtle cursor-pointer"
                >
                  Save & Fetch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
