var loadlock = new Array();//loadmore锁,每个页面对应一个
loadlock['amazon'] = 0;
loadlock['dangdang'] = 0;
loadlock['jd'] = 0;
//防止用户过快的切换或者点击搜索按钮
//而照成重复提交ajax请求
var BOOKLISTBOX = '.booklistbox';//图书列表容器div名称
var SERVER = 'http://114.215.202.143:8888/';//远端服务器名
var SHOPSWITCH = $('<div class="shopswitch"><a id="amazon" href="#amazon">亚马逊</a><a id="dangdang" href="#dangdang">当当</a><a id="jd" href="#jd">京东</a></div>');//商城切换部件
var GOLDENRATIO = 0.618
var WINDOWHEIGHT = $(window).height();
var WINDOWWIDTH = $(window).width();
var LOGOWIDTH = WINDOWWIDTH*0.618;
var LOGOHEIGH = WINDOWWIDTH*0.618;
var SEARCHBARW = WINDOWWIDTH;
var SEARCHBARH = WINDOWHEIGHT*0.1;
var SHOPSELECTBARH = WINDOWHEIGHT*0.061;
var SHOPSELECTBARW = WINDOWWIDTH;
var CEILWIDTH = WINDOWWIDTH*0.9;
var CEILHEIGHT = WINDOWHEIGHT*0.2;
//用于记录每个页面状态的json
var pagestate = {
    amazon:{keyword:"",page:0},
    dangdang:{keyword:"",page:0},
    jd:{keyword:"",page:0},
    current:{page:"",keyword:""}
};
//hashchange函数表
var dohashchange = new Array();
//根据屏幕尺寸对界面进行初始化
dohashchange['start'] = function(){
    console.log('start');
    $('.main').width(WINDOWWIDTH);
    $('.main').height(WINDOWHEIGHT);
    $('.page').width(WINDOWWIDTH);
    $('.page').height(WINDOWHEIGHT);
    $('.logo').width(LOGOWIDTH);
    $('.logo').height(LOGOHEIGH);
    $('.logo img').width(LOGOWIDTH);
    $('.logo img').height(LOGOHEIGH);
    $('.logo').css({
        top: (WINDOWHEIGHT-WINDOWWIDTH)*GOLDENRATIO+'px',
        left: WINDOWWIDTH*(0.5-GOLDENRATIO/2)+'px'
    });
    $('.start_btn').css({
        top: (WINDOWHEIGHT*GOLDENRATIO+10)+'px',
        left: WINDOWWIDTH*(0.5-GOLDENRATIO/2)+'px',
        width: WINDOWWIDTH*GOLDENRATIO+'px',
        height: WINDOWWIDTH*GOLDENRATIO/4+'px',
        'font-size': (WINDOWWIDTH*GOLDENRATIO/6)+'px',
        'line-height': (WINDOWWIDTH*GOLDENRATIO/4)+'px'
    });
    $('.start_btn div#start').css({
        width: WINDOWWIDTH*GOLDENRATIO+'px',
        left: '0'
    });
    $('.start_btn div#search').css({
        width: WINDOWWIDTH*GOLDENRATIO+'px',
        left: WINDOWWIDTH*GOLDENRATIO+'px'
    });
    $('.search_bar .searchname').css({
        width: (SEARCHBARW-SEARCHBARH-4)*0.96+'px',
        height: (SEARCHBARH-4)*0.6+'px',
        margin: (SEARCHBARH-4)*0.2+'px '+(SEARCHBARW-4)*0.02+'px',
        'line-height': (SEARCHBARH-4)*0.6+'px',
        'font-size' : (SEARCHBARH-4)*0.6*0.618+'px'
    });
    $('.search_bar_search_btn').css({
        left: SEARCHBARW-SEARCHBARH+'px',
        'padding-top': SEARCHBARH*0.2+'px',
        'padding-left': SEARCHBARH*0.2+'px',
        width: SEARCHBARH*0.8+'px',
        height: SEARCHBARH*0.8+'px',
        top:0
    });
    $('.search_bar_search_btn img').css({
        width: SEARCHBARH*0.6+'px',
        height: SEARCHBARH*0.6+'px'
    });
    $('.shop_select_bar div').css({
        'line-height': SHOPSELECTBARH+'px',
        'font-size': SHOPSELECTBARH*GOLDENRATIO+'px'
    });
    $('.shop_select_bar div span').css({
        left:'0px',
        bottom: -SHOPSELECTBARH*0.5+'px'
    });
    $('.booklistbox').css({
        width: WINDOWWIDTH+'px',
        height: (WINDOWHEIGHT-SHOPSELECTBARH-SEARCHBARH)+'px',
        'padding-top': (SHOPSELECTBARH+SEARCHBARH)+'px'
    });
    $('.search_page').addClass('displaynone');
};
dohashchange['amazon'] = function(){
    console.log('amazon');
    console.log(pagestate.current.keyword);
    console.log(pagestate.amazon.keyword);
    pagestate.current.page = 'amazon';
    //修改搜索按钮的类名
    $('.booklistbox.amazon').removeClass('displaynone').siblings('.booklistbox').addClass('displaynone');
    $('.shop_select_bar #amazon').addClass('select').siblings('div').removeClass('select');
    $('.search_page').scrollTop(0);
    //如果当前搜索关键字与页面缓存的关键字一样就不需要从新提交搜索
    //页面也不需要做修改，只需要将原本隐藏的界面显示出来就可以了
    if(pagestate.current.keyword == pagestate.amazon.keyword){
        console.log('no thing');
    }
    else{
        //清空当前booklistbox中的内容
        $('.booklistbox.amazon').empty();
        //请求数据
        $.ajax({
        url:SERVER+'amazon?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        beforeSend:function(){
            //锁死
            if(loadlock['amazon'] == 1){
                console.log('amazon 有其他数据正在加载');
                return false;
            }
            loadlock['amazon'] = 1;
        },
        error:function(){
            loadlock['amazon'] = 0;
            console.log('amazon load err');
        },
        success:function(data){
            //加载数据页
            addpage(data);
            //设置当前页面的属性
            pagestate.amazon.keyword = pagestate.current.keyword;
            pagestate.amazon.page = 1;
            loadlock['amazon'] = 0;
            console.log(pagestate.amazon.keyword);
            console.log(pagestate.amazon.page);
            $('.search_page').scrollTop(0);
            }
        });
    }
}
dohashchange['dangdang'] = function(){
    console.log('dangdang');
    console.log(pagestate.current.keyword);
    console.log(pagestate.dangdang.keyword);
    pagestate.current.page = 'dangdang';
    $('.booklistbox.dangdang').removeClass('displaynone').siblings('.booklistbox').addClass('displaynone');
    $('.shop_select_bar #dangdang').addClass('select').siblings('div').removeClass('select');
    $('.search_page').scrollTop(0);
    //如果当前搜索关键字与页面缓存的关键字一样就不需要从新提交搜索
    //页面也不需要做修改，只需要将原本隐藏的界面显示出来就可以了
    if(pagestate.current.keyword == pagestate.dangdang.keyword){
        console.log('no thing');
    }
    else{
        //清空当前booklistbox中的内容
        $('.booklistbox.dangdang').empty();
        //请求数据
        $.ajax({
        url:SERVER+'dangdang?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        beforeSend:function(){
            //锁死
            if(loadlock['dangdang'] == 1){
                console.log('dangdang 有其他数据正在加载');
                return false;
            }
            loadlock['dangdang'] = 1;
        },
        error:function(){
            loadlock['dangdang'] = 0;
            console.log('amazon load err');
        },
        success:function(data){
            console.log('dangdang data');
            //加载数据页
            addpage(data,'dangdang');
            //设置当前页面的属性
            loadlock['dangdang'] = 0;
            pagestate.dangdang.keyword = pagestate.current.keyword;
            console.log(pagestate.dangdang.keyword);
            pagestate.dangdang.page = 1;
            $('.search_page').scrollTop(0);
            }
        });
    }
}
dohashchange['jd'] = function(){
    console.log('jd');
    console.log(pagestate.current.keyword);
    console.log(pagestate.jd.keyword);
    pagestate.current.page = 'jd';
    $('.booklistbox.jd').removeClass('displaynone').siblings('.booklistbox').addClass('displaynone');
    $('.shop_select_bar #jd').addClass('select').siblings('div').removeClass('select');
    $('.search_page').scrollTop(0);
    //如果当前搜索关键字与页面缓存的关键字一样就不需要从新提交搜索
    //页面也不需要做修改，只需要将原本隐藏的界面显示出来就可以了
    if(pagestate.current.keyword == pagestate.jd.keyword){
        console.log('no thing');
    }
    else{
        //清空当前booklistbox中的内容
        $('.booklistbox.jd').empty();
        //请求数据
        $.ajax({
        url:SERVER+'jd?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        beforeSend:function(){
            //锁死
            if(loadlock['jd'] == 1){
                console.log('jd 有其他数据正在加载');
                return false;
            }
            loadlock['jd'] = 1;
        },
        error:function(){
            loadlock['jd'] = 0;
            console.log('jd load err');
        },
        success:function(data){
            //加载数据页
            addpage(data,'jd');
            //设置当前页面的属性
            loadlock['jd'] = 0;
            pagestate.jd.keyword = pagestate.current.keyword;
            pagestate.jd.page = 1;
            $('.search_page').scrollTop(0);
            }
        });
    }
}
function formartceil(selecter){
    $(selecter).css({
        width: CEILWIDTH+'px',
        height: CEILHEIGHT+'px',
        margin: (WINDOWWIDTH-CEILWIDTH)/2+'px'
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
        'font-size' : CEILWIDTH/28.75+'px',
        'font-weight' : 'bold'
    });
    $(selecter).find('.info').css('font-size', CEILWIDTH/43.125+'px');
    $(selecter).find('.author').css('font-size', CEILWIDTH/43.125+'px');
    $(selecter).find('.price').css({
        'font-size': CEILWIDTH/20+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'color':'#003366'
    });
    $(selecter).find('.url').css({
        right: CEILWIDTH/34.5 +'px',
        'margin-bottom': CEILWIDTH/34.5 +'px'
    });
    
}

