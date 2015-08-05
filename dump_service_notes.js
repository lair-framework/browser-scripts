/* eslint-disable no-unused-vars */
/* globals Session Services _ Hosts Meteor */

function dumpServiceNotes (noteRegex, ip) {
  // Dump the contents of service notes matching a specific regex (matches against note 'title')
  // By supplying an empty string for the 'ip' you can dump all notes.
  // Examples:
  //   dumpServiceNotes('^SSL Self-Signed', '')
  //   dumpServiceNotes('Software Enumeration', '192.168.1.1')
  //
  // Usage: dumpServiceNotes(regex, ip)
  // Created by: Dan Kottmann
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var re = new RegExp(noteRegex, 'i')
  var services = Services.find({
    'projectId': projectId,
    'notes': {
      $elemMatch: {
        'title': {
          $regex: noteRegex,
          $options: 'i'
        }
      }
    }
  }, {
    notes: 1,
    hostId: 1
  }).fetch()
  var hostIds = _.pluck(services, 'hostId')
  var hosts = Hosts.find({
    '_id': {
      $in: hostIds
    }
  }, {
    sort: {
      longIpv4Addr: 1
    },
    ipv4: 1
  }).fetch()
  hosts.forEach(function (host) {
    if (ip !== '' && ip !== host.ipv4) {
      return
    }
    services = Services.find({
      'hostId': host._id
    }, {
      sort: {
        service: 1
      },
      notes: 1,
      service: 1,
      protocol: 1
    }).fetch()
    services.forEach(function (service) {
      service.notes.forEach(function (note) {
        if (re.test(note.title)) {
          console.log(host.ipv4 + ':' + service.port + '/' + service.protocol + ' - ' + note.title + '\n' + note.content)
        }
      })
    })
  })
}
