# ImmoMatch Pro

ImmoMatch Pro is an AI-driven real estate matching platform for institutional brokers. It leverages advanced AI capabilities to discover clients, analyze properties, and match clients with suitable properties.

## Features

- **Client Management**: Comprehensive CRM for managing institutional clients
- **Property Management**: Detailed property listings with AI-powered analysis
- **AI-Powered Matching**: Intelligent matching of clients with properties
- **Client Discovery**: AI-driven discovery of potential institutional clients
- **Property Analysis**: In-depth AI analysis of properties
- **Dashboard Analytics**: Visual insights into your real estate business

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: Supabase
- **AI Integration**: OpenRouter API (supporting multiple AI models)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenRouter API account

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your Supabase and OpenRouter credentials
4. Start the development server:
   ```
   npm run dev
   ```

## Environment Setup

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
VITE_OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-opus-20240229
VITE_OPENROUTER_PROPERTY_ANALYSIS_MODEL=anthropic/claude-3-haiku-20240307
VITE_OPENROUTER_CLIENT_MATCHING_MODEL=openai/gpt-4-turbo
```

## Database Setup

The application uses Supabase as its database. The database schema includes the following tables:

- `clients`: For storing client information
- `properties`: For storing property listings
- `matches`: For storing client-property matches
- `ai_agents`: For configuring AI agents

You can set up these tables in your Supabase project using the SQL definitions in the `database.types.ts` file.

## AI Integration

The application uses OpenRouter API to access various AI models for different tasks:

- **Default Model**: Used for general tasks
- **Property Analysis Model**: Specialized for analyzing properties
- **Client Matching Model**: Optimized for matching clients with properties

You can configure which models to use in the `.env` file.

## Development

### Project Structure

- `src/components`: React components
- `src/contexts`: React context providers
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and type definitions
- `src/pages`: Page components
- `src/services`: Service classes for external APIs

### Adding New Features

1. Create new components in the appropriate directory
2. Update the routing in `App.tsx` if adding new pages
3. Add any new database tables to `database.types.ts`
4. Create custom hooks for data access if needed

## License

This project is proprietary and confidential.

## Contact

For support or inquiries, please contact the development team.
