var changeHostsToSpecifiedColorByPortStatus = function (status, lairColor){
	// Changes host color based on status of ports
	//
	// Created by Isaiah Sarju
	// Statuses
		// 'all': Change all hosts to given color
		// 'no-ports': Hosts with no ports associated with them
		// 'lair-color': If all ports of a host are 'lair-color' change host to specified color. Number of ports for host must be > 0
	// Usage
		// changeHostsToSpecifiedColorByPortStatus('all', 'lair-green'); Change all hosts to lair-green
		// changeHostsToSpecifiedColorByPortStatus('no-ports', 'lair-green'); If host has no ports change to lair-green
		// changeHostsToSpecifiedColorByPortStatus('lair-orange', 'lair-red'); If all ports are lair-orange change host to lair-red

	var COLOR = lairColor;
    var PROJECT_ID = Session.get('projectId');
    var MODIFIED_BY = Meteor.user().emails[0].address;
    var COUNT = 0;

    // Check color 
    if (STATUS_MAP.indexOf(COLOR) === -1) {
        console.log('Lair Supported colors: ' + STATUS_MAP);
        throw {
            name: 'Wrong Color',
            message: 'Provided COLOR: \"' + COLOR + '\" is not Lair compliant'
        };
    }

    // Get all hosts
    var hosts = Hosts.find({
        'project_id': PROJECT_ID
    }).fetch();


    // If status === 'all' Change all ports to one color
    if (status === 'all') {
    	hosts.forEach(function (host) {
    		Hosts.update({
	            '_id': host._id
	        }, {
	            $set: {
	                'status': lairColor,
	                'last_modified_by': MODIFIED_BY
	            }
	        });
	    });

	    COUNT = hosts.length;
    }

    // Else if status === 'no-ports' change all hosts with 0 ports to specified color
    else if (status === 'no-ports') {
    	var statCount = 0;

    	hosts.forEach(function (host) {
    		var hostid = host._id;
	        var portNum = Ports.find({
	            'project_id': PROJECT_ID,
	            'host_id': hostid
	        }).fetch().length;

	    	// If host has no ports update its color
	    	if (portNum <= 0){
	    		Hosts.update({
		            '_id': hostid
		        }, {
		            $set: {
		                'status': lairColor,
		                'last_modified_by': MODIFIED_BY
		            }
		        });

		        //Update Count
		        statCount++
	    	}
	    });

	    COUNT = statCount;
    }

    // Else if status === 'no-vulns' change all hosts with 0 vulns to specified color
    else if (status === 'no-vulns') {
    	var statCount = 0;

    	hosts.forEach(function (host) {
    		var hostid = host._id;
	        var vulnNum = Vulnerabilities.find({
	            'project_id': PROJECT_ID,
	            'hosts.string_addr': host.string_addr
	        }).fetch().length;

	    	// If host has no vulns update its color
	    	if (vulnNum <= 0){
	    		Hosts.update({
		            '_id': hostid
		        }, {
		            $set: {
		                'status': lairColor,
		                'last_modified_by': MODIFIED_BY
		            }
		        });
		        
		        //Update Count
        		statCount++
	    	}
	    });

	    COUNT = statCount;
    }

    // Else if status === 'lair-color' then change all hosts, to the specified color, if all ports are 'lair-color'd
    else if (STATUS_MAP.indexOf(status) !== -1) {
    	var statCount = 0;
    	var portColor = null;

    	// Iterate over each host
    	hosts.forEach(function (host) {
    		var allSame = false;
    		var hostid = host._id;

    		// Get length of array of ports for each host that are 'lair-color'
	        var portColorLen = Ports.find({
	            'project_id': PROJECT_ID,
	            'host_id': hostid,
	            'status':status
	        }).fetch().length;

	        // Get length of array of ports for given host
	        var portLen = Ports.find({
		            'project_id': PROJECT_ID,
		            'host_id': hostid
		        }).fetch().length;

	        // If host's number of ports of selected color is === to total
	        // number of ports for that host && number of ports are positive then allSame = true
	    	if (portColorLen  >= 1 && portColorLen === portLen){
	    		allSame = true;
	    	}

	    	// If allSame value is true, meaning all ports of this host are the same color, then change host to the specified color
    		if (allSame){
    			Hosts.update({
		            '_id': hostid
		        }, {
		            $set: {
		                'status': lairColor,
		                'last_modified_by': MODIFIED_BY
		            }
		        });

		        statCount++
    		}

    		COUNT = statCount;
		});
	}


    // Else user input invalid status
    else {
    	throw {
            name: 'Incorrect Status Selection',
            message: 'Incorrect status selection: \"' + status +'\" is not a valid status for this function'
        };
    }

    // Log total updated
    console.log('Total of ' + COUNT + ' host(s) updated');
}