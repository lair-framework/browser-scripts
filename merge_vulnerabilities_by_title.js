var mergeVulnerabilitiesByTitle = function(vulnerabilityRegex, newTitle, cvss) {
  // Merges all vulnerabilities identified by a regular expression into a new or existing vulnerability
  // provided by newTitle.
  //
  // Usage: mergeVulnerabilitiesByTitle(/^VMSA.*/, "Multiple VMWare Vulneraiblities", "10.0")
  // Created by: Tom Steele
  // Requires client-side updates: false
  //
  // I highly recommend you perform a dry run yourself and see what vulnerabilities the regex is going
  // to match, something like the following should do.
  //
  /*-------------------------------------------------------------------------------------------------
  
   var testVulnSearch = function(testRegex) {
    // Test your regex search criteria prior 
    // to using it for vuln merging in Lair. 
   
    // Created by: Ryan Dorey
    // Usage: testVulnSearch(/^.*SSH/)
    // Requires client-side updates: false
  
     var projectId = Session.get('projectId');
  
     var vulnerabilities = Vulnerabilities.find({"project_id": projectId, "title": {"$regex": testRegex}}).fetch();
     vulnerabilities.forEach(function(vulnerability) {
       console.log("Title: " + vulnerability.title + " - CVSS: " + vulnerability.cvss);
     });
     console.log("Total found: " + vulnerabilities.length);
   }
  
  -------------------------------------------------------------------------------------------------*/


  // Do some light variable checking, you're still pretty much on your own
  if (typeof vulnerabilityRegex !== 'object') {
    return console.log('Vulnerability regex can not be a string, must be a object');
  }
  if (typeof newTitle !== 'string') {
    return console.log('Invalid title');
  }
  if (typeof cvss !== 'string') {
    return console.log('Invalid cvss. Variable must be a string');
  }

  var projectId = Session.get('projectId');
  var vulnerabilities = Vulnerabilities.find({"project_id": projectId, "title": {"$regex": vulnerabilityRegex}}).fetch();
  if (vulnerabilities.length < 1) {
    return console.log('Did not find any vulnerabilities with the given regex');
  }
  // If the vulnerability given in newTitle already exists, then we push it onto the regex list so we can combine them
  // Remove the existing vulnerability first
  var existingVenerability = Vulnerabilities.findOne({"project_id": projectId, "title": newTitle});
  if (typeof existingVenerability !== 'undefined') {
    vulnerabilities.push(existingVenerability);
    Meteor.call('removeVulnerability', projectId, existingVenerability._id);
  }
  console.log('Going to merge ' + vulnerabilities.length + ' vulnerabilities');

  var newDescription = '';
  var newSolution = '';
  var newEvidence = '';
  var newNotes = [];
  var cves = [];
  var hostList = [];
  // Loop over each vulnerability and combine the data
  vulnerabilities.forEach(function(vulnerability) {
    newDescription += "\n\n" + "From " + vulnerability.title + "\n" + vulnerability.description;
    newSolution += "\n\n" + "From " + vulnerability.title + "\n" + vulnerability.solution;
    newEvidence +=  "\n\n" + "From " + vulnerability.title + "\n" + vulnerability.evidence;
    newNotes = newNotes.concat(vulnerability.notes);
    cves = cves.concat(vulnerability.cves);
    hostList = hostList.concat(vulnerability.hosts);
  });
  var newHostList = unique(hostList);
  var newCVEs = unique(cves);

  // Create the new vulnerability
  Meteor.call('addVulnerability', projectId, newTitle, cvss, newDescription, newEvidence, newSolution, function(err, res) {
    if (err) {
      console.log('Error: could not create new vulnerability', err.message);
      if (existingVenerability) {
        console.log('Looks like you lost', existingVenerability.title);
      }
    } else {
      addExistingContentToVenerability(res);
    }
  });

  return console.log('Complete');

  // Adds notes, hosts, and cves to new vulnerablity
  function addExistingContentToVenerability(vulnerabilityId) {
    newNotes.forEach(function(note) {
      Meteor.call('addVulnerabilityNote', projectId, vulnerabilityId, note.title, note.content);
    });
    newHostList.forEach(function(host) {
      Meteor.call('addHostToVulnerability', projectId, vulnerabilityId, host.string_addr, host.port, host.protocol);
    });
    newCVEs.forEach(function(cve) {
      Meteor.call('addCve', projectId, vulnerabilityId, cve);
    });
    removeVulnerabilities();
  }

  // Loop over all vulnerabilities and remove them
  function removeVulnerabilities() {
    vulnerabilities.forEach(function(vulnerability) {
      Meteor.call('removeVulnerability', projectId, vulnerability._id);
    });
  }

  // I found this off the internet
  function unique(arr) {
    var hash = {}, result = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
      var objString = JSON.stringify(arr[i]);
      if (!hash.hasOwnProperty(objString)) { 
        hash[objString] = true;
        result.push(arr[i]);
      }
    }
    return result;
  }
};
