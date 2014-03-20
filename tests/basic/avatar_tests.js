var util = require('util');

var timeout = 20000;

describe('avatar system', function() {

  // TODO: Register a new player and set number
  //       of games won to 150.

  // Login Test User

	browser.get('#/');

	var username = element(by.model('home.user.username'));
	username.sendKeys('test1');

	var password = element(by.model('home.user.password'));
	password.sendKeys('test1');

	var loginBtn = element(by.name('login'));
	loginBtn.click();

  // Go to avatar menu

  var avatarMenuLink = element(by.css('[href="#/avatarmenu"]'));
  avatarMenuLink.click();

  it('should display the player\'s avatar', function() {

    expect(element(by.id('avatar')).getAttribute('src')).toContain('test1.png');

  }, timeout);

  it('should display 150 games won', function() {

    expect(element(by.id('gameswon')).getText()).toContain('150');

  }, timeout);

  it('should display 0 game lost', function() {

    expect(element(by.id('gameslost')).getText()).toContain('0');

  }, timeout);

  it('should display a W/L ratio of 1', function() {

    expect(element(by.id('wlratio')).getText()).toContain('1');

  }, timeout);

  it('should display the player\'s rank (1)', function() {

    expect(element(by.id('rank')).getText()).toContain('1');

  }, timeout);

  it('should return to mainmenu', function() {

    var backBtn = element(by.name('back'));
    backBtn.click();

    expect(browser.getCurrentUrl()).toContain('#/mainmenu');

  }, timeout);

}, timeout);
