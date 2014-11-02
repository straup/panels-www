# panels-www

`panels` is a simple web-based sketching application built on top of Ian Li's [Raphael SketchPad](http://ianli.com/sketchpad/) and Mozilla's
[localforage](https://github.com/mozilla/localforage) library. Sketches
can be saved to (and re-loaded (and deleted) from) the browser's local storage database.

Raphael SketchPad exposes a number of "canvas" and "pen" related options. None
of them are available in `panels`. They might be one day but for now the easiest
way to think about things is being like sketching with a pen. The default
settings for the "pen" are 1-pixel wide with an opacity of 60 percent. There is
no undo.

`panels` uses [Scalable Vector Graphics (SVG)](https://developer.mozilla.org/en-US/docs/Web/SVG) under the hood so all of your
sketches can be view source-ed allowing them to be exported as a set of drawing
instructions, in plain text. This is one of those things that never seems very
important until it is (at which point it's usually too late) so there's a handy
button for doing just that on every sketch. 

## Demo

[https://straup.github.io/panels-www/demo/](https://straup.github.io/panels-www/demo/)

## Set up

Unless you are interested in uploading sketches to a remote server `panels` has
no server-side dependencies and can be run as-is in any old (modern-ish) web
browser. The only thing you'll need to do is copy the `www/index.html.example` file to
`www/index.html`.

The reason you need to do this is because `www/index.html` is
explicitly forbidden from being included in version control. That might seen a
bit strange for a web-application but is necessary because it prevents any
custom changes that a person makes to enable uploads (discussed below) from
being applied to everyone else's stuff.

## Offline mode

`panels` can also be run in offline-mode. Offline mode means that the first time
you load the webpage it will so something called [the application cache dance](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache)
with your browser and store all the files needed to run the sketchpad offline.

To get offline mode working you'll need to do the following:

* Rename `www/offline.html.example` to `www/offline.html`
* Rename `www/offline.appcache.example` to `www/offline.appcache`
* Ensure that the web server hosting your copy of `panels` is configured to [send the correct mime-type](http://www.html5rocks.com/en/tutorials/appcache/beginner/) for your `offline.appcache` file.

This last part is sort of a pain particularly if you're not used to wrangling
web servers. The repository contains a sample
[.htaccess](https://httpd.apache.org/docs/2.4/howto/htaccess.html) file which
contains the necessary instructions to tell the Apache webserver what to
do. Many web-hosting servers allow you define your own `.htaccess` files on a
per-directory basis. If yours does all you should need to do is:

* Rename `www/offline.htaccess.example` to `www/.htaccess`

If you're not using Apache then you will need to consult your web server
documentation to figure out how to tell it to "tell the browser that anything ending in
'.appcache' has the content-type (or mime-type) 'text/cache-manifest'".

Note that there is nothing special about the filenames `offline.html` or
`offline.appcache`. You can name them whatever you'd like but be aware that the
latter is referenced in the former so if you change its name you'll need to
update the pointer.

## Uploading files

There are also incomplete hooks for uploading a sketch, as an SVG document
consisting of one or more [path
elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) to a
remote server. If necessary, it is left to the remote server to convert the SVG to an image using
a tool like [ws-raster](https://github.com/straup/java-ws-raster) or equivalent.

By "incomplete hooks" I mean they work in principle (and uses localforage [to
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

