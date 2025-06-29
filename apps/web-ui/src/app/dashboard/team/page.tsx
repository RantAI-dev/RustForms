"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Trash2, Crown, User, Eye } from "lucide-react"
import { BlurOverlay } from "@/components/blur-overlay"

interface TeamMember {
  id: string
  email: string
  role: "Admin" | "Member" | "Viewer"
  status: "Active" | "Pending"
  joinedAt: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
      joinedAt: "2025-01-15",
    },
    {
      id: "2",
      email: "member@example.com",
      role: "Member",
      status: "Active",
      joinedAt: "2025-01-18",
    },
    {
      id: "3",
      email: "viewer@example.com",
      role: "Viewer",
      status: "Pending",
      joinedAt: "2025-01-20",
    },
  ])

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Member")

  const handleInvite = () => {
    // TODO: Implement invite logic
    setInviteDialogOpen(false)
    setInviteEmail("")
    setInviteRole("Member")
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "Member":
        return <User className="w-4 h-4 text-blue-500" />
      case "Viewer":
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  return (
    <BlurOverlay featureFlag="TEAM_MEMBERS" variant="pro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Team Members</h1>
            <p className="text-gray-400">Manage your team and their permissions</p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-white">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-900"
                >
                  Cancel
                </Button>
                <Button onClick={handleInvite} className="bg-white text-black hover:bg-gray-200">
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Users className="w-5 h-5 mr-2" />
              Team Members
              <Badge variant="secondary" className="ml-2 bg-gray-800 text-white">
                Pro Feature
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage team access and permissions for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-800 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Member</TableHead>
                    <TableHead className="text-gray-400">Role</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Joined</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} className="border-gray-800">
                      <TableCell className="text-white">{member.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <span className="text-white">{member.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.status === "Active" ? "default" : "secondary"}
                          className={member.status === "Active" ? "bg-green-800 text-white" : "bg-gray-800 text-white"}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select defaultValue={member.role}>
                            <SelectTrigger className="w-24 bg-gray-900 border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Member">Member</SelectItem>
                              <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-900">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Info */}
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Role Permissions</CardTitle>
            <CardDescription className="text-gray-400">Understanding what each role can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-white">Admin</span>
                </div>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Manage all forms</li>
                  <li>• Invite/remove members</li>
                  <li>• Billing access</li>
                  <li>• Organization settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-white">Member</span>
                </div>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Create/edit forms</li>
                  <li>• View submissions</li>
                  <li>• Export data</li>
                  <li>• Basic settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-white">Viewer</span>
                </div>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• View forms</li>
                  <li>• View submissions</li>
                  <li>• Export data</li>
                  <li>• Read-only access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BlurOverlay>
  )
}
