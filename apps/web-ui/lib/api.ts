// API client for RustForms backend
import { z } from 'zod'

// Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Zod schemas for type safety
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const CreateFormSchema = z.object({
  name: z.string().min(1),
})

export const FormSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  secret: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const FormSubmissionSchema = z.record(z.string())

export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  form_id: z.string().uuid(),
  data: z.record(z.unknown()),
  ip_address: z.string(),
  created_at: z.string(),
})

// Types derived from schemas
export type LoginRequest = z.infer<typeof LoginSchema>
export type SignupRequest = z.infer<typeof SignupSchema>
export type CreateFormRequest = z.infer<typeof CreateFormSchema>
export type Form = z.infer<typeof FormSchema>
export type FormSubmission = z.infer<typeof FormSubmissionSchema>
export type Submission = z.infer<typeof SubmissionSchema>

export interface LoginResponse {
  token: string
}

// Custom error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Token management
const TOKEN_KEY = 'rustforms_token'

export const tokenManager = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },
  remove: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  },
}

// Base fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = tokenManager.get()

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    // Handle non-JSON responses (like plain text errors)
    const contentType = response.headers.get('content-type')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        typeof data === 'string' ? data : data.message || 'Request failed',
        response
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error occurred')
  }
}

// Authentication API
export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const validated = LoginSchema.parse(credentials)
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(validated),
    })
  },

  async signup(userData: SignupRequest): Promise<void> {
    const validated = SignupSchema.parse(userData)
    return apiRequest<void>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validated),
    })
  },

  logout(): void {
    tokenManager.remove()
  },
}

// Forms API
export const formsApi = {
  async getForms(): Promise<Form[]> {
    const forms = await apiRequest<Form[]>('/forms')
    return forms.map(form => FormSchema.parse(form))
  },

  async getForm(id: string): Promise<Form> {
    const form = await apiRequest<Form>(`/forms/${id}`)
    return FormSchema.parse(form)
  },

  async createForm(formData: CreateFormRequest): Promise<Form> {
    const validated = CreateFormSchema.parse(formData)
    const form = await apiRequest<Form>('/forms', {
      method: 'POST',
      body: JSON.stringify(validated),
    })
    return FormSchema.parse(form)
  },

  async deleteForm(id: string): Promise<void> {
    return apiRequest<void>(`/forms/${id}`, {
      method: 'DELETE',
    })
  },

  async getFormSubmissions(formId: string): Promise<Submission[]> {
    const submissions = await apiRequest<Submission[]>(`/forms/${formId}/submissions`)
    return submissions.map(submission => SubmissionSchema.parse(submission))
  },

  async deleteSubmission(submissionId: string): Promise<void> {
    return apiRequest<void>(`/submissions/${submissionId}`, {
      method: 'DELETE',
    })
  },

  async submitForm(secret: string, data: FormSubmission): Promise<void> {
    const validated = FormSubmissionSchema.parse(data)
    return apiRequest<void>(`/submit/${secret}`, {
      method: 'POST',
      body: JSON.stringify(validated),
    })
  },
}

// React Query / SWR compatible hooks helpers
export const apiQueryKeys = {
  forms: () => ['forms'] as const,
  form: (id: string) => ['forms', id] as const,
}

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return tokenManager.get() !== null
}

// Helper to handle auth redirects
export const requireAuth = (): boolean => {
  if (typeof window === 'undefined') return true // SSR
  
  if (!isAuthenticated()) {
    window.location.href = '/login'
    return false
  }
  return true
}
