# Keyword Trend API Fixes

## Issues Fixed

### 1. ✅ Trends Analyzer - Query Parameters Removed
**Problem:** The `trendsStart` function was sending parameters both in the POST body AND as query parameters, which could confuse the AWS Lambda.

**Fix Applied:**
- Removed all query parameters from the `trendsStart` function
- Now sends ONLY the POST body with: `industry`, `keywords`, `job_id`, `s3_key`
- Updated in `src/services/keywordTrendApi.ts` line 434-446

**Before:**
```typescript
const raw = await doPost<unknown>(TRENDS_URL, {
  industry: payload.industry,
  keywords: payload.keywords,
  job_id: payload.job_id,
  s3_key: payload.s3_key,
}, {
  query: {
    industry: payload.industry,
    keywords: payload.keywords,
    keywords_csv: payload.keywords.join(','),
  },
  timeoutMs: TRENDS_TIMEOUT_MS,
});
```

**After:**
```typescript
const raw = await doPost<unknown>(TRENDS_URL, {
  industry: payload.industry,
  keywords: payload.keywords,
  job_id: payload.job_id,
  s3_key: payload.s3_key,
}, {
  timeoutMs: TRENDS_TIMEOUT_MS,
});
```

### 2. 🔍 Orchestrator - Enhanced Debugging Added
**Problem:** The `orchestrate` function is correctly sending `industry`, `usp`, and `key_services` in the POST body, but AWS Lambda is not receiving them.

**Client-Side Status:** ✅ CORRECT
- The client is sending the correct POST body structure
- No query parameters are being sent
- Body structure matches: `{ industry, usp, key_services }`

**Enhanced Logging Added:**
- Added detailed logging in `orchestrate` function to show exact payload
- Added detailed logging in `doPost` function to show full request details including URL, body string, and headers
- Enable debug logging by setting `localStorage.setItem('KEYWORD_TREND_DEBUG', 'true')` in browser console

**What to Check on AWS Lambda Side:**

#### API Gateway Configuration
1. **Content-Type Handling:**
   - Ensure API Gateway accepts `application/json` content type
   - Check if there's a body mapping template that might be interfering

2. **Integration Request:**
   - Verify the integration type (Lambda Proxy vs. Lambda Custom)
   - If using Lambda Proxy, the event should have `event.body` as a JSON string
   - If using Lambda Custom, check the body mapping template

3. **Timeout Settings:**
   - **API Gateway timeout:** Maximum 29 seconds (hard limit) ⚠️
   - **Lambda timeout:** Should be set to at least 120 seconds (2 minutes) for background processing
   - **CRITICAL:** Since API Gateway has a 29s limit, both endpoints MUST use async pattern:
     - ✅ Return immediately (within 5-10s) with `job_id` and status `PENDING`
     - ✅ Process the request in the background
     - ✅ Client polls using the `job_id` to get results
     - ❌ DO NOT wait for processing to complete before returning

4. **CORS Configuration:**
   - Ensure CORS is properly configured for POST requests
   - Check if preflight OPTIONS requests are handled

#### Lambda Function Code
1. **Event Parsing:**
   ```python
   # For Lambda Proxy integration:
   import json
   
   def lambda_handler(event, context):
       # The body comes as a JSON string
       body = json.loads(event['body'])
       industry = body.get('industry')
       usp = body.get('usp')
       key_services = body.get('key_services', [])
       
       # Log to CloudWatch for debugging
       print(f"Received: industry={industry}, usp={usp}, key_services={key_services}")
   ```

2. **Common Mistakes:**
   - Looking for parameters in `event['queryStringParameters']` instead of `event['body']`
   - Not parsing `event['body']` as JSON
   - Case sensitivity issues (e.g., `Industry` vs `industry`)

3. **CloudWatch Logs:**
   - Check CloudWatch logs to see what the Lambda is actually receiving
   - Add logging at the very start of the Lambda handler to log the entire event
   ```python
   print(f"Full event: {json.dumps(event)}")
   ```

## Testing the Fixes

### Enable Debug Logging
Open browser console and run:
```javascript
localStorage.setItem('KEYWORD_TREND_DEBUG', 'true');
```

Then refresh and try the Keyword Trend agent. You'll see detailed logs showing:
- Exact request body being sent
- Full URL (with or without query params)
- Request headers
- Response status and timing

### Expected Behavior After Fixes

#### Trends Analyzer
- Should send POST request to `/dev/trends`
- Body: `{ industry, keywords, job_id, s3_key }`
- No query parameters in URL
- Lambda should receive these in `event.body` (after JSON parsing)

#### Orchestrator
- Should send POST request to `/dev/orchestrate`
- Body: `{ industry, usp, key_services }`
- No query parameters in URL
- Lambda should receive these in `event.body` (after JSON parsing)

## Critical: Async Pattern Required for Both Endpoints

### The Problem
Both `/orchestrate` and `/trends` endpoints are timing out with 504 errors because:
- API Gateway has a **hard limit of 29 seconds**
- The Lambda functions are taking longer than 29s to process
- Even with increased client timeout (120s), API Gateway cuts the connection at 29s

### The Solution: Async Pattern

Both Lambda endpoints must implement the async pattern:

