import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LeadForm from './components/LeadForm';
import OtpModal from './components/OtpModal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [currentLeadForOtp, setCurrentLeadForOtp] = useState(null);

  const handleLeadCreated = (leadData) => {
    setCurrentLeadForOtp(leadData);
  };

  const handleVerificationSuccess = (result) => {
    setCurrentLeadForOtp(null);
    setActiveTab('admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>PackersMart Platform &copy; 2026 </p>
      </footer>
    </div>
  );
}
