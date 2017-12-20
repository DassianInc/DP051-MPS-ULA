StartTest(function (t) {

    t.expectGlobals('0');

    if (t.isOnline()) {
        //======================================================================================================================================================================================================================================================
        t.diag('Developers only test');

        return;
    }

    // Disable the warning about missing CSS file
    window.alert = Ext.emptyFn;

    Ext.Loader.setConfig({
        enabled        : true,
        disableCaching : true
    });

    Ext.Loader.setPath('Sch', '../../ExtScheduler3.x/js/Sch');
    Ext.Loader.setPath('Gnt', '../js/Gnt');

    // We should detect when files are not required properly
    var oldFn = Ext.Loader.syncRequire;
    Ext.Loader.syncRequire = function (file) {
        t.fail('FILE NOT REQUIRED:' + file);

        oldFn.apply(this, arguments);
    };

    // First load gnt-all.js into a page so we can 'reflect' and get all class names that
    // we should be able to load on demand (all columns + plugins)
    document.body.innerHTML = '<iframe id="0" src="data/dummy.html"/>';
    var frame = document.getElementById('0');

    t.chain(

        { waitFor : function() {
                return frame.contentWindow && frame.contentWindow.Ext && frame.contentWindow.Ext.isReady;
            }
        },

        function (next) {

            var Ext2 = frame.contentWindow.Ext;

            var columnClasses = Ext2.ClassManager.getNamesByExpression('widget.ganttcolumn.*');

            var pluginClasses = Ext2.ClassManager.getNamesByExpression('Gnt.plugin.*');

            t.requireOk(
                columnClasses.concat(pluginClasses).concat([
                    'Ext.ComponentQuery',
                    'Gnt.panel.Gantt'
                ]),

                function () {
                    var as = t.beginAsync();

                    Ext.onReady(function () {
                        t.endAsync(as);

                        t.ok(Gnt.panel.Gantt, "Gnt.panel.Gantt is here");

                        t.ok(Gnt.constraint.StartNoEarlierThan  && 
                             Gnt.constraint.StartNoLaterThan    &&
                             Gnt.constraint.FinishNoEarlierThan &&
                             Gnt.constraint.FinishNoLaterThan   &&
                             Gnt.constraint.MustStartOn         &&
                             Gnt.constraint.MustFinishOn,
                             "Constraint types are defined");

                        var gantt = t.getGantt({
                            columns : Ext.Array.map(columnClasses, function (clsName) {
                                return Ext.create(clsName);
                            }),

                            plugins : Ext.Array.map(pluginClasses, function (plug) {
                                return Ext.create(plug);
                            })
                        });

                        var someTask =  gantt.taskStore.getRootNode().firstChild;

                        // Make sure this doesn't trigger any UI action or break something
                        someTask.setConstraint('muststarton', new Date(1977, 0, 12));

                        t.is(someTask.getConstraintType(), '', 'Resolution not available, constraint rejected');

                        gantt.render(Ext.getBody());

                        t.ok(gantt.el, 'Gantt has been rendered with all supported columns + plugins');

                        someTask.setConstraint('muststarton', new Date(1977, 0, 13));

                        var conflictWin = t.cq1('constraintresolutionwindow');

                        // Need to close window to abort the flow properly
                        conflictWin.close();

                        next();
                    });
                }
            );
        },

        { waitForSelector : '.sch-gantt-item'}
    );
});
