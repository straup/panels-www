var sketchpad = null;

function panels_init(){
    panels_new_panel();
    panels_load_panels();
}

function panels_new_panel(data, key){

    var w = '100%';
    var h = 500;

    var args = {
	width: w,
	height: h,
	editing: true
    };

    if (data){

	try {
	    var strokes = JSON.parse(data);
	    args['strokes'] = strokes;
	}

	catch (e){

	    console.log("failed to load " + key);
	    alert("Failed to load that document because " + e);

	    if (confirm("Should it be removed?")){
		panels_delete_panel(key);
	    }
	}
    }

    sketchpad = Raphael.sketchpad("editor", args);
}

function panels_save_panel(t){

    var data = sketchpad.json();

    if (panels_is_empty(data)){
	alert("empty");
	return false;
    }

    var title = prompt("What would you like to call this?", t);

    if ((! title) || (title == '')){
	alert("You need to give this a name, silly.");
	return false;
    }
    
    var cb = function(rsp){

	console.log("SAVE");
	console.log(rsp);

	panels_load_panels();
    };
    
    panels_storage_save(title, data, cb);
}

function panels_load_panels(){

    var cb = function(keys){

	var count = keys.length;

	if (! count){
	    alert("Nothing to load");
	    return;
	}

	var html = '<option value="-1">...</option>';

	var re_pending = /^pending_(.*)/;

	for (var i=0; i < count; i++){

	    if (keys[i].match(re_pending)){
		continue;
	    }

	    html += '<option value="';
	    html += keys[i];
	    html += '">';
	    html += keys[i];
	    html += '</option>';
	}

	var sel = document.getElementById('load-sel');
	sel.innerHTML = html;

	sel.style.display = 'block';
    };

    panels_storage_list(cb);
}

function panels_open_canvas(el){

    var key = el.value;
    console.log("open " + key);

    var cb = function(rsp){
	console.log("NEW W/ " + key);
	panels_new_panel(rsp['data'], key);
    };

    panels_storage_load(key, cb);
}

function panels_delete_panel(key){

    if (! confirm("Are you sure you want to delete " + key + "?")){
	return;
    }

    var cb = function(rsp){
	panels_new_panel();
	panels_load_panels();
    };

    panels_storage_remove(key, cb);
}

function panels_upload_canvas(){

    var data = sketchpad.json();

    if (panels_is_empty(data)){
	return false;
    }

    // convert data to SVG

    panels_upload_schedule_upload(data);
}

function panels_is_empty(data){

    if (! data){
	return true;
    }
    
    if ((typeof(data) == 'string') && (data == '[]')){
	return true;
    }

    if ((typeof(data) == 'object') && (data.length == 0)){
	return true;
    }

    return false
}