"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Mail, Shield, Eye, AlertTriangle, Copy } from "lucide-react"
import { BlurOverlay } from "@/components/blur-overlay"

export default function OrganizationPage() {
  const [orgSettings, setOrgSettings] = useState({
    name: "Acme Corporation",
    customDomain: "forms.acme.com",
    ssoEnabled: false,
  })

  const [dnsRecords] = useState([
    { type: "TXT", name: "@", value: "v=spf1 include:rustforms.dev ~all", status: "verified" },
    { type: "CNAME", name: "rustforms._domainkey", value: "rustforms._domainkey.rustforms.dev", status: "pending" },
  ])

  const [auditLogs] = useState([
    { id: "1", user: "admin@acme.com", action: "Created form 'Contact Us'", timestamp: "2025-01-21T15:30:00Z" },
    { id: "2", user: "member@acme.com", action: "Exported submissions", timestamp: "2025-01-21T14:20:00Z" },
    { id: "3", user: "admin@acme.com", action: "Invited user viewer@acme.com", timestamp: "2025-01-21T13:10:00Z" },
  ])

  return (
    <BlurOverlay featureFlag="ORGANIZATION" variant="pro">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
            <p className="text-gray-400">Manage your organization&apos;s configuration and security</p>
          </div>
          <Badge variant="secondary" className="bg-gray-800 text-white">
            Pro Feature
          </Badge>
        </div>

      {/* Organization Details */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Building className="w-5 h-5 mr-2" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="org-name" className="text-white">
              Organization Name
            </Label>
            <Input
              id="org-name"
              value={orgSettings.name}
              onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>
          <Button className="bg-white text-black hover:bg-gray-200">Update Organization</Button>
        </CardContent>
      </Card>

      {/* Custom Email Domain */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Mail className="w-5 h-5 mr-2" />
            Custom Email Domain
            <Badge variant="secondary" className="ml-2 bg-gray-800 text-white">
              Pro Feature
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">Send form notifications from your own domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-domain" className="text-white">
              Domain
            </Label>
            <Input
              id="custom-domain"
              value={orgSettings.customDomain}
              onChange={(e) => setOrgSettings({ ...orgSettings, customDomain: e.target.value })}
              placeholder="forms.yourdomain.com"
              className="bg-gray-900 border-gray-700 text-white mt-1"
            />
          </div>

          <Alert className="bg-gray-900 border-gray-800">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-gray-300">
              Add the following DNS records to your domain provider to verify ownership and enable email sending.
            </AlertDescription>
          </Alert>

          <div className="border border-gray-800 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Value</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dnsRecords.map((record, index) => (
                  <TableRow key={index} className="border-gray-800">
                    <TableCell className="text-white font-mono">{record.type}</TableCell>
                    <TableCell className="text-white font-mono">{record.name}</TableCell>
                    <TableCell className="text-gray-300 font-mono max-w-xs truncate">{record.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={record.status === "verified" ? "default" : "secondary"}
                          className={
                            record.status === "verified" ? "bg-green-800 text-white" : "bg-yellow-800 text-white"
                          }
                        >
                          {record.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-900">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button className="bg-white text-black hover:bg-gray-200">Verify Domain</Button>
        </CardContent>
      </Card>

      {/* Single Sign-On */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Shield className="w-5 h-5 mr-2" />
            Single Sign-On (SSO)
            <Badge variant="secondary" className="ml-2 bg-gray-800 text-white">
              Enterprise Feature
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure SAML or OIDC for enterprise authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Enable SSO</Label>
              <p className="text-sm text-gray-400">Allow team members to sign in with your identity provider</p>
            </div>
            <Switch
              checked={orgSettings.ssoEnabled}
              onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, ssoEnabled: checked })}
              disabled
            />
          </div>

          <div className="space-y-4 opacity-50">
            <div>
              <Label htmlFor="sso-provider" className="text-white">
                Identity Provider
              </Label>
              <Input
                id="sso-provider"
                placeholder="https://your-idp.com/saml"
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="sso-certificate" className="text-white">
                X.509 Certificate
              </Label>
              <Textarea
                id="sso-certificate"
                placeholder="-----BEGIN CERTIFICATE-----"
                className="bg-gray-900 border-gray-700 text-white mt-1"
                disabled
              />
            </div>
          </div>

          <Alert className="bg-gray-900 border-gray-800">
            <Shield className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-gray-300">
              SSO configuration is available in our Enterprise plan. Contact sales for more information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Eye className="w-5 h-5 mr-2" />
            Audit Log
            <Badge variant="secondary" className="ml-2 bg-gray-800 text-white">
              Enterprise Feature
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Track all actions performed by organization members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-800 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">User</TableHead>
                  <TableHead className="text-gray-400">Action</TableHead>
                  <TableHead className="text-gray-400">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id} className="border-gray-800">
                    <TableCell className="text-white">{log.user}</TableCell>
                    <TableCell className="text-gray-300">{log.action}</TableCell>
                    <TableCell className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-center py-4">
            <Badge variant="secondary" className="bg-gray-800 text-white">
              Full audit logging available in Enterprise plan
            </Badge>
          </div>
        </CardContent>
      </Card>
      </div>
    </BlurOverlay>
  )
}
