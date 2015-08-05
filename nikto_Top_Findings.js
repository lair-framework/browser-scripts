/* eslint-disable no-unused-vars */
/* globals Session Services Hosts Meteor */

function niktoTopFindings () {
  // Lists Nikto Top Findings results per host/vhost
  //
  // Created by: Matt Burch
  // Usage: niktoTopFindings()

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

        var search = new RegExp(topFindings.join('|') + '\\n', 'g')
        var f = note.content.match(search)
        if (f) {
          if (!(findings[host.ipv4 + ' ' + title])) {
            findings[host.ipv4 + ' ' + title] = []
          }
          findings[host.ipv4 + ' ' + title].push(f.join(''))
        }

      }
    })
  })
  for (var key in findings) {
    console.log(key)
    console.log(findings[key].join(''))
  }
}
