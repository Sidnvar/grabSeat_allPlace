// https://superapp.kiwa-tech.com/app/submitQueue  预定接口
/**
 *  customerId: "1-24822724027"
    openId: "oKNukjsbEwf9DQquOCisTsfsFILE"
    peopleNum: 4
    storeId: "091401"
    storeName: "5050购物中心店"
    title: "1"
    _HAIDILAO_APP_TOKEN: "TOKEN_APP_4323b5f4-e7a8-46c6-86b8-4206c5fdcc61"
*/

// https://superapp.kiwa-tech.com/app/getMarket 获取店铺排队参数
/**
 *  customerId: "1-24822724027"
    storeId: "091401"
    _HAIDILAO_APP_TOKEN: "TOKEN_APP_4323b5f4-e7a8-46c6-86b8-4206c5fdcc61"
 */

 /**
  * code: "ok"
    data: {topSign: 1, marketType: 1, storeId: "091401", noonMarket: "08:00-16:00", evenMarket: "16:00-23:00",…}
        crossMarket: 1
        evenMarket: "16:00-23:00"
        marketType: 1
        nightMarket: "23:00-次日08:00"
        noonMarket: "08:00-16:00"
        storeId: "091401"
        topSign: 1
    success: true
  */
 /**
  * create by chb 2018-10-23
  * 即将迎来失业的日子
  * 不如来一顿海底捞庆祝
  * 前端程序员
  * 工作联系 405128254@qq.com
  */

