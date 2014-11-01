js: js-deps js-panels

js-deps:
	cat www/javascript/jquery-2.1.1.min.js www/javascript/localforage.min.js www/javascript/raphael.min.js www/javascript/raphael.sketchpad.min.js > www/javascript/panels.dependencies.min.js

js-panels:
	java -Xmx64m -jar lib/google-compiler/compiler-20100616.jar --js www/javascript/panels.ui.js --js www/javascript/panels.raphael.js --js www/javascript/panels.utils.js --js www/javascript/panels.storage.js --js www/javascript/panels.upload.schedule.js > www/javascript/panels.combined.min.js

