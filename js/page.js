function page(page){
    if(page == 'graph'){
        menu(1);
        if(thisWork != null)    graphTrain(thisWork);
        return;
    }

    menu(1);
    $.ajax({
        url: `./html/${page}.html?${Date.now()}`,
        success: function(data){
            $("#body").html(data);
        }, error: function (r, s, e){
            console.log(e);
        }
    });
}

function menu(w){
    if(showMenu || w == true){
        showMenu = 0;
        $('#menu').css('display', 'none');
    }
    else{
        showMenu = 1;
        $('#menu').css('display', 'block');
    }
}
