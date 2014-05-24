var deleteVulnsNoHosts = function() {
  // Looks at all vulnerabilities and deletes 
  // any vulnerability that has a zero (0) host count. 
  // Useful if a host was removed from the project 
  // and left orphaned vulnerabilities behind. 
  //
  //
  // Usage: deleteVulnsNoHosts()
  // Created by: Ryan Dorey
  // Requires client-side updates: true


  var PROJECT_ID = Session.get('projectId');
  var vulns = Vulnerabilities.find({'project_id': PROJECT_ID, 'hosts': {$size: 0}}).fetch();

  if(typeof vulns === 'undefined' || vulns.length === 0) {
    console.log("No orphaned vulnerabilities present");
  } else {
    var c = 0;
    vulns.forEach(function(vulnerability) {
      var vulnCount = Vulnerabilities.find({'project_id': PROJECT_ID, 'hosts': {$size: 0}}).count();
      var vulnId = vulnerability._id;
      if(vulnCount > 0) {
      c++;
        console.log("Removing: " + vulnerability.title);
        Meteor.call('removeVulnerability', PROJECT_ID, vulnId, function(err) {});
       }
    });
    console.log("Total of " + c + " vuln(s) removed")
  }
};