//添加列表的函数
function addpage(data){
    console.log('addpage');
    var length = data.length;
    if(pagestate.current.page == 'amazon')
        var pagenum = 'page'+pagestate.amazon.page;
    if(pagestate.current.page == 'dangdang')
        var pagenum = 'page'+pagestate.dangdang.page;
    if(pagestate.current.page == 'jd')
        var pagenum = 'page'+pagestate.jd.page;
    for(var i = 0;i < length;i++){
        var ceil = $('<div class="bookceil '+pagenum+'" id="'+i+'""></div>');
        ceil.append('<img class="cover" src="'+data[i].cover+'">');
        var detail = $('<div class="detail"></div>');
        detail.append('<div class="name">'+data[i].name+'</div>');
        detail.append('<div class="price">￥'+data[i].price+'</div>');
        if(data[i].author != '')
            detail.append('<div class="author">'+data[i].author+'</div>');
        detail.append('<div class="info">'+data[i].info+'</div>');
        detail.append('<div class="url" title="'+data[i].url+'">复制链接</div>');
        //用来完成3d效果的辅助元素
        detail.append('<div class="for_3d"></div>')
        ceil.append(detail);
        $('.booklistbox.'+pagestate.current.page).append(ceil);
        formartceil('.bookceil.'+pagenum);
        //$('.bookceil.'+pagenum).removeClass('displaynone')
    }
    //$('.bookceil').removeClass('displaynone')
    console.log('ok');
    //showceil
    showceil('.bookceil.'+pagenum,0);
}

