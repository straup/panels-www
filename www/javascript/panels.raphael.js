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
    
    // panels_storage_save(title, data, cb);
}

function panels_load_panel(){

}

function panels_delete_panel(){

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