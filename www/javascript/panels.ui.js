function panels_ui_show_controls(){

    var h = document.getElementById("header-controls");
    var f = document.getElementById("footer-controls");

    if (getComputedStyle(h).display == 'none'){
	h.style.display = 'inline';
    }

    if ((f) && (getComputedStyle(f).display == 'none')){
	f.style.display = 'inline';
    }

    return false;
}

function panels_ui_hide_controls(){

    var h = document.getElementById("header-controls");
    var f = document.getElementById("footer-controls");

    if (getComputedStyle(h).display != 'none'){
	h.style.display = 'none';
    }

    if ((f) && (getComputedStyle(f).display != 'none')){
	f.style.display = 'none';
    }

    return false;
}
