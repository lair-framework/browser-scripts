var changeServicesRegexToSpecifiedColor = function (lairServiceRegex, lairColor) {
  // Changes the status of a given service to the specified color
  //
  // Updated to include Regex by Isaiah Sarju
  // Created by: Dan Kottmann
  // Updated by: Ryan Dorey
  // Usage: changeServicesRegexToSpecifiedColor(/*.sql.*/, 'lair-blue')
  // Colors available: lair-grey, lair-blue, lair-green, lair-orange, lair-red
  // Requires client-side updates: true

  var PROJECT_ID = Session.get('projectId')
  var MODIFIED_BY = Meteor.user().emails[0].address

  if (lairColor !== 'lair-grey' && lairColor !== 'lair-blue' && lairColor !== 'lair-green' && lairColor !== 'lair-orange' && lairColor !== 'lair-red') {
    console.log('Invalid color specified')
    return
  }
  var services = Ports.find({
    'project_id': PROJECT_ID,
    'service': {
      '$regex': lairServiceRegex
    }
  }).fetch()

  // If no services match print no services found.
  if (services.length < 1) {
    console.log('No services found')
    return
  }
  services.forEach(function (port) {
    Ports.update({
      '_id': port._id
    }, {
      $set: {
        'status': lairColor,
        'last_modified_by': MODIFIED_BY
      }
    })
  })
  console.log('Total of ' + services.length + ' service(s) updated to ' + lairColor + '.')
}
