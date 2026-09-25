import { useState, useEffect } from 'react';
import { HiOutlineShieldCheck, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

export default function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Info, 2: Setup, 3: Verify
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/two-factor/status');
      setIsEnabled(data.enabled);
    } catch (err) {
      toast.error('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    try {
      const { data } = await api.post('/two-factor/setup');
      setSetupData(data);
      setStep(2);
    } catch (err) {
      toast.error('Failed to initialize 2FA setup');
    }
  };

  const handleNext = () => {
    setStep(3);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Enter a valid 6-digit code');
      return;
    }

    try {
      const { data } = await api.post('/two-factor/enable', { code });
      setIsEnabled(true);
      setStep(1);
      setCode('');
      setSetupData(null);
      toast.success('Two-Factor Authentication is now enabled!');

      // Show recovery codes
      if (data.recovery_codes) {
        toast('Save your recovery codes in a safe place!', { icon: '🔑', duration: 6000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid verification code');
    }
  };

  const handleDisable = async () => {
    try {
      await api.post('/two-factor/disable');
      setIsEnabled(false);
      toast.success('Two-Factor Authentication disabled');
    } catch (err) {
      toast.error('Failed to disable 2FA');
    }
  };

  if (loading) {
    return (
      <div className="animate-fadeIn p-8 text-center">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Two-Factor Authentication (2FA)</h1>
          <p className="subtitle">Secure your account with an extra layer of protection</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {step === 1 && (
          <div className="text-center p-6">
            <HiOutlineShieldCheck size={80} className={isEnabled ? "text-success mb-4 mx-auto" : "text-secondary mb-4 mx-auto"} />
            <h2 className="text-h3 mb-2">{isEnabled ? '2FA is Enabled' : '2FA is Disabled'}</h2>
            <p className="text-secondary mb-6">
              {isEnabled
                ? 'Your account is protected. You will be required to enter a security code from your authenticator app when you log in.'
                : 'Protect your account by adding an additional layer of security. Once enabled, you will need to enter a code from your mobile device when logging in.'}
            </p>
            {isEnabled ? (
              <button className="btn btn-danger" onClick={handleDisable}>Disable 2FA</button>
            ) : (
              <button className="btn btn-primary" onClick={handleEnable}>Enable 2FA</button>
            )}
          </div>
        )}

        {step === 2 && setupData && (
          <div className="p-6">
            <h2 className="text-h3 mb-4 border-bottom pb-2">Setup Authenticator App</h2>
            <ol className="mb-6 pl-4 flex flex-col gap-3">
              <li>Download an authenticator app like Google Authenticator or Authy on your mobile device.</li>
              <li>Scan the QR code below with the app, or enter the secret key manually.</li>
            </ol>
            <div className="flex justify-center mb-6 p-4 rounded-md" style={{ background: '#fff' }}>
              {/* QR code placeholder — in production use a QR library with setupData.otpauth_url */}
              <div style={{ width: '200px', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', borderRadius: '8px' }}>
                <span style={{ color: '#333', fontWeight: 'bold', fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>Scan with<br/>Authenticator App</span>
              </div>
            </div>
            <p className="text-center text-sm font-mono bg-[var(--bg-input)] p-2 rounded mb-6">
              Secret Key: {setupData.secret}
            </p>
            <div className="flex justify-between">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleNext}>Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 text-center">
            <HiOutlineDevicePhoneMobile size={60} className="text-primary-400 mb-4 mx-auto" />
            <h2 className="text-h3 mb-2">Verify Code</h2>
            <p className="text-secondary mb-6">Enter the 6-digit code generated by your authenticator app.</p>

            <form onSubmit={handleVerify}>
              <input
                type="text"
                className="form-input text-center text-h3 tracking-widest mb-6"
                placeholder="000000"
                maxLength="6"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                style={{ width: '200px', margin: '0 auto', letterSpacing: '0.5em' }}
                autoFocus
              />
              <p className="text-xs text-secondary mb-4">For demo, enter <strong>123456</strong> to verify</p>
              <div className="flex justify-between mt-4 border-top pt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn btn-primary">Verify & Enable</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
