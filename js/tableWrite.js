function tableWrite(dia){
    var thisTime = db.time[dia];

    if(thisTime == undefined){
        console.log('存在しない列車番号')
        return;
    }

    $('#trainNo').text(dia);
    $('#trainType').text(thisTime.type);
    if(thisTrainCars == null || thisTrainCars == "")
        $('#trainCars').text(thisTime.cars);
    else    $('#trainCars').text(thisTrainCars);
    if(thisWork != null && thisWorkNo != null){
        $('#workNo').text(thisWork);
        $('#workInNo').text(thisWorkNo+1);
    }

    var output = '<div id="time_title"><div class="time_content r0">運転時分</div><div class="time_content r1">駅名</div><div class="time_content r2">線路</div><div class="time_content r3">到着</div><div class="time_content r4">出発/通過</div></div>';
    var prevHour;
    var prevDepTime;
    var c = thisTime.data.length;
    for(var i = 0; i < c; i++){
        var pass = false;

        //線路
        var disTrack = '';
        if(thisTime.data[i][1] != 0){
            if(thisTime.data[i][1] == -1)
                pass = true;
            else
                disTrack = thisTime.data[i][1];
        }

        //到着時刻
        var disArvTime = '';
        if(thisTime.data[i][2] != 0){
            var arvTime = [];
            arvTime[0] = thisTime.data[i][2].substr(0, 2);
            arvTime[1] = thisTime.data[i][2].substr(2, 2);
            arvTime[2] = thisTime.data[i][2].substr(4, 2);

            if(arvTime[0] != prevHour){
                prevHour = arvTime[0];
                disArvTime = `${(arvTime[0]*1).toString().padStart(2, '&').replace('&', '&nbsp;')}.${arvTime[1]}<span class="sec"> ${arvTime[2]}</span>`;
            }
            else
                disArvTime = `&nbsp;&nbsp;.${arvTime[1]}<span class="sec"> ${arvTime[2]}</span>`;
        }
        else if(pass)   disArvTime = '|';

        //発射時刻
        var disDepTime = '';
        if(thisTime.data[i][3] != 0){
            var depTime = [];
            depTime[0] = thisTime.data[i][3].substr(0, 2);
            depTime[1] = thisTime.data[i][3].substr(2, 2);
            depTime[2] = thisTime.data[i][3].substr(4, 2);

            if(depTime[0] != prevHour){
                prevHour = depTime[0];
                disDepTime = `${(depTime[0]*1).toString().padStart(2, '&').replace('&', '&nbsp;')}.${depTime[1]}<span class="sec"> ${depTime[2]}</span>`;
            }
            else
                disDepTime = `&nbsp;&nbsp;.${depTime[1]}<span class="sec"> ${depTime[2]}</span>`;
        }
        else if(i == c - 1) disDepTime = '＝';
        else if(pass)   disDepTime = '|';

        //運転時分計算
        var disDiff = '';
        if(i > 0){
            var thisArvTime = 0;
            if(thisTime.data[i][2] != 0)
                thisArvTime = (arvTime[0]*60*60) + (arvTime[1]*60) + (arvTime[2]*1);
            else if(thisTime.data[i][3] != 0)
                thisArvTime = (depTime[0]*60*60) + (depTime[1]*60) + (depTime[2]*1);

            if(thisArvTime < prevDepTime && thisArvTime != 0)   thisArvTime+= 24*60*60;

            if(thisArvTime != 0)
                disDiff = `${(parseInt((thisArvTime-prevDepTime)/60)).toString().padStart(2, '&').replace('&', '&nbsp;')}<span class="sec"> ${((thisArvTime-prevDepTime)%60+'').padStart(2, '0')}</span>`;
            else
                disDiff = '';
        }
        if(thisTime.data[i][3] != 0)
            prevDepTime = (depTime[0]*60*60) + (depTime[1]*60) + (depTime[2]*1);
        else if(thisTime.data[i][2] != 0)
            prevDepTime = (arvTime[0]*60*60) + (arvTime[1]*60) + (arvTime[2]*1);

        //ハイライト
        var addClass = '';
        if(thisTime.data[i][4] == 1)
            addClass+= ' highlight';
        
        if(i == 0)
            var addStyleR0 = 'style="background-color: unset;"';
        else    var addStyleR0 = '';


        output+= `<div class="time_list ${addClass}">`;
        output+= `
        <div class="time_content r0" ${addStyleR0}>
            ${disDiff}
        </div>
        <div class="time_content r1">
            ${thisTime.data[i][0]}
        </div>
        <div class="time_content r2">
            ${disTrack}
        </div>
        <div class="time_content r3">
            ${disArvTime}
        </div>
        <div class="time_content r4">
            ${disDepTime}
        </div>`;
        output+= '</div>'

        //終点
        if(i == c - 1){
            $('#trainDest').text(thisTime.data[i][0]);
        }
    }

    $('#time_scroll').html(output);
}