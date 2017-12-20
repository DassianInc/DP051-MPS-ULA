StartTest(function(t) {

    // Here we check that dependencies receive correct shift in case of particular time spane exporting (#867)

    t.expectGlobal('0'); // We love IE

    var iframe, calculatedPages;

    var getStyle = function (el, styleProp) {
        if (el.currentStyle) {
            return el.currentStyle[styleProp];
        } else if (window.getComputedStyle) {
            return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        }
    };

    var setIframe = function (html, cb) {
        // drop previously used iframe
        iframe && iframe.parentNode.removeChild(iframe);
        // build new one
        iframe  = document.body.appendChild(document.createElement('iframe'));
        // attach provided callback to iframe `load` event
        t.$(iframe).bind('load', cb);

        var doc = iframe.contentWindow.document;

        doc.open();
        doc.write(html);
        doc.close();
    };

    //Only for columns that span a single vertical page
    var getLeftShift = function (page) {

        return 0;
    };


    var plugin  = new Gnt.plugin.Export({
        printServer : 'none',
        openAfterExport : false,
        test        : true
    });

    var gantt   = t.getGantt({
        renderTo : Ext.getBody(),
        plugins  : plugin
    });

    t.waitForRowsVisible(gantt, function() {

        var async= t.beginAsync(45000);

        plugin.doExport({
            format              : "Letter",
            orientation         : "portrait",
            range               : "date",
            dateFrom            : new Date(2010, 1, 10),
            dateTo              : new Date(2010, 1, 20),
            showHeader          : true,
            exporterId          : 'multipage'
        }, function (result) {

            t.endAsync(async);

            var htmls = result.htmlArray;

            t.is(htmls.length, 1, "1 page exported");

            t.it('Evaluate first page', function (t) {

                var async   = t.beginAsync();

                setIframe(htmls[0].html, function () {
                    var depView = t.$('.sch-dependencyview-ct', iframe.contentWindow.document)[0];

                    t.is(parseFloat(getStyle(depView, "left")), 0, "0th page: left shift is correct");
                    t.is(parseFloat(getStyle(depView, "top")), 0, "0th page: no `top` shift");

                    t.endAsync(async);
                });
            });

        });
    });

});
