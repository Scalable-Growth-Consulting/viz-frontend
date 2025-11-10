# Keyword Trend Agent - Debug Guide

## Quick Start Debugging

### Enable Debug Mode

**Method 1: Browser Console**
```javascript
localStorage.setItem('KEYWORD_TREND_DEBUG', 'true');
// Refresh the page
```

**Method 2: Development Environment**
Debug mode is automatically enabled in development (`import.meta.env.DEV`)

### View Debug Logs

#### In Browser Console
All API calls are logged with timestamps and request IDs:
```
[KeywordTrendAPI][INFO][2025-11-10T18:05:23.456Z] Starting orchestrate request
[KeywordTrendAPI][DEBUG][2025-11-10T18:05:23.457Z] [abc123] POST request to /dev/orchestrate
[KeywordTrendAPI][DEBUG][2025-11-10T18:05:24.123Z] [abc123] Response received in 666ms
```

#### In UI Debug Panel
- Located below the input form (left column)
- Shows last 20 log entries
- Color-coded by severity:
  - 🔴 Red: Errors
  - 🟡 Yellow: Warnings
  - 🟢 Green: Success
  - ⚪ Gray: Info

---

## Common Issues & Solutions

### 1. Authentication Errors

**Symptom:**
```
Error: Authentication required. Please sign in.
```

**Debug Steps:**
1. Check browser console for auth token retrieval:
   ```javascript
   // Check Supabase session
   const { data } = await supabase.auth.getSession();
   console.log('Session:', data);
   ```

2. Verify token in localStorage:
   ```javascript
   console.log('Auth token:', localStorage.getItem('auth_token'));
   ```

3. Check Supabase auth state:
   ```javascript
   console.log('Supabase token:', localStorage.getItem('supabase.auth.token'));
   ```

**Solution:**
- Sign in again
- Clear localStorage and re-authenticate
- Check Supabase configuration

---

### 2. Orchestrate API Fails

**Symptom:**
```
Orchestrate failed: Request failed: [error message]
```

**Debug Steps:**
1. Check debug logs for request details
2. Verify industry and USP inputs are valid
3. Check network tab for actual request/response
4. Look for CORS errors

**Expected Behavior:**
- Even if orchestrate fails, trends should continue with manual keywords
- Error should be logged but not block the flow

**Solution:**
- Add manual keywords in the Keywords field
- Check API Gateway configuration
- Verify Lambda function is deployed

---

### 3. Trends API Fails

**Symptom:**
```
Trend analysis failed: [error message]
```

**Debug Steps:**
1. Check if keywords were generated/provided
2. Verify job_id in debug logs
3. Check polling status messages
4. Look for timeout errors

**Debug Log Example:**
```
[INFO] Starting trends analysis for 15 keywords...
[SUCCESS] Trends started: PENDING (Job ID: abc-123-def)
[INFO] Polling job abc-123-def...
[DEBUG] Polling trends job { jobId: 'abc-123-def' }
```

**Solution:**
- Ensure at least one keyword is provided
- Check Lambda function logs in AWS CloudWatch
- Verify DynamoDB table access
- Increase timeout if needed

---

### 4. Network/CORS Errors

**Symptom:**
```
Network/CORS error: The request was blocked
```

**Debug Steps:**
1. Check browser console for CORS errors
2. Verify API Gateway CORS configuration
3. Check if using dev proxy (Vite)
4. Inspect request headers

**Vite Proxy Configuration:**
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/dev': {
        target: 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com',
        changeOrigin: true,
      }
    }
  }
});
```

**Solution:**
- Enable CORS in API Gateway
- Use Vite dev proxy in development
- Check network firewall settings

---

### 5. Timeout Errors

**Symptom:**
```
Request timed out (408)
```

**Debug Steps:**
1. Check elapsed time in debug logs
2. Verify timeout configuration (default: 35s)
3. Check Lambda function execution time
4. Look for cold start issues

**Timeout Configuration:**
```typescript
// In keywordTrendApi.ts
const timeoutMs = Math.max(10000, opts?.timeoutMs ?? 35000);
```

**Solution:**
- Increase timeout for slow connections
- Optimize Lambda function performance
- Check for Lambda cold starts
- Verify database query performance

---

## Advanced Debugging

### Inspect API Requests

**In Browser DevTools:**
1. Open Network tab
2. Filter by "Fetch/XHR"
3. Look for requests to `/dev/orchestrate` and `/dev/trends`
4. Check request/response headers and body

**Request Headers:**
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
Accept: application/json
X-Client-Payload: [base64_encoded_payload]
X-Request-Origin: viz.keyword-trend-web
```

### Monitor Polling

**Debug Logs:**
```
[INFO] Polling job abc-123-def...
[DEBUG] Polling trends job { jobId: 'abc-123-def' }
[DEBUG] Trends poll completed { status: 'PROCESSING', jobId: 'abc-123-def' }
```

**UI Indicators:**
- Attempt counter (e.g., "Attempt #3")
- Elapsed time (e.g., "45s")
- Status badge (PENDING → PROCESSING → COMPLETED)
- Progress bar (0-100%)

### Check Error Details

**In Component State:**
```typescript
// Error object structure
{
  message: "Unable to connect to the server",
  type: "Network Error",
  details: "Check your internet connection"
}
```

**In Debug Logs:**
```
[ERROR] Analysis failed: Network/CORS error: The request was blocked
```

---

## Performance Monitoring

### Request Timing

**Debug Logs:**
```
[DEBUG] [abc123] Response received in 666ms { status: 200 }
```

