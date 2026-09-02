'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserIcon } from '@/components/ui/svgs/icons';
import { updateProfile, updatePassword } from '@/actions/user';
import type { IUser } from '@/types';

export function UpdateProfile({ user }: { user: IUser }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name || '');
  const [imagePreview, setImagePreview] = useState(user.image || '');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image size cannot exceed 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        image: imageBase64 || imagePreview,
      });

      if (res.success) {
        toast.success('Profile updated successfully');
        setImageBase64(null);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter current and new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal profile and account credentials.
        </p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your public profile photo and display name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Row */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt={user.name || 'User Avatar'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <UserIcon size={28} />
                )}
              </div>

              <div className="space-y-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Avatar
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  JPG, PNG or WEBP. Max 4MB.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label htmlFor="profile-name" required>
                Display Name
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                value={user.email}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">
                Email address is linked to your account provider ({user.provider}).
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" isLoading={isUpdatingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Security Card (Only shown for credentials accounts) */}
      {user.provider === 'credentials' ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Ensure your account is using a long, secure password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pass" required>
                  Current Password
                </Label>
                <Input
                  id="current-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pass" required>
                  New Password
                </Label>
                <Input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" required>
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" variant="outline" isLoading={isUpdatingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Account Authentication</CardTitle>
            <CardDescription>
              Your account is authenticated using <strong>{user.provider}</strong>. Password management is handled by your provider.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
