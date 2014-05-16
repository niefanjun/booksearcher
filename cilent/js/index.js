var BOOKLISTBOX = '.booklistbox';//图书列表容器div名称
var SERVER = 'http://192.168.35.140:8888/';//远端服务器名
var SHOPSWITCH = $('<div class="shopswitch"><a id="amazon" href="#amazon">亚马逊</a><a id="dangdang" href="#dangdang">当当</a><a id="jd" href="#jd">京东</a></div>');//商城切换部件


//hashchange函数表
var dohashchange = new Array();
dohashchange['start'] = function(){
    console.log('start');
};
dohashchange['amazon'] = function(){
    console.log('amazon');
    //修改搜索按钮的类名
    $('.search').removeClass('start').removeClass('dangdang').removeClass('jd').addClass('amazon');
    //如果当前搜索关键字与页面缓存的关键字一样就不需要从新提交搜索
    //页面也不需要做修改，只需要将原本隐藏的界面显示出来就可以了
    if(pagestate.current.keyword == pagestate.amazon.keyword){
        console.log('no thing');
    }
    else{
        if($('.shopswitch').length == 0){
            console.log('shopswitch');
            $('.main').prepend(SHOPSWITCH);
        }
        //清空当前booklistbox中的内容
        $('.booklistbox').empty();
        //请求数据
        $.ajax({
        url:SERVER+'amazon?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        success:function(data){
            //加载数据页
            addpage(data,'amazon');
            //设置当前页面的属性
            pagestate.amazon.keyword = pagestate.current.keyword;
            pagestate.amazon.page = 1;
            }
        });
    }
}
dohashchange['dangdang'] = function(){
    console.log('dangdang');
    $('.search').removeClass('start').removeClass('amazon').removeClass('jd').addClass('dangdang');
    //如果当前搜索关键字与页面缓存的关键字一样就不需要从新提交搜索
    //页面也不需要做修改，只需要将原本隐藏的界面显示出来就可以了
    if(pagestate.current.keyword == pagestate.dangdang.keyword){
        console.log('no thing');
    }
    else{
        if($('.shopswitch').length == 0){
            console.log('shopswitch');
            $('.main').prepend(SHOPSWITCH);
        }
        //清空当前booklistbox中的内容
        $('.booklistbox').empty();
        //请求数据
        $.ajax({
        url:SERVER+'dangdang?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        success:function(data){
            //加载数据页
            addpage(data,'dangdang');
            //设置当前页面的属性
            pagestate.dangdang.keyword = pagestate.current.keyword;
            pagestate.dangdang.page = 1;
            }
        });
    }
}
dohashchange['jd'] = function(){
    console.log('jd');
    //修改搜索按钮的类名
    $('.search').removeClass('start').removeClass('amazon').removeClass('dangdang').addClass('jd');
    //如果当前搜索关键字与页面缓存的关键字一样就不需要从新提交搜索
    //页面也不需要做修改，只需要将原本隐藏的界面显示出来就可以了
    if(pagestate.current.keyword == pagestate.jd.keyword){
        console.log('no thing');
    }
    else{
        if($('.shopswitch').length == 0){
            console.log('shopswitch');
            $('.main').prepend(SHOPSWITCH);
        }
        //清空当前booklistbox中的内容
        $('.booklistbox').empty();
        //请求数据
        $.ajax({
        url:SERVER+'jd?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        success:function(data){
            //加载数据页
            addpage(data,'jd');
            //设置当前页面的属性
            pagestate.jd.keyword = pagestate.current.keyword;
            pagestate.jd.page = 1;
            }
        });
    }
}
//用于记录每个页面状态的json
var pagestate = {
    amazon:{keyword:"",page:0},
    dangdang:{keyword:"",page:0},
    jd:{keyword:"",page:0},
    current:{keyword:""}
};

//添加列表的函数
function addpage(data,boxid){
    var length = data.length;
    for(var i = 0;i < length;i++){
        var ceil = $('<div class="bookceil" id="'+boxid+'""></div>');
        ceil.append('<img class="cover" src="'+data[i].cover+'">');
        ceil.append('<span class="name">'+data[i].name+'</span>');
        ceil.append('<span class="price">'+data[i].price+'</span>');
        if(data[i].author != '')
            ceil.append('<span class="author">'+data[i].author+'</span>');
        ceil.append('<span class="info">'+data[i].info+'</span>');
        ceil.append('<span class="url">'+data[i].url+'</span>');
        $(BOOKLISTBOX).append(ceil);
    }
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


$(document).ready(function(){
    //默认载入界面
    if(window.location.hash == ''){
        window.location.hash = 'start';
    }
    //搜索按钮
    $('body').delegate('.start', 'click', function() {
        var bookname = $('.searchname').val();
        if(bookname == ''){
            alert('请输入书名！');
            return;
        }
        pagestate.current.keyword = bookname;
        window.location.hash = 'amazon';
    });
    $('body').delegate('.amazon', 'click', function() {
        var bookname = $('.searchname').val();
        if(bookname == ''){
            alert('请输入书名！');
            return;
        }
        pagestate.current.keyword = bookname;
        dohashchange['amazon']();
    });
    $('body').delegate('.dangdang', 'click', function() {
        var bookname = $('.searchname').val();
        if(bookname == ''){
            alert('请输入书名！');
            return;
        }
        pagestate.current.keyword = bookname;
        dohashchange['dangdang']();
    });
    $('body').delegate('.jd', 'click', function() {
        var bookname = $('.searchname').val();
        if(bookname == ''){
            alert('请输入书名！');
            return;
        }
        pagestate.current.keyword = bookname;
        dohashchange['jd']();
    });
});

