const alertRefreshID = setInterval(alertRefresh, alertRefreshDelay);
function alertRefresh(){
    var thisAlert;
    if(thisTrainNo){
        $.ajax({
            url: `${db.alert}?${Date.now()}`,
            success: function(data){
                thisAlert = data;

                if(prevAlert == null){
                    prevAlert = thisAlert;
                    return;
                }
                
                if(prevAlert != thisAlert){
                    console.log('通知キタ');
                    prevAlert = thisAlert;
                    if(thisAlert != ""){
                        var audio = new Audio('./js/alert.ogg');
                        audio.play();
                        $('#alert').html(thisAlert);
                        $('#alert').css('display', 'block');
                    }
                }

            }, error: function (r, s, e){
                console.log(e);
                return;
            }
        });
    }
}