(function(){     
    
    var _cache = {
        'customerId': '1-24822724027',
        '_HAIDILAO_APP_TOKEN': ''
    }

    // 公共
    var _common = {
        // 获取url参数
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        },
        // 获取cookie参数
        getCookie: function(name){
            var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)"); 
            return (arr=document.cookie.match(reg))?unescape(arr[2]):null;
        },
        // 删除cookie
        delCookie(name){
            // debugger
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval=this.getCookie(name);
            if(cval!=null)
            document.cookie= name + "="+cval+";expires="+exp.toGMTString();
        },
        // 写入cookie
		setCookie(name, value) {
			document.cookie = name + "=" + encodeURIComponent(value) + ";path=/;"
			return true;
        },
        // 获取localStroge参数
        getStroge: function(name){
            var storage=window.localStorage;
            return storage[name]
        },
        // 写入localStroge参数
        writeStroge: function(name, data){
            storage[name] = data
        },
        resetCookies: function(name, value){
            this.delCookie(name)
            this.setCookie(name, value)
        }
    }

    // 登录
    var _login = {
        formData: {
            country: "CN",
            customerId: '',
            type: 1,
            uid: ""
        },
        // 构建参数
        createData: function(cb){
            var _self = this;

             this.getUid().then(function(uid){
                debugger
                var formData = {
                    country: "CN",
                    customerId: _cache['customerId'],
                    type: 1,
                    uid: uid
                }

                cb(formData)
            })



        },
        // 登录
        toLoign: function(cb){
            // console.log('登录中...')
            var _self = this;

            var _ajax = function (formData, callBack){
                $.ajax({
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(formData),
                    type: 'POST',
                    url: 'https://superapp.kiwa-tech.com/login/thirdLogin',
                    success: function(data){

                        _cache['customerId'] = data.data.id;
                        _cache['_HAIDILAO_APP_TOKEN'] = data.data.token;
                        
                        if(callBack){
                            callBack();
                        }else{
                            _layer.writeLog('<span style="color:green;font-size:24px;position: fixed; top: 5px; z-index: 999;">当前用户:' + data.data.pnpName + '(手机号:' + data.data.mobile + ')</span>')
                        }

                        // _common.writeStroge['customerId'] = data.data.id;
                        // _common.writeStroge['_HAIDILAO_APP_TOKEN'] = data.data.token;
                        
                        // _grab.main();
                        _common.resetCookies('_HAIDILAO_APP_TOKEN', _cache['_HAIDILAO_APP_TOKEN'])
                    },
                    error: function(){
                        _layer.writeLog('登录失败，还是别吃了吧！')
                    }
                })
            }

            if(this.formData.customerId == ''){
                return this.createData(_ajax)
            }

            return _ajax(this.formData, cb);
        },
        // 获取Uid
        getUid: function(){
            var uidData = {
                customerId: _cache['customerId'],
                openid: _common.getUrlParam('weixin_user_id')
            }
            
            return new Promise(function(resolve, reject){
                debugger
                $.ajax({
                    dataType: "json",
                    contentType: "application/json;",
                    data: JSON.stringify(uidData),
                    type: 'POST',
                    url:"https://superapp.kiwa-tech.com/app/getUnionId",
                    success: function(data){
                        debugger
                        resolve(data.data.unionid)
                    },
                    error: function(data, error){
                        debugger
                    }
                })
            })

        }
    }

    // 排队
    var _grab = {
        count: 0,
        error: 0,
        formData:{
            customerId: '',
            openId: '',
            peopleNum: 0, // 就餐人数
            storeId: "",
            storeName: "",
            title: "", // 1 中午 2 晚上
            _HAIDILAO_APP_TOKEN: ''
        },
        isAuto: false,
        setTimeoutFun: '',
        // 构建参数
        createData: function(){
            var _msg = $('.notice').data()

            this.formData = {
                customerId: _cache['customerId'],
                openId: _common.getUrlParam('weixin_user_id'),
                peopleNum: _layer.formData.peopleNum, // 就餐人数
                // storeId: "091401",
                // storeName: "5050购物中心店",
                storeName: _msg.name,
                storeId: _msg.id,
                title: _layer.formData.title, // 1 中午 2 晚上
                _HAIDILAO_APP_TOKEN: _cache['_HAIDILAO_APP_TOKEN']
            }
        },
        // 排队主函数
        main: function(){
            if(this.isAuto == true){
                _layer.writeLog('自动抢号正在运行，想要停止请刷新页面');
                return false
            }

            this.isAuto == true;
            // console.log('即将抢号...')
            _layer.writeLog('即将抢号...当前第' + (this.count + 1) + '次');
            var _self = this;
        
            this.createData()
            // return console.log(_self.formData)
            // if(this.formData.openId == ''){
            //     this.createData()
            // }

            _common.resetCookies('_HAIDILAO_APP_TOKEN', _cache['_HAIDILAO_APP_TOKEN'])

            $.ajax({
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(_self.formData),
                type: 'POST',
                url: 'https://superapp.kiwa-tech.com/app/submitQueue',
                success: function(data){
                    _self.callBack(data)
                },
                error: function(err){
                    _self.isAuto == false;

                    var data = err.responseJSON;

                    if(data.msg == '无效请求,请重新登录!'){
                        _layer.writeLog('登录超时，正在重新登录...')
                        _login.toLoign();
                    }else{
                        _layer.writeLog('出问题了，还是别吃了吧！')
                    }          
                }
            })
        },
        // 成功回调
        callBack: function(data){
            this.count++;

            if(data.success == false){
                if(data.msg == '该手机号在当前市别已排号，请等待就餐'){
                    _layer.writeLog('<span style="color:red;font-size:24px">该手机号在当前市别已排号，请等待就餐</span>')

                    if(this.error++ > 10){
                        return false
                    }
                }

                if(this.count > 999){
                    // console.log('超出50次，自动关闭')
                    _grab.isAuto = false;
                    _layer.writeLog(data.msg)
                    _layer.writeLog('<span style="color:red">超出1000次都未抢到号，脚本自动关闭...如果继续请手动抢号！</span>')
                    // return alert('您好！该市别还未开始发号哦，或者就根本抢不到，干脆别吃了吧！')
                    return false
                }

                this.main()
                
             }else{
                //  alert('应该成功了，到公众微信号看看？')
                // console.log('抢号成功') 
                _grab.isAuto = false;
                _layer.writeLog('<span style="color:green;font-size:24px">抢号成功...座位号' + data.data.queueNum + '</span>')
                _layer.writeLog('<a href="https://superapp.kiwa-tech.com/weexWeb/index.html?page=num-detail.web.js&moduleId=row-num&orderId=' + data.data.orderId + '&isRowSuccess=1">排位详情</a>或者请到公众号查看')
             }
        },
        // 判断是不是排队页面
        isGrab: function(){
            return _common.getUrlParam('page') == 'stores-numeral.web.js'
        },
        // 检查是否到时间
        inspect: function(){
            // debugger
            var _self = this
            var _time = 57 - _date.now().s
            var _s = _time >= 0 ? _time : (_date.now().s + 1)
            var _timeOut = _s == 0 ? 60 : _s;
            // console.log(_timeOut)
            _self.setTimeoutFun = setTimeout(function(){
                                    var msg = _date.isGrabTime();

                                    if(msg){
                                        _layer.writeLog(msg)

                                        if(msg == '还没到点呢...'){
                                            _self.inspect();
                                        }
                                    }else{
                                        _layer.writeLog('到点了，开始抢号！')
                                        _grab.main();
                                    }

                                    // if(_date.isGrabTime()){
                                    //     // console.log('开始抢号...')
                                    //     // _grab.getRowNumber();
                                    //     _layer.writeLog('到点了，开始抢号！')
                                    //     _grab.main();
                                    // }else{
                                    //     // console.log('还没到点')
                                    //     _layer.writeLog('还没到点呢...')
                                    //     _self.inspect();
                                    // }
                                },  _timeOut * 1000);
        },
        // 获取排队信息，由于海底捞接口不是实时更新，作废
        getRowNumber: function(){
            if(this.formData.openId == ''){
                this.createData()
            }

            var _self = this
            var formData = {
                customerId: this.formData.customerId,
                storeId: this.formData.storeId
            }

            var waitNum = '65'

            $.ajax({
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(_self.formData),
                type: 'POST',
                url: 'https://superapp.kiwa-tech.com/app/getStoreById',
                success: function(data){
                    if(data.data.rowNumber[0].waitNum >= (waitNum - 20)){
                        console.log('接近目标座位号:' + waitNum)
                        _grab.main();
                    }else{
                        console.log('当前座位号:' + data.data.rowNumber[0].waitNum )
                        _self.getRowNumber()
                    }
                }
            })
        },
        getStore: function(){
            
            var city = $('input[name=city]').val()
            var formData = {
                country: 'CN',
                customerId: _cache['customerId'],
                _HAIDILAO_APP_TOKEN: _cache['_HAIDILAO_APP_TOKEN']
            }

            var returnResult = function(data){
                var len = data.length
                var html = ``
                for(var i = 0; i < len; i++){
                    if(data[i]['address'].indexOf(city) != -1){
                        html += `<li><label><input type="radio" name="storefront" data-id="${data[i].storeId}" data-name="${data[i].storeName}" data-address="${data[i].address}"/><span class="storeName1">${data[i].storeName}</span>(${data[i].address})</label></li>`
                    }
                }
                
                $('#storefront_list').html(html)
            }

            var saveMsgEvent = function(){
                $('input[name="storefront"]').click(function(){
                    var _msg = $(this).data();
                    
                    sessionStorage.storeId = _msg.id
                    sessionStorage.storeName = _msg.name
                    sessionStorage.storeAddress = _msg.address

                    _layer.setNotice()
                });
            }

            $.ajax({
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(formData),
                type: 'POST',
                url: 'https://superapp.kiwa-tech.com/app/getNearbyStore',
                success: function(data){
                    returnResult(data.data)
                    saveMsgEvent()
                }
            })
        },

        cancle: function(){
            var _self = this

            clearTimeout(_self.setTimeoutFun)
        }
    }

    // 弹出层
    var _layer = {
        formData:{
            title: 1,
            peopleNum: 0
        },
        style: '.box-top, .box-body{    top: 40px;}.NumeralBox.weex-ct.weex-div.weex-root{display: none;}.notice{background: #f8f8f8; font-size: 16px; padding: 10px; position: fixed; top: 0px; width: 100%; height: 20px; z-index: 999;}.grab-box{background:rgba(255,255,255,.8);position:absolute;z-index:999;top:0;left:0;width:100%;height:100%;}.box-top{font-size:40px;padding:20px;box-sizing:border-box;position:fixed;width:800px;background:rgba(255,255,255,1);z-index:100;border-right: 1px solid #ccc;height: 100%;}.box-top > label{display:inline-block;}.box-top > label > input,.address-bar > input{font-size:40px;border:1px solid rgb(166,166,166);width:112.5px;text-align:center;}.box-bar{display:inline-block;}.box-btn{margin:0;font-size:30px;border-radius:5px;display:inline-block;position:relative;top:-4px;margin:0 7.5px;outline:none;}.box-btn.red,.e_time.checked{background-color:#d43d3d;color:white;}.box-body{position:absolute;left:800px;height: 100%;}.log > p{padding:0;margin:0;color:#999;font-size:16px;padding:2px 10px;}select{font-size:40px;}.fr{float:right;}.clear{clear:both;}.address-bar > ul{padding:0;}.address-bar > ul > li{list-style:none;font-size:16px;}',
        mask: `<div class="grab-box">
                    <div class="notice">当前门店：5050购物中心店</div>
                    <div class="box-top">
                        <label>APP_Token：<input id="token" name="token"/></label>
                        <label>人数：<input id="e_num" name="peopleNum" /></label>
                        <label>时间：<select id="e_time"><option value="1">午市</option><option value="2">晚市</option><option value="3">夜宵</option></select></label>
                        <div class="address-bar">
                            就餐城市：<input name="city" style="width:200px;" placeholder="温州"> <button class="box-btn" id="search">检索</button>
                            <ul id="storefront_list">
                            </ul>
                        </div>
                        <div class="box-bar">
                            <button class="box-btn red" id="auto_grab">自动抢号</button>
                            <button class="box-btn" id="cancle_grab">取消自动</button>
                            <button class="box-btn" id="manual_garb">手动抢号</button>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <div class="box-body log"></div>
                </div>`,
        init: function(){ 
            
            var _self = this;

            $("<style></style>").text(_self.style).appendTo($('head'))
            $('body').append(_self.mask)

            var getData = function(){
                _self.formData = {
                    title: $('#e_time').val(),
                    peopleNum: $('#e_num').val()
                }
            }

            // 绑定事件 自动排队
            $('#auto_grab').click(function(){
                _grab.count = 0;
                getData();
                
                _self.writeLog('开始自动抢号...');
                var app_token = $('#token').val()
                if(app_token.length > 0){
                    _cache['_HAIDILAO_APP_TOKEN'] = app_token;
                    _self.writeLog('apptoken抢号模式...');
                }
                _grab.inspect();
            });

            // 手动排队
            $('#manual_garb').click(function(){

                _grab.count = 0;
                getData();

                _self.writeLog('手动抢号...');
                var app_token = $('#token').val()
                if(app_token.length > 0){
                    _cache['_HAIDILAO_APP_TOKEN'] = app_token;
                    _self.writeLog('apptoken抢号模式...');
                }
                _grab.main();
            });

            // 取消排队
            $('#cancle_grab').click(function(){
                _self.writeLog('取消抢号...')

                _grab.cancle();
            })

            // 检索门店
            $('#search').click(function(){
                _grab.getStore();
            });

            // 读取排号门店
            _self.setNotice();
            
        },
        writeLog: function(log){
            $('.log').append('<p>' + log + '</p>');
            $('.grab-box').scrollTop($('.box-body.log').height())
        },
        setNotice: function(){
            var _id = sessionStorage.getItem('storeId'),
            _name = sessionStorage.getItem('storeName'),
            _storeAddress = sessionStorage.getItem('storeAddress')

            if(_id == null){
                _id = "091401"
                _name = "5050购物中心店"
            }
            
            $('.notice').html(`当前门店：${_name}(地址：${_storeAddress})`)
            $('.notice').attr('data-id', _id).attr('data-name', _name)
        }
    }
    
    // 时间
    var _date = {
        // 获取当前时间
        now: function(){
            // debugger

            var time = new Date()

            return {
                y: time.getFullYear(),
                mo: time.getMonth() + 1,
                d: time.getDate(),
                h: time.getHours(), 
                m: time.getMinutes(), 
                s: time.getSeconds()
            }
            // return {               
            //     y: time.getFullYear(),
            //     mo: time.getMonth(),
            //     d: time.getDate(),
            //     h: '9',
            //     m: '59',
            //     s: time.getSeconds()
            // }
        },
        // 是否是放号时间
        isGrabTime: function(){
            // debugger
            // 当前时间
            var time = this.now()
            var _nowTime = time.y + '/' + time.mo + '/' + time.d + ' ' + time.h + ':' + time.m + ':' + time.s
            var _nDate = new Date(_nowTime)
            // 预定时间
            var _grabTime = _layer.formData.title == 1 ? ('7:59:57') : ('15:59:57')
            var _gDate = new Date(time.y + '/' + time.mo + '/' + time.d + ' ' + _grabTime)
            // 超时时间
            var _outTime = _layer.formData.title == 1 ? ('8:01:03') : ('16:01:03')
            var _oDate = new Date(time.y + '/' + time.mo + '/' + time.d + ' ' + _outTime)
            // var isAm = function(){
            //     return _layer.formData.title == 1 ? (time.h != 9 && time.h != 10) : (time.h != 15 && time.h != 16)
            // }

            var PrefixInteger = function (num, length) {
                return (Array(length).join('0') + num).slice(-length);
            }

            // console.log('现在报时：北京时间' + time.h + ':' + time.m + ':' + time.s)
            _layer.writeLog('<span style="color:green">北京时间' + PrefixInteger(time.h, 2) + ':' + PrefixInteger(time.m, 2) + ':' + PrefixInteger(time.s, 2) + '</span>')

            // if(isAm()){
            //     return false
            // }

            // if(time.m != 59 && time.m != 0){
            //     return false
            // }

            // if(time.s < 57 && time.s > 5){
            //     return false
            // }

            // _layer.writeLog(_nDate)
            if(_nDate < _gDate){
                return '还没到点呢...'
            }
            
            if(_nDate > _oDate){
                return '<span style="color:red;font-size: 24px;">已经过时了，脚本终止...</span>'
            }
        },
    }
    
  
    // _grab.inspect();

    
    if(_grab.isGrab()){
        _login.toLoign()
        _layer.init()
    }

})()
 
 