/* eslint-disable no-unused-vars */
/* globals Session Hosts Meteor Issues*/

function listHostsByIssueTitle (title) {
  // Retrieves all host, port, protocol instances afflicted by a certain Issue
  //
  // Created by: Dan Kottmann & updated by Alex Lauerman
  // Usage: listHostsByIssueTitle('Microsoft Windows SMB NULL Session Authentication')
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var issue = Issues.findOne({
    'projectId': projectId,
    'title': title
  })
  var msfHostsOutput = ''
  if (!issue) {
    console.log('Issue not found')
    return
  }

  var hosts = issue.hosts
  hosts.forEach(function (host) {
    console.log(host.ipv4 + ':' + host.port + '/' + host.protocol)
    msfHostsOutput += host.ipv4 + ', '
  })
  console.log('RHOSTS: ' + msfHostsOutput.slice(0, -2))
}
