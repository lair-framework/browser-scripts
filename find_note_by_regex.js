var findNoteByRegex = function (noteRegex, noteType) {
  // Performs case insensitive search of the appropriate notes (both the title and contents) for the given regex
  // noteType can be one of the following:
  //    all
  //    project
  //    host
  //    service
  //    Issue - searches the evidence field and notes
  //
  // Usage: findNote('.*Linux.*', 'all')
  // Created by: Joey Belans
  // Requires client-side updates: false

  var projectId = Session.get('projectId')

  var noteRe = new RegExp(noteRegex, 'i')
  if (noteType === 'project' || noteType === 'all') {
    console.log('Project Notes')
    var curProj = Projects.findOne({
      '_id': projectId
    }, {
      notes: 1
    })
    curProj.notes.forEach(function (note) {
      if (noteRe.test(note.title) || noteRe.test(note.content)) {
        console.log('\t' + note.title)
      }
    })
  }
  if (noteType === 'host' || noteType === 'all') {
    console.log('Host Notes')
    Hosts.find({
      'projectId': projectId,
      $or: [{
        'notes': {
          $elemMatch: {
            'title': {
              $regex: noteRegex,
              $options: 'i'
            }
          }
        }
      }, {
        'notes': {
          $elemMatch: {
            'content': {
              $regex: noteRegex,
              $options: 'i'
            }
          }
        }
      }]
    }, {
      notes: 1
    }).fetch().forEach(function (host) {
      host.notes.forEach(function (note) {
        if (noteRe.test(note.title) || noteRe.test(note.content)) {
          console.log('\t' + host.ipv4 + ' -> ' + note.title)
        }
      })
    })
  }
  if (noteType === 'service' || noteType === 'all') {
    console.log('Service Notes')
    Services.find({
      'projectId': projectId,
      $or: [{
        'notes': {
          $elemMatch: {
            'title': {
              $regex: noteRegex,
              $options: 'i'
            }
          }
        }
      }, {
        'notes': {
          $elemMatch: {
            'content': {
              $regex: noteRegex,
              $options: 'i'
            }
          }
        }
      }]
    }, {
      notes: 1
    }).fetch().forEach(function (service) {
      service.notes.forEach(function (note) {
        if (noteRe.test(note.title) || noteRe.test(note.content)) {
          var serviceHost = Hosts.findOne({
            'projectId': projectId,
            '_id': service.hostId
          })
          console.log('\t' + serviceHost.ipv4 + ' -> ' + service.service.toString() + ' -> ' + note.title)
        }
      })
    })
  }
  if (noteType === 'Issue' || noteType === 'all') {
    console.log('Issue Notes')
    Issues.find({
      'projectId': projectId,
      $or: [{
        'evidence': {
          $regex: noteRegex,
          $options: 'i'
        }
      }, {
        'notes': {
          $elemMatch: {
            'title': {
              $regex: noteRegex,
              $options: 'i'
            }
          }
        }
      }, {
        'notes': {
          $elemMatch: {
            'content': {
              $regex: noteRegex,
              $options: 'i'
            }
          }
        }
      }]
    }, {
      notes: 1
    }).fetch().forEach(function (vuln) {
      if (noteRe.test(vuln.evidence)) {
        console.log('\t' + vuln.title + ' -> Evidence Field')
      }
      vuln.notes.forEach(function (note) {
        if (noteRe.test(note.title) || noteRe.test(note.content)) {
          console.log('\t' + vuln.title + ' -> ' + note.title)
        }
      })
    })
  }
}
