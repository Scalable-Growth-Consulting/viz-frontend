# API Testing Guide - Meta & Google Ads Integration

This guide provides comprehensive testing instructions for both Meta (Facebook) and Google Ads integrations.

---

## **📋 Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Meta (Facebook) Ads Testing](#meta-facebook-ads-testing)
3. [Google Ads Testing](#google-ads-testing)
4. [Postman Collection](#postman-collection)
5. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## **Prerequisites**

### **Environment Setup**
- ✅ **Backend server** running on `http://localhost:4000`
- ✅ **DynamoDB Local** running on `http://localhost:8000`
- ✅ **Environment variables** configured in `.env`
- ✅ **Valid API credentials** for Meta and Google

### **Required `.env` Variables**
```bash
# Meta Configuration
META_CLIENT_ID=your_meta_client_id
META_CLIENT_SECRET=your_meta_client_secret

# Google Configuration  
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_DEVELOPER_TOKEN=your_google_developer_token

# Common
FRONTEND_URL=http://localhost:8080
TOKEN_TABLE_NAME=UserToken
```

---

## **Meta (Facebook) Ads Testing**

### **🔐 1. Authentication Routes**

#### **Start Meta OAuth Flow**
```http
POST http://localhost:4000/auth/meta/start
Content-Type: application/json

{
  "state": "test"
}
```
**Response:**
```json
{
  "url": "https://www.facebook.com/v20.0/dialog/oauth?client_id=..."
}
```

#### **Complete OAuth (Automatic)**
```http
GET http://localhost:4000/auth/meta/callback?code=...&state=test
```
**Response:**
```json
{
  "success": true,
  "userId": "1221049162409947",
  "provider": "meta"
}
```

### **📊 2. Data Fetching Routes**
*(All require `x-user-id` header from auth callback)*

#### **Check Meta Connection Status**
```http
GET http://localhost:4000/auth/meta/status
x-user-id: <your-meta-userId>
```
**Response:**
```json
{
  "connected": true,
  "accountId": "act_123456789",
  "accountName": "My Ad Account",
  "status": "connected"
}
```

#### **Get Meta Ad Accounts**
```http
GET http://localhost:4000/accounts?provider=meta
x-user-id: <your-meta-userId>
```
**Response:**
```json
{
  "accounts": [
    {
      "id": "act_123456789",
      "name": "My Facebook Ad Account",
      "currency": "USD",
      "timezone_name": "America/New_York",
      "account_status": 1
    }
  ]
}
```

#### **Get Meta Campaigns**
```http
GET http://localhost:4000/campaigns?provider=meta&accountId=act_123456789
x-user-id: <your-meta-userId>
```
**Response:**
```json
{
  "campaigns": [
    {
      "id": "123456789",
      "name": "Traffic Campaign",
      "status": "ACTIVE",
      "objective": "TRAFFIC",
      "daily_budget": "5000",
      "created_time": "2024-01-01T00:00:00+0000"
    }
  ]
}
```

#### **Get Single Meta Campaign**
```http
GET http://localhost:4000/campaigns/123456789?provider=meta
x-user-id: <your-meta-userId>
```

#### **Get Meta Ads**
```http
GET http://localhost:4000/ads?provider=meta&accountId=act_123456789
x-user-id: <your-meta-userId>
```
**Response:**
```json
{
  "ads": [
    {
      "id": "456789123",
      "name": "My Facebook Ad",
      "status": "ACTIVE",
      "campaign_id": "123456789",
      "adset_id": "789123456",
      "creative": {
        "title": "Great Product",
        "body": "Buy now!"
      }
    }
  ]
}
```

#### **Get Meta Ads for Specific Campaign**
```http
GET http://localhost:4000/ads?provider=meta&accountId=act_123456789&campaignId=123456789
x-user-id: <your-meta-userId>
```

#### **Get Single Meta Ad**
```http
GET http://localhost:4000/ads/456789123?provider=meta
x-user-id: <your-meta-userId>
```

#### **Get Meta Metrics Overview**
```http
GET http://localhost:4000/metrics/overview?provider=meta&accountId=act_123456789
x-user-id: <your-meta-userId>
```
**Response:**
```json
{
  "metrics": {
    "impressions": "15000",
    "clicks": "750", 
    "spend": "375.50",
    "ctr": "5.0",
    "cpc": "0.50",
    "conversions": "30"
  }
}
```

---

## **Google Ads Testing**

### **🔐 1. Authentication Routes**

#### **Start Google OAuth Flow**
```http
POST http://localhost:4000/auth/google/start
Content-Type: application/json

{
  "state": "test"
}
```
**Response:**
```json
{
  "url": "https://accounts.google.com/oauth/authorize?client_id=..."
}
```

#### **Complete OAuth (Automatic)**
```http
GET http://localhost:4000/auth/google/callback?code=...&state=test
```
**Response:** HTML page with success message + auto-close

### **📊 2. Data Fetching Routes**
*(All require `x-user-id` header from auth callback)*

#### **Check Google Connection Status**
```http
GET http://localhost:4000/auth/google/status
x-user-id: <your-google-userId>
```
**Response:**
```json
{
  "connected": true,
  "accountId": "123456789",
  "accountName": "Your Account", 
  "status": "connected"
}
```

#### **Get Google Ads Accounts**
```http
GET http://localhost:4000/accounts?provider=google
x-user-id: <your-google-userId>
```
**Response:**
```json
{
  "accounts": [
    {
      "id": "123456789",
      "name": "My Google Ads Account",
      "currency": "USD",
      "timezone": "America/New_York",
      "status": "ENABLED"
    }
  ]
}
```

#### **Get Google Campaigns**
```http
GET http://localhost:4000/campaigns?provider=google&customerId=123456789
x-user-id: <your-google-userId>
```
**Response:**
```json
{
  "campaigns": [
    {
      "id": "987654321",
      "name": "Search Campaign",
      "status": "ENABLED",
      "type": "SEARCH",
      "budget": 50.00,
      "startDate": "2024-01-01",
      "biddingStrategy": "TARGET_CPA"
    }
  ]
}
```

#### **Get Single Google Campaign**
```http
GET http://localhost:4000/campaigns/987654321?provider=google&customerId=123456789
x-user-id: <your-google-userId>
```

#### **Get Google Ads**
```http
GET http://localhost:4000/ads?provider=google&customerId=123456789
x-user-id: <your-google-userId>
```
**Response:**
```json
{
  "ads": [
    {
      "id": "456789123",
      "adGroupId": "789123456",
      "adGroupName": "Ad Group 1",
      "campaignId": "987654321",
      "name": "Great Product Ad",
      "status": "ENABLED",
      "type": "TEXT_AD",
      "headline": "Buy Our Product",
      "description1": "Best product ever"
    }
  ]
}
```

#### **Get Google Ads for Specific Campaign**
```http
GET http://localhost:4000/ads?provider=google&customerId=123456789&campaignId=987654321
x-user-id: <your-google-userId>
```

#### **Get Single Google Ad**
```http
GET http://localhost:4000/ads/456789123?provider=google&customerId=123456789
x-user-id: <your-google-userId>
```

#### **Get Google Metrics Overview**
```http
GET http://localhost:4000/metrics/overview?provider=google&customerId=123456789
x-user-id: <your-google-userId>
```
**Response:**
```json
{
  "metrics": {
    "impressions": 10000,
    "clicks": 500,
    "cost": 250.75,
    "conversions": 25,
    "ctr": 5.0,
    "cpc": 0.50,
    "conversionRate": 5.0
  }
}
```

#### **Get Google Metrics with Date Range**
```http
GET http://localhost:4000/metrics/overview?provider=google&customerId=123456789&dateRange=LAST_7_DAYS
x-user-id: <your-google-userId>
```

---

## **📝 Complete Testing Workflows**

### **Meta Testing Workflow**

1. **POST** `/auth/meta/start` → Get OAuth URL
2. **Visit the URL in browser** → Complete Facebook sign-in
3. **Copy the `userId`** from JSON response
4. **GET** `/accounts?provider=meta` → Get account list
5. **Copy an account ID** (with `act_` prefix)
6. **GET** `/campaigns?provider=meta&accountId=act_XXX` → Get campaigns
7. **GET** `/ads?provider=meta&accountId=act_XXX` → Get ads
8. **GET** `/metrics/overview?provider=meta&accountId=act_XXX` → Get metrics

### **Google Testing Workflow**

1. **POST** `/auth/google/start` → Get OAuth URL
2. **Visit the URL in browser** → Complete Google sign-in
3. **Copy the `userId`** from success page
4. **GET** `/accounts?provider=google` → Get account list
5. **Copy an account ID** (customerId)
6. **GET** `/campaigns?provider=google&customerId=XXX` → Get campaigns
7. **GET** `/ads?provider=google&customerId=XXX` → Get ads
8. **GET** `/metrics/overview?provider=google&customerId=XXX` → Get metrics

---

## **🔧 Required Headers & Parameters**

### **Headers for All Data Routes**
```http
x-user-id: <userId-from-auth-callback>
Content-Type: application/json
```

### **Required Query Parameters**

| Route | Meta Params | Google Params |
|-------|-------------|---------------|
| `/accounts` | `provider=meta` | `provider=google` |
| `/campaigns` | `provider=meta`, `accountId` | `provider=google`, `customerId` |
| `/campaigns/:id` | `provider=meta` | `provider=google`, `customerId` |
| `/ads` | `provider=meta`, `accountId` | `provider=google`, `customerId` |
| `/ads/:id` | `provider=meta` | `provider=google`, `customerId` |
| `/metrics/overview` | `provider=meta`, `accountId` | `provider=google`, `customerId` |

### **Optional Parameters**
- **Meta:** `campaignId` (for filtering ads by campaign)
- **Google:** `campaignId` (for filtering ads by campaign), `dateRange` (for metrics)

---

## **Postman Collection**

### **Meta & Google Ads API Testing Collection**

```json
{
  "info": {
    "name": "Meta & Google Ads API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000"
    },
    {
      "key": "metaUserId", 
      "value": ""
    },
    {
      "key": "googleUserId",
      "value": ""
    },
    {
      "key": "metaAccountId",
      "value": ""
    },
    {
      "key": "googleCustomerId", 
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Meta Authentication",
      "item": [
        {
          "name": "1. Start Meta Auth",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/meta/start",
            "header": [
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"state\":\"test\"}"
            }
          }
        },
        {
          "name": "2. Meta Status",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/auth/meta/status",
            "header": [
              {"key": "x-user-id", "value": "{{metaUserId}}"}
            ]
          }
        }
      ]
    },
    {
      "name": "Meta Data",
      "item": [
        {
          "name": "Get Meta Accounts",
          "request": {
            "method": "GET", 
            "url": "{{baseUrl}}/accounts?provider=meta",
            "header": [
              {"key": "x-user-id", "value": "{{metaUserId}}"}
            ]
          }
        },
        {
          "name": "Get Meta Campaigns",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/campaigns?provider=meta&accountId={{metaAccountId}}",
            "header": [
              {"key": "x-user-id", "value": "{{metaUserId}}"}
            ]
          }
        },
        {
          "name": "Get Meta Ads",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/ads?provider=meta&accountId={{metaAccountId}}",
            "header": [
              {"key": "x-user-id", "value": "{{metaUserId}}"}
            ]
          }
        },
        {
          "name": "Get Meta Metrics",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/metrics/overview?provider=meta&accountId={{metaAccountId}}",
            "header": [
              {"key": "x-user-id", "value": "{{metaUserId}}"}
            ]
          }
        }
      ]
    },
    {
      "name": "Google Authentication", 
      "item": [
        {
          "name": "1. Start Google Auth",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/google/start",
            "header": [
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"state\":\"test\"}"
            }
          }
        },
        {
          "name": "2. Google Status",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/auth/google/status",
            "header": [
              {"key": "x-user-id", "value": "{{googleUserId}}"}
            ]
          }
        }
      ]
    },
    {
      "name": "Google Data",
      "item": [
        {
          "name": "Get Google Accounts",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/accounts?provider=google", 
            "header": [
              {"key": "x-user-id", "value": "{{googleUserId}}"}
            ]
          }
        },
        {
          "name": "Get Google Campaigns",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/campaigns?provider=google&customerId={{googleCustomerId}}",
            "header": [
              {"key": "x-user-id", "value": "{{googleUserId}}"}
            ]
          }
        },
        {
          "name": "Get Google Ads",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/ads?provider=google&customerId={{googleCustomerId}}",
            "header": [
              {"key": "x-user-id", "value": "{{googleUserId}}"}
            ]
          }
        },
        {
          "name": "Get Google Metrics",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/metrics/overview?provider=google&customerId={{googleCustomerId}}",
            "header": [
              {"key": "x-user-id", "value": "{{googleUserId}}"}
            ]
          }
        }
      ]
    }
  ]
}
```

---

## **Common Issues & Troubleshooting**

### **Authentication Issues**

#### **"Invalid OAuth access token" (Meta)**
- ✅ **Solution:** Re-authenticate and get a fresh token
- ✅ **Check:** Token table name consistency in `.env`
- ✅ **Verify:** Using correct `x-user-id` from callback

#### **"Invalid developer token" (Google)**
- ✅ **Solution:** Apply for Google Ads Developer Token
- ✅ **Check:** `GOOGLE_DEVELOPER_TOKEN` in `.env`
- ✅ **Wait:** Developer token approval can take several days

### **Data Access Issues**

#### **"No valid token found"**
- ✅ **Check:** Using exact `userId` from auth callback
- ✅ **Verify:** DynamoDB Local is running
- ✅ **Confirm:** Token was stored successfully

#### **Missing `accountId` or `customerId`**
- ✅ **Meta:** Always provide `accountId` (with `act_` prefix)
- ✅ **Google:** Always provide `customerId` (numeric only)
- ✅ **Get IDs:** Call `/accounts` endpoint first

### **Server Issues**

#### **CORS Errors**
- ✅ **Check:** Frontend URL in CORS configuration
- ✅ **Verify:** Using correct headers

#### **DynamoDB Connection Failed**
- ✅ **Start:** DynamoDB Local on port 8000
- ✅ **Check:** Endpoint configuration in client

### **Environment Variables**

#### **Missing Required Variables**
```bash
# Minimum required for Meta
META_CLIENT_ID=your_value
META_CLIENT_SECRET=your_value

# Minimum required for Google  
GOOGLE_CLIENT_ID=your_value
GOOGLE_CLIENT_SECRET=your_value
GOOGLE_DEVELOPER_TOKEN=your_value

# Common
TOKEN_TABLE_NAME=UserToken
```

---

## **Quick Reference**

### **Base URL**
```
http://localhost:4000
```

### **Auth Endpoints**
- `POST /auth/{provider}/start` - Start OAuth
- `GET /auth/{provider}/callback` - Complete OAuth  
- `GET /auth/{provider}/status` - Check connection

### **Data Endpoints**
- `GET /accounts?provider={provider}` - List accounts
- `GET /campaigns?provider={provider}&{accountParam}={id}` - List campaigns
- `GET /ads?provider={provider}&{accountParam}={id}` - List ads
- `GET /metrics/overview?provider={provider}&{accountParam}={id}` - Get metrics

### **Providers**
- `meta` - Facebook/Meta Ads
- `google` - Google Ads

### **Account Parameters**
- **Meta:** `accountId` (format: `act_123456789`)
- **Google:** `customerId` (format: `123456789`)

---

*This guide covers comprehensive testing for both Meta and Google Ads integrations. Always ensure