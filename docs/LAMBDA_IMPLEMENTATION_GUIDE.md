# Lambda Implementation Guide - Async Pattern

## Problem
You're getting **504 Gateway Timeout** because the Lambda is taking longer than API Gateway's 29-second hard limit.

## Solution
Implement the async pattern where Lambda returns immediately with a `job_id`, processes in the background, and client polls for results.

---

## Architecture Overview

```
Client → API Gateway → Lambda (returns job_id immediately)
                          ↓
                    Async Processor Lambda
                          ↓
                    DynamoDB (stores results)
                          ↑
Client polls ← API Gateway ← Lambda (reads from DynamoDB)
```

---

## Step 1: Create DynamoDB Table

**Table Name:** `keyword-trend-jobs`

**Primary Key:**
- Partition Key: `job_id` (String)

**Attributes:**
- `job_id` (String) - UUID
- `status` (String) - PENDING | PROCESSING | COMPLETED | FAILED
- `job_type` (String) - orchestrate | trends
- `created_at` (Number) - Unix timestamp
- `updated_at` (Number) - Unix timestamp
- `industry` (String)
- `usp` (String) - for orchestrate
- `key_services` (List) - for orchestrate
- `keywords` (List) - input for trends, output for orchestrate
- `timeline` (List) - for trends output
- `insights` (Map) - for trends output
- `error_message` (String) - if FAILED
- `s3_key` (String) - optional
- `query_id` (String) - optional

**TTL:** Set TTL on `created_at` + 7 days to auto-delete old jobs

---

## Step 2: Update `/orchestrate` Lambda

### Current (WRONG - Times Out):
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

### New (CORRECT - Returns Immediately):

**File: `orchestrate_handler.py`**
```python
import json
import uuid
import time
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda')
jobs_table = dynamodb.Table('keyword-trend-jobs')

def lambda_handler(event, context):
    """
    Main orchestrate endpoint handler.
    Returns immediately with job_id, triggers async processing.
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Check if this is a POLL request (has only job_id)
        if 'job_id' in body and len(body) == 1:
            return handle_poll(body['job_id'])
        
        # This is a START request
        return handle_start(body)
        
    except Exception as e:
        print(f"Error in orchestrate handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'status': 'FAILED',
                'message': f'Internal server error: {str(e)}'
            })
        }

def handle_start(body):
    """Handle orchestrate START request"""
    # Extract parameters
    industry = body.get('industry')
    usp = body.get('usp')
    key_services = body.get('key_services', [])
    
    # Validate required fields
    if not industry or not usp:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'status': 'FAILED',
                'message': 'Missing required fields: industry and usp'
            })
        }
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    timestamp = int(time.time())
    
    # Store job in DynamoDB with PENDING status
    jobs_table.put_item(Item={
        'job_id': job_id,
        'job_type': 'orchestrate',
        'status': 'PENDING',
        'industry': industry,
        'usp': usp,
        'key_services': key_services,
        'created_at': timestamp,
        'updated_at': timestamp
    })
    
    print(f"Created orchestrate job {job_id} for industry: {industry}")
    
    # Trigger async processing Lambda
    try:
        lambda_client.invoke(
            FunctionName='keyword-trend-orchestrate-processor',  # Your processor function name
            InvocationType='Event',  # Async invocation
            Payload=json.dumps({
                'job_id': job_id,
                'industry': industry,
                'usp': usp,
                'key_services': key_services
            })
        )
        print(f"Triggered async processor for job {job_id}")
    except Exception as e:
        print(f"Failed to trigger processor: {str(e)}")
        # Update job status to FAILED
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :failed, error_message = :error, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':failed': 'FAILED',
                ':error': f'Failed to start processing: {str(e)}',
                ':time': int(time.time())
            }
        )
    
    # Return immediately with job_id
    return {
        'statusCode': 200,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'status': 'PENDING',
            'job_id': job_id,
            'message': 'Job started, poll for results'
        })
    }

def handle_poll(job_id):
    """Handle orchestrate POLL request"""
    try:
        # Get job from DynamoDB
        response = jobs_table.get_item(Key={'job_id': job_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'status': 'FAILED',
                    'message': f'Job {job_id} not found'
                })
            }
        
        job = response['Item']
        
        # Return current job status and results
        result = {
            'status': job['status'],
            'job_id': job_id
        }
        
        # Add keywords if available
        if 'keywords' in job:
            result['keywords'] = job['keywords']
        
        # Add error message if failed
        if job['status'] == 'FAILED' and 'error_message' in job:
            result['message'] = job['error_message']
        
        # Add optional fields
        if 's3_key' in job:
            result['s3_key'] = job['s3_key']
        if 'query_id' in job:
            result['query_id'] = job['query_id']
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error polling job {job_id}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'status': 'FAILED',
                'message': f'Error polling job: {str(e)}'
            })
        }

def get_cors_headers():
    """Return CORS headers"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
```

