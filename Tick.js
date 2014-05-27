(function(w,u){
    var window = w,
        undefined = u,
        isIE = !window.getComputedStyle,
        Tick = {};

    var animateType = {
        "easeInSine":{a:{x:0.47,y:0},b:{x:0.745,y:0.715}},
        "easeOutSine":{a:{x:0.39,y:0.575},b:{x:0.565,y:1}},
        "easeInOutSine":{a:{x:0.445,y:0.05},b:{x:0.55,y:0.95}},
        "easeInQuad":{a:{x:0.55,y:0.085},b:{x:0.68,y:0.53}},
        "easeOutQuad":{a:{x:0.25,y:0.46},b:{x:0.45,y:0.94}},
        "easeInOutQuad":{a:{x:0.455,y:0.03},b:{x:0.515,y:0.955}},
        "easeInCubic":{a:{x:0.55,y:0.055},b:{x:0.675,y:0.19}},
        "easeOutCubic":{a:{x:0.215,y:0.61},b:{x:0.355,y:1}},
        "easeInOutCubic":{a:{x:0.645,y:0.045},b:{x:0.355,y:1}},
        "easeInQuart":{a:{x:0.895,y:0.03},b:{x:0.685,y:0.22}},
        "easeOutQuart":{a:{x:0.165,y:0.84},b:{x:0.44,y:1}},
        "easeInOutQuart":{a:{x:0.77,y:0},b:{x:0.0175,y:1}},
        "easeInQuint":{a:{x:0.755,y:0.05},b:{x:0.855,y:0.06}},
        "easeOutQuint":{a:{x:0.23,y:1},b:{x:0.32,y:1}},
        "easeInOutQuint":{a:{x:0.86,y:0},b:{x:0.07,y:1}},
        "easeInExpo":{a:{x:0.95,y:0.05},b:{x:0.795,y:0.035}},
        "easeOutExpo":{a:{x:0.19,y:1},b:{x:0.22,y:1}},
        "easeInOutExpo":{a:{x:1,y:0},b:{x:0,y:1}},
        "easeInCirc":{a:{x:0.6,y:0.04},b:{x:0.98,y:0.335}},
        "easeOutCirc":{a:{x:0.075,y:0.82},b:{x:0.165,y:1}},
        "easeInOutCirc":{a:{x:0.785,y:0.135},b:{x:0.15,y:0.86}},
        "easeInBack":{a:{x:0.6,y:-0.28},b:{x:0.735,y:0.045}},
        "easeOutBack":{a:{x:0.175,y:0.885},b:{x:0.32,y:1.275}},
        "easeInOutBack":{a:{x:0.68,y:-0.55},b:{x:0.265,y:1.55}}
    };

    /**
     * 初始化参数
     * @param target
     * @param params
     * @returns []
     */
    Tick.init = function(target,params){
        var self = this,
            attr = {},
            fn = null,
            fnParams = [],
            type = '',
            speed = 0,
            val = [];

        for(var item in params){
            if(params.hasOwnProperty(item)){
                if(item == "onComplete"){
                    fn = params[item];
                }else if(item == "onCompleteParam"){
                    fnParams = params[item];
                }else{
                    attr[item] = params[item];
                }
            }
        }

        if(self._isString(arguments[2])){
            type = animateType[arguments[2]] || animateType["easeInSine"];
            speed = arguments[3] || 1000;
        }else{
            type = animateType["easeInSine"];
            speed = arguments[2] || 1000;
        }

        val.push(target,attr,type,speed,fn,fnParams);

        return val;
    };

    /**
     * to函数
     * @param target 运动对象
     * @param params 运动参数
     */
    Tick.to = function(target,params){
        var self = this;

        if(!self._isObject(params))
            return;

        params = self.init.apply(self,arguments);

        self._animate.apply(self,params);
    };

    /**
     * from函数
     * @param target 运动对象
     * @param params 运动参数
     */
    Tick.from = function(target,params){
        var self = this;

        if(!self._isObject(params))
            return;

        for(var item in params){
            if(params.hasOwnProperty(item) && item != "onComplete" && item != "onCompleteParam"){
                var tmp = parseFloat(self._css(target,item));
                self._css(target,item,params[item]);
                params[item] = tmp;
            }
        }

        arguments[1]  = params;

        params = self.init.apply(self,arguments);

        self._animate.apply(self,params);

    };

    /**
     * fromTo函数
     * @param target 运动对象
     * @param tParams to运动参数
     * @param fParams from运动参数
     */
    Tick.fromTo = function(target,tParams,fParams){
        var self = this;

        if(!self._isObject(tParams) || !self._isObject(fParams))
            return;

        for(var item in fParams){
            if(fParams.hasOwnProperty(item) && item != "onComplete" && item != "onCompleteParam"){
                self._css(target,item,fParams[item]);
            }
        }

        Array.prototype.splice.call(arguments,2,1);
        tParams = self.init.apply(self,arguments);

        self._animate.apply(self,tParams);
    };

    /**
     * 读取或设置属性
     * @returns {*} (target,json) || (target,attr) || (target,attr,val)
     * @private
     */
    Tick._css = function(){
        var self = this,
            argsLen = arguments.length,
            isSet = argsLen > 2 || self._isObject(arguments[1]),
            target = arguments[0],
            attr,val,isJson;


        if(argsLen < 2)
            return;

        //设置
        if(isSet){
            attr = arguments[1];
            val = arguments[2];
            isJson = self._isObject(attr);

            if(isJson){
                for(var item in attr){
                    if(attr.hasOwnProperty(item)){
                        self._setAttr(target,item,attr[item]);
                    }
                }
            }else{
                self._setAttr(target,attr,val);
            }

        }else{
            //读取
            attr = arguments[1];

            return self._getAttr(target,attr);
        }

    };

    /**
     * 设置元素属性
     * @param target 设置属性的元素
     * @param attr 属性名
     * @param val 属性值
     * @private
     */
    Tick._setAttr = function(target,attr,val){
        if(attr == "opacity"){
            if(isIE){
                var reg = /(opacity=)(\d+(\.\d+)?)/i,
                    filter = target.currentStyle.filter;

                val *= 100;
                attr = "filter";

                val = filter && filter.replace(reg,function(){
                    return arguments[1] + val;
                });
            }
        }else{
            val = val + "px";
        }

        target.style[attr] = val;
    };

    /**
     * 读取元素属性
     * @param target 读取属性的元素
     * @param attr 读取属性
     * @private
     */
    Tick._getAttr = function(target,attr){
        var val,match;

        if(attr == "opacity" && isIE){
            var reg = /alpha\((?:opacity=(\d+(\.\d+)?))\)/i,
                filter = target.currentStyle["filter"];

            match = filter.match(reg);

            if(match && match.length > 0)
                val = "" + (match[1] / 100);
        }else{
            if(isIE){
                val = target.currentStyle[attr];
            }else{
                val = window.getComputedStyle(target,null)[attr];
            }
        }

        if((match = val && val.match(/(\d+(\.\d+)?)px/i)))
            val = match[1];

        return val;
    };

    /**
     * 判断是否是对象JSON
     * @param obj 被判断的对象
     * @returns {boolean}
     * @private
     */
    Tick._isObject = function(obj){
        return Object.prototype.toString.call(obj) == "[object Object]";
    };

    /**
     * 判断是否是字符串
     * @param str 被判断的对象
     * @returns {boolean}
     * @private
     */
    Tick._isString = function(str){
        return Object.prototype.toString.call(str) == "[object String]";
    };

    /**
     * 贝塞尔函数
     * @param pa 控制点A
     * @param pb 控制点B
     * @param pc 控制点C
     * @param pd 控制点D
     * @param t  比例数，范围0~1
     * @returns {{x: number, y: number}}
     * @private
     */
    Tick._cubicBezier = function(type,t){
        var self = this,
            pa = {x:0,y:0},
            pb = type["a"],
            pc = type["b"],
            pd = {x:1,y:1},
            x,y;

        x = pa.x*Math.pow(1-t,3) + 3*pb.x*t*Math.pow(1-t,2) + 3*pc.x*Math.pow(t,2)*(1-t)+pd.x*Math.pow(t,3);
        y = pa.y*Math.pow(1-t,3) + 3*pb.y*t*Math.pow(1-t,2) + 3*pc.y*Math.pow(t,2)*(1-t)+pd.y*Math.pow(t,3);

        return {x:x,y:y};
    };


    /**
     * 运动函数
     * @param target 运动的对象
     * @param json 属性
     * @param speed 速度
     * @param fn 回调函数
     * @private
     */
    Tick._animate = function(target,json,type,speed,fn,fnParams){

        speed /= 2;

        var self = this,
            timeScale = 1000/70,
            count = speed / timeScale ,
            index = 1,
            time = 0;

        for(var item in json){
            target[item] = {};
            target[item].oldValue = parseFloat(self._css(target,item));
        }

        target.timer = target.timer ? target.timer : {};
        target.cb = [];

        if(target.timer)
            clearTimeout(target.timer);

        //这里是重点，这种方法是模糊模拟贝塞尔曲线的，
        //如果需要精确地模拟是需要解三次方程的
        //但是我们同样需要比较精确的分部曲线，具体的做法是乘一个比例系数，经验值是2
        for(var i = 0,length = Math.ceil(count*2); i <= length ; i++){
            tmp = self._cubicBezier(type, (i/2) * (1/count) );
            target.cb.push(tmp);
        }

        target.timer = setTimeout(function(){
            move();
        },timeScale);

        //闭包函数，todo：设置成原型方法
        function move(){
            var scale = target.cb[index++];

            if(index >= target.cb.length){

                for(var item in json){
                    var newValue = target[item].oldValue + (json[item] - target[item].oldValue) * scale.y;
                    self._css(target,item,newValue);
                }

                clearInterval(target.timer);

                if(typeof fn == "function")
                    fn.apply(target,fnParams);

            }else{
                var sub = speed * scale.x - time;

                timeScale = sub;

                if(timeScale < 1000/70)
                    timeScale = 1000/70;

                time = speed * scale.x;

                for(var item in json){
                    var newValue = target[item].oldValue + (json[item] - target[item].oldValue) * scale.y;
                    self._css(target,item,newValue);
                }
            }

            if(index < target.cb.length){
                target.timer = setTimeout(function(){
                    move();
                },timeScale);
            }
        }
    };

    w.Tick = Tick;

}(window));
