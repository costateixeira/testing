function() {
    var config = {};


    var projectRoot = java.nio.file.Paths.get('.').toAbsolutePath().normalize().toString();

    // Define a direct path to the helpers folder
    config.helpersPath = 'file:'+projectRoot + '/src/test/resources/helpers/';
    karate.log('Project root path:', config.helpersPath);

    //    var fhirHelper = karate.read('classpath:helpers/fhir-helper.js');

    // Helper function to escape quotes and handle line breaks within div elements
    function escapeDivContent(json) {
        return json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }

    // Extending the prototype of JSON objects to include a fhirpath function
    Object.prototype.fhirpath = function(expression) {
        var currPath = java.nio.file.Paths.get('.').toAbsolutePath().toString();
        var absPath = java.nio.file.Paths.get('src/test/resources/fhirpath/fhirpath.exe').toAbsolutePath().toString();
        var resourceJSON = JSON.stringify(this);
        resourceJSON = escapeDivContent(resourceJSON);
        var command = absPath + ' -e "' + expression + '" -r "' + resourceJSON + '"';
        var result = karate.exec(command).trim();
        var parsedResult;
        try {
            parsedResult = JSON.parse(result);  // Parsing the result directly as JSON
            karate.log('FHIRPath output is valid JSON.');
        } catch (e) {
            karate.log('FHIRPath output is not valid JSON. Treating as string.');
            parsedResult = result;  // Return raw result if JSON parsing fails
        }
        return parsedResult;
    };


    // Extend the prototype to add the validate method to any object
    Object.prototype.validate = function(profileUrl) {
        // The object calling validate() will be 'this', which is the resource
        var resource = this;

        // Call the validation feature
        return karate.call(config.helpersPath+'validate-resource.feature', { resource: resource, profileUrl: profileUrl }).validationResponse;
    };


    // Extend OperationOutcome response to add the parse method
    Object.prototype.countIssues = function() {
        var errorCount = 0;
        var warningCount = 0;
        var informationCount = 0;

        if (this.issue) {
            for (var i = 0; i < this.issue.length; i++) {
                var issue = this.issue[i];
                if (issue.severity === 'error') errorCount++;
                if (issue.severity === 'warning') warningCount++;
                if (issue.severity === 'information') informationCount++;
            }
        }

        return {
            errors: errorCount,
            warnings: warningCount,
            informations: informationCount
        };
    };























    return config;
}
