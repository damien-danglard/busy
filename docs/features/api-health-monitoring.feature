Feature: API Health and Monitoring
  As an operator
  I want to monitor the health of the application
  So that I can ensure uptime and diagnose issues

  Background:
    Given the chat application is deployed
    And all services are running

  Scenario: Health check endpoint responds
    When I make a GET request to "/api/health"
    Then I should receive a 200 OK response
    And the response should contain JSON data
    And the response should include status "ok"

  Scenario: Health check includes service status
    When I make a GET request to "/api/health"
    Then the response should include database status
    And the response should include Azure OpenAI status
    And each service should show "healthy" or "unhealthy"

  Scenario: Database connectivity check
    Given the database is running
    When the health check queries the database
    Then it should successfully connect
    And it should execute a simple query
    And the database status should be "healthy"

  Scenario: Database connectivity failure
    Given the database is not accessible
    When the health check queries the database
    Then it should fail to connect
    And the database status should be "unhealthy"
    And the overall health check should return 503 Service Unavailable

  Scenario: Azure OpenAI connectivity check
    Given Azure OpenAI is accessible
    When the health check tests Azure OpenAI
    Then it should successfully authenticate
    And the Azure OpenAI status should be "healthy"

  Scenario: Multiple concurrent health checks
    Given multiple monitoring systems query the health endpoint
    When concurrent requests are made to "/api/health"
    Then all requests should be handled successfully
    And response times should be under 1 second
    And no database connection pool exhaustion should occur

  Scenario: Health check caching
    Given health checks are expensive operations
    When multiple health check requests are made within 30 seconds
    Then the results should be cached
    And subsequent requests should use cached results
    And the cache should expire after 30 seconds

  Scenario: Detailed health check for debugging
    When I make a GET request to "/api/health?detailed=true"
    Then I should receive detailed information including:
      | Information       | Description                          |
      | Node.js version   | Runtime version                      |
      | Memory usage      | Current memory consumption           |
      | Uptime            | Time since server started            |
      | Environment       | production/development               |
      | Database version  | PostgreSQL version                   |

  Scenario: Liveness probe for Kubernetes
    Given the application is deployed in Kubernetes
    When Kubernetes queries the liveness probe
    Then the endpoint should respond quickly
    And a 200 status indicates the application is alive
    And a non-200 status triggers pod restart

  Scenario: Readiness probe for Kubernetes
    Given the application is starting up
    When Kubernetes queries the readiness probe
    Then the endpoint should return 503 until fully ready
    And return 200 when ready to accept traffic
    And this prevents premature traffic routing
