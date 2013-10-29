function getHostsByCIDR() {
    // Generate a list of hostname[string_addr] targets from supplied CIDR range
    //
    // Created by: Matt Burch
    // Usage: getHostsByCIDR("x.x.x.x/x") or getHostsByCIDR("x.x.x.x/x","y.y.y.y/y");
    //
    var hostTargets  = [];
    var nets = Array.prototype.slice.call(arguments, 0);
    
    nets.forEach( function(cidr) {
        cidr = cidr.split("/");
        var net = cidr[0].split(".");
        var hosts = Hosts.find({project_id  : Session.get('projectId')}).fetch();
            
        function dec2Bin(octet,cidr) {
            var pad = '00000000';
            var bin = parseInt(octet[0], 10).toString(2);
            bincidr = (bin.length >= pad.length ? bin : pad.slice(0,pad.length-bin.length) + bin);
            
            for (i = 1; i <= octet.length; i ++) {
               var bin = parseInt(octet[i], 10).toString(2);
               bincidr += (bin.length >= pad.length ? bin : pad.slice(0,pad.length-bin.length) + bin);
           };
            return bincidr.slice(0, parseInt(cidr, 10));
        }
        var netbin = dec2Bin(net,cidr[1])
        
        hosts.forEach(function(host) {
             var ip = host.string_addr.split(".");
             if (dec2Bin(ip,cidr[1]) == netbin) {
                hostTargets.push(ip.join("."));
            }
        });
    });
    return hostTargets.sort().join("\n");
    
}
