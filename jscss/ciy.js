/*
 * 开源作者：众产国际产业公会  http://ciy.cn/code
 * 版本：0.6.2
 */
'use strict';
function uperr(err,msg){
    console.error(err);
    var postparam = {};
    postparam.tit = 'admin';
    postparam.err = err.message;
    postparam.stack = err.stack;
    postparam.msg = msg;
    ciy_ajax({
        url:"ajax.php?json=true&func=uperr",
        data:postparam
    });
}
function ciy_fastfunc(confirmmsg,func,postparam,succfunc){
    if(!confirmmsg)
        return cfunc();
    ciy_alert(confirmmsg,function(btn){
        if(btn == "继续")
            cfunc();
    },{btns:["继续","取消"]});
    function cfunc()
    {
        callfunc(func,postparam,function(json){
            if(succfunc == 'reload')
            {
                ciy_toast('操作成功',{done:function(){
                    location.reload();
                }});
            }
            else if(typeof(succfunc) == 'function')
                succfunc(json);
            else
                ciy_toast('操作成功');
        });
    }
}
function callfunc(funcname, post, successfunc, opt){//opt  fail,complete,headers,timeout
    opt = opt || {};
    if(funcname.indexOf('?') > -1 || funcname.indexOf('://') > -1)
        opt.url = funcname;
    else
        opt.url = "?json=true&func="+funcname;
    opt.data = post;
    opt.success = function(data,xhr){
        try{
        var ind = data.indexOf('{');
        if(ind>0)
            data = data.substr(ind);
        var json = JSON.parse(data);
        }catch(err){
            uperr(err,data);
        }
        if(json === undefined)
        {
            ciy_loadclose('fail');
            if(typeof opt.fail === 'function')
                opt.fail(data,xhr);
            else
                ciy_alert(data);
        }
        else if(json.result)
        {
            ciy_loadclose('succ');
            successfunc(json,xhr);
        }
        else
        {
            ciy_loadclose('fail');
            if(typeof(opt.fail) === 'function')
                opt.fail(json.msg,xhr);
            else
                ciy_alert(json.msg);
        }
    }
    ciy_loading();
    ciy_ajax(opt);
}
function ciy_ajax(opt){//IE8 OK
    opt = opt || {};
    var header = opt.header || {};
    if(!header['Content-Type'])//header:{'Content-Type':'application/x-www-form-urlencoded'},
        header['Content-Type'] = 'application/json';
    var url = opt.url || '';
    var timeout = opt.timeout || 10000;
    if(timeout < 1000)
        timeout = 3000;
    var method = opt.method || 'POST';
    method = method.toUpperCase();
    if(method == 'GET' && typeof(opt.data) == 'object')
    {
        var datastr = "";
        for (var p in opt.data)
            datastr += "&" + encodeURIComponent(p) + "=" + encodeURIComponent(opt.data[p]);
        if(url.indexOf('?') == -1)
            url += '?' + datastr.substr(1);
        else
            url += datastr;
    }
    var request = new XMLHttpRequest();
    request.open(method,url,true);
    if(typeof(header) == 'object')
    {
        for (var i in header) {
            if (header[i] !== undefined)
                request.setRequestHeader(i, "" + header[i]);
        }
    }
    var sendstr = null;
    if(method == 'POST' || method == 'PUT')
    {
        if(typeof(opt.data) == 'object')
        {
            if(header['Content-Type'] == 'application/x-www-form-urlencoded')
            {
                var sendstr = "";
                for (var p in opt.data)
                    sendstr += "&" + encodeURIComponent(p) + "=" + encodeURIComponent(opt.data[p]);
                sendstr = sendstr.substr(1);
            }
            else
                sendstr = JSON.stringify(opt.data);
        }
        else if(opt.data)
        {
            if(header['Content-Type'] == 'application/json')
            {
                var json = {};
                var ds = opt.data.split('&');
                for(var d in ds)
                {
                    var ind = ds[d].indexOf('=');
                    if(ind > 0)
                        json[ds[d].substr(0,ind)] = ds[d].substr(ind+1);
                }
                sendstr = JSON.stringify(json);
            }
            else
                sendstr = "" + opt.data;
        }
    }
    request.send(sendstr);
    request.onreadystatechange = function() {
        if(this.readyState === 4){
            clearTimeout(aborttime);
            if(this.status >= 200 && this.status < 400){
                if(typeof opt.success === 'function')
                    opt.success(this.responseText,this);
            }else{
                if(typeof opt.fail === 'function')
                {
                    var errtxt = '';
                    if(this.status == 200)
                        errtxt = 'Server Error: '+this.responseText;
                    else if(this.status == 404)
                        errtxt ="404 Not Found: "+this.responseURL;
                    else if(this.status == 0)
                        errtxt ="Server No Response.";
                    else
                        errtxt = 'ErrCode:'+this.status+","+this.statusText;
                    opt.fail(errtxt,this);
                }
            }
            if(typeof opt.complete === 'function')
                opt.complete(this);
        }
    }
    var aborttime = window.setTimeout( function() {request.abort("timeout");}, timeout);
}
function _ciy_getform_dom(dom)
{
    var retdata = {};
    var els = dom.querySelectorAll("input,textarea,select");
    for (var i = 0; i < els.length; i++)
    {
        if(els[i].tagName == 'SELECT')
        {
            if(retdata[els[i].name] === undefined)
                retdata[els[i].name] = els[i].value;
            else
            {
                if(typeof(retdata[els[i].name]) != 'object')
                {
                    var oldval = retdata[els[i].name];
                    retdata[els[i].name] = [];
                    retdata[els[i].name].push(oldval);
                }
                retdata[els[i].name].push(els[i].value);
            }
            var name = '';
            if(els[i].options.selectedIndex > -1)
                name = els[i].options[els[i].options.selectedIndex].text;
            if(retdata[els[i].name+"_name"] === undefined)
                retdata[els[i].name+"_name"] = name;
            else
            {
                if(typeof(retdata[els[i].name+"_name"]) != 'object')
                {
                    var oldval = retdata[els[i].name+"_name"];
                    retdata[els[i].name+"_name"] = [];
                    retdata[els[i].name+"_name"].push(oldval);
                }
                retdata[els[i].name+"_name"].push(name);
            }
        }
        else if(els[i].getAttribute('type') == 'radio')
        {
            retdata[els[i].name+"_name"] = els[i].parentNode.textContent;
            if(els[i].checked)
                retdata[els[i].name] = els[i].value;
            else
                retdata[els[i].name] = 'false';
        }
        else if(els[i].getAttribute('type') == 'checkbox')
        {
            if(els[i].nextElementSibling != null && els[i].nextElementSibling.tagName == 'Y')//处理开关按钮
            {
                retdata[els[i].name] = els[i].checked;
                if(els[i].checked)
                    retdata[els[i].name+"_name"] = els[i].nextElementSibling.textContent;
                else
                    retdata[els[i].name+"_name"] = els[i].nextElementSibling.nextElementSibling.textContent;
            }
            else if(els[i].checked)
            {
                if(retdata[els[i].name] === undefined)
                {
                    retdata[els[i].name] = els[i].value;
                    retdata[els[i].name+"_name"] = els[i].parentNode.textContent;
                }
                else
                {
                    retdata[els[i].name] += "," + els[i].value;
                    retdata[els[i].name+"_name"] += "," + els[i].parentNode.textContent;
                }
            }
        }
        else
        {
            if(retdata[els[i].name] === undefined)
                retdata[els[i].name] = els[i].value;
            else
                retdata[els[i].name] += "," + els[i].value;
        }
    }
    return retdata;
}
function ciy_getform(dom,parentTag){
    while(true)
    {
        if(parentTag && dom.tagName == parentTag)
            break;
        if(dom.tagName == 'BODY' || dom.tagName == 'FORM' || dom == null)
            break;
        dom = dom.parentNode;
    }
    var retdata = _ciy_getform_dom(dom);
    var els = dom.getElementsByClassName("form-group");
    for (var i = 0; i < els.length; i++)
    {
        var check = els[i].getAttribute('data-check');
        if(check == null)
            continue;
        var el = els[i].getElementsByTagName("input");
        if(el.length == 0)
            el = els[i].getElementsByTagName("select");
        if(el.length == 0)
            el = els[i].getElementsByTagName("textarea");
        if(el.length == 0)
        {
            console.log('no Find FormData',els[i]);
            continue;
        }
        if(!el[0].name)
            continue;
        var val = retdata[el[0].name]||'';
        if(!ciy_check(check,val))
        {
            if(getComputedStyle(els[i])['display'] == 'none')
                continue;
            var empty = els[i].getAttribute('data-empty');
            if(empty != null && val == '')
                continue;
            var title = els[i].querySelector('label').textContent;
            retdata['_check'] = els[i].getAttribute('data-checkmsg')||'请正确填写'+title;
        }
    }
    return retdata;
}
function ciy_check(check,val)
{
    if(check == 'mobile')
        return /^1\d{10}$/.test(val);
    if(check == 'date')//2000-01-01
        return /^\d{4}-([1-9]|0[1-9]|1[0-2])-([1-9]|[0-2][0-9]|3[0-1])$/.test(val);
    if(check == 'datetime')//2000-01-01 00:00:00
        return /^\d{4}-([1-9]|0[1-9]|1[0-2])-([1-9]|[0-2][0-9]|3[0-1])\s+([0-9]|[01][0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/.test(val);
    if(check == 'dateminute')//2000-01-01 00:00
        return /^\d{4}-([1-9]|0[1-9]|1[0-2])-([1-9]|[0-2][0-9]|3[0-1])\s+([0-9]|[01][0-9]|2[0-3]):([0-9]|[0-5][0-9])$/.test(val);
    if(check == 'time')//00:00:00
        return /^([0-9]|[01][0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/.test(val);
    if(check == 'timeminute')//00:00
        return /^([0-9]|[01][0-9]|2[0-3]):([0-9]|[0-5][0-9])$/.test(val);
    if(check == 'url')
        return /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/.test(val);
    if(check == 'mail')
        return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(val);
    if(check == 'ipv4')
        return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(val);
    if(check == 'cardid')
        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val);
    if(check == 'num')
        return /(-?\d*)(\.\d+)?/.test(val);
    if(check == 'int')
        return (val > 0);
    return (val != '');
}
function ciy_urlparam(url){
    var obj = {};
    url = url||document.location.search;
    if(url[0] != '?')
        return obj;
    var pairs = url.substring(1).split('&');
    for(var p in pairs)
    {
        var ind = pairs[p].indexOf('=');
        if(ind > -1)
            obj[decodeURIComponent(pairs[p].substring(0,ind))] = decodeURIComponent(pairs[p].substring(ind + 1));
        else
            obj[pairs[p]] = '';
    }
    return obj; 
}
function ciy_layout(act){
    var lmenuact = act;
    $('#id_headertabs_ul').on("click","i",function(ev){
        var domtab = $(this).parents('li');
        if(domtab.hasClass("active"))
        {
            var domltab = domtab.next();
            if(domltab.length == 0)
                domltab = domtab.prev();
            ciy_ifropen('',domltab.attr('data-tit'));
        }
        ciy_ifrclose(domtab);
        var e = ev || event;
        e.stopPropagation();
    });
    $('#id_headertabs_ul').on("click","li",function(ev){
        $("#id_headertabs_ul>li").removeClass('active');
        $("#id_ifms>iframe").removeClass('active');
        $(this).addClass('active');
        $("#id_ifms>iframe[data-tit='"+$(this).attr('data-tit')+"']").addClass('active');
    });
    $('.ciy-menu-nav').on("click","li",function(ev){
        if($('#id_body').hasClass("ciy-menu-shrink") && window.innerWidth > 992)
        {
            $('.ciy-menu-nav ._ulshow').slideUp(400);//收缩的情况下，隐藏所有菜单展开
            $('.ciy-menu-nav .show').removeClass("show");//同上
            $('#id_body').removeClass("ciy-menu-shrink");
        }
        if($(this).hasClass("show"))
        {
            $(this).children('ul').slideUp(400);
            $(this).removeClass("show");
        }
        else
        {
            //关闭上次打开菜单
            if(lmenuact == 'autoclose')
            {
                if($(this).parents('ul').length == 1)
                {
                    $('.ciy-menu-nav ._ulshow').removeClass("_ulshow").slideUp(400);
                    $('.ciy-menu-nav .show').removeClass("show");
                    $(this).children('ul').addClass("_ulshow");
                }
            }
            //关闭上次打开菜单 end
            $(this).children('ul').slideDown(400);
            $(this).addClass("show");
        }
        var navshows = new Array();
        $('.ciy-menu-nav li').each(function(){
            if(this.querySelector(".ciy-menu-more") === null)
                return;
            if(this.className != 'show')
                return;
            var atxt = this.querySelector("a");
            if(atxt === null)
                return;
            var navshow;
            if(atxt.querySelector("cite") !== null)
            {
                atxt = atxt.querySelector("cite");
                navshow = '_CITE'+atxt.textContent;
            }
            else
                navshow = atxt.textContent;
            navshows.push(navshow);
        });
        localStorage.setItem('menushow', navshows.join('||'));
        var href = $(this).children('a').attr('data-href');
        if(href !== undefined)
        {
            var txt = $(this).children('a').attr('data-title');
            if(txt === undefined)
            {
                if($(this).children('a').children('cite').length==1)
                    txt = $(this).children('a').children('cite').text();
                else
                    txt = $(this).children('a').text();
            }
            ciy_ifropen(href,txt);
            $('.ciy-menu-nav li').removeClass("active");
            $(this).addClass("active");
            if(window.innerWidth < 992)
                ciy_shrink();
        }
        var e = ev || event;
        e.stopPropagation();
    });
    $('.ciy-menu-nav').on("mousemove",function(ev){
        if($('#id_body').hasClass("ciy-menu-shrink"))
        {
            var el = ev.target;
            if(ev.target.tagName != 'LI')
                el = $(ev.target).parents('li');
            var txt = $(el).find('cite').text();
            $(el).find('i').attr('title',txt);
        }
        else
        {
            var top = $(".ciy-side-scroll").scrollTop();
            if(ev.target.tagName != 'LI')
                top += $(ev.target).parents('li').offset().top;
            else
                top += $(ev.target).offset().top;
            $(".ciy-nav-bar").css('top',top);
        }
    });
    var menushow = localStorage.getItem('menushow');
    if(menushow !== null)
    {
        var navs = {};
        $('.ciy-menu-nav li').each(function(){
            if(this.querySelector(".ciy-menu-more") === null)
                return;
            var atxt = this.querySelector("a");
            if(atxt === null)
                return;
            if(atxt.querySelector("cite") !== null)
            {
                atxt = atxt.querySelector("cite");
                navs['_CITE'+atxt.textContent] = this;
            }
            else
                navs[atxt.textContent] = this;
        });
        var menushows = menushow.split('||');
        for(var i in menushows)
        {
            if(navs[menushows[i]])
                navs[menushows[i]].className = 'show';
        }
    }
}
function ciy_layoutclose(act){
    if(act == 'me')
    {
        var domtab = $('#id_headertabs_ul>li.active');
        if(domtab.length == 0)
            alert('domtab出现错误');
        if(domtab.find('i').length == 0)
            return;
        
        var domltab = domtab.next();
        if(domltab.length == 0)
            domltab = domtab.prev();
        ciy_ifropen('',domltab.attr('data-tit'));
        ciy_ifrclose(domtab);
    }
    if(act == 'oth')
    {
        var domtabs = $('#id_headertabs_ul>li');
        domtabs.each(function(index,item){
            item = $(item);
            if(item.find('i').length == 0)
                return;
            if(item.hasClass('active'))
                return;
            ciy_ifrclose(item);
        });
    }
    if(act == 'all')
    {
        var domtabs = $('#id_headertabs_ul>li');
        domtabs.each(function(index,item){
            item = $(item);
            if(item.find('i').length == 0)
                return;
            ciy_ifrclose(item);
        });
        var domltab = $('#id_headertabs_ul>li:first');
        ciy_ifropen('',domltab.attr('data-tit'));
    }
}
function ciy_ifrclose(domtab){
    if(window.parent != window)
    {
        //关闭自己
        var frames = window.parent.document.getElementsByTagName("iframe");
        for (var i = 0; i < frames.length; i++) {
            if (frames[i].contentWindow == window)
            {
                window.parent.ciy_ifrclose(frames[i].getAttribute('data-tit'));
                if(typeof(frames[i].closecb) == 'function')
                    frames[i].closecb();
                return;
            }
        }
        return;
    }
    if(typeof(domtab) == 'string')
    {
        domtab = $("#id_headertabs_ul>li[data-tit='"+domtab+"']");
        if(domtab.length == 0)
            return;
        var domltab = domtab.next();
        if(domltab.length == 0)
            domltab = domtab.prev();
        ciy_ifropen('',domltab.attr('data-tit'));
    }
    var txt = domtab.attr('data-tit');
    var domifm = $("#id_ifms>iframe[data-tit='"+txt+"']");
    domifm[0].src = 'about:blank';
    domifm[0].contentWindow.close();
    setTimeout(function(){
        domifm.remove();
    },100);
    domtab.remove();
}
function ciy_ifropen(url,txt,ableclose,closecb){
    if(window.parent != window)
        return window.parent.ciy_ifropen(url,txt,ableclose,closecb);
    var elifms = document.getElementById("id_ifms");
    var eltabs = document.getElementById("id_headertabs_ul");
    var elifm = elifms.querySelector("[data-tit='"+txt+"']");
    if(elifm == null)
    {
        if(url == "")
            return;
        $("#id_headertabs_ul>li").removeClass('active');
        $("#id_ifms>iframe").removeClass('active');
        $(elifms).append("<iframe class='active' src='"+url+"' data-tit='"+txt+"' frameborder='0'></iframe>");
        if(ableclose)
            ableclose = '';
        else
            ableclose = '<i><svg t="1527035202927" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1146" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><path d="M512 0C229.216 0 0 229.216 0 512s229.216 512 512 512 512-229.216 512-512S794.784 0 512 0zM723.2 642.752c22.112 22.112 22.112 58.336 0 80.448s-58.336 22.112-80.448 0L512 592.448 381.248 723.2c-22.112 22.112-58.336 22.112-80.448 0s-22.112-58.336 0-80.448L431.552 512 300.8 381.248c-22.112-22.112-22.112-58.336 0-80.448s58.336-22.112 80.448 0L512 431.552 642.752 300.8c22.112-22.112 58.336-22.112 80.448 0s22.112 58.336 0 80.448L592.448 512 723.2 642.752z" p-id="1147"></path></svg></i>';
        $(eltabs).append("<li class='active' data-tit='"+txt+"' title='"+url+"'><a>"+txt+"</a>"+ableclose+"</li>");
        //滚动到最后
        var div = document.getElementById('id_headertabs');
        div.scrollLeft = div.clientWidth+$(div).width();
        var domifm = $("#id_ifms>iframe[data-tit='"+txt+"']");
        domifm[0].closecb = closecb;
    }
    else
    {//激活
        var eltab = eltabs.querySelector("[data-tit='"+txt+"']");
        if(eltab == null)
            alert('eltab出现错误');
        $("#id_headertabs_ul>li").removeClass('active');
        $("#id_ifms>iframe").removeClass('active');
        $(eltab).addClass('active');
        $(elifm).addClass('active');
        if(url != '')
            elifm.src = url;
        //自动滚动到能看到选中
        var div = document.getElementById('id_headertabs');
        var vsta = $(eltab).offset().left+div.scrollLeft-$(div).offset().left;
        if(div.scrollLeft>vsta)
            div.scrollLeft=vsta;
        else
        {
            var vend = vsta-$(div).width()+$(eltab).width()+$(eltab).width();
            if(div.scrollLeft<vend)
                div.scrollLeft=vend;
        }
        //自动滚动到能看到选中 end
    }
}
function ciy_shrink(){
    $('#id_body').toggleClass("ciy-menu-shrink");
}
function ciy_headertabscroll(act){
    var div = document.getElementById('id_headertabs');
    var width = $(div).width()*2/3;
    var sl = div.scrollLeft;
    if(act == 'left')
        sl -=width;
    else
        sl +=width;
    div.scrollLeft = sl;
}
function ciy_refresh(){
    if(window.parent != window)
        return window.parent.ciy_refresh();
    var domifm = $("#id_ifms>iframe.active");
    if(domifm.length == 1)
        domifm[0].contentWindow.location.reload();//domifm.attr('src', domifm.attr('src'));
}
function ciy_fix(){
    if (navigator.userAgent.match(/iPad|iPhone/i))
       document.body.style.width = window.screen.availWidth+'px';/*解决IOS被撑大问题*/
}
function ciy_repre(){
    var els = document.getElementsByTagName("pre");
    for (var i = 0; i < els.length; i++)
        els[i].innerHTML = els[i].innerHTML.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}
function ciy_table_adjust(domname,pathname){
    var dom = document.querySelector(domname);
    if(dom == null)
        return;
    pathname = pathname||location.pathname;
    pathname = '_t_'+pathname;
    var style = document.createElement('style');
    style.type = 'text/css';
    dom.appendChild(style);
    var itext = localStorage.getItem(pathname);
    var htrs = dom.querySelectorAll("tr");
    var trs = [];
    for(var i=0;i<htrs.length;i++){
    	if(htrs[i].querySelectorAll("th").length > 0)
    		trs = htrs[i].querySelectorAll("th");
    }
    dom.setAttribute('_adjust',1);
    if(itext == null)
    {
        itext = '';
        for(var i=0;i<trs.length;i++)
        {
            if(trs[i].style.width != '')
                itext+=domname+" tr > td:nth-child("+(i+1)+") > div { width: "+trs[i].style.width+";}";
        }
    }
    else
    {
        var itms = itext.split(',');
        itext = '';
        for(var i=0;i<trs.length;i++)
        {
            if(itms[i] && itms[i] != '')
                itext+=domname+" tr > td:nth-child("+(i+1)+") > div { width: "+itms[i]+"}";
        }
    }
    for (var i = 0; i < trs.length; i++){
      trs[i].style.width = null;
      trs[i].setAttribute('_canadjust',1);
    }
    style.innerText=itext;
    if(dom.scrollWidth <= dom.clientWidth)
        dom.style.borderRight = null;
    else
        dom.style.borderRight = '1px solid #cccccc';
    if('ontouchend' in window)
    {
        var longtime = null;
        dom.addEventListener("touchstart",function(ev){
            if(ev.target.getAttribute('_canadjust') != 1)
                return;
            longtime = setTimeout(function(){
                var index = 0;
                for (var i = 0; i < trs.length; i++)
                {
                    if(trs[i] == ev.target)
                    {
                        index = i;
                        break;
                    }
                }
                var sheet = style.sheet || style.styleSheet || {};
                var rules = sheet.cssRules || sheet.rules;
                var opstyle = null;
                for (var i = 0; i < rules.length; i++)
                {
                    var item = rules[i];
                    if(item.selectorText !== (domname+" tr > td:nth-child("+(index+1)+") > div"))
                        continue;
                    opstyle = item;
                    break;
                }
                if(opstyle == null)
                {
                    var i = 0;
                    if("insertRule" in sheet)
                        i = sheet.insertRule(domname+" tr > td:nth-child("+(index+1)+") > div{}", 0);
                    else if("addRule" in sheet)
                        i = sheet.addRule(domname+" tr > td:nth-child("+(index+1)+") > div", "");
                    opstyle = rules[i];
                }
                if(ev.touches[0].clientX-ev.target.offsetLeft+dom.scrollLeft > (ev.target.clientWidth>>1))
                    opstyle.style.width = parseInt(ev.target.clientWidth*1.2)+"px";
                else
                    opstyle.style.width = parseInt(ev.target.clientWidth*0.8)+"px";
                
                var wids = [];
                for (var i = 0; i < rules.length; i++)
                {
                    var tmpstr = rules[i].selectorText.substr(rules[i].selectorText.indexOf('nth-child(')+10);
                    wids[parseInt(tmpstr.substr(0,tmpstr.indexOf(')')))-1] = rules[i].style.width;
                }
                var csstxt = '';
                for (var i = 0; i < trs.length; i++)
                {
                    csstxt += ',';
                    if(wids[i])
                        csstxt += wids[i];
                }
                localStorage.setItem(pathname, csstxt.substr(1));
                
            },1000);
        });
        dom.addEventListener("touchmove",function(ev){
            clearTimeout(longtime);
        });
        dom.addEventListener("touchend",function(ev){
            clearTimeout(longtime);
        });
    }
    else
    {
        var dodrag = null;
        document.addEventListener("mousedown",function(ev){
            if(dodrag == null)
                return;
            if(ev.target.getAttribute('_canadjust') != 1)
                return;
            var index = 0;
            for (var i = 0; i < trs.length; i++)
            {
                if(trs[i] == dodrag)
                {
                    index = i;
                    break;
                }
            }
            var sheet = style.sheet || style.styleSheet || {};
            var rules = sheet.cssRules || sheet.rules;
            dodrag.opstyle = null;
            for (var i = 0; i < rules.length; i++)
            {
                var item = rules[i];
                if(item.selectorText !== (domname+" tr > td:nth-child("+(index+1)+") > div"))
                    continue;
                dodrag.opstyle = item;
                break;
            }
            if(dodrag.opstyle == null)
            {
                var i = 0;
                if("insertRule" in sheet)
                    i = sheet.insertRule(domname+" tr > td:nth-child("+(index+1)+") > div{}", 0);
                else if("addRule" in sheet)
                    i = sheet.addRule(domname+" tr > td:nth-child("+(index+1)+") > div", "");
                dodrag.opstyle = rules[i];
            }
            dodrag.mouseDown = true;
        });
        document.addEventListener("mouseup",function(ev){
            if(dodrag == null)
                return;
            if(ev.target.getAttribute('_canadjust') != 1)
                return;
            dodrag.mouseDown = false;
            dodrag = null;
            var sheet = style.sheet || style.styleSheet || {};
            var rules = sheet.cssRules || sheet.rules;
            var wids = [];
            for (var i = 0; i < rules.length; i++)
            {
                var tmpstr = rules[i].selectorText.substr(rules[i].selectorText.indexOf('nth-child(')+10);
                wids[parseInt(tmpstr.substr(0,tmpstr.indexOf(')')))-1] = rules[i].style.width;
            }
            var csstxt = '';
            for (var i = 0; i < trs.length; i++)
            {
                csstxt += ',';
                if(wids[i])
                    csstxt += wids[i];
            }
            localStorage.setItem(pathname, csstxt.substr(1));
        });
        document.addEventListener("mousemove",function(ev){
            if(dodrag != null && dodrag.mouseDown)
            {
                var e = ev||event;
                dodrag.opstyle.style.width = (e.clientX-dodrag.getBoundingClientRect().left) + "px";
                if(dom.scrollWidth <= dom.clientWidth)
                    dom.style.borderRight = null;
                else
                    dom.style.borderRight = '1px solid #cccccc';
                return;
            }
            if(ev.target.getAttribute('_canadjust') == 1)
            {
                if(ev.target.clientWidth-ev.offsetX<5)
                {
                    dodrag = ev.target;
                    ev.target.style.cursor='col-resize';
                }
                else
                {
                    if(dodrag != null)
                        dodrag.style.cursor=null;
                    dodrag = null;
                    if(ev.offsetX<5)
                    {
                        dodrag = ev.target.previousElementSibling;
                        if(dodrag != null)
                            ev.target.style.cursor='col-resize';
                    }
                    else
                    {
                        ev.target.style.cursor=null;
                    }
                }
            }
        });
    }
}
function ciy_table_tree(domname){
    $(domname).on("click",'div[data-treeid]',function(ev){
        $(ev.currentTarget).toggleClass('ciy-tree-spread');
        var id = $(ev.currentTarget).attr('data-treeid');
        var min=9999,max=0;
        $('tr[data-upid='+id+']').each(function(e){
            var index = $(domname+" tr").index(this);
            if(min>index)
                min = index;
            if(max<index)
                max = index;
        });
        var open = false;
        if($(ev.currentTarget).hasClass('ciy-tree-spread'))
            open = true;
        for(var i=min;i<=max;i++)
        {
            if(open)
            {
                $(domname+" tr").eq(i).show();
                $(domname+" tr").eq(i).find('[data-treeid]').addClass('ciy-tree-spread');
            }
            else
            {
                $(domname+" tr").eq(i).hide();
                $(domname+" tr").eq(i).find('[data-treeid]').removeClass('ciy-tree-spread');
            }
        }
    });
}
function ciy_table_popmenu(dom,menudom,modifymenufunc){
    if('ontouchend' in window)
    {
        var longtime = null;
        $(dom).on("touchstart",'[data-id]',function(ev){
            if($(menudom).css('display') != 'none')
                return $(menudom).hide(200);
            longtime = setTimeout(function(){
                $('[data-id]',dom).removeClass('selected');
                $(ev.currentTarget).addClass('selected');
                $(menudom).attr('data-selectid',$(ev.currentTarget).attr('data-id'));
                var touch = ev.originalEvent.touches[0];
                if(typeof(modifymenufunc) == 'function')//根据选择项，动态调整菜单用
                    modifymenufunc(ev);
                $(menudom).css('position','fixed').css('left',touch.clientX).css('top',touch.clientY).show();
            },200);
        });
        $(dom).on("touchmove",function(ev){
            clearTimeout(longtime);
        });
        $(dom).on("touchend",function(ev){
            clearTimeout(longtime);
        });
    }
    else
    {
        $(dom).on("contextmenu",'[data-id]',function(ev){
            $('[data-id]',dom).removeClass('selected');
            $(ev.currentTarget).addClass('selected');
            $(menudom).attr('data-selectid',$(ev.currentTarget).attr('data-id'));
            if(typeof(modifymenufunc) == 'function')//根据选择项，动态调整菜单用
                modifymenufunc(ev);
            $(menudom).css('position','fixed').css('left',ev.clientX).css('top',ev.clientY).show();
            $(document).one("click", function(){
                $(menudom).hide();
            });
            return false;
        });
    }
}
function ciy_select_init(dom){
    $(dom).on("click",'[data-id]',function(ev){
        $(ev.currentTarget).toggleClass('selected');
    });
}
function ciy_select_all(dom){
    $('[data-id]',dom).each(function () {
        $(this).addClass("selected");
    });
}
function ciy_select_diff(dom){
    $('[data-id]',dom).each(function () {
        $(this).toggleClass("selected");
    });
}
function ciy_select_act(dom,funcname,confirmmsg,postparam,successfunc){
    if(typeof(postparam) != 'object')
        postparam = {};
    var array = new Array();
    $('[data-id]',dom).each(function () {
        if ($(this).hasClass("selected"))
            array.push($(this).attr("data-id"));
    })
    postparam.ids = array.join(",");
    if(postparam.ids == "")
        return ciy_toast("请至少选择一条信息");
    if(confirmmsg !== undefined)
    {
        ciy_alert(confirmmsg,function(btn){
            if(btn == "继续")
            {
                callfunc(funcname,postparam,function(json){
                    if(typeof(successfunc) === "function")
                        successfunc();
                    else
                        location.reload();
                });
            }
        },{btns:["继续","取消"]});
    }
    else
    {
        callfunc(funcname,postparam,function(json){
            if(typeof(successfunc) === "function")
                successfunc();
            else
                location.reload();
        });
    }
}
function ciy_alert(content, cb, option){
    if(window.parent != window)
        return window.parent.ciy_alert(content, cb, option);
    if(typeof(content) == 'object')
    {
        option = content;
        content = option.content||"";
        cb = option.cb;
    }
    option = option||{};
    var htmldom = '<div class="ciy-layer ciy-dialog" style="z-index: 2000;">';
    if(option.notitle !== true)
    {
        option.title = option.title||"温馨提示";
        htmldom += '<div class="title">'+option.title+'</div>';
        htmldom += '<a class="close"><svg t="1526719117410" style="width:1em;height:1em;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><style/></defs><path d="M1024 91.093333L932.906667 0 512 420.906667 91.093333 0 0 91.093333 420.906667 512 0 932.906667 91.093333 1024 512 603.093333 932.906667 1024 1024 932.906667 603.093333 512 1024 91.093333z" fill="" p-id="1147"></path></svg></a>';
    }
    
    if(option.frame !== undefined)
    {
        htmldom += '<iframe src="'+option.frame+'"';
        if(option.contentstyle !== undefined)
            htmldom += ' style="'+option.contentstyle+'"';
        htmldom += ' frameborder="0"></iframe>';
    }
    else
    {
        htmldom += '<div class="content"';
        if(option.contentstyle !== undefined)
            htmldom += ' style="'+option.contentstyle+'"';
        htmldom += '>'+content+'</div>';
    }
    if(option.nobutton !== true)
    {
        option.btns = option.btns||["确定"];
        if(!$.isArray(option.btns))
            option.btns = ["确定"];
        var btn = '';
        for(var i=0; i<option.btns.length; i++)
        {
            if(option.btns[i][0] != '<')
                btn+="<a class='btn'>"+option.btns[i]+"</a>";
            else
                btn += option.btns[i];
        }
        htmldom += '<div class="buttons">'+btn+'</div>';
    }
    htmldom += '</div>';
    htmldom = $(htmldom);
    var domifm = $("iframe",htmldom);
    if(domifm.length > 0)
    {
        $(domifm).load(function(e){
            e.target.contentWindow.alertautoheight = function(height){
                var bodyheight = document.body.scrollHeight;
                if(bodyheight == 0)
                    bodyheight = document.documentElement.scrollHeight;
                if(bodyheight == 0)
                    return;
                height += 18;
                if(height>bodyheight - e.target.offsetTop - 60)
                    height = bodyheight - e.target.offsetTop - 60;
                domifm.css("height",height+"px");
            };
            e.target.contentWindow.alertcb = function(isclose,btn,data){
                if(isclose)
                    alertclose();
                if(typeof(cb) == 'function')
                    return cb(btn,data);
            };
        });
        
    }
    htmldom.on('click','.btn',function(){
        var btntit = this.textContent;
        var inputs = _ciy_getform_dom(htmldom[0]);
        alertclose();
        if(typeof(cb) == 'function')
            cb(btntit,inputs);
    });
    htmldom.on('click','.close',function(){
        alertclose();
    });
    
    $('.ciy-mask').css('opacity',0.2).show();
    if(option.nomaskclose !== true)
    {
        $('.ciy-mask').on('click',function(){
            alertclose();
        });
    }
    $('body').append(htmldom);
    if(option.max === true)
    {
        htmldom.find('.content').outerWidth(window.innerWidth);
        var hei = window.innerHeight;
        if(option.notitle !== true)
            hei-=getint(htmldom.find('.title').outerHeight());
        if(option.nobutton !== true)
            hei-=getint(htmldom.find('.buttons').outerHeight());
        htmldom.find('.content').outerHeight(hei);
        $('body').css('overflow','hidden');
    }
    else
    {
        if(option.align === 'right')
            htmldom.css('left',window.innerWidth-htmldom.outerWidth()-15);
        else if(option.align === 'left')
            htmldom.css('left',15);
        else
        	htmldom.css('left',(window.innerWidth-htmldom.outerWidth())/2);
        if(window.innerHeight>htmldom.height())
            htmldom.css('top',(window.innerHeight-htmldom.outerHeight())/3);
        else
        {
            htmldom.css('top',0);
            htmldom.find('.content').outerHeight(window.innerHeight - getint(htmldom.find('.buttons').outerHeight()) - getint(htmldom.find('.title').outerHeight()));
        }
        //增加拖动效果
        if(option.notitle === true)
            return;
        if('ontouchstart' in window)
            return;
        var dodrag = null;
        htmldom.on('mousedown','.title',function(ev){
            dodrag = {};
            dodrag.offsetX = ev.offsetX;
            dodrag.offsetY = ev.offsetY;
            setTimeout(function(){htmldom.fadeTo(200,0.8);},100);
            $(document).on('mouseup',function(){
                dodrag = null;
                htmldom.fadeTo(200,1);
                htmldom.off('mouseup');
                htmldom.off('mousemove');
            }).on('mousemove',function(ev){
                if(dodrag == null)
                    return;
                htmldom.css({'left': ev.pageX - dodrag.offsetX,'top': ev.pageY - dodrag.offsetY});
            });
        });
    }
    function alertclose()
    {
        $('.ciy-mask').off('click').hide();
        if(option.max === true)
            $('body').css('overflow','');
        
        var domifm = $("iframe",htmldom);
        if(domifm.length > 0)
        {
            domifm[0].src = 'about:blank';
            domifm[0].contentWindow.close();
        }
        htmldom.remove();
    }
    return false;
}
function ciy_alertclose(){
    if(window.parent != window)
        return window.parent.ciy_alertclose();
    $('.ciy-dialog>.close').trigger('click');
}
function ciy_alertautoheight(){
    var sitime = setInterval(function(){
       if(!window.alertautoheight)
           return;
       clearInterval(sitime);
       window.alertautoheight(document.body.clientHeight);
   },100);
}
function ciy_toast(content, option){
    if(window.parent != window)
        return window.parent.ciy_toast(content, option);
    if(option === undefined) option = {};
    var icon = '';
    if(option.icon === 1)
    {
        icon += '<svg class="whirl" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">';
        icon += '<path opacity="0.7" fill="#ffffff" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946 s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634 c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>';
        icon += '<path fill="#ffffff" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z"></path>';
        icon += '</svg>';
    }
    if(option.icon === 2)
    {
        icon += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">';
        icon += '<path fill="#ffffff" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z">';
        icon += '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>';
        icon += '</path>';
        icon += '</svg>';
    }
    if(option.icon === 3)
    {
        icon += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">';
        icon += '<path fill="#ffffff" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">';
        icon += '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>';
        icon += '</path>';
        icon += '</svg>';
    }
    if(option.icon === 4)
    {
        icon += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" enable-background="new 0 0 40 40" xml:space="preserve">';
        icon += '<rect x="0" y="13" width="4" height="5" fill="#ffffff"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect>';
        icon += '<rect x="10" y="13" width="4" height="5" fill="#ffffff"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect>';
        icon += '<rect x="20" y="13" width="4" height="5" fill="#ffffff"><animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect>';
        icon += '</svg>';
    }
    if(option.icon === 5)
    {
        icon += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" enable-background="new 0 0 40 40" xml:space="preserve">';
        icon += '<rect x="0" y="10" width="4" height="10" fill="#ffffff" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" /></rect>';
        icon += '<rect x="8" y="10" width="4" height="10" fill="#ffffff" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" /></rect>';
        icon += '<rect x="16" y="10" width="4" height="10" fill="#ffffff" opacity="0.2"><animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /><animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" /></rect>';
        icon += '</svg>';
    }
    var htmldom = '<div class="ciy-layer ciy-toast" style="z-index: 2001;">'+icon+content+'</div>';
    htmldom = $(htmldom);
    $('.ciy-mask').css('opacity',0.1).show();
    if(option.nomaskclose !== true)
    {
        $('.ciy-mask').on('click',function(){
            ciy_toastclose();
        });
    }
    if(!option.timeout)
        option.timeout = 1000;
    setTimeout(function(){
        ciy_toastclose();
        if(typeof(option.done) == 'function')
            option.done();
    },option.timeout);
    $('body').append(htmldom);
    var iw = window.innerWidth, ih = window.innerHeight;
    htmldom.css('left',(iw-htmldom.outerWidth())/2);
    htmldom.css('top',(ih-htmldom.outerHeight())/3);
    return false;
}
function ciy_toastclose(){
    if(window.parent != window)
        return window.parent.ciy_toastclose();
    $('.ciy-mask').off('click').hide();
    $('.ciy-toast').remove();
}
function ciy_loading(){
    if(window.parent != window)
        return window.parent.ciy_loading();
    var htmldom = '<div class="ciy-layer ciy-loading" style="z-index: 2001;"></div>';
    htmldom = $(htmldom);
    $('body').append(htmldom);
    setTimeout(function(){htmldom.addClass("start")},50);
}
function ciy_loadclose(cls){
    if(window.parent != window)
        return window.parent.ciy_loadclose(cls);
    $('.ciy-loading').addClass(cls);
    setTimeout(function(){$('.ciy-loading').remove();},600);
    //
}
function ciy_menu(dom){
    if('ontouchend' in window)
    {
        $(dom).on("click",function(ev){
            var that = $(this);
            if(that.hasClass('show'))
                $(dom).removeClass('show');
            else
            {
                $(dom).removeClass('show');
                that.addClass('show');
                var top = $(this).offset().top-$(document).scrollTop();
                var left = $(this).offset().left-$(document).scrollLeft();
                if($(document).width() < left + $('ul',this).outerWidth())
                    left = left-$('ul',this).outerWidth()+$(this).outerWidth();
                if(window.screen.availHeight-document.body.scrollTop-100 < top + $('ul',this).outerHeight())
                    top = top - $('ul',this).outerHeight();
                else
                    top += $(this).outerHeight();
                $('ul',this).css('position','fixed').css('left',left+'px').css('top',top+'px');
            }
        });
    }
    else
    {
        $(dom).on("mouseenter",function(ev){
            $(dom).removeClass('show');
            $(this).addClass('show');
            var top = $(this).offset().top-$(document).scrollTop();
            var left = $(this).offset().left-$(document).scrollLeft();
            if($(document).width() < left + $('ul',this).outerWidth())
                left = left-$('ul',this).outerWidth()+$(this).outerWidth();
            if(window.screen.availHeight-document.body.scrollTop-100 < top + $('ul',this).outerHeight())
                top = top - $('ul',this).outerHeight();
            else
                top += $(this).outerHeight();
            $('ul',this).css('position','fixed').css('left',left+'px').css('top',top+'px');
        });
        $(dom).on("mouseleave",function(ev){
            $(dom).removeClass('show');
        });
    }
}
function ciy_menu_navmask(cites){
	if(cites == 'all')
		return $(".ciy-menu-nav>li").show(500);
	var cs = cites.split(',');
	$(".ciy-menu-nav cite").each(function(i,n) {
		if(cs.indexOf(n.textContent.trim())>-1)
			$(n).parents('li').slideDown(500);
		else
			$(n).parents('li').slideUp(500);
	});
    $(".ciy-nav-bar").css('top','4em');
}
function ciy_tab(afterfunc){
    $(".ciy-tab>ul>li").on("click",function(ev){
        var tab = $(this).parents('.ciy-tab');
        $(this).siblings(".active").removeClass('active');
        $(this).addClass('active');
        var index = $(this).prevAll().length;
        tab.children('div').children('div').removeClass('active');
        tab.children('div').children('div').eq(index).addClass('active');
        if(typeof(afterfunc) == 'function')
            afterfunc(index,this);
    });
    $(".ciy-tab>ul").each(function(){
        var uldom = $(this);
        if(uldom.children('li.active').length == 0)
            uldom.children('li:first').addClass('active');
        uldom.children('li').each(function(){
            if($(this).hasClass("active"))
                $(this).trigger('click');
            if(this.offsetTop>2)
                uldom.css('height','6.1em');
            if(this.offsetTop>45)
                uldom.css('height','9.1em');
        });
    });
}
function ciy_cookie(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '/';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = '';
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
function getint(val, defval) {
    if(defval == undefined)
        defval = 0;
    var ret = parseInt(val);
    if(isNaN(ret))
        return defval;
    else if(ret == undefined)
        return defval;
    else
        return ret;
}
function getfloat(val, defval) {
    var ret = parseFloat(val);
    if(isNaN(ret))
        return defval;
    else
        return ret;
}
function fixint(num, length) {
  if ((num + "").length>length)
    return num;
  return (Array(length).join('0') + num).slice(-length);
}
function ciy_formatspantime(dt,bestr){
    if(bestr == undefined)
        bestr = "";
    var diff = (new Date() - new Date(dt));
    diff = parseInt(diff/1000);
    if(diff < 10)//10秒以内
        return "刚刚";
    if(diff < 60)//60秒以内
        return diff +"秒" + bestr;
    if(diff < 3600)//60分以内
        return parseInt(diff/60) +"分" + bestr;
    if(diff < 86400)//24小时以内
        return parseInt(diff/3600) +"小时";
    if(diff < 2592000)//30天以内
        return parseInt(diff/86400) +"天" + bestr;
    if(diff < 31536000)//12月以内
        return parseInt(diff/2592000) +"月" + bestr;
    return parseInt(diff/31536000) +"年" + bestr;
}
function ciy_formatdatetime(time,format){
	var t;
	if (time == -1)
		t = new Date();
	else if (/^\d+$/.test(time)) {
		if (time == 0)
			return '--';
		t = new Date(time * 1000);
	} else {
		t = new Date(time.replace(/\-/g, '/'));
	}
	if (isNaN(t.getTime()))
		return 'ERR';
	if(!format)
		format = 'Y-m-d H:i';
	var ret = format;
	ret = ret.replace('yyyy', t.getFullYear()).replace('Y', t.getFullYear());
	ret = ret.replace('y', (t.getFullYear() + "").substr(2));
	ret = ret.replace('m', fixint(t.getMonth() + 1, 2));
	ret = ret.replace('n', t.getMonth() + 1);
	ret = ret.replace('d', fixint(t.getDate(), 2));
	ret = ret.replace('j', t.getDate());
	ret = ret.replace('H', fixint(t.getHours(), 2));
	ret = ret.replace('G', t.getHours());
	ret = ret.replace('h', fixint(t.getHours() % 12, 2));
	ret = ret.replace('g', t.getHours() % 12);
	ret = ret.replace('i', fixint(t.getMinutes(), 2));
	ret = ret.replace('sss', fixint(t.getMilliseconds(), 3));
	ret = ret.replace('s', fixint(t.getSeconds(), 2));
	if (t.getHours() < 12)
		ret = ret.replace('A', 'AM').replace('a', 'am');
	else
		ret = ret.replace('A', 'PM').replace('a', 'pm');
	ret = ret.replace('w', t.getDay());
	return ret;
}
function ciy_getstrparam(str,split){
    var strs = str.split(split);
    var ret = new Array();
    for(var i in strs)
    {
        var ind = strs[i].indexOf('=');
        if(ind == -1)
            continue;
        ret[strs[i].substr(0,ind)] = strs[i].substr(ind+1);
    }
    return ret;
}
function ciy_formhtml(sp,datas){
    var ret = '';
    ret += '<div class="form-group"';
    if(sp.check)
        ret += ' data-check="'+sp.check+'"';
    if(sp.checkmsg)
        ret += ' data-checkmsg="'+sp.checkmsg+'"';
    ret += '><label>'+sp.title+'</label><div>';
    var val;
    if(datas)
        val = datas[sp.name];
    if(val === undefined)
        val = sp.defvalue||'';
    var prop = '';
    if(sp.prop)
    	prop = ' '+sp.prop;
    if(sp.type == 'input')
        ret += '<input type="text" name="'+sp.name+'" value="'+val+'"'+prop+'/>';
    else if(sp.type == 'textarea')
    {
        ret += '<textarea name="'+sp.name+'"'+prop+'>'+val+'</textarea>';
    }
    else if(sp.type == 'select')
    {
        ret += '<select name="'+sp.name+'"'+prop+'>';
        var vals = sp.value.split(',');
        var valcodes = (sp.code||'').split(',');
        if(vals.length != valcodes.length)
            valcodes = vals;
        for(var i in vals)
        {
            ret += '<option value="'+valcodes[i]+'"';
            if(val == valcodes[i])
                ret += ' selected="true"';
            ret += '>'+vals[i]+'</option>';
        }
        ret += '</select>';
    }
    else if(sp.type == 'radio')
    {
        var vals = sp.value.split(',');
        var valcodes = (sp.code||'').split(',');
        if(vals.length != valcodes.length)
            valcodes = vals;
        for(var i in vals)
        {
            ret += '<label class="formi"><input type="radio" name="'+sp.name+'" value="'+valcodes[i]+'"';
            if(val == valcodes[i])
                ret += ' checked="checked"';
            ret += prop+'/><i></i>'+vals[i]+'</label>';
        }
    }
    else if(sp.type == 'checkbox')
    {
        var vals = sp.value.split(',');
        var valcodes = (sp.code||'').split(',');
        if(vals.length != valcodes.length)
            valcodes = vals;
        var valns = val.split(',');
        for(var i in vals)
        {
            ret += '<label class="formi"><input type="checkbox" name="'+sp.name+'" value="'+valcodes[i]+'"';
            if($.inArray(valcodes[i], valns) > -1)
                ret += ' checked="checked"';
            ret += prop+'/><i></i>'+vals[i]+'</label>';
        }
    }
    else
    {
        ret += 'No FormData,'+sp.type;
    }
    if(sp.behind)
        ret += sp.behind;
    if(sp.tip)
        ret += '<code>'+sp.tip+'</code>';
    ret += '</div></div>';
    return ret;
}
