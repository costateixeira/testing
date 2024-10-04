Feature: FHIR AllergyIntolerance API tests

  Background:
    * url baseURL = 'https://hapi.fhir.org/baseR4'
    * def bearerToken = 'your_bearer_token_here'
    * header Authorization = 'Bearer ' + bearerToken
    * def pseudoToken = 'your_pseudo_token_here'
    * def allergyIntolerancePayload = read('AllergyIntolerance.json')
    * configure headers = { Accept: 'application/fhir+json', Content-Type: 'application/fhir+json', Prefer: 'return=representation' }

  Scenario: Create an AllergyIntolerance
    # Generate timestamp in the required format
    * def timestamp = new java.text.SimpleDateFormat('yyyy-MM-dd').format(new java.util.Date())

    # Replace placeholders in JSON file with actual values
    * replace allergyIntolerancePayload.pseudoToken = pseudoToken
    * replace allergyIntolerancePayload.recordedDate = timestamp

    Given path 'AllergyIntolerance'
    And request allergyIntolerancePayload
    When method post
    Then status 201
    And match response.resourceType == 'AllergyIntolerance'
    * def allergyID = 45065534
    * def allergyID = response.id 
 
    # Add logging to verify that allergyID is set
    * print 'AllergyIntolerance ID:', allergyID
    * assert allergyID != null


  Scenario: Read the created AllergyIntolerance
    Given path 'AllergyIntolerance', allergyID
    When method get
    Then status 200
    And match response.resourceType == 'AllergyIntolerance'

  Scenario: Update the AllergyIntolerance
    Given path 'AllergyIntolerance', allergyID
    And request
    """
    {
      "resourceType": "AllergyIntolerance",
      "id": allergyID,
      "clinicalStatus": {
        "coding": [{
          "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
          "code": "resolved",
          "display": "Resolved"
        }]
      }
    }
    """
    When method put
    Then status 200
    And match response.clinicalStatus.coding[0].code == 'resolved'

  Scenario: Delete the AllergyIntolerance
    Given path 'AllergyIntolerance', allergyID
    When method delete
    Then status 204