function loadmore(){
    var loadpagenum;
    if(pagestate.current.page == 'amazon')
        loadpagenum = pagestate.amazon.page+1;
    if(pagestate.current.page == 'dangdang')
        loadpagenum = pagestate.dangdang.page+1; 
    if(pagestate.current.page == 'jd')
        loadpagenum = pagestate.jd.page+1; 
    $.ajax({
        url:SERVER+pagestate.current.page+'?callback=?&bookname='+pagestate.current.keyword+'&page='+loadpagenum,   
        dataType:'jsonp',
        error:function(){
            loadlock[pagestate.current.page] = 0;
            console.log('jd load err');
        },
        beforeSend:function(){
            //锁死
            if(loadlock[pagestate.current.page] == 1){
                console.log(pagestate.current.page+' 有其他数据正在加载');
                return false;
            }
            loadlock[pagestate.current.page] = 1;
        },
        success:function(data){
            //加载数据页
            addpage(data);
            loadlock[pagestate.current.page] = 0;
            //设置当前页面的属性
            if(pagestate.current.page == 'amazon')
                pagestate.amazon.page++;
            if(pagestate.current.page == 'dangdang')
                pagestate.dangdang.page++; 
            if(pagestate.current.page == 'jd')
                pagestate.jd.page++; 
        }
    });   
}

