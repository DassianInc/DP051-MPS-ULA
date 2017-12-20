StartTest({
    overrideSetTimeout : false
}, function (t) {

    t.it('Locked section columns should be aligned', function (t) {

        var plug  = Ext.create('Gnt.plugin.Printable', { autoPrintAndClose : false });

        var g     = t.getGantt({
            renderTo          : Ext.getBody(),
            plugins           : plug,
            dependencyStore   : t.getDependencyStore(),
            taskStore         : t.getTaskStore({
                DATA : [
                    {
                        Name      : 'Resource1 Something verrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrry loooooooooooooooooong',
                        leaf      : true,
                        Id        : 1,
                        StartDate : new Date(2010, 1, 3),
                        EndDate   : new Date(2010, 1, 5)
                    }
                ]
            }),
            columns : [
                {
                    xtype : 'namecolumn',
                    cls   : 'hd-name',
                    tdCls : 'cell-name',
                    width : 200
                },
                {
                    xtype : 'startdatecolumn',
                    cls   : 'hd-date',
                    tdCls : 'cell-date',
                    width : 100
                },
                {
                    xtype : 'durationcolumn',
                    cls   : 'hd-dur',
                    tdCls : 'cell-dur',
                    width : 300
                }
            ],
            lockedGridConfig  : {
                width       : 300
            }
        });

        t.chain(
            { waitForRowsVisible : g },

            function (next) {

                plug.doExport({
                    format      : 'A4',
                    orientation : 'portrait',
                    range       : 'complete',
                    exporterId  : 'multipage'
                });

                next();
            },

            {
                // wait till page being printed gets loaded completely
                waitFor : function () {
                    return plug.printWindow && plug.printWindow.document && plug.printWindow.document._loaded;
                }
            },

            function () {
                var win = plug.printWindow;
                var doc = win.document;

                t.isApprox(doc.querySelectorAll('.hd-name')[0].clientWidth, 200);
                t.isApprox(doc.querySelectorAll('.cell-name')[0].clientWidth, 200);

                t.isApprox(doc.querySelectorAll('.hd-date')[0].clientWidth, 100);
                t.isApprox(doc.querySelectorAll('.cell-date')[0].clientWidth, 100);

                t.isApprox(doc.querySelectorAll('.hd-dur')[0].clientWidth, 300);
                t.isApprox(doc.querySelectorAll('.cell-dur')[0].clientWidth, 300);

                win.close();

                g.destroy();
            }

        );
    });

    t.it('Should work with hidden columns and collapsed locked section', function (t) {

        var plug = new Gnt.plugin.Printable({ autoPrintAndClose : false });

        var g = t.getGantt({
            highlightWeekends : true,
            showTodayLine     : true,
            renderTo          : Ext.getBody(),
            viewConfig        : { forceFit : true },
            plugins           : plug,
            columns           : [
                { xtype : 'treecolumn' },
                { xtype : 'startdatecolumn' }
            ],
            dependencyStore   : t.getDependencyStore({
                data : [
                    { From : 1, To : 2, Type : 2},
                    { From : 2, To : 3, Type : 2}
                ]
            }),
            taskStore         : t.getTaskStore({
                DATA : [
                    { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), EndDate : new Date(2010, 1, 5) },
                    { leaf : true, Id : 2, StartDate : new Date(2010, 1, 5), EndDate : new Date(2010, 1, 7) },
                    { leaf : true, Id : 3, StartDate : new Date(2010, 1, 11), EndDate : new Date(2010, 1, 11) }
                ]
            }),
            lockedGridConfig  : {
                width       : 300,
                collapsible : true
            }
        });

        t.chain(
            { waitForRowsVisible : g },

            function (next) {

                g.getSchedulingView(0).highlightCriticalPaths();
                g.lockedGrid.collapse();

                plug.doExport({
                    format      : 'A4',
                    orientation : 'portrait',
                    range       : 'complete',
                    exporterId  : 'multipage'
                });

                next();
            },

            {
                // wait till page being printed gets loaded completely
                waitFor : function () {
                    return plug.printWindow && plug.printWindow.document && plug.printWindow.document._loaded;
                }
            },

            function () {
                var win = plug.printWindow;
                var bodyHtml = win.document.body.innerHTML;

                win.close();

                t.like(bodyHtml, 'sch-timeline', 'Found rendered column line');
                t.like(bodyHtml, 'sch-zone', 'Found rendered zone');
                t.like(bodyHtml, 'sch-gantt-critical-chain', 'Found highlighted view class');
                t.like(bodyHtml, 'sch-gantt-task-highlighted', 'Found highlighted task');
                t.like(bodyHtml, 'sch-dependency-selected', 'Found highlighted task');
                g.destroy();
            }
        );
    });
});
