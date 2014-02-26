// The main suite of Protractor tests.
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  // Spec patterns are relative to this directory.
  specs: [
    'basic/*_tests.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },


  baseUrl: 'http://localhost:5000',

  params: {
    login: {
      user: 'raph',
      password: '1234'
    }
  }
};
