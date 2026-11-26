@restfulbooker
@regression
Feature: Restful-Booker API
  As an API consumer
  I want to manage bookings using authenticated requests
  So that booking lifecycle and error handling are verified

  @smoke
  Scenario: Read, replace, patch, and delete a fresh booking
    Given a fresh authenticated booking fixture exists
    When I retrieve the fixture booking
    Then the booking response matches the schema
    When I replace the fixture booking
    Then the booking reflects the replacement
    When I patch the fixture booking
    Then the booking reflects the patch
    When I delete the fixture booking
    Then the booking no longer exists

  Scenario: Reject an update with an invalid token
    Given a fresh authenticated booking fixture exists
    When I update the fixture booking with an invalid token
    Then the update is rejected as forbidden

  Scenario: Reject an invalid booking payload
    Given a fresh authenticated booking fixture exists
    When I submit an invalid booking payload
    Then the invalid payload is rejected

  Scenario: Return not found for a non-existent booking
    Given a fresh authenticated booking fixture exists
    When I retrieve a non-existent booking
    Then the booking is not found
