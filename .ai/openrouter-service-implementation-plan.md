# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service is a TypeScript class that provides a type-safe interface for interacting with the OpenRouter.ai API. It handles configuration, message management, and model parameters while ensuring proper error handling and security practices.

### Core Features

- Configuration management with validation
- System and user message handling
- Model selection and parameter management
- Structured response format handling
- Comprehensive error handling
- Retry mechanism for failed requests

## 2. Constructor

The constructor initializes the service with required configuration parameters:

```typescript
interface OpenRouterConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

constructor(config: OpenRouterConfig)
```

Configuration validation is performed using Zod schema:

```typescript
const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  maxRetries: z.number().positive().optional(),
});
```

## 3. Public Methods and Fields

### Message Management

```typescript
setSystemMessage(message: string): void
setUserMessage(message: string): void
setModel(name: string, parameters?: ModelParameters): void
```

### Chat Completion

```typescript
async getChatCompletion(options?: CompletionOptions): Promise<ApiResponse>
```

### Configuration

```typescript
updateConfig(config: Partial<OpenRouterConfig>): void
```

## 4. Private Methods and Fields

### State Management

```typescript
private currentSystemMessage: string
private currentUserMessage: string
private currentModelName: string
private currentModelParameters: ModelParameters
private currentResponseFormat?: Record<string, unknown>
```

### Utility Methods

```typescript
private validateMessage(message: string): boolean
private handleApiError(error: Error): OpenRouterError
private buildRequestPayload(): RequestPayload
```

## 5. Error Handling

### Custom Error Types

```typescript
class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
  }
}
```

### Error Scenarios

1. Configuration Errors

   - Invalid API key
   - Invalid URL format
   - Invalid timeout/retry values

2. Message Errors

   - Empty messages
   - Invalid message format
   - Message size limits

3. API Errors

   - Network timeouts
   - Rate limiting
   - Authentication failures
   - Invalid responses

4. Model Errors
   - Unsupported models
   - Invalid parameters
   - Response format validation failures

## 6. Security Considerations

1. API Key Management

   - Store API keys in environment variables
   - Redact keys from logs
   - Implement key rotation mechanism

2. Request/Response Security

   - Use HTTPS only
   - Validate all inputs
   - Sanitize responses
   - Implement request signing if required

3. Error Handling Security
   - Avoid exposing internal errors
   - Log securely
   - Implement rate limiting

## 7. Step-by-Step Implementation Plan

### Phase 1: Basic Setup

1. Create service class with constructor
2. Implement configuration validation
3. Set up basic error handling

### Phase 2: Message Management

1. Implement system message handling
2. Implement user message handling
3. Add message validation

### Phase 3: Model Management

1. Implement model selection
2. Add parameter management
3. Create response format handling

### Phase 4: API Integration

1. Implement request building
2. Add response handling
3. Implement retry mechanism

### Phase 5: Error Handling

1. Create custom error types
2. Implement error handling for all scenarios
3. Add logging

### Phase 6: Security

1. Implement API key management
2. Add request/response security
3. Set up secure logging

### Phase 7: Testing

1. Unit tests for all components
2. Integration tests
3. Security tests

## Example Usage

```typescript
const router = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: 30000,
  maxRetries: 3,
});

router.setSystemMessage("You are a helpful assistant.");
router.setUserMessage("What is the weather like today?");
router.setModel("openai/gpt-3.5-turbo", {
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
});

const response = await router.getChatCompletion({
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "weather_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          temperature: { type: "number" },
          conditions: { type: "string" },
          forecast: { type: "string" },
        },
        required: ["temperature", "conditions"],
      },
    },
  },
});
```

## Implementation Notes

1. Use TypeScript strict mode
2. Follow the project's error handling guidelines
3. Implement proper logging
4. Add comprehensive documentation
5. Follow security best practices
6. Add proper test coverage
7. Consider performance optimization
8. Implement proper state management
