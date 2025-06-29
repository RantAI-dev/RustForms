"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Copy,
  Code,
  Mail,
  Settings,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Filter,
  // Loader2,
} from "lucide-react"
import { DeleteFormDialog } from "@/components/delete-form-dialog"
import { useForm, useFormSubmissions } from "@/hooks/use-forms"
import { withAuth } from "@/lib/auth-context"
import { BlurOverlay } from "@/components/blur-overlay"

function FormDetailPage() {
  const params = useParams()
  const formId = params.id as string
  
  const { form, loading: formLoading } = useForm(formId)
  const { submissions, deleteSubmission } = useFormSubmissions(formId)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await deleteSubmission(submissionId)
    } catch (error) {
      console.error('Failed to delete submission:', error)
    }
  }

  const endpointUrl = form ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/forms/${form.secret}` : ""
  const htmlExample = `<form action="${endpointUrl}" method="POST">
  <label for="email">Your Email:</label>
  <input type="email" name="email" required>

  <label for="message">Message:</label>
  <textarea name="message" required></textarea>

  <button type="submit">Send</button>
</form>`

  if (formLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-800 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2 text-white">Form not found</h2>
        <p className="text-gray-400 mb-4">The form you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Link href="/dashboard">
          <Button className="bg-white text-black hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{form.name}</h1>
            <p className="text-gray-400">Created on {new Date(form.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-gray-800 text-white">
          Active
        </Badge>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="setup" className="text-white data-[state=active]:bg-gray-800">
            Setup
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-white data-[state=active]:bg-gray-800">
            Submissions ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-white data-[state=active]:bg-gray-800">
            Settings
            <Badge variant="secondary" className="ml-2 bg-gray-700 text-xs">
              Coming Soon
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {/* How to Use Section */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Code className="w-5 h-5 mr-2" />
                How to Use This Form
              </CardTitle>
              <CardDescription className="text-gray-400">
                Follow these steps to integrate your form with any website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">1. Your Form Endpoint</h4>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-gray-900 p-3 rounded border border-gray-800 text-gray-300">
                    {endpointUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(endpointUrl)}
                    className="border-gray-700 text-white hover:bg-gray-900"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white">2. Example HTML Form</h4>
                <div className="relative">
                  <pre className="text-sm bg-gray-900 p-4 rounded border border-gray-800 overflow-x-auto text-gray-300">
                    <code>{htmlExample}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 border-gray-700 text-white hover:bg-gray-900"
                    onClick={() => copyToClipboard(htmlExample)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Alert className="bg-gray-900 border-gray-800">
                <Mail className="h-4 w-4 text-white" />
                <AlertDescription className="text-gray-300">
                  All form submissions will be sent directly to your email address. Make sure to check your spam folder
                  if you don&apos;t receive them.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Submissions</CardTitle>
              <CardDescription className="text-gray-400">View and manage form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search submissions..."
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Submissions Table */}
              <div className="border border-gray-800 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Email</TableHead>
                      <TableHead className="text-gray-400">Message</TableHead>
                      <TableHead className="text-gray-400">IP Address</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id} className="border-gray-800">
                        <TableCell className="text-white">
                          {typeof submission.data === 'object' && submission.data && 'email' in submission.data 
                            ? String(submission.data.email) 
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {typeof submission.data === 'object' && submission.data && 'message' in submission.data 
                            ? String(submission.data.message) 
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-400">{submission.ip_address}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-700 text-white hover:bg-gray-900"
                            onClick={() => handleDeleteSubmission(submission.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {submissions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No submissions yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Submissions will appear here once people start using your form
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* General Settings */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Settings className="w-5 h-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BlurOverlay featureFlag="FORM_NAME_UPDATE" variant="coming-soon">
                <div>
                  <Label htmlFor="form-name" className="text-white">
                    Form Name
                  </Label>
                  <Input id="form-name" value={form.name} className="bg-gray-900 border-gray-700 text-white mt-1" />
                </div>
              </BlurOverlay>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BlurOverlay featureFlag="MULTIPLE_EMAIL_NOTIFICATIONS" variant="coming-soon">
                <div>
                  <Label htmlFor="recipient-emails" className="text-white">
                    Recipient Email(s)
                  </Label>
                  <Input
                    id="recipient-emails"
                    placeholder="user@example.com, admin@example.com"
                    className="bg-gray-900 border-gray-700 text-white mt-1"
                  />
                </div>
              </BlurOverlay>

              <div className="space-y-4 p-4 border border-gray-800 rounded-lg">
                <BlurOverlay featureFlag="AUTO_RESPONSE_EMAIL" variant="pro">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Auto-response Email</Label>
                      <p className="text-sm text-gray-400">Send confirmation email to form submitters</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Badge variant="secondary" className="bg-gray-800 text-xs">
                        Pro
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="auto-response-subject" className="text-white">
                      Subject
                    </Label>
                    <Input
                      id="auto-response-subject"
                      placeholder="Thank you for your submission"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="auto-response-body" className="text-white">
                      Message
                    </Label>
                    <Textarea
                      id="auto-response-body"
                      placeholder="We've received your message and will get back to you soon."
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                      disabled
                    />
                  </div>
                </BlurOverlay>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="allowed-domains" className="text-white">
                  Allowed Domains
                </Label>
                <Textarea
                  id="allowed-domains"
                  placeholder="example.com&#10;mysite.org"
                  className="bg-gray-900 border-gray-700 text-white mt-1"
                />
                <p className="text-sm text-gray-400 mt-1">One domain per line. Leave empty to allow all domains.</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Rate Limiting</Label>
                  <p className="text-sm text-gray-400">Limit submissions per minute</p>
                </div>
                <Input type="number" placeholder="10" className="w-20 bg-gray-900 border-gray-700 text-white" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">CAPTCHA Protection</Label>
                  <p className="text-sm text-gray-400">Require CAPTCHA verification</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Post-Submission Settings */}
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Post-Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 border border-gray-800 rounded-lg">
                <BlurOverlay featureFlag="CUSTOM_REDIRECTS" variant="pro">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Custom Redirects</Label>
                    <Badge variant="secondary" className="bg-gray-800 text-xs">
                      Pro
                    </Badge>
                  </div>
                  <div>
                    <Label htmlFor="success-url" className="text-white">
                      Success URL
                    </Label>
                    <Input
                      id="success-url"
                      placeholder="https://example.com/thank-you"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="error-url" className="text-white">
                      Error URL
                    </Label>
                    <Input
                      id="error-url"
                      placeholder="https://example.com/error"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                      disabled
                    />
                  </div>
                </BlurOverlay>
              </div>
            </CardContent>
          </Card>

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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Delete Form</h4>
                  <p className="text-sm text-gray-400">
                    Permanently delete this form and its endpoint. This cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <BlurOverlay featureFlag="FORM_SETTINGS" variant="coming-soon" label="Coming Soon">
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Settings className="w-5 h-5 mr-2" />
                  Form Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Advanced configuration options for your form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form Name & Description */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="form-name" className="text-white">
                      Form Name
                    </Label>
                    <Input
                      id="form-name"
                      placeholder="Contact Form"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-description" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="form-description"
                      placeholder="A brief description of what this form is for"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                    />
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Notification Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-400">Receive email when form is submitted</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Real-time Alerts</Label>
                      <p className="text-sm text-gray-400">Get instant notifications</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                {/* Webhook Settings */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Webhook Settings</h4>
                  <div>
                    <Label htmlFor="webhook-url" className="text-white">
                      Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-app.com/webhook"
                      className="bg-gray-900 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Webhooks</Label>
                      <p className="text-sm text-gray-400">Send form data to external services</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Advanced Options</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Store Submissions</Label>
                      <p className="text-sm text-gray-400">Keep submissions in database</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Data Encryption</Label>
                      <p className="text-sm text-gray-400">Encrypt sensitive form data</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurOverlay>
        </TabsContent>
      </Tabs>

      <DeleteFormDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        form={form} 
      />
    </div>
  )
}

export default withAuth(FormDetailPage)
