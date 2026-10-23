import React from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { Info, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DemoBanner() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className={`demo-banner ${!isDemoMode ? 'bg-emerald' : ''}`} style={!isDemoMode ? { background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' } : {}}>
      {isDemoMode ? (
        <>
          <Info size={16} />
          <span>
            <strong>Practice Demo Mode Active:</strong> Running with dataset adapters. Backend folder is empty as requested.
          </span>
          <button
            onClick={toggleDemoMode}
            className="btn btn-sm btn-secondary"
            style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
            title="Toggle to test real backend integration (requires Node.js on port 3000)"
          >
            <ToggleRight size={14} color="#ea580c" /> Switch to Live Backend Mode
          </button>
        </>
      ) : (
        <>
          <AlertCircle size={16} />
          <span>
            <strong>Live Backend Mode:</strong> Frontend is attempting to connect to <code>http://localhost:3000</code>.
          </span>
          <button
            onClick={toggleDemoMode}
            className="btn btn-sm btn-secondary"
            style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
          >
            <ToggleLeft size={14} color="#059669" /> Switch to Demo Practice Mode
          </button>
        </>
      )}
    </div>
  );
}
