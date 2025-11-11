Feature: LangSmith Monitoring and Tracing
  As a developer
  I want to monitor and trace LangChain operations
  So that I can debug issues and analyze performance

  Background:
    Given LangSmith is configured with environment variables
    And LANGCHAIN_TRACING_V2 is set to "true"
    And LANGCHAIN_API_KEY is valid
    And LANGCHAIN_PROJECT is set to "busy-chat-app"

  Scenario: Trace a simple chat interaction
    Given LangSmith tracing is enabled
    And I am logged in and on the chat page
    When I send a message "Hello, how are you?"
    Then a trace should be created in LangSmith
    And the trace should include the LangChain invocation
    And the trace should show the prompt sent to Azure OpenAI
    And the trace should show the AI response
    And the trace should include timing information

  Scenario: Trace memory tool usage
    Given LangSmith tracing is enabled
    When I send a message "Remember that I love TypeScript"
    And the AI decides to store this memory
    Then the trace should show the store_memory tool call
    And the tool input should be visible in the trace
    And the tool output should show success or failure
    And the embedding generation should be traced

  Scenario: Trace retrieval of memories
    Given I have stored memories
    And LangSmith tracing is enabled
    When I ask "What programming languages do I like?"
    Then the trace should show the retrieve_memories tool call
    And the semantic search query should be visible
    And the retrieved memories should be shown in the trace
    And the similarity scores should be included

  Scenario: View trace in LangSmith dashboard
    Given I have sent several messages
    When I open the LangSmith dashboard
    And I select the "busy-chat-app" project
    Then I should see a list of all traces
    And each trace should show execution time
    And each trace should show token usage
    And each trace should show estimated cost

  Scenario: Trace with multiple tool calls
    Given LangSmith tracing is enabled
    When I have a conversation that involves:
      | Action           | Description                    |
      | Retrieve memory  | Search for existing information|
      | Chat completion  | Generate AI response           |
      | Store memory     | Save new information           |
    Then the trace should show all three operations
    And the operations should be in chronological order
    And the dependencies between operations should be clear

  Scenario: Disable LangSmith tracing
    Given LANGCHAIN_TRACING_V2 is set to "false"
    When I send a message
    Then no traces should be sent to LangSmith
    And the application should work normally
    And there should be no performance impact from tracing

  Scenario: LangSmith API key validation
    Given LANGCHAIN_API_KEY is invalid
    When the application starts
    Then LangSmith tracing should fail gracefully
    And the application should continue to work
    And an error should be logged about invalid API key

  Scenario: Trace error scenarios
    Given LangSmith tracing is enabled
    And Azure OpenAI service returns an error
    When I send a message
    Then the trace should capture the error
    And the error message should be visible in LangSmith
    And the error stack trace should be included
    And I can debug the issue using the trace

  Scenario: Token usage analysis
    Given I have had multiple conversations
    When I view traces in LangSmith
    Then I should see total tokens used per conversation
    And I should see breakdown of prompt vs completion tokens
    And I should see cost estimates based on token usage

  Scenario: Trace filtering by user
    Given multiple users are using the application
    When I filter traces by user identifier
    Then I should only see traces for that specific user
    And user privacy should be maintained

  Scenario: Performance analysis
    Given I have accumulated traces over time
    When I analyze traces in LangSmith
    Then I should see average response times
    And I should identify slow operations
    And I should see which tools are used most frequently

  Scenario: Trace export for analysis
    Given I have traces in LangSmith
    When I export trace data
    Then I should receive structured data
    And the data should include all trace details
    And I can use the data for custom analysis

  Scenario: Custom metadata in traces
    Given LangSmith tracing is enabled
    When a trace is created
    Then it should include custom metadata like:
      | Metadata      | Example Value              |
      | user_id       | usr_123                    |
      | conversation_id | conv_456                 |
      | environment   | production                 |
      | version       | 1.0.0                      |

  Scenario: Trace retention and cleanup
    Given traces are stored in LangSmith
    Then traces should be retained according to the plan
    And old traces should be automatically cleaned up
    And I should be able to configure retention policies
