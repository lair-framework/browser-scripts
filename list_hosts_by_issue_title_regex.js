/* eslint-disable no-unused-vars */
/* globals Session Hosts Meteor Issues */

function listHostsByIssueTitleRegex (issueRegex) {
  // Retrieves all host, service, protocol instances afflicted by a certain Issue
  //
  // Created by: Isaiah Sarju
  // Based on listHostsByIssueTitle Dan Kottmann & updated by Alex Lauerman
  // Usage: listHostsByIssueTitleRegex(/^SSL.*/)
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var issues = Issues.find({
    'projectId': projectId,
    'title': {
      '$regex': issueRegex
    }
  }).fetch()
  var msfHostsOutput = ''
  if (issues.length < 1) {
    console.log('No issues found')
    return
  }
  issues.forEach(function (issue) {
    console.log(issue.title)
    var hosts = issue.hosts
    hosts.forEach(function (host) {
      console.log(host.ipv4 + ':' + host.port + '/' + host.protocol)
      msfHostsOutput += host.ipv4 + ', '
    })
    console.log('RHOSTS: ' + msfHostsOutput.slice(0, -2))
    msfHostsOutput = ''
  })
}
