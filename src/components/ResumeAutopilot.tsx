import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Target,
  BookmarkPlus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Building2,
  ArrowRight,
  Wand2,
  RotateCcw,
  Compass,
  Calendar,
  DollarSign,
  Award,
  Flame,
  Check
} from 'lucide-react';
import {
  ParsedResume,
  FacultyRecommendation,
  InternshipRecommendation,
  SAMPLE_RESUMES,
  parseResumeText,
  parseResumeWithAi,
  recommendFacultyFromResume,
  recommendInternshipsFromResume,
} from '../utils/resumeParser';
import { iitFacultyList } from '../data';
import { VERIFIED_TRENDING_OPPORTUNITIES } from '../data/trendingOpportunities';

interface ResumeAutopilotProps {
  onApplyParsedResume: (parsed: ParsedResume) => void;
  onTargetFaculty: (rec: FacultyRecommendation) => void;
  onSaveToTracker: (rec: FacultyRecommendation) => void;
  onTargetInternship?: (rec: InternshipRecommendation) => void;
  onSaveInternshipToTracker?: (rec: InternshipRecommendation) => void;
  addedTrackerIds: Set<string>;
  hasAiKey: boolean;
  activeModelName: string;
  onRequestApiKey: () => void;
}

export const ResumeAutopilot: React.FC<ResumeAutopilotProps> = ({
  onApplyParsedResume,
  onTargetFaculty,
  onSaveToTracker,
  onTargetInternship,
  onSaveInternshipToTracker,
  addedTrackerIds,
  hasAiKey,
  activeModelName,
  onRequestApiKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'input' | 'faculty' | 'internships' | 'extracted'>('input');
  const [resumeText, setResumeText] = useState('');
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [facultyRecommendations, setFacultyRecommendations] = useState<FacultyRecommendation[]>([]);
  const [internshipRecommendations, setInternshipRecommendations] = useState<InternshipRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Run analysis on a given resume text
  const executeAnalysis = async (text: string, useAi: boolean = false) => {
    if (!text.trim()) {
      showToast('Please paste resume text or select a sample resume.');
      return;
    }

    if (useAi) {
      setIsAiEnhancing(true);
    } else {
      setIsAnalyzing(true);
    }

    try {
      let parsed: ParsedResume;
      if (useAi && hasAiKey) {
        parsed = await parseResumeWithAi(text);
      } else {
        parsed = parseResumeText(text);
      }

      setParsedResume(parsed);
      onApplyParsedResume(parsed);

      // Match against 1,610 faculty members
      const facRecs = recommendFacultyFromResume(parsed, iitFacultyList, 8);
      setFacultyRecommendations(facRecs);

      // Match against verified premier research internships & fellowships
      const internRecs = recommendInternshipsFromResume(parsed, VERIFIED_TRENDING_OPPORTUNITIES, 6);
      setInternshipRecommendations(internRecs);

      setActiveTab('faculty');
      showToast(
        useAi
          ? `Gemma AI analyzed resume! Matched ${facRecs.length} faculty & ${internRecs.length} fellowships.`
          : `Resume parsed! Found ${facRecs.length} professor matches & ${internRecs.length} top internships.`
      );
    } catch (err: any) {
      showToast(`Analysis notice: ${err?.message || 'Parsed using offline engine.'}`);
      const fallbackParsed = parseResumeText(text);
      setParsedResume(fallbackParsed);
      onApplyParsedResume(fallbackParsed);
      const facRecs = recommendFacultyFromResume(fallbackParsed, iitFacultyList, 8);
      setFacultyRecommendations(facRecs);
      const internRecs = recommendInternshipsFromResume(fallbackParsed, VERIFIED_TRENDING_OPPORTUNITIES, 6);
      setInternshipRecommendations(internRecs);
      setActiveTab('faculty');
    } finally {
      setIsAnalyzing(false);
      setIsAiEnhancing(false);
    }
  };

  // Select a preset sample
  const handleSelectSample = (sample: (typeof SAMPLE_RESUMES)[0]) => {
    setSelectedSampleId(sample.id);
    setResumeText(sample.text);
    executeAnalysis(sample.text, false);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        setSelectedSampleId(null);
        executeAnalysis(content, false);
      }
    };
    reader.onerror = () => {
      showToast('Error reading file. Please paste your resume text instead.');
    };
    reader.readAsText(file);
  };

  const handleTargetFaculty = (rec: FacultyRecommendation) => {
    setActiveTargetId(rec.faculty.id);
    onTargetFaculty(rec);
    showToast(`Targeted Prof. ${rec.faculty.name} (${rec.faculty.institution})! Email customized.`);
  };

  const handleTargetInternship = (rec: InternshipRecommendation) => {
    setActiveTargetId(rec.opportunity.id);
    if (onTargetInternship) {
      onTargetInternship(rec);
      showToast(`Targeted ${rec.opportunity.title}! Inquiry draft customized.`);
    }
  };

  const handleSaveInternship = (rec: InternshipRecommendation) => {
    if (onSaveInternshipToTracker) {
      onSaveInternshipToTracker(rec);
      showToast(`Saved ${rec.opportunity.title} to My Applications as Shortlisted!`);
    }
  };

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-b from-teal-50/40 via-white to-white shadow-subtle overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-line/80 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-serif-title font-semibold text-ink-primary">
                Smart Resume Autopilot & Opportunity Matcher
              </h3>
              <span className="wispr-pill bg-teal-100/70 text-teal-900 border-teal-300 text-[10px] font-mono font-medium">
                1,610 Directory & Fellowships
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Submit your resume to auto-fill outreach parameters, match top-tier faculty, and discover tailored global & Indian research internships.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {parsedResume && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Resume Active: {parsedResume.name.split(' ')[0]}</span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-stone-line hover:bg-stone-hover text-ink-secondary transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Autopilot' : 'Expand Autopilot'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {notification && (
        <div className="text-xs py-2 px-4 bg-teal-600 text-white flex items-center justify-between font-medium animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white hover:text-amber-200 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Preset Sample Resume Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider font-mono">
                1-Click Instant Demo Profiles
              </span>
              <span className="text-[10px] text-teal-700 font-medium">
                Click any profile to test faculty & internship matching
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SAMPLE_RESUMES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    selectedSampleId === sample.id
                      ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-xs'
                      : 'bg-white hover:bg-stone-hover/80 border-stone-line text-ink-primary'
                  }`}
                >
                  <div className="font-semibold text-[11px] flex items-center justify-between">
                    <span>{sample.label}</span>
                    {selectedSampleId === sample.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block truncate">
                    {sample.domain}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-stone-line/80 pt-1">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('input')}
                className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'input'
                    ? 'border-teal-700 text-teal-900 font-semibold'
                    : 'border-transparent text-ink-muted hover:text-ink-primary'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Upload / Paste Resume</span>
              </button>

              <button
                onClick={() => setActiveTab('faculty')}
                className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'faculty'
                    ? 'border-teal-700 text-teal-900 font-semibold'
                    : 'border-transparent text-ink-muted hover:text-ink-primary'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Faculty Matches ({facultyRecommendations.length})</span>
                {facultyRecommendations.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-mono">
                    Top Professors
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('internships')}
                className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'internships'
                    ? 'border-teal-700 text-teal-900 font-semibold'
                    : 'border-transparent text-ink-muted hover:text-ink-primary'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Internship Matches ({internshipRecommendations.length})</span>
                {internshipRecommendations.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">
                    Fellowships
                  </span>
                )}
              </button>

              {parsedResume && (
                <button
                  onClick={() => setActiveTab('extracted')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'extracted'
                      ? 'border-teal-700 text-teal-900 font-semibold'
                      : 'border-transparent text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Extracted Profile</span>
                </button>
              )}
            </div>

            {parsedResume && (
              <span className="text-[11px] font-mono text-ink-muted hidden md:inline-block">
                Parameters Synced
              </span>
            )}
          </div>

          {/* Tab 1: Input / Upload */}
          {activeTab === 'input' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                {/* File Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="md:col-span-4 border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/20 hover:bg-teal-50/40 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-ink-primary">
                      Upload Resume File
                    </span>
                    <span className="block text-[10px] text-ink-muted mt-0.5">
                      .txt, .md, .pdf, or doc text
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.rtf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="inline-block px-2.5 py-1 text-[11px] font-medium rounded-md bg-white border border-stone-line text-ink-secondary shadow-2xs">
                    Browse Files
                  </span>
                </div>

                {/* Paste Textarea */}
                <div className="md:col-span-8 flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary font-medium">Or Paste Raw Resume / CV Text</span>
                    <span className="text-ink-muted font-mono text-[10px]">
                      {resumeText ? `${resumeText.trim().split(/\s+/).length} words` : '0 words'}
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setSelectedSampleId(null);
                    }}
                    placeholder="Paste education, technical skills, projects, and research interests..."
                    className="w-full flex-1 p-3 rounded-xl border border-stone-line bg-white focus:border-teal-600 text-xs font-mono text-ink-primary leading-relaxed outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-line/70">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => executeAnalysis(resumeText, false)}
                    disabled={isAnalyzing || isAiEnhancing || !resumeText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAnalyzing ? 'Analyzing & Matching...' : '⚡ Match Faculty & Internships'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!hasAiKey) {
                        onRequestApiKey();
                      } else {
                        executeAnalysis(resumeText, true);
                      }
                    }}
                    disabled={isAnalyzing || isAiEnhancing || !resumeText.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-900 border border-amber-200 text-xs font-medium shadow-2xs transition-all cursor-pointer"
                    title={hasAiKey ? `Deep resume analysis using ${activeModelName}` : 'Setup API key for deep extraction'}
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isAiEnhancing ? 'Gemma Analyzing...' : `Deep Extract (${activeModelName})`}</span>
                  </button>
                </div>

                {resumeText && (
                  <button
                    onClick={() => {
                      setResumeText('');
                      setSelectedSampleId(null);
                    }}
                    className="text-xs text-ink-muted hover:text-ink-primary flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Text</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Matched Faculty Recommendations */}
          {activeTab === 'faculty' && (
            <div className="space-y-3 pt-1">
              {facultyRecommendations.length === 0 ? (
                <div className="py-8 text-center bg-white rounded-xl border border-stone-line p-6 space-y-2">
                  <Target className="w-8 h-8 text-teal-600 mx-auto" />
                  <p className="font-semibold text-xs text-ink-primary">No resume loaded yet</p>
                  <p className="text-[11px] text-ink-muted max-w-md mx-auto">
                    Select one of the sample profiles above or paste your resume to get instant professor recommendations.
                  </p>
                  <button
                    onClick={() => handleSelectSample(SAMPLE_RESUMES[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium shadow-xs"
                  >
                    <span>Load Sample Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-ink-secondary">
                    <span>
                      Showing <strong>{facultyRecommendations.length} high-synergy professors</strong> ranked by publication and project overlap:
                    </span>
                    <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Cold Email Engine Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {facultyRecommendations.map((rec) => {
                      const isTargeted = activeTargetId === rec.faculty.id;
                      const isSaved = addedTrackerIds.has(rec.faculty.id);

                      return (
                        <div
                          key={rec.faculty.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                            isTargeted
                              ? 'bg-teal-50/50 border-teal-600 shadow-sm ring-1 ring-teal-500/30'
                              : 'bg-white hover:border-stone-line border-stone-line shadow-2xs'
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Card Top: Match Score & Institution */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-ink-primary text-xs block leading-tight">
                                  {rec.faculty.name}
                                </span>
                                <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-ink-muted" />
                                  <span>{rec.faculty.institution} • {rec.faculty.department}</span>
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                                  rec.matchScore >= 92
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-teal-50 text-teal-800 border-teal-300'
                                }`}
                              >
                                {rec.matchScore}% {rec.matchTier}
                              </span>
                            </div>

                            {/* Matching Keywords */}
                            <div className="flex flex-wrap gap-1">
                              {rec.matchingKeywords.map((kw) => (
                                <span
                                  key={kw}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>

                            {/* Why this matches rationale */}
                            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-stone-line/70 text-[11px] text-ink-secondary space-y-1">
                              <span className="font-semibold text-teal-900 block text-[10px] uppercase font-mono tracking-wider">
                                Alignment Rationale
                              </span>
                              <p className="line-clamp-2 leading-relaxed">
                                {rec.matchRationale}
                              </p>
                            </div>

                            {/* Publication citation context */}
                            {rec.faculty.relevantPaper?.title && (
                              <div className="text-[10px] text-ink-muted bg-white p-2 rounded border border-stone-line/60">
                                <span className="font-semibold text-ink-primary block truncate">
                                  Paper: "{rec.faculty.relevantPaper.title}"
                                </span>
                                <span className="line-clamp-1 italic mt-0.5">
                                  Note: {rec.faculty.relevantPaper.note}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-line/60 text-xs">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTargetFaculty(rec)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-xs shadow-2xs transition-all cursor-pointer ${
                                  isTargeted
                                    ? 'bg-teal-800 text-white font-semibold'
                                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                                }`}
                                title="Auto-populate this professor's details and paper into the email draft"
                              >
                                <Target className="w-3.5 h-3.5" />
                                <span>{isTargeted ? '✓ Target Active' : 'Target & Craft Email'}</span>
                              </button>

                              <button
                                onClick={() => onSaveToTracker(rec)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                  isSaved
                                    ? 'bg-stone-100 text-teal-800 border-teal-300 font-medium'
                                    : 'bg-white hover:bg-stone-hover text-ink-secondary border-stone-line'
                                }`}
                                title="Save to My Applications as Shortlisted"
                              >
                                <BookmarkPlus className="w-3 h-3 text-ink-muted" />
                                <span>{isSaved ? '✓ Saved' : 'Add to Tracker'}</span>
                              </button>
                            </div>

                            <a
                              href={rec.faculty.sourceUrl || rec.faculty.facultyPageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                              title="Inspect Google Scholar / Official profile"
                            >
                              <span>Scholar</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 3: Recommended Internships & Fellowships */}
          {activeTab === 'internships' && (
            <div className="space-y-3 pt-1">
              {internshipRecommendations.length === 0 ? (
                <div className="py-8 text-center bg-white rounded-xl border border-stone-line p-6 space-y-2">
                  <Flame className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="font-semibold text-xs text-ink-primary">No resume loaded yet</p>
                  <p className="text-[11px] text-ink-muted max-w-md mx-auto">
                    Select a sample profile or paste your resume to get customized internship and research fellowship recommendations.
                  </p>
                  <button
                    onClick={() => handleSelectSample(SAMPLE_RESUMES[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-medium shadow-xs"
                  >
                    <span>Load Sample Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-ink-secondary">
                    <span>
                      Showing <strong>{internshipRecommendations.length} tailored fellowship & internship programs</strong> matching your skills & academic year:
                    </span>
                    <span className="text-[11px] font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Formal Portals & Direct Routing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {internshipRecommendations.map((rec) => {
                      const isTargeted = activeTargetId === rec.opportunity.id;
                      const isSaved = addedTrackerIds.has(rec.opportunity.id);

                      return (
                        <div
                          key={rec.opportunity.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                            isTargeted
                              ? 'bg-amber-50/40 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                              : 'bg-white hover:border-stone-line border-stone-line shadow-2xs'
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Card Top: Title & Match Score */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-ink-primary text-xs block leading-tight">
                                  {rec.opportunity.title}
                                </span>
                                <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-ink-muted" />
                                  <span>{rec.opportunity.institution} • {rec.opportunity.department}</span>
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                                  rec.matchScore >= 92
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-50 text-amber-900 border-amber-300'
                                }`}
                              >
                                {rec.matchScore}% {rec.matchTier}
                              </span>
                            </div>

                            {/* Stipend & Duration Badges */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-secondary">
                              <span className="inline-flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                <DollarSign className="w-3 h-3 text-teal-600" />
                                <span>{rec.opportunity.stipend}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-ink-muted font-mono text-[10px]">
                                <Calendar className="w-3 h-3 text-ink-muted" />
                                <span>{rec.opportunity.duration}</span>
                              </span>
                            </div>

                            {/* Matching Skill Tags */}
                            <div className="flex flex-wrap gap-1">
                              {rec.matchingSkills.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Alignment Rationale */}
                            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-stone-line/70 text-[11px] text-ink-secondary space-y-1">
                              <span className="font-semibold text-teal-900 block text-[10px] uppercase font-mono tracking-wider">
                                Resume Match Rationale
                              </span>
                              <p className="line-clamp-2 leading-relaxed">
                                {rec.matchRationale}
                              </p>
                            </div>

                            {/* Recommended Prep Step */}
                            <div className="text-[10px] text-amber-900 bg-amber-50/70 p-2 rounded border border-amber-200/80">
                              <span className="font-semibold block">
                                Recommended Action for Application:
                              </span>
                              <span className="mt-0.5 block">
                                {rec.recommendedPrepStep}
                              </span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-line/60 text-xs">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTargetInternship(rec)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-xs shadow-2xs transition-all cursor-pointer ${
                                  isTargeted
                                    ? 'bg-amber-800 text-white font-semibold'
                                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                                }`}
                                title="Draft an outreach inquiry email for this program"
                              >
                                <Target className="w-3.5 h-3.5" />
                                <span>{isTargeted ? '✓ Draft Loaded' : 'Draft Inquiry Email'}</span>
                              </button>

                              <button
                                onClick={() => handleSaveInternship(rec)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                  isSaved
                                    ? 'bg-stone-100 text-teal-800 border-teal-300 font-medium'
                                    : 'bg-white hover:bg-stone-hover text-ink-secondary border-stone-line'
                                }`}
                                title="Save to My Applications as Shortlisted"
                              >
                                <BookmarkPlus className="w-3 h-3 text-ink-muted" />
                                <span>{isSaved ? '✓ Saved' : 'Add to Tracker'}</span>
                              </button>
                            </div>

                            <a
                              href={rec.opportunity.officialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                              title="Visit official portal"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 4: Extracted Profile Summary */}
          {activeTab === 'extracted' && parsedResume && (
            <div className="space-y-3 pt-1">
              <div className="bg-white p-4 rounded-xl border border-stone-line space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-line">
                  <div>
                    <span className="font-bold text-sm text-ink-primary">{parsedResume.name}</span>
                    <span className="text-ink-muted text-xs block">
                      {parsedResume.degree} • {parsedResume.year} • {parsedResume.discipline}
                    </span>
                    <span className="text-[11px] text-teal-800 font-semibold">{parsedResume.institution}</span>
                  </div>
                  <button
                    onClick={() => {
                      onApplyParsedResume(parsedResume);
                      showToast('Re-applied all extracted resume details to form parameters!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-xs font-semibold cursor-pointer"
                  >
                    Sync with Form Parameters
                  </button>
                </div>

                {/* Skills */}
                <div>
                  <span className="block text-[11px] font-semibold text-ink-muted mb-1 uppercase font-mono">
                    Detected Technical Skills ({parsedResume.technicalSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResume.technicalSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-stone-100 text-ink-secondary text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Project */}
                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-stone-line/70 space-y-1.5">
                  <span className="text-[10px] font-semibold text-teal-900 uppercase font-mono tracking-wider block">
                    Extracted Primary Project for Outreach
                  </span>
                  <span className="font-bold text-xs text-ink-primary block">
                    {parsedResume.primaryProject.title}
                  </span>
                  <p className="text-[11px] text-ink-secondary leading-relaxed">
                    <strong>Contribution:</strong> {parsedResume.primaryProject.contribution}
                  </p>
                  <p className="text-[11px] text-ink-secondary">
                    <strong>Tools:</strong> {parsedResume.primaryProject.tools}
                  </p>
                  <p className="text-[11px] text-teal-800">
                    <strong>Realistic Lab Task:</strong> {parsedResume.primaryProject.realisticTask}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
