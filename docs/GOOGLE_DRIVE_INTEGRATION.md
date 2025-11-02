# Google Drive Integration for InsurAgent Pro

## Overview

InsurAgent Pro now includes comprehensive Google Drive integration that allows users to store, manage, and reference training materials, templates, and knowledge base documents directly from Google Drive. The AI Copilot automatically accesses these files to provide context-aware, personalized responses.

## Features

### 1. **OAuth2 Authentication**
- Secure Google Drive connection via OAuth 2.0
- Token refresh handling for persistent access
- User-specific Drive credentials
- Easy disconnect/reconnect functionality

### 2. **File Upload & Management**
- Upload files directly to Google Drive from the app
- Automatic file categorization (Scripts, Templates, Knowledge Base, Policies, Procedures, FAQs)
- Tag-based organization
- Full-text search across uploaded files
- File preview and metadata viewing

### 3. **Training Data Integration**
- Link Drive files to specific training categories
- Automatic text extraction and caching
- Usage tracking and analytics
- Most-used training materials dashboard

### 4. **AI Copilot Integration**
- Copilot automatically searches training data for relevant context
- References specific Drive files in responses
- Logs usage for continuous improvement
- Knowledge base promotion from frequently-used files

### 5. **Knowledge Base Management**
- Create structured knowledge entries from Drive files
- Keyword-based search and retrieval
- Relevance scoring for better results
- Public/private knowledge sharing

## Architecture

### Database Schema

The integration adds 7 new tables:

1. **google_drive_credentials** - OAuth tokens per user
2. **drive_file_references** - All uploaded/linked Drive files
3. **training_data_references** - Training categorization and metadata
4. **drive_file_content_cache** - Extracted text content for fast AI access
5. **copilot_knowledge_base** - Structured knowledge entries
6. **drive_folders** - Folder organization
7. **drive_file_access_log** - Audit trail for file access

### Backend Services

#### `googleDriveService.ts`
Core Google Drive API integration:
- OAuth client creation and token management
- File upload/download operations
- File search and listing
- Folder creation and management
- Text extraction from various file types
- Permission management

#### `copilotKnowledgeService.ts`
AI Copilot knowledge integration:
- Knowledge base search
- Training content retrieval by category
- Context building for AI responses
- Usage logging and analytics
- Smart search with relevance scoring

### API Endpoints

#### Google Auth Routes (`/api/auth/google`)
- `GET /authorize` - Initiate OAuth flow
- `GET /callback` - Handle OAuth callback
- `GET /status` - Check connection status
- `DELETE /disconnect` - Disconnect Google Drive
- `POST /refresh` - Refresh access token

#### Training Data Routes (`/api/training-data`)
- `POST /upload` - Upload file to Drive with categorization
- `GET /` - Get all training files (with filters)
- `GET /search` - Search training data
- `GET /:id` - Get specific training file with content
- `PUT /:id` - Update training metadata
- `DELETE /:id` - Delete training reference

#### Drive Files Routes
- `GET /drive/files` - List all Drive files (with sync option)

#### Knowledge Base Routes
- `POST /knowledge-base` - Create knowledge entry
- `GET /knowledge-base` - Get knowledge entries

#### Folders Routes
- `POST /folders` - Create Drive folder
- `GET /folders` - List folders

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3001/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)
   - Save the Client ID and Client Secret

### 2. Environment Configuration

Add to your `.env` file:

```env
# Google Drive & Calendar OAuth
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173
```

### 3. Database Migration

Run the SQL migration to create the necessary tables:

```bash
psql -U your_username -d insuragent_pro -f backend/src/db/add_google_drive_integration.sql
```

### 4. Install Dependencies

The required packages are already installed:
- `googleapis` - Google Drive API client
- `multer` - File upload handling
- `@types/multer` - TypeScript types

### 5. Backend Server

The routes are already registered in `server.ts`. Restart your backend:

```bash
cd backend
npm run dev
```

### 6. Frontend Integration

The TrainingData component is available at `components/TrainingData.tsx`. Add it to your app routing:

```typescript
import TrainingData from './components/TrainingData';

// In your router:
<Route path="/training-data" element={<TrainingData />} />
```

## Usage Guide

### Connecting Google Drive

1. Navigate to the Training Data page in the app
2. Click "Connect Google Drive"
3. You'll be redirected to Google's consent screen
4. Grant permissions for Drive access
5. You'll be redirected back to the app with connected status

### Uploading Training Files

1. Click "Upload File" button
2. Select a file from your computer
3. Choose a category (Scripts, Templates, Knowledge Base, etc.)
4. Add tags (comma-separated) for better organization
5. Add a description
6. Click "Upload"

