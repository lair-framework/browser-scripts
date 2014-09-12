var deletePorts = function(port, protocol, service) {
	//Example Inputs
	//port = 4172;
	//protocol = "udp";
	//service = "unknown";

	var projectId = Session.get('projectId');
	var ports = Ports.find({"project_id": projectId, "port": port, "protocol": protocol, "service": service});

	ports.forEach(function(port) {
		//console.log(port);
		//console.log("Removing Port : " + port._id 
		console.log("Removing Port : " + port._id +  " "+ port.port +  " " + port.protocol + " " + port.service );
		Meteor.call('removePort', projectId, port._id, function(err) {});
		}
	);

};

/*Example Usage
port = 4172;
protocol = "udp";
service = "unknown";
	
deletePorts(port, protocol, service);
*/