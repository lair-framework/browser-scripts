function dumpIssueEvidence () {
  // Dump the contents of issue evidence
  //
  // Usage: dumpIssueEvidence()
  // Created by: Matt Burch
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var issues = Issues.find({
    projectId, projectId
  }).fetch()

  issues.forEach( function(issue) {
    console.log(issue.title)
    console.log(issue.evidence)
  })
}
