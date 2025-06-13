import { z } from "zod";
import { Logger } from "../logger";

/**
 * Configuration interface for OpenRouter service
 */
export interface OpenRouterConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Parameters for model configuration
 */
export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Custom error class for OpenRouter service
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Schema for validating service configuration
 */
const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  maxRetries: z.number().positive().optional(),
});

/**
 * Interface for chat completion options
 */
export interface ChatCompletionOptions {
  response_format?: {
    type: string;
    json_schema?: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

/**
 * OpenRouter service for interacting with OpenRouter.ai API
 */
export class OpenRouterService {
  private readonly logger: Logger;
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;

  // State management
  private currentSystemMessage = "";
  private currentUserMessage = "";
  private currentModelName = "qwen/qwen3-30b-a3b:free";
  private currentModelParameters: ModelParameters = {
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  /**
   * Creates a new instance of OpenRouterService
   * @param config Service configuration
   * @throws {OpenRouterError} If configuration is invalid
   */
  constructor(config: OpenRouterConfig) {
    this.logger = new Logger("OpenRouterService");

    try {
      // Validate configuration using Zod
      const validatedConfig = configSchema.parse(config);

      // Initialize service with validated configuration
      this.apiKey = validatedConfig.apiKey;
      this.apiUrl = validatedConfig.apiUrl || "https://openrouter.ai/api/v1";
      this.defaultTimeout = validatedConfig.timeout || 30000;
      this.maxRetries = validatedConfig.maxRetries || 3;

      this.logger.info("OpenRouter service initialized", {
        apiUrl: this.apiUrl,
        timeout: this.defaultTimeout,
        maxRetries: this.maxRetries,
      });
    } catch (error) {
      this.logger.error(error as Error, {
        config: {
          ...config,
          apiKey: "[REDACTED]",
        },
      });
      throw new OpenRouterError("Failed to initialize OpenRouter service", "INVALID_CONFIG");
    }
  }

  /**
   * Sets the system message for the chat completion
   * @param message System message to set
   * @throws {OpenRouterError} If message is invalid
   */
  public setSystemMessage(message: string): void {
    if (!this.validateMessage(message)) {
      throw new OpenRouterError("System message cannot be empty", "INVALID_SYSTEM_MESSAGE");
    }
    this.currentSystemMessage = message;
  }

  /**
   * Sets the user message for the chat completion
   * @param message User message to set
   * @throws {OpenRouterError} If message is invalid
   */
  public setUserMessage(message: string): void {
    if (!this.validateMessage(message)) {
      throw new OpenRouterError("User message cannot be empty", "INVALID_USER_MESSAGE");
    }
    this.currentUserMessage = message;
  }

  /**
   * Gets a chat completion from the OpenRouter API
   * @param options Chat completion options
   * @returns The API response
   * @throws {OpenRouterError} If the API call fails
   */
  public async getChatCompletion(options?: ChatCompletionOptions): Promise<unknown> {
    try {
      if (!this.currentSystemMessage || !this.currentUserMessage) {
        throw new OpenRouterError(
          "Both system and user messages must be set before getting a completion",
          "INVALID_STATE"
        );
      }

      const response = await this.makeRequest("/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.currentModelName,
          messages: [
            {
              role: "system",
              content: this.currentSystemMessage,
            },
            {
              role: "user",
              content: this.currentUserMessage,
            },
          ],
          ...this.currentModelParameters,
          response_format: options?.response_format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new OpenRouterError(error.message || "Failed to get chat completion", error.code || "API_ERROR");
      }

      const data = await response.json();
      try {
        const content = JSON.parse(data.choices[0].message.content);
        return content;
      } catch (parseError) {
        this.logger.info("Failed to parse JSON response, returning raw content", {
          error: parseError instanceof Error ? parseError.message : String(parseError),
        });
        return data.choices[0].message.content;
      }
    } catch (error) {
      this.logger.error(error as Error, {
        operation: "get_chat_completion",
        modelName: this.currentModelName,
      });
      throw error instanceof OpenRouterError
        ? error
        : new OpenRouterError(error instanceof Error ? error.message : "Failed to get chat completion", "API_ERROR");
    }
  }

  /**
   * Makes a request to the OpenRouter API with retry logic
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Fetch response
   */
  private async makeRequest(endpoint: string, options: RequestInit, retryCount = 0): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          "HTTP-Referer": "https://10xcards.com",
          "X-Title": "10xCards Flashcard Generator",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && (error instanceof TypeError || error instanceof Error)) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Validates a message string
   * @param message Message to validate
   * @returns true if message is valid
   */
  private validateMessage(message: string): boolean {
    return message.trim().length > 0;
  }

  getCurrentModelName(): string {
    return this.currentModelName;
  }
}
