/* eslint-disable no-unused-vars */
/* globals Session Meteor Services */
function changeServicesToSpecifiedColor (lairPort, lairColor) {
  // Changes the status of the given service number to the specified color
  //
  // Created by: Dan Kottmann
  // Updated by: Ryan Dorey
  // Usage: changeServicesToSpecifiedColor(80, 'lair-orange')
  // Colors available: lair-grey, lair-blue, lair-green, lair-orange, lair-red
  // Requires client-side updates: true

  var projectId = Session.get('projectId')
  var modifiedBy = Meteor.user().emails[0].address

  if (lairColor !== 'lair-grey' && lairColor !== 'lair-blue' && lairColor !== 'lair-green' && lairColor !== 'lair-orange' && lairColor !== 'lair-red') {
    console.log('Invalid color specified')
    return
  }
  var services = Services.find({
    'projectId': projectId,
    'port': lairPort
  }).fetch()
  if (services.length < 1) {
    console.log('No services found')
    return
  }
  services.forEach(function (service) {
    console.log('Updating: ' + service.port + '/' + service.protocol)
    Services.update({
      '_id': service._id
    }, {
      $set: {
        'status': lairColor,
        'last_modified_by': modifiedBy
      }
    })
  })
  console.log('Total of ' + services.length + ' service(s) updated')
}
