function panels_upload_schedule_upload(data){

    var dt = new Date();
    var pending_id = window.btoa(dt.toISOString());
	    
    var pending_key = "pending_" + pending_id;

    localforage.setItem(pending_key, data, function(rsp){

	    localforage.getItem(pending_key, function(rsp){

		    try {
			var blob = panels_utils_data_uri_to_blob(data);
		    }
		    
		    catch(e){
			console.log("failed to convert data to blob");
			console.log(e);
			return false;
		    }
		    
		    panels_upload_schedule_make_it_so(blob, pending_id);		    
		});
	});

}

function panels_upload_schedule_make_it_so(file, pending_id){

    var data = new FormData();
    data.append('photo', file);

    data.append('access_token', null);
    data.append('crumb', null);
    data.append('method', null);

    var endpoint = null;

    var req = new XMLHttpRequest();
    req.open("POST", endpoint, true);

    req.onload = function(e){

	if (req.status == 200){

	    var pending_key = "pending_" + pending_id;

	    localforage.removeItem(pending_key, function(rsp){
		    console.log("removed " + pending_key);
		    console.log(rsp);
		});
	}

	else {
	    console.log(pending_key);
	}

    };

    req.send(data);
    return false;
}
