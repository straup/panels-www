function panels_uploads_configured(){
    return (typeof(panels_custom_prepare_upload) != 'function') ? true : false;
}

function panels_uploads_schedule_upload(data){

    if (typeof(panels_custom_prepare_upload) != 'function'){
	panels_ui_error("Uploads are not configured");
	return false;
    }

    var dt = new Date();
    var pending_id = window.btoa(dt.toISOString());
	    
    var pending_key = "pending_" + pending_id;

    localforage.setItem(pending_key, data, function(rsp){

	    localforage.getItem(pending_key, function(rsp){

		    try {
			var blob = panels_utils_data_uri_to_blob(data);
		    }
		    
		    catch(e){
			panels_ui_error("Ack! There was a problem preparing your sketch for uploading");
			console.log(e);
			return false;
		    }
		    
		    var cb = function(rsp){
			var endpoint = rsp['endpoint'];
			var formdata = rsp['formdata'];
			panels_uploads_schedule_make_it_so(endpoint, formdata, pending_id);
		    };

		    panels_custom_prepare_upload(blob, cb);
		    return true;
		});
	});

    return true;
}

function panels_uploads_schedule_make_it_so(endpoint, formdata, pending_id){

    var req = new XMLHttpRequest();
    req.open("POST", endpoint, true);

    req.onload = function(e){

	if (req.status == 200){

	    if (typeof(panels_custom_upload_ok) == 'function'){
		panels_custom_upload_ok(req);
	    }

	    var pending_key = "pending_" + pending_id;

	    localforage.removeItem(pending_key, function(rsp){
		    console.log("removed " + pending_key);
		});
	}

	else {
	    console.log(pending_key);
	}

    };

    req.onerror = function(e){
	panels_ui_error("Hrm... there was a problem contacting the remote server.");
    };
    
    req.send(formdata);
    return false;
}
