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
    * print 'Response:', response
    And match response.resourceType == 'AllergyIntolerance'
    * def allergyID = response.id
    * assert allergyID != null
    * if (!allergyID) karate.log('allergyID is empty or null')
    * setvar('allergyID',allergyID)



  Scenario: Read the created AllergyIntolerance
  * def allergyID = getvar('allergyID')
    Given path 'AllergyIntolerance', allergyID
    When method get
    Then status 200
    And match response.resourceType == 'AllergyIntolerance'

    * def allergyID = response.id
    * assert allergyID != null

  Scenario: Read the created AllergyIntolerance
    Given path 'AllergyIntolerance', getvar('allergyID')
    When method get
    Then status 200
    And match response.resourceType == 'AllergyIntolerance'

  Scenario: Update the AllergyIntolerance
    Given path 'AllergyIntolerance', getvar('allergyID')
    And request
    """
    {
      "resourceType": "AllergyIntolerance",
      "id": "#(getvar('allergyID'))",
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
    Given path 'AllergyIntolerance', getvar('allergyID')
    When method delete
    Then status 200
