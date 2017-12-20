StartTest(function(t) {

    t.expectGlobals('JSHINT');

    var getFile     = function (url, callback) {
        var as  = t.beginAsync();
        
        Ext.Ajax.request({
            url         : url,
            callback    : function(options, success, response) { 
                t.endAsync(as);
                
                if (!success) t.fail('File [' + url + '] failed to load');
                
                success && callback && callback(response.responseText)
            }
        })
    }
    
    getFile('../gnt-all-debug.js', function (gntAllDebugText) {
        getFile('../.jshintrc', function (jsHintRcText) {
            var myResult = JSHINT(gntAllDebugText, eval('(' + jsHintRcText + ')'));
            
            t.notOk(gntAllDebugText.match(/console\.log\(/), 'Found console.log in code, clean up!');

            if (myResult) {
                t.pass('No lint errors found');
            } else {
                Ext.each(JSHINT.errors, function(err) {
                    t.fail(err.reason + '(line: ' + err.line + ', char: ' + err.character + ')');
                });
            }
        })
    })
})