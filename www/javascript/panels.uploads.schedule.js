var panels_uploads_processing = {};

function panels_uploads_schedule_configured(){
    return (typeof(panels_custom_prepare_upload) == 'function') ? true : false;
}

function panels_uploads_schedule_init(){

    console.log('schedule uploads');
    $("#header-upload").show();
    
    setInterval(function(){
	    panels_uploads_schedule_process_pending();
	}, 60000);

    panels_uploads_schedule_process_pending();    
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

	    panels_uploads_schedule_fetch(pending_key);
	});

    return true;
}

function panels_uploads_schedule_fetch(key){

    if (! navigator.onLine){
	return false;
    }

    if (panels_uploads_processing[key]){
	return false;
    }

    localforage.getItem(key, function(data){

	    panels_uploads_processing[key] = true;

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
		panels_uploads_schedule_make_it_so(endpoint, formdata, key);
	    };
	    
	    panels_custom_prepare_upload(blob, cb);
	    return true;
	});
}

function panels_uploads_schedule_make_it_so(endpoint, formdata, pending_key){

    var req = new XMLHttpRequest();
    req.open("POST", endpoint, true);

    req.onload = function(e){

	delete(panels_uploads_processing[pending_key]);

	if (req.status == 200){

	    if (typeof(panels_custom_upload_ok) == 'function'){
		panels_custom_upload_ok(req);
	    }

	    localforage.removeItem(pending_key, function(rsp){
		    console.log("removed " + pending_key);
		});
	}

	else {
	    console.log(pending_key);
	}

    };

    req.onerror = function(e){
	delete(panels_uploads_processing[pending_key]);
	panels_ui_error("Hrm... there was a problem contacting the remote server.");
    };
    
    req.send(formdata);
    return false;
}

function panels_uploads_schedule_process_pending(){

    var re = /^pending_.*/;

    var cb = function(keys){

	var count = keys.length;

	for (var i=0; i < count; i++){

	    var key = keys[i];

	    if (key.match(re)){
		panels_uploads_schedule_fetch(key);
	    }
	}

    };

    panels_storage_list(cb);
}