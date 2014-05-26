var WINDOWHEIGHT = $(window).height();
var WINDOWWIDTH = $(window).width();
var LOGOWIDTH = WINDOWWIDTH*0.618;
var LOGOHEIGH = WINDOWWIDTH*0.618;
var CEILWIDTH = (WINDOWWIDTH-30)*0.9;
var CEILHEIGHT = WINDOWHEIGHT*0.2;
var loadlock = new Array();//loadlock锁,每个页面对应一个
loadlock['amazon'] = 0;
loadlock['dangdang'] = 0;
loadlock['jd'] = 0;
loadlock['login'] = 0;
loadlock['collect'] = 0;
loadlock['delete'] = 0;
loadlock['getcomment'] = 0;
loadlock['addcomment'] = 0;
var datacatch = new Array();
datacatch['amazon'] = new Array();
datacatch['dangdang'] = new Array();
datacatch['jd'] = new Array();
datacatch['test'] = new Array();
datacatch['test'][0] = {name:'tom',sex:'female'};
datacatch['test'][1] = {name:'tom2',sex:'female2'};
var ceilcount = new Array();
ceilcount['amazon'] = 0;
ceilcount['dangdang'] = 0;
ceilcount['jd'] = 0;
//标志着这个关键字没有更多的内容页了
//只有在刷新页面或者点击搜索时才会重置
var nomorepage = new Array();
nomorepage['amazon'] = 0;
nomorepage['dangdang'] = 0;
nomorepage['jd'] = 0;
//网络错误的时候的标记
//用于告诉search按钮
//即使当前关键字与页面关键字相同
//也要搜索
var neterror = new Array();
nomorepage['amazon'] = 0;
nomorepage['dangdang'] = 0;
nomorepage['jd'] = 0;
//用来标记排序的方式
//默认为1
//按人气排为2
//按价格排为3
var sortway = new Array();
sortway['amazon'] = 1;
sortway['dangdang'] = 1;
sortway['jd'] = 1;



