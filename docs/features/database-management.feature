Feature: Database Management with Prisma
  As a developer
  I want to manage database schema and migrations using Prisma
  So that the database structure is versioned and reproducible

  Background:
    Given Prisma is configured with PostgreSQL
    And the database connection is established
    And pgvector extension is available

  Scenario: Apply initial database migration
    Given the database is empty
    When I run "npx prisma migrate deploy"
    Then all migrations should be applied in order
    And the database schema should match the Prisma schema
    And the _prisma_migrations table should track applied migrations

  Scenario: Create a new migration
    Given I have modified the schema.prisma file
    And I have added a new field to the User model
    When I run "npx prisma migrate dev --name add_user_field"
    Then a new migration folder should be created
    And the migration SQL file should contain the ALTER TABLE statement
    And the migration should be applied to the database
    And Prisma Client should be regenerated

  Scenario: Prisma Client generation
    Given the schema.prisma file is up to date
    When I run "npx prisma generate"
    Then the Prisma Client should be generated
    And TypeScript types should be created for all models
    And the client should be available in node_modules/@prisma/client

  Scenario: Database schema validation
    Given the Prisma schema has User, Message, Memory, and Conversation models
    Then the User model should have fields: id, email, name, password, createdAt, updatedAt
    And the Message model should have fields: id, content, role, conversationId, createdAt, updatedAt
    And the Memory model should have fields: id, userId, content, embedding, metadata, createdAt, updatedAt
    And the Conversation model should have fields: id, userId, createdAt, updatedAt

  Scenario: Foreign key relationships
    Given the database schema is applied
    Then Message.conversationId should reference Conversation.id
    And Memory.userId should reference User.id
    And Conversation.userId should reference User.id
    And cascade deletes should be configured appropriately

  Scenario: Unique constraints
    Given the database schema is applied
    Then User.email should have a unique constraint
    And duplicate emails should be prevented at database level

  Scenario: Vector field in Memory model
    Given the Memory model has an embedding field
    Then the field should use pgvector's vector type
    And the dimension should be 1536 for text-embedding-3-large
    And vector similarity operations should be supported

  Scenario: Database migration rollback
    Given I have applied a migration that causes issues
    When I need to rollback the migration
    Then I should use Prisma migrate reset or manual rollback
    And the database should return to the previous state

  Scenario: Migration history consistency
    Given migrations are tracked in _prisma_migrations table
    Then the table should contain: migration_name, finished_at, applied_steps_count
    And migrations should be applied in chronological order
    And migration names should follow the format: YYYYMMDDHHMMSS_description

  Scenario: Schema drift detection
    Given the database schema has been manually modified
    When I run "npx prisma db pull"
    Then Prisma should detect the changes
    And generate an updated schema.prisma file
    Or warn about schema drift

  Scenario: Seed data creation
    Given I have a seed script in prisma/seed.ts
    When I run "npx prisma db seed"
    Then the seed data should be inserted
    And a demo user should be created
    And initial data should be available for testing

  Scenario: Connection pooling
    Given multiple requests are made simultaneously
    Then Prisma should manage database connections efficiently
    And connections should be reused from the pool
    And the connection limit should not be exceeded

  Scenario: Transaction support
    Given I need to perform multiple related database operations
    When I use Prisma.$transaction()
    Then all operations should succeed together
    Or all should fail together
    And data consistency should be maintained

  Scenario: Raw SQL query execution
    Given I need to perform a complex query with pgvector
    When I use prisma.$queryRaw with Prisma.sql template tag
    Then the query should be executed safely
    And SQL injection should be prevented
    And results should be returned as typed objects

  Scenario: Prisma Studio for data inspection
    Given I run "npx prisma studio"
    When the Prisma Studio UI opens
    Then I should see all database tables
    And I should be able to view and edit records
    And changes should be reflected in the database
