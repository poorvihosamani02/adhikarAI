import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

import { calculateProfileCompleteness } from '../context/ProfileContext';

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Uttar Pradesh',
  'Bihar',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Gujarat',
  'Punjab',
  'Haryana',
  'Delhi',
  'Other State / UT'
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchDemoUser } = useAuth();
  const { profile, saveProfile } = useProfile();

  const [formData, setFormData] = useState({
    name: user?.name || profile?.name || '',
    age: profile?.age ? String(profile.age) : '',
    gender: profile?.gender || '',
    state: profile?.state || '',
    category: profile?.category || '',
    annual_income: (profile?.annual_income !== null && profile?.annual_income !== undefined && profile?.annual_income !== '') ? String(profile.annual_income) : '',
    education_level: profile?.education_level || '',
    course: profile?.course || '',
    occupation: profile?.occupation || '',
    is_minority: Boolean(profile?.is_minority),
    is_bpl: Boolean(profile?.is_bpl)
  });

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        age: profile.age ? String(profile.age) : '',
        gender: profile.gender || '',
        state: profile.state || '',
        category: profile.category || '',
        annual_income: (profile.annual_income !== null && profile.annual_income !== undefined && profile.annual_income !== '') ? String(profile.annual_income) : '',
        education_level: profile.education_level || '',
        course: profile.course || '',
        occupation: profile.occupation || '',
        is_minority: Boolean(profile.is_minority),
        is_bpl: Boolean(profile.is_bpl)
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || ''
      }));
    }
  }, [profile, user]);

  const liveCompleteness = calculateProfileCompleteness(formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorToast('');

    try {
      await saveProfile({
        ...formData,
        age: formData.age !== '' ? Number(formData.age) : null,
        annual_income: formData.annual_income !== '' ? Number(formData.annual_income) : null
      });
      setSuccessToast(true);

      // Workflow transition: navigate directly to My Schemes after profile completion
      setTimeout(() => {
        navigate('/my-schemes');
      }, 700);
    } catch (err) {
      setErrorToast(err.message || 'Failed to save citizen profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="profile-page-wrap">
      <div className="section-wrap profile-page" style={{ paddingTop: '40px', paddingBottom: '90px' }}>
        {/* Breadcrumb Navigation */}
        <div className="profile-breadcrumb" style={{ marginBottom: '24px' }}>
          <Link to="/">Home</Link>
          <span>›</span>
          <strong>Citizen Profile</strong>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              background: '#e1f1e3',
              border: '1px solid #c8e5cc',
              color: '#254c3c',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px'
            }}
          >
            ✓ Profile saved successfully! Welfare eligibility matching updated.
          </div>
        )}

        {errorToast && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              background: '#fff0ef',
              border: '1px solid #f5c6c2',
              color: '#c93b2b',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px'
            }}
          >
            ✕ {errorToast}
          </div>
        )}

        {/* Profile Card Header */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div className="pd-avatar-large" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                {initials}
              </div>
              <div>
                <h2 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 800 }}>
                  {formData.name || 'Citizen User'}
                </h2>
                <div style={{ color: '#77786f', fontSize: '13px', marginTop: '2px' }}>
                  {user?.email || 'citizen@adhikar.ai'}
                </div>
                <span className="pd-badge" style={{ marginTop: '6px', display: 'inline-block' }}>
                  ✓ Verified Citizen Profile
                </span>
              </div>
            </div>

            {/* Quick Demo Switchers */}
            <div>
              <span className="tiny-label" style={{ display: 'block', marginBottom: '8px' }}>
                LOAD DEMO PRESET PROFILE
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="sample-button"
                  onClick={() => switchDemoUser('SC')}
                >
                  Arun (SC Student)
                </button>
                <button
                  type="button"
                  className="sample-button"
                  onClick={() => switchDemoUser('OBC')}
                >
                  Priya (OBC Farmer)
                </button>
                <button
                  type="button"
                  className="sample-button"
                  onClick={() => switchDemoUser('Senior')}
                >
                  Ramesh (Senior BPL)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Details Form */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <div className="section-kicker" style={{ marginBottom: '8px' }}>
            DEMOGRAPHIC ELIGIBILITY PARAMETERS
          </div>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 800, margin: '0 0 20px' }}>
            Set Up Citizen Information
          </h3>

          {/* Live Profile Setup Completeness Meter */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              background: liveCompleteness === 100 ? '#e1f1e3' : '#faf8f3',
              border: '1px solid ' + (liveCompleteness === 100 ? '#b8dec0' : '#e8e4dc'),
              marginBottom: '26px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.06em', color: '#45463f' }}>
                PROFILE SETUP COMPLETION
              </span>
              <strong style={{ fontSize: '14px', color: liveCompleteness === 100 ? '#254c3c' : '#8c4300' }}>
                {liveCompleteness}% Complete
              </strong>
            </div>
            <div className="progress-track" style={{ height: '8px', background: '#e8e4dc' }}>
              <span
                style={{
                  width: `${liveCompleteness}%`,
                  background: liveCompleteness === 100 ? '#254c3c' : '#d97706',
                  transition: 'width 0.3s ease'
                }}
              ></span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#77786f' }}>
              {liveCompleteness === 100
                ? '✓ All core demographic criteria configured! Ready to match your eligible welfare schemes.'
                : 'Fill in your state, social category, age, and occupation to reach 100% and view matching schemes.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>State of Domicile</span>
                <select name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">Select State of Residence</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Social Category / Caste</span>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Social Category</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="General">General / Unreserved</option>
                  <option value="Minority">Religious Minority</option>
                </select>
              </label>

              <label className="field">
                <span>Age</span>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  placeholder="e.g. 24"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Gender</span>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="field">
                <span>Primary Occupation</span>
                <select name="occupation" value={formData.occupation} onChange={handleChange} required>
                  <option value="">Select Primary Occupation</option>
                  <option value="Student">Student</option>
                  <option value="Farmer">Farmer / Cultivator</option>
                  <option value="Agricultural Labourer">Agricultural Labourer</option>
                  <option value="Self Employed">Self-Employed / Artisan</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Senior Citizen">Senior Citizen / Retired</option>
                </select>
              </label>

              <label className="field">
                <span>Annual Household Income (₹)</span>
                <input
                  type="number"
                  name="annual_income"
                  min="0"
                  step="5000"
                  placeholder="e.g. 120000"
                  value={formData.annual_income}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Education Level</span>
                <select name="education_level" value={formData.education_level} onChange={handleChange}>
                  <option value="">Select Education Level</option>
                  <option value="Primary School">Primary School</option>
                  <option value="Secondary School">Secondary School (Class 10)</option>
                  <option value="Higher Secondary">Higher Secondary (Class 12 / PUC)</option>
                  <option value="Undergraduate">Undergraduate (Degree / Diploma)</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Doctorate">Doctorate / Ph.D.</option>
                  <option value="None">None / Non-literate</option>
                </select>
              </label>
            </div>

            {/* Checkbox Attributes */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', margin: '24px 0', padding: '16px 20px', borderRadius: '14px', background: '#faf8f3', border: '1px solid #e8e4dc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="is_bpl"
                  checked={formData.is_bpl}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#254c3c' }}
                />
                <span>Below Poverty Line (BPL / Antyodaya Ration Card)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="is_minority"
                  checked={formData.is_minority}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: '#254c3c' }}
                />
                <span>Minority Community Member</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '28px' }}>
              <button
                type="submit"
                className="button button-dark"
                style={{
                  width: '100%',
                  background: '#254c3c',
                  color: '#ffffff',
                  justifyContent: 'center',
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 800,
                  borderRadius: '14px'
                }}
                disabled={saving}
              >
                {saving ? 'Saving Profile & Matching Schemes...' : 'Save Profile & View My Schemes →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
