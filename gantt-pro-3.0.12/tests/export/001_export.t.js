StartTest(function(t) {
    t.expectGlobals('MyExportPlugin');

    t.wait('export', 30000);

    Ext.define('MyExportPlugin', {
        extend  : 'Gnt.plugin.Export',

        onRequestSuccess : function (response) {
            var text = Ext.JSON.decode(response.responseText);

            t.pass('Request successfull.');
            t.endWait('export');

            if (text.success) {
                this.callParent(arguments);
                checkFileExists(text.url);
            } else {
                t.fail('Export failed: ' + text.msg);
            }
        },

        onRequestFailure : function (response) {
            this.callParent(arguments);

            t.fail("Request failed");
            t.endWait('export');
        }
    });

    var gantt       = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins     : Ext.create('MyExportPlugin', {
            printServer     : '../examples/export/server.php',
            openAfterExport : false
        })
    });

    var checkFileExists = function (url) {
        t.wait('xhrResponse');

        Ext.Ajax.request({
            method  : 'HEAD',
            url     : url,
            success : function (response) {
                t.pass('File created');
                t.ok(response.getResponseHeader('Content-Length'), 'File has some size');

                t.endWait('xhrResponse');
            },

            failure : function () {
                t.fail("Request failed");

                t.endWait('xhrResponse');
            }
        });
    };

    t.waitForRowsVisible(gantt, function () {
        gantt.doExport();
    });
});
