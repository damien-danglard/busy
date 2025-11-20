Feature: AI Chat Conversation
  As a logged-in user
  I want to chat with an AI assistant
  So that I can get help with my tasks and questions

  Background:
    Given I am logged in as "user@example.com"
    And I am on the chat page
    And Azure OpenAI is configured and accessible

  Scenario: Send a simple message to the AI
    Given the chat is empty
    When I type "Hello, how are you?" in the message input
    And I click the send button
    Then I should see my message displayed in the chat
    And I should see the AI typing indicator
    And I should receive a response from the AI within 10 seconds
    And the AI response should be displayed in the chat

  Scenario: Conversation context is maintained
    Given I have sent the message "My name is Alice"
    And the AI has responded
    When I send the message "What is my name?"
    Then the AI response should mention "Alice"

  Scenario: Multiple messages in conversation
    Given I have sent multiple messages
    When I send a new message
    Then all previous messages should still be visible
    And the new message should be added to the conversation
    And the AI should have access to the full conversation history

  Scenario: Empty message handling
    Given the chat input is empty
    When I try to send the message
    Then the message should not be sent
    And no API call should be made

  Scenario: Long message handling
    Given I type a very long message (over 4000 characters)
    When I send the message
    Then the message should be sent successfully
    Or I should see a warning about message length limits

  Scenario: API error handling
    Given Azure OpenAI service is unavailable
    When I send a message "Hello"
    Then I should see an error message
    And I should be able to retry sending the message

  Scenario: Real-time streaming response
    Given I send a message "Tell me a story"
    Then I should see the AI response appearing word by word
    And the typing indicator should show while streaming
    And the full response should be saved after streaming completes

  Scenario: Code snippet in conversation
    Given I ask "Show me a JavaScript function to reverse a string"
    When the AI responds with code
    Then the code should be properly formatted
    And syntax highlighting should be applied

  Scenario: New conversation
    Given I have an ongoing conversation
    When I start a new conversation
    Then the previous messages should be cleared
    And I should see an empty chat interface
    And the AI should not have access to previous conversation context

  Scenario: Message timestamp display
    Given I send a message
    Then each message should display a timestamp
    And the timestamp should show the time the message was sent

  Scenario: Chat history persistence
    Given I have an active conversation with several messages
    When I refresh the page
    Then all my previous messages should still be visible
    And the conversation state should be restored

  Scenario: Rate limiting
    Given I have sent many messages in quick succession
    When I try to send another message
    Then I might see a rate limit message
    And I should wait before sending more messages
