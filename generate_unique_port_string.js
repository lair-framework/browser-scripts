/* eslint-disable no-unused-vars */
/* globals Session Services _ Meteor */

function generateUniquePortString (protocol) {
  // Generates a comma separate unique list of open services for the current project
  //
  // Usages: generateUniquePortString()
  //         generateUniquePortString('tcp')
  // Created by: Tom Steele
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var query = {
    'projectId': projectId
  }
  if (typeof protocol !== 'undefined') {
    query.protocol = protocol
  }
  var services = Services.find(query).fetch()
  return _.uniq(_.pluck(services, 'port')).sort(function (a, b) {
    return a - b
  }).join(',')
}
