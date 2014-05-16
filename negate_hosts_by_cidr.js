var negateHostsByCIDR = function() {
  // Generate a list of hostname[string_addr] targets which do not exist in CIDR range
  //
  // Created by: Matt Burch
  // Usage: negateHostsByCIDR("x.x.x.x/x") or negateHostsByCIDR("x.x.x.x/x","y.y.y.y/y");
  //
  var hostTargets = [];
  var nets = Array.prototype.slice.call(arguments, 0);
  var hosts = Hosts.find({project_id : Session.get('projectId')}).fetch();
  var hostip = {};
  
  function dec2Bin(octet, cidr) {
    var pad = '00000000';
    var bin = parseInt(octet[0], 10).toString(2);
    bincidr = (bin.length >= pad.length ? bin : pad.slice(0, pad.length-bin.length) + bin);
    
    for (i = 1; i <= octet.length; i ++) {
      bin = parseInt(octet[i], 10).toString(2);
      bincidr += (bin.length >= pad.length ? bin : pad.slice(0, pad.length-bin.length) + bin);
    }
    
    return bincidr.slice(0, parseInt(cidr, 10));
  }

  hosts.forEach(function(host) {
    var ip = host.string_addr.split(".");
    hostip[dec2Bin(ip, 32)] = host.string_addr;
  });
  
  nets.forEach(function(cidr) {
    cidr = cidr.split("/");
    var net = cidr[0].split(".");
    var netbin = dec2Bin(net, cidr[1]);
    
    for (var key in hostip) {
      if ((key.slice(0, parseInt(cidr[1], 10))) == netbin) {
        delete hostip[key];
      }
    }
  });
  
  for (var key in hostip) {
    console.log(hostip[key]);
  }
}
