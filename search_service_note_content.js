function searchServiceNoteContent (noteRegex, searchString) {
  // Search the contents of service notes for specific regex content, matching a note regex title
  //
  // Examples:
  //   searchServiceNoteContent('Weak Cipher', '\\D\\D\\D-\\D.*')
  //
  // Usage: searchServiceNoteContent(title, search)
  // Created by: Matt Burch
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var re = new RegExp(noteRegex, 'i')
  var search = new RegExp(searchString, 'g')
  var ciphers = []
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

  function unique(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
        if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
  }
  services.forEach(function (service) {
    service.notes.forEach(function (note) {
      if (re.test(note.title)) {
        ciphers.push.apply(ciphers, note.content.match(search))
      }
    })
  })
  console.log(unique(ciphers).join("\n"))
}
