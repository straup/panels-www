var sketchpad = null;

function panels_init(){
    panels_new_panel();
}

function panels_new_panel(){

    var w = '100%';
    var h = 500;

    sketchpad = Raphael.sketchpad("editor", {
	    width: w,
	    height: h,
	    editing: true
	});

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
	console.log(rsp);
    };
    
    panels_storage_save(title, data, cb);
}

function panels_load_panel(){

    localforage.keys(function(keys){

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
    });

}

function panels_open_canvas(el){

    var key = el.value;

    localforage.getItem(key, function(rsp){
	    panels_new_panel();

	    $("#data").val(rsp['data']);
	    $("#data").attr('data-panel-key', key);
    });
}


function panels_delete_panel(){

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