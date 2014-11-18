var mergeVulnerabilities = function(titleRegex, minCVSS, maxCVSS, hostsRegex, newTitle, newCVSS, update) {
  // Merges all vulnerabilities identified by the regular expressions into a new or existing vulnerability
  // provided by newTitle.  The update parameter determines whether it's a "dry run" with output, or an actual merge.
  //
  // Usage: 
  // mergeVulnerabilitiesByTitle(/Apache/i, 7.0, 10, /.*/, "Apache 2.x servers are vulnerable to multiple high risk issues", "10", false); 
  // mergeVulnerabilitiesByTitle(/Apache/i, 7.0, 10, /.*/, "Apache 2.x servers are vulnerable to multiple high risk issues", "10", true);
  // Created by: Alex Lauerman and Tom Steele
  // Requires client-side updates: false
  //
  //
  //-------------------------------------------------------------------------------------------------
  
  // Do some light variable checking (not on all params), you're still pretty much on your own
  if (typeof titleRegex !== 'object') {
    return console.log('Vulnerability regex can not be a string, must be a object');
  }
  if (typeof newTitle !== 'string') {
    return console.log('Invalid title');
  }
  if (typeof newCVSS !== 'string') {
    return console.log('Invalid cvss. Variable must be a string');
  }
  
  var projectId = Session.get('projectId');
  var vulnerabilities = Vulnerabilities.find({"project_id": projectId, "title": {"$regex": titleRegex} , "cvss": {"$gte": minCVSS, "$lte":maxCVSS}, "hosts.string_addr": {"$regex": hostsRegex}  }).fetch();//}).fetch();
  if (vulnerabilities.length < 1) {
    return console.log('Did not find any vulnerabilities with the given regex');
  }
 	 
	 var highestCVSS = 0;
	 
	 //You can change the sort order here
	 //vulnerabilities.sort(sortByHostCount)
	 //vulnerabilities.sort(sortByTitle);
	 vulnerabilities.sort(sortByCVSS);
	 
	 vulnerabilities.forEach(function(vulnerability) {
	   console.log("CVSS: " + vulnerability.cvss + " - Hosts: " + vulnerability.hosts.length + " - Title: " + vulnerability.title);
	   if(vulnerability.cvss > highestCVSS)
		highestCVSS = vulnerability.cvss;
	 });

	 console.log("Total found: " + vulnerabilities.length + " Highest CVSS: " + highestCVSS);

	 if (update != false) //do the update
	{
		if(newCVSS == "max")
		{
			newCVSS = highestCVSS;
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
		newDescription = ""; 
		newSolution = "";
		newEvidence = "";
		newNotes = newNotes.concat(vulnerability.notes);
		cves = cves.concat(vulnerability.cves);
		hostList = hostList.concat(vulnerability.hosts);
	  });
	  var newHostList = unique(hostList);
	  var newCVEs = unique(cves);
	  // Create the new vulnerability
	  Meteor.call('addVulnerability', projectId, newTitle, newCVSS, newDescription, newEvidence, newSolution, function(err, res) {
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
	 
	 
	}

function sortByHostCount(a,b) {
  if (a.hosts.length > b.hosts.length)
     return -1;
  if (a.hosts.length < b.hosts.length)
    return 1;
  return 0;
}

function sortByTitle(a,b) {
  if (a.hosts.title > b.hosts.title)
     return -1;
  if (a.hosts.title < b.hosts.title)
    return 1;
  return 0;
}

function sortByCVSS(a,b) {
  if (a.cvss > b.cvss)
     return -1;
  if (a.cvss < b.cvss)
    return 1;
  return 0;
}
  

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
	  console.log('Removing Vulns');
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
