# AWS Lambda SEO-GEO Analysis Integration Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying and configuring the AWS Lambda integration for SEO-GEO analysis in the Viz BI Agent application.

## 📋 Prerequisites

- AWS Account with API Gateway and Lambda access
- Supabase project with authentication enabled
- Node.js/React application with the Viz BI Agent codebase
- AWS CLI configured (optional but recommended)

## 🏗️ Architecture Overview

```
Frontend (React) → Supabase Auth → AWS API Gateway → AWS Lambda → SEO Analysis Results
```

### Components:
1. **Frontend**: React component with AWS Lambda integration
2. **Supabase**: Authentication and user management
3. **AWS API Gateway**: Secure API endpoint
4. **AWS Lambda**: SEO analysis processing

## 🔧 Backend Setup (AWS)

### Step 1: Deploy AWS Lambda Function

Your AWS Lambda function should handle the following endpoints:

```python
# Required endpoints for your Lambda function:
# POST /jobs - Create new SEO analysis job
# GET /jobs/{job_id} - Get job status and results
# DELETE /jobs/{job_id} - Cancel job (optional)
# GET /jobs - Get user job history (optional)
# GET /health - Health check endpoint
```

### Step 2: Configure API Gateway

1. Create a new API Gateway REST API
2. Set up CORS for your frontend domain
3. Configure authentication (Bearer token validation)
4. Deploy to a stage (e.g., 'dev', 'prod')

**Important**: Your deployed API URL should match:
```
https://nrl3k5c472.execute-api.ap-south-1.amazonaws.com/dev
```

### Step 3: Lambda Function Requirements

Your Lambda function should:

1. **Validate Bearer tokens** from Supabase
2. **Accept job creation** with these parameters:
   ```json
   {
     "url": "https://example.com",
     "primary_keyword": "optional keyword",
     "target_market": "optional location",
     "competitors": ["optional", "competitor", "urls"]
   }
   ```

3. **Return job status** in this format:
   ```json
   {
     "job_id": "unique-job-id",
     "status": "pending|queued|fetched|processing|completed|failed|error",
     "url": "analyzed url",
     "created_at": "ISO timestamp",
     "updated_at": "ISO timestamp",
     "progress": 0-100,
     "result": {
       // AnalysisResult object when completed
     },
     "error_message": "error details if failed"
   }
   ```

## 🔐 Supabase Configuration

### Step 1: Authentication Setup

Ensure your Supabase project has:

1. **User authentication** enabled
2. **JWT tokens** configured
3. **User management** tables

### Step 2: Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AWS Configuration (already configured in the code)
# AWS_API_BASE=https://nrl3k5c472.execute-api.ap-south-1.amazonaws.com/dev
```

## 🎯 Frontend Integration

### Step 1: Install Dependencies

The following dependencies are already included:

```json
{
  "@supabase/supabase-js": "^2.x.x",
  "framer-motion": "^10.x.x",
  "lucide-react": "^0.x.x"
}
```

### Step 2: Component Usage

The SEO-GEO checker now supports both cloud and local analysis:

```tsx
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';

// Use in your application
<SEOGeoChecker />
```

### Step 3: Features Available

✅ **Cloud AI Analysis (Recommended)**
- Uses AWS Lambda for comprehensive analysis
- Real-time progress tracking
- Advanced SEO & GEO insights
- Secure authentication via Supabase

✅ **Local Analysis (Fallback)**
- Client-side analysis for basic insights
- Works without AWS backend
- Supports both URL and raw HTML input

## 🔒 Security Features

### Authentication Flow

1. **User Authentication**: Supabase handles user login/signup
2. **Token Validation**: JWT tokens sent to AWS API Gateway
3. **Secure Communication**: HTTPS-only API calls
4. **User Context**: Automatic user ID headers for backend requests

### URL Validation

Frontend validates URLs before sending to backend:
- Must start with `http://` or `https://`
- Valid domain format required
- Public domains only (no localhost/IP addresses)

## 📊 Usage Examples

### Basic Usage

```typescript
// The component handles everything automatically
// Users just need to:
// 1. Enter a URL
// 2. Optionally add keywords, target market, competitors
// 3. Choose Cloud AI or Local analysis
// 4. Click "Launch Analysis"
```

### Advanced Configuration

```typescript
// The AWS service can be used directly:
import { awsLambdaService } from '@/modules/SEO/services/awsLambdaService';

// Create a job
const job = await awsLambdaService.createJob({
  url: 'https://example.com',
  primary_keyword: 'SEO tools',
  target_market: 'San Francisco, CA',
  competitors: ['https://competitor1.com', 'https://competitor2.com']
});

// Poll for completion
const result = await awsLambdaService.pollUntilComplete(
  job.job_id,
  (job) => console.log('Progress:', job.status)
);
```

## 🚨 Error Handling

The integration includes comprehensive error handling:

### Frontend Errors
- **URL Validation**: Real-time validation with user-friendly messages
- **Network Errors**: Automatic retry logic with exponential backoff
- **Authentication Errors**: Clear messages for login issues
- **Timeout Handling**: 5-minute timeout with progress indicators

### Backend Errors
- **Job Failures**: Detailed error messages from Lambda function
- **API Errors**: HTTP status code handling with descriptive messages
- **Rate Limiting**: Graceful handling of API limits

## 📈 Monitoring & Analytics

### Job Tracking
- **Job IDs**: Unique identifiers for each analysis
- **Progress Tracking**: Real-time status updates
- **History**: Optional job history retrieval
- **Performance Metrics**: Analysis completion times

### User Experience
- **Progress Bars**: Visual progress indicators
- **Status Messages**: Real-time status updates via toast notifications
- **Cancel Functionality**: Ability to cancel long-running analyses
- **Retry Logic**: One-click retry for failed analyses

## 🔧 Troubleshooting

### Common Issues

1. **"Authentication required" Error**
   - Ensure user is logged in to Supabase
   - Check Supabase configuration
   - Verify JWT token is being sent

2. **"AWS API is currently unavailable" Error**
   - Check AWS Lambda function is deployed
   - Verify API Gateway configuration
   - Test health endpoint directly

3. **"Invalid URL format" Error**
   - Ensure URL starts with http:// or https://
   - Check for valid domain format
   - Avoid localhost or IP addresses

4. **Analysis Timeout**
   - Default timeout is 5 minutes
   - Check Lambda function execution time
   - Verify complex pages don't exceed limits

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('seo-debug', 'true');
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] AWS Lambda function deployed and tested
- [ ] API Gateway configured with correct CORS
- [ ] Supabase authentication working
- [ ] Environment variables configured
- [ ] Frontend components tested locally

### Post-deployment
- [ ] Test end-to-end flow in production
- [ ] Verify authentication works
- [ ] Check error handling
- [ ] Monitor performance metrics
- [ ] Test with various website types

## 📞 Support

### Resources
- **AWS Lambda Documentation**: https://docs.aws.amazon.com/lambda/
- **Supabase Documentation**: https://supabase.com/docs
- **API Gateway CORS**: https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html

### Contact
For technical support or questions about this integration, please refer to the development team or create an issue in the project repository.

---

## 🎉 Success!

Once deployed, users will have access to:
- **World-class SEO analysis** powered by AWS Lambda
- **Real-time progress tracking** with professional UI
- **Comprehensive error handling** and user feedback
- **Secure authentication** via Supabase
- **Fallback local analysis** for reliability

The integration provides enterprise-grade SEO analysis capabilities while maintaining excellent user experience and security standards.
