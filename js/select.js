function listDB(){
    var output = '';
    Object.keys(dbList).forEach(e => {
        output+= `<div class="time_list">`;
        output+= `
        <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="selectDB('${dbList[e]}')">
            ${e}
        </div>`;
        output+= '</div>'
    });
    Object.keys(db_parsed).forEach(e => {
        output+= `<div class="time_list">`;
        output+= `
        <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="selectDB('${e}', true)">
            ${e}
        </div>`;
        output+= '</div>'
    });
    output+= `<div class="time_list">
    <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="useLocal()">
        OuDia2 CSV
    </div></div>`;
    $('#time_scroll').html(output);

    thisWork = null;
    thisWorkLength = null;
    thisWorkNo = null;
    thisTrainNo = null;
    thisTrainCars = null;
}

function useLocal(){
    document.getElementById('localFile').click();
}

function selectLocal(){
    let file = document.getElementById('localFile');
    let csv = [];

    var c = 0;
    for(var i = 0; i < file.files.length; i++){
        let ii = i;
        let fr = new FileReader();
        fr.readAsText(file.files[i], "utf-8");

        fr.onload = () => {
            csv[ii] = fr.result;
            c++;
            if(c == file.files.length)  parseCSV();
        }
    }

    function parseCSV(){
        let pDB = {};
        var addedStations = {}; //수정부분

        for(var i = 0; i < csv.length; i++){
            csv[i] = csv[i].split('\r\n');
            for(var j = 0; j < csv[i].length; j++){
                csv[i][j] = csv[i][j].split(',');
            }
        }
        console.log(csv);

        for(var i = 0; i < csv.length; i++){
            const title = csv[i][1][0];
            if(pDB[title] == undefined){
                pDB[title] = {
                    group: {
                        imported: {
                            work: {},
                            train: {},
                            sort: {}
                    }},
                    station: [] //수정부분
                };
            }
            if(addedStations[title] == undefined)   addedStations[title] = [];

            for(var j = 2; j < csv[i][4].length; j++){
                let num = csv[i][4][j] == '' ? `null(${j})` : csv[i][4][j];
                if(pDB[title].group.imported.train[num] == undefined)
                        num = csv[i][4][j];
                else    num = csv[i][4][j] +`(${j})`;
                pDB[title].group.imported.train[num] = {};

                pDB[title].group.imported.train[num].cars = csv[i][8][j] == '' ? 0 : csv[i][8][j]*1;
                pDB[title].group.imported.train[num].type = csv[i][6][j];
                pDB[title].group.imported.train[num].note = csv[i][csv[i].length-2][j];
                pDB[title].group.imported.train[num].ops = [];

                let prev;
                let table = [];
                var inTT = false;

                for(var k = 5; k < csv[i].length-2; k++){
                    if(['始発駅作業', '終着駅作業'].includes(csv[i][k][0])){
                        if(!!csv[i][k][j])  pDB[title].group.imported.train[num].ops.push(csv[i][k][j]);
                        if(csv[i][k][0] == '終着駅作業')    break;
                    }
                }

                for(var k = 5; k < csv[i].length-2; k++){
                    if(!['発', '着'].includes(csv[i][k][1]))    continue;

                    var station = csv[i][k][0];
                    if(addedStations[title].includes(station)) continue;

                    pDB[title].station.push([station, 0, 1]);
                    addedStations[title].push(station);
                }

                for(var k = 5; k < csv[i].length-2; k++){
                    if(['番線', '発', '着'].includes(csv[i][k][1]))   inTT = true;
                    if(!inTT)   continue;

                    if(csv[i][k][j] == '||' || csv[i][k][j] == '')    continue;

                    if(csv[i][k][0] != prev){
                        table.push([csv[i][k][0], 0, 0, 0, 0]);
                        prev = csv[i][k][0];
                    }

                    let index = table.length-1;
                    if(csv[i][k][1] == '番線' && csv[i][k][j] != ''){
                          table[index][1] = csv[i][k][j] == '' ? 0 : csv[i][k][j];
                    }
                    else{
                        let time = csv[i][k][j].toString().trim();

                        if(time.includes('ﾚ')){
                            table[index][1] = -1;
                            continue;
                        }

                        if(time.includes('?')){
                            table[index][1] = -1;
                            time = time.replace('?', '');
                        }

                        //time = time.padStart(4, '0') + '00';
                        if(time*1 < 30000)    time = (time*1+240000).toString();
                        time = time.padStart(6, '0');
                        if(csv[i][k][1] == '着' && table[index][1] != -1)    table[index][2] = time;
                        if(csv[i][k][1] == '発')    table[index][3] = time;
                    }
                }
                pDB[title].group.imported.train[num].data = table;

                if(table.length != 0){
                    if(table[0][3]*1 < 30000)
                            pDB[title].group.imported.sort[num] = table[0][3]*1 + 240000;
                    else    pDB[title].group.imported.sort[num] = table[0][3]*1;
                }

                let work = csv[i][5][j];
                if(work != ''){
                    if(pDB[title].group.imported.work[work] == undefined)
                        pDB[title].group.imported.work[work] = [];

                    pDB[title].group.imported.work[work].push(num);
                }
            }

            Object.keys(pDB[title].group.imported.work).forEach(e => {
                pDB[title].group.imported.work[e] = pDB[title].group.imported.work[e].sort((a, b) => pDB[title].group.imported.sort[a] - pDB[title].group.imported.sort[b]);
            });
            //delete pDB[title].group.imported.sort;
        }

        console.log(pDB);

        db_parsed = pDB;
        listDB();
    }
}

