import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LeadForm from './components/LeadForm';
import OtpModal from './components/OtpModal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Sync tab state with browser URL path
  const getTabFromUrl = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || hash.includes('admin')) return 'admin';
    return 'form';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [currentLeadForOtp, setCurrentLeadForOtp] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    const newPath = tab === 'admin' ? '/admin' : '/booking';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tab }, '', newPath);
    }
  };

  const handleLeadCreated = (leadData) => {
    setCurrentLeadForOtp(leadData);
  };

  const handleVerificationSuccess = (result) => {
    setCurrentLeadForOtp(null);
    changeTab('admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={changeTab} />

      <main className="flex-1">
        {activeTab === 'form' ? (
          <div>
            <LeadForm onLeadCreated={handleLeadCreated} />

            {/* OTP Modal */}
            {currentLeadForOtp && (
              <OtpModal
                leadData={currentLeadForOtp}
                onClose={() => setCurrentLeadForOtp(null)}
                onVerificationSuccess={handleVerificationSuccess}
              />
            )}
          </div>
        ) : (
          <AdminDashboard />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-medium">
        <p>PackersMart Platform &copy; 2026 — Enterprise Full-Stack Assessment</p>
      </footer>
    </div>
  );
}
