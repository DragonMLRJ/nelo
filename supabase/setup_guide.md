# Supabase Configuration Guide

## 1. Google Authentication Setup

To enable "Sign in with Google", you need to set up a Google Cloud Project and configure Supabase.

### Step 1: Create Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Nelo Marketplace").
3. Select the project.

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in the App Information (App Name: "Nelo Marketplace", User Support Email, etc.).
4. Click **Save and Continue**.

### Step 3: Create Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3. Application type: **Web application**.
4. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://nzyuwfxghaujzzfjewze.supabase.co` (Your Supabase URL)
5. **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `https://nzyuwfxghaujzzfjewze.supabase.co/auth/v1/callback`
6. Click **Create**.
7. Copy the **Client ID** and **Client Secret**.

### Step 4: Configure Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/nzyuwfxghaujzzfjewze).
2. Navigate to **Authentication > Providers**.
3. Click on **Google**.
4. **Enable** Google provider.
5. Paste the **Client ID** and **Client Secret** from the previous step.
6. Click **Save**.

---

## 2. Email / SMTP Configuration

For production, you should use a custom SMTP server (like Resend, SendGrid, or AWS SES) to ensure emails are delivered. Supabase has a strict limit for their default email service.

### Step 1: Go to Email Settings
1. In Supabase Dashboard, go to **Project Settings > Authentication > SMTP Settings**.

### Step 2: Configure SMTP
Enable **Custom SMTP** and fill in your provider's details:
- **Sender Email**: `noreply@yourdomain.com`
- **Sender Name**: Nelo Marketplace
- **Host**: (e.g., `smtp.resend.com`)
- **Port**: `465` (SSL) or `587` (TLS)
- **Username**: (Your SMTP username)
- **Password**: (Your SMTP password)

### Step 3: Rate Limits & Templates
- Go to **Authentication > Rate Limits** to adjust if necessary.
- Go to **Authentication > Email Templates** to customize the "Confirm your Signup" email.
  - Ensure the `{{ .ConfirmationURL }}` is present in the links.
