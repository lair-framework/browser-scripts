function getPersonEmail () {
  // Generate a list of defined people by Principal, Department, Email
  //
  // Created by: Matt Burch
  // Usage: getPersonEmail()
  //

  var projectId = Session.get('projectId')

  var people = People.find({
    projectId: projectId
  }).fetch()

  people.forEach( function(p) {
    console.log("'" + p.principalName + "','" + p.department + "','" + p.emails.join(" ") + "'")
  })
  console.log("returned: " + people.length + " results")
}
