function listHostByTag (tag) {
  // Retrieves all host by a tag
  //
  // Created by: James Cook
  // Usage: list_host_ip_by_tag.js
  // Requires client-side updates: false
  var hosts = Hosts.find({
          projectId: Session.get('projectId'),
          tags: tag
  }).fetch()

  hosts.forEach(function (host) {
          console.log(host.ipv4)
  })
}
