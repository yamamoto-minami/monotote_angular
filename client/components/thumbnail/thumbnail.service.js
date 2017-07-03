'use strict';

angular.module('cmp.thumbnail', ['cmp.base64'])
  .factory('Thumbnail',
    function (SCT_CONFIG, Env, Base64Factory) {
      var baseUrl = SCT_CONFIG.environments[Env].imageUrl + 'static/'; //'http://cloudfront.shoppingcarttechnologies.com/assets/images/static/';
      var cache = {};

      return {
        size: function (url, w, h, crop) {
          var enc, params = [];
          crop = crop || false;
          if (cache.hasOwnProperty(url)) {
            enc = cache[url];
          } else {
            enc = Base64Factory.encode(url);
            cache[url] = enc;
          }
          if(w){
            if (crop) {
              params.push('w=' + w);
            } else {
              params.push('mw=' + w);
            }
          }
          if(h){
            if (crop) {
              params.push('h=' + h);
            } else {
              params.push('mh=' + h);
            }
          }
          return baseUrl + enc + '?' + params.join('&');
        }
      };
    }
  );
