function fn() {
    var config = {};


    // Define FHIR helper functions globally
    karate.log('Initializing FHIR helper functions');

    var projectRoot = java.nio.file.Paths.get('.').toAbsolutePath().normalize().toString();

    // Define a direct path to the helpers folder
    config.helpersPath = 'file:'+projectRoot + '/src/test/resources/helpers/';
//    karate.log('Project root path:', config.helpersPath);

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



    config.createFHIRResourcesFromTable = function(table) {
        var resources = [];
        for (var i = 0; i < table.length; i++) {
            var row = table[i];
            var resource = config.createFHIRResource(row.resourceType, row);
            resources.push(resource);
        }
        return resources;
    };

    config.createFHIRResource = function(resourceType, properties) {
        var resource = { resourceType: resourceType };
    
        // Loop through the properties to set values in the FHIR resource
        for (var key in properties) {
            if (key !== 'resourceType') {
                var keys = key.split('.');
                var obj = resource;
    
                // Nested loop to handle keys with dot notation
                for (var j = 0; j < keys.length - 1; j++) {
                    var subKey = keys[j];
    
                    // Check if this key should be treated as an array (if the key ends with [])
                    if (subKey.endsWith('[]')) {
                        subKey = subKey.slice(0, -2); // Remove '[]' from the key
                        obj[subKey] = obj[subKey] || []; // Initialize as an array if not already
                        if (Array.isArray(obj[subKey]) && obj[subKey].length === 0) {
                            obj[subKey].push({}); // Initialize an empty object in the array if it's the first time
                        }
                        obj = obj[subKey][0]; // Move reference to the first object in the array
                    } else {
                        obj[subKey] = obj[subKey] || {}; // Initialize as an object if not already
                        obj = obj[subKey]; // Move reference to the object
                    }
                }
    
                // Handle the final key (whether it has '[]' or not)
                var finalKey = keys[keys.length - 1];
                if (finalKey.endsWith('[]')) {
                    finalKey = finalKey.slice(0, -2); // Remove '[]'
                    obj[finalKey] = obj[finalKey] || []; // Initialize the array if not already
                    obj[finalKey].push(properties[key]); // Push the value to the array
                } else {
                    obj[finalKey] = properties[key]; // Set the final value as an object field
                }
            }
        }
        return resource;
    };


    config.baseUrl = 'http://localhost:8081';    
    
    // Wait for a specific resource type to be posted
    config.waitFor = function(method, resourceType) {
        var timeoutSeconds = 60;
        var intervalSeconds = 5;
        var startTime = new Date().getTime();
        var timeoutMillis = timeoutSeconds * 1000;
        var intervalMillis = intervalSeconds * 1000;
        
        karate.log('Waiting for ' + method + ' ' + resourceType + ' at ' + baseUrl + ' for up to ' + timeoutSeconds + ' seconds...');
        
        while (true) {
            var elapsedTime = new Date().getTime() - startTime;
            if (elapsedTime > timeoutMillis) {
                karate.log('Timeout exceeded after ' + timeoutSeconds + ' seconds.');
                return false;
            }
            
            var response = karate.callSingle(config.helpersPath + 'get-request.feature', { method: method, path: '/' + resourceType });
            if (response.responseStatus == 200) {
                karate.log('Request found:', response.response);
                return response.response;
            }
            
            karate.log('No request yet, retrying in ' + intervalSeconds + ' seconds...');
            karate.sleep(intervalMillis);
        }
    }
    
    

    // Function to ask for user approval
    config.askApproval = function(content, user) {
        karate.log('Asking user ' + user + ' for approval...');
        // Simulate user approval logic
        // This is where you would include logic to simulate or handle asking approval
        return 'ok';  // Simulating approval response
    };

 









    

     // Get the absolute path of the project root
     config.variablesPath = 'file:'+projectRoot + '/target/globalState.json';
//     projectRoot = java.nio.file.Paths.get('.').toAbsolutePath().normalize().toString(); 
     // Set the path for the global state file in the target directory
//     var globalStateFile = projectRoot + '\\target\\globalState.json';  // Path for writing in target
 


     // Log the file path
     karate.log('Variables path:', config.variablesPath);  // Log the file path

     // Helper function to read the global state from a file
     function readGlobalState() {
         var globalState;
         try {
             var fileContent = karate.read(config.variablesPath);  
            //  karate.log('Loading global state from file:', config.variablesPath);
            //  karate.log("FileContents:"+fileContent);
             // Read using the file: prefix
             globalState = fileContent;  // Parse the JSON content to an object
         } catch (e) {
            //  karate.log('Error reading global state file:', e);
             globalState = {};  // If file doesn't exist or there's an error, initialize with an empty object
            //  karate.log('Initializing with empty state.');
         }
         return globalState;
     }
 
     // Helper function to write the global state to a file
     function writeGlobalState(globalState) {
         try {
             var jsonString = JSON.stringify(globalState, null, 2);  // Convert to JSON string
             karate.write(jsonString, 'globalState.json');  // Write to the target directory
            //  karate.log('Global state written to file:', globalStateFile);
         } catch (e) {
            //  karate.log('Error writing global state to file:', e);
         }
     }
 
     // Read the global state when initializing
     var globalState = readGlobalState();

    // Define a global method to set a variable in globalState and persist it
    karate.set('setGlobalVariable', function(key, value) {
        globalState[key] = value;  // Set the new value in the globalState
        writeGlobalState(globalState);  // Persist the updated state to the file
        // karate.log('Updated globalState after set:', globalState);  // Debug log to confirm update
    });

    // Define a global method to get a variable from globalState
    karate.set('getGlobalVariable', function(key) {
        karate.log('Fetching value for key:', key, 'from globalState:', globalState);  // Debug log
        return globalState[key];  // Return the requested value
    });

    karate.log('====== Finished defining functions ======.');
    // Define custom methods for simplified Gherkin expressions
    karate.set('setvar', function(key, value) {
        karate.get('setGlobalVariable')(key, value);  // Call the existing function
    });

    karate.set('getvar', function(key) {
        return karate.get('getGlobalVariable')(key);  // Call the existing function
    });



    




    return config;
}
