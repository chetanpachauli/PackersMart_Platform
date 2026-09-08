import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, AlertCircle, X, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { leadService } from '../services/api';

export default function OtpModal({ leadData, onClose, onVerificationSuccess }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter a 6-digit numeric OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await leadService.verifyOtp(leadData.lead_id, otp);
      if (response.success) {
        setVerifiedResult(response.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/80 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!verifiedResult ? (
          <div className="p-7 sm:p-9">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Verify Mobile OTP</h3>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              Enter the 6-digit verification code generated for <span className="font-bold text-slate-900">{leadData.customer_name}</span> ({leadData.mobile}).
            </p>

            {/* OTP Testing Banner */}
            <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-amber-900 text-xs mb-6 flex items-center space-x-3 shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold block text-amber-950">Assessment Test OTP:</span>
                <span className="font-mono bg-amber-200/90 px-2.5 py-0.5 rounded-md text-amber-950 font-black tracking-widest text-sm inline-block mt-0.5">
                  {leadData.otp_testing}
                </span>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter Code
                  </label>
                  <span className="text-xs font-mono text-slate-500">
                    Expires in: <span className="text-indigo-600 font-bold">{formatTime(timeLeft)}</span>
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 px-4 rounded-2xl border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-bold"
                />
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || timeLeft <= 0}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Verify & Unlock Matching</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success State */
          <div className="p-7 sm:p-9 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-200 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">OTP Verified!</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Customer contact is verified. Quality scoring & matching engine executed.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Quality Score:</span>
                <span className="font-bold text-indigo-700">
                  {verifiedResult.lead.lead_score}/100 ({verifiedResult.lead.lead_quality})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Matched Movers:</span>
                <span className="font-bold text-slate-900 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  {verifiedResult.matched_companies_count} Companies
                </span>
              </div>
            </div>

            <button
              onClick={() => onVerificationSuccess(verifiedResult)}
              className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-xl transition-all text-sm cursor-pointer"
            >
              Go to Admin Lead Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
