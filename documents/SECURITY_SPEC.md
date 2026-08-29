# Security Specification

## Authentication
Use Supabase Auth:
- Email/password
- Google OAuth
- Session persistence
- Password reset

## Authorization
Enable Row Level Security on all user-owned tables.

Users can only access records where ownership matches `auth.uid()`.

## Secrets
Frontend may use public Supabase URL and anon key according to Supabase's security model.

Never expose:
- Gemini API key
- Supabase service-role key

Store secrets in Edge Function environment/secrets.

## Input Validation
Validate:
- Required fields
- Numeric ranges
- Allowed categories
- Allowed activity types
- Units
- Dates

## AI Security
- Send only necessary summarized data.
- Never expose secrets.
- Validate Gemini output against an explicit schema.
- Escape/encode AI-generated content before rendering.
- Never execute AI-generated HTML or scripts.

## Privacy
The application should clearly explain that emissions are estimates and should provide appropriate account/data-management controls.
