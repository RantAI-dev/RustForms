"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Shield, Bell, Trash2, AlertTriangle } from "lucide-react"
import { BlurOverlay } from "@/components/blur-overlay"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    submissionAlerts: true,
    weeklyReports: false,
    securityAlerts: true,
  })

  const handleProfileUpdate = () => {
    // TODO: Implement profile update
    console.log("Profile updated")
  }

  const handlePasswordChange = () => {
    // TODO: Implement password change
    console.log("Password changed")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400">Manage your account preferences and security</p>
      </div>

      {/* Profile Settings */}
      <BlurOverlay featureFlag="PROFILE_SETTINGS" variant="coming-soon">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-400">Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
            <Button onClick={handleProfileUpdate} className="bg-white text-black hover:bg-gray-200" disabled>
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </BlurOverlay>

      {/* Password Settings */}
      <BlurOverlay featureFlag="PASSWORD_CHANGE" variant="coming-soon">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Shield className="w-5 h-5 mr-2" />
              Change Password
            </CardTitle>
            <CardDescription className="text-gray-400">Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password" className="text-white">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={profile.currentPassword}
                onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="text-white">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={profile.newPassword}
                onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
            <Button onClick={handlePasswordChange} className="bg-white text-black hover:bg-gray-200" disabled>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </BlurOverlay>

      {/* Notification Settings */}
      <BlurOverlay featureFlag="NOTIFICATION_PREFERENCES" variant="coming-soon">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Bell className="w-5 h-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-gray-400">Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive form submissions via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                disabled
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Submission Alerts</Label>
                <p className="text-sm text-gray-400">Get notified immediately when forms are submitted</p>
              </div>
              <Switch
                checked={notifications.submissionAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, submissionAlerts: checked })}
                disabled
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Weekly Reports</Label>
                <p className="text-sm text-gray-400">Receive weekly summary of form activity</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                disabled
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Security Alerts</Label>
                <p className="text-sm text-gray-400">Get notified about security-related events</p>
              </div>
              <Switch
                checked={notifications.securityAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, securityAlerts: checked })}
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </BlurOverlay>

      {/* API Keys */}
      <BlurOverlay featureFlag="API_KEYS" variant="coming-soon">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">API Keys</CardTitle>
            <CardDescription className="text-gray-400">Manage your API keys for programmatic access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">API Key</p>
                  <code className="text-sm text-gray-400">rk_live_••••••••••••••••••••••••••••••••</code>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-900" disabled>
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-900" disabled>
                    Regenerate
                  </Button>
                </div>
              </div>
              <Button className="bg-white text-black hover:bg-gray-200" disabled>Generate New API Key</Button>
            </div>
          </CardContent>
        </Card>
      </BlurOverlay>

      {/* Danger Zone */}
      <Card className="border-red-800 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center text-red-400">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-gray-400">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-900 border-red-800 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Deleting your account will permanently remove all your forms, submissions, and data. This action cannot be
              undone.
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Delete Account</h4>
              <p className="text-sm text-gray-400">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
