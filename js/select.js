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
    $('#time_scroll').html(output);

    thisWork = null;
    thisWorkLength = null;
    thisWorkNo = null;
    thisTrainNo = null;
    thisTrainCars = null;
}

function selectDB(url){
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
	db = db.group[group];
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
        <div class="time_content cursor" style="width: 100%; border-left: 0;" onclick="listTrain('${e}')">
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

            disDepTime = `${(depTime[0]*1).toString().padStart(2, '&').replace('&', '&nbsp;')}.${depTime[1]}<span class="sec"> ${depTime[2]}</span>`;
        }

        if(db.train[e].data[db.train[e].data.length-1][2] != 0){
            var arvTime = [];
            arvTime[0] = db.train[e].data[db.train[e].data.length-1][2].substr(0, 2);
            arvTime[1] = db.train[e].data[db.train[e].data.length-1][2].substr(2, 2);
            arvTime[2] = db.train[e].data[db.train[e].data.length-1][2].substr(4, 2);

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
    
    thisTrainNo = inputNumber;
    thisTrainCars = inputCars;
    page('timetable');
}