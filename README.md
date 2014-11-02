# panels-www

`panels` is a simple web-based sketching application built on top of Ian Li's
SVG [Raphael SketchPad](http://ianli.com/sketchpad/) and Mozilla's
[localforage](https://github.com/mozilla/localforage) library. Sketches
can be saved (and re-loaded (and deleted)) to the browser's local storage database.

Raphael SketchPad exposes a number of "canvas" and "pen" related options. None
of them are available in `panels`. They might be one day but for now the easiest
way to think about things is being like sketching with a marker. There is no undo.

Unless you are interested in uploading sketches to a remote server `panels` has
no server-side dependencies and can be run as-is in any old (modern-ish) web
browser.

## Uploading files

There are also incomplete hooks for uploading a sketch, as an SVG document
consisting of one or more [path
elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) to a
remote server. If necessary, it is left to the remote server to convert the SVG to an image using
a tool like [ws-raster](https://github.com/straup/java-ws-raster) or equivalent.

By "incomplete hooks" I mean it works in principle (and uses localforage [to
cache uploads](http://www.aaronland.info/weblog/2014/09/22/desire/#upload) in
case there are network errors) but hasn't been rigorously tested yet.

The code looks for a `panels_custom_prepare_upload` function which you need to
define and load in a Javascript file of your own. The function is passed a
[File](https://developer.mozilla.org/en-US/docs/Web/API/File) object and a callback. The function is expected to invoke the callback
passing a dictionary containing two keys:

* **endpoint** is a fully-qualified URL of where to send an HTTP POST request
* **formdata** is a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object containing a reference to the file and any other parameters required by the endpoint

For example assume a file called `panels.custom.js` which defines the following functions:

	function panels_custom_prepare_upload(file, cb){

		var data = new FormData();
		data.append('file', file);

		// Any other parameters you need to pass

		var endpoint = 'https://your-server.example.com/upload/';

		var rsp = {'endpoint': endpoint, 'formdata': data};
		cb(rsp);
	}

	function panels_custom_upload_ok(rsp){
		panels_ui_success("Success!");
		console.log(rsp);
	}

By default the path `www/javascript/panels.custom.js` is explicitly ignored by the .gitgnore file.

## To Do

### Two-finger canvas scrolling for touch devices

Currently there is no way to distinguish one-finger versus two-finger touch
events which means that there is no way to pan or scroll a canvas on a
(typically) mobile device. Instead all touch events are interpretted as draw events.

Maybe. There's no ability (or plan) to share drawings between devices so there's
something nice about the enforced constraint of the screen size. On the other
hand it might be sort of nice to be able to "grow" the canvas. We'll see.

### Remove the need for jQuery

jQuery is used in a handful of places in `raphael.sketchpad.js` which has caused
me to use it in the `panels` Javascript code. I love jQuery but it is probably
overkill for this project so it will eventually be removed.

## See also

* http://ianli.com/sketchpad/
* http://raphaeljs.com/
* https://github.com/mozilla/localforage
* https://github.com/straup/java-ws-raster

