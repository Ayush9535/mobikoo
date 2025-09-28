import React, { useState, useEffect } from 'react';
import { KeyRound, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

const OTPVerification = ({ email, otp, expiry, onVerified, onResendOTP }) => {
  const [userOTP, setUserOTP] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Calculate initial time left
    const now = Date.now();
    const initialTimeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
    setTimeLeft(initialTimeLeft);

    // Start the countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (userOTP === otp) {
      onVerified();
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await onResendOTP();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 font-poppins">Enter OTP</h1>
          <p className="text-gray-600 text-sm">We've sent a code to {email}</p>
          <div className="mt-2 text-sm font-medium text-blue-600">
            Time remaining: {formatTime(timeLeft)}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={userOTP}
                onChange={(e) => setUserOTP(e.target.value)}
                className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-center tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Verify OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={timeLeft > 0 || loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-blue-600 rounded-md text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;