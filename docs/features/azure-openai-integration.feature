Feature: Azure OpenAI Integration
  As a system
  I want to integrate with Azure OpenAI services
  So that the chat application can provide AI-powered responses

  Background:
    Given Azure OpenAI is configured with environment variables
    And the API key is valid
    And the endpoint is "https://oaixrpdev001.openai.azure.com/"
    And the API version is "2024-02-15-preview"

  Scenario: GPT-4o chat completion request
    Given I have a user message "Hello, what's the weather like?"
    When I send a request to Azure OpenAI chat completion
    And I use deployment name "gpt-4o"
    Then I should receive a valid response
    And the response should contain generated text
    And the response should include token usage information

  Scenario: Text embedding generation
    Given I have text "User loves programming in TypeScript"
    When I send a request to Azure OpenAI embeddings
    And I use deployment name "text-embedding-3-large"
    Then I should receive a vector embedding
    And the embedding should have 1536 dimensions
    And the embedding should be an array of floating-point numbers

  Scenario: Chat with conversation history
    Given I have a conversation history with messages:
      | Role      | Content                    |
      | system    | You are a helpful assistant|
      | user      | My name is Alice           |
      | assistant | Nice to meet you, Alice!   |
      | user      | What's my name?            |
    When I send the conversation to Azure OpenAI
    Then the assistant should respond with "Alice"
    Because it has access to the conversation context

  Scenario: Temperature and parameter configuration
    Given I configure the chat model with temperature 0.7
    And I set max_tokens to 150
    When I send a request to Azure OpenAI
    Then the response should respect these parameters
    And the creativity level should be moderate
    And the response should not exceed 150 tokens

  Scenario: API authentication failure
    Given the Azure OpenAI API key is invalid
    When I try to make a request
    Then I should receive a 401 authentication error
    And the error should be caught and handled gracefully
    And the user should see a friendly error message

  Scenario: API rate limiting
    Given I send many requests in quick succession
    When the rate limit is reached
    Then I should receive a 429 rate limit error
    And the application should implement retry logic with backoff
    And subsequent requests should succeed after waiting

  Scenario: Deployment name validation
    Given I try to use a non-existent deployment name
    When I make a request to Azure OpenAI
    Then I should receive a 404 not found error
    And the error should indicate the deployment doesn't exist

  Scenario: Function calling with tools
    Given I have defined memory tools for the agent
    When I send a message that requires tool usage
    Then Azure OpenAI should return a function call
    And the function name and arguments should be included
    And I should execute the tool and send results back

  Scenario: Streaming response
    Given I enable streaming for chat completions
    When I send a request to Azure OpenAI
    Then I should receive response chunks as they are generated
    And each chunk should contain a delta of the response
    And the final message should be assembled from all chunks

  Scenario: Token counting
    Given I send a message to Azure OpenAI
    When I receive the response
    Then the response should include prompt_tokens count
    And the response should include completion_tokens count
    And the total_tokens should equal prompt + completion

  Scenario: System message configuration
    Given I configure a system message with instructions
    When the AI processes user messages
    Then the AI behavior should follow the system instructions
    And the system message should not be visible to the user

  Scenario: Error handling for service outage
    Given Azure OpenAI service is temporarily unavailable
    When I try to make a request
    Then I should receive a service unavailable error
    And the application should retry the request
    And if retries fail, show an appropriate error message

  Scenario: Multi-turn conversation with tools
    Given the AI has access to memory tools
    And I say "Remember that I like pizza"
    When the AI stores this memory
    And I later ask "What food do I like?"
    Then the AI should retrieve the memory
    And use it to generate a personalized response

  Scenario: Environment variable configuration
    Given the following environment variables are set:
      | Variable                                | Value                                      |
      | AZURE_OPENAI_API_KEY                   | <valid-key>                                |
      | AZURE_OPENAI_INSTANCE_NAME             | oaixrpdev001                               |
      | AZURE_OPENAI_ENDPOINT                  | https://oaixrpdev001.openai.azure.com/     |
      | AZURE_OPENAI_API_VERSION               | 2024-02-15-preview                         |
      | AZURE_OPENAI_DEPLOYMENT_NAME           | gpt-4o                                     |
      | AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME | text-embedding-3-large                     |
    Then the application should initialize successfully
    And all AI features should be available
