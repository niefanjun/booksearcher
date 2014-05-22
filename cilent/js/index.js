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
loadlock['login'] = 0;
var nowuser='';
//服务器名
var SERVER = 'http://114.215.202.143:8000/'
//var SERVER = 'http://192.168.35.140:8888/'
var testforstore;
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
    if(length == 1){
        console.log('no more page');
        return;
    }
    nowuser = data[1];
    console.log('now user is: '+nowuser);
    for(var i = 2;i < length;i++){
        var ceil = $('<div class="bookceil page'+pagestate.current.page+'" id="'+(i-2)+'""></div>');
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
        detail.append('<a title="page'+pagestate.current.page+'" id="'+(i-2)+'" class="button black collect">收藏</a>');
        detail.append('<a href="'+data[i].url+'" class="button black url">访问商铺</a>');
        ceil.append(detail);
        $('.shoppage#'+pagestate.current.name+' .result_content').append(ceil);
        formartceil('#'+pagestate.current.name+' .bookceil.page'+pagestate.current.page);
        
    }
    console.log('current page is'+pagestate.current.page);
}
function loadcollect(data){
    console.log('call loadcollect');
    var length = data.length;
    if(length == 0){
        $('.shoppage#collect .result_content').append('你还没有添加任何收藏');
        return;
    }
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
        formartceil('#collect .bookceil.pagecollect');   
    }
}
//对商品列表的元素进行布局
function formartceil(selecter){
    var urlwidth = $(selecter).find('.url').width();
    var collectwidth = $(selecter).find('.collect').width();
    var deletetwidth = $(selecter).find('.delete').width();
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
        'padding': CEILWIDTH/79 +'px',
        'text-shadow':'none'
    }); 
    $(selecter).find('.collect').css({
        right: CEILWIDTH/34.5+urlwidth+collectwidth+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'padding': CEILWIDTH/79 +'px',
        'text-shadow':'none'
    });
    $(selecter).find('.delete').css({
        right: CEILWIDTH/34.5+urlwidth+deletetwidth+'px',
        'margin-bottom': CEILWIDTH/34.5 +'px',
        'padding': CEILWIDTH/79 +'px',
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
                return false;
            }
            loadlock[pagename] = 1;
        },
        error:function(){
            loadlock[pagename] = 0;
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
    console.log('run loadmore');
    $.ajax({
        url:SERVER+pagestate.current.name+'?callback=?&bookname='+pagestate.current.keyword+'&page='+(pagestate.current.page+1),   
        dataType:'jsonp',
        error:function(){
            loadlock[pagestate.current.name] = 0;
        },
        beforeSend:function(){
            //锁死
            if(loadlock[pagestate.current.name] == 1){
                return false;
            }
            loadlock[pagestate.current.name] = 1;
        },
        success:function(data){
            //加载数据页
            $('.loadingimg').addClass('displaynone');
            pagestate.current.page++;
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
function showdialog(message,btn){
    btn.attr({
        href: '#messagedlg',
        'data-rel': 'dialog'
    });
    $('#messagedlg p').text(message);
}
//hashchangge函数
var dohashchange = new Array();
dohashchange['amazon'] = function(){
    console.log('testforstore is'+testforstore);
    console.log('amazon keyword is:'+pagestate.amazon.keyword);
    console.log('amazom page is:'+pagestate.amazon.page);
    $('#bookname_amazon').attr('value', pagestate.current.keyword);
    reflashcurrentstate('amazon',pagestate.current.keyword,1);
    console.log('current keyword is:'+pagestate.current.keyword);
    if(pagestate.current.keyword&&pagestate.current.keyword == pagestate.amazon.keyword){
        pagestate.current.page = pagestate.amazon.page;
        return;
    }
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
                return false;
            }
            loadlock['amazon'] = 1;
        },
        error:function(){
            loadlock['amazon'] = 0;
        },
        success:function(data){
            //加载数据页
            console.log('return keyword:'+data[0]);
            console.log(data.length);
            pagestate.current.keyword = data[0];
            addpage(data);
            //设置当前页面的属性
            $('.loadingimg').addClass('displaynone');
            loadlock['amazon'] = 0;
        }
    });
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
                return false;
            }
            loadlock['dangdang'] = 1;
        },
        error:function(){
            loadlock['dangdang'] = 0;
        },
        success:function(data){
            //加载数据页
            console.log(data.length);
            console.log('return keyword:'+data[0]);
            pagestate.current.keyword = data[0];
            addpage(data);
            //设置当前页面的属性
            
            loadlock['dangdang'] = 0;
            $('.loadingimg').addClass('displaynone');
        }
    });
}

dohashchange['jd'] = function(){
    $('#bookname_jd').attr('value', pagestate.current.keyword);
    reflashcurrentstate('jd',pagestate.current.keyword,1);
    if(pagestate.current.keyword&&pagestate.current.keyword == pagestate.jd.keyword){
        pagestate.current.page = pagestate.jd.page;
        return;
    }
    $('.shoppage#jd .result_content').empty();
    $('.loadingimg').removeClass('displaynone');
    pagestate.jd.keyword = pagestate.current.keyword;
    pagestate.jd.page = 1;
    pagestate.current.page = 1;
    $.ajax({
        url:SERVER+'jd?callback=?&bookname='+pagestate.current.keyword+'&page=1',   
        dataType:'jsonp',
        beforeSend:function(){
            //锁死
            if(loadlock['jd'] == 1){
                return false;
            }
            loadlock['jd'] = 1;
        },
        error:function(){
            loadlock['jd'] = 0;
        },
        success:function(data){
            //加载数据页
            console.log(data.length);
            console.log('return keyword:'+data[0]);
            pagestate.current.keyword = data[0];
            addpage(data);
            //设置当前页面的属性
            
            loadlock['jd'] = 0;
            $('.loadingimg').addClass('displaynone');
        }
    });
}
dohashchange['collect'] = function(){
    $('#collect .result_content').empty();
    $.ajax({
        url:SERVER+'collect?callback=?',   
        dataType:'jsonp',
        beforeSend:function(){
            //锁死
        },
        error:function(){

        },
        success:function(data){
            //加载数据页
            console.log(data.length);
            loadcollect(data);
            //设置当前页面的属性
        }
    });
}

window.onhashchange = function(){
    var hash = window.location.hash.substr(1);
    if(typeof dohashchange[hash] === 'function')
        dohashchange[hash]();
}

$(document).ready(function(){
    var hash = window.location.hash.substr(1);
    if(typeof dohashchange[hash] === 'function')
        dohashchange[hash]();
    /*if(pagestate.current.name == ''){
        if(window.location.hash == '#amazon' || window.location.hash == '#dangdang' || window.location.hash == '#jd')
            window.location.hash = 'pagesearch'; 
    }*/
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
    $('#request img').css({
        'margin-top':'60%',
        'margin-left':(WINDOWWIDTH-78)/2+'px'
    });
    $('#collectmessage img').css({
        'margin-top':'60%',
        'margin-left':(WINDOWWIDTH-78)/2+'px'
    });
    $('body').delegate('#pagesearch .search_btn', 'click', function(event) {
        testforstore = 'test';
        //$(this).attr('data-rel', 'dialog');
        var inputvar = $('#pagesearch .search_content input').val()
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
                    $('#request p').text(data.info);
                    $('#request a.next').addClass('displaynone');
                    $('#request a.pre').removeClass('displaynone');
                    window.location.hash = 'request';
                }
                if(data.state == 1){
                    $('#request img').attr('src', './img/pass.png');
                    $('#request p').text(data.info);
                    $('#request a.pre').addClass('displaynone');
                    $('#request a.next').removeClass('displaynone');
                    window.location.hash = 'request';
                }
            },            
        });    
    });
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
                    $('#request p').text(data.info);
                    $('#request a.next').addClass('displaynone');
                    $('#request a.pre').removeClass('displaynone');
                    window.location.hash = 'request';
                }
                if(data.state == 1){
                    $('#request img').attr('src', './img/pass.png');
                    $('#request p').text(data.info);
                    $('#request a.pre').addClass('displaynone');
                    $('#request a.next').removeClass('displaynone');
                    window.location.hash = 'request';
                }
            },            
        });    
    });
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
        $.ajax({
            url:SERVER+'addcollect',   
            dataType:'json',
            type:'POST',
            data: datapost,
            error:function(){
                
            },
            beforeSend:function(){
                //锁死
            },
            success:function(data){
                if(data.state == 0){
                    $('#collectmessage img').attr('src', './img/deny.png');
                    $('#collectmessage p').text(data.info);
                    window.location.hash = 'collectmessage';
                }
                if(data.state == 1){
                    $('#collectmessage img').attr('src', './img/pass.png');
                    $('#collectmessage p').text(data.info);
                    window.location.hash = 'collectmessage';
                }
            }
        }); 
    });
    $('body').delegate('.bookceil .delete', 'click', function(event) {

        var ceil = $('#collect .pagecollect#'+$(this).attr('id'));
        console.log(ceil.find('.url').attr('href'));
        var url = ceil.find('.url').attr('href');
        $.ajax({
            url:SERVER+'removecollect?callback=?&id='+$(this).attr('title'),   
            dataType:'jsonp',
            beforeSend:function(){
                //锁死
            },
            error:function(){

            },
            success:function(data){
                //加载数据页
                if(data.state == 0){
                    $('#collectmessage img').attr('src', './img/deny.png');
                    $('#collectmessage p').text(data.info);
                    window.location.hash = 'collectmessage';
                }
                if(data.state == 1){
                    $('#collectmessage img').attr('src', './img/pass.png');
                    $('#collectmessage p').text(data.info);
                    window.location.hash = 'collectmessage';
                }
            }
        });
        /*console.log(ceil.find('img').attr('src'));
        var data = {name:'',price:'',url:'',cover:'',info:'',author:'',user:''};
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
        $.ajax({
            url:SERVER+'addcollect',   
            dataType:'json',
            type:'POST',
            data: datapost,
            error:function(){
                
            },
            beforeSend:function(){
                //锁死
            },
            success:function(data){
                if(data.state == 0){
                    $('#collectmessage img').attr('src', './img/deny.png');
                    $('#collectmessage p').text(data.info);
                    window.location.hash = 'collectmessage';
                }
                if(data.state == 1){
                    $('#collectmessage img').attr('src', './img/pass.png');
                    $('#collectmessage p').text(data.info);
                    window.location.hash = 'collectmessage';
                }
            }
        }); */
    });
    $(window).scroll(function(event) {
        console.log('when scroll, the current name is'+pagestate.current.name);
        console.log('when scroll, the current keyword is'+pagestate.current.keyword)
        if(window.location.hash == 'collect')
            return;
        if(pagestate.current.name == '' || pagestate.current.keyword == '')
            return;
        if ($(this).scrollTop() + $(window).height() >= $(document).height()) {
            loadmore();
        }
    });
});