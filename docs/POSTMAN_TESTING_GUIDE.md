# 🧪 **Complete Postman Testing Guide for Google OAuth**

## **Prerequisites**
- ✅ Server running at `http://localhost:4000`
- ✅ DynamoDB Local running at `http://localhost:8000`
- ✅ Google OAuth credentials configured in `.env`

---

## **📋 Step-by-Step Testing Process**

### **Step 1: Initialize OAuth Flow**

**Request:**
```
Method: GET
URL: http://localhost:4000/auth/google/start
Headers:
  x-user-id: test-user-123
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=286070583332-...",
  "state": "8d94ef6e19f7ef53b4df10b4ee2d65a4",
  "provider": "google",
  "scopes": [
    "https://www.googleapis.com/auth/adwords",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ]
}
```

**What to do:**
1. ✅ Copy the `authUrl` value
2. ✅ Save the `state` value for later reference
3. ✅ Verify the response contains all required scopes

---

### **Step 2: Complete Browser OAuth (Manual)**

**Action Required:**
1. **Paste the `authUrl`** into your browser
2. **Complete Google OAuth consent** flow
3. **You'll be redirected** to: `http://localhost:4000/auth/google/callback?code=...&state=...`
4. **Copy the authorization `code`** from the URL parameters
5. **Verify the `state`** matches the one from Step 1

**Example Callback URL:**
```
http://localhost:4000/auth/google/callback?
state=8d94ef6e19f7ef53b4df10b4ee2d65a4&
code=4/0AVMBsJiDXs5k2KYuX_wPXIQ822E47oBLImVyK7wV2UQoqzBcXT4yOklWXqgykhJdS48jVw&
scope=email%20profile%20https://www.googleapis.com/auth/userinfo.profile...
```

---

### **Step 3: Test OAuth Callback (Optional - for debugging)**

**Note:** *The callback happens automatically in the browser, but you can test it manually:*

**Request:**
```
Method: GET
URL: http://localhost:4000/auth/google/callback?code=YOUR_CODE_HERE&state=STATE_FROM_STEP1
Headers:
  Content-Type: application/json
```

**Expected Success Response:**
```json
{
  "success": true,
  "provider": "google",
  "token_type": "Bearer",
  "expires_at": "2025-09-12T16:53:02.917Z",
  "user_info": {
    "id": "103717659203151177928",
    "email": "ashmit.kumar@sgconsultingtech.com",
    "name": "Ashmit Kuma",
    "picture": "https://...",
    "verified_email": true
  },
  "ads_access": {
    "valid": true,
    "customerCount": 2,
    "customers": ["customers/1234567890", "customers/0987654321"]
  },
  "user_id": "103717659203151177928"
}
```

---

### **Step 4: Check Authentication Status**

**Request:**
```
Method: GET
URL: http://localhost:4000/auth/google/status
Headers:
  x-user-id: 103717659203151177928
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "authenticated": true,
  "provider": "google",
  "expires_at": "2025-09-12T16:53:02.917Z",
  "user_info": {
    "id": "103717659203151177928",
    "email": "ashmit.kumar@sgconsultingtech.com",
    "name": "Ashmit Kuma"
  },
  "ads_access": {
    "valid": true,
    "customerCount": 2
  },
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/adwords ..."
}
```

---

### **Step 5: List Google Ads Customers**

**Request:**
```
Method: GET
URL: http://localhost:4000/auth/google/customers
Headers:
  x-user-id: 103717659203151177928
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "provider": "google",
  "customers": [
    "customers/1234567890",
    "customers/0987654321"
  ],
  "customer_count": 2,
  "user_id": "103717659203151177928"
}
```

---

### **Step 6: Refresh Access Token**

**Request:**
```
Method: POST
URL: http://localhost:4000/auth/google/refresh
Headers:
  x-user-id: 103717659203151177928
  Content-Type: application/json
Body: (empty or {})
```

