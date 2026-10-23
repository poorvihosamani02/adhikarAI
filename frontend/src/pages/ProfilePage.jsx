import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { UserCheck, Save, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const { profile, updateProfile, clearProfile, loading } = useProfile();

  const [formData, setFormData] = useState({
    name: profile?.name || 'Rohan Sharma',
    age: profile?.age || '20',
    gender: profile?.gender || 'Male',
    annualIncome: profile?.annualIncome || '250000',
    category: profile?.category || 'General',
    state: profile?.state || 'Karnataka',
    educationLevel: profile?.educationLevel || 'Undergraduate',
    course: profile?.course || 'B.Tech / Degree',
    occupation: profile?.occupation || 'Student',
    isMinority: profile?.isMinority || false,
    isBPL: profile?.isBPL || false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 120) {
      setErrorMsg('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!formData.annualIncome || Number(formData.annualIncome) < 0) {
      setErrorMsg('Please enter a valid annual family income in INR.');
      return;
    }

    try {
      await updateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        if (redirectTarget === 'find-schemes') {
          navigate('/find-schemes');
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  const handleReset = () => {
    clearProfile();
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      annualIncome: '',
      category: 'General',
      state: 'Karnataka',
      educationLevel: 'Undergraduate',
      course: '',
      occupation: 'Student',
      isMinority: false,
      isBPL: false
    });
    setSavedSuccess(false);
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)', marginBottom: '0.35rem' }}>
          Citizen Profile Setup
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
          Profile attributes are used by the eligibility engine to match benefits from the research dataset.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
        <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Practice Demo Storage:</strong> Profile data is kept in client state and temporary browser storage. When your Node.js backend is built, this form will connect directly to <code>POST /api/profile</code>.
        </div>
      </div>

      {savedSuccess && (
        <div className="alert alert-success animate-fade-in" style={{ fontSize: '0.85rem' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>Profile saved successfully! {redirectTarget === 'find-schemes' ? 'Redirecting to Find My Schemes...' : ''}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="grid-2">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Citizen Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Priya Patel"
              required
            />
          </div>

          {/* Age */}
          <div className="form-group">
            <label className="form-label" htmlFor="age">Age (in Years)</label>
            <input
              id="age"
              name="age"
              type="number"
              className="form-control"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 21"
              min="1"
              max="120"
              required
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label" htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Annual Family Income */}
          <div className="form-group">
            <label className="form-label" htmlFor="annualIncome">Annual Family Income (₹ INR)</label>
            <input
              id="annualIncome"
              name="annualIncome"
              type="number"
              className="form-control"
              value={formData.annualIncome}
              onChange={handleChange}
              placeholder="e.g. 200000"
              required
            />
            <span className="form-hint">Used to evaluate scholarship & subsidy income ceilings.</span>
          </div>

          {/* Social Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category (Caste / Reservation)</label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="General">General</option>
              <option value="OBC">OBC (Other Backward Classes)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EBC">EBC (Economically Backward Class)</option>
            </select>
          </div>

          {/* Domicile State */}
          <div className="form-group">
            <label className="form-label" htmlFor="state">Domicile State</label>
            <select
              id="state"
              name="state"
              className="form-control"
              value={formData.state}
              onChange={handleChange}
            >
              <option value="Karnataka">Karnataka (State Scheme Hub)</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Other">Other State / UT</option>
            </select>
          </div>

          {/* Education Level */}
          <div className="form-group">
            <label className="form-label" htmlFor="educationLevel">Education Level</label>
            <select
              id="educationLevel"
              name="educationLevel"
              className="form-control"
              value={formData.educationLevel}
              onChange={handleChange}
            >
              <option value="School">Class 10 / Class 12 / Pre-Matric</option>
              <option value="Undergraduate">Undergraduate (College / University)</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="Diploma">Diploma / Vocational</option>
              <option value="Not Applicable">Non-Student</option>
            </select>
          </div>

          {/* Course / Stream */}
          <div className="form-group">
            <label className="form-label" htmlFor="course">Current Course or Degree</label>
            <input
              id="course"
              name="course"
              type="text"
              className="form-control"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. Regular B.Tech, B.Sc, MBBS"
            />
          </div>

          {/* Occupation */}
          <div className="form-group">
            <label className="form-label" htmlFor="occupation">Occupation / Economic Role</label>
            <select
              id="occupation"
              name="occupation"
              className="form-control"
              value={formData.occupation}
              onChange={handleChange}
            >
              <option value="Student">Student</option>
              <option value="Farmer / Agriculturalist">Farmer / Agriculturalist</option>
              <option value="Artisan / Craftsperson">Artisan / Craftsperson</option>
              <option value="Unemployed Graduate">Unemployed Graduate</option>
              <option value="Salaried / Self-Employed">Salaried / Self-Employed</option>
              <option value="Homemaker">Homemaker</option>
              <option value="Senior Citizen">Senior Citizen</option>
            </select>
          </div>

          {/* Checkbox fields */}
          <div className="form-group" style={{ justifyContent: 'center', gap: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                name="isMinority"
                checked={formData.isMinority}
                onChange={handleChange}
              />
              <span>Religious or Linguistic Minority Community</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                name="isBPL"
                checked={formData.isBPL}
                onChange={handleChange}
              />
              <span>BPL (Below Poverty Line) Card Holder</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            title="Reset form to blank"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
