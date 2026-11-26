@manual
Feature: Sauce Demo and Restful-Booker scenarios
  Manual acceptance scenarios corresponding to the existing Playwright test cases.

  Scenario: Logged-out user is redirected from protected inventory
    Given I am logged out
    When I navigate directly to the inventory URL
    Then I am redirected to the login page

  Scenario: Create, read, update, and delete a Restful-Booker booking
    Given I have valid Restful-Booker API credentials
    When I create a booking, retrieve it, and update its details
    Then the booking reflects the update
    And I can delete the booking

  Scenario: Complete a purchase as a standard user
    Given I am logged in to Sauce Demo as a standard user
    When I add the backpack to my cart and complete checkout with valid details
    Then I see the order confirmation

  Scenario: Checkout requires a last name
    Given I am logged in to Sauce Demo as a standard user
    And I have added a product to my cart
    When I continue checkout without entering a last name
    Then I see a last-name validation error

  Scenario: Sort inventory and add then remove a product
    Given I am logged in to Sauce Demo as a standard user
    When I sort products by price from low to high
    Then the least expensive product appears first
    When I add a product to my cart and remove it
    Then the cart is empty

  Scenario: Invalid credentials are rejected
    Given I am on the Sauce Demo login page
    When I submit an invalid password
    Then I see a login error

  Scenario: Locked-out user cannot log in
    Given I am on the Sauce Demo login page
    When I submit the locked-out user's credentials
    Then I see a locked-out error

  Scenario: Performance-glitch user can reach inventory
    Given I am on the Sauce Demo login page
    When I log in as the performance-glitch user
    Then the inventory page eventually appears

  Scenario: Document the problem-user product image defect
    Given I am logged in to Sauce Demo as the problem user
    When I view the backpack product image
    Then the image should match the backpack product
    But the known problem-user image defect is documented
