angular.module('cmp.config', [])
.constant('SCT_CONFIG',
  angular.extend({
    environments: {
      local: {
        imageUrl: 'http://generator.dev.mono/assets/images/',
        apiUrl: 'http://api.dev.mono/v1',
        pluginUrl: 'http://localhost:7777/plugin.js',
        themesUrl: 'https://s3.amazonaws.com/cdn.monotote.com/themes/dev/{themeId}.css',
        oauth_client_id: '1',
        oauth_client_secret: 'dJa2c5HoL5pLYpNc4ckK1477bwURHHXPXKIjxmbK',
        mixpanel_api_key: '785431aef706026f92ec6db6692bae31',
        mixpanel_token: "4dfd466ed4dc4453fd9c6abe7b661691",
        public_api_key: '123'
      },
      dev: {
        imageUrl: 'http://generator.dev.mono/assets/images/',
        apiUrl: 'http://api.dev.mono/v1',
        pluginUrl: 'http://plugin.dev.mono/plugin.min.js',
        themesUrl: 'https://s3.amazonaws.com/cdn.monotote.com/themes/dev/{themeId}.css',
        oauth_client_id: '1',
        oauth_client_secret: 'dJa2c5HoL5pLYpNc4ckK1477bwURHHXPXKIjxmbK',
        mixpanel_api_key: '785431aef706026f92ec6db6692bae31',
        mixpanel_token: "4dfd466ed4dc4453fd9c6abe7b661691",
        public_api_key: '123'
      },
      stage: {
        imageUrl: 'https://generator-staging.monotote.com/assets/images/',
        apiUrl: 'https://api-staging.monotote.com/v1',
        pluginUrl: 'https://plugin-staging.monotote.com/plugin.min.js',
        themesUrl: 'https://s3.amazonaws.com/cdn.monotote.com/themes/staging/{themeId}.css',
        oauth_client_id: '1',
        oauth_client_secret: 'dJa2c5HoL5pLYpNc4ckK1477bwURHHXPXKIjxmbK',
        mixpanel_api_key: 'a5413fc9cde8911628e5eecff6656d7e',
        mixpanel_token: "852ef1980d52d2c8674b90786df7a1a0",
        public_api_key: '123'
      },
      prod: {
        imageUrl: 'https://cloudfront.monotote.com/assets/images/',
        apiUrl: 'https://api.monotote.com/v1',
        pluginUrl: 'https://plugin.monotote.com/plugin.min.js',
        themesUrl: 'https://s3.amazonaws.com/cdn.monotote.com/themes/{themeId}.css',
        oauth_client_id: '1',
        oauth_client_secret: 'dJa2c5HoL5pLYpNc4ckK1477bwURHHXPXKIjxmbK',
        mixpanel_api_key: '2a06ea1877d261975fa0763c93b8725a',
        mixpanel_token: "cc71746142b7e85479c02f7d1213a136",
        public_api_key: 'a4b278e5fa74283861a8cff338faa0c6'
      }
    },
    mixpanel_base_url: 'https://mixpanel.com/api/2.0/',
    imageUploadUrl: '',
    default_params: {},
    dateformat: 'YYYY-MM-DD',
    dateformat_long: 'MMM Do, YYYY',
    mindate: '2000-01-01',
    tempPasswordStorageKey: 'tmp-pass',
    defaultRoute: 'tagging.list',
    defaultProfileImage: '/img/assets/default-avatar.png',
    defaultProductImage: '/img/assets/image-not-available-large.jpg',
    defaultThumbnailImage: '/img/assets/default_thumbnail.gif',
    d3Url: 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.10/d3.js',
    md5Url: 'https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/1.1.1/js/md5.js',
    route: {
      'oauth':                  '/oauth/access_token',
      'translations':           '/translations',
      'orders':                 '/publisher/analytics/orders',
      'getAvailableRetailers':  '/publisher/retailers',
      'getCountries':           '/countries',
      'publisher':              '/account', //changed from publisher might want to change its name at some point
      'publisherConnect':       '/account/connect',
      'publisherValidateId':    '/account/connect/{affiliate}/validate/affiliate_id',
      'publisherConfirmation':  '/account/confirmation', //changed from publisher
      'accountChangePassword':  '/account/password/change',
      'products':               '/publisher/products',
      'productDetail':          '/publisher/products/detail',
      'filters':                '/publisher/products/{universe}/filters',
      'productDownload':        '/publisher/products/{universe}/downloads',
      'shoppables':             '/publisher/shoppables',
      'categories':             '/publisher/categories',
      'universes':              '/publisher/universes',
      'affiliateSettings':      '/publisher/affiliates',
      'passwordReset':          '/account/password/reset',
      'detectProducts':         '/detect/products-in-image',
      'detectAvailability':     '/detect/availability',
      'upload':                 '/upload',
      'affiliate_link':         '/affiliate-link',
      'affiliate':              '/affiliate',
      'themes':                 '/publisher/plugin/themes',
      'lookupProduct':          '/publisher/lookup-product',
      'downloadProductImages':  '/publisher/products/{universe}/downloads/{sku}'
    }
  }, window && window.__sct__config)
)
.value('navMenu', [
  {
    'title': 'My content',
    'name': 'home',
    'link': '/tagging/list',
    'sref': 'tagging.list'
  },
  {
    'title': 'Theme designer',
    'name': 'theme-designer',
    'link': '/themes/list',
    'sref': 'themes.list'
  },
  {
    'title': 'Lookup Product',
    'name': 'web',
    'link': '/products/lookup',
    'sref': 'products.lookup'
  },/*
  {
    'title': 'Analytics',
    'name': 'analytics2',
    'link': '/analytics',
    'sref': 'analytics',
    'permission': 'show-analytics'
  },*/
  {
    'title': 'Include Code',
    'name': 'code',
    'link': '/include-code',
    'sref': 'includecode'
  },/*
  {
    'title': 'Generate Shoppable Link',
    'name': 'link3',
    'link': '/generate-link',
    'sref': 'generatelink'
  }*/]
)
.constant('TAGGING_DROPLETS', [
    { color : 7 },
    { color : 1 },
    { color : 2 },
    { color : 3 },
    { color : 4 },
    { color : 5 },
    { color : 6 }
])
.constant('CURRENCY', {
    'eur': '&euro;',
    'usd': '$'
});
