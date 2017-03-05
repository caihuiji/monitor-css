/**
 * Created by chriscai on 2017/3/2.
 */



(function (root){


    var defaultConfig = {
        reportUrl : '',
        ruleDBUrl : '',
        id : 1,
        onSubmit : null ,
        detectRule : null ,
    },
    delay = 1000;


    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE = UA && /msie|trident/.test(UA);
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
    var isEdge = UA && UA.indexOf('edge/') > 0;
    var isAndroid = UA && UA.indexOf('android') > 0;
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
    var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

    var extend = function (src , obj){
        for(var key in obj){
            src[key] || (src[key] = obj[key]);
        }

        return src;
    }


    var fetchRuleDB = function (config , callback){
        var script = document.createElement("script");

        var ruleUrl = config.ruleDBUrl || "";

        //var callbackName = "monitorcss_" +  (new Date -0)
        var callbackName = "bbbbbb"
        window[callbackName ] = function (ruleDB){
            callback(null , ruleDB)
        }

        ruleUrl += ( ruleUrl.indexOf("?") > -1 ? "&":"?" )+  "callback="  + callbackName +"&id="+ config.id + "&_t=" + (new Date -0)

        script.src= ruleUrl;

        //retry fetch
        script.onerror = function (){
            var script2 = document.createElement("script");
            script2.src= script.src +"&_r=a";
            script2.onerror = function (e){
                callback(new Error("fail to fetch ruleDB") , null)
            };
            setTimeout( function (){
                document.head.appendChild(script2);
            },1000)
        }
        document.head.appendChild(script);

    }

    var shouldReportRuleDB = {};

    var detectIndex = 0 , detectKeys = [] , isStop = false;
    var nextTick  = function (){
        if(isStop){
            return ;
        }

        if(detectIndex == 0){
            detectKeys = Object.keys(MONITOR_CSS.getRule());
        }

        //console.time();
        var i = detectIndex;
        for(; i < detectIndex + 10 && i < detectKeys.length  ; i++){
            if(MONITOR_CSS.detectRule( MONITOR_CSS.getRule()[ detectKeys[i] ].selector) ){
                MONITOR_CSS.markRule( detectKeys[i] )
            }/*else {
             console.log(ruleDB[key].selector)
             }*/
        }

        if(i >= detectKeys.length){
            detectIndex = 0;
        }else {
            detectIndex = i;
        }
        //console.timeEnd();
    }


  /*  (function (){
        var fun = function (){
            nextTick();
            root.requestAnimationFrame(fun)
        }
        root.requestAnimationFrame(fun);
    })();*/

    var isNative = function  (Ctor) {
        return /native code/.test(Ctor.toString())
    }


    var MONITOR_CSS = {


        startMonitor : function (config){
            var self = this;
            this._config = extend (config|| {} , defaultConfig);

            if( !root.zepto &&  !root.jQuery && !root.document.querySelectorAll && !this._config.detectRule){
                console.error("fail to startMonitor ，could not found zepto or jquery or document.querySelectorAll , please set detectRule.  ")
                return
            }



            fetchRuleDB(this._config , function (err , ruleDB){
                if(err){
                    console.error(err)
                }else {
                    self._ruleDB = ruleDB;

                    start();

                }
            })

            return this;
        },

        stopMonitor : function (){
            isStop = true;
            return this;
        },

        getRule : function (id ){
            if(id){
                return this._ruleDB[id]
            }else {
                return this._ruleDB;
            }
        },

        detectRule : function (ruleKey){
            if(!!this._config.detectRule){
                return this._config.detectRule(ruleKey)
            }

            if(root.zepto ||  root.jQuery ){
                return !!root.$(ruleKey).length
            }else if (root.document.querySelectorAll){
                return !!root.document.querySelectorAll(ruleKey).length
            }

        },

        markRule : function (ruleDBId , selector){
            if(!this._ruleDB){
                return ;
            }

            if(!ruleDBId){
                for(var key in this._ruleDB){
                    if(this._ruleDB[key].selector == selector){
                        ruleDBId = key;
                        break;
                    }
                }
            }

            if(ruleDBId){
                if(!shouldReportRuleDB[ruleDBId]){
                    shouldReportRuleDB =  this._ruleDB[ruleDBId]
                    shouldReportRuleDB.from = location.href;
                }
                delete this._ruleDB[ruleDBId];
            }

        },

        submit : function (submitData){
            if(!!this._config.onSubmit){
                this._config.onSubmit(submitData)
                return ;
            }
        }
    }



    if (typeof module !== "undefined") {
        module.exports = MONITOR_CSS;
    }else {
        root.M_S = MONITOR_CSS
    }

}(window))

