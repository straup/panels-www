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