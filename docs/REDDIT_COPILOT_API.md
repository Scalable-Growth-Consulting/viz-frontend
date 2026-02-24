# Reddit CoPilot - Lambda Backend Integration

This document outlines the API endpoints and Lambda functions required for the Reddit CoPilot feature.

## 🏗️ Architecture Overview

```
Frontend (React) → API Gateway → Lambda Functions → DynamoDB + Reddit API
                                      ↓
                               WebSocket API (for live logs)
```

## 🔧 Required Lambda Functions

### 1. Reddit OAuth Functions

#### `POST /reddit/auth/init`
**Purpose**: Initiate Reddit OAuth flow
**Handler**: `reddit-auth-init.handler`

```typescript
// Request
{}

// Response
{
  "auth_url": "https://www.reddit.com/api/v1/authorize?client_id=...&response_type=code&state=...&redirect_uri=...&duration=permanent&scope=identity,read,submit"
}
```

#### `POST /reddit/auth/callback`
**Purpose**: Handle Reddit OAuth callback
**Handler**: `reddit-auth-callback.handler`

```typescript
// Request
{
  "code": "string",
  "state": "string"
}

// Response
{
  "access_token": "string",
  "refresh_token": "string", 
  "expires_at": "2024-01-01T00:00:00Z",
  "reddit_username": "string",
  "scope": ["identity", "read", "submit"]
}
```

#### `POST /reddit/auth/revoke`
**Purpose**: Revoke Reddit tokens
**Handler**: `reddit-auth-revoke.handler`

```typescript
// Request
{}

// Response
{} // 204 No Content
```

#### `POST /reddit/auth/refresh`
**Purpose**: Refresh Reddit access token
**Handler**: `reddit-auth-refresh.handler`

```typescript
// Request
{}

// Response
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_at": "2024-01-01T00:00:00Z",
  "reddit_username": "string",
  "scope": ["identity", "read", "submit"]
}
```

### 2. Client Profile Functions

#### `POST /client/profile`
**Purpose**: Save client profile
**Handler**: `client-profile-save.handler`