#### 1. `/orchestrate` Endpoint
**Current behavior (WRONG):**
```python
def lambda_handler(event, context):
    body = json.loads(event['body'])
    industry = body['industry']
    usp = body['usp']
    
    # This takes 30-60 seconds - TIMES OUT!
    keywords = scrape_and_process(industry, usp)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'status': 'COMPLETED',
            'keywords': keywords
        })
    }
```

**Required behavior (CORRECT):**
```python
import uuid
import boto3

dynamodb = boto3.resource('dynamodb')
jobs_table = dynamodb.Table('keyword_trend_jobs')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    industry = body['industry']
    usp = body['usp']
    key_services = body.get('key_services', [])
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Store job in DynamoDB with PENDING status
    jobs_table.put_item(Item={
        'job_id': job_id,
        'status': 'PENDING',
        'industry': industry,
        'usp': usp,
        'key_services': key_services,
        'created_at': int(time.time())
    })
    
    # Trigger async processing (Lambda, SQS, Step Functions, etc.)
    # Option 1: Invoke another Lambda asynchronously
    lambda_client = boto3.client('lambda')
    lambda_client.invoke(
        FunctionName='keyword-trend-processor',
        InvocationType='Event',  # Async
        Payload=json.dumps({'job_id': job_id, 'industry': industry, 'usp': usp})
    )
    
    # Return immediately with job_id
    return {
        'statusCode': 200,
        'body': json.dumps({
            'status': 'PENDING',
            'job_id': job_id,
            'message': 'Job started, poll for results'
        })
    }
```

#### 2. `/trends` Endpoint
**Same pattern:**
```python
def lambda_handler(event, context):
    body = json.loads(event['body'])
    
    # Check if this is a poll request (has job_id only)
    if 'job_id' in body and len(body) == 1:
        # This is a POLL request - return current status
        job_id = body['job_id']
        job = jobs_table.get_item(Key={'job_id': job_id})['Item']
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'status': job['status'],
                'job_id': job_id,
                'keywords': job.get('keywords'),
                'timeline': job.get('timeline'),
                'insights': job.get('insights')
            })
        }
    else:
        # This is a START request - create job and return immediately
        job_id = str(uuid.uuid4())
        
        jobs_table.put_item(Item={
            'job_id': job_id,
            'status': 'PENDING',
            'industry': body['industry'],
            'keywords': body['keywords'],
            'created_at': int(time.time())
        })
        
        # Trigger async processing
        lambda_client.invoke(
            FunctionName='trends-processor',
            InvocationType='Event',
            Payload=json.dumps({'job_id': job_id, 'industry': body['industry'], 'keywords': body['keywords']})
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'status': 'PENDING',
                'job_id': job_id
            })
        }
```

### Client-Side Flow (✅ Fully Implemented!)

The client is now fully set up to handle the async pattern for both endpoints:

1. **Orchestrate:**
   - ✅ Calls `/orchestrate` → gets `job_id` and status `PENDING`
   - ✅ Polls using `pollOrchestrateUntilComplete()` every 10s
   - ✅ Shows progress to user ("Extracting keywords...")
   - ✅ Handles COMPLETED/FAILED status
   - ✅ Falls back to manual keywords if orchestrate fails

2. **Trends:**
   - ✅ Calls `/trends` → gets `job_id` and status `PENDING`
   - ✅ Polls using `pollUntilComplete()` every 10s
   - ✅ Shows progress to user ("Processing data...")
   - ✅ Handles COMPLETED/FAILED status

### Next Steps

1. **Update Lambda functions** to use async pattern (return immediately with job_id)
2. **Create DynamoDB table** to store job status and results
3. **Create background processor Lambdas** to do the actual work
4. **Test the trends analyzer fix** - query params removed
5. **Check CloudWatch logs** to verify parameters are being received

## Environment Variables
Ensure these are set correctly in `.env`:
```
VITE_KEYWORD_TREND_ORCHESTRATE_URL=https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/orchestrate
VITE_KEYWORD_TREND_TRENDS_URL=https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/trends
VITE_KEYWORD_TREND_ORCHESTRATE_TIMEOUT_MS=120000  # Increased from 50s to 120s
VITE_KEYWORD_TREND_TRENDS_TIMEOUT_MS=50000
```

**Note:** The orchestrator timeout has been increased from 50 seconds to 120 seconds (2 minutes) to allow sufficient time for the Lambda function to process complex requests.

## Summary

✅ **Fixed:** Trends analyzer now sends only POST body (no query params)
✅ **Fixed:** Orchestrator timeout increased from 50s to 120s with exponential backoff retry logic
✅ **Fixed:** Added polling support for orchestrate endpoint (`orchestratePoll` and `pollOrchestrateUntilComplete`)
✅ **Fixed:** UI now polls for both orchestrate and trends endpoints
🔍 **Investigating:** Orchestrator client-side is correct; issue is likely on AWS Lambda/API Gateway side
📊 **Added:** Enhanced debug logging to help diagnose the orchestrator issue
⚠️ **Critical:** Both Lambda endpoints must return immediately with `job_id` and status `PENDING` (see below)

## Retry Logic

The orchestrator now implements intelligent retry logic:
- **3 retry attempts** for timeout and server errors (500, 502, 504)
- **Exponential backoff:** 2s → 4s → 8s between retries
- **Total maximum wait time:** 120s (initial) + 120s (retry 1) + 120s (retry 2) + 14s (backoff) = ~374s max
- **Enhanced logging** for each retry attempt with status codes and error messages
