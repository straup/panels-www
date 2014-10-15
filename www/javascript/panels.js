var ctx, color = "#000";	

function panels_init(){

    setTimeout(function(){
	    loadCanvas();
	    newCanvas();
	}, 500);

}

function toggleControls(){
    var c = document.getElementById("header-controls");
    var d = getComputedStyle(c).display;

    var display = (d=='none') ? 'inline' : 'none';
    c.style.display = display;

    return false;
}

// function to setup a new canvas for drawing
function newCanvas(){
    //define and resize canvas
    document.getElementById("content").style.height = window.innerHeight-90;
    var canvas = '<canvas id="canvas" width="'+window.innerWidth+'" height="'+(window.innerHeight-90)+'"></canvas>';
    document.getElementById("content").innerHTML = canvas;
    
    // setup canvas
    ctx=document.getElementById("canvas").getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;	
    
    // setup to trigger drawing on mouse or touch
    drawTouch();
    drawPointer();
    drawMouse();

    var controls = document.getElementById('controls');
    controls.style.display = 'block';
}

function saveCanvas(cb){

    var canvas = document.getElementById('canvas');
    var t = canvas.getAttribute("data-canvas-key");

    if (t == null){
	t = '';
    }

    var title = prompt("What would you like to call this?", t);

    if (title == ''){
	alert("You need to give this a name, silly.");
	return false;
    }

    var data = canvas.toDataURL();

    if (isEmptyCanvas(data)){
	alert("Your canvas is empty. There's nothing to save!");
	return false;
    }

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

function importFile(){
    console.log("import");

    var imp = document.getElementById('import');
    var files = imp.files;

    var file = files[0];

    if (! file){
	alert("There's nothing to import!");
	return false;
    }

    var name = file.name;

    try {
	var reader = new FileReader();
	    
	reader.onload = function(evt){
	    newCanvas();
	    drawCanvas(evt.target.result, name);
	};
	
	reader.readAsDataURL(file)
    }
    
    catch(e){
	
	alert("Ack!");
	return false;
    }
    
    return false;
}

function uploadCanvas(){

    alert("Disabled");
    return false;

    var canvas = document.getElementById('canvas');
    var data = canvas.toDataURL();

    if (isEmptyCanvas(data)){
	alert("Your canvas is empty. There's nothing to save!");
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
			console.log("failed to convert data to blob");
			console.log(e);
			return false;
		    }
		    
		    doUploadCanvas(blob, pending_id);		    
		});
	});

}

function doUploadCanvas(file, pending_id){

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

function loadCanvas(){

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

function openCanvas(el){

    var key = el.value;

    localforage.getItem(key, function(rsp){
	newCanvas();
	drawCanvas(rsp['data'], key);
    });
}

function drawCanvas(data, key){

    var canvas = document.getElementById('canvas');

    if (key){
	canvas.setAttribute('data-canvas-key', key);
    }

    var context = canvas.getContext('2d');
    
    var imageObj = new Image();
    
    imageObj.onload = function() {
	context.drawImage(this, 0, 0);
    };
    
    imageObj.src = data;
}

function deleteCanvas(){

    var canvas = document.getElementById('canvas');
    var key = canvas.getAttribute('data-canvas-key');

    if (! key){
	newCanvas();
	return;
    }

    if (! confirm("Are you sure you want to delete this")){
	return;
    }

    localforage.removeItem(key, function(rsp){
	console.log(rsp);
	
	newCanvas();
	loadCanvas();
    });
    console.log('delete ' + key);
}

function setLineWidth(el){
    console.log("set line width to " + el.value);

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = el.value;	
}
function selectColor(el){
    for(var i=0;i<document.getElementsByClassName("palette").length;i++){
        document.getElementsByClassName("palette")[i].style.borderColor = "#777";
        document.getElementsByClassName("palette")[i].style.borderStyle = "solid";
    }
    el.style.borderColor = "#fff";
    el.style.borderStyle = "dashed";
    color = window.getComputedStyle(el).backgroundColor;
    ctx.beginPath();
    ctx.strokeStyle = color;
}

// prototype to	start drawing on touch using canvas moveTo and lineTo
var drawTouch = function() {
    var start = function(e) {
	ctx.beginPath();
	x = e.changedTouches[0].pageX;
	y = e.changedTouches[0].pageY-44;
	ctx.moveTo(x,y);
    };
    var move = function(e) {
	e.preventDefault();
	x = e.changedTouches[0].pageX;
	y = e.changedTouches[0].pageY-44;
	ctx.lineTo(x,y);
	ctx.stroke();
    };
    document.getElementById("canvas").addEventListener("touchstart", start, false);
    document.getElementById("canvas").addEventListener("touchmove", move, false);
}; 

// prototype to	start drawing on pointer(microsoft ie) using canvas moveTo and lineTo
var drawPointer = function() {
    var start = function(e) {
        e = e.originalEvent;
	ctx.beginPath();
	x = e.pageX;
	y = e.pageY-44;
	ctx.moveTo(x,y);
    };
    var move = function(e) {
	e.preventDefault();
        e = e.originalEvent;
	x = e.pageX;
	y = e.pageY-44;
	ctx.lineTo(x,y);
	ctx.stroke();
    };
    document.getElementById("canvas").addEventListener("MSPointerDown", start, false);
    document.getElementById("canvas").addEventListener("MSPointerMove", move, false);
};        

// prototype to	start drawing on mouse using canvas moveTo and lineTo
var drawMouse = function() {
    var clicked = 0;
    var start = function(e) {
	clicked = 1;
	ctx.beginPath();
	x = e.pageX;
	y = e.pageY-44;
	ctx.moveTo(x,y);
    };
    var move = function(e) {
	if(clicked){
	    x = e.pageX;
	    y = e.pageY-44;
	    ctx.lineTo(x,y);
	    ctx.stroke();
	}
    };
    var stop = function(e) {
	clicked = 0;
    };
    document.getElementById("canvas").addEventListener("mousedown", start, false);
    document.getElementById("canvas").addEventListener("mousemove", move, false);
    document.addEventListener("mouseup", stop, false);
};

function isEmptyCanvas(data){

    if (data == emptyCanvas()){
	return 1;
    }

    return 0;
}

function emptyCanvas() {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABR8AAAFqCAYAAACTYS29AAAHR0lEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDfAPpmAAGv4H11AAAAAElFTkSuQmCC"
}