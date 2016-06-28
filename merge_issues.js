/* eslint-disable no-unused-vars */
/* globals Session Hosts Issues Meteor */

function mergeIssues (titleRegex, minCVSS, maxCVSS, hostsRegex, newTitle, newCVSS, update) {
  // Merges all issues identified by the regular expressions into a new or existing Issue
  // provided by newTitle.
  //
  // Usage:
  // mergeIssues(/Apache/i, 7, 10, /.*/, 'Apache 2.x servers are vulnerable to multiple high risk issues', 'max', false)
  // mergeIssues(/Apache/i, 7, 10, /.*/, 'Apache 2.x servers are vulnerable to multiple high risk issues', 'max', true)
  //
  // titleRegex - regex to search titles
  // minCVSS - minimum CVSS score to include
  // maxCVSS - maximum CVSS score to include
  // hostsRegex - host IPs to include in filter
  // newTitle - title of the new Issue
  // newCVSS - new CVSS score, or choose 'max' to pick the highest CVSS score of that group
  // update - The update parameter determines whether it's a 'dry run' with output, or an actual merge. update = true will delete old entries
  //
  // Created by: Alex Lauerman and Tom Steele
  // Requires client-side updates: false

  // Do some light variable checking, you're still pretty much on your own
  if (typeof titleRegex !== 'object') {
    return console.log('Issue regex can not be a string, must be a object')
  }
  if (typeof newTitle !== 'string') {
    return console.log('Invalid title')
  }
  if (typeof newCVSS !== 'string') {
    return console.log('Invalid cvss. Variable must be a string')
  }

  var projectId = Session.get('projectId')
  var issues = Issues.find({
    'projectId': projectId,
    'title': {
      '$regex': titleRegex
    },
    'cvss': {
      '$gte': minCVSS,
      '$lte': maxCVSS
    },
    'hosts.ipv4': {
      '$regex': hostsRegex
    }
  }).fetch()
  if (issues.length < 1) {
    return console.log('Did not find any issues with the given regex')
  }

  var highestCVSS = 0

  // You can change the sort order here
  // issues.sort(sortByHostCount)
  // issues.sort(sortByTitle)
  issues.sort(sortByCVSS)
  issues.forEach(function (Issue) {
    console.log('CVSS: ' + Issue.cvss + ' - Hosts: ' + Issue.hosts.length + ' - Title: ' + Issue.title)
    if (Issue.cvss > highestCVSS) {
      highestCVSS = Issue.cvss
    }
  })

  console.log('Total found: ' + issues.length + ' Highest CVSS: ' + highestCVSS)

  if (update) {
    if (newCVSS === 'max') {
      newCVSS = highestCVSS
    }

    // If the Issue given in newTitle already exists, then we push it onto the regex list so we can combine them
    // Remove the existing Issue first
    var existingIssue = Issues.findOne({
      'projectId': projectId,
      'title': newTitle
    })
    if (typeof existingIssue !== 'undefined') {
      issues.push(existingIssue)
      Meteor.call('removeIssue', projectId, existingIssue._id)
    }
    console.log('Going to merge ' + issues.length + ' issues')

    var newDescription = ''
    var newSolution = ''
    var newEvidence = ''
    var newNotes = []
    var newReferences = []
    var cves = []
    var hostList = []
    var newFiles = []
    // Loop over each Issue and combine the data
    issues.forEach(function (Issue) {
      newDescription = newDescription + 'CVSS: ' + Issue.cvss + ' - Hosts: ' + Issue.hosts.length + ' - Title: ' + Issue.title + "\n"
      newSolution = ''
      newEvidence = ''
      newReferences = newReferences.concat(Issue.references)
      newNotes = newNotes.concat(Issue.notes)
      cves = cves.concat(Issue.cves)
      hostList = hostList.concat(Issue.hosts)
      newFiles = newFiles.concat(Issue.files)
    })
    var newHostList = unique(hostList)
    var newCVEs = unique(cves)
    // Create the new Issue
    Meteor.call('createIssue', projectId, newTitle, newCVSS, newDescription, newEvidence, newSolution, function (err, res) {
      if (err) {
        console.log('Error: could not create new Issue', err.message)
        if (existingIssue) {
          console.log('Looks like you lost', existingIssue.title)
        }
      } else {
        addExistingContentToIssue(res)
      }
    })

    return console.log('Complete')
  }

  function sortByHostCount (a, b) {
    if (a.hosts.length > b.hosts.length) {
      return -1
    }
    if (a.hosts.length < b.hosts.length) {
      return 1
    }
    return 0
  }

  function sortByTitle (a, b) {
    if (a.hosts.title > b.hosts.title) {
      return -1
    }
    if (a.hosts.title < b.hosts.title) {
      return 1
    }
    return 0
  }

  function sortByCVSS (a, b) {
    if (a.cvss > b.cvss) {
      return -1
    }
    if (a.cvss < b.cvss) {
      return 1
    }
    return 0
  }

  // Adds notes, hosts, and cves to new vulnerablity
  function addExistingContentToIssue (issueId) {
    newNotes.forEach(function (note) {
      Meteor.call('addIssueNote', projectId, issueId, note.title, note.content)
    })
    newHostList.forEach(function (host) {
      Meteor.call('addHostToIssue', projectId, issueId, host.ipv4, host.port, host.protocol)
    })
    newCVEs.forEach(function (cve) {
      Meteor.call('addCVE', projectId, issueId, cve)
    })
    newReferences.forEach(function (ref) {
      Meteor.call('addReference', projectId, issueId, ref.link, ref.name)
    })
    removeIssues()
  }

  // Loop over all issues and remove them
  function removeIssues () {
    console.log('Removing Issues')
    issues.forEach(function (Issue) {
      Meteor.call('removeIssue', projectId, Issue._id)
    })
  }

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
