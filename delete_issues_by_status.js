/* eslint-disable no-unused-vars */
/* globals Session Issues Meteor */

function deleteIssuesByStatus (status) {
  // Deletes all Issues of a given status
  //
  // Usage: deleteIssuesByStatus('lair-grey')
  // Created by: Isaiah Sarju
  // Requires client-side updates: true

  var projectId = Session.get('projectId')
  var issues = Issues.find({
    'projectId': projectId,
    'status': status
  }).fetch()
  if (issues.length < 1) {
    console.log('No matching Issues found')
    return
  }
  issues.forEach(function (issue) {
    console.log('Removing ' + issue.title)
    Meteor.call('removeIssue', projectId, issue._id)
  })
  console.log('Total of ' + issues.length + ' Issue(s) removed.')
}