**Metrics to Watch:**
- Orchestrate: < 5s
- Trends start: < 3s
- Trends poll: < 2s per attempt
- Total analysis: < 60s

### Polling Efficiency

**Configuration:**
```typescript
{
  intervalMs: 10000,        // 10s base interval
  timeoutMs: 200000,        // 200s total timeout
  maxConsecutiveErrors: 7,  // Max errors before giving up
  backoff: {
    enabled: true,
    factor: 1.5,            // Exponential backoff
    maxIntervalMs: 30000,   // Max 30s between polls
    jitter: true            // ±15% randomization
  }
}
```

**Expected Polling Pattern:**
```
Attempt 1: 0s
Attempt 2: 10s
Attempt 3: 25s (10 * 1.5)
Attempt 4: 47.5s (25 * 1.5)
Attempt 5: 77.5s (30s max + jitter)
```

---

## Error Recovery Strategies

### 1. Orchestrate Fails → Continue with Manual Keywords
```typescript
try {
  orch = await keywordTrendApi.orchestrate({ industry, usp, key_services });
} catch (orchError) {
  // Use manual keywords if available
  if (!keywordsText.trim()) {
    throw new Error('Please add keywords manually');
  }
  orch = { keywords: [] };
}
```

### 2. Trends Fails → Show Clear Error
```typescript
try {
  start = await keywordTrendApi.trendsStart({ keywords });
} catch (trendsError) {
  throw new Error(`Trend analysis failed: ${trendsError.message}`);
}
```

### 3. Polling Timeout → Retry or Manual Check
- Cancel button available during polling
- Status updates every 10s
- Clear timeout message after 200s

---

## Testing Scenarios

### Test 1: Happy Path
1. Enter industry: "FinTech"
2. Enter USP: "AI-powered financial analytics"
3. Click Analyze
4. Verify orchestrate success
5. Verify trends start
6. Verify polling completes
7. Check results display

**Expected Debug Logs:**
```
[INFO] Starting analysis...
[INFO] Orchestrating keywords for FinTech...
[SUCCESS] Orchestrate completed: 25 keywords generated
[INFO] Starting trends analysis for 25 keywords...
[SUCCESS] Trends started: PENDING (Job ID: xyz)
[INFO] Polling job xyz...
[SUCCESS] Analysis completed successfully
```

### Test 2: Orchestrate Fails
1. Disconnect network
2. Enter inputs and click Analyze
3. Add manual keywords
4. Verify trends continues

**Expected Behavior:**
- Error logged for orchestrate
- Warning: "Using manual keywords only"
- Trends proceeds with manual keywords

### Test 3: Authentication Failure
1. Clear localStorage
2. Try to analyze
3. Verify auth error displayed

**Expected Error:**
```
Authentication Error
Please sign in to continue
Your session may have expired
```

### Test 4: Timeout
1. Set very short timeout (for testing)
2. Start analysis
3. Verify timeout error after duration

**Expected Error:**
```
Timeout Error
Request took too long
The server is taking longer than expected
```

---

## Logging Best Practices

### When to Log

**Always Log:**
- API request start/end
- Authentication attempts
- Errors and warnings
- State transitions

**Debug Level Only:**
- Request/response details
- Polling attempts
- Schema validation

### Log Format

**Good:**
```typescript
logger.info('Starting trends analysis', { 
  keywordCount: keywords.length, 
  jobId: payload.job_id 
});
```

**Bad:**
```typescript
logger.info('Starting trends');
```

### Reading Logs

**Pattern:**
```
[KeywordTrendAPI][LEVEL][TIMESTAMP] Message { data }
```

**Example:**
```
[KeywordTrendAPI][INFO][2025-11-10T18:05:23.456Z] Starting orchestrate request { industry: "FinTech", usp: "AI-powered..." }
```

---

## Troubleshooting Checklist

### Before Reporting an Issue

- [ ] Enable debug mode
- [ ] Check browser console for errors
- [ ] Review debug logs in UI
- [ ] Check network tab for failed requests
- [ ] Verify authentication status
- [ ] Test with different inputs
- [ ] Try in incognito mode
- [ ] Check browser compatibility
- [ ] Review error message details
- [ ] Note exact steps to reproduce

### Information to Provide

1. **Error Message**: Exact text from UI or console
2. **Debug Logs**: Copy from UI debug panel or console
3. **Network Requests**: Screenshots from DevTools
4. **Browser**: Name and version
5. **Steps to Reproduce**: Detailed sequence
6. **Expected vs Actual**: What should happen vs what happened
7. **Timestamp**: When the error occurred
8. **Environment**: Development or production

---

## Quick Reference

### Enable Debug
```javascript
localStorage.setItem('KEYWORD_TREND_DEBUG', 'true');
```

### Disable Debug
```javascript
localStorage.removeItem('KEYWORD_TREND_DEBUG');
```

### Check Auth Token
```javascript
const { data } = await supabase.auth.getSession();
console.log(data?.session?.access_token);
```

### Clear All Data
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Test API Directly
```javascript
// In browser console
const response = await fetch('/dev/orchestrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    industry: 'FinTech',
    usp: 'AI-powered analytics'
  })
});
const data = await response.json();
console.log(data);
```

---

**Need More Help?**
- Check the main documentation: `IMPROVEMENTS_SUMMARY.md`
- Review API service code: `src/services/keywordTrendApi.ts`
- Check component code: `src/pages/KeywordTrend/KeywordTrendAgent.tsx`
- Contact the development team

---

**Last Updated:** November 10, 2025
