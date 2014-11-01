var sketchpad = null;

function panels_init(){
    panels_new_panel();
    panels_load_panels();
}

function panels_new_panel(item, key){

    var w = window.innerWidth;
    var h = window.innerHeight * 2;	// what is the simplest thing...

    var args = {
	width: w,
	height: h,
	editing: true
    };

    if (item){

	try {
	    var strokes = JSON.parse(item['data']);
	    args['strokes'] = strokes;
	}

	catch (e){

	    panels_ui_error("Failed to load that document because " + e);

	    if (panels_ui_confirm("Should it be removed?")){
		panels_delete_panel(key);
	    }
	}

	if ((item['width']) && (item['width'] > args['width'])){
	    args['width'] = item['width'];
	}

	if ((item['height']) && (item['height'] > args['height'])){
	    args['height'] = item['height'];
	}
    }

    sketchpad = Raphael.sketchpad("editor", args);

    if (key){
	$("#editor").attr("data-panel-title", key);
    }
}

function panels_save_panel(){

    var json = sketchpad.json();

    if (panels_is_empty(json)){
	panels_ui_error("There's nothing to save");
	return false;
    }

    var title = $("#editor").attr("data-panel-title");

    title = panels_ui_prompt("What would you like to call this?", title);
    
    if ((! title) || (title == '')){
	panels_ui_error("You need to give this a name, silly.");
	return false;
    }
    
    var cb = function(rsp){
	panels_load_panels();
    };
    
    var ed = $("#editor");
    var h = ed.height();
    var w = ed.width();

    var item = {
	'data': json,
	'height': h,
	'width': w
    };

    panels_storage_save(title, item, cb);
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

    var cb = function(item){
	panels_new_panel(item, key);
    };

    panels_storage_load(key, cb);
}

function panels_delete_panel(key){

    if (! key){
	key = $("#editor").attr("data-panel-title");
    }
    
    if (key){

	if (! panels_ui_confirm("Are you sure you want to delete " + key + "?")){
	    return false;
	}

	var cb = function(){
	    panels_load_panels();
	};
	
	panels_storage_remove(key, cb);
    }

    else {

	if (! panels_ui_confirm("Are you sure you want to delete this?")){
	    return false;
	}
    }

    panels_new_panel();
}

function panels_upload_panel(){

    var data = sketchpad.json();

    if (panels_is_empty(data)){
	panels_ui_error("there is nothing to upload");
	return false;
    }

    var svg = panels_generate_svg(data);
    console.log(svg);

    panels_ui_error("uploads are still not working");
    return false;

    // panels_upload_schedule_upload(svg);
}

function panels_generate_svg(data){

    data = JSON.parse(data);
    var count = data.length;

    var svg = '<?xml version="1.0" standalone="no"?>';
    svg += '<svg xmlns="http://www.w3.org/2000/svg">';

    for (var i=0; i < count; i++){
	var el = data[i];
	svg += '<path d="';
	svg += el['path'];
	svg += '" stroke="';
	svg += el['stroke'];
	svg += '" stroke-width="';
	svg += el['stroke-width'];
	svg += '" stroke-opacity="';
	svg += el['stroke-opacity'];
	svg += '" stroke-linecap="';
	svg += el['stroke-linecap'];
	svg += '" stroke-linejoin="';
	svg += el['stroke-linejoin'];
	svg += '" fill="';
	svg += el['fill'];
	svg += '" />';
    }

    svg += '</svg>';

    return svg;
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