//hashchange函数
window.onhashchange = function(){
    if(window.location.hash == '')
        return;
    else{
        var hash = window.location.hash.substr(1);
        if(typeof dohashchange[hash] === 'function')
            dohashchange[hash]();
    }
}

function showceil(selecter,nownum){
    console.log('showceil working,the number is:'+nownum);
    var for_3d = $(selecter).eq(nownum).find('.for_3d');
    for_3d.css('text-indent', '90px');
    if(nownum >= $(selecter).length)
        return;
    for_3d.animate({
        textIndent: 0
    }, {
        step: function(now, fx) {
            //将其展开
            $(selecter).eq(nownum).css({
                '-webkit-transform': 'rotateY('+now+'deg)',
                'opacity': 1-now/90
            });
            if(now == 45){
                console.log('it is 45');   
            }
        },
        complete: function(){
            //加载下一个
            showceil(selecter,nownum+1);                           
        },
        duration: 1000
    }, 'ease');
}
//队列化加载
$(document).ready(function(){
    

    //默认载入界面
    if(window.location.hash == ''){
        window.location.hash = 'start';
    }
    $('.search_page').scroll(function(event) {
        console.log('scroll');
        if  ($('.search_page').scrollTop() != 0){
            console.log('add');
            $('.shop_select_bar').addClass('floatbar');
        }
        else{
            $('.shop_select_bar').removeClass('floatbar');
        }
        if ($(this).scrollTop() + $(window).height() >= $('.booklistbox.'+pagestate.current.page)[0].scrollHeight) {
            loadmore();
            console.log('scroll run loadmore');
        }
        var perspective = ($(this).scrollTop() + (WINDOWHEIGHT-SHOPSELECTBARH-SEARCHBARH)/2)/(WINDOWHEIGHT-SHOPSELECTBARH-SEARCHBARH)*100;
        console.log(perspective);
        $('.booklistbox.'+pagestate.current.page).css('-webkit-perspective-origin-y', perspective+'%');
    });
    /*$('body').delegate('.search_page', 'scroll', function(event) {
        console.log('scroll');
        if  ($(document).scrollTop() != 0){
            console.log('add');
            $('.shop_select_bar').addClass('floatbar');
        }
        else{
            $('.shop_select_bar').removeClass('floatbar');
        }
    });*/
    //搜索按钮
    $('body').delegate('.search_bar_search_btn', 'click', function() {
        console.log($('.searchname#search').val());
        var bookname = $('.searchname#search').val();
        if(loadlock[pagestate.current.page] == 1){
            console.log('有其他数据正在加载');
            return;
        }
        if(bookname == ''){
            alert('请输入书名！');
            return;
        }
        pagestate.current.keyword = bookname;
        console.log(pagestate.amazon.keyword);
        console.log(pagestate.current.keyword);
        dohashchange[pagestate.current.page]();
    });

    $('body').delegate('.btn', 'touchstart', function(event) {
        $(this).addClass('touching');
    });
    $('body').delegate('.btn', 'touchend', function(event) {
        $(this).removeClass('touching');
    });
    $('body').delegate('.start_btn', 'click', function(event) {
        console.log('start was click');
        $('.logo img').animate({opacity: 0}, 500 ,function(){
            $('.logo').animate({top: '+='+WINDOWWIDTH*0.618/8*3, height: WINDOWWIDTH*0.618/4}, 500 ,function(){
                $(this).empty();
                $(this).append('<input class="searchname" type="text" placeholder="请输入书名" id="start"/>');
                $('.logo .searchname').css({
                    width: ($('.logo').width()-4)*0.98+'px',
                    height: ($('.logo').height()-4)*0.98+'px',
                    margin: ($('.logo').height()-4)*0.01+'px '+($('.logo').width()-4)*0.01+'px',
                    'line-height': ($('.logo').height()-4)*0.98+'px',
                    'font-size' : ($('.logo').height()-4)*0.98*0.618+'px'
                });
            });
            $('.start_btn').animate({top: '-='+WINDOWWIDTH*0.618/8*3}, 500 ,function(){
                $('.start_btn #start').animate({left: -WINDOWWIDTH*0.618}, 500);
                $('.start_btn #search').animate({left: 0}, 500);
                $(this).removeClass('start_btn').addClass('search_btn');
            });
        });
    });
    //单击startpage的搜索按钮之后，加载默认的亚马逊页面
    //并且在完成界面切换之后，向服务器发送数据
    $('body').delegate('.search_btn', 'click', function(event) {
        console.log('search was click');
        var bookname = $('.searchname#start').val();
        if(bookname == ''){
            alert('请输入书名！');
            return;
        }
        pagestate.current.keyword = bookname;
        $('.searchname#search').val(pagestate.current.keyword);
        
        //使用了一个辅助用的空元素来完成动画
        $('.page').addClass('page3d');
        $('.search_page').removeClass('displaynone');
        $('.for_3d_animate').animate({
            textIndent: 400
        }, {
            step: function(now, fx) {
                $('.start_page').css('-webkit-transform', 'translate3d(0,0,-' + now + 'px)');
            },
            complete: function(){
                $(this).css('text-indent', '0');
                $('.for_3d_animate').animate({
                    textIndent: 100
                },{
                    step: function(now,fx){
                        $('.start_page').css('-webkit-transform', 'translate3d(0,0,-400px) '+'rotateY(-'+now+'deg)');
                        $('.search_page').css('-webkit-transform', 'translate3d(0,0,-400px) '+'rotateY('+(100-now)+'deg)');
                    },
                    complete: function(){
                        $(this).css('text-indent', '400px');
                        $('.for_3d_animate').animate({
                            textIndent: 0
                        }, {
                            step: function(now, fx) {
                                $('.search_page').css('-webkit-transform', 'translate3d(0,0,-'+now+'px) '+'rotateY(0deg)');
                            },
                            complete: function(){
                                $('.start_page').addClass('displaynone');
                                $('.page').removeClass('page3d');
                                $('.page').css('-webkit-transform', 'none');
                                $('.main').css('-webkit-perspective', '0');
                                window.location.hash = 'amazon';
                                //界面切换完成，向亚马逊发送数据
                                //window.location.hash = 'amazon';                                
                            },
                            duration: 500
                        }, 'ease');
                    },
                    duration:500
                },'ease');        
            },
            duration: 500
        }, 'ease');
    });
    $('body').delegate('.search_bar_search_btn', 'touchstart', function(event) {
        $(this).addClass('touching');
    });
    $('body').delegate('.search_bar_search_btn', 'touchend', function(event) {
        $(this).removeClass('touching');
    });
    //此处应该交由hashchange函数来完成
    $('body').delegate('.shop_select_bar div', 'click', function(event) {
        window.location.hash = $(this).attr('id');
        console.log($(this).attr('id')+' was click');
    });
});