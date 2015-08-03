var generatePortStringFromService = function (service) {
  // Generates a comma separated unique list of open ports for the current project that matches
  // the regular expression provided as 'service'.

  // Usage: generatePortStringFromService(/http/)
  //
  // Created by: Tom Steele
  // Requires client-side updates: false

  var PROJECT_ID = Session.get('projectId')
  var query = {
    'project_id': PROJECT_ID,
    'service': service
  }
  var ports = Ports.find(query).fetch()
  return _.uniq(_.pluck(ports, 'port')).sort(function (a, b) {
    return a - b
  }).join(',')
}
