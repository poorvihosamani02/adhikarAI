import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Save,
  Sparkles,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import Alert from '../components/ui/Alert';

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
  'Odisha',
  'Assam',
  'Other State / UT'
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, saveProfile, loadPreset } = useProfile();

  const query = new URLSearchParams(location.search);
  const redirectTarget = query.get('redirect');

  const [formData, setFormData] = useState({
    name: '',
    age: 24,
    gender: 'Male',
    state: 'Karnataka',
    category: 'SC',
    annual_income: 120000,
    education_level: 'Undergraduate',
    course: 'B.Tech Computer Science',
    occupation: 'Student',
    is_minority: false,
    is_bpl: true
  });

  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        age: profile.age ?? 24,
        gender: profile.gender || 'Male',
        state: profile.state || 'Karnataka',
        category: profile.category || 'SC',
        annual_income: profile.annual_income ?? 120000,
        education_level: profile.education_level || 'Undergraduate',
        course: profile.course || '',
        occupation: profile.occupation || 'Student',
        is_minority: Boolean(profile.is_minority),
        is_bpl: Boolean(profile.is_bpl)
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e, shouldRedirect = false) => {
    if (e) e.preventDefault();
    setSaving(true);
    setAlertInfo(null);

    try {
      await saveProfile({
        ...formData,
        age: Number(formData.age),
        annual_income: Number(formData.annual_income)
      });
      setAlertInfo({ type: 'success', text: 'Citizen profile saved successfully! Scheme matching updated.' });

      if (shouldRedirect || redirectTarget === 'find-schemes') {
        setTimeout(() => navigate('/find-schemes'), 400);
      }
    } catch (err) {
      setAlertInfo({ type: 'danger', text: err.message || 'Failed to save citizen profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = (key) => {
    loadPreset(key);
    setAlertInfo({ type: 'info', text: `Loaded demo profile for ${key}. You can edit and test changes.` });
  };

  return (
    <div className="container" style={{ maxWidth: '980px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="eyebrow-text">CITIZEN IDENTITY</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em' }}>
            Citizen Profile &amp; Preferences.
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Your demographic and socioeconomic data powers the AdhikarAI eligibility matching engine.
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 700 }}>Presets:</span>
          <button
            type="button"
            className="demo-pill-btn"
            onClick={() => handleApplyPreset('SC')}
            title="Load SC Student Profile"
          >
            Arun (SC)
          </button>
          <button
            type="button"
            className="demo-pill-btn"
            onClick={() => handleApplyPreset('OBC')}
            title="Load OBC Farmer Profile"
          >
            Priya (OBC)
          </button>
          <button
            type="button"
            className="demo-pill-btn"
            onClick={() => handleApplyPreset('Senior')}
            title="Load Senior Citizen Profile"
          >
            Ramesh (Sr)
          </button>
        </div>
      </div>

      {alertInfo && (
        <Alert variant={alertInfo.type} onClose={() => setAlertInfo(null)}>
          {alertInfo.text}
        </Alert>
      )}

      {/* Main Profile Form Card */}
      <div className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Row 1 */}
            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label form-label-required">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Arun Kumar"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label form-label-required">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  required
                  className="form-input"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 24"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label form-label-required">Gender</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender / Other</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label form-label-required">State of Permanent Residence</label>
                <select name="state" className="form-select" value={formData.state} onChange={handleChange}>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label form-label-required">Social Category</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                  <option value="General">General / Unreserved</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="OBC">Other Backward Class (OBC)</option>
                  <option value="Minority">Notified Religious / Linguistic Minority</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label form-label-required">Annual Family Income (₹)</label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--coral-600)', fontWeight: 700 }}>
                    ₹{Number(formData.annual_income || 0).toLocaleString('en-IN')} / year
                  </span>
                </div>
                <input
                  type="number"
                  name="annual_income"
                  min="0"
                  step="5000"
                  required
                  className="form-input"
                  value={formData.annual_income}
                  onChange={handleChange}
                  placeholder="e.g. 120000"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Education Level</label>
                <select
                  name="education_level"
                  className="form-select"
                  value={formData.education_level}
                  onChange={handleChange}
                >
                  <option value="Primary">Primary (Up to 8th Standard)</option>
                  <option value="Secondary">Secondary (Class 9 - 10)</option>
                  <option value="Higher Secondary">Higher Secondary (Class 11 - 12 / PUC)</option>
                  <option value="Undergraduate">Undergraduate Degree (B.A., B.Sc., B.Tech, etc.)</option>
                  <option value="Postgraduate">Postgraduate Degree (M.A., M.Sc., M.Tech, etc.)</option>
                  <option value="Diploma">Polytechnic / Vocational Diploma</option>
                  <option value="None">None / Non-Formal</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Course / Stream</label>
                <input
                  type="text"
                  name="course"
                  className="form-input"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech Computer Science or Class 12 Science"
                />
              </div>
            </div>

            {/* Row 5 */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Occupation / Status</label>
              <select name="occupation" className="form-select" value={formData.occupation} onChange={handleChange}>
                <option value="Student">Student (Enrolled in School / College)</option>
                <option value="Farmer / Artisan">Farmer / Agricultural Labourer</option>
                <option value="Construction Worker">Construction / Informal Sector Worker</option>
                <option value="Artisan">Handloom Weaver / Artisan</option>
                <option value="Salaried Employee">Salaried / Private Employee</option>
                <option value="Self Employed">Self-Employed / Micro-Enterprise</option>
                <option value="Senior Citizen / Pensioner">Senior Citizen / Pensioner</option>
                <option value="Unemployed">Unemployed / Job Seeker</option>
              </select>
            </div>

            {/* Row 6: Special Status Toggles */}
            <div
              style={{
                background: 'var(--charcoal-50)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--charcoal-100)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--charcoal-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Special Affirmative Entitlements
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_bpl"
                  checked={formData.is_bpl}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--coral-600)', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--charcoal-900)' }}>
                    Holds Below Poverty Line (BPL) / Antyodaya Ration Card
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-500)' }}>
                    Unlocks specific nutritional, housing, and subsidised educational reservations.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_minority"
                  checked={formData.is_minority}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--coral-600)', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--charcoal-900)' }}>
                    Belongs to Notified Religious or Linguistic Minority Community
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-500)' }}>
                    Enables Ministry of Minority Affairs merit scholarships and pre-matric programs.
                  </div>
                </div>
              </label>
            </div>

            {/* Form Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                paddingTop: '1rem',
                borderTop: '1px solid var(--charcoal-100)'
              }}
            >
              <button
                type="submit"
                disabled={saving}
                className="btn"
                style={{
                  background: 'var(--charcoal-900)',
                  color: '#ffffff',
                  padding: '0.8rem 1.6rem'
                }}
              >
                <span>Save Profile</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, true)}
                className="btn"
                style={{
                  background: 'var(--coral-600)',
                  color: '#ffffff',
                  padding: '0.8rem 1.8rem'
                }}
              >
                <span>Save &amp; Find My Schemes</span>
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security Guarantee Box */}
      <div
        className="card"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <Lock size={22} style={{ color: 'var(--coral-600)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--charcoal-700)', lineHeight: 1.5 }}>
          <strong>Statutory Privacy Protection:</strong> Profile details are stored strictly in local client memory for
          evaluating welfare criteria against open scheme guidelines. AdhikarAI will never request personal biometric
          identifiers or banking passwords.
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
