'use strict';

const { SchemaType } = require('@google/generative-ai');

// ── Resume Parser Schema ────────────────────────────────────────────────────
const resumeParser = {
  type: SchemaType.OBJECT,
  properties: {
    contact: {
      type: SchemaType.OBJECT,
      properties: {
        name:     { type: SchemaType.STRING },
        email:    { type: SchemaType.STRING, nullable: true },
        phone:    { type: SchemaType.STRING, nullable: true },
        location: { type: SchemaType.STRING, nullable: true },
        linkedin: { type: SchemaType.STRING, nullable: true },
        github:   { type: SchemaType.STRING, nullable: true },
      },
    },
    summary:        { type: SchemaType.STRING, nullable: true },
    skills:         { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title:    { type: SchemaType.STRING },
          company:  { type: SchemaType.STRING },
          duration: { type: SchemaType.STRING },
          bullets:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          degree:      { type: SchemaType.STRING },
          institution: { type: SchemaType.STRING },
          year:        { type: SchemaType.STRING, nullable: true },
        },
      },
    },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name:         { type: SchemaType.STRING },
          description:  { type: SchemaType.STRING },
          technologies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
      },
    },
    certifications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    keywords:       { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
};

// ── JD Analyzer Schema ──────────────────────────────────────────────────────
const jdAnalyzer = {
  type: SchemaType.OBJECT,
  properties: {
    job_title:              { type: SchemaType.STRING },
    company:                { type: SchemaType.STRING, nullable: true },
    required_skills:        { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    preferred_skills:       { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    tools_and_technologies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    responsibilities:       { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    qualifications:         { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    keywords:               { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    seniority_level:        { type: SchemaType.STRING },
  },
};

// ── Gap Analysis Schema ─────────────────────────────────────────────────────
const gapAnalysis = {
  type: SchemaType.OBJECT,
  properties: {
    missing_required_skills:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    missing_preferred_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    missing_keywords:         { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    weak_areas: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          area:   { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
        },
      },
    },
    irrelevant_content: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    strengths:          { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    match_percentage:   { type: SchemaType.NUMBER },
  },
};

// ── Optimizer Schema ────────────────────────────────────────────────────────
const optimizer = {
  type: SchemaType.OBJECT,
  properties: {
    improved_summary: { type: SchemaType.STRING, nullable: true },
    improved_experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title:            { type: SchemaType.STRING },
          company:          { type: SchemaType.STRING },
          duration:         { type: SchemaType.STRING },
          improved_bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
      },
    },
    improved_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    keywords_added:  { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    notes:           { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
};

// ── ATS Scoring Schema ──────────────────────────────────────────────────────
const scoring = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: { type: SchemaType.NUMBER },
    dimensions: {
      type: SchemaType.OBJECT,
      properties: {
        keyword_match: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            max:   { type: SchemaType.NUMBER },
            notes: { type: SchemaType.STRING },
          },
        },
        relevance: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            max:   { type: SchemaType.NUMBER },
            notes: { type: SchemaType.STRING },
          },
        },
        formatting: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            max:   { type: SchemaType.NUMBER },
            notes: { type: SchemaType.STRING },
          },
        },
        clarity: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            max:   { type: SchemaType.NUMBER },
            notes: { type: SchemaType.STRING },
          },
        },
      },
    },
    top_improvements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    verdict:          { type: SchemaType.STRING },
  },
};

// ── Cover Letter Schema ─────────────────────────────────────────────────────
const coverLetter = {
  type: SchemaType.OBJECT,
  properties: {
    subject_line:  { type: SchemaType.STRING },
    body:          { type: SchemaType.STRING },
    keywords_used: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
};

module.exports = {
  resumeParser,
  jdAnalyzer,
  gapAnalysis,
  optimizer,
  scoring,
  coverLetter,
};
