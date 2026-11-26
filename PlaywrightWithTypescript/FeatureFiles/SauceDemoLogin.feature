
@SauceDemo
@smoke @regression
Feature: Sauce Demo login
  As a Sauce Demo user
  I want to sign in with valid credentials
  So that I can view the product inventory

  Scenario: Standard user logs in successfully
    Given I open the Sauce Demo login page
    When I log in as the standard user
    Then I should see the product inventory
