var changeHostsToSpecifiedColorByPortsOrVulns = function (portsOrVulns, statusOption, lairColor) {
  // Changes host color based on ports|vulns of the host
  //
  // This is good for editing large chucks of hosts based on port or vuln color.
  // Example: You've marked a bunch of ports green and want to change all hosts, whose ports are now all
  // green, to green. You run: changeHostsToSpecifiedColorByPortsOrVulns('ports', 'lair-green', 'lair-green')
  //
  // Created by Isaiah Sarju
  //
  // Ports or Vulns Options (portsOrVulns)
  // 'ports': Change hosts based on hosts' ports
  // 'vulns': Change hosts based on hosts' vulns
  //
  // Status Options (statusOption)
  // 'all': Change all hosts to specified lairColor
  // 'none': Hosts with no ports|vulns associated with them are changed to specified lairColor
  // 'lair-color': If all ports|vulns of a host are 'lair-color' change host to specified lairColor. Number of ports|vulns for host must be > 0
  // 'same': If there are no ports|vulns or all ports|vulns are the same color, set host color to specified lairColor
  // 'diff': If there are > 1 ports|vulns and ports|vulns differ in color, set host color to specified lairColor
  //
  // Lair Color Options (lairColor): lair-grey, lair-blue, lair-green, lair-orange, lair-red
  //
  // Usage
  // changeHostsToSpecifiedColorByPortsOrVulns('doesnmatter', 'all', 'lair-green'); Change all hosts to lair-green
  // changeHostsToSpecifiedColorByPortsOrVulns('ports', 'none', 'lair-green'); If host has no ports change to lair-green
  // changeHostsToSpecifiedColorByPortsOrVulns('vulns', 'lair-orange', 'lair-red'); If all vulns are lair-orange change host to lair-red
  // changeHostsToSpecifiedColorByPortsOrVulns('vulns', 'same', 'lair-blue'); If host has same colored vulns change host to lair-blue
  // changeHostsToSpecifiedColorByPortsOrVulns('ports', 'diff', 'lair-grey'); If host has different colored ports change host to lair-grey

  var PROJECT_ID = Session.get('projectId')
  var MODIFIED_BY = Meteor.user().emails[0].address
  var COUNT = 0

  /****** Function Declarations ******/

  // Define allSameColor callback function for object.every()
  // Returns true if value's color is same as (value - 1)'s color
  function allSameColor (value, index, array) {
    // Base Case
    if (index == 0) {
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
        'last_modified_by': MODIFIED_BY
      }
    })

  }

  // Define getPorts
  // Returns port array of given host id
  function getPorts (id) {
    return Ports.find({
      'project_id': PROJECT_ID,
      'host_id': id
    }).fetch()
  }

  // Define getVulns
  // Returns port array of given host id
  function getVulns (id) {
    hostStringAddr = Hosts.findOne({ '_id': id }).string_addr
    return Vulnerabilities.find({
      'project_id': PROJECT_ID,
      'hosts.string_addr': hostStringAddr
    }).fetch()
  }

  // Define getPortsOrVulns
  // Returns array of Ports or Vulns for host based on portsOrVulns
  function getPortsOrVulns (id) {
    // If portsOrVulns = ports return ports
    if (portsOrVulns === 'ports') {
      return getPorts(id)
    }

    // Else if portsOrVulns = vulns return vulns
    else if (portsOrVulns === 'vulns') {
      return getVulns(id)
    }

    // Else throw an error
    throw {
      name: 'Incorrect portsOrVulns Selection',
      message: 'Incorrect portsOrVulns selection: "' + portsOrVulns + '" is not a valid portsOrVulns for this function'
    }
  }

  /****** END DECLARTIONS ******/

  // Check color 
  if (STATUS_MAP.indexOf(lairColor) === -1) {
    console.log('Lair Supported colors: ' + STATUS_MAP)
    throw {
      name: 'Wrong lairColor',
      message: 'Provided lairColor: "' + lairColor + '" is not Lair compliant'
    }
  }

  // Get all hosts
  var hosts = Hosts.find({
    'project_id': PROJECT_ID
  }).fetch()

  // If statusOption === 'all' Change all ports to specified lairColor
  if (statusOption === 'all') {
    hosts.forEach(function (host) {
      // Change host to lairColor
      changeHostColor(host._id, lairColor)
    })

    // set COUNT to hosts.length
    COUNT = hosts.length
  }

  // Else if statusOption === 'none' change all hosts with 0 ports|vulns to specified lairColor
  else if (statusOption === 'none') {
    var statCount = 0

    hosts.forEach(function (host) {
      var hostid = host._id
      var arrayLen = getPortsOrVulns(hostid).length

      // If host has no ports|vulns update its color
      if (arrayLen <= 0) {
        // Change host to lairColor
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }
    })

    // set COUNT to statCount
    COUNT = statCount
  }

  // Else if statusOption === 'lair-color' then change all hosts, to the specified color, if all ports|vulns are 'lair-color'd
  else if (STATUS_MAP.indexOf(statusOption) !== -1) {
    var statCount = 0

    // Iterate over each host
    hosts.forEach(function (host) {
      // changeColor starts as false
      var changeColor = false
      var hostid = host._id

      // Get array of ports|vulns for current host
      var obj = getPortsOrVulns(hostid)

      changeColor = (obj.length > 0 && obj[0].status === statusOption && obj.every(allSameColor))

      // If changeColor value is true, meaning all ports|vulns of this host are the same color
      // and there are >= 1 ports|vulns, then change host to the specified lairColor
      if (changeColor) {
        // Change host to lairColor
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }

      // set COUNT to statCount
      COUNT = statCount
    })
  }

  // Else if statusOption === 'same' then change all hosts to specified lairColor, if all ports|vulns are the same color or that host has 0 ports|vulns
  else if (statusOption === 'same') {
    var statCount = 0

    hosts.forEach(function (host) {
      // changeColor starts as false
      var changeColor = false
      var hostid = host._id

      // Get array of ports|vulns for current host
      var obj = getPortsOrVulns(hostid)

      changeColor = (obj.every(allSameColor))

      // If changeColor value is true, meaning all ports|vulns of this host are the same color
      // and there are >= 1 ports|vulns, then change host to the specified lairColor
      if (changeColor) {
        // Change host color
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }

      // set COUNT to statCount
      COUNT = statCount
    })
  }

  // Else if statusOption === 'diff' then change all hosts to specified lairColor, if host has > 1 port|vulns and ports|vulns have different colors
  else if (statusOption === 'diff') {
    var statCount = 0

    hosts.forEach(function (host) {
      // changeColor starts as false
      var changeColor = false
      var hostid = host._id

      // Get array of ports|vulns for current host
      var obj = getPortsOrVulns(hostid)

      changeColor = !(obj.every(allSameColor))

      // If changeColor value is true, ports|vulns of this host vary in color
      // and there are >= 1 ports|vulns, then change host to the specified lairColor
      if (changeColor) {
        // Change host color
        changeHostColor(hostid, lairColor)

        // Update Count
        statCount++
      }

      // set COUNT to statCount
      COUNT = statCount
    })
  }

  // Else invalid statusOption
  else {
    throw {
      name: 'Incorrect statusOption Selection',
      message: 'Incorrect statusOption selection: "' + statusOption + '" is not a valid statusOption for this function'
    }
  }

  // Log total updated
  console.log('Total of ' + COUNT + ' host(s) updated')
}
