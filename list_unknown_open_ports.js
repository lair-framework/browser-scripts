gvar listUnknownOpenPorts = function (scope, outputFormat) {
    // Prints a list of all "unknown" open ports for each host
    // to prepare for additional efforts to identify services
    //
    // Usage: listUnknownOpenPorts(searchScope, outputFormat)
    // Example: listUnknownOpenPorts('both', 'nmap')
    //    searchScope:
    //      product (search the "product" field)
    //      service (search the "service" field)
    //      both
    //    outputFormat:
    //      list (list of hosts followed by list of all unknown ports)
    //      nmap (individual host nmap cmdline with per-host ports)
    //
    // Created by: Alain Iamburg

    var PROJECT_ID = Session.get('projectId');
    var hostlist = [];
    var tcpports = [];
    var udpports = [];

    // FOR each port of each host
    var hosts = Hosts.find({
        "project_id": PROJECT_ID
    }).fetch();
    hosts.forEach(function (host) {
        var ports = Ports.find({
            "project_id": PROJECT_ID,
            "host_id": host._id
        }).fetch();
        ports.forEach(function (port) {
            if (port.port > 0) {
                if (scope === "product") { 
                    if (port.product === "unknown") {
                        hostlist.push(host.string_addr);
                        if (port.protocol === "tcp") {
                            tcpports.push(port.port);
                        }
                        else if (port.protocol === "udp") {
                            udpports.push(port.port);
                        }
                    }
                }
                else if (scope === "service") {
                    if (port.service === "unknown") {
                        hostlist.push(host.string_addr);
                        if (port.protocol === "tcp") {
                            tcpports.push(port.port);
                        }
                        else if (port.protocol === "udp") {
                            udpports.push(port.port);
                        }
                    }
                }
                else if (scope === "both") {
                    if (port.service === "unknown" || port.product === "unknown") {
                        hostlist.push(host.string_addr);
                        if (port.protocol === "tcp") {
                            tcpports.push(port.port);
                        }
                        else if (port.protocol === "udp") {
                            udpports.push(port.port);
                        }
                    }
                }
            }
        });
        
        // Output nmap command line format for each host and its unknown open ports
        if (outputFormat === "nmap") {
            if (tcpports.length > 0 && udpports.length > 0) {
                console.log("nmap -v -sV --version-all -sS -sU " + host.string_addr + " -p T:" + tcpports.toString() + ",U:" + udpports.toString());
            }
            else if (tcpports.length > 0) {
                console.log("nmap -v -sV --version-all -sS " + host.string_addr + " -p " + tcpports.toString());
            }
            else if (udpports.length > 0) {
                console.log("nmap -v -sV --version-all -sU " + host.string_addr + " -p " + udpports.toString());
            }
            tcpports = [];
            udpports = [];
        }

    });
    
    if ((tcpports.length > 0 || udpports.length > 0) && outputFormat === "list") {
        tcpportsUniq = tcpports.filter(function (elem, pos) {
            return tcpports.indexOf(elem) == pos;
        })
        udpportsUniq = udpports.filter(function (elem, pos) {
            return udpports.indexOf(elem) == pos;
        })
        
        // Output a list of all hosts and unknown open TCP/UDP ports
        console.log("Hosts:");
        console.log(hostlist.toString());
        console.log("TCP Ports:");
        console.log(tcpportsUniq.sort(function (a, b) {
            return a - b
        }).toString());
        console.log("UDP Ports:");
        console.log(udpportsUniq.sort(function (a, b) {
            return a - b
        }).toString());
    }
}