"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface Form {
  id: string
  name: string
  secret: string
  created_at: string
}

interface DeleteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: Form
}

export function DeleteFormDialog({ open, onOpenChange, form }: DeleteFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError("")

    try {
      // TODO: Implement actual API call
      const response = await fetch(`/api/forms/${form.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || "Failed to delete form")
        return
      }

      // Success - redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Delete Form
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{form.name}"? This will permanently delete your form and its endpoint. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
