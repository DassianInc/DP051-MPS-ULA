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

    var plugin  = new Gnt.plugin.Export({
        printServer : 'none',
        openAfterExport : false,
        test        : true
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        rootVisible : false,
        proxy       : 'memory'

    });

    var cm = new Gnt.data.CrudManager({
        autoLoad    : true,
        taskStore   : taskStore,
        transport   : {
            load    : {
                method  : 'GET',
                url     : 'export/load.json'
            },
            sync    : {
                url     : 'TODO'
            }
        }
    });

    var config = {
        startDate : new Date(2010, 0, 11),
        endDate   : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 20),
        viewPreset : 'weekAndDayLetter',
        renderTo : Ext.getBody(),
        plugins : plugin,
        taskStore : taskStore
    };

    var gantt = t.getGantt(config);


    t.waitForRowsVisible(gantt, function() {

        var async = t.beginAsync(45000);

        var exported = plugin.doExport({
            format              : "A4",
            orientation         : "landscape",
            range               : "complete",
            showHeader          : true,
            exporterId          : 'multipagevertical'
        }, function (result) {

            t.endAsync(async);

            var htmls = result.htmlArray;

            t.is(htmls.length, 2, "2 pages exported");

            var expectedTop = 0,
                exporter = plugin.exporter,
                rows = exporter.normalRows;

            for (var i = 0; i < rows.length; i++) {

                if (expectedTop + rows[i].height < exporter.printHeight) {
                    expectedTop += rows[i].height;
                }
                else {
                    break;
                }
            }

            setIframe(htmls[1].html, function () {
                var depView = t.$('.sch-dependencyview-ct', iframe.contentWindow.document)[0];
                t.is(parseFloat(getStyle(depView, "top")), -1 * expectedTop, "Secondpage has correct dependency topshift");
            });

        });

    });

});
