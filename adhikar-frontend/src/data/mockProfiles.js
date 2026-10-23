/**
 * AdhikarAI — Demonstration Citizen Profiles
 * Used for instant prototype evaluation and demonstrating matching logic.
 */

export const DEMO_PROFILES = [
  {
    id: 1,
    name: 'Arun Kumar',
    email: 'arun.kumar@example.com',
    age: 24,
    gender: 'Male',
    annual_income: 120000,
    category: 'SC',
    state: 'Karnataka',
    education_level: 'Undergraduate',
    course: 'B.Tech Computer Science',
    occupation: 'Student',
    is_minority: false,
    is_bpl: true,
    tag: 'SC Student (Karnataka)'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    age: 32,
    gender: 'Female',
    annual_income: 85000,
    category: 'OBC',
    state: 'Maharashtra',
    education_level: 'Higher Secondary',
    course: 'Vocational Training',
    occupation: 'Farmer / Artisan',
    is_minority: false,
    is_bpl: true,
    tag: 'OBC Woman Farmer (Maharashtra)'
  },
  {
    id: 3,
    name: 'Ramesh Rao',
    email: 'ramesh.rao@example.com',
    age: 67,
    gender: 'Male',
    annual_income: 48000,
    category: 'General',
    state: 'Karnataka',
    education_level: 'Secondary',
    course: 'None',
    occupation: 'Senior Citizen / Pensioner',
    is_minority: false,
    is_bpl: true,
    tag: 'Senior Citizen (BPL Pensioner)'
  }
];

export const DEFAULT_CITIZEN_PROFILE = DEMO_PROFILES[0];
