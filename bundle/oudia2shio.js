#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.clear();

console.log('\x1b[42m\x1b[97m   OuDia CSV to shioTime JSON 変換スクリプト   \n\x1b[0m');
selectFile();

function selectFile(){
    console.log('\x1b[92m   変換するOuDiaCSVのパスを入力してください。');
    console.log('\x1b[93m   - 複数ファイルは","で区分してください。(例："./nobori.csv,./kudari.csv")');
    rl.question('\x1b[0m   > ', parsePath);
}

function parsePath(path){
    path = path.split(',');
    var csv = [];
    for(var i = 0; i < path.length; i++){
        var np = path[i].trim();
        csv[i] = fs.readFileSync(np, {encoding:'utf-8'});
    }

    function parseCSV(csv){
        let pDB = {
            group: {},
            station: []
        };
        var addedStations = [];

        for(var i = 0; i < csv.length; i++){
            csv[i] = csv[i].split('\r\n');
            for(var j = 0; j < csv[i].length; j++){
                csv[i][j] = csv[i][j].split(',');
            }
        }
        //console.log(csv);

        for(var i = 0; i < csv.length; i++){
            const title = csv[i][1][0];

            if(pDB.group[title] == undefined){
                pDB.group[title] = {
                    work: {},
                    train: {},
                    sort: {}
                };
            }

            for(var j = 2; j < csv[i][4].length; j++){
                let num = csv[i][4][j] == '' ? `null(${j})` : csv[i][4][j];
                if(pDB.group[title].train[num] == undefined)
                        num = csv[i][4][j];
                else    num = csv[i][4][j] +`(${j})`;
                pDB.group[title].train[num] = {};

                pDB.group[title].train[num].cars = csv[i][8][j] == '' ? 0 : csv[i][8][j]*1;
                pDB.group[title].train[num].type = csv[i][6][j];
                pDB.group[title].train[num].note = csv[i][csv[i].length-2][j];

                let prev;
                let table = [];
                var inTT = false;

                for(var k = 5; k < csv[i].length-2; k++){ //수정부분
                    if(!['発', '着'].includes(csv[i][k][1]))    continue;

                    var station = csv[i][k][0];
                    if(addedStations.includes(station)) continue;

                    pDB.station.push([station, 0, 1]);
                    addedStations.push(station);
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
                pDB.group[title].train[num].data = table;

                if(table.length != 0){
                    if(table[0][3]*1 < 30000)
                            pDB.group[title].sort[num] = table[0][3]*1 + 240000;
                    else    pDB.group[title].sort[num] = table[0][3]*1;
                }

                let work = csv[i][5][j];
                if(work != ''){
                    if(pDB.group[title].work[work] == undefined)
                        pDB.group[title].work[work] = [];

                    pDB.group[title].work[work].push(num);
                }
            }

            Object.keys(pDB.group[title].work).forEach(e => {
                pDB.group[title].work[e] = pDB.group[title].work[e].sort((a, b) => pDB.group[title].sort[a] - pDB.group[title].sort[b]);
            });
            //delete pDB.group[title].sort;
        }
        
        saveJSON(pDB);
    }

    parseCSV(csv);
}

async function saveJSON(db){
    var groups = Object.keys(db.group);
    groups.forEach(key => {
        delete db.group[key].sort;
    });

    console.log('\x1b[92m\n   通知ファイルのURLを入力してください。');
    console.log('\x1b[93m   - 通知機能を使用しない場合は何も入力せずにENTERキーを押してください。');
    rl.question('\x1b[0m   > ', setAlertURL);

    function setAlertURL(url){
        if(url != ""){
            groups.forEach(key => {
                db.group[key].alert  = url;;
            });
        }

        console.log('\x1b\n[92m   出力するファイルパスを入力してください。');
        rl.question('\x1b[0m   > ', exportJSON);
    }

    

    function exportJSON(path){
        db = JSON.stringify(db);
        fs.writeFileSync(path, db);
        console.log('\x1b[92m\n   ファイルを出力しました。\x1b[0m');

        rl.close();
    }
}
