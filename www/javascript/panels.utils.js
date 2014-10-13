// http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata

function panels_utils_data_uri_to_blob(data_uri){

    // convert base64/URLEncoded data component to raw binary data held in a string

    var byteString;

    if (data_uri.split(',')[0].indexOf('base64') >= 0){
        byteString = atob(data_uri.split(',')[1]);
    }

    else {
        byteString = unescape(data_uri.split(',')[1]);
    }
    
    // separate out the mime component
    var mimeString = data_uri.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}
