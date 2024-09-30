Feature: Get JSON Data and Validate Content

  Scenario: Retrieve and validate JSON response
    Given url 'https://jsonplaceholder.typicode.com'
    And path '/posts/1'
    When method GET
    Then status 200
    And match response.id == 1
    And match response.title == 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit'
    And match response.userId == 1
