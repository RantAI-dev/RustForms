"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, ExternalLink, Calendar } from "lucide-react"
import { CreateFormDialog } from "@/components/create-form-dialog"
import { useForms } from "@/hooks/use-forms"
import { withAuth } from "@/lib/auth-context"

function DashboardPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { forms, loading, createForm, refreshForms } = useForms()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleCreateForm = async (name: string) => {
    await createForm({ name })
    await refreshForms()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Forms</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-black border-gray-800">
              <CardHeader>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-800 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Forms</h1>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-white text-black hover:bg-gray-200">
          <Plus className="w-4 h-4 mr-2" />
          Create New Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center py-12 bg-black border-gray-800">
          <CardContent>
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">No forms yet</h3>
            <p className="text-gray-400 mb-4">
              You haven&apos;t created any forms yet. Get started by creating your first one!
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-white text-black hover:bg-gray-200">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="truncate">{form.name}</span>
                  <Badge variant="secondary" className="ml-2 bg-gray-800 text-white">
                    Active
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created on {formatDate(form.created_at)}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1 text-white">Endpoint URL:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-gray-900 p-2 rounded truncate text-gray-300">
                      https://api.rustforms.dev/api/submit/{form.secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`https://api.rustforms.dev/api/submit/${form.secret}`)}
                      className="border-gray-700 text-white hover:bg-gray-900"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Link href={`/dashboard/forms/${form.id}`}>
                  <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-900">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onFormCreated={handleCreateForm} />
    </div>
  )
}

export default withAuth(DashboardPage)
