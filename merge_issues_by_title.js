/* eslint-disable no-unused-vars */
/* globals Session Hosts Issues Meteor */

function mergeIssuesByTitle (issueRegex, newTitle, cvss) {
  // Merges all issues identified by a regular expression into a new or existing Issue
  // provided by newTitle.
  //
  // Usage: mergeIssuesByTitle(/^VMSA.*/, 'Multiple VMWare Vulneraiblities', '10.0')
  // Created by: Tom Steele
  // Requires client-side updates: false
  //
  // I highly recommend you perform a dry run yourself and see what issues the regex is going
  // to match, something like the following should do.
  //
  /*

   var testVulnSearch = function(testRegex) {
    // Test your regex search criteria prior
    // to using it for vuln merging in Lair.

    // Created by: Ryan Dorey
    // Usage: testVulnSearch(/^.*SSH/)
    // Requires client-side updates: false

     var projectId = Session.get('projectId')

     var issues = Issues.find({'projectId': projectId, 'title': {'$regex': testRegex}}).fetch()
     issues.forEach(function(Issue) {
       console.log('Title: ' + Issue.title + ' - CVSS: ' + Issue.cvss)
     })
     console.log('Total found: ' + issues.length)
   }

   */

  // Do some light variable checking, you're still pretty much on your own
  if (typeof issueRegex !== 'object') {
    return console.log('Issue regex can not be a string, must be a object')
  }
  if (typeof newTitle !== 'string') {
    return console.log('Invalid title')
  }
  if (typeof cvss !== 'string') {
    return console.log('Invalid cvss. Variable must be a string')
  }

  var projectId = Session.get('projectId')
  var issues = Issues.find({
    'projectId': projectId,
    'title': {
      '$regex': issueRegex
    }
  }).fetch()
  if (issues.length < 1) {
    return console.log('Did not find any issues with the given regex')
  }
  // If the Issue given in newTitle already exists, then we push it onto the regex list so we can combine them
  // Remove the existing Issue first
  var existingVenerability = Issues.findOne({
    'projectId': projectId,
    'title': newTitle
  })
  if (typeof existingVenerability !== 'undefined') {
    issues.push(existingVenerability)
    Meteor.call('removeIssue', projectId, existingVenerability._id)
  }
  console.log('Going to merge ' + issues.length + ' issues')

  var newDescription = ''
  var newSolution = ''
  var newEvidence = ''
  var newNotes = []
  var cves = []
  var hostList = []
  // Loop over each Issue and combine the data
  issues.forEach(function (Issue) {
    newDescription += '\n\n' + 'From ' + Issue.title + '\n' + Issue.description
    newSolution += '\n\n' + 'From ' + Issue.title + '\n' + Issue.solution
    newEvidence += '\n\n' + 'From ' + Issue.title + '\n' + Issue.evidence
    newNotes = newNotes.concat(Issue.notes)
    cves = cves.concat(Issue.cves)
    hostList = hostList.concat(Issue.hosts)
  })
  var newHostList = unique(hostList)
  var newCVEs = unique(cves)

  // Create the new Issue
  Meteor.call('createIssue', projectId, newTitle, cvss, newDescription, newEvidence, newSolution, function (err, res) {
    if (err) {
      console.log('Error: could not create new Issue', err.message)
      if (existingVenerability) {
        console.log('Looks like you lost', existingVenerability.title)
      }
    } else {
      addExistingContentToVenerability(res)
    }
  })

  return console.log('Complete')

  // Adds notes, hosts, and cves to new vulnerablity
  function addExistingContentToVenerability (IssueId) {
    newNotes.forEach(function (note) {
      Meteor.call('addIssueNote', projectId, IssueId, note.title, note.content)
    })
    newHostList.forEach(function (host) {
      Meteor.call('addHostToIssue', projectId, IssueId, host.ipv4, host.port, host.protocol)
    })
    newCVEs.forEach(function (cve) {
      Meteor.call('addCve', projectId, IssueId, cve)
    })
    removeIssues()
  }

  // Loop over all issues and remove them
  function removeIssues () {
    issues.forEach(function (Issue) {
      Meteor.call('removeIssue', projectId, Issue._id)
    })
  }

  // I found this off the internet
  function unique (arr) {
    var hash = {}
    var result = []
    for (var i = 0, l = arr.length; i < l; ++i) {
      var objString = JSON.stringify(arr[i])
      if (!hash.hasOwnProperty(objString)) {
        hash[objString] = true
        result.push(arr[i])
      }
    }
    return result
  }
}
