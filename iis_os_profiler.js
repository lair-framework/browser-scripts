/* eslint-disable no-unused-vars */
/* globals Session Services Meteor Models */

var iisOsProfiler = function () {
  // Loops over every service who's product matches IIS X.X and performs a
  // best guess at the operating system, inserting the guess into the
  // service's host's os array.
  //
  // Usage: iisOsProfiler()
  // Created by: Tom Steele
  // Requires client-side updates: false

  var projectId = Session.get('projectId')
  var weight = 90
  var tool = 'IIS OS Profiler'
  var services = Services.find({
    'projectId': projectId,
    'product': {
      '$regex': /IIS\s(httpd\s)?\d+\.\d+/,
      '$options': 'i'
    }
  }).fetch()
  services.forEach(function (service) {
    var product = service.product
    var res = product.match(/\d+\.\d+/)
    if (res === null) {
      return
    }
    var version = parseFloat(res[0])
    if (isNaN(version)) {
      return
    }
    var os = Models.os()
    os.tool = tool
    os.weight = weight
    if (version < 6) {
      os.fingerprint = 'Microsoft Windows Server 2000'
    } else if (version < 7) {
      os.fingerprint = 'Microsoft Windows Server 2003'
    } else if (version < 8) {
      os.fingerprint = 'Microsoft Windows Server 2008'
    } else if (version < 9) {
      os.fingerprint = 'Microsoft Windows Server 2012'
    } else if (version < 11) {
      os.fingerprint = 'Microsoft Windows Server 2016'
    }
    if (os.fingerprint !== '') {
      Meteor.call('setOs', projectId, service.hostId, os.tool, os.fingerprint, os.weight, function (err) {
        if (err) {
          console.log('Error generating OS for', service.hostId, err)
        } else {
          console.log('Created new OS', os.fingerprint, 'for', service.hostId)
        }
      })
    }
  })
}
