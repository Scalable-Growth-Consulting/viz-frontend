import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface DUFASettingsModalProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  initialVisibility: boolean;
  initialFeatureFlags: { [key: string]: boolean };
  onSave: (visibility: boolean, featureFlags: { [key: string]: boolean }) => void;
}

export const DUFASettingsModal: React.FC<DUFASettingsModalProps> = ({
  open,
  onClose,
  isAdmin,
  initialVisibility,
  initialFeatureFlags,
  onSave,
}) => {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [featureFlags, setFeatureFlags] = useState<{ [key: string]: boolean }>({ ...initialFeatureFlags });
  const { toast } = useToast();

  const handleFeatureFlagToggle = (flag: string) => {
    setFeatureFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleSave = () => {
    onSave(visibility, featureFlags);
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated.',
    });
    onClose();
  };

  if (!isAdmin) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Only</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 dark:text-red-400 py-4">
            Only the admin can access DUFA settings.
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>DUFA Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Visibility Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Module Visibility</span>
              <Switch checked={visibility} onCheckedChange={setVisibility} />
            </div>
            <p className="text-sm text-slate-500">Toggle DUFA visibility for non-admin users.</p>
          </div>

          {/* Feature Flags */}
          <div>
            <div className="font-medium mb-2">Feature Flags</div>
            <div className="flex flex-col gap-3">
              {Object.keys(featureFlags).map((flag) => (
                <div key={flag} className="flex items-center justify-between">
                  <span>{flag}</span>
                  <Switch checked={featureFlags[flag]} onCheckedChange={() => handleFeatureFlagToggle(flag)} />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-1">Enable or disable beta features for selected users.</p>
          </div>

          {/* Access Logs (stub for future) */}
          <div>
            <div className="font-medium mb-2 flex items-center gap-2">Access Logs <Badge variant="secondary">Coming Soon</Badge></div>
            <p className="text-sm text-slate-500">View who accessed DUFA and when. (Feature in development)</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} variant="default">Save</Button>
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DUFASettingsModal;
