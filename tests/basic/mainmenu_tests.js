var util = require('util');

function sendkeysToModel(model, keys) {
  return element(by.model(model)).sendKeys(keys);
}

describe('menu system', function() {

  browser.get('#/');

  var username = element(by.model('home.user.username'));
  username.sendKeys('test1');

  var password = element(by.model('home.user.password'));
  password.sendKeys('test1');

  var loginBtn = element(by.name('login'));
  loginBtn.click();

  it('should redirect to the lobby', function() {
    var lobbyLink = element(by.name('lobby'));
    lobbyLink.click();

    expect(browser.getCurrentUrl()).toContain('#/lobby');

    var mainmenuLink = element(by.name('mainmenu'));
    mainmenuLink.click();
  });

  it('should redirect to the avatar page', function() {
    var avatarLink = element(by.name('avatar'));
    avatarLink.click();

    expect(browser.getCurrentUrl()).toContain('#/avatarmenu');

    var mainmenuLink = element(by.name('back'));
    mainmenuLink.click();
  });

  it('should log out the user', function() {
    browser.get('#/mainmenu');

    var avatarLink = element(by.name('logout'));
    avatarLink.click();

    expect(browser.getCurrentUrl()).toContain('#/home');
  });

});

