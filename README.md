# Beaver Brilliant: Flashcard App - Next.js App with Google Authentication and Storage Options

This application demonstrates user authentication with Google OAuth and provides two storage options for user data:

1. **Google Drive Storage** - Save data to the user's Google Drive (requires authentication)
2. **User Local Storage** - Save data directly to the user's computer (no authentication required)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- A Google Cloud project with OAuth credentials
#### For backend llm
- Python3 with uvicorn & fastapi
- Ollama

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-chars
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. Get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or use an existing one)
   - Navigate to "APIs & Services" > "Credentials"
   - Create OAuth client ID credentials
   - Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
   - Copy the Client ID and Client Secret to your `.env.local` file

### Development

Run the development server:

```bash
npm run dev
```
- To run the backend llm:
```bash
uvicorn app:app --reload
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Google Authentication**: Sign in with Google to access Google Drive storage
- **Storage Selection**: Choose between Google Drive and local browser storage
- **Persistent Storage Preference**: The app remembers your storage choice
- **Simple Demo Interface**: Test saving and loading data with different storage methods

## Technology Stack

- [Next.js](https://nextjs.org/)
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type safety
- Google Drive API for cloud storage
