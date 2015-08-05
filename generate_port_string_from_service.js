/* eslint-disable no-unused-vars */
/* globals Session Services _ Meteor */

function generatePortStringFromService (service) {
  // Generates a comma separated unique list of open services for the current project that matches
  // the regular expression provided as 'service'.

  // Usage: generatePortStringFromService(/http/)
  //
  // Created by: Tom Steele
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var query = {
    'projectId': projectId,
    'service': service
  }
  var services = Services.find(query).fetch()
  return _.uniq(_.pluck(services, 'port')).sort(function (a, b) {
    return a - b
  }).join(',')
}
