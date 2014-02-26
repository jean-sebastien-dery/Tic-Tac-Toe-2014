// The main suite of Protractor tests.
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Spec patterns are relative to this directory.
  specs: [
    // Order is important
  	//'basic/login_tests.js',
    'basic/game_tests.js'
  ],

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': { 
      'args': ['incognito'] 
    }
  },


  baseUrl: 'http://localhost:5000',

  params: {
    login: {
      user: 'raph',
      password: '1234'
    }
  }
};
