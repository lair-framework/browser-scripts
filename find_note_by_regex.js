var findNoteByRegex = function(note_regex, note_type) {
  // Performs case insensitive search of the appropriate notes (both the title and contents) for the given regex
  // note_type can be one of the following:
  //    all
  //    project
  //    host
  //    service
  //    vulnerability - searches the evidence field and notes
  //
  // Usage: findNote(".*Linux.*", "all");
  // Created by: Joey Belans
  // Requires client-side updates: false

  var PROJECT_ID = Session.get('projectId');

  var noteRe = new RegExp(note_regex, "i");
  if (note_type == 'project' || note_type == 'all') {
	  console.log("Project Notes");
	  var curProj = Projects.findOne({'_id': PROJECT_ID}, {notes: 1});
	  curProj.notes.forEach(function(note) {
		  if(noteRe.test(note.title) || noteRe.test(note.content)) {
			  console.log("\t" + note.title);
		  }
	  });
  }
  if (note_type == 'host' || note_type == 'all') {
	  console.log("Host Notes");
	  Hosts.find({'project_id' : PROJECT_ID}, {notes: 1}).fetch().forEach(function(host) {
		  host.notes.forEach(function(note) {
			  if(noteRe.test(note.title) || noteRe.test(note.content)) {
				  console.log("\t" + host.string_addr + " -> " + note.title);
			  }
		  });
	  });
  }
  if (note_type == 'service' || note_type == 'all') {
	  console.log("Service Notes");
	  Ports.find({'project_id' : PROJECT_ID}, {notes: 1}).fetch().forEach(function(port) {
		  port.notes.forEach(function(note) {
			  if(noteRe.test(note.title) || noteRe.test(note.content)) {
				  var portHost = Hosts.findOne({'project_id': PROJECT_ID, '_id': port.host_id});
				  console.log("\t" + portHost.string_addr + " -> " + port.port.toString() + " -> " + note.title);
			  }
		  });
	  });
  }
  if (note_type == 'vulnerability' || note_type == 'all') {
	  console.log("Vulnerability Notes");
	  Vulnerabilities.find({'project_id' : PROJECT_ID}, {notes: 1, evidence: 1}).fetch().forEach(function(vuln) {
		  if(noteRe.test(vuln.evidence)) {
			  console.log("\t" + vuln.title + " -> Evidence Field");
		  }
		  vuln.notes.forEach(function(note){
			  if(noteRe.test(note.title) || noteRe.test(note.content)) {
				  console.log("\t" + vuln.title + " -> " + note.title);
			  }
		  });
	  });
  }
};
