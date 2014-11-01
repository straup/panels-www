function panels_storage_save(title, data, cb){

    var dt = new Date();
    var ts = dt.getTime();

    var value = {
	'created': ts,
	'data': data
    };
    
    localforage.setItem(title, value, function(rsp){

	if (cb){
	    cb(rsp);
	}
    });

}

function panels_storage_load(key, cb){

    localforage.getItem(key, function(rsp){
	    
	    if (cb){
		cb(rsp);
	    }
    });
}

function panels_storage_remove(key, cb){

    localforage.removeItem(key, function(rsp){

	if (cb){
	    cb(rsp);
	}
    });

}

function panels_storage_list(cb){
    localforage.keys(cb);
}