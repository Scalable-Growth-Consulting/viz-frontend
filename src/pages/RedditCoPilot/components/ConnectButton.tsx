import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';

interface ConnectButtonProps {
  isConnected?: boolean;
  isLoading?: boolean;
  redditHandle?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({
  isConnected = false,
  isLoading = false,
  redditHandle,
  onConnect,
  onDisconnect,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white ${className}`}
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && redditHandle) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Connected as u/{redditHandle}
        </div>
        {onDisconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Disconnect
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onConnect}
      className={`bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white ${className}`}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Connect Reddit
    </Button>
  );
};

export default ConnectButton;
