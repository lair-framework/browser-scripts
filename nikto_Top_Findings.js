/* eslint-disable no-unused-vars */
/* globals Session Services Hosts Meteor */

function niktoTopFindings (custom, filter) {
  // Lists Nikto Top Findings results per host/vhost
  //
  // Created by: Matt Burch
  // Usage: niktoTopFindings([], true)
  // Usage: niktoTopFindings(['(.*might be interesting.*)'], true)
  // Usage: niktoTopFindings([], false)

  var nikto = new RegExp('Nikto')
  var findings = {}
  var projectId = Session.get('projectId')
  var topFindings = [
    '(.*might be interesting.*)',
    '(.*Public HTTP Methods:.*PUT.*)',
    '(.*[Ww]eb[Dd]av.*)',
    '(.*Directory indexing found.*)',
    '(.*default file found.*)',
    '(.*Server leaks.*IP.*)',
    '(.*OSVDBID:.*)'
  ]
  if (custom.length > 0) {
    topFindings = custom
  }

  var services = Services.find({
    'projectId': projectId
  }).fetch()
  services.forEach(function (service) {
    var host = Hosts.findOne({
      'projectId': projectId,
      '_id': service.hostId
    })
    service.notes.forEach(function (note) {
      if (nikto.test(note.title)) {
        var title = note.title.match(/\(.*\)/)

        if (filter) {
          var search = new RegExp(topFindings.join('|') + '\\n', 'g')
          var f = note.content.match(search)
          if (f) {
            if (!(findings[host.ipv4 + ' ' + title])) {
              findings[host.ipv4 + ' ' + title] = []
            }
            findings[host.ipv4 + ' ' + title].push(f.join(''))
          }
        } else {
          console.log(host.ipv4 + ' ' + title)
          console.log(note.content)
        }


      }
    })
  })
  if (filter) {
    for (var key in findings) {
      console.log(key)
      console.log(findings[key].join(''))
    }
  }
}
