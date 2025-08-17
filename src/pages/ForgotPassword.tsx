import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetErrors, setResetErrors] = useState<{ password?: string; confirm?: string }>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  // You will need to implement sendOtpToEmail and verifyOtp backend logic

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/functions/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        setStep('verify');
        toast({
          title: 'OTP Sent',
          description: 'A 6-digit OTP has been sent to your email.',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send OTP.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to send OTP.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/functions/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        toast({
          title: 'OTP Verified',
          description: 'You may now reset your password.',
        });
        setStep('reset');
      } else {
        toast({
          title: 'Invalid OTP',
          description: data.error || 'The OTP you entered is incorrect.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to verify OTP.',
        variant: 'destructive',
      });
    }
  };

  const validateResetPassword = () => {
    const errors: { password?: string; confirm?: string } = {};
    if (!newPassword) {
      errors.password = 'Password is required.';
    } else if (
      newPassword.length < 6 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    ) {
      errors.password = 'Password must be at least 6 characters and include upper, lower, number, and special character.';
    }
    if (newPassword !== confirmNewPassword) {
      errors.confirm = 'Passwords do not match.';
    }
    setResetErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetPassword()) return;
    setLoading(true);
    try {
      const res = await fetch('/functions/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        toast({
          title: 'Password Reset Successful',
          description: 'You can now sign in with your new password.',
        });
        setTimeout(() => {
          navigate('/auth');
        }, 1500);
        setStep('request');
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setResetErrors({});
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to reset password.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to reset password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black px-4">
      <div className="w-full max-w-md bg-white dark:bg-viz-medium rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        )}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter 6-digit OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                maxLength={6}
                minLength={6}
                pattern="[0-9]{6}"
                placeholder="------"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        )}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password"
                disabled={loading}
              />
              {resetErrors.password && (
                <p className="text-red-500 text-xs mt-1">{resetErrors.password}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                disabled={loading}
              />
              {resetErrors.confirm && (
                <p className="text-red-500 text-xs mt-1">{resetErrors.confirm}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
