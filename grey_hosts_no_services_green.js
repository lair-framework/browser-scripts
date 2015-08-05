/* eslint-disable no-unused-vars */
/* globals Session Hosts Meteor Services */

function greyHostsNoServicesGreen () {
  // Loops through each host from the selected project
  // and changes the status of any gray hosts with no open services
  // to green
  //
  // Usage: greyHostsNoServicesGreen()
  // Created by: Dan Kottmann
  // Requires client-side updates: true

  var projectId = Session.get('projectId')
  var modifiedBy = Meteor.user().emails[0].address
  var hosts = Hosts.find({
    'projectId': projectId,
    'status': 'lair-grey'
  }).fetch()
  if (typeof hosts === 'undefined' || hosts.length === 0) {
    console.log('No hosts found')
    return
  }
  var c = 0
  hosts.forEach(function (host) {
    var serviceCount = Services.find({
      'hostId': host._id,
      'port': {
        $gt: 0
      }
    }).count()
    if (serviceCount === 0) {
      c++
      console.log('Updating: ' + host.ipv4)
      Hosts.update({
        '_id': host._id
      }, {
        $set: {
          'status': 'lair-green',
          'last_modified_by': modifiedBy
        }
      })
    }
  })
  console.log(c + ' host(s) updated')
}
