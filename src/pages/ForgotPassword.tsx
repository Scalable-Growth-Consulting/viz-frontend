import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirm?: string }>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // If the user clicked the email link, Supabase will send a confirmation_url
  // pointing at the auth verify endpoint; we accept confirmation_url in the
  // querystring and attempt to either prefill the OTP or auto-verify a token_hash.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const confirmationUrlParam = params.get('confirmation_url');
    if (!confirmationUrlParam) return;

    let decoded: string;
    try {
      decoded = decodeURIComponent(confirmationUrlParam);
    } catch (e) {
      decoded = confirmationUrlParam;
    }

    try {
      const parsed = new URL(decoded);
      const token = parsed.searchParams.get('token') || parsed.searchParams.get('token_hash');
      // remove param from URL so the user doesn't re-trigger on reload
      try {
        const u = new URL(window.location.href);
        u.searchParams.delete('confirmation_url');
        window.history.replaceState({}, document.title, u.toString());
      } catch (e) {
        // ignore
      }

      if (!token) {
        setStep('verify');
        return;
      }

      // If token looks like a 6-digit OTP, prefill and allow user to submit.
      if (/^\d{6}$/.test(token)) {
        setOtp(token);
        setStep('verify');
        return;
      }

      // Otherwise treat as token_hash and attempt auto-verify using the SDK
      (async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.auth.verifyOtp({ token, type: 'recovery' } as any);
          if (error) {
            // fallback to OTP entry
            setStep('verify');
            toast({ title: 'Verification required', description: 'Please enter the OTP from your email.', variant: 'destructive' });
          } else {
            const access_token = (data as any)?.access_token || (data as any)?.session?.access_token;
            const refresh_token = (data as any)?.refresh_token || (data as any)?.session?.refresh_token;
            if (access_token) {
              await supabase.auth.setSession({ access_token, refresh_token });
            }
            setStep('reset');
            toast({ title: 'Verified', description: 'You may now set a new password.' });
          }
        } catch (err) {
          setStep('verify');
          toast({ title: 'Error', description: 'Failed to auto-verify. Please enter the OTP from your email.', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      })();
    } catch (err) {
      setStep('verify');
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast({ title: 'Email required', variant: 'destructive' });
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({ title: 'Error', description: error.message || 'Failed to request password reset', variant: 'destructive' });
      } else {
  toast({ title: 'Check your inbox', description: 'Password reset email sent. Use the token in the email to verify.' });
  setStep('verify');
      }
    } catch {
      toast({ title: 'Error', description: 'Please try again later', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast({ title: 'OTP required', variant: 'destructive' });
    setLoading(true);
    try {
      // Use supabase client to verify OTP - include email for 6-digit OTPs
      let data: any = null;
      let error: any = null;
      if (/^\d{6}$/.test(otp)) {
        if (!email) {
          setLoading(false);
          toast({ title: 'Email required for OTP', description: 'Please enter the email used to request the OTP.', variant: 'destructive' });
          return;
        }
        ({ data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' } as any));
      } else {
        ({ data, error } = await supabase.auth.verifyOtp({ token: otp, type: 'recovery' } as any));
      }
      setLoading(false);
      if (error) {
        console.error('verifyOtp error', error);
        toast({ title: 'Invalid OTP', description: error.message || 'The OTP you entered is incorrect.', variant: 'destructive' });
        return;
      }

      // If the SDK returned a session/access token, make sure client session is set
      const access_token = (data as any)?.access_token || (data as any)?.session?.access_token;
      const refresh_token = (data as any)?.refresh_token || (data as any)?.session?.refresh_token;
      if (access_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
      toast({ title: 'OTP Verified', description: 'You may now reset your password.' });
      setStep('reset');
    } catch (err) {
      setLoading(false);
      toast({ title: 'Error', description: 'Failed to verify OTP.', variant: 'destructive' });
    }
  };

  const validateResetPassword = () => {
    const errs: { newPassword?: string; confirm?: string } = {};
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
    if (newPassword !== confirmNewPassword) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetPassword()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setLoading(false);
      if (error) {
        toast({ title: 'Error', description: error.message || 'Failed to reset password.', variant: 'destructive' });
      } else {
        toast({ title: 'Password Reset Successful', description: 'You can now sign in with your new password.' });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
        setStep('request');
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setErrors({});
      }
    } catch (err) {
      setLoading(false);
      toast({ title: 'Error', description: 'Failed to reset password.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black px-4">
      <div className="w-full max-w-md">
        {/* Header / Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-viz-dark p-2 rounded-lg">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
            <span className="text-2xl font-bold text-viz-dark dark:text-white">Viz</span>
          </Link>
          <h1 className="text-3xl font-bold text-viz-dark dark:text-white mb-2">
            {step === 'request' && 'Reset your password'}
            {step === 'verify' && 'Verify your email'}
            {step === 'reset' && 'Create a new password'}
          </h1>
          <p className="text-viz-text-secondary">
            {step === 'request' && 'Enter your email to receive a password reset code.'}
            {step === 'verify' && 'Enter the 6-digit code sent to your email.'}
            {step === 'reset' && 'Set a strong password to secure your account.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-viz-medium rounded-2xl shadow-lg p-8">
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-viz-dark dark:text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-viz-accent hover:bg-viz-accent-light" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Sending...</>) : 'Send reset email'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Label htmlFor="otp" className="text-viz-dark dark:text-white">Enter OTP</Label>
                <Input id="otp" value={otp} onChange={e => setOtp(e.target.value)} required disabled={loading} placeholder="6-digit code" />
              </div>
              <Button type="submit" className="w-full bg-viz-accent hover:bg-viz-accent-light" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Verifying...</>) : 'Verify OTP'}
              </Button>
              <div className="text-sm text-viz-text-secondary">
                Didn’t get the code? Check your spam folder or request again.
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-viz-dark dark:text-white">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={loading} className="pl-10 pr-10" placeholder="••••••••" />
                  <button
                    type="button"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowNewPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
                {errors.newPassword && <div className="text-red-500 text-xs mt-1">{errors.newPassword}</div>}
              </div>
              <div>
                <Label htmlFor="confirmNewPassword" className="text-viz-dark dark:text-white">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="confirmNewPassword" type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required disabled={loading} className="pl-10 pr-10" placeholder="••••••••" />
                  <button
                    type="button"
                    aria-label={showConfirmNewPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmNewPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmNewPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
                {errors.confirm && <div className="text-red-500 text-xs mt-1">{errors.confirm}</div>}
              </div>
              <Button type="submit" className="w-full bg-viz-accent hover:bg-viz-accent-light" disabled={loading}>
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Resetting...</>) : 'Reset password'}
              </Button>
            </form>
          )}

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-viz-text-secondary">
              Remembered your password?{' '}
              <Link to="/auth" className="text-viz-accent hover:underline font-medium">Back to Sign in</Link>
            </p>
            <p className="text-viz-text-secondary">
              New to Viz?{' '}
              <Link to="/auth?mode=signup" className="text-viz-accent hover:underline font-medium">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
