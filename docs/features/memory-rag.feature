Feature: Personal Memory RAG System
  As a logged-in user
  I want the AI to remember important information about me
  So that I have a personalized experience across conversations

  Background:
    Given I am logged in as "user@example.com"
    And I am on the chat page
    And the pgvector extension is enabled in PostgreSQL
    And Azure OpenAI embeddings are configured

  Scenario: AI automatically stores user preference
    Given I send the message "I love pizza with extra cheese"
    When the AI processes the message
    Then the AI should decide to store this information
    And a memory should be created with content related to "pizza preference"
    And the memory should be stored with a vector embedding
    And the memory should be associated with my user account

  Scenario: AI retrieves relevant memory during conversation
    Given I have a stored memory about "loving pizza"
    When I send the message "What kind of food do I like?"
    Then the AI should retrieve the relevant memory
    And the AI response should mention my pizza preference
    And the response should be personalized based on my memory

  Scenario: Memory semantic search
    Given I have memories about various topics
    And one memory is "User is learning TypeScript"
    When I ask "What programming languages am I studying?"
    Then the AI should perform a semantic search
    And the TypeScript learning memory should be retrieved
    And the AI should answer based on this memory

  Scenario: Multiple memories for a user
    Given I have stored memories about:
      | Content                        | Category    |
      | User loves pizza               | preferences |
      | User is learning TypeScript    | work        |
      | User lives in Paris            | personal    |
    When I ask a question related to any of these topics
    Then the AI should retrieve the relevant memories
    And incorporate them into the response

  Scenario: Memory storage with categories
    Given I tell the AI "I work as a software engineer"
    When the AI stores this information
    Then the memory should be categorized as "work"
    And the category should be stored in the metadata

  Scenario: Memory privacy - user isolation
    Given I am logged in as "alice@example.com"
    And I have a memory "Alice loves chocolate"
    And another user "bob@example.com" exists with memory "Bob loves vanilla"
    When I ask "What dessert do I like?"
    Then the AI should only retrieve my memories
    And the response should mention chocolate
    And the response should not mention vanilla

  Scenario: Update existing memory
    Given I have a memory "User prefers morning meetings"
    When I tell the AI "Actually, I prefer afternoon meetings now"
    Then the AI should update the existing memory
    Or create a new memory that supersedes the old one

  Scenario: Memory similarity threshold
    Given I have a memory about "TypeScript programming"
    When I ask about "JavaScript coding"
    Then the semantic search should find the TypeScript memory
    Because the embeddings are similar enough
    And the AI should mention both TypeScript and JavaScript

  Scenario: No relevant memory found
    Given I have no memories related to sports
    When I ask "What's my favorite sport?"
    Then the AI should retrieve no memories
    And the AI should respond that it doesn't have that information
    And suggest that I can share this information

  Scenario: Memory list retrieval via API
    Given I have 5 stored memories
    When I make a GET request to "/api/memory"
    Then I should receive a list of my memories
    And each memory should include id, content, and timestamp
    And the list should be ordered by creation date

  Scenario: Manual memory deletion via API
    Given I have a memory with id "mem-123"
    When I make a DELETE request to "/api/memory/mem-123"
    Then the memory should be removed from the database
    And subsequent queries should not retrieve this memory

  Scenario: Memory reformulation
    Given I say "I really enjoy playing guitar on weekends"
    When the AI stores this as a memory
    Then the memory should be reformulated clearly
    And stored as something like "User enjoys playing guitar as a weekend hobby"
    And not stored verbatim with conversation context

  Scenario: Vector embedding generation
    Given I provide information to be remembered
    When the memory is created
    Then the text should be sent to Azure OpenAI embeddings API
    And a 1536-dimension vector should be generated
    And the vector should be stored in the Memory table
    And the vector should be indexed for fast similarity search

  Scenario: Memory retrieval with limit
    Given I have 20 stored memories
    When the AI searches for relevant memories
    Then only the top 5 most relevant memories should be retrieved
    And they should be ordered by similarity score
    And irrelevant memories should be ignored

  Scenario: Memory metadata storage
    Given I share information with contextual details
    When a memory is created
    Then optional metadata should be stored
    And metadata can include category, tags, or importance level
    And metadata should be stored as JSONB in PostgreSQL
