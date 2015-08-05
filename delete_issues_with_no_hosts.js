/* eslint-disable no-unused-vars */
/* globals Session Issues Meteor */

function deleteIssuesWithNoHosts () {
  // Looks at all issues and deletes
  // any Issue that has a zero (0) host count.
  // Useful if a host was removed from the project
  // and left orphaned issues behind.
  //
  //
  // Usage: deleteIssuesNoHosts()
  // Created by: Ryan Dorey
  // Requires client-side updates: true

  var projectId = Session.get('projectId')
  var orphanedIssues = Issues.find({
    'projectId': projectId,
    'hosts': {
      $size: 0
    }
  }).fetch()

  if (orphanedIssues.length < 1) {
    console.log('No orphaned issues present')
    return
  }
  orphanedIssues.forEach(function (issue) {
    console.log('Removing: ' + issue.title)
    Meteor.call('removeIssue', projectId, issue._id, function () {})
  })
  console.log('Total of ' + orphanedIssues.length + ' vuln(s) removed')
}
