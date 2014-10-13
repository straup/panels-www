var ctx, color = "#000";	

document.addEventListener( "DOMContentLoaded", function(){

	setTimeout(function(){
		loadCanvas();
	    }, 500);

	/*
    setTimeout(function(){
	newCanvas();
    }, 1000);
	*/
    
}, false );

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

function uploadCanvas(){

    var canvas = document.getElementById('canvas');
    var data = canvas.toDataURL();

    if (isEmptyCanvas(data)){
	alert("Your canvas is empty. There's nothing to save!");
	return false;
    }

    try {
	var blob = panels_utils_data_uri_to_blob(data);
    }
    
    catch(e){
	console.log("failed to convert data to blob");
	console.log(e);
	return false;
    }

    if (! confirm("Are you sure you want to upload this?")){
	return false;
    }
    
    doUploadCanvas(blob);
}

function doUploadCanvas(file){

    console.log(file);

    var data = new FormData();
    data.append('photo', file);

    var on_success = function(rsp){

	/*
	localforage.removeItem(key, function(rsp){
	    
	});
	*/

    };
    
    var on_error = function(rsp){

    };
        
    /*
    $.ajax({
	url: 'https://upload.example.com/',
	type: "POST",
	data: data,
	cache: false,
	contentType: false,
	processData: false,
	dataType: "json",
	success: on_success,
	error: on_error,
    });
    */

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

	for (var i=0; i < count; i++){
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

        var canvas = document.getElementById('canvas');
	canvas.setAttribute('data-canvas-key', key);

        var context = canvas.getContext('2d');

        var imageObj = new Image();

        imageObj.onload = function() {
            context.drawImage(this, 0, 0);
        };

        imageObj.src = rsp['data'];
    });
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