var nowuser='';
//服务器名
//var SERVER = 'http://114.215.202.143:8888/'
var SERVER = 'http://192.168.35.140:8888/'
//记录页面状态
var pagestate = {
    amazon:{keyword:'',page:0},
    dangdang:{keyword:'',page:0},
    jd:{keyword:'',page:0},
    current:{name:'',keyword:'',page:0}
};
//刷新当前页面状态
function reflashcurrentstate(name,keyword,page){
    pagestate.current.name = name;
    pagestate.current.keyword = keyword;
    pagestate.current.page = page;
}
//将传输回来的数据添加在页面中
function addpage(data){

    var length = data.length;
    for(var i = 0;i < length;i++){
        var ceil = $('<div class="bookceil page'+pagestate.current.page+'" id="'+ceilcount[pagestate.current.name]+'""></div>');
        ceil.append('<a data-transition="none" href="#goodsdetail" data-role="button"><img class="cover" src="'+data[i].cover+'"></a>');
        var detail = $('<div class="detail"></div>');
        if(data[i].name.length >= 40){
            detail.append('<div title="'+data[i].name+'" class="name">'+data[i].name.substr(0,30)+'...'+'</div>');
        }
        else
            detail.append('<div title="'+data[i].name+'" class="name">'+data[i].name+'</div>');
        
        if(data[i].author != ''){
            if (data[i].author == undefined) {
                data[i].author = '暂无作者信息';
            };
            if(data[i].author.length >= 15){
                detail.append('<div title="'+data[i].author+'" class="author">'+data[i].author.substr(0,10)+'...'+'</div>');
            }
            else
                detail.append('<div title="'+data[i].author+'" class="author">'+data[i].author+'</div>');
        }
        if (data[i].info == undefined) {
            data[i].info = '暂无出版社信息';
        };
        if(data[i].info.length >= 15){
            detail.append('<div title="'+data[i].info+'" class="info">'+data[i].info.substr(0,10)+'...'+'</div>');
        }
        else
            detail.append('<div title="'+data[i].info+'" class="info">'+data[i].info+'</div>');
        //detail.append('<div class="button black url" title="'+data[i].url+'">访问商铺</div>');
        detail.append('<div class="price">￥'+data[i].price+'</div>');
        detail.append('<a title="page'+pagestate.current.page+'" id="'+ceilcount[pagestate.current.name]+'" class="button black collect">收藏</a>');
        detail.append('<a href="'+data[i].url+'" class="button black url">访问商铺</a>');
        ceil.append(detail);
        $('.shoppage#'+pagestate.current.name+' .result_content').append(ceil);
        formartceil('#'+pagestate.current.name+' .bookceil.page'+pagestate.current.page);
        ceilcount[pagestate.current.name]++;
    }

    console.log('current page is'+pagestate.current.page);
}
function loadcollect(data){
    console.log('call loadcollect');
    var length = data.length;
    if(length == 0){
        $('.shoppage#collect p').removeClass('displaynone');
        return;
    }
    $('.shoppage#collect p').addClass('displaynone');
    for(var i = 0;i < length;i++){
        var ceil = $('<div class="bookceil pagecollect" id="'+i+'""></div>');
        ceil.append('<img class="cover" src="'+data[i].cover+'">');
        var detail = $('<div class="detail"></div>');
        detail.append('<div class="name">'+data[i].name+'</div>');
        detail.append('<div class="price">￥'+data[i].price+'</div>');
        if(data[i].author != ''){
            if (data[i].author == undefined) {
                data[i].author = '暂无作者信息';
            };
            detail.append('<div class="author">'+data[i].author+'</div>');
        }
        if (data[i].info == undefined) {
            data[i].info = '暂无出版社信息';
        };
        detail.append('<div class="info">'+data[i].info+'</div>');
        //detail.append('<div class="button black url" title="'+data[i].url+'">访问商铺</div>');
        detail.append('<a title="'+data[i].id+'" id="'+i+'" class="button black delete">删除</a>');
        detail.append('<a href="'+data[i].url+'" class="button black url">访问商铺</a>');
        ceil.append(detail);
        $('.shoppage#collect .result_content').append(ceil);
          
    }
    console.log('test');
    formartceil('#collect .bookceil.pagecollect'); 
}
//取得评论
function getcomment(data){
    console.log('in getcomment');
    if (data == '0'){
        $('#usercomment p').removeClass('displaynone');
        $('#usercomment .comment_content').addClass('displaynone');
    }
    else{
        $('#usercomment .comment_content').removeClass('displaynone');
        $('#usercomment p').addClass('displaynone');
    }
    var length = data.length;
    for(var i = 0;i<length;i++){
        var ceil = $('<div class="comment_ceil"></div>');
        ceil.append('<h2>'+data[i].user+' 说</h2>');
        console.log('user is :'+data[i].user);
        ceil.append('<h3>'+data[i].comment+'</h3>');
        console.log('user is :'+data[i].comment);
        $('.comment_content').append(ceil);
    }
}
//对商品列表的元素进行布局
function formartceil(selecter){
    var urlwidth = WINDOWWIDTH/6.4;
    var collectwidth = WINDOWWIDTH/12.8;
    var deletetwidth = WINDOWWIDTH/12.8;
    console.log($(selecter).find('.name').text());
    console.log(urlwidth);
    console.log(collectwidth);
    console.log(deletetwidth);
    $(selecter).css({
        width: '100%',
        height: CEILHEIGHT+'px',
        'margin-bottom': CEILHEIGHT/10 +'px'
    });
    $(selecter).find('img').css({
        width: (CEILWIDTH/3.5-CEILWIDTH/17.25)+'px',
        height: (CEILHEIGHT-CEILWIDTH/17.25)+'px',
        margin: CEILWIDTH/34.5 +'px'
    });
    $(selecter).find('.detail').css({
        'margin-top': CEILWIDTH/34.5 +'px',
        width: (CEILWIDTH-CEILWIDTH/3.5-2)+'px'
    });
    $(selecter).find('.name').css({
        'font-size' : CEILWIDTH/23+'px',
        'font-weight' : 'bold',
        height:CEILHEIGHT/2.4 +'px',
    });
    $(selecter).find('.info').css({
        'font-size': CEILWIDTH/30+'px',
        height:CEILHEIGHT/7 +'px',
        'line-height':CEILHEIGHT/7 +'px'
    });
    $(selecter).find('.author').css({
        'font-size': CEILWIDTH/30+'px',
        height:CEILHEIGHT/7 +'px',
        'line-height':CEILHEIGHT/7 +'px'
    });
    $(selecter).find('.price').css({
        'font-size': CEILWIDTH/20+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'color':'#003366'
    });
    $(selecter).find('.url').css({
        right: CEILWIDTH/34.5 +'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'padding': CEILWIDTH/79 +'px',
        'text-shadow':'none',
        'width': urlwidth+'px',
        'height':urlwidth/4+'px'
    }); 
    $(selecter).find('.collect').css({
        right: urlwidth+collectwidth+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'padding': CEILWIDTH/79 +'px',
        'text-shadow':'none',
        'width': collectwidth+'px',
        'height':collectwidth/2+'px'
    });
    $(selecter).find('.delete').css({
        right: urlwidth+deletetwidth+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'padding': CEILWIDTH/79 +'px',
        'text-shadow':'none',
        'width': deletetwidth+'px',
        'height': deletetwidth/2+'px'
    });
    
}
//搜索按钮函数
function searchbook(pagename,bookname){
    //由于加入了排序，暂时将这个除重删掉
/*    if(pagestate.current.keyword == bookname && neterror[pagestate.current.name] == 0)
        return;*/
    $('.shoppage#'+pagestate.current.name+' .result_content').empty();
    console.log('searchbook');
    $('.loadingimg').removeClass('displaynone');
    //设置当前页面的属性
    pagestate.current.keyword = bookname;
    pagestate.current.page = 0;
    if(pagename == 'dangdang'){
        pagestate.dangdang.keyword = bookname;
        pagestate.dangdang.page = 0;
    }
    if(pagename == 'amazon'){
        pagestate.amazon.keyword = bookname;
        pagestate.amazon.page = 0;
    }
    if(pagename == 'jd'){
        pagestate.jd.keyword = bookname;
        pagestate.jd.page = 0;
    }
    datacatch[pagestate.current.name] = [];
    loadmore();
}
//滚动加载
function loadmore(){

    console.log('run loadmore');
    //如果datacatch里面有数据
    //就直接提取里面的数据
    //如果是从hashchange中进入的loadmore
    //那么无聊datacatch里面是否
    //有数据都会被hashchange函数
    //清空
      
/*    if(nomorepage[pagestate.current.name]){
        $.mobile.changePage('#nomoresearchresult', {transition:"slideup"});
        return;
    }*/
    if(datacatch[pagestate.current.name].length != 0&&!loadlock[pagestate.current.name]){
        loadlock[pagestate.current.name] = 1;
        $('.loadingimg').removeClass('displaynone');
        var top5ceil = new Array();
        for(var i = 1;i<=5&&datacatch[pagestate.current.name].length>0;i++){
            top5ceil.push(datacatch[pagestate.current.name].pop());
        }      
        addpage(top5ceil);
        $('.loadingimg').addClass('displaynone');
        loadlock[pagestate.current.name] = 0;

        return;
    }
    //每次读取新页面的时候，都要将id计数器重新置零
    //这个数会在addpage里面递增
    ceilcount[pagestate.current.name] = 0;
    $('.loadingimg').removeClass('displaynone');
    $.ajax({
        url:SERVER+pagestate.current.name+'?callback=?&bookname='+pagestate.current.keyword+'&page='+(pagestate.current.page+1)+'&way='+sortway[pagestate.current.name],   
        dataType:'jsonp',
        timeout: 10000,
        error:function(){
            console.log('timeout');
            $('.loadingimg').addClass('displaynone');
            $('#neterror p').text('网络异常请重试');
            $('#neterror a').attr('href', '#'+pagestate.current.name);

            $.mobile.changePage('#neterror',{transition: 'slideup','data-role':'dialog'});
            
            loadlock[pagestate.current.name] = 0;
            neterror[pagestate.current.name] = 1;
        },
        beforeSend:function(){
            //锁死
            if(loadlock[pagestate.current.name] == 1||nomorepage[pagestate.current.name] == 1){
                return false;
            }
            loadlock[pagestate.current.name] = 1;
        },
        success:function(data){
            neterror[pagestate.current.name] = 0;
            //加载数据页
            //注意的是后面要使用
            //pop和push来操作数组
            //所以为了保证顺序的正
            //确需要将数组反转
            console.log('the length of datacathc '+datacatch[pagestate.current.name].length);
            
            console.log('data from server length: '+data.length)
            datacatch[pagestate.current.name] = data.reverse();

            //由于data数组中的头两个是特殊数据
            //因此要先提取出来
            console.log('befor pop:'+datacatch[pagestate.current.name].length);
            pagestate.current.keyword = datacatch[pagestate.current.name].pop();
            nowuser = datacatch[pagestate.current.name].pop();
            console.log('after pop'+datacatch[pagestate.current.name].length);

            //设置当前页面的属性
            //为了排版时某些元素
            //的id正确需要确保在
            //排版之前赋值
            
            //如果返回的data长度只有2
            //那么说明对应页码是不存在的

            
            pagestate.current.page++;
            if(pagestate.current.name == 'amazon'){
                pagestate.amazon.page++;
                pagestate.amazon.keyword = pagestate.current.keyword;
            }
            if(pagestate.current.name == 'dangdang'){
                pagestate.dangdang.page++;
                pagestate.dangdang.keyword = pagestate.current.keyword;
            }
            if(pagestate.current.name == 'jd'){
                pagestate.jd.page++;
                pagestate.jd.keyword = pagestate.current.keyword;
            }
            if(datacatch[pagestate.current.name].length == 0){

                console.log('add');
                $('.loadingimg').addClass('displaynone');
                console.log('no more page');
                if(pagestate.current.page == 1){
                    $('#nomoresearchresult p').text('无搜索结果');
                }
                else{
                    $('#nomoresearchresult p').text('没有更多的内容了');
                }
                $('#nomoresearchresult a').attr('href', '#'+pagestate.current.name);
                var top = $(window).scrollTop();
                $(window).scrollTop(0);
                $.mobile.changePage('#nomoresearchresult',{transition: 'slideup','data-role':'dialog'});
                $(window).scrollTop(top);
                nomorepage[pagestate.current.name] = 1;
                loadlock[pagestate.current.name] = 0;
                
                return;
            }
            //弹出5个ceil来排版
                        
            var top5ceil = new Array();
            for(var i = 1;i<=5&&datacatch[pagestate.current.name].length>0;i++){
                top5ceil.push(datacatch[pagestate.current.name].pop());
            }
            $('.loadingimg').addClass('displaynone');
            addpage(top5ceil);

            loadlock[pagestate.current.name] = 0;
             
        }
    });   
}
function showdialog(message,btn){
    btn.attr({
        href: '#messagedlg',
        'data-rel': 'dialog'
    });
    $('#messagedlg p').text(message);
}
//用来管理和分配返回数据
//hashchangge函数
var dohashchange = new Array();
dohashchange['amazon'] = function(){
    console.log('amazon keyword is:'+pagestate.amazon.keyword);
    console.log('amazom page is:'+pagestate.amazon.page);
    $('#bookname_amazon').attr('value', pagestate.current.keyword);
    //修改当前页面值
    //当前关键字（一般情况在跳转的时候总是不变）
    //当前页数
    reflashcurrentstate('amazon',pagestate.current.keyword,1);
    console.log('current keyword is:'+pagestate.current.keyword);
    console.log('current amazon is:'+pagestate.amazon.keyword);
    if(pagestate.current.keyword&&pagestate.current.keyword == pagestate.amazon.keyword){
        pagestate.current.page = pagestate.amazon.page;
        return;
    }
    $('.shoppage#amazon .result_content').empty();
    pagestate.amazon.keyword = pagestate.current.keyword;
    pagestate.amazon.page = 0;
    pagestate.current.page = 0;
    datacatch['amazon'] = [];
    nomorepage['amazon'] = 0;
    loadmore();
}
dohashchange['dangdang'] = function(){
    console.log('dangdang')
    $('#bookname_dangdang').attr('value', pagestate.current.keyword);
    reflashcurrentstate('dangdang',pagestate.current.keyword,1);
    if(pagestate.current.keyword&&pagestate.current.keyword == pagestate.dangdang.keyword){
        pagestate.current.page = pagestate.dangdang.page;
        return;
    }
    $('.shoppage#dangdang .result_content').empty();
    pagestate.dangdang.keyword = pagestate.current.keyword;
    pagestate.dangdang.page = 0;
    pagestate.current.page = 0;
    datacatch['dangdang'] = [];
    nomorepage['dangdang'] = 0;
    loadmore();
}

