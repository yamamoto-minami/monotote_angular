(function(){
    var timer = setInterval(function(){
        if(!window.Monotote || !window.Monotote.checkoutEngine || !window.Monotote || !window.Monotote.checkoutEngine.api) { return; }
        clearInterval(timer);
    var apiFn = Monotote.checkoutEngine.api;

    Monotote.checkoutEngine.api = function(){
        var method = arguments[0], url = arguments[1], data = arguments[2], callback = arguments[3], siteId;
        if (typeof data === 'function') {
            callback = data;
            data = '';
            siteId = '';
        }
        if(typeof data === 'string'){
            siteId = data;
            data = '';
        }
        if(method.toUpperCase() === 'POST' && /^checkout\/payment-method\/\d+\/.+/.test(url)) {
            console.log('mockup', url, data);
            return setTimeout(callback.bind(this, {
                "status": {
                    "code": 200,
                    "error": false,
                    "text": "success"
                },
                "body": {
                    "verify": true,
                    "link": "javascript:void(0)",
                }
            }), 1000)
        } else if(method.toUpperCase() === 'POST' && /^checkout\/validate\/payment-method/.test(url)) {
            console.log('mockup', url, data);
            return setTimeout(callback.bind(this, {
                "status": {
                    "code": 200,
                    "error": false,
                    "text": "success"
                },
                "body": {
                    "type": "visa",
                    "method": "cc"
                }
            }), 1000)
        } else if(method.toUpperCase() === 'POST' && /^checkout\/finalise/.test(url)) {
            console.log('mockup', url, data);
            return setTimeout(callback.bind(this, {
                "status": {
                    "code": 200,
                    "error": false,
                    "text": "success"
                },
                "body": 123
            }), 1000)
        } else if(method.toUpperCase() === 'GET' && /^checkout\/completed\//.test(url)) {
            console.log('mockup', url, data);
            return setTimeout(callback.bind(this, {
                "status": {
                    "code": 200,
                    "error": false,
                    "text": "success"
                },
                "body": {
                    "completed": true,
                }
            }), 1000)
        } else if(method.toUpperCase() === 'GET' && /^checkout\/shipping-methods\//.test(url)) {
            console.log('mockup', url, data);
            return setTimeout(callback.bind(this, {"status":{"code":200,"error":false,"text":"success"},"body":{"shipping":{"economy":0,"standard":9.95},"delivery":{"economy":"Your order will be delivered in a week","standard":"Your order will be delivered within a day"},"tax":{"economy":0,"standard":0},"cart":null,"errors":[],"payment_methods":{"bc":null,"cc":["vi","mc"]},"currency":"eur"}}), 3000);
        } else if(method.toUpperCase() === 'POST' && /^checkout\/shipping-method\//.test(url)) {
            console.log('mockup', url, data);
            return setTimeout(callback.bind(this, {"status":{"code":200,"error":false,"text":"success"},"body":"economy"}), 500);
        }

        return apiFn.apply(this, arguments);
    };

    return 'injected';
}, 1000);

})();
