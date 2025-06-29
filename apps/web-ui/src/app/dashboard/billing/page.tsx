"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Zap, CheckCircle } from "lucide-react"
import { BlurOverlay } from "@/components/blur-overlay"

export default function BillingPage() {
  const [currentPlan] = useState("Pro")
  const [usage] = useState({
    submissions: 750,
    submissionsLimit: 10000,
    forms: 12,
    formsLimit: 100,
    teamMembers: 3,
    teamMembersLimit: 10,
  })

  const invoices = [
    { id: "1", date: "2025-01-01", amount: "$9.00", status: "Paid", downloadUrl: "#" },
    { id: "2", date: "2024-12-01", amount: "$9.00", status: "Paid", downloadUrl: "#" },
    { id: "3", date: "2024-11-01", amount: "$9.00", status: "Paid", downloadUrl: "#" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
          <p className="text-gray-400">Manage your subscription and view usage</p>
        </div>
        <Button className="bg-white text-black hover:bg-gray-200">
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

      {/* Current Plan */}
      <BlurOverlay featureFlag="BILLING" variant="pro">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <CreditCard className="w-5 h-5 mr-2" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{currentPlan} Plan</h3>
                <p className="text-gray-400">$9.00 per month</p>
              </div>
              <Badge className="bg-green-800 text-white">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </BlurOverlay>

      {/* Usage Metrics */}
      <BlurOverlay featureFlag="BILLING" variant="pro">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Monthly Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Used</span>
                  <span className="text-white">
                    {usage.submissions.toLocaleString()} / {usage.submissionsLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={(usage.submissions / usage.submissionsLimit) * 100} className="bg-gray-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Used</span>
                  <span className="text-white">
                    {usage.forms} / {usage.formsLimit}
                  </span>
                </div>
                <Progress value={(usage.forms / usage.formsLimit) * 100} className="bg-gray-800" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Used</span>
                  <span className="text-white">
                    {usage.teamMembers} / {usage.teamMembersLimit}
                  </span>
                </div>
                <Progress value={(usage.teamMembers / usage.teamMembersLimit) * 100} className="bg-gray-800" />
              </div>
            </CardContent>
          </Card>
        </div>
      </BlurOverlay>

      {/* Available Plans */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Available Plans</CardTitle>
          <CardDescription className="text-gray-400">Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border border-gray-800 rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white">Free</h3>
                <div className="text-3xl font-bold text-white mt-2">$0</div>
                <p className="text-gray-400">Perfect for personal projects</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  100 submissions/month
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />5 forms
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Email notifications
                </li>
              </ul>
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-900">
                Current Plan
              </Button>
            </div>

            {/* Pro Plan */}
            <BlurOverlay featureFlag="BILLING" variant="pro">
              <div className="border border-white rounded-lg p-6 relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white text-black">Popular</Badge>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  <div className="text-3xl font-bold text-white mt-2">
                    $9<span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <p className="text-gray-400">For growing businesses</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    10,000 submissions/month
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    100 forms
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Team collaboration
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Custom redirects
                  </li>
                </ul>
                <Button className="w-full bg-white text-black hover:bg-gray-200">Current Plan</Button>
              </div>
            </BlurOverlay>

            {/* Enterprise Plan */}
            <BlurOverlay featureFlag="ENTERPRISE_PLAN" variant="coming-soon" label="Coming Soon">
              <div className="border border-gray-800 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white">Enterprise</h3>
                  <div className="text-3xl font-bold text-white mt-2">Custom</div>
                  <p className="text-gray-400">For large organizations</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Unlimited submissions
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Unlimited forms
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    SSO integration
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Audit logs
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-900">
                  Contact Sales
                </Button>
              </div>
            </BlurOverlay>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <BlurOverlay featureFlag="BILLING" variant="pro">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white">•••• •••• •••• 4242</p>
                  <p className="text-gray-400 text-sm">Expires 12/26</p>
                </div>
              </div>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </BlurOverlay>

      {/* Invoice History */}
      <BlurOverlay featureFlag="BILLING" variant="pro">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-800 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-gray-800">
                      <TableCell className="text-white">{invoice.date}</TableCell>
                      <TableCell className="text-white">{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-800 text-white">{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="border-gray-700 text-white hover:bg-gray-900">
                          <Download className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </BlurOverlay>
    </div>
  )
}
