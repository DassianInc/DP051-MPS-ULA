StartTest(function (t) {
    var gantt;

    var setup = function () {
        gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            plugins     : Ext.create('Gnt.plugin.Export', {
                printServer     : '../examples/export/server.php',
                pluginId        : 'exporter',
                openAfterExport : false
            }),
            columns     : [
                // Any regular Ext JS columns are ok
                {
                    xtype     : 'sequencecolumn',
                    width     : 40,

                    // This CSS class is added to each cell of this column
                    tdCls     : 'id'
                },
                {
                    xtype     : 'namecolumn',
                    width     : 200
                },
                {
                    xtype : 'startdatecolumn'
                },
                {
                    xtype : 'enddatecolumn'
                },
                {
                    xtype : 'durationcolumn'
                },
                {
                    xtype : 'percentdonecolumn',
                    width : 60
                },
                {
                    xtype               : 'predecessorcolumn',
                    useSequenceNumber   : true
                },
                {
                    xtype : 'addnewcolumn'
                }
            ]
        });
    };

    t.it('Should restore columns after multipage export', function (t) {

        setup();

        t.waitForRowsVisible(gantt, function () {

            var async = t.beginAsync(45000);

            gantt.doExport({
                format              : "Letter",
                orientation         : "portrait",
                range               : "complete",
                showHeader          : true,
                exporterId          : 'multipage'
            }, function (response) {

                t.endAsync(async);

                t.is(gantt.el.query('.x-splitter').length, 1, 'Splitter is ok');

                var result = Ext.Array.every(gantt.lockedGrid.headerCt.items.items, function (column) {
                    return column.isVisible();
                });

                t.ok(result, 'All columns are visible');

                gantt.destroy();

            });
        });

    });

    t.it('Should restore columnwidth after vertical export', function (t) {

        setup();

        t.waitForRowsVisible(gantt, function () {

            var async = t.beginAsync(45000);

            gantt.doExport({
                format              : "Letter",
                orientation         : "portrait",
                range               : "complete",
                showHeader          : true,
                exporterId          : 'multipagevertical'
            }, function (response) {

                t.endAsync(async);

                var exporter = gantt.getPlugin('exporter').exporter,
                    visibleColumns = exporter.visibleColumns;

                for (var i = 0; i < visibleColumns.length; i++) {
                    var columnWrap = visibleColumns[i];
                    t.is(columnWrap.column.getWidth(), columnWrap.width, columnWrap.column.text + ' has correct width');
                }

                t.is(gantt.el.query('.x-splitter').length, 1, 'Splitter is ok');

                var result = Ext.Array.every(gantt.lockedGrid.headerCt.items.items, function (column) {
                    return column.isVisible();
                });

                t.ok(result, 'All columns are visible');

                gantt.destroy();

            });
        });

    });
});