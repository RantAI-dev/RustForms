"use client"

import { useState, useEffect, useCallback } from 'react'
import { formsApi, type Form, type CreateFormRequest, type Submission, ApiError } from '@/lib/api'

export interface UseFormsReturn {
  forms: Form[]
  loading: boolean
  error: string | null
  createForm: (formData: CreateFormRequest) => Promise<Form>
  refreshForms: () => Promise<void>
}

export function useForms(): UseFormsReturn {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedForms = await formsApi.getForms()
      setForms(fetchedForms)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch forms'
      setError(errorMessage)
      console.error('Failed to fetch forms:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createForm = useCallback(async (formData: CreateFormRequest): Promise<Form> => {
    try {
      const newForm = await formsApi.createForm(formData)
      setForms(prev => [newForm, ...prev])
      return newForm
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create form'
      setError(errorMessage)
      throw err
    }
  }, [])

  const refreshForms = useCallback(async () => {
    await fetchForms()
  }, [fetchForms])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  return {
    forms,
    loading,
    error,
    createForm,
    refreshForms,
  }
}

export interface UseFormReturn {
  form: Form | null
  loading: boolean
  error: string | null
  refreshForm: () => Promise<void>
  deleteForm: () => Promise<void>
}

export function useForm(formId: string): UseFormReturn {
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = useCallback(async () => {
    if (!formId) return
    
    try {
      setLoading(true)
      setError(null)
      const fetchedForm = await formsApi.getForm(formId)
      setForm(fetchedForm)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch form'
      setError(errorMessage)
      console.error('Failed to fetch form:', err)
    } finally {
      setLoading(false)
    }
  }, [formId])

  const deleteForm = useCallback(async () => {
    if (!formId) return
    
    try {
      await formsApi.deleteForm(formId)
      setForm(null)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete form'
      setError(errorMessage)
      throw err
    }
  }, [formId])

  const refreshForm = useCallback(async () => {
    await fetchForm()
  }, [fetchForm])

  useEffect(() => {
    fetchForm()
  }, [fetchForm])

  return {
    form,
    loading,
    error,
    refreshForm,
    deleteForm,
  }
}

export interface UseFormSubmissionsReturn {
  submissions: Submission[]
  loading: boolean
  error: string | null
  refreshSubmissions: () => Promise<void>
  deleteSubmission: (submissionId: string) => Promise<void>
}

export function useFormSubmissions(formId: string): UseFormSubmissionsReturn {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    if (!formId) return
    
    try {
      setLoading(true)
      setError(null)
      const fetchedSubmissions = await formsApi.getFormSubmissions(formId)
      setSubmissions(fetchedSubmissions)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to fetch submissions'
      setError(errorMessage)
      console.error('Failed to fetch submissions:', err)
    } finally {
      setLoading(false)
    }
  }, [formId])

  const deleteSubmission = useCallback(async (submissionId: string) => {
    try {
      await formsApi.deleteSubmission(submissionId)
      setSubmissions(prev => prev.filter(s => s.id !== submissionId))
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete submission'
      setError(errorMessage)
      throw err
    }
  }, [])

  const refreshSubmissions = useCallback(async () => {
    await fetchSubmissions()
  }, [fetchSubmissions])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  return {
    submissions,
    loading,
    error,
    refreshSubmissions,
    deleteSubmission,
  }
}
