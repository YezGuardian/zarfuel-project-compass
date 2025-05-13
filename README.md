# ZarFuel Project Compass

A project management application built with React, TypeScript, and Vite.

## Project Structure

```
src/
├── app/             # App-level components, layouts, and configuration  
├── components/      # Reusable UI components
│   ├── admin/       # Admin-specific components
│   ├── auth/        # Authentication-related components
│   ├── budget/      # Budget management components
│   ├── calendar/    # Calendar and scheduling components
│   ├── contacts/    # Contact management components
│   ├── dashboard/   # Dashboard-specific components
│   ├── documents/   # Document management components
│   ├── layout/      # Layout components (header, sidebar, etc.)
│   ├── notifications/ # Notification components
│   ├── providers/   # Context providers
│   ├── tasks/       # Task management components
│   └── ui/          # Base UI components (buttons, inputs, etc.)
├── contexts/        # React contexts for global state
├── data/            # Data models, mock data, and constants
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
├── lib/             # Utility libraries and shared code
├── pages/           # Page components
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Code Style Guidelines

1. **File Organization**
   - Group related files in appropriate directories
   - Keep component files focused on a single responsibility
   - Use index.ts files for cleaner imports

2. **Naming Conventions**
   - PascalCase for components and component files
   - camelCase for variables, functions, and instances
   - Use descriptive, intention-revealing names

3. **TypeScript Best Practices**
   - Define explicit types for props, state, and function parameters
   - Use interfaces for objects with methods, types for simple structures
   - Avoid using `any` type; prefer specific types or generics

4. **Component Structure**
   - Keep components small and focused
   - Extract complex logic into custom hooks
   - Use props destructuring for clarity

5. **Performance Considerations**
   - Memoize expensive calculations with useMemo
   - Optimize callback functions with useCallback
   - Use appropriate React keys for lists

## Development Workflow

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

5. Lint code:
```bash
npm run lint
```

# Welcome to your Lovable project

## Table of Contents

1. [Project Info](#project-info)
2. [Getting Started](#how-can-i-edit-this-code)
3. [Technologies](#what-technologies-are-used-for-this-project)
4. [Deployment](#how-can-i-deploy-this-project)
5. [Custom Domain](#can-i-connect-a-custom-domain-to-my-lovable-project)
6. [Meeting Invitation System](#meeting-invitation-system)
   - [Email Notifications](#email-notifications)
   - [In-App Notifications](#in-app-notifications)
   - [Setting Up Email Notifications](#setting-up-email-notifications)
   - [Production Email Integration](#production-email-integration)

## Project info

**URL**: https://lovable.dev/projects/a64c4fcb-179a-4eff-8f1d-55b9afb8e055

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a64c4fcb-179a-4eff-8f1d-55b9afb8e055) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a64c4fcb-179a-4eff-8f1d-55b9afb8e055) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Meeting Invitation System

The application includes a sophisticated meeting invitation system:

## Email Notifications

The system sends email invitations to meeting participants with accept/decline buttons. When deployed:

1. Email invitations include direct links to accept or decline the meeting
2. Clicking these links updates the participant's response in the database
3. The meeting organizer receives a notification about the participant's response

## In-App Notifications

The application also provides in-app notifications:

1. Meeting participants receive notifications when they're invited to a meeting
2. Meeting organizers receive notifications when participants accept or decline
3. All users can view notifications in the notification center

## Setting Up Email Notifications

To configure email notifications:

1. Deploy the Supabase Edge Functions:
   
   **For Linux/Mac:**
   ```bash
   # Navigate to the supabase directory
   cd supabase
   
   # Make the deployment script executable
   chmod +x deploy-functions.sh
   
   # Edit the script to include your project ID
   nano deploy-functions.sh
   
   # Run the deployment script
   ./deploy-functions.sh
   ```

   **For Windows:**
   ```bash
   # Navigate to the supabase directory
   cd supabase
   
   # Edit the batch file to include your project ID
   notepad deploy-functions.bat
   
   # Run the deployment script
   deploy-functions.bat
   ```

2. Set the APP_BASE_URL environment variable to your application's URL:
   ```bash
   supabase secrets set APP_BASE_URL="https://your-app-url.com" --project-ref your-project-id
   ```

## Production Email Integration

For production use, you'll need to integrate a proper email service. The current implementation only logs what would be sent. Follow these steps to implement a production email service:

### 1. Choose an Email Service Provider

Popular options include:
- [SendGrid](https://sendgrid.com/) - Good for high volume with reliable delivery
- [Mailgun](https://www.mailgun.com/) - Developer-friendly with good analytics
- [AWS SES](https://aws.amazon.com/ses/) - Cost-effective for high volume
- [Postmark](https://postmarkapp.com/) - Excellent delivery rates and analytics

### 2. Set Up Your Email Service

1. Create an account with your chosen provider
2. Set up domain verification (SPF, DKIM records)
3. Get your API key or SMTP credentials

### 3. Add Environment Variables

Add your email service credentials to Supabase:

```bash
# For SendGrid example
supabase secrets set EMAIL_SERVICE_API_KEY="your-api-key" --project-ref your-project-id
supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref your-project-id
supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref your-project-id
```

### 4. Follow the Detailed Integration Guide

For complete step-by-step instructions for each email provider, see the [Email Integration Guide](docs/email-integration-guide.md).
