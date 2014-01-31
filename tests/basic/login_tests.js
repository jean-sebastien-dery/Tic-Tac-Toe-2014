var util = require('util');

describe('login system', function() {
  beforeEach(function() {
    browser.get('#/');
  });

  function sendkeysToModel(model, keys) {
    return element(by.model(model)).sendKeys(keys);
  }

  it('should not register if password is not well confirmed', function() {
    element(by.name("register")).click();
    
    sendkeysToModel('home.user.username','test1');
    sendkeysToModel('home.user.password', 'test1');
    sendkeysToModel('home.user.confirmedPassword', 'test2');

    expect(element(by.name('register')).isEnabled()).toBe(false);
  });

  it('should not register if username is less than 5 char', function() {
    element(by.name("register")).click();
    
    sendkeysToModel('home.user.username','test');
    sendkeysToModel('home.user.password', 'test1');
    sendkeysToModel('home.user.confirmedPassword', 'test1');

    expect(element(by.name('register')).isEnabled()).toBe(false);
  })

  it('should register if all information is confirmed', function() {
    element(by.name("register")).click();
    
    sendkeysToModel('home.user.username','test');
    sendkeysToModel('home.user.password', 'test12');
    sendkeysToModel('home.user.confirmedPassword', 'test12');

    expect(element(by.name('register')).isEnabled()).toBe(false);
  })

  it('should log in', function() {
    browser.get('#/');

    var username = element(by.model('home.user.username'));
    username.sendKeys('test1');

    var password = element(by.model('home.user.password'));
    password.sendKeys('test1');

    var loginBtn = element(by.name('login'));
    loginBtn.click();

    expect(browser.getCurrentUrl()).toContain('#/mainmenu');
  });

});