```typescript
// Request
{
  "usp": "string",
  "industry": "string", 
  "keywords": ["string"]
}

// Response
{
  "usp": "string",
  "industry": "string",
  "keywords": ["string"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### `GET /client/profile`
**Purpose**: Get client profile
**Handler**: `client-profile-get.handler`

```typescript
// Response
{
  "usp": "string",
  "industry": "string", 
  "keywords": ["string"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3. Agent Control Functions

#### `POST /agent/start`
**Purpose**: Start Reddit commenting agent
**Handler**: `agent-start.handler`

```typescript
// Request
{}

// Response
{
  "session_id": "string",
  "status": "running",
  "started_at": "2024-01-01T00:00:00Z",
  "stats": {
    "searches": 0,
    "generated": 0,
    "posted": 0,
    "errors": 0
  }
}
```

#### `POST /agent/stop`
**Purpose**: Stop Reddit commenting agent
**Handler**: `agent-stop.handler`

```typescript
// Request
{
  "session_id": "string"
}

// Response
{} // 204 No Content
```

#### `GET /agent/status`
**Purpose**: Get current agent status
**Handler**: `agent-status.handler`

```typescript
// Response
{
  "session_id": "string",
  "status": "running" | "idle" | "stopped" | "error",
  "started_at": "2024-01-01T00:00:00Z",
  "stopped_at": "2024-01-01T00:00:00Z", // if stopped
  "stats": {
    "searches": 10,
    "generated": 8,
    "posted": 5,
    "errors": 1
  }
}
```

#### `GET /agent/logs`
**Purpose**: Get agent logs
**Handler**: `agent-logs.handler`

```typescript
// Query Parameters
// ?session_id=string&limit=50

// Response
[
  {
    "id": "string",
    "session_id": "string", 
    "type": "search" | "generate" | "post" | "info" | "error",
    "message": "string",
    "timestamp": "2024-01-01T00:00:00Z",
    "metadata": {}
  }
]
```

### 4. User Data Functions

#### `GET /user/tokens`
**Purpose**: Get user's Reddit tokens
**Handler**: `user-tokens.handler`

```typescript
// Response
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_at": "2024-01-01T00:00:00Z", 
  "reddit_username": "string",
  "scope": ["identity", "read", "submit"]
}
```

#### `GET /user/profile`
**Purpose**: Get complete user profile
**Handler**: `user-profile.handler`

```typescript
// Response
{
  "reddit_token": {
    "access_token": "string",
    "refresh_token": "string", 
    "expires_at": "2024-01-01T00:00:00Z",
    "reddit_username": "string",
    "scope": ["identity", "read", "submit"]
  } | null,
  "client_profile": {
    "usp": "string",
    "industry": "string",
    "keywords": ["string"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  } | null
}
```

## 🗄️ DynamoDB Tables

### 1. `reddit-copilot-users`
**Purpose**: Store user authentication and profile data

```typescript
{
  "user_id": "string", // Partition Key
  "reddit_token": {
    "access_token": "string",
    "refresh_token": "string",
    "expires_at": "string",
    "reddit_username": "string", 
    "scope": ["string"]
  },
  "client_profile": {
    "usp": "string",
    "industry": "string",
    "keywords": ["string"],
    "created_at": "string",
    "updated_at": "string"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### 2. `reddit-copilot-sessions`
**Purpose**: Store agent session data

```typescript
{
  "session_id": "string", // Partition Key
  "user_id": "string", // GSI
  "status": "running" | "idle" | "stopped" | "error",
  "started_at": "string",
  "stopped_at": "string",
  "stats": {
    "searches": "number",
    "generated": "number", 
    "posted": "number",
    "errors": "number"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### 3. `reddit-copilot-logs`
**Purpose**: Store agent activity logs

```typescript
{
  "log_id": "string", // Partition Key
  "session_id": "string", // GSI
  "user_id": "string", // GSI
  "type": "search" | "generate" | "post" | "info" | "error",
  "message": "string",
  "timestamp": "string",
  "metadata": {}, // Additional context data
  "ttl": "number" // Auto-expire logs after 30 days
}
```

## 🔌 WebSocket API (Optional)

### Connection: `wss://your-websocket-api.execute-api.region.amazonaws.com/prod`

#### Route: `$connect`
**Handler**: `websocket-connect.handler`
- Authenticate user
- Store connection ID in DynamoDB

#### Route: `$disconnect` 
**Handler**: `websocket-disconnect.handler`
- Clean up connection ID from DynamoDB

#### Route: `subscribe-logs`
**Handler**: `websocket-subscribe-logs.handler`
```typescript
// Message
{
  "action": "subscribe-logs",
  "session_id": "string"
}
```

#### Broadcast Logs
**Handler**: `websocket-broadcast-logs.handler`
- Called by agent functions to broadcast new logs
- Sends logs to subscribed WebSocket connections

## 🔐 Authentication & Security

### JWT Token Validation
All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Environment Variables
```bash
# Reddit OAuth
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret  
REDDIT_REDIRECT_URI=https://yourdomain.com/auth/reddit/callback

# DynamoDB
DYNAMODB_USERS_TABLE=reddit-copilot-users
DYNAMODB_SESSIONS_TABLE=reddit-copilot-sessions
DYNAMODB_LOGS_TABLE=reddit-copilot-logs

# WebSocket (if using)
WEBSOCKET_API_ENDPOINT=wss://your-websocket-api.execute-api.region.amazonaws.com/prod

# Encryption
KMS_KEY_ID=your-kms-key-id
```

### Data Encryption
- Reddit tokens encrypted using AWS KMS
- Sensitive data encrypted at rest in DynamoDB
- All API calls over HTTPS/WSS

## 🚀 Deployment

### Serverless Framework Example
```yaml
service: reddit-copilot-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DYNAMODB_USERS_TABLE: ${self:service}-users-${opt:stage}
    DYNAMODB_SESSIONS_TABLE: ${self:service}-sessions-${opt:stage}
    DYNAMODB_LOGS_TABLE: ${self:service}-logs-${opt:stage}

functions:
  reddit-auth-init:
    handler: src/handlers/reddit-auth-init.handler
    events:
      - http:
          path: /reddit/auth/init
          method: post
          cors: true
          authorizer: auth

  # ... other functions

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.DYNAMODB_USERS_TABLE}
        AttributeDefinitions:
          - AttributeName: user_id
            AttributeType: S
        KeySchema:
          - AttributeName: user_id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
        PointInTimeRecoverySpecification:
          PointInTimeRecoveryEnabled: true
        SSESpecification:
          SSEEnabled: true
```

## 📝 Frontend Configuration

Update your `.env` file:
```bash
REACT_APP_API_GATEWAY_URL=https://your-api-gateway-id.execute-api.region.amazonaws.com/prod
REACT_APP_WS_URL=wss://your-websocket-api-id.execute-api.region.amazonaws.com/prod
```

## 🧪 Testing

### Local Development
Use AWS SAM or Serverless Offline for local testing:
```bash
serverless offline start
```

### API Testing
Use the provided API service in `src/services/redditCopilotApi.ts` which handles:
- Authentication headers
- Error handling  
- WebSocket connections
- Retry logic

## 📊 Monitoring

### CloudWatch Metrics
- API Gateway request/response metrics
- Lambda function duration and errors
- DynamoDB read/write capacity
- WebSocket connection counts

### Logging
- All Lambda functions log to CloudWatch
- Structured logging with correlation IDs
- Error tracking and alerting

This architecture provides a scalable, secure, and maintainable backend for the Reddit CoPilot feature using AWS serverless technologies.
