import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResultById } from '../api/resume';

// ── Reusable Terminal Block ──────────────────────────────────────────────────
const TerminalBlock = ({ title, prompt, children, onCopy, copyText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = copyText || '';
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="rounded-xl overflow-hidden border border-outline-variant/15 shadow-2xl">
            {/* Terminal Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-surface-container-highest">
                <div className="flex items-center gap-3">
                    {/* Traffic lights */}
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-error/70"></div>
                        <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                        <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/60"></div>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant font-bold ml-2">{title}</span>
                </div>
                <button
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all duration-200"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {copied ? 'check' : 'content_copy'}
                    </span>
                </button>
            </div>

            {/* Terminal Body */}
            <div className="bg-[#0d0d0d] px-6 py-5 font-mono text-sm leading-relaxed">
                {/* Prompt line */}
                {prompt && (
                    <div className="flex items-center gap-2 mb-4 opacity-60">
                        <span className="text-tertiary-fixed-dim">❯</span>
                        <span className="text-on-surface-variant text-xs">{prompt}</span>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

// ── Monospace line helpers ───────────────────────────────────────────────────
const TLine = ({ label, value, color = 'text-on-surface/80' }) => (
    <div className="flex gap-3 text-xs mb-1">
        {label && <span className="text-on-surface-variant/60 w-36 shrink-0">{label}</span>}
        <span className={color}>{value}</span>
    </div>
);

const TSection = ({ heading }) => (
    <div className="mt-5 mb-2">
        <span className="text-primary/70 text-xs font-bold uppercase tracking-widest">── {heading} ──</span>
    </div>
);

const TChips = ({ items, color = 'text-tertiary-fixed-dim' }) => (
    <div className="flex flex-wrap gap-2 mt-1 mb-2">
        {items.map((item, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded border border-outline-variant/20 bg-surface-container/40 ${color}`}>
                {item}
            </span>
        ))}
    </div>
);

// ──────────────────────────────────────────────────────────────────────────────

const Results = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getResultById(id)
            .then(data => { setResult(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [id]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[80vh]">
            <div className="w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse absolute"></div>
            <span className="text-primary font-bold tracking-widest uppercase relative z-10 animate-pulse">Running Deep Neural Scan...</span>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-full text-error p-12">
            <h2 className="text-2xl font-bold">{error}</h2>
        </div>
    );

    if (!result) return null;

    const {
        atsScore,
        improvedResume,
        gapAnalysis,
        coverLetter,
        originalResume,
        jobDescription,
    } = result;

    // ── ATS ─────────────────────────────────────────────────────────────────
    const score      = atsScore?.overall_score || 0;
    const verdict    = atsScore?.verdict || '';
    const dimensions = atsScore?.dimensions || {};
    const topImprovements = atsScore?.top_improvements || [];

    const verdictStyles = {
        strong: 'text-tertiary-fixed-dim',
        good:   'text-tertiary-fixed-dim',
        fair:   'text-primary',
        weak:   'text-error',
    };

    // ── Parsed Resume text ───────────────────────────────────────────────────
    const resumeCopyText = (() => {
        if (!originalResume) return '';
        const r = originalResume;
        const lines = [];
        if (r.contact?.name) lines.push(`NAME: ${r.contact.name}`);
        if (r.contact?.email) lines.push(`EMAIL: ${r.contact.email}`);
        if (r.contact?.phone) lines.push(`PHONE: ${r.contact.phone}`);
        if (r.contact?.location) lines.push(`LOCATION: ${r.contact.location}`);
        if (r.summary) lines.push(`\nSUMMARY\n${r.summary}`);
        if (r.skills?.length) lines.push(`\nSKILLS\n${r.skills.join(', ')}`);
        if (r.experience?.length) {
            lines.push('\nEXPERIENCE');
            r.experience.forEach(e => {
                lines.push(`${e.title} @ ${e.company} (${e.duration})`);
                e.bullets?.forEach(b => lines.push(`  • ${b}`));
            });
        }
        return lines.join('\n');
    })();

    // ── JD text ──────────────────────────────────────────────────────────────
    const jdCopyText = (() => {
        if (!jobDescription) return '';
        const j = jobDescription;
        const lines = [];
        if (j.job_title) lines.push(`ROLE: ${j.job_title}`);
        if (j.company) lines.push(`COMPANY: ${j.company}`);
        if (j.seniority_level) lines.push(`LEVEL: ${j.seniority_level}`);
        if (j.required_skills?.length) lines.push(`\nREQUIRED SKILLS\n${j.required_skills.join(', ')}`);
        if (j.preferred_skills?.length) lines.push(`\nPREFERRED SKILLS\n${j.preferred_skills.join(', ')}`);
        if (j.keywords?.length) lines.push(`\nKEYWORDS\n${j.keywords.join(', ')}`);
        return lines.join('\n');
    })();

    // ── Optimizer text ───────────────────────────────────────────────────────
    const optimizerCopyText = (() => {
        if (!improvedResume) return '';
        const lines = [];
        if (improvedResume.improved_summary) lines.push(`SUMMARY\n${improvedResume.improved_summary}`);
        if (improvedResume.improved_experience?.length) {
            lines.push('\nEXPERIENCE');
            improvedResume.improved_experience.forEach(e => {
                lines.push(`${e.title} @ ${e.company} (${e.duration})`);
                e.improved_bullets?.forEach(b => lines.push(`  • ${b}`));
            });
        }
        if (improvedResume.improved_skills?.length) lines.push(`\nSKILLS\n${improvedResume.improved_skills.join(', ')}`);
        if (improvedResume.keywords_added?.length) lines.push(`\nKEYWORDS ADDED\n${improvedResume.keywords_added.join(', ')}`);
        return lines.join('\n');
    })();

    // ── Gap Analysis text ────────────────────────────────────────────────────
    const gapCopyText = (() => {
        if (!gapAnalysis) return '';
        const lines = [];
        if (gapAnalysis.match_percentage != null) lines.push(`MATCH: ${gapAnalysis.match_percentage}%`);
        if (gapAnalysis.strengths?.length) lines.push(`\nSTRENGTHS\n${gapAnalysis.strengths.join(', ')}`);
        if (gapAnalysis.missing_required_skills?.length) lines.push(`\nMISSING REQUIRED\n${gapAnalysis.missing_required_skills.join(', ')}`);
        if (gapAnalysis.missing_preferred_skills?.length) lines.push(`\nMISSING PREFERRED\n${gapAnalysis.missing_preferred_skills.join(', ')}`);
        if (gapAnalysis.missing_keywords?.length) lines.push(`\nMISSING KEYWORDS\n${gapAnalysis.missing_keywords.join(', ')}`);
        if (gapAnalysis.weak_areas?.length) {
            lines.push('\nWEAK AREAS');
            gapAnalysis.weak_areas.forEach(w => lines.push(`  ${w.area}: ${w.reason}`));
        }
        if (gapAnalysis.irrelevant_content?.length) lines.push(`\nCONSIDER REMOVING\n${gapAnalysis.irrelevant_content.join(', ')}`);
        return lines.join('\n');
    })();

    // ── Cover Letter text ────────────────────────────────────────────────────
    const clCopyText = coverLetter
        ? `Subject: ${coverLetter.subject_line || ''}\n\n${coverLetter.body || ''}`
        : '';

    return (
        <div className="pt-10 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full">
            <button
                onClick={() => navigate('/dashboard')}
                className="mb-10 text-on-surface-variant hover:text-primary flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-colors"
            >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Dashboard
            </button>

            {/* Page Header */}
            <div className="mb-14 text-center">
                <span className="label-md uppercase tracking-[0.3em] text-primary mb-3 font-bold opacity-80 block">Analysis Complete</span>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface">
                    Your professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">benchmark.</span>
                </h1>
            </div>

            <div className="space-y-8">

                {/* ── 1. ATS SCORE ──────────────────────────────────────────── */}
                <TerminalBlock
                    title="ats-score.json"
                    prompt="kleos analyze --ats-score"
                    copyText={JSON.stringify({ overall_score: score, verdict, dimensions, top_improvements: topImprovements }, null, 2)}
                >
                    {/* Score hero */}
                    <div className="flex items-end gap-5 mb-6">
                        <span className="text-6xl font-black text-on-surface tracking-tighter">{score}</span>
                        <div className="mb-2">
                            <div className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mb-1">/ 100  ·  overall</div>
                            <span className={`text-lg font-black uppercase tracking-widest ${verdictStyles[verdict] || 'text-on-surface-variant'}`}>
                                {verdict}
                            </span>
                        </div>
                    </div>

                    {/* Dimension bars */}
                    {Object.keys(dimensions).length > 0 && (
                        <>
                            <TSection heading="Dimensions" />
                            <div className="space-y-4 mb-4">
                                {Object.entries(dimensions).map(([key, dim]) => {
                                    const pct = dim.max > 0 ? Math.round((dim.score / dim.max) * 100) : 0;
                                    const barColor = pct >= 75 ? 'bg-tertiary-fixed-dim' : pct >= 50 ? 'bg-primary' : 'bg-error';
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[11px] uppercase tracking-[0.15em] text-on-surface-variant/70 font-bold">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-xs font-black text-on-surface">{dim.score}<span className="text-on-surface-variant/50">/{dim.max}</span></span>
                                            </div>
                                            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                                            </div>
                                            {dim.notes && (
                                                <p className="text-[11px] text-on-surface-variant/50 mt-1 leading-relaxed">{dim.notes}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Top improvements */}
                    {topImprovements.length > 0 && (
                        <>
                            <TSection heading="Top Improvements" />
                            {topImprovements.map((tip, i) => (
                                <div key={i} className="flex gap-2 text-xs mb-2">
                                    <span className="text-primary/60 shrink-0">[{String(i + 1).padStart(2, '0')}]</span>
                                    <span className="text-on-surface/75 leading-relaxed">{tip}</span>
                                </div>
                            ))}
                        </>
                    )}
                </TerminalBlock>

                {/* ── 2. PARSED RESUME ──────────────────────────────────────── */}
                {originalResume && (
                    <TerminalBlock
                        title="parsed-resume.json"
                        prompt="kleos parse --resume"
                        copyText={resumeCopyText}
                    >
                        {/* Contact */}
                        {originalResume.contact && (
                            <>
                                <TSection heading="Contact" />
                                {originalResume.contact.name     && <TLine label="name"     value={originalResume.contact.name}     color="text-tertiary-fixed-dim" />}
                                {originalResume.contact.email    && <TLine label="email"    value={originalResume.contact.email}    />}
                                {originalResume.contact.phone    && <TLine label="phone"    value={originalResume.contact.phone}    />}
                                {originalResume.contact.location && <TLine label="location" value={originalResume.contact.location} />}
                                {originalResume.contact.linkedin && <TLine label="linkedin" value={originalResume.contact.linkedin} color="text-primary/80" />}
                                {originalResume.contact.github   && <TLine label="github"   value={originalResume.contact.github}   color="text-primary/80" />}
                            </>
                        )}

                        {/* Summary */}
                        {originalResume.summary && (
                            <>
                                <TSection heading="Summary" />
                                <p className="text-xs text-on-surface/70 leading-relaxed mb-2">{originalResume.summary}</p>
                            </>
                        )}

                        {/* Skills */}
                        {originalResume.skills?.length > 0 && (
                            <>
                                <TSection heading="Skills" />
                                <TChips items={originalResume.skills} color="text-primary/80" />
                            </>
                        )}

                        {/* Experience */}
                        {originalResume.experience?.length > 0 && (
                            <>
                                <TSection heading="Experience" />
                                {originalResume.experience.map((exp, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-xs font-bold text-on-surface/90">{exp.title}</span>
                                            <span className="text-on-surface-variant/40 text-xs">@</span>
                                            <span className="text-xs text-tertiary-fixed-dim/80">{exp.company}</span>
                                            <span className="text-on-surface-variant/40 text-xs">· {exp.duration}</span>
                                        </div>
                                        {exp.bullets?.map((b, j) => (
                                            <div key={j} className="flex gap-2 text-xs text-on-surface/60 mb-0.5 pl-2">
                                                <span className="text-primary/40 shrink-0">•</span>
                                                <span className="leading-relaxed">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Education */}
                        {originalResume.education?.length > 0 && (
                            <>
                                <TSection heading="Education" />
                                {originalResume.education.map((edu, i) => (
                                    <TLine key={i} label={edu.year || '—'} value={`${edu.degree} · ${edu.institution}`} />
                                ))}
                            </>
                        )}

                        {/* Projects */}
                        {originalResume.projects?.length > 0 && (
                            <>
                                <TSection heading="Projects" />
                                {originalResume.projects.map((p, i) => (
                                    <div key={i} className="mb-3">
                                        <span className="text-xs font-bold text-on-surface/85">{p.name}</span>
                                        {p.description && <p className="text-xs text-on-surface/55 mt-0.5 leading-relaxed">{p.description}</p>}
                                        {p.technologies?.length > 0 && <TChips items={p.technologies} color="text-on-surface-variant/70" />}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Certifications */}
                        {originalResume.certifications?.length > 0 && (
                            <>
                                <TSection heading="Certifications" />
                                <TChips items={originalResume.certifications} color="text-tertiary-fixed-dim/80" />
                            </>
                        )}
                    </TerminalBlock>
                )}

                {/* ── 3. JOB DESCRIPTION ────────────────────────────────────── */}
                {jobDescription && (
                    <TerminalBlock
                        title="job-description.json"
                        prompt="kleos parse --job-description"
                        copyText={jdCopyText}
                    >
                        {jobDescription.job_title && <TLine label="role"    value={jobDescription.job_title}     color="text-tertiary-fixed-dim" />}
                        {jobDescription.company   && <TLine label="company" value={jobDescription.company}        />}
                        {jobDescription.seniority_level && <TLine label="level" value={jobDescription.seniority_level} color="text-primary/80" />}

                        {jobDescription.required_skills?.length > 0 && (
                            <>
                                <TSection heading="Required Skills" />
                                <TChips items={jobDescription.required_skills} color="text-error/80" />
                            </>
                        )}
                        {jobDescription.preferred_skills?.length > 0 && (
                            <>
                                <TSection heading="Preferred Skills" />
                                <TChips items={jobDescription.preferred_skills} color="text-primary/80" />
                            </>
                        )}
                        {jobDescription.tools_and_technologies?.length > 0 && (
                            <>
                                <TSection heading="Tools & Technologies" />
                                <TChips items={jobDescription.tools_and_technologies} color="text-on-surface-variant/70" />
                            </>
                        )}
                        {jobDescription.keywords?.length > 0 && (
                            <>
                                <TSection heading="Keywords" />
                                <TChips items={jobDescription.keywords} color="text-tertiary-fixed-dim/70" />
                            </>
                        )}
                        {jobDescription.responsibilities?.length > 0 && (
                            <>
                                <TSection heading="Responsibilities" />
                                {jobDescription.responsibilities.map((r, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-on-surface/60 mb-1">
                                        <span className="text-primary/40 shrink-0">•</span>
                                        <span className="leading-relaxed">{r}</span>
                                    </div>
                                ))}
                            </>
                        )}
                        {jobDescription.qualifications?.length > 0 && (
                            <>
                                <TSection heading="Qualifications" />
                                {jobDescription.qualifications.map((q, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-on-surface/60 mb-1">
                                        <span className="text-tertiary-fixed-dim/40 shrink-0">→</span>
                                        <span className="leading-relaxed">{q}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </TerminalBlock>
                )}

                {/* ── 4. OPTIMIZED RESUME ───────────────────────────────────── */}
                {improvedResume && (
                    <TerminalBlock
                        title="optimized-resume.json"
                        prompt="kleos optimize --resume"
                        copyText={optimizerCopyText}
                    >
                        {improvedResume.improved_summary && (
                            <>
                                <TSection heading="Improved Summary" />
                                <p className="text-xs text-on-surface/75 leading-relaxed mb-2">{improvedResume.improved_summary}</p>
                            </>
                        )}

                        {improvedResume.improved_experience?.length > 0 && (
                            <>
                                <TSection heading="Improved Experience" />
                                {improvedResume.improved_experience.map((exp, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-xs font-bold text-on-surface/90">{exp.title}</span>
                                            <span className="text-on-surface-variant/40 text-xs">@</span>
                                            <span className="text-xs text-tertiary-fixed-dim/80">{exp.company}</span>
                                            <span className="text-on-surface-variant/40 text-xs">· {exp.duration}</span>
                                        </div>
                                        {exp.improved_bullets?.map((b, j) => (
                                            <div key={j} className="flex gap-2 text-xs text-on-surface/65 mb-0.5 pl-2">
                                                <span className="text-tertiary-fixed-dim/50 shrink-0">▸</span>
                                                <span className="leading-relaxed">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}

                        {improvedResume.improved_skills?.length > 0 && (
                            <>
                                <TSection heading="Improved Skills" />
                                <TChips items={improvedResume.improved_skills} color="text-primary/80" />
                            </>
                        )}

                        {improvedResume.keywords_added?.length > 0 && (
                            <>
                                <TSection heading="Keywords Added" />
                                <TChips items={improvedResume.keywords_added} color="text-tertiary-fixed-dim/80" />
                            </>
                        )}

                        {improvedResume.notes?.length > 0 && (
                            <>
                                <TSection heading="Optimizer Notes" />
                                {improvedResume.notes.map((n, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-on-surface/55 mb-1">
                                        <span className="text-on-surface-variant/40 shrink-0">//</span>
                                        <span className="leading-relaxed">{n}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </TerminalBlock>
                )}

                {/* ── 5. GAP ANALYSIS ───────────────────────────────────────── */}
                {gapAnalysis && (
                    <TerminalBlock
                        title="gap-analysis.json"
                        prompt="kleos analyze --gaps"
                        copyText={gapCopyText}
                    >
                        {gapAnalysis.match_percentage != null && (
                            <div className="mb-5 flex items-end gap-3">
                                <span className="text-5xl font-black text-on-surface">{gapAnalysis.match_percentage}</span>
                                <span className="text-on-surface-variant/60 text-sm mb-1.5">% match</span>
                            </div>
                        )}

                        {gapAnalysis.strengths?.length > 0 && (
                            <>
                                <TSection heading="Strengths" />
                                <TChips items={gapAnalysis.strengths} color="text-tertiary-fixed-dim/85" />
                            </>
                        )}

                        {gapAnalysis.missing_required_skills?.length > 0 && (
                            <>
                                <TSection heading="Missing Required Skills" />
                                <TChips items={gapAnalysis.missing_required_skills} color="text-error/80" />
                            </>
                        )}

                        {gapAnalysis.missing_preferred_skills?.length > 0 && (
                            <>
                                <TSection heading="Missing Preferred Skills" />
                                <TChips items={gapAnalysis.missing_preferred_skills} color="text-primary/80" />
                            </>
                        )}

                        {gapAnalysis.missing_keywords?.length > 0 && (
                            <>
                                <TSection heading="Missing Keywords" />
                                <TChips items={gapAnalysis.missing_keywords} color="text-on-surface-variant/70" />
                            </>
                        )}

                        {gapAnalysis.weak_areas?.length > 0 && (
                            <>
                                <TSection heading="Weak Areas" />
                                {gapAnalysis.weak_areas.map((w, i) => (
                                    <div key={i} className="mb-3 pl-3 border-l border-error/20">
                                        <span className="text-xs font-bold text-on-surface/85 block">{w.area}</span>
                                        <span className="text-xs text-on-surface/50 leading-relaxed">{w.reason}</span>
                                    </div>
                                ))}
                            </>
                        )}

                        {gapAnalysis.irrelevant_content?.length > 0 && (
                            <>
                                <TSection heading="Consider Removing" />
                                {gapAnalysis.irrelevant_content.map((item, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-on-surface/55 mb-1">
                                        <span className="text-on-surface-variant/40 shrink-0">−</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </TerminalBlock>
                )}

                {/* ── 6. COVER LETTER ───────────────────────────────────────── */}
                {coverLetter && (
                    <TerminalBlock
                        title="cover-letter.md"
                        prompt="kleos generate --cover-letter"
                        copyText={clCopyText}
                    >
                        {coverLetter.subject_line && (
                            <>
                                <TSection heading="Subject" />
                                <p className="text-xs font-bold text-tertiary-fixed-dim/90 mb-4">{coverLetter.subject_line}</p>
                            </>
                        )}

                        {coverLetter.body && (
                            <>
                                <TSection heading="Body" />
                                {coverLetter.body.split('\n').filter(p => p.trim()).map((para, i) => (
                                    <p key={i} className="text-xs text-on-surface/75 leading-relaxed mb-3 last:mb-0">{para}</p>
                                ))}
                            </>
                        )}

                        {coverLetter.keywords_used?.length > 0 && (
                            <>
                                <TSection heading="Keywords Woven In" />
                                <TChips items={coverLetter.keywords_used} color="text-primary/80" />
                            </>
                        )}
                    </TerminalBlock>
                )}

            </div>
        </div>
    );
};

export default Results;
