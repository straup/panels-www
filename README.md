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

By "incomplete hooks" I mean it totally works (and uses localforage [to cache uploads](http://www.aaronland.info/weblog/2014/09/22/desire/#upload) in case there
are network errors) but for a simple(r) interface to configure the details of
that remote server. This includes stuff like its URL, authentication and all the
other stuff that are specific to a given user.

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

