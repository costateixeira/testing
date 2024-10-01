Feature: Create and validate a FHIR Patient resource

  Background:

  * def baseUrl = 'https://hapi.fhir.org/baseR4'
  * def validationServerUrl = 'https://hapi.fhir.org/baseR4'

  Scenario: Validate the FHIR resource using the prepared request
    Given url baseUrl
    And path 'Patient'
    When method get
    Then status 200

    * def responseContent = response

    # Prepare the validation request using the utility function
    * def validationResponse = responseContent.entry[0].resource.validate('http://hl7.org/fhir/StructureDefinition/Bundle')

    # Log the validation response
    * karate.log('Validation Response:', validationResponse)

    # Assert that the validation response is an OperationOutcome
    * assert validationResponse.resourceType == 'OperationOutcome'
    * karate.log('Issues:', validationResponse.countIssues())

    * assert validationResponse.countIssues().errors == 0


    
Scenario: Create multiple FHIR resources from a table
    * table fhirTable
    | resourceType | id | name[].given[] | name[].family | gender |
    | "Patient"    | "p1" | "John"       | "Doe"         | "male"   |
    | "Patient"    | "p2" | "Jane"       |             | "female" |

    * def fhirResources = createFHIRResourcesFromTable(fhirTable)
    * karate.log(fhirResources[1])

#    # Validate the resources
    * match fhirResources[0].name[0].given == ['John']
#    * match fhirResources[1].name[0].family == ''

