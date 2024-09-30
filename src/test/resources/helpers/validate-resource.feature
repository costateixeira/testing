Feature: Validate a FHIR Resource

  Scenario: Validate FHIR resource against a profile
    Given url validationServerUrl  + '/' + resource.resourceType + '/$validate'
    And params { profile: profileUrl }
    And headers { Accept: 'application/fhir+json;fhirVersion=4.0', 'Content-Type': 'application/fhir+json;fhirVersion=4.0' }
    And request resource
    When method post
    Then status 200

    # Define the validation response
    * def validationResponse = response
    * karate.log('Validation Response:', validationResponse)