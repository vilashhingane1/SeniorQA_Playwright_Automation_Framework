@todomvc
@regression
Feature: TodoMVC task management
  As a TodoMVC user
  I want to manage my todo list
  So that I can track my work

  Background:
    Given I open TodoMVC

  @smoke
  Scenario: Add a todo
    When I create a todo called "Prepare test plan"
    Then I should see a todo called "Prepare test plan"

  Scenario: Complete a todo
    Given I add a todo called "Review test results"
    When I mark the todo "Review test results" as complete
    Then the todo "Review test results" should be completed

  Scenario: Filter to active todos
    Given I add a todo called "Active task"
    And I add a todo called "Completed task"
    And I mark the todo "Completed task" as complete
    When I filter to active todos
    Then I should see only the todo "Active task"

  Scenario: Delete a todo
    Given I add a todo called "Remove this task"
    When I delete the todo "Remove this task"
    Then I should have no todos
