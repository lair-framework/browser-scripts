var niktoTopFindings = function () {
  // Lists Nikto Top Findings results per host/vhost
  //
  // Created by: Matt Burch
  // Usage: niktoTopFindings()
  // 
  //
  var NIKTO = new RegExp('Nikto')
  var findings = {}
  var PROJECT_ID = Session.get('projectId')
  var TOPFINDINGS = [
    '(.*might be interesting.*)',
    '(.*Public HTTP Methods:.*PUT.*)',
    '(.*[Ww]eb[Dd]av.*)',
    '(.*Directory indexing found.*)',
    '(.*default file found.*)',
    '(.*Server leaks.*IP.*)',
    '(.*OSVDBID:.*)'
  ]

  var ports = Ports.find({
    'project_id': PROJECT_ID
  }).fetch()
  ports.forEach(function (port) {
    var host = Hosts.findOne({
      'project_id': PROJECT_ID,
      '_id': port.host_id
    })
    port.notes.forEach(function (note) {
      if (NIKTO.test(note.title)) {
        var title = note.title.match(/\(.*\)/)

        var search = new RegExp(TOPFINDINGS.join('|') + '\\n', 'g')
        var f = note.content.match(search)
        if (f) {
          if (!(findings[host.string_addr + ' ' + title])) {
            findings[host.string_addr + ' ' + title] = []
          }
          findings[host.string_addr + ' ' + title].push(f.join(''))
        }

      }
    })
  })
  for (var key in findings) {
    console.log(key)
    console.log(findings[key].join(''))
  }
}
