function readDB(url){
    $.ajax({
		url: url,
		dataType: 'json',
		success: function(data){
            console.log('ダイヤDBロード成功')
			console.log(data);
            db = data;
		},
		error: function(data) {
            console.log('ダイヤDBロード失敗')
			console.log(data);
		}
    });
}