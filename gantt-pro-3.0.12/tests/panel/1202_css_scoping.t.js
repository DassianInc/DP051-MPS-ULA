StartTest(function(t) {
    
    document.body.innerHTML = '<div id="foo">bar</div>';

    var g = t.getGantt({
        weekendsAreWorkdays : true,
        renderTo : Ext.getBody()
    });
    
    var frame = document.createElement('iframe')
    frame.src = 'about:blank'
    
    document.body.appendChild(frame)
    
    // seems IE9 creates globals for each iframe?
    t.expectGlobals('0')

    var freshWin = frame.contentWindow;
    
    freshWin.document.open();
    
    freshWin.document.write( '<html><head></head><body><div id="foo2"></div></body></html>' );
   
    freshWin.document.close();

    var div = Ext.get('foo').dom;
    var cleanDiv = freshWin.document.getElementById('foo2');

    Ext.each(['-moz-box-sizing', 'box-sizing', '-ms-box-sizing', '-webkit-box-sizing'], function(p) {
        t.is(Ext.fly(div).getStyle(p), Ext.fly(cleanDiv).getStyle(p), 'Box sizing not applied');
    });
});