---

## Step 3: Create Processor Lambda

**File: `orchestrate_processor.py`**
```python
import json
import time
import boto3
from your_scraper import scrape_and_process_keywords  # Your existing logic

dynamodb = boto3.resource('dynamodb')
jobs_table = dynamodb.Table('keyword-trend-jobs')

def lambda_handler(event, context):
    """
    Background processor for orchestrate jobs.
    This Lambda can take as long as needed (up to 15 minutes).
    """
    job_id = event['job_id']
    industry = event['industry']
    usp = event['usp']
    key_services = event.get('key_services', [])
    
    print(f"Processing orchestrate job {job_id}")
    
    try:
        # Update status to PROCESSING
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :processing, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':processing': 'PROCESSING',
                ':time': int(time.time())
            }
        )
        
        # DO THE ACTUAL WORK HERE (can take 30s, 60s, or longer)
        keywords = scrape_and_process_keywords(industry, usp, key_services)
        
        # Update job with results
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :completed, keywords = :kw, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':completed': 'COMPLETED',
                ':kw': keywords,
                ':time': int(time.time())
            }
        )
        
        print(f"Orchestrate job {job_id} completed with {len(keywords)} keywords")
        
    except Exception as e:
        print(f"Orchestrate job {job_id} failed: {str(e)}")
        
        # Update job status to FAILED
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :failed, error_message = :error, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':failed': 'FAILED',
                ':error': str(e),
                ':time': int(time.time())
            }
        )
```

---

## Step 4: Update `/trends` Lambda (Same Pattern)

**File: `trends_handler.py`**
```python
import json
import uuid
import time
import boto3

dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda')
jobs_table = dynamodb.Table('keyword-trend-jobs')

def lambda_handler(event, context):
    """
    Main trends endpoint handler.
    Returns immediately with job_id, triggers async processing.
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Check if this is a POLL request
        if 'job_id' in body and len(body) == 1:
            return handle_poll(body['job_id'])
        
        # This is a START request
        return handle_start(body)
        
    except Exception as e:
        print(f"Error in trends handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'status': 'FAILED',
                'message': f'Internal server error: {str(e)}'
            })
        }

def handle_start(body):
    """Handle trends START request"""
    industry = body.get('industry')
    keywords = body.get('keywords', [])
    
    if not industry or not keywords:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'status': 'FAILED',
                'message': 'Missing required fields: industry and keywords'
            })
        }
    
    job_id = str(uuid.uuid4())
    timestamp = int(time.time())
    
    jobs_table.put_item(Item={
        'job_id': job_id,
        'job_type': 'trends',
        'status': 'PENDING',
        'industry': industry,
        'keywords': keywords,
        'created_at': timestamp,
        'updated_at': timestamp
    })
    
    print(f"Created trends job {job_id} for {len(keywords)} keywords")
    
    # Trigger async processor
    try:
        lambda_client.invoke(
            FunctionName='keyword-trend-trends-processor',
            InvocationType='Event',
            Payload=json.dumps({
                'job_id': job_id,
                'industry': industry,
                'keywords': keywords
            })
        )
    except Exception as e:
        print(f"Failed to trigger processor: {str(e)}")
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :failed, error_message = :error, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':failed': 'FAILED',
                ':error': f'Failed to start processing: {str(e)}',
                ':time': int(time.time())
            }
        )
    
    return {
        'statusCode': 200,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'status': 'PENDING',
            'job_id': job_id
        })
    }

def handle_poll(job_id):
    """Handle trends POLL request"""
    try:
        response = jobs_table.get_item(Key={'job_id': job_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'status': 'FAILED',
                    'message': f'Job {job_id} not found'
                })
            }
        
        job = response['Item']
        
        result = {
            'status': job['status'],
            'job_id': job_id
        }
        
        if 'keywords' in job:
            result['keywords'] = job['keywords']
        if 'timeline' in job:
            result['timeline'] = job['timeline']
        if 'insights' in job:
            result['insights'] = job['insights']
        if job['status'] == 'FAILED' and 'error_message' in job:
            result['message'] = job['error_message']
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error polling job {job_id}: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'status': 'FAILED',
                'message': f'Error polling job: {str(e)}'
            })
        }

def get_cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
```

