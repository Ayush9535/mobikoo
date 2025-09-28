import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import OTPVerification from './OTPVerification';
import ResetPassword from './ResetPassword';

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    email: '',
    otp: '',
    expiry: null
  });

  const handleOtpReceived = ({ email, otp, expiry }) => {
    setData({ ...data, email, otp, expiry });
    setStep(2);
  };

  const handleOtpVerified = () => {
    setStep(3);
  };

  const handleResendOTP = async () => {
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      });
      
      const newData = await res.json();
      
      if (!res.ok) {
        throw new Error(newData.error || 'Failed to resend OTP');
      }

      setData({
        ...data,
        otp: newData.otp,
        expiry: newData.expiry
      });
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      throw err;
    }
  };

  return (
    <>
      {step === 1 && (
        <ForgotPassword onOtpReceived={handleOtpReceived} />
      )}
      {step === 2 && (
        <OTPVerification
          email={data.email}
          otp={data.otp}
          expiry={data.expiry}
          onVerified={handleOtpVerified}
          onResendOTP={handleResendOTP}
        />
      )}
      {step === 3 && (
        <ResetPassword email={data.email} />
      )}
    </>
  );
};

export default PasswordReset;