var querystring = require("querystring");
var url = require("url");
var jsdom = require("jsdom");
var http = require("http");
var $ = require("jquery")(jsdom.jsdom().createWindow());
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var fs = require('fs');
//建立数据库连接
var _mysql = require('mysql');

var HOST = 'localhost';
var PORT = 3306;
var MYSQL_USER = 'root';
var MYSQL_PASS = 'niefanjun';
var DATABASE = 'bookseacher';
var TABLE_USER = 'user';
var TABLE_COLLECT = 'collect';

var mysql = _mysql.createConnection({
    host: HOST,
    port: PORT,
    user: MYSQL_USER,
    password: MYSQL_PASS,
});
mysql.query('set names utf8');
mysql.query('use ' + DATABASE);
mysql.query('select user from '+TABLE_USER+' where 1',function(error,result){
    if (error) throw error;
    else {
        console.log(result);
    }
});
//服务器缓存
var webcatch = new Array();

//取得cookie
function getcookie(cookie,store){
    cookie.split(';').forEach(function( data ) {
      var parts = data.split('=');
      store[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
}
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
//将gb2312编码的中文转换为
function gb2312decode(buffer){
    var length = buffer.length;
    var string = '';
    console.log('the length of buffer is:'+length);
    for(var i = 0;i < length;i++){
        string += '%';
        string += numtostring(buffer[i]);
    }
    return string;
}
//将网页中的信息提取出来并且填充进入数组的函数
//第一个参数为网站名字，第二个参数为数组指针,第三个参数为网页数据
function getbooklist(webname,bookinfo,data,keyword,user){
    if(webname == 'amazon'){
        console.log('in amazon');
        var html = $(data).find('.prod');
        var num = html.length;
        bookinfo[0] = keyword;
        if(user)
            bookinfo[1] = user;
        else
            bookinfo[1] = '';
        if(num == 0)
            return false;
        
        for(var i = 2;i-2 < num;i++){
            console.log('doing'+i);
            bookinfo[i] = {name:'',price:'',url:'',cover:'',info:'',author:''};
            current = html.eq(i-2);
            bookinfo[i].name = current.find('.newaps .lrg').text();
            bookinfo[i].price = current.find('.bld').eq(0).text();
            //将价格变为纯数字
            bookinfo[i].price = bookinfo[i].price.match(/[0-9]+\.[0-9]+/);
            bookinfo[i].info = current.find('.newaps span.reg').text();
            bookinfo[i].cover = current.find('.image .imageBox img').attr('src');
            bookinfo[i].url = current.find('.newaps a').attr('href');

        }
    }
    if(webname == 'dangdang'){
        var html = $(data).find('.shoplist ul li');
        var num = html.length;
        bookinfo[0] = keyword;
        if(user)
            bookinfo[1] = user;
        else
            bookinfo[1] = '';
        if(num == 0)
            return false;
        for(var i = 2;i-2 < num;i++){
            console.log('doing'+i);
            bookinfo[i] = {name:'',price:'',url:'',cover:'',info:'',author:''};
            current = html.eq(i-2);
            bookinfo[i].name = current.find('.name a').text();
            //替换名称前后的空格
            bookinfo[i].name = bookinfo[i].name.replace(/^\s*|\s*$/g,'')
            bookinfo[i].price = current.find('.price .price_n').text();
            //将价格变为纯数字           
            bookinfo[i].price = bookinfo[i].price.match(/[0-9]+\.[0-9]+/);
            console.log(bookinfo[i].price);
            bookinfo[i].author = current.find('.publisher_info .author a').attr('title');
            bookinfo[i].info = current.find('.publisher_info .publishing a').attr('title');
            bookinfo[i].cover = current.find('.inner .pic img').attr('src');
            bookinfo[i].url = current.find('.inner .name a').attr('href');
            bookinfo[i].url = bookinfo[i].url.substr(0,bookinfo[i].url.indexOf('#'));
        }
    }
    if(webname == 'jd'){
        console.log('in jd');
        var html = $(data).find('.m .item');
        var num = html.length;
        bookinfo[0] = keyword;
        if(user)
            bookinfo[1] = user;
        else
            bookinfo[1] = '';
        if(num == 0)
            return false;
        for(var i = 2;i-2 <num;i++){
            console.log('doing'+i);
            bookinfo[i] = {name:'',price:'',url:'',cover:'',info:'',author:''};
            current = html.eq(i-2);
            bookinfo[i].name = current.find('.p-name a').text();
            console.log(bookinfo[i].name);
            bookinfo[i].name = bookinfo[i].name.match(/[^\s\t\n][^\t\n]*[^\s\t\n]|[^\s\t\n]/);
            console.log(bookinfo[i].name);     
            var discount = parseFloat(current.find('.p-price .dd .discount').text().substr(1,3));
            var l_price = parseFloat(current.find('.p-market .dd del').text().substr(1));
            bookinfo[i].price = discount*l_price/10;
            bookinfo[i].price = bookinfo[i].price.toFixed(2);
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
    var callback = arg.callback;
    console.log('the callback is'+callback);
    //get cookie
    var store = {};
    if(request.headers.cookie){
        getcookie(request.headers.cookie,store);
    }
    else{
        console.log('there is no cookie');
    }  
    //当输入为空，则必定为从商户页面跳转的时候
    if(arg.bookname == ''){
        if(store.keyword){
            arg.bookname = store.keyword;
        }
        else{
            console.log('no keyword in cookie');
            return;
        }        
    }
    
    var bookname = arg.bookname;
    //if catch
    if(webcatch[arg.bookname+arg.page+'amazon']){
        console.log('get catch:'+arg.bookname+arg.page+'amazon');
        getbooklist('amazon',bookinfo,webcatch[arg.bookname+arg.page+'amazon'],bookname,store.user);
        //构造jsonp函数来返回结果
        bookinfo = JSON.stringify(bookinfo);
        console.log(bookinfo);
        response.writeHead(200,{
            'Set-Cookie': 'keyword='+arg.bookname,
            'Content-Type':'application/json; charset=UTF-8'
        });
        response.write(callback+'('+bookinfo+')');
        response.end();
        return;
    }
    console.log(arg.bookname);
    console.log('http://www.amazon.cn/s/ref=sr_pg_2?rh=n%3A658390051%2Ck%3A&page='+arg.page+'&keywords='+arg.bookname);
    http.get('http://www.amazon.cn/s/ref=sr_pg_2?rh=n%3A658390051%2Ck%3A&page='+arg.page+'&keywords='+arg.bookname, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function(data) {
            html += data;
        }).on('end',function(){
            //not catch
            if(webcatch.length>=100){
                console.log('clear catch');
                webcatch = [];
            }
            console.log('write catch');
            webcatch[arg.bookname+arg.page+'amazon'] = html;

            getbooklist('amazon',bookinfo,html,bookname,store.user);
            //构造jsonp函数来返回结果
            bookinfo = JSON.stringify(bookinfo);
            console.log(bookinfo);
            response.writeHead(200,{
                'Set-Cookie': 'keyword='+arg.bookname,
                'Content-Type':'application/json; charset=UTF-8'
            });
            response.write(callback+'('+bookinfo+')');
            response.end();
        });     
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}

function dangdang(response,request){
    console.log('dangdang was called');
    var arg = url.parse(request.url,true).query;
    //用于储存得到的html页面
    var html = '';
    //用于储存返回的图书列表
    var bookinfo = new Array();
    
    var callback = arg.callback;
    console.log('the callback is'+callback);
    
    var booknamegbk;
    //get cookie
    var store = {};
    if(request.headers.cookie){
        getcookie(request.headers.cookie,store);
    }
    else{
        console.log('there is no cookie');
    }  
    //当输入为空，则必定为从商户页面跳转的时候
    if(arg.bookname == ''){
        if(store.keyword){
            arg.bookname = store.keyword;
        }
        else{
            console.log('no keyword in cookie');
            return;
        }        
    }
    var bookname = arg.bookname;
    console.log('bookname is: '+bookname);

    if(webcatch[bookname+arg.page+'dangdang']){
        console.log('get catch:'+arg.bookname+arg.page+'dangdang');
        getbooklist('dangdang',bookinfo,webcatch[arg.bookname+arg.page+'dangdang'],bookname,store.user);
        //构造jsonp函数来返回结果
        bookinfo = JSON.stringify(bookinfo);
        console.log(bookinfo);
        response.writeHead(200,{
            'Set-Cookie': 'keyword='+arg.bookname,
            'Content-Type':'application/json; charset=UTF-8'
        });
        response.write(callback+'('+bookinfo+')');
        response.end();
        return;
    }
    //对传入的书名进行转码
    console.log('before encode'+arg.bookname);
    booknamegbk = iconv.encode(arg.bookname,'gb2312');
    arg.bookname = gb2312decode(booknamegbk);
    console.log('after bookname is :'+bookname);
    console.log('after encode'+arg.bookname);
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
            if(webcatch.length>=100){
                console.log('clear catch');
                webcatch = [];
            }
            console.log('write catch');
            webcatch[bookname+arg.page+'dangdang'] = html;
            //console.log(html);
            getbooklist('dangdang',bookinfo,html,bookname,store.user);
            //构造jsonp函数来返回结果
            bookinfo = JSON.stringify(bookinfo);
            console.log(bookinfo);
            response.writeHead(200,{
                'Set-Cookie': 'keyword='+bookname,
                'Content-Type':'application/json; charset=UTF-8'
            });
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
    var callback = arg.callback;
    //get cookie
    var store = {};
    if(request.headers.cookie){
        getcookie(request.headers.cookie,store);
    }
    else{
        console.log('there is no cookie');
    }  
    //当输入为空，则必定为从商户页面跳转的时候
    if(arg.bookname == ''){
        if(store.keyword){
            arg.bookname = store.keyword;
        }
        else{
            console.log('no keyword in cookie');
            return;
        }        
    }
    var bookname = arg.bookname;
    if(webcatch[bookname+arg.page+'jd']){
        console.log('get catch:'+arg.bookname+arg.page+'jd');
        getbooklist('jd',bookinfo,webcatch[arg.bookname+arg.page+'jd'],bookname,store.user);
        //构造jsonp函数来返回结果
        bookinfo = JSON.stringify(bookinfo);
        console.log(bookinfo);
        response.writeHead(200,{
            'Set-Cookie': 'keyword='+arg.bookname,
            'Content-Type':'application/json; charset=UTF-8'
        });
        response.write(callback+'('+bookinfo+')');
        response.end();
        return;
    }
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
            if(webcatch.length>=100){
                console.log('clear catch');
                webcatch = [];
            }
            console.log('write catch');
            webcatch[bookname+arg.page+'jd'] = html;
            getbooklist('jd',bookinfo,html,bookname,store.user);
            //构造jsonp函数来返回结果
            bookinfo = JSON.stringify(bookinfo);
            console.log(bookinfo);
            response.writeHead(200,{
                'Set-Cookie': 'keyword='+bookname,
                'Content-Type':'application/json; charset=UTF-8'
            });
            response.write(callback+'('+bookinfo+')');
            response.end();
        });     
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
}
function login(response,request){
    var arg = url.parse(request.url,true).query;
    var user = arg.user;
    var password = arg.password;
    var callback = arg.callback;
    var message = {
        state:0,
        info:''
    };
    var store = {};
    if(request.headers.cookie){
        getcookie(request.headers.cookie,store);
        if(store.user){
            message.state = 1;
            message.info = '你当前已登录用户'+store.user;
            console.log('login fail');
            response.writeHead(200,{'Content-Type':'application/json; charset=UTF-8'});
            message = JSON.stringify(message);
            response.write(callback+'('+message+')');
            response.end();
            return;
        }
    }
    mysql.query('select * from '+TABLE_USER+' where user="'+user+'"',function(error,result){
        if (error) throw error;
        else{
            if (result.length == 0 ) {
                message.state = 0;
                message.info = '用户名不存在!';
                console.log('login fail');
                response.writeHead(200,{'Content-Type':'application/json; charset=UTF-8'});
                message = JSON.stringify(message);
                response.write(callback+'('+message+')');
                response.end();
            }
            else{
                if(result[0].password != password){
                    message.state = 0;
                    message.info = '密码错误!';
                    console.log('login fail');
                    response.writeHead(200,{'Content-Type':'application/json; charset=UTF-8'});
                    message = JSON.stringify(message);
                    response.write(callback+'('+message+')');
                    response.end();
                }
                else{
                    message.state = 1;
                    message.info = '登录成功!';
                    console.log('login success');
                    response.writeHead(200,{
                        'Set-Cookie': 'user='+user,
                        'Content-Type':'application/json; charset=UTF-8'
                    });
                    message = JSON.stringify(message);
                    response.write(callback+'('+message+')');
                    response.end();
                }
            }
        }
    });

}
function register(response,request){

    var arg = url.parse(request.url,true).query;
    var user = arg.user;
    var password = arg.password;
    var callback = arg.callback;
    var message = {
        state:0,
        info:''
    };
    mysql.query('select user from '+TABLE_USER+' where user="'+user+'"',function(error,result){
        if (error) throw error;
        else{
            if (result.length >0 ) {
                message.state = 0;
                message.info = '用户名已存在!';
                console.log('registe fail');
                response.writeHead(200,{'Content-Type':'application/json; charset=UTF-8'});
                message = JSON.stringify(message);
                response.write(callback+'('+message+')');
                response.end();
            }
            else{
                mysql.query('insert into '+TABLE_USER+' (user,password) values("'+user+'","'+password+'")',function(error,request){
                    if(error) throw error;
                    else{
                        message.state = 1;
                        message.info = '注册成功!';
                        console.log('registe success');
                        response.writeHead(200,{
                            'Set-Cookie': 'user='+user,
                            'Content-Type':'application/json; charset=UTF-8'
                        });
                        message = JSON.stringify(message);
                        response.write(callback+'('+message+')');
                        response.end();    
                    }
                });
            }
        }
    });
  
}
function logout(response,request){
    
}
function collect(response,request){
    var arg = url.parse(request.url,true).query;
    var callback = arg.callback;
    var store = {};
    getcookie(request.headers.cookie,store);
    if(store.user){
        mysql.query('select * from '+TABLE_COLLECT+' where user="'+store.user+'"',function(error,result){
            if(error) throw error;
            var data = JSON.stringify(result);
            console.log(data);
            response.writeHead(200,{
                'Content-Type':'application/json; charset=UTF-8'
            });
            response.write(callback+'('+data+')');
            response.end();
        });
    }
}
function addcollect(response,request){
    var store = {};
    var postData = '';
    var postDataJSON;
    var message = {
        state:0,
        info:''
    };
    console.log('addcollect was called');
    // 设置接收数据编码格式为 UTF-8
    request.setEncoding('utf8');

    // 接收数据块并将其赋值给 postData
    request.addListener('data', function(postDataChunk) {
        postData += postDataChunk;
    });

    request.addListener('end', function() {
        // 数据接收完毕，执行回调函数
        postDataJSON = JSON.parse(postData);
        console.log(postDataJSON.name);
        console.log(postData);
        response.writeHead(200,{
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'POST,GET',
            'Access-Control-Allow-Headers':'Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept',
            'Access-Control-Allow-Credentials':'true',
            'Content-Type':'application/json; charset=UTF-8'
        });
        mysql.query('select url from '+TABLE_COLLECT+' where user="'+postDataJSON.user+'" and url="'+postDataJSON.url+'"',function(error,result){
            if(error) throw error;
            if(result.length > 0){
                message.state = 0;
                message.info = '该商品已收藏';
                message = JSON.stringify(message);
                response.write(message);
                response.end();
                mysql.query('select * from '+TABLE_COLLECT+' where user="test"',function(error,result){
                    if (error) throw error;
                    else {
                        console.log(result);
                    }
                });
            }
            else{
                mysql.query('SET NAMES UTF8',function(){
                    mysql.query('insert into '+TABLE_COLLECT+' (user,name,price,info,author,cover,url) values("'+postDataJSON.user+'","'+postDataJSON.name+'","'+postDataJSON.price+'","'+postDataJSON.info+'","'+postDataJSON.author+'","'+postDataJSON.cover+'","'+postDataJSON.url+'")',function(error,result){
                        if(error) throw error;
                        message.state = 1;
                        message.info = '收藏成功';
                        message = JSON.stringify(message);
                        response.write(message);
                        response.end();
                        console.log('collect success');
                        mysql.query('select * from '+TABLE_COLLECT+' where user="test"',function(error,result){
                            if (error) throw error;
                            else {
                                console.log(result);
                            }
                        });
                    });
                });
            }
        });  
    });

}
function removecollect(response,request){
    var arg = url.parse(request.url,true).query;
    var callback = arg.callback;
    var store = {};
    var message = {
        state:0,
        info:''
    };
    getcookie(request.headers.cookie,store);
    if(store.user){
        mysql.query('delete from '+TABLE_COLLECT+' where user="'+store.user+'" and id ="'+arg.id+'"',function(error,result){
            if(error) {
                message.state = 0;
                message.info = error;
                message = JSON.stringify(message);
                response.writeHead(200,{
                    'Content-Type':'application/json; charset=UTF-8'
                });
                response.write(callback+'('+message+')');
                response.end();
                throw error;
            }
            message.state = 1;
            message.info = '删除成功';
            message = JSON.stringify(message);
            response.writeHead(200,{
                'Content-Type':'application/json; charset=UTF-8'
            });
            response.write(callback+'('+message+')');
            response.end();
        });
    }
}
exports.amazon = amazon;
exports.dangdang = dangdang;
exports.jd = jd;
exports.login = login;
exports.register = register;
exports.logout = logout;
exports.collect = collect;
exports.addcollect = addcollect;
exports.removecollect = removecollect;