function selectDB(url, parsed = false){
    if(parsed){
        db = db_parsed[url];
        listGroup();
        return;
    }
    $.ajax({
		url: `${url}?v=${Date.now()}`,
		dataType: 'json',
		success: function(data){
            console.log('ダイヤDBロード成功')
			console.log(data);
            db = data;
            listGroup();
		},
		error: function(data) {
            console.log('ダイヤDBロード失敗')
			console.log(data);
		}
    });
}

function listGroup(){
	$('#titleHelper').text('リストからグループを選択してください。');
	
	var output = '';
    Object.keys(db.group).forEach(e => {
        output+= `<div class="time_list">`;
        output+= `
        <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="selectGroup('${e}')">
            ${e}
        </div>`;
        output+= '</div>'
    });

    $('#time_scroll').html(output);
}

function selectGroup(group){
    var station = db.station;
	db = db.group[group];
    db.station = station;

    if(db.alert == undefined){
        alert('このグループは通知受信URLが定義されていないため、通知機能が動きません。');
    }
	listWork();
}

function listWork(){
    $('#titleHelper').text('リストから仕業を選択してください。');
    
    if(db.work == undefined){
        alert(`このグループには設定されている仕業がありません。\n「番号で選択」から解答ダイヤを選択してください。`);
        page('selectNumber');
        return;
    }

    var output = '';
    output+= `
    <div class="time_list">
    <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="page('selectNumber')">
        列車番号で選択
    </div></div>`;
    Object.keys(db.work).forEach(e => {
        output+= `<div class="time_list">`;
        output+= `
        <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="graphTrain('${e}')">
            ${e}
        </div>`;
        output+= '</div>'
    });

    $('#time_scroll').html(output);
}

