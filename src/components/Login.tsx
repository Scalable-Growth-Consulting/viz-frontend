
import React, { useState } from 'react';
import { MailIcon, GithubIcon, LogInIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, we would validate and authenticate
    // For now, we'll just call the onLogin callback
    onLogin();
  };

  const handleGoogleLogin = () => {
    // In a real application, we would implement Google OAuth
    onLogin();
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      <div className="bg-viz-dark p-4 rounded-lg mb-4">
        <span className="text-4xl font-bold tracking-tight text-white">V</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-viz-dark dark:text-white mb-2">Welcome to Viz</h1>
      <p className="text-sm text-viz-text-secondary mb-8">Business Intelligence AI</p>

      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-viz-dark dark:text-white">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-viz-dark dark:text-white">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-viz-accent hover:bg-viz-accent-light">
            <LogInIcon className="w-4 h-4 mr-2" />
            Sign in with Email
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <hr className="flex-grow border-gray-300 dark:border-viz-light" />
          <span className="px-4 text-sm text-viz-text-secondary">OR</span>
          <hr className="flex-grow border-gray-300 dark:border-viz-light" />
        </div>

        <Button 
          onClick={handleGoogleLogin} 
          variant="outline" 
          className="w-full border-gray-300 dark:border-viz-light"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </Button>

        <p className="mt-6 text-center text-sm text-viz-text-secondary">
          Don't have an account?{" "}
          <a href="#" className="font-medium text-viz-accent hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