**File: `trends_processor.py`**
```python
import json
import time
import boto3
from your_trends_analyzer import analyze_trends  # Your existing logic

dynamodb = boto3.resource('dynamodb')
jobs_table = dynamodb.Table('keyword-trend-jobs')

def lambda_handler(event, context):
    """Background processor for trends jobs"""
    job_id = event['job_id']
    industry = event['industry']
    keywords = event['keywords']
    
    print(f"Processing trends job {job_id}")
    
    try:
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :processing, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':processing': 'PROCESSING',
                ':time': int(time.time())
            }
        )
        
        # DO THE ACTUAL WORK HERE
        timeline, insights = analyze_trends(industry, keywords)
        
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :completed, timeline = :tl, insights = :ins, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':completed': 'COMPLETED',
                ':tl': timeline,
                ':ins': insights,
                ':time': int(time.time())
            }
        )
        
        print(f"Trends job {job_id} completed")
        
    except Exception as e:
        print(f"Trends job {job_id} failed: {str(e)}")
        jobs_table.update_item(
            Key={'job_id': job_id},
            UpdateExpression='SET #status = :failed, error_message = :error, updated_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':failed': 'FAILED',
                ':error': str(e),
                ':time': int(time.time())
            }
        )
```

---

## Step 5: Update API Gateway

### For `/orchestrate` endpoint:
1. Method: POST
2. Integration type: Lambda Proxy
3. Lambda function: `orchestrate_handler`
4. Enable CORS

### For `/trends` endpoint:
1. Method: POST
2. Integration type: Lambda Proxy
3. Lambda function: `trends_handler`
4. Enable CORS

---

## Step 6: Lambda Configuration

### Main Handler Lambdas (orchestrate_handler, trends_handler):
- **Timeout:** 30 seconds (they return immediately, so this is plenty)
- **Memory:** 256 MB
- **IAM Role Permissions:**
  - `dynamodb:PutItem`
  - `dynamodb:GetItem`
  - `lambda:InvokeFunction`

### Processor Lambdas (orchestrate_processor, trends_processor):
- **Timeout:** 15 minutes (900 seconds) - maximum Lambda timeout
- **Memory:** 1024 MB or more (depending on your processing needs)
- **IAM Role Permissions:**
  - `dynamodb:UpdateItem`
  - `dynamodb:GetItem`

---

## Testing

### Test Orchestrate START:
```bash
curl -X POST https://your-api.execute-api.region.amazonaws.com/dev/orchestrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "industry": "healthcare",
    "usp": "AI-powered diagnostics",
    "key_services": ["imaging", "analysis"]
  }'
```

**Expected Response (immediate):**
```json
{
  "status": "PENDING",
  "job_id": "abc-123-def-456",
  "message": "Job started, poll for results"
}
```

### Test Orchestrate POLL:
```bash
curl -X POST https://your-api.execute-api.region.amazonaws.com/dev/orchestrate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "job_id": "abc-123-def-456"
  }'
```

**Expected Response:**
```json
{
  "status": "COMPLETED",
  "job_id": "abc-123-def-456",
  "keywords": [
    {"term": "AI diagnostics", "weight": 0.95},
    {"term": "medical imaging", "weight": 0.87}
  ]
}
```

---

## Client-Side (Already Done!)

The client is already fully implemented to handle this async pattern:
- ✅ Calls START endpoint
- ✅ Receives `job_id`
- ✅ Polls every 10 seconds
- ✅ Shows progress to user
- ✅ Handles COMPLETED/FAILED status

**No client-side changes needed!**

---

## Summary

1. **Create DynamoDB table** `keyword-trend-jobs`
2. **Deploy 4 Lambda functions:**
   - `orchestrate_handler` (returns immediately)
   - `orchestrate_processor` (does the work)
   - `trends_handler` (returns immediately)
   - `trends_processor` (does the work)
3. **Update API Gateway** to point to handler Lambdas
4. **Test** - should no longer get 504 errors!

The client will automatically start polling and show progress to the user.
