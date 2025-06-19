import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const AVATAR_BUCKET = 'avatars';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    address: '',
    id: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          setProfile({
            full_name: data?.full_name || user.user_metadata?.full_name || '',
            email: data?.email || user.email || '',
            avatar_url: data?.avatar_url || '', // Only use uploaded avatar, not Google avatar here
            address: data?.address || '',
            id: data?.id || user.id,
          });
          setLoading(false);
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url, // Only save uploaded avatar
      address: profile.address,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, file, { upsert: true });
    if (uploadError) {
      setUploading(false);
      toast({ title: 'Upload error', description: uploadError.message, variant: 'destructive' });
      return;
    }
    // Get public URL
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    if (data?.publicUrl) {
      setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      toast({ title: 'Avatar updated', description: 'Your avatar image has been uploaded.' });
    }
    setUploading(false);
  };

  // Determine which avatar to show: uploaded > Google > fallback
  let avatarToShow = profile.avatar_url;
  if (!avatarToShow && user?.user_metadata?.avatar_url) {
    avatarToShow = user.user_metadata.avatar_url;
  }

  if (!user) {
    return <div className="p-8 text-center">Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black px-4">
      <div className="w-full max-w-md bg-white dark:bg-viz-medium rounded-xl shadow-lg p-8 border border-slate-200 dark:border-viz-light/20">
        <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            {avatarToShow ? (
              <img src={avatarToShow} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-2 border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 border text-4xl text-gray-500">
                {profile.full_name ? profile.full_name[0] : 'U'}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="mb-2">
              {uploading ? 'Uploading...' : 'Change Avatar'}
            </Button>
          </div>
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              disabled={loading || saving}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={loading || saving}
              placeholder="Your address"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={profile.email}
              disabled={true}
              placeholder="Your email"
            />
          </div>
          <div>
            <Label htmlFor="id">User ID</Label>
            <Input
              id="id"
              name="id"
              value={profile.id}
              disabled={true}
              placeholder="User ID"
            />
          </div>
          <Button type="submit" className="w-full bg-viz-accent hover:bg-viz-accent-light" disabled={loading || saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile; 