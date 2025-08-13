import React, { useState, useEffect } from 'react';
import { requestPanOtp, confirmPanOtp } from '../api';
'../styles.css';

export default function PanOtpModal({ pan, onVerified, onClose }) {
  const [txId, setTxId] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);


  // Countdown for OTP expiry
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setDemoOtp(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  async function sendOtp() {
    setError('');
    setAlreadyRegistered(false);
    setSendingOtp(true);
    
    try {
      const res = await requestPanOtp(pan);
      console.log(res);
      setTxId(res.data.txId);
      setDemoOtp(res.data.otp);// show flotting otp
      setCountdown(120); // 2 minutes
    } catch (err) {
      if (err?.response?.status === 409) {
        setAlreadyRegistered(true);
        setError('');
      } else {
        setError(err?.response?.data?.error || 'Failed to request OTP');
      }
    }finally{
      setSendingOtp(false);
    }
  }

  async function confirm() {
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      const res = await confirmPanOtp(txId, otp);
      if (res.data.verified) {
        onVerified(true);
        onClose();
      } else {
        setError('OTP invalid or verification failed');
      }
    } catch (err) {
      setError('Verification failed: ' + (err?.response?.data?.error || 'Unknown error'));
    }
  }

  return (
    <>
      {/* Floating OTP Toast */}
      {demoOtp && (
        <div className="otp-toast">
          <strong>Demo OTP:</strong> {demoOtp} <br />
          <small>Expires in {countdown}s</small>
        </div>
      )}

      <div className="modal">
        {alreadyRegistered && (
          <div className="error" style={{ marginBottom: 8, color: "red" }}>
            PAN already registered
          </div>
        )}
        <h3>PAN verification</h3>
        {!txId ? (
          <>
            <p>Send 6 Digit OTP to PAN: {pan}</p>
            {alreadyRegistered ? (
              <button style={{ backgroundColor: "gray", cursor: "not-allowed" }}>Send OTP</button>
            ) : (
              <button onClick={sendOtp}>{sendingOtp ? 'Sending...' : 'Send OTP'}</button>
            )}
          </>
        ) : (
          <>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength={6}
            />
            <button onClick={confirm}>Verify</button>
          </>

        )}
        {error && <div className="error">{error}</div>}
        <button onClick={onClose}>Close</button>
      </div>
    </>
  );
}