The file will be:
- Uploaded to your Google Drive
- Indexed in the database
- Text extracted and cached (for supported file types)
- Available to the AI Copilot immediately

### AI Copilot Integration

The Copilot automatically:
1. Searches your training data when you ask questions
2. References relevant files in its responses
3. Extracts specific information from documents
4. Logs usage to track most helpful materials

Example queries:
- "What's our script for handling objections about price?"
- "Show me the template for new policy welcome emails"
- "What are the requirements for commercial auto policies?"

The Copilot will search your uploaded training materials and provide context-aware answers.

### Organizing Files

**Categories:**
- **Scripts**: Sales scripts, call scripts, objection handling
- **Templates**: Email templates, letter templates, proposal templates
- **Knowledge Base**: Product info, carrier guidelines, underwriting rules
- **Policies**: Company policies, procedures manuals
- **Procedures**: Step-by-step guides, workflows
- **FAQs**: Frequently asked questions, quick references

**Tags:**
- Use for cross-category organization
- Multiple tags per file
- Searchable and filterable

**Folders:**
- Create folders in Drive for better organization
- Link files to folders during upload
- Maintain folder structure

## Advanced Features

### Knowledge Base Promotion

Convert frequently-used training files into structured knowledge base entries:

```typescript
POST /api/training-data/knowledge-base
{
  "trainingDataRefId": "uuid-of-training-file",
  "title": "Objection Handling - Price",
  "keywords": ["objections", "price", "sales"],
  "relevanceScore": 1.5
}
```

### Smart Search

Search with advanced filters:

```typescript
GET /api/training-data/search?query=insurance&category=scripts&tags=sales,objections
```

### Bulk Sync

Synchronize all Drive files:

```typescript
GET /api/training-data/drive/files?sync=true
```

### Text Extraction

Supported file types for automatic text extraction:
- Google Docs → Plain text export
- Google Sheets → CSV export
- Plain text files → Direct read
- PDFs → Base64 (OCR placeholder for future)

## Security & Privacy

### Data Ownership
- Users own all their data
- Files remain in user's Google Drive
- Can disconnect and remove access anytime

### Access Control
- User-specific OAuth tokens
- Role-based access to knowledge base
- Audit logs for all file access
- Do-not-contact list compliance

### Token Management
- Automatic token refresh
- Secure token storage (encrypted in database recommended)
- Expiry tracking and renewal

## Troubleshooting

### Connection Issues

**Problem**: "Google Drive not connected" error
**Solution**: Click "Connect Google Drive" and re-authorize

**Problem**: "Token expired" error
**Solution**: Use the refresh endpoint or reconnect

### Upload Issues

**Problem**: File upload fails
**Solution**: Check file size limits, Drive quota, and permissions

**Problem**: Text extraction fails
**Solution**: Ensure file type is supported; check error logs

### Search Issues

**Problem**: Files not appearing in search
**Solution**: Ensure text extraction completed; check cache validity

## API Reference

### Authentication Flow

```javascript
// 1. Initiate OAuth
const response = await fetch('/api/auth/google/authorize', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { authUrl } = await response.json();

// 2. Redirect user
window.location.href = authUrl;

// 3. Handle callback (automatic)
// User redirected to /api/auth/google/callback
// Then redirected to frontend with success parameter
```

### File Upload

```javascript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('category', 'knowledge_base');
formData.append('tags', JSON.stringify(['insurance', 'policies']));
formData.append('description', 'Product guidelines for P&C');

const response = await fetch('/api/training-data/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Search Training Data

```javascript
const response = await fetch(
  '/api/training-data/search?query=objection%20handling',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const results = await response.json();
```

## Performance Optimization

### Caching
- Extracted text cached for 7 days
- Cache invalidation on file update
- Configurable cache duration per file type

### Rate Limiting
- Google Drive API has daily quotas
- Implement request batching for bulk operations
- Use cache to reduce API calls

### Indexing
- Database indexes on frequently searched fields
- Full-text search capabilities
- GIN indexes on tag arrays

## Future Enhancements

1. **OCR Integration** - Extract text from PDFs and images
2. **Version Control** - Track file versions and changes
3. **Collaborative Editing** - Real-time collaboration on Drive files
4. **Advanced Analytics** - Usage patterns, effectiveness scoring
5. **Auto-categorization** - AI-powered file categorization
6. **Batch Upload** - Upload multiple files at once
7. **Integration with Other Services** - Dropbox, OneDrive support
8. **Smart Recommendations** - Suggest relevant files based on context

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in `backend/logs/`
3. Check Google Cloud Console for API errors
4. Verify environment variables are set correctly

## License

This integration is part of InsurAgent Pro and follows the same licensing terms.
