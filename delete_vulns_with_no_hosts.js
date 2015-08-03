var deleteVulnsNoHosts = function () {
  // Looks at all vulnerabilities and deletes 
  // any vulnerability that has a zero (0) host count. 
  // Useful if a host was removed from the project 
  // and left orphaned vulnerabilities behind. 
  //
  //
  // Usage: deleteVulnsNoHosts()
  // Created by: Ryan Dorey
  // Requires client-side updates: true

  var PROJECT_ID = Session.get('projectId')
  var orphanedVulns = Vulnerabilities.find({
    'project_id': PROJECT_ID,
    'hosts': {
      $size: 0
    }
  }).fetch()

  if (orphanedVulns.length < 1) {
    console.log('No orphaned vulnerabilities present')
    return
  }
  orphanedVulns.forEach(function (vulnerability) {
    console.log('Removing: ' + vulnerability.title)
    Meteor.call('removeVulnerability', PROJECT_ID, vulnerability._id, function (err) {})
  })
  console.log('Total of ' + orphanedVulns.length + ' vuln(s) removed')

}
