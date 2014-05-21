var WINDOWHEIGHT = $(window).height();
var WINDOWWIDTH = $(window).width();
var LOGOWIDTH = WINDOWWIDTH*0.618;
var LOGOHEIGH = WINDOWWIDTH*0.618;
var CEILWIDTH = (WINDOWWIDTH-30)*0.9;
var CEILHEIGHT = WINDOWHEIGHT*0.2;
var loadlock = new Array();//loadmore锁,每个页面对应一个
loadlock['amazon'] = 0;
loadlock['dangdang'] = 0;
loadlock['jd'] = 0;
//服务器名
var SERVER = 'http://114.215.202.143:8888/'
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
    console.log('addpage');
    var length = data.length;
    for(var i = 0;i < length;i++){
        var ceil = $('<div class="bookceil page'+pagestate.current.page+'" id="'+i+'""></div>');
        ceil.append('<img class="cover" src="'+data[i].cover+'">');
        var detail = $('<div class="detail"></div>');
        detail.append('<div class="name">'+data[i].name+'</div>');
        detail.append('<div class="price">￥'+data[i].price+'</div>');
        if(data[i].author != ''){
            if (data[i].author == 'undefined') {
                data[i].author = '暂无作者信息';
            };
            detail.append('<div class="author">'+data[i].author+'</div>');
        }
        if (data[i].info == 'undefined') {
            data[i].info = '暂无出版社信息';
        };
        detail.append('<div class="info">'+data[i].info+'</div>');
        detail.append('<div class="url" title="'+data[i].url+'">访问商铺</div>');
        //用来完成3d效果的辅助元素
        ceil.append(detail);
        $('.shoppage#'+pagestate.current.name+' .result_content').append(ceil);
        formartceil('.bookceil.page'+pagestate.current.page);
        //$('.bookceil.'+pagenum).removeClass('displaynone')
    }
    //$('.bookceil').removeClass('displaynone')
    console.log('ok');
    //showceil
}
//对商品列表的元素进行布局
function formartceil(selecter){
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
        'font-size' : CEILWIDTH/20+'px',
        'font-weight' : 'bold'
    });
    $(selecter).find('.info').css('font-size', CEILWIDTH/30+'px');
    $(selecter).find('.author').css('font-size', CEILWIDTH/30+'px');
    $(selecter).find('.price').css({
        'font-size': CEILWIDTH/20+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'color':'#003366'
    });
    $(selecter).find('.url').css({
        right: CEILWIDTH/34.5 +'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'text-shadow':'none'
    });   
}
//搜索按钮函数
function searchbook(pagename,bookname){
    if(pagestate.current.keyword == bookname)
        return;
    $('.shoppage#'+pagestate.current.name+' .result_content').empty();
    $('.loadingimg').removeClass('displaynone');
    //设置当前页面的属性
    pagestate.current.keyword = bookname;
    pagestate.current.page = 1;
    if(pagename == 'dangdang'){
        pagestate.dangdang.keyword = bookname;
        pagestate.dangdang.page = 1;
    }
    if(pagename == 'amazon'){
        pagestate.amazon.keyword = bookname;
        pagestate.amazon.page = 1;
    }
    if(pagename == 'jd'){
        pagestate.jd.keyword = bookname;
        pagestate.jd.page = 1;
    }
    $.ajax({
        url:SERVER+pagename+'?callback=?&bookname='+bookname+'&page=1',   
        dataType:'jsonp',
        beforeSend:function(){
            //锁死
            if(loadlock[pagename] == 1){
                console.log(pagename+' 有其他数据正在加载');
                return false;
            }
            loadlock[pagename] = 1;
        },
        error:function(){
            loadlock[pagename] = 0;
            console.log(pagename+' load err');
        },
        success:function(data){
            //加载数据页
            addpage(data);
            
            $('.loadingimg').addClass('displaynone');
            loadlock[pagename] = 0;
        }
    });
}
//滚动加载
function loadmore(){
    $('.loadingimg').removeClass('displaynone');
    $.ajax({
        url:SERVER+pagestate.current.name+'?callback=?&bookname='+pagestate.current.keyword+'&page='+(pagestate.current.page+1),   
        dataType:'jsonp',
        error:function(){
            loadlock[pagestate.current.name] = 0;
            console.log('loadmore err');
        },
        beforeSend:function(){
            //锁死
            if(loadlock[pagestate.current.name] == 1){
                console.log(pagestate.current.page+' 有其他数据正在加载');
                return false;
            }
            loadlock[pagestate.current.name] = 1;
        },
        success:function(data){
            //加载数据页
            $('.loadingimg').addClass('displaynone');
            addpage(data);
            loadlock[pagestate.current.name] = 0;
            //设置当前页面的属性
            if(pagestate.current.name == 'amazon')
                pagestate.amazon.page++;
            if(pagestate.current.name == 'dangdang')
                pagestate.dangdang.page++; 
            if(pagestate.current.name == 'jd')
                pagestate.jd.page++; 
        }
    });   
}
//hashchangge函数
var dohashchange = new Array();
dohashchange['amazon'] = function(){
    console.log('run amazon');
    $('#bookname_amazon').attr('value', pagestate.current.keyword);
    console.log('the current keyword is'+pagestate.current.keyword);
    reflashcurrentstate('amazon',pagestate.current.keyword,1);
    if(pagestate.current.keyword == pagestate.dangdang.keyword)
        return;
    $('.shoppage#amazon .result_content').empty();
    $('.loadingimg').removeClass('displaynone');
    pagestate.amazon.keyword = pagestate.current.keyword;
    pagestate.amazon.page = 1;
    pagestate.current.page = 1;
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
            $('.loadingimg').addClass('displaynone');
            loadlock['amazon'] = 0;
            console.log(pagestate.amazon.keyword);
            console.log(pagestate.amazon.page);
        }
    });
}
dohashchange['dangdang'] = function(){
    if(pagestate.current.keyword == '')
        console.log('no keyword');
    console.log('run dangdang');
    $('#bookname_dangdang').attr('value', pagestate.current.keyword);
    console.log('the current keyword is'+pagestate.current.keyword);
    reflashcurrentstate('dangdang',pagestate.current.keyword,1);
    if(pagestate.current.keyword == pagestate.dangdang.keyword)
        return;
    $('.shoppage#dangdang .result_content').empty();
    $('.loadingimg').removeClass('displaynone');
    pagestate.dangdang.keyword = pagestate.current.keyword;
    pagestate.dangdang.page = 1;
    pagestate.current.page = 1;
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
            console.log('dangdang load err');
        },
        success:function(data){
            //加载数据页
            addpage(data);
            //设置当前页面的属性
            
            loadlock['dangdang'] = 0;
            $('.loadingimg').addClass('displaynone');
            console.log(pagestate.dangdang.keyword);
            console.log(pagestate.dangdang.page);
        }
    });
}

