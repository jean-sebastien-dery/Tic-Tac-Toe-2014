var util = require('util');

var ptor = protractor.getInstance();

var timeout = 20000;

function sendkeysToModel(model, keys) {
  return element(by.model(model)).sendKeys(keys);
}

function openNewWindow(url) {
  var script = 'window.open("' + url + '")';
  browser.executeScript(script);
}

function alert(message) {
  var script = 'window.alert("' + message + '")';
  browser.executeScript(script);
}

function switchToWindow(windowId) {
  ptor.getAllWindowHandles().then(function(handles) {
    browser.switchTo().window(handles[windowId]);
    browser.driver.executeScript('window.focus();');
  });
}

describe('game system', function() {

  it('should create a game with best 4 out of 7 rounds and 5 seconds per turn', function() {

        browser.get('#/register');

    // Register first player (player1)

    sendkeysToModel('home.user.username','player1');
    sendkeysToModel('home.user.password', 'player1');
    sendkeysToModel('home.user.confirmedPassword', 'player1');
    element(by.name("register")).click();

    // Register second player (player2)

    browser.get('#/register');
    
    sendkeysToModel('home.user.username','player2');
    sendkeysToModel('home.user.password', 'player2');
    sendkeysToModel('home.user.confirmedPassword', 'player2');
    element(by.name("register")).click();

    // Login first player and redirect him to lobby

    browser.get('#/');

    var username = element(by.model('home.user.username'));
    username.sendKeys('player1');

    var password = element(by.model('home.user.password'));
    password.sendKeys('player1');

    var loginBtn = element(by.name('login'));
    loginBtn.click();

    element(by.css('[href="#/lobby"]')).click();

    // Open a new window

    browser.driver.executeScript('window.open()');
    switchToWindow(1); // Window 1 is the newly open window

    // Login second player and redirect him to lobby

    browser.get('#/');

    var username = element(by.model('home.user.username'));
    username.sendKeys('player2');

    var password = element(by.model('home.user.password'));
    password.sendKeys('player2');

    var loginBtn = element(by.name('login'));
    loginBtn.click();

    element(by.css('[href="#/lobby"]')).click();

    // Create the actual game
    
    var createGameBtn = element(by.name('creategame'));
    createGameBtn.click();
    element(by.css('[value="4/7"]')).click();
    element(by.css('[value="5"]')).click();

    createGameBtn = element(by.name('creategame'));
    createGameBtn.click();

    expect(browser.getCurrentUrl()).toContain('#/waitingroom');
    expect(element(by.id('gameParameters')).getText()).toContain('7 rounds');
    expect(element(by.id('gameParameters')).getText()).toContain('5 seconds');
    
  }, timeout);

  it('should join the previously created game', function() {

    switchToWindow(0); // Switch back to initial window
    
    element(by.css('[ng-click="lobby.joinGame(game)"]')).click();

    expect(browser.getCurrentUrl()).toContain('#/waitingroom');
    
  }, timeout);

}, timeout);