dohashchange['jd'] = function(){
    console.log('jd');
    console.log('current keyword is:'+pagestate.current.keyword);
    console.log('current jd is:'+pagestate.amazon.keyword);
    $('#bookname_jd').attr('value', pagestate.current.keyword);
    reflashcurrentstate('jd',pagestate.current.keyword,1);
    if(pagestate.current.keyword&&pagestate.current.keyword == pagestate.jd.keyword){
        console.log('jd return');
        pagestate.current.page = pagestate.jd.page;
        return;
    }
    $('.shoppage#jd .result_content').empty();
    pagestate.jd.keyword = pagestate.current.keyword;
    pagestate.jd.page = 0;
    pagestate.current.page = 0;
    datacatch['jd'] = [];
    nomorepage['jd'] = 0;
    loadmore();
}

dohashchange['collect'] = function(){
    $('#collect .result_content').empty();
    $.ajax({
        url:SERVER+'collect?callback=?',   
        dataType:'jsonp',
        success:function(data){
            //加载数据页
            console.log(data.length);
            loadcollect(data);

        }
    });
}

window.onhashchange = function(){
    var hash = window.location.hash.substr(1);
    if(typeof dohashchange[hash] === 'function')
        dohashchange[hash]();
    
}
$( document ).on( "pageinit", ".shoppage", function() {
    $( document ).on( "swiperight", ".shoppage", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
                $.mobile.activePage.find('#sortby').panel( "open" );
        }
    });
});
$(document).ready(function(){
    var hash = window.location.hash.substr(1);
    if(typeof dohashchange[hash] === 'function')
        dohashchange[hash]();
    if(window.location.hash == '#jd&ui-state=dialog')
        window.location.hash = 'jd';
    if(window.location.hash == '#dangdang&ui-state=dialog')
        window.location.hash = 'dangdang';
    if(window.location.hash == '#amazon&ui-state=dialog')
        window.location.hash = 'amazon';
    $('.logo').css({
        width: LOGOWIDTH+'px',
        height: LOGOHEIGH+'px',

    });
    $('.start_content a').css({
        width: LOGOWIDTH+'px',
        'margin-left': WINDOWWIDTH*0.182-15+'px'
    });
    $('.start_content .logininput').css({
        width: LOGOWIDTH+'px',
        'margin-left': WINDOWWIDTH*0.182-15+'px'
    });
    $('.start_content .logininput label').css({
        'font-size': WINDOWWIDTH/25
        +'px',
    });
    $('.search_content').css({
        'margin-top': WINDOWHEIGHT/3+'px'
    });
    $('.loadingimg').css({
        width: WINDOWWIDTH/4+'px',
        height: WINDOWWIDTH/4+'px',
        left: WINDOWWIDTH/8*3+'px',
        top: (WINDOWHEIGHT/2-WINDOWWIDTH/8)+'px'
    });
    $('.loadingimgsmall').css({
        width: WINDOWWIDTH/8+'px',
        height: WINDOWWIDTH/8+'px',
        left: WINDOWWIDTH/16*7+'px',
        top: (WINDOWHEIGHT/2-WINDOWWIDTH/16)+'px'
    });
    $('#request img').css({
        'margin-top':'60%',
        'margin-left':(WINDOWWIDTH-78)/2+'px'
    });
    $('#collectmessage img').css({
        'margin-top':'60%',
        'margin-left':(WINDOWWIDTH-78)/2+'px'
    });
    $('#collect p').css({
        'font-size':WINDOWWIDTH/14+'px'
    });
    $('#usercomment p').css({
        'font-size':WINDOWWIDTH/14+'px'
    });
    /*$('.shoppage .opion').css({
    });*/
    console.log('test'+$('.shoppage .opion').parent('div').html());
    $('body').delegate('#pagesearch .search_btn', 'click', function(event) {
        //$(this).attr('data-rel', 'dialog');
        var inputvar = $('#pagesearch .search_content input').val();
        if (inputvar == '') {
            //弹出对话框
            $(this).attr({
                'href': '#nobookname',
                'data-rel': 'dialog'
            });
        }
        else{
            $(this).attr('href', '#amazon');
            $(this).removeAttr('data-rel');
            reflashcurrentstate('amazon',inputvar,1);
        }
    });
    //搜索按钮
    $('body').delegate('.shoppage .shop_search', 'click', function(event) {
        var keyword = $('.shoppage#'+pagestate.current.name+' #bookname_'+pagestate.current.name).val();
        if(loadlock[pagestate.current.name] == 1){
            $(this).attr({
                'href': '#nowloading',
                'data-rel': 'dialog'
            });
        }
        else if(keyword == ''){
            $(this).attr({
                'href': '#nobookname',
                'data-rel': 'dialog'
            });   
        }
        else{
            nomorepage[pagestate.current.name] = 0;
            $(this).removeAttr('data-rel').removeAttr('href');
            searchbook(pagestate.current.name,keyword);
        }
    });
    $('body').delegate('.shoppage ul li a', 'click', function(event) {
        if(loadlock[pagestate.current.name] == 1){
            $(this).attr({
                'href': '#nowloading',
                'data-rel': 'dialog'
            });
        }
        else{
            $(this).attr({
                'href': $(this).attr('title'),
                'data-rel':''
            });  
        }
    });
    $('body').delegate('#pagestart .start_btn', 'click', function(event) {
        var user = $('#pagestart input#user').val();
        var password = $('#pagestart input#password').val();
        $(this).attr({
            href: '',
            'data-rel': ''
        });
        if(user == '' || password == ''){
            showdialog('请填写完整信息',$(this));
            return;
        }
        var check = new RegExp("[^a-zA-Z0-9]");
        if (check.test(user) || check.test(password)) {
            showdialog('用户名与密码只允许字母与数字',$(this));
            return;
        }
        //显示加载图片
        $('.loadingimgsmall').removeClass('displaynone');
        $.ajax({
            url:SERVER+'login?callback=?&user='+user+'&password='+password, 
            dataType:'jsonp',
            beforeSend:function(){
                //锁死
                if(loadlock['login'] == 1){
                    return false;
                }
                loadlock['login'] = 1;
            },
            error:function(){
                loadlock['login'] = 0;
            },
            success:function(data){
                loadlock['login'] = 0;
                if(data.state == 0){
                    $('#request img').attr('src', './img/deny.png');
                    $('#request a.next').addClass('displaynone');
                    $('#request a.pre').removeClass('displaynone');
                }
                if(data.state == 1){                   
                    $('#request img').attr('src', './img/pass.png');
                    $('#request a.pre').addClass('displaynone');
                    $('#request a.next').removeClass('displaynone');
                }
                $('#request p').text(data.info);
                $('.loadingimgsmall').addClass('displaynone');
                window.location.hash = 'request';
            },            
        });    
    });
    //注册按钮
    $('body').delegate('#pagestart .regist_btn', 'click', function(event) {
        var user = $('#pagestart input#user').val();
        var password = $('#pagestart input#password').val();
        $(this).attr({
            href: '',
            'data-rel': ''
        });
        if(user == '' || password == ''){
            showdialog('请填写完整信息',$(this));
            return;
        }
        var check = new RegExp("[^a-zA-Z0-9]");
        if (check.test(user) || check.test(password)) {
            showdialog('用户名与密码只允许字母与数字',$(this));
            return;
        }
        $.ajax({
            url:SERVER+'register?callback=?&user='+user+'&password='+password, 
            dataType:'jsonp',
            beforeSend:function(){
                //锁死
                if(loadlock['login'] == 1){
                    return false;
                }
                loadlock['login'] = 1;
            },
            error:function(){
                loadlock['login'] = 0;
            },
            success:function(data){
                loadlock['login'] = 0;
                if(data.state == 0){
                    $('#request img').attr('src', './img/deny.png');
                    $('#request a.next').addClass('displaynone');
                    $('#request a.pre').removeClass('displaynone');
                }
                if(data.state == 1){
                    $('#request img').attr('src', './img/pass.png');
                    $('#request a.pre').addClass('displaynone');
                    $('#request a.next').removeClass('displaynone');
                }
                $('#request p').text(data.info);
                $('.loadingimgsmall').addClass('displaynone');
                window.location.hash = 'request';
            },            
        });    
    });
    //收藏按钮
    $('body').delegate('.bookceil .collect', 'click', function(event) {
        console.log($(this).attr('title'));
        console.log($(this).attr('id'));
        if(nowuser == ''){
            alert('请先登录!');
            window.location.hash = 'pagestart';
            return;
        }
        var ceil = $('#'+pagestate.current.name+' .'+$(this).attr('title')+'#'+$(this).attr('id'));
        console.log('#'+pagestate.current.name+' .'+$(this).attr('title')+'#'+$(this).attr('id'));
        console.log(ceil.find('img').attr('src'));
        var data = {name:'',price:'',url:'',cover:'',info:'',author:'',user:''};
        //将收藏对象的各个属性打包成json发送给服务器
        data.name = ceil.find('.name').text();
        data.price = ceil.find('.price').text().substr(1);
        data.url = ceil.find('.url').attr('href');
        console.log(ceil.find('.url').attr('href'));
        data.cover = ceil.find('img').attr('src');
        data.info = ceil.find('.info').text();
        data.user = nowuser;
        var datapost = JSON.stringify(data);
        if(ceil.find('.author').length)
            data.info = ceil.find('.author').text();

        //load界面
        $('.loadingimgsmall').removeClass('displaynone');
        $.ajax({
            url:SERVER+'addcollect',   
            dataType:'json',
            type:'POST',
            data: datapost,
            error:function(){
                loadlock['collect'] = 0;
            },
            beforeSend:function(){
                //锁死
                if(loadlock['collect'] == 1){
                    console.log('collect is beasy');
                    return false;
                }
                loadlock['collect'] = 1;
            },
            success:function(data){
                if(data.state == 0){
                    $('#collectmessage img').attr('src', './img/deny.png');
                }
                if(data.state == 1){
                    $('#collectmessage img').attr('src', './img/pass.png');             
                }
                loadlock['collect'] = 0;
                $('.loadingimgsmall').addClass('displaynone');
                $('#collectmessage p').text(data.info);
                $('#collectmessage a').attr('href', '#collect');
                $.mobile.changePage('#collectmessage', {transition:"slideup"});
            }
        }); 
    });

    //删除按钮
    $('body').delegate('.bookceil .delete', 'click', function(event) {
        //获取点击要删除的商品
        //这里只需要获得对用的
        //收藏在数据库中的id就
        //可以了
        //这个值放在点击按钮的
        //title中
        $('.loadingimgsmall').removeClass('displaynone');
        $.ajax({
            url:SERVER+'removecollect?callback=?&id='+$(this).attr('title'),   
            dataType:'jsonp',
            beforeSend:function(){
                //锁死
                if(loadlock['delete'] == 1){
                    console.log('delete is beasy');
                    return false;
                }
                loadlock['delete'] = 1;
            },
            error:function(){
                loadlock['delete'] = 0;
            },
            success:function(data){
                //加载数据页
                if(data.state == 0){
                    $('#collectmessage img').attr('src', './img/deny.png');
                }
                if(data.state == 1){
                    $('#collectmessage img').attr('src', './img/pass.png');                 
                }
                loadlock['delete'] = 0;
                $('.loadingimgsmall').addClass('displaynone');
                $('#collectmessage p').text(data.info);
                $('#collectmessage a').attr('href', '#collect');
                $.mobile.changePage('#collectmessage', {transition:"slideup"});
            }
        });
    });
    //详情按钮
    $('body').delegate('.bookceil .cover', 'click', function(event) {
        console.log('click');
        var ceil = $(this).parents('.bookceil');
        //将对象的信息传递给详细界面
        //如果没有author这一项
        //那么就想页面中的作者
        //隐藏
        //否则将信息改为出版社
        if(ceil.find('.author').length == 0){
            $('#goodsdetail .detail_author').addClass('displaynone');
            $('#goodsdetail .detail_info_title').text('信息');
        }
        else{
            $('#goodsdetail .detail_author').removeClass('displaynone');
            $('#goodsdetail .detail_info_title').text('出版社');
            $('#goodsdetail .bookauthor').text(ceil.find('.author').attr('title'));
        }
        $('#goodsdetail .bookname').text(ceil.find('.name').attr('title'));
        $('#goodsdetail .bookprice').text(ceil.find('.price').text().substr(1));
        $('#goodsdetail .shop_btn').attr('href', ceil.find('.url').attr('href'));
        $('#goodsdetail img').attr('src', ceil.find('img').attr('src'));
        $('#goodsdetail .bookinfo').text(ceil.find('.info').attr('title'));
        $('#goodsdetail img').css({
            width: '50%',
            'margin-left':'25%'
        });
        $('#goodsdetail .returnback').attr('href', '#'+pagestate.current.name);
        $('#usercomment .returnback').attr('href', '#'+pagestate.current.name);
    });

    //评论按钮
    $('body').delegate('#goodsdetail #comment', 'click', function(event) {
        var bookurl = $('#goodsdetail .shop_btn').attr('href');
        $('#usercomment .comment_content').empty();
        $.ajax({
            url:SERVER+'getcomment',   
            dataType:'json',
            type:'POST',
            data: bookurl,
            beforeSend:function(){
                if(loadlock['getcomment'] == 1){
                    console.log('getcomment is beasy');
                    return false;
                }
                loadlock['getcomment'] = 1;
            },
            error:function(){
                loadlock['getcomment'] = 0;
            },
            success:function(data){
                //加载数据页
                getcomment(data);
                loadlock['getcomment'] = 0;
            }
        });
    });
    //发布按钮
    $('body').delegate('.comment_output', 'click', function(event) {
        var inputvar = $('#usercomment .comment_bar input').val();
        if(inputvar == ''){
            $(this).attr({
                'href': '#nocomment',
                'data-rel': 'dialog'
            });
            return;
        }
        else{
            $(this).removeAttr('data-rel').removeAttr('href');
        }
        var data = {user:'',url:'',comment:''};
        data.user = nowuser;
        console.log('nowuser is'+nowuser);
        data.url = $('#goodsdetail .shop_btn').attr('href');
        console.log('nowuser is'+data.url);
        data.comment = inputvar;
        console.log('out put comment');
        var datapost = JSON.stringify(data);
        $.ajax({
            url:SERVER+'addcomment',   
            dataType:'json',
            type:'POST',
            data: datapost,
            error:function(){
                loadlock['addcomment'] = 0;
            },
            beforeSend:function(){
                //锁死
                if(loadlock['addcomment'] == 1){
                    console.log('collect is beasy');
                    return false;
                }
                loadlock['addcomment'] = 1;
            },
            success:function(data){
                $('#usercomment .comment_content').empty();
                getcomment(data);
                loadlock['addcomment'] = 0;
            }
        });
    });
    $('#sortby a').click(function(event) {
        console.log('click sorttype');
        if($(this).hasClass('default')){
            sortway[pagestate.current.name] = 1;
        }
        if($(this).hasClass('popular')){
            sortway[pagestate.current.name] = 2;
        }
        if($(this).hasClass('price')){
            sortway[pagestate.current.name] = 3;
        }
        console.log('now way is:'+sortway[pagestate.current.name]);
        var keyword = $('.shoppage#'+pagestate.current.name+' #bookname_'+pagestate.current.name).val();
        if(loadlock[pagestate.current.name] == 1){
            $(this).attr({
                'href': '#nowloading',
                'data-rel': 'dialog'
            });
        }
        else if(keyword == ''){
            $(this).attr({
                'href': '#nobookname',
                'data-rel': 'dialog'
            });   
        }
        else{
            nomorepage[pagestate.current.name] = 0;
            $(this).removeAttr('data-rel').removeAttr('href');
            searchbook(pagestate.current.name,keyword);
        }
    });
    //滚动屏幕的时候做加载
    //但是由于在刷新页面的
    //时候和非search页面的
    //时候也会触发
    //所以要加上判断
    $(window).scroll(function(event) {
        console.log('when scroll, the current name is'+pagestate.current.name);
        console.log('when scroll, the current keyword is'+pagestate.current.keyword)
        console.log($(this).scrollTop() + $(window).height());
        console.log($(document).height());
        console.log(window.location.hash);
        if(window.location.hash != '#amazon'&&window.location.hash != '#dangdang' &&window.location.hash != '#jd')
            return;
        if(pagestate.current.name == '' || pagestate.current.keyword == '')
            return;
        //已经知道不行的情况下，就不重复加载了-*
        if(nomorepage[pagestate.current.name] == 1)
            return;
        //当滚动到底部的时候
        if ($(this).scrollTop() + $(window).height() >= $(document).height()) {
            loadmore();

        }

    });
});