// Feature flags for controlling blur overlay visibility
// Set to false to remove blur overlay from features

export const FEATURE_FLAGS = {
  // Pro features
  BILLING: true,
  TEAM_MEMBERS: true,
  ORGANIZATION: true,
  
  // Account settings features - not available in API
  PROFILE_SETTINGS: true,
  PASSWORD_CHANGE: true,
  NOTIFICATION_PREFERENCES: true,
  API_KEYS: true,
  
  // Form features - currently not available in API
  FORM_NAME_UPDATE: true,
  FORM_SETTINGS: true,
  AUTO_RESPONSE_EMAIL: true,
  CUSTOM_REDIRECTS: true,
  ADVANCED_SECURITY: true,
  MULTIPLE_EMAIL_NOTIFICATIONS: true,
  WEBHOOK_SECURITY: true,
  PASSWORD_PROTECTION: true,
  
  // Security features - not available in API
  SECURITY_SETTINGS: true,
  RATE_LIMITING: true,
  CAPTCHA_PROTECTION: true,
  ALLOWED_DOMAINS: true,
  
  // Coming soon features
  ENTERPRISE_PLAN: true,
  ADVANCED_ANALYTICS: true,
  SSO_INTEGRATION: true,
  AUDIT_LOGS: true,
  CUSTOM_DOMAINS: true,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS
