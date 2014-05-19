var querystring = require("querystring");
var url = require("url");
var jsdom = require("jsdom");
var http = require("http");
var $ = require("jquery")(jsdom.jsdom().createWindow());
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var fs = require('fs');
//将十六进制转换为字符串
function numtostring(num){
    var string = '';
    var first = parseInt(num/16);
    if(first == 10){
        string += 'a';
    }
    if(first == 11){
        string += 'b';
    }
    if(first == 12){
        string += 'c';
    }
    if(first == 13){
        string += 'd';
    }
    if(first == 14){
        string += 'e';
    }
    if(first == 15){
        string += 'f';
    }
    if(first <= 10){
        string += first;
    }
    var secend = num%16;
    if(secend == 10){
        string += 'a';
    }
    if(secend == 11){
        string += 'b';
    }
    if(secend == 12){
        string += 'c';
    }
    if(secend == 13){
        string += 'd';
    }
    if(secend == 14){
        string += 'e';
    }
    if(secend == 15){
        string += 'f';
    }
    if(secend <= 10){
        string += secend;
    }
    return string;
}
//将gb2312编码的中文转换为url编码
function gb2312decode(buffer){
    var length = buffer.length;
    var string = '';
    console.log(length);
    for(var i = 0;i < length;i++){
        string += '%';
        string += numtostring(buffer[i]);
    }
    return string;
}
//将网页中的信息提取出来并且填充进入数组的函数
//第一个参数为网站名字，第二个参数为数组指针,第三个参数为网页数据
function getbooklist(webname,bookinfo,data){
    if(webname == 'amazon'){
        console.log('in amazon');
        var html = $(data).find('.prod');
        var num = html.length;
        if(num == 0)
            return false;
        for(var i = 0;i < num;i++){
            console.log('doing'+i);
            bookinfo[i] = {name:'',price:'',url:'',cover:'',info:''};
            current = html.eq(i);
            bookinfo[i].name = current.find('.newaps .lrg').text();
            bookinfo[i].price = current.find('.bld').eq(0).text();
            bookinfo[i].info = current.find('.newaps span.reg').text();
            bookinfo[i].cover = current.find('.image .imageBox img').attr('src');
            bookinfo[i].url = current.find('.newaps a').attr('href');

        }
    }
    if(webname == 'dangdang'){
        var html = $(data).find('.shoplist ul li');
        var num = html.length;
        console.log(num);
        if(num == 0)
            return false;
        for(var i = 0;i < num;i++){
            console.log('doing'+i);
            bookinfo[i] = {name:'',price:'',url:'',cover:'',info:'',author:''};
            current = html.eq(i);
            bookinfo[i].name = current.find('.name a').text();
            bookinfo[i].price = current.find('.price .price_n').text();
            bookinfo[i].author = current.find('.publisher_info .author a').attr('title');
            bookinfo[i].info = current.find('.publisher_info .publishing a').attr('title');
            bookinfo[i].cover = current.find('.inner .pic img').attr('src');
            bookinfo[i].url = current.find('.inner .name a').attr('href');
        }
    }
    if(webname == 'jd'){
        console.log('in jd');
        var html = $(data).find('.m .item');
        var num = html.length;
        console
        console.log(num);
        fs.open("test.txt","w",0644,function(e,fd){
            if(e) throw e;
            fs.write(fd,data,0,'utf8',function(e){
                if(e) throw e;
                fs.closeSync(fd);
            })
        });
        if(num == 0)
            return false;
        for(var i = 0;i < num;i++){
            console.log('doing'+i);
            bookinfo[i] = {name:'',price:'',url:'',cover:'',info:'',author:''};
            current = html.eq(i);
            bookinfo[i].name = current.find('.p-name a').text();
            var discount = parseFloat(current.find('.p-price .dd .discount').text().substr(1,3));
            var l_price = parseFloat(current.find('.p-market .dd del').text().substr(1));
            bookinfo[i].price = discount*l_price/10
            bookinfo[i].author = current.find('.summary-author .dd a').text();
            bookinfo[i].info = current.find('.summary-press .dd a').text();
            bookinfo[i].cover = current.find('.p-img a img').attr('data-lazyload');
            bookinfo[i].url = current.find('.p-name a').attr('href');

        }
    }
}
function amazon(response,request){
    console.log('amazon was called');
    var arg = url.parse(request.url,true).query;
    //用于储存得到的html页面
    var html = '';
    //用于储存返回的图书列表
    var bookinfo = new Array();
    callback = arg.callback;
    console.log('the callback is'+callback);
    //使用jquery来获得亚马逊的搜索界面
    console.log(arg.bookname);
    http.get('http://www.amazon.cn/s/ref=sr_pg_2?rh=n%3A658390051%2Ck%3A&page='+arg.page+'&keywords='+arg.bookname, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function(data) {
            html += data;
        }).on('end',function(){
            getbooklist('amazon',bookinfo,html);
            //构造jsonp函数来返回结果
            bookinfo = JSON.stringify(bookinfo);
            console.log(bookinfo);
            response.writeHead(200,{'Content-Type':'application/json'});
            response.write(callback+'('+bookinfo+')');
            response.end();
        });     
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}
http://search.dangdang.com/?key=hello&category_path=01.00.00.00.00.00&page_index=1
function dangdang(response,request){
    console.log('dangdang was called');
    var arg = url.parse(request.url,true).query;
    //用于储存得到的html页面
    var html = '';
    //用于储存返回的图书列表
    var bookinfo = new Array();
    callback = arg.callback;
    console.log('the callback is'+callback);
    //对传入的书名进行转码
    var booknamegbk;
    booknamegbk = iconv.encode(arg.bookname,'gb2312');
    arg.bookname = gb2312decode(booknamegbk);
    console.log(arg.bookname);
    var searchurl = 'http://search.dangdang.com/?key='+arg.bookname+'&category_path=01.00.00.00.00.00&page_index='+arg.page;
    //使用jquery来获dangdang的搜索界面
    console.log(searchurl);
    http.get(searchurl, function(res) {
        var buffer = new BufferHelper();
        res.on('data', function(data) { 
            buffer.concat(data);
        }).on('end',function(){
            //将获得的网页从gb2312码转换为utf-8码
            var buf = buffer.toBuffer();
            html = iconv.decode(buf,'gb2312');
            //console.log(html);
            getbooklist('dangdang',bookinfo,html);
            //构造jsonp函数来返回结果
            bookinfo = JSON.stringify(bookinfo);
            console.log(bookinfo);
            response.writeHead(200,{'Content-Type':'application/json'});
            response.write(callback+'('+bookinfo+')');
            response.end();
        });     
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}
function jd(response,request){
    console.log('jd was called');
    var arg = url.parse(request.url,true).query;
    //用于储存得到的html页面
    var html = '';
    //用于储存返回的图书列表
    var bookinfo = new Array();
    callback = arg.callback;
    console.log('the callback is'+callback);

    //构造get请求参数
    var options = {
        port: 80,
        hostname: 'search.jd.com',
        path: '/search?keyword='+arg.bookname+'&enc=utf-8&book=y&page='+arg.page,
        headers: {
          'User-Agent':'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36'
        }
    };

    //使用jquery来获得亚马逊的搜索界面
    http.get(options, function(res) {
        console.log("Got response: " + res.statusCode);
        console.log("headers: " + res.headers.location);
        res.on('data', function(data) { 
            console.log(data+'OK');
            html += data;
        }).on('end',function(){
            console.log(html);
            getbooklist('jd',bookinfo,html);
            //构造jsonp函数来返回结果
            bookinfo = JSON.stringify(bookinfo);
            console.log(bookinfo);
            response.writeHead(200,{'Content-Type':'application/json'});
            response.write(callback+'('+bookinfo+')');
            response.end();
        });     
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}
function login(response,request){
    
}
function register(response,request){
    
}
function logout(response,request){
    
}
function collect(response,request){
    
}
exports.amazon = amazon;
exports.dangdang = dangdang;
exports.jd = jd;
exports.login = login;
exports.register = register;
exports.logout = logout;
exports.collect = collect;