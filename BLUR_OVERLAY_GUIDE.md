# Feature Flags - Blur Overlay Control

This document explains how to easily enable or disable the blur overlay for coming soon features and pro version content.

## Quick Start

To **remove blur** from any feature, edit `/lib/feature-flags.ts` and set the corresponding flag to `false`:

```typescript
export const FEATURE_FLAGS = {
  // Pro features
  BILLING: false,           // Set to false to remove blur from billing page
  TEAM_MEMBERS: false,      // Set to false to remove blur from team page
  ORGANIZATION: false,      // Set to false to remove blur from organization page
  
  // Coming soon features
  ENTERPRISE_PLAN: false,   // Set to false to show enterprise plan
  // ... other flags
} as const
```

## Feature Flag Reference

### Pro Features
- `BILLING` - Controls billing page, payment methods, and invoices
- `TEAM_MEMBERS` - Controls team collaboration features
- `ORGANIZATION` - Controls organization settings, SSO, and audit logs

### Coming Soon Features
- `ENTERPRISE_PLAN` - Controls enterprise pricing tier
- `ADVANCED_ANALYTICS` - Controls advanced analytics features
- `SSO_INTEGRATION` - Controls SSO integration features
- `AUDIT_LOGS` - Controls audit logging features
- `CUSTOM_DOMAINS` - Controls custom domain features

## How It Works

1. **BlurOverlay Component**: Wraps content that should be hidden/blurred
2. **Feature Flags**: Control whether content is blurred or visible
3. **Sidebar Badges**: "Pro" badges are automatically hidden when features are enabled

## Files Modified

- `/lib/feature-flags.ts` - Main configuration file
- `/components/blur-overlay.tsx` - Blur overlay component
- `/src/app/dashboard/billing/page.tsx` - Billing page with blur overlays
- `/src/app/dashboard/team/page.tsx` - Team page with blur overlay
- `/src/app/dashboard/organization/page.tsx` - Organization page with blur overlay
- `/src/app/dashboard/layout.tsx` - Sidebar with conditional badges

## Example Usage

```tsx
// Using feature flag (recommended)
<BlurOverlay featureFlag="BILLING" variant="pro">
  <YourContent />
</BlurOverlay>

// Manual control
<BlurOverlay isBlurred={true} variant="coming-soon" label="Coming Q2 2025">
  <YourContent />
</BlurOverlay>
```

To unblur all features at once, you can run:
```bash
# This will set all flags to false (features visible)
sed -i 's/: true/: false/g' lib/feature-flags.ts
```
