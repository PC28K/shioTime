let db = null;
let db_parsed = {};
let showMenu = 0;
let thisWork = null;
let thisWorkLength = null;
let thisWorkNo = null;
let thisTrainNo = null;
let prevAlert = [];
prevAlert[0] = null;
prevAlert[1] = null;
let alertList = '';
let showAlert = 0;

window.onload = function(){
    $('#titleHelper').text(mainTitle);
    menu();
}

window.onerror = function(msg, file, line){
    alert(`${msg}\n${file}\n${line}`);
}