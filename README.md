# Chat MCQ Application

A full-stack web application that provides a ChatGPT-like interface with additional MCQ (Multiple Choice Question) capabilities.

## Features

- Chat interface similar to ChatGPT
- Real-time conversation with AI assistant
- Generate MCQs on any topic with the prompt "ask back some mcqs on a topic <topic>"
- Interactive MCQ interface with radio button selection
- Score calculation and detailed feedback on MCQ submissions
- Responsive design that works on desktop and mobile

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Context API for state management
- CSS for styling

### Backend
- Python with FastAPI
- Azure OpenAI integration for AI capabilities
- Pydantic for data validation
- Async request handling

## Project Structure

```
chat-mcq-app/
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── assets/         # Static assets and styles
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main App component
│   │   └── index.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Data models
│   │   ├── prompts/        # LLM prompts
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── tests/              # Unit and integration tests
│   ├── main.py             # Entry point
│   └── requirements.txt    # Python dependencies
│
└── docker-compose.yml      # Docker Compose configuration
```

## Setup Instructions

### Prerequisites
- Python 3.8+ for the backend
- Node.js 16+ for the frontend
- Docker and Docker Compose (optional, for containerized setup)

### Quick Start (Windows)

For convenience, startup scripts are provided to quickly set up and run both the frontend and backend:

#### Option 1: PowerShell (Recommended)
1. Right-click on `startup.ps1` and select "Run with PowerShell" or open PowerShell and run:
   ```powershell
   .\startup.ps1
   ```
   
2. This enhanced script will:
   - Check for Python and Node.js installations with version information
   - Set up a Python virtual environment for the backend
   - Install all backend dependencies
   - Start the backend server in the background
   - Install all frontend dependencies
   - Start the frontend development server in the background
   - Display real-time status and provide graceful shutdown with Ctrl+C

#### Option 2: Command Prompt
1. Simply run the batch script from the project root:
   ```bash
   startup.bat
   ```

3. Once started, access:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd chat-mcq-app/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Azure OpenAI credentials:
   Edit the `.env` file with your Azure OpenAI API credentials:
   ```
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_API_BASE=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_API_VERSION=2023-05-15
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at http://localhost:8000

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd chat-mcq-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

### Docker Setup (Alternative)

1. Make sure Docker and Docker Compose are installed on your system.

2. From the project root directory, run:
   ```bash
   docker-compose up
   ```
   This will start both the frontend and backend services.

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Start a conversation with the AI assistant
3. To get MCQs on a specific topic, type: "ask back some mcqs on a topic <topic>"
4. Answer the MCQs by selecting options and click "Submit" to see your score

## Development

- Frontend code can be modified in the `frontend/src` directory
- Backend code can be modified in the `backend/app` directory
- LLM prompts can be customized in the `backend/app/prompts` directory

## License

MIT