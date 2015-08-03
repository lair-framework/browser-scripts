var iisOsProfiler = function () {
  // Loops over every port who's product matches IIS X.X and performs a 
  // best guess at the operating system, inserting the guess into the
  // port's host's os array.
  //
  // Usage: iisOsProfiler()
  // Created by: Tom Steele
  // Requires client-side updates: false

  var PROJECT_ID = Session.get('projectId')
  var WEIGHT = 90
  var TOOL = 'IIS OS Profiler'
  var ports = Ports.find({
    'project_id': PROJECT_ID,
    'product': {
      '$regex': /IIS\s(httpd\s)?\d+\.\d+/,
      '$options': 'i'
    }
  }).fetch()
  ports.forEach(function (port) {
    var product = port.product
    var res = product.match(/\d+\.\d+/)
    if (res === null) {
      return
    }
    var version = parseFloat(res[0])
    if (isNaN(version)) {
      return
    }
    var os = models.os()
    os.tool = TOOL
    os.weight = WEIGHT
    if (version < 6) {
      os.fingerprint = 'Microsoft Windows Server 2000'
    } else if (version < 7) {
      os.fingerprint = 'Microsoft Windows Server 2003'
    } else if (version < 8) {
      os.fingerprint = 'Microsoft Windows Server 2008'
    } else if (version < 9) {
      os.fingerprint = 'Microsoft Windows Server 2012'
    }
    if (os.fingerprint !== '') {
      Meteor.call('addHostOs', PROJECT_ID, port.host_id, os.tool, os.fingerprint, os.weight, function (err) {
        if (err) {
          console.log('Error generating OS for', port.host_id, err)
        } else {
          console.log('Created new OS', os.fingerprint, 'for', port.host_id)
        }
      })
    }
  })
}
