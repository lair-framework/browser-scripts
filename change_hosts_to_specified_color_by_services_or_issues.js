/* globals Session Meteor Hosts Services Issues StatusMap */
/* eslint-disable no-unused-vars */
function changeHostsToSpecifiedColorByServicesOrIssues (servicesOrIssues, statusOption, lairColor) {
  // Changes host color based on services|issues of the host
  //
  // This is good for editing large chucks of hosts based on port or vuln color.
  // Example: You've marked a bunch of services green and want to change all hosts, whose services are now all
  // green, to green. You run: changeHostsToSpecifiedColorByServicesOrIssues('services', 'lair-green', 'lair-green')
  //
  // Created by Isaiah Sarju
  //
  // Services or Issues Options (servicesOrIssues)
  // 'services': Change hosts based on hosts' services
  // 'issues': Change hosts based on hosts' issues
  //
  // Status Options (statusOption)
  // 'all': Change all hosts to specified lairColor
  // 'none': Hosts with no services|issues associated with them are changed to specified lairColor
  // 'lair-color': If all services|issues of a host are 'lair-color' change host to specified lairColor. Number of services|issues for host must be > 0
  // 'same': If there are no services|issues or all services|issues are the same color, set host color to specified lairColor
  // 'diff': If there are > 1 services|issues and services|issues differ in color, set host color to specified lairColor
  //
  // Lair Color Options (lairColor): lair-grey, lair-blue, lair-green, lair-orange, lair-red
  //
  // Usage
  // changeHostsToSpecifiedColorByServicesOrIssues('doesnmatter', 'all', 'lair-green'); Change all hosts to lair-green
  // changeHostsToSpecifiedColorByServicesOrIssues('services', 'none', 'lair-green'); If host has no services change to lair-green
  // changeHostsToSpecifiedColorByServicesOrIssues('issues', 'lair-orange', 'lair-red'); If all issues are lair-orange change host to lair-red
  // changeHostsToSpecifiedColorByServicesOrIssues('issues', 'same', 'lair-blue'); If host has same colored issues change host to lair-blue
  // changeHostsToSpecifiedColorByServicesOrIssues('services', 'diff', 'lair-grey'); If host has different colored services change host to lair-grey

  var projectId = Session.get('projectId')
  var modifiedBy = Meteor.user().emails[0].address
  var statCount = 0
  var count = 0

  // Define allSameColor callback function for object.every()
  // Returns true if value's color is same as (value - 1)'s color
  function allSameColor (value, index, array) {
    // Base Case
    if (index === 0) {
      return true
    }

    // Return true if status is same as previous status
    // else return false
    return (value.status === array[index - 1].status)
  }

  // Define changeHostColor
  function changeHostColor (id, newColor) {
    Hosts.update({
      '_id': id
    }, {
      $set: {
        'status': newColor,
        'lastModifiedBy': modifiedBy
      }
    })

  }

  // Define getServices
  // Returns port array of given host id
  function getServices (id) {
    return Services.find({
      'projectId': projectId,
      'hostId': id
    }).fetch()
  }

  // Define getIssues
  // Returns port array of given host id
  function getIssues (id) {
    var hostIpv4 = Hosts.findOne({ '_id': id }).ipv4
    return Issues.find({
      'projectId': projectId,
      'hosts.ipv4': hostIpv4
    }).fetch()
  }

  // Define getServicesOrIssues
  // Returns array of Services or Issues for host based on servicesOrIssues
  function getServicesOrIssues (id) {
    if (servicesOrIssues === 'services') {
      return getServices(id)
    } else if (servicesOrIssues === 'issues') {
      return getIssues(id)
    }
    throw {
      name: 'Incorrect servicesOrIssues Selection',
      message: 'Incorrect servicesOrIssues selection: "' + servicesOrIssues + '" is not a valid servicesOrIssues for this function'
    }
  }

  if (StatusMap.indexOf(lairColor) === -1) {
    console.log('Lair Supported colors: ' + StatusMap)
    throw {
      name: 'Wrong lairColor',
      message: 'Provided lairColor: "' + lairColor + '" is not Lair compliant'
    }
  }

  // Get all hosts
  var hosts = Hosts.find({
    'projectId': projectId
  }).fetch()

  // If statusOption === 'all' Change all services to specified lairColor
  if (statusOption === 'all') {
    hosts.forEach(function (host) {
      // Change host to lairColor
      changeHostColor(host._id, lairColor)
    })

    // set count to hosts.length
    count = hosts.length
  } else if (statusOption === 'none') {
    hosts.forEach(function (host) {
      var hostid = host._id
      var arrayLen = getServicesOrIssues(hostid).length

      // If host has no services|issues update its color
      if (arrayLen <= 0) {
        // Change host to lairColor
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }
    })

    // set count to statCount
    count = statCount
  } else if (StatusMap.indexOf(statusOption) !== -1) {
    // Iterate over each host
    hosts.forEach(function (host) {
      // changeColor starts as false
      var changeColor = false
      var hostid = host._id

      // Get array of services|issues for current host
      var obj = getServicesOrIssues(hostid)

      changeColor = (obj.length > 0 && obj[0].status === statusOption && obj.every(allSameColor))

      // If changeColor value is true, meaning all services|issues of this host are the same color
      // and there are >= 1 services|issues, then change host to the specified lairColor
      if (changeColor) {
        // Change host to lairColor
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }

      // set count to statCount
      count = statCount
    })
  } else if (statusOption === 'same') {
    hosts.forEach(function (host) {
      // changeColor starts as false
      var changeColor = false
      var hostid = host._id

      // Get array of services|issues for current host
      var obj = getServicesOrIssues(hostid)

      changeColor = (obj.every(allSameColor))

      // If changeColor value is true, meaning all services|issues of this host are the same color
      // and there are >= 1 services|issues, then change host to the specified lairColor
      if (changeColor) {
        // Change host color
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }

      // set count to statCount
      count = statCount
    })
  } else if (statusOption === 'diff') {
    hosts.forEach(function (host) {
      // changeColor starts as false
      var changeColor = false
      var hostid = host._id

      // Get array of services|issues for current host
      var obj = getServicesOrIssues(hostid)

      changeColor = !(obj.every(allSameColor))

      // If changeColor value is true, services|issues of this host vary in color
      // and there are >= 1 services|issues, then change host to the specified lairColor
      if (changeColor) {
        // Change host color
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }

      // set count to statCount
      count = statCount
    })
  } else {
    throw {
      name: 'Incorrect statusOption Selection',
      message: 'Incorrect statusOption selection: "' + statusOption + '" is not a valid statusOption for this function'
    }
  }

  console.log('Total of ' + count + ' host(s) updated')
}