function listTrain(work){
    $('#titleHelper').text('リストから列車を選択してください。');

    thisWork = work;
    thisWorkLength = db.work[work].length;

    var output = '<div id="time_title"><div class="time_content w0">列車番号</div><div class="time_content w1"></div><div class="time_content w2">始発</div><div class="time_content w3"></div><div class="time_content w4">終着</div></div>';
    for(var i = 0; i < thisWorkLength; i++){
        var e = db.work[work][i];
        var disDepTime;
        var disArvTime;
        if(db.train[e].data[0][3] != 0){
            var depTime = [];
            depTime[0] = db.train[e].data[0][3].substr(0, 2);
            depTime[1] = db.train[e].data[0][3].substr(2, 2);
            depTime[2] = db.train[e].data[0][3].substr(4, 2);

            if(!!display24cut)
            if(depTime[0] > 24) depTime[0] = depTime[0] - 24;

            disDepTime = `${(depTime[0]*1).toString().padStart(2, '&').replace('&', '&nbsp;')}.${depTime[1]}<span class="sec"> ${depTime[2]}</span>`;
        }

        if(db.train[e].data[db.train[e].data.length-1][2] != 0){
            var arvTime = [];
            arvTime[0] = db.train[e].data[db.train[e].data.length-1][2].substr(0, 2);
            arvTime[1] = db.train[e].data[db.train[e].data.length-1][2].substr(2, 2);
            arvTime[2] = db.train[e].data[db.train[e].data.length-1][2].substr(4, 2);

            if(!!display24cut)
            if(arvTime[0] > 24) arvTime[0] = arvTime[0] - 24;

            disArvTime = `${(arvTime[0]*1).toString().padStart(2, '&').replace('&', '&nbsp;')}.${arvTime[1]}<span class="sec"> ${arvTime[2]}</span>`;
        }

        output+= `<div class="time_list cursor" onclick="selectTrain('${e}', ${i})">`;
        output+= `
        <div class="time_content w0">
            ${e}
        </div>
        <div class="time_content w1">
            ${disDepTime}
        </div>
        <div class="time_content w2">
            ${db.train[e].data[0][0]}
        </div>
        <div class="time_content w3">
            ${disArvTime}
        </div>
        <div class="time_content w4">
            ${db.train[e].data[db.train[e].data.length-1][0]}
        </div>`
        output+= '</div>'
    };

    $('#time_scroll').html(output);
}

function graphTrain(work){
    if(!db.station){
        //alert('must set a station list');
        listTrain(work);
        return;
    }

    $('#titleHelper').text('リストから列車を選択してください。');

    thisWork = work;
    thisWorkLength = db.work[work].length;

    var stationIndex = [];
    var needStations = [];
    for(var i = 0; i < db.station.length; i++){
        stationIndex.push(db.station[i][0]);
    }

    var trains = [];

    for(var i = 0; i < thisWorkLength; i++){
        var e = db.work[work][i];
        var disDepTime;
        var disArvTime;
        if(db.train[e].data[0][3] != 0){
            var depTime = [];
            depTime[0] = db.train[e].data[0][3].substr(0, 2);
            depTime[1] = db.train[e].data[0][3].substr(2, 2);

            if(!!display24cut)
            if(depTime[0] > 24) depTime[0] = depTime[0] - 24;

            disDepTime = `${(depTime[0]*1).toString()}:${depTime[1]}`;
        }

        if(db.train[e].data[db.train[e].data.length-1][2] != 0){
            var arvTime = [];
            arvTime[0] = db.train[e].data[db.train[e].data.length-1][2].substr(0, 2);
            arvTime[1] = db.train[e].data[db.train[e].data.length-1][2].substr(2, 2);

            if(!!display24cut)
            if(arvTime[0] > 24) arvTime[0] = arvTime[0] - 24;

            disArvTime = `${(arvTime[0]*1).toString()}:${arvTime[1]}`;
        }

        var from = db.train[e].data[0][0];
        var dest = db.train[e].data[db.train[e].data.length-1][0];
        var fromIndex = stationIndex.indexOf(from);
        var destIndex = stationIndex.indexOf(dest);

        var train = {
            number: e,
            type: db.train[e].type,
            from: [fromIndex, disDepTime],
            dest: [destIndex, disArvTime],
            ops: db.train[e].ops
        };
        trains.push(train);

        if(!needStations.includes(fromIndex))   needStations.push(fromIndex);
        if(!needStations.includes(destIndex))   needStations.push(destIndex);

    };
    needStations.sort(function(a, b){return a-b});
    console.log(needStations);
    console.log(trains);

    var min = needStations[0];
    var max = needStations[needStations.length-1];
    var height = 100 / needStations.length;

    $('#time_scroll').html(`<div id="graph_stns"></div><div id="graph_trains"></div>`);

    var output = '';
    for(var i = 0; i < needStations.length; i++){
        output+= `<div style="width: 100%; height: ${height}%;">${stationIndex[needStations[i]]}</div>`;
    }
    $('#graph_stns').html(output);

    var output = '';
    for(var i = 0; i < trains.length; i++){
        if(trains[i].dest[0] < trains[i].from[0]){
            var bottom = needStations.indexOf(trains[i].from[0])*height;
            var top = needStations.indexOf(trains[i].dest[0])*height;
            var timestring = [trains[i].dest[1], trains[i].from[1]];
            var border = 'border-top: 1px solid #000;';
            var dir = 0;
        }
        else{
            var top = needStations.indexOf(trains[i].from[0])*height;
            var bottom = needStations.indexOf(trains[i].dest[0])*height;
            var timestring = [trains[i].from[1], trains[i].dest[1]];
            var border = 'border-bottom: 1px solid #000;';
            var dir = 1;
        }
        if(i+1 == trains.length)    border = '';

        var opsmarkers = '';
        if(!!trains[i].ops){
            for(var j = 0; j < trains[i].ops.length; j++){
                if(trains[i].ops[j] == '出区'){
                    if(!dir)    var pos = bottom;
                    else        var pos = top;
                    opsmarkers+= `<div class="graph_ops" style="top: calc(${pos+5}% - 0.9em)">○</div>`;
                }
                else if(trains[i].ops[j] == '入区'){
                    if(dir)     var pos = bottom;
                    else        var pos = top;
                    opsmarkers+= `<div class="graph_ops" style="top: calc(${pos+5}% - 0.9em)">△</div>`;
                    border = '';
                }
                    
            }
        }

        output+= `
            <div class="graph_train">
                <div class="graph_time" style="top: ${top+5}% ;">
                    <span class="rotate180">${timestring[0]}</span>
                </div>
                <div
                    class="graph_selectable"
                    style="height: ${bottom - top}%; ${border} top: ${top+5}%; width: 10vw;"
                    onclick="selectTrain('${trains[i].number}', ${i});"
                ">
                    <span class="rotate180">${trains[i].number}</span> <span style="font-size: 0.6em; writing-mode: horizontal-tb;">${trains[i].type}</span>
                </div>
                <div class="graph_time" style="top: ${bottom+5}%;">
                    <span class="rotate180">${timestring[1]}</span>
                </div>
                ${opsmarkers}
            </div>
        `;
    }
    $('#graph_trains').html(output);

}