dohashchange['jd'] = function(){
    console.log('run jd');
    $('#bookname_jd').attr('value', pagestate.current.keyword);
    console.log('the current keyword is'+pagestate.current.keyword);
    if(pagestate.current.keyword == pagestate.jd.keyword)
        return;
    $('.shoppage#jd .result_content').empty();
    $('.loadingimg').removeClass('displaynone');
    pagestate.jd.keyword = pagestate.current.keyword;
    pagestate.jd.page = 1;
    pagestate.current.page = 1;
    reflashcurrentstate('jd',pagestate.current.keyword,1);
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
            addpage(data);
            //设置当前页面的属性
            
            loadlock['jd'] = 0;
            $('.loadingimg').addClass('displaynone');
            console.log(pagestate.jd.keyword);
            console.log(pagestate.jd.page);
        }
    });
}
window.onhashchange = function(){
    var hash = window.location.hash.substr(1);
    if(typeof dohashchange[hash] === 'function')
        dohashchange[hash]();
}

$(document).ready(function(){
    if(pagestate.current.name == ''){
        console.log('return to pagesearch');
        if(window.location.hash == '#amazon' || window.location.hash == '#dangdang' || window.location.hash == '#jd')
            window.location.hash = 'pagesearch'; 
    }
    $('.logo').css({
        width: LOGOWIDTH+'px',
        height: LOGOHEIGH+'px',
        'margin-top': WINDOWHEIGHT/4+'px',
        'margin-bottom': WINDOWHEIGHT/5+'px'
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
    $('body').delegate('#pagesearch .search_btn', 'click', function(event) {
        //$(this).attr('data-rel', 'dialog');
        if ($('#pagesearch .search_content input').val() == '') {
            console.log('input of startpage is empty');
            //弹出对话框
            $(this).attr({
                'href': '#nobookname',
                'data-rel': 'dialog'
            });
        }
        else{
            console.log('input of startpage is '+$('#pagesearch .search_content input').val());
            $(this).attr('href', '#amazon');
            $(this).removeAttr('data-rel');
            reflashcurrentstate('amazon',$('#pagesearch .search_content input').val(),1);
        }
    });
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
            $(this).removeAttr('data-rel').removeAttr('href');
            console.log(keyword+' '+pagestate.current.name);
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
    $('body').delegate('.bookceil .url', 'click', function(event) {
        var path = $(this).attr('title');
        window.location = path;
    });
    $(window).scroll(function(event) {
        console.log('scroll');
        console.log(pagestate.current.name);
        console.log(pagestate.current.keyword);     
        console.log(window.location.hash);
        /*console.log($(this).scrollTop() + $(window).height());
        console.log($(document).height());*/
        if(pagestate.current.name == '')
            return;
        if ($(this).scrollTop() + $(window).height() >= $(document).height()) {
            loadmore();
            console.log('scroll run loadmore');
        }
    });
});