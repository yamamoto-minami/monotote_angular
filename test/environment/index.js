'use strict';

if (typeof process.env.SCT_USER === 'undefined') {
  console.log('Required shell environment variables not set.');
  console.log('View tasks/env.template.sh for more information.');
  process.exit(0);
}

module.exports = {
  oauth: {
      client: {
          id: process.env.SCT_OAUTH_CLIENT_ID || 'oauth_client_id',
          secret: process.env.SCT_OAUTH_CLIENT_SECRET || 'oauth_client_secret'
      }
  },
  user: {
      username: process.env.SCT_USER || '',
      password: process.env.SCT_PASSWORD || ''
  },
  api: {
      url: process.env.SCT_API_URL || 'api_url',
      password: process.env.SCT_API_PASSWORD || 'sct_api_hash',
      key: process.env.SCT_API_KEY || 'sct_api_key',
      routes: {
        'oauth':                  '/v1/oauth/access_token',
        'publisher':              '/v1/publisher',
        'products':               '/v1/products/{universe}/products',
        'filter':                 '/v1/products/{universe}/filters',
        'productsMonotote':       '/v1/products/monotote/products',
        'productsMonototeFilter': '/v1/products/monotote/filters',
        'shoppables':             '/v1/shoppables',
        'shoppablesUpload':       '/v1/shoppables/upload',
        'categories':             '/v1/categories',
        'universes':              '/v1/universes'
      }
  },
  longTimeout: 10000
};