function selectTrain(num, workNo){
    thisWorkNo = workNo;
    thisTrainNo = num;
    page('timetable');
}

function changeTrain(pm){
    if(thisWork == null){
        alert(`仕業から列車を選択した場合のみ使える機能です。`);
        return;
    }
    else if(pm == -1 && thisWorkNo == 0){
        alert(`仕業${thisWork}では${thisTrainNo}が最初の列車です。`);
        return;
    }
    else if(pm == 1 && thisWorkNo+1 == thisWorkLength){
        alert(`仕業${thisWork}では${thisTrainNo}が最後の列車です。`);
        return;
    }

    thisWorkNo+= pm;
    thisTrainNo = db.work[thisWork][thisWorkNo];
    page('timetable');
}

function formNumber(){
	if(db == null || db.hasOwnProperty('train') == false){
		alert(`「仕業で選択」からファイルとグループを選択した後に試してください。`);
		page('select');
	}
}

function selectNumber(){
    var inputNumber = $('#inputTrainNo').val();
    var inputCars = null;
    if(inputCars != '0' && inputCars != "")
        inputCars = $('#inputTrainCars').val();

    if(inputNumber == ''){
        alert(`列車番号を入力してください。`);
        return;
    }

    if(db.train[inputNumber] == undefined){
        alert(`このグループに${inputNumber}列車はありません。`);
        return;
    }

    thisWork = null;
    thisWorkLength = null;
    thisWorkNo = null;
    thisTrainNo = null;

    Object.keys(db.work).forEach(work => {
        var index = db.work[work].indexOf(inputNumber);
        if(index !== -1){
            thisWork = work;
            thisWorkLength = db.work[work].length;
            thisWorkNo = index;
            return false;
        }
    });
    
    thisTrainNo = inputNumber;
    thisTrainCars = inputCars;
    page('timetable');
}
