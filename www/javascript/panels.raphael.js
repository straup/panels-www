var sketchpad = null;

function panels_init(){
    panels_new_panel();
    panels_load_panels();

    if (panels_uploads_configured()){
	$("#header-upload").show();
    }

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

    $("#editor").children().remove();

    sketchpad = Raphael.sketchpad("editor", args);

    var pen = sketchpad.pen();
    pen.width(1);
    pen.opacity(.6);

    if (key){
	$("#editor").attr("data-panel-title", key);
	$("#header-delete").show();

	$("#header-show").hide();
    }

    else {
	$("#editor").removeAttr("data-panel-title");
	$("#header-delete").hide();
    }

    $("#header-source").show();
    $("#header-editor").hide();

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

	$("#editor").attr("data-panel-title", title);
	$("#header-delete").show();

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

	var html = '<option value="-1">opn</option>';

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
	sel.style.display = 'block';
	sel.innerHTML = html;

	var li = document.getElementById('header-select');
	var display = (count) ? 'inline': 'none';
	
	li.style.display = display;
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

	$("#editor").removeAttr("data-panel-title");

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

    if (typeof(panels_custom_prepare_upload) != 'function'){
	panels_ui_error("uploads have not been configured");
	return false;
    }

    var data = sketchpad.json();

    if (panels_is_empty(data)){
	panels_ui_error("there is nothing to upload");
	return false;
    }

    var svg = panels_generate_svg(data);
    panels_uploads_schedule_upload(svg);
}

function panels_generate_svg(data){

    data = JSON.parse(data);
    var count = data.length;

    var svg = '<?xml version="1.0" standalone="no"?>\n';
    svg += '<svg xmlns="http://www.w3.org/2000/svg">\n';

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
	svg += '" />\n';
    }

    svg += '</svg>';

    return svg;
}

function panels_view_source(){

	 $("#editor").hide();
	$("#header-source").hide();
	$("#header-editor").show();

    var data = sketchpad.json();

    if (panels_is_empty(data)){
	return false;
    }

    var svg = panels_generate_svg(data);
    // https://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
    var enc = $('<div/>').text(svg).html();

    $("#view-source").html(enc);
    $("#view-source").show();
}

function panels_view_editor(){

	 $("#view-source").html("");
	 $("#view-source").hide();
	 $("#editor").show();
	$("#header-source").show();
	$("#header-editor").hide();
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