**Expected Response:**
```json
{
  "success": true,
  "provider": "google",
  "token_type": "Bearer",
  "expires_at": "2025-09-12T17:53:02.917Z",
  "refreshed_at": "2025-09-12T15:53:03.917Z",
  "user_id": "103717659203151177928"
}
```

---

## **🔧 Postman Collection Setup**

### **Create New Collection:**
1. Click **"New"** → **"Collection"**
2. Name: **"Google OAuth API Testing"**
3. Add description: **"Testing Google Ads OAuth integration"**

### **Environment Variables:**
Create a new environment with these variables:
```
BASE_URL = http://localhost:4000
USER_ID = test-user-123
GOOGLE_USER_ID = 103717659203151177928
STATE = {{$randomAlphaNumeric(32)}}
```

### **Collection Structure:**
```
📁 Google OAuth API Testing
├── 📄 1. Start OAuth Flow
├── 📄 2. Check Auth Status  
├── 📄 3. List Customers
├── 📄 4. Refresh Token
└── 📄 5. OAuth Callback (Debug)
```

---

## **📝 Request Details**

### **Request 1: Start OAuth Flow**
```
GET {{BASE_URL}}/auth/google/start
Headers:
  x-user-id: {{USER_ID}}
  Content-Type: application/json

Tests Script:
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response contains authUrl", () => {
    pm.expect(pm.response.json()).to.have.property('authUrl');
});

// Save state for later use
pm.test("Save state", () => {
    const responseJson = pm.response.json();
    pm.environment.set("OAUTH_STATE", responseJson.state);
});
```

### **Request 2: Check Auth Status**
```
GET {{BASE_URL}}/auth/google/status
Headers:
  x-user-id: {{GOOGLE_USER_ID}}
  Content-Type: application/json

Tests Script:
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("User is authenticated", () => {
    pm.expect(pm.response.json().authenticated).to.be.true;
});
```

### **Request 3: List Customers**
```
GET {{BASE_URL}}/auth/google/customers
Headers:
  x-user-id: {{GOOGLE_USER_ID}}
  Content-Type: application/json

Tests Script:
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response contains customers", () => {
    pm.expect(pm.response.json()).to.have.property('customers');
});
```

### **Request 4: Refresh Token**
```
POST {{BASE_URL}}/auth/google/refresh
Headers:
  x-user-id: {{GOOGLE_USER_ID}}
  Content-Type: application/json

Body: {} (empty JSON object)

Tests Script:
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Token refreshed successfully", () => {
    pm.expect(pm.response.json().success).to.be.true;
});
```

### **Request 5: OAuth Callback (Debug)**
```
GET {{BASE_URL}}/auth/google/callback
Query Params:
  code: YOUR_AUTHORIZATION_CODE
  state: {{OAUTH_STATE}}

Headers:
  Content-Type: application/json

Tests Script:
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("OAuth callback successful", () => {
    pm.expect(pm.response.json().success).to.be.true;
});

// Save Google User ID for subsequent requests
pm.test("Save Google User ID", () => {
    const responseJson = pm.response.json();
    if (responseJson.user_id) {
        pm.environment.set("GOOGLE_USER_ID", responseJson.user_id);
    }
});
```

---

## **🚨 Common Issues & Solutions**

### **Issue 1: "Unable to identify user"**
**Problem:** Session lost between start and callback
**Solution:** Use the Google user ID from Step 3 response in subsequent requests
```
Headers: x-user-id: 103717659203151177928
```

### **Issue 2: "Authentication required"**
**Problem:** No valid tokens stored
**Solution:** Complete the browser OAuth flow (Step 2) before testing other endpoints

### **Issue 3: "Token expired"**
**Problem:** Access token has expired (1 hour lifetime)
**Solution:** Use the refresh token endpoint (Step 6) or restart the OAuth flow

### **Issue 4: "State mismatch"**
**Problem:** State parameter doesn't match
**Solution:** Ensure you use the exact state value from Step 1 in the callback

