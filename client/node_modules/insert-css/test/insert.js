var test = require('tape');
var insertCss = require('../');

var css = 'body { background-color: purple; color: yellow; }';

test(function (t) {
    t.plan(4);
    
    var beforeStyle = window.getComputedStyle(document.body);
    t.equal(beforeStyle.backgroundColor, 'rgba(0, 0, 0, 0)');
    t.equal(beforeStyle.color, 'rgb(0, 0, 0)');
    
    insertCss(css);
    
    var afterStyle = window.getComputedStyle(document.body);
    t.equal(afterStyle.backgroundColor, 'rgb(128, 0, 128)');
    t.equal(afterStyle.color, 'rgb(255, 255, 0)');
});
