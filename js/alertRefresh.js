const alertRefreshID = setInterval(alertRefresh, alertRefreshDelay);
function alertRefresh(){
    if(thisTrainNo){
        if(db.alert == undefined)
        return;
        
        $.ajax({
            url: `${db.alert}?${Date.now()}`,
            success: function(data){
                alertArray = data.split('|');

                var c = alertArray.length;
                for(var i = 0; i < c; i++){
                    var thisAlert = alertArray[i].split(',');
                    if(thisAlert.length == 1){
                        //全体
                        if(prevAlert[0] != thisAlert[0]){
                            console.log('全体通知キタ');
                            if(thisAlert[0] != ""){
                                var audio = new Audio('./js/alert.ogg');
                                audio.play();
                                alertListRefresh(thisAlert[0]);
                            }
                        }
                        prevAlert[0] = thisAlert[0];
                    }
                    else if(thisAlert[0] == thisTrainNo){
                        //個別
                        if(prevAlert[1] != thisAlert[1]){
                            console.log('個別通知キタ');
                            if(thisAlert[1] != ""){
                                var audio = new Audio('./js/alert.ogg');
                                audio.play();
                                alertListRefresh(`[${thisAlert[0]}] ${thisAlert[1]}`);
                            }
                        }
                        prevAlert[1] = thisAlert[1];
                    }
                }

            }, error: function (r, s, e){
                console.log(e);
                return;
            }
        });
    }
}

function alertListRefresh(msg){
    var output = alertList;

    var date = new Date();
    var h = date.getHours();	if(h<10) h='0'+h;
    var m = date.getMinutes();	if(m<10) m='0'+m;
    var s = date.getSeconds();	if(s<10) s='0'+s;

    msg = `${h}:${m}:${s}　${msg}<br>`;
    output = msg + output;

    alertList = output;
    $('#alertList').html(output);
    $('#alertList').css('display', 'block');
    if(showAlert == 0)  $('#alertList').css('height', '9vw');
}