### **Issue 5: "Google Ads API access denied"**
**Problem:** Account doesn't have Google Ads access or developer token issues
**Solution:** 
- Verify Google Ads account access
- Check `GOOGLE_DEVELOPER_TOKEN` in `.env`
- Ensure proper scopes are granted

---

## **📊 Expected Log Patterns**

Watch for these log patterns in your server console:

### **✅ Success Patterns:**
```
=== [GOOGLE AUTH START] ===
[GOOGLE CONNECTOR] Generated auth URL: https://...
=== [GOOGLE AUTH START COMPLETE] ===

=== [GOOGLE AUTH CALLBACK] ===
[GOOGLE CONNECTOR] Token exchange successful
[GOOGLE] ✓ User profile fetched successfully
[GOOGLE] ✓ Google Ads API access validated successfully
=== [GOOGLE AUTH CALLBACK COMPLETE] ===
```

### **❌ Error Patterns:**
```
[GOOGLE] ✗ Missing access_token
[GOOGLE AUTH] No user ID available from any source
[GOOGLE] ✗ Token refresh failed
[GOOGLE] ✗ Request failed: 401 Unauthorized
```

---

## **🎯 Testing Scenarios**

### **Scenario 1: Quick Test (5 minutes)**
Perfect for verifying basic functionality:
1. **Step 1** → Get auth URL
2. **Step 2** → Complete browser OAuth
3. **Step 4** → Check status
4. **Step 5** → List customers

### **Scenario 2: Full Test (10 minutes)**
Comprehensive testing of all endpoints:
1. **Step 1** → Get auth URL
2. **Step 2** → Complete browser OAuth
3. **Step 3** → Test callback (optional)
4. **Step 4** → Check status
5. **Step 5** → List customers
6. **Step 6** → Refresh token

### **Scenario 3: Debug Test**
For troubleshooting issues:
1. **Step 1** → Check logs for auth URL generation
2. **Step 2** → Complete OAuth, monitor network tab
3. **Step 3** → Test callback with detailed logging
4. Analyze server logs for error patterns

---

## **🛠️ Advanced Testing**

### **Testing Token Refresh Flow**
1. Complete normal OAuth flow
2. Wait for token to near expiration (or manually set short expiry)
3. Call protected endpoint → Should get 401
4. Call refresh endpoint → Should get new token
5. Retry protected endpoint → Should succeed

### **Testing Error Scenarios**
1. **Invalid State:** Use wrong state in callback
2. **Expired Code:** Use old authorization code
3. **Invalid User ID:** Use non-existent user ID
4. **Missing Headers:** Omit required headers

### **Load Testing**
1. Create multiple users with different IDs
2. Run OAuth flows in parallel
3. Test concurrent token refresh operations
4. Verify session isolation

---

## **📋 Postman Collection Export**

To import this collection into Postman:

1. **Create Collection:** Copy the JSON structure below
2. **Import:** File → Import → Paste Raw Text
3. **Set Environment:** Create environment with variables listed above

```json
{
  "info": {
    "name": "Google OAuth API Testing",
    "description": "Comprehensive testing for Google Ads OAuth integration",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:4000"
    },
    {
      "key": "USER_ID",
      "value": "test-user-123"
    },
    {
      "key": "GOOGLE_USER_ID",
      "value": "103717659203151177928"
    }
  ]
}
```

---

## **🎉 Success Criteria**

Your testing is successful when:

- ✅ **Step 1** returns valid auth URL with state
- ✅ **Step 2** completes without browser errors
- ✅ **Step 4** shows `authenticated: true`
- ✅ **Step 5** returns list of Google Ads customers
- ✅ **Step 6** successfully refreshes tokens
- ✅ Server logs show no error patterns
- ✅ Tokens are stored in DynamoDB

---

**Note:** This guide assumes your Google OAuth application is properly configured with the correct redirect URI (`http://localhost:4000/auth/google/callback`) and the necessary scopes are approved.