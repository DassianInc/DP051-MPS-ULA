StartTest(function(t) {
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


    var plugin      = new Gnt.plugin.Export({
        printServer : 'none',
        openAfterExport : false,
        test        : true
    });

    var gantt       = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins     : plugin
    });

    t.waitForRowsVisible(gantt, function() {

        var async = t.beginAsync(45000);

        plugin.doExport({
            format              : "Letter",
            orientation         : "portrait",
            range               : "complete",
            showHeader          : true,
            singlePageExport    : false,
            exporterId          : 'multipage'
        }, function (response) {

            plugin.unmask();

            var htmls       = response.htmlArray;
            t.ok(!!htmls, "Export array is not empty");

            //First task should be visible #1334
            var firstTask = gantt.getSchedulingView().getEl().down('.sch-event-wrap');
            t.is(firstTask.getStyle('left'), '600px', "First task should have proper left position");

            t.it('Evaluate first page', function (t) {

                var async = t.beginAsync();

                setIframe(htmls[0].html, function () {
                    var depView = t.$('.sch-dependencyview-ct', iframe.contentWindow.document)[0];

                    t.is(parseFloat(getStyle(depView, "left")), 0, "0th page: no `left` shift");
                    t.is(parseFloat(getStyle(depView, "top")), 0, "0th page: no `top` shift");

                    t.endAsync(async);
                });
            });

            t.it('Evaluate second page', function (t) {

                var async = t.beginAsync();

                setIframe(htmls[1].html, function () {
                    var depView = t.$('.sch-dependencyview-ct', iframe.contentWindow.document)[0];

                   var left = plugin.exporter.paperWidth + (gantt.lockedGrid.getWidth() - 1);

                    t.is(parseFloat(getStyle(depView, "left")), getLeftShift(1), "1st page: left shift is correct");
                    t.is(parseFloat(getStyle(depView, "top")), 0, "1st page: no `top` shift");

                    t.endAsync(async);
                });
            });

            t.it('Evaluate third page', function (t) {

                var async = t.beginAsync();

                setIframe(htmls[2].html, function () {
                    var depView = t.$('.sch-dependencyview-ct', iframe.contentWindow.document)[0];

                    t.is(parseFloat(getStyle(depView, "left")), getLeftShift(2), "2nd page: left shift is correct");
                    t.is(parseFloat(getStyle(depView, "top")), 0, "2nd page: no `top` shift");

                    t.endAsync(async);
                });


            });

            t.endAsync(async);
        });
    });

});
