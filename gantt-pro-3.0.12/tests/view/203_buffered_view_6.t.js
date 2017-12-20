StartTest(function (t) {
    t.it('Scroll width should not be affected by collapse/expand all', function (t) {

        var arr = [],
            i, j, k,
            cn, cn2,
            dt = new Date(2010, 0, 5);

        for (var i = 1; i < 10; i++) {
            cn = [];
            for (j = 1; j < 10; j++) {
                cn2 = [];
                for (k = 1; k < 10; k++) {
                    cn2.push({
                        Id        : 100 * i + 10 * j + k,
                        Name      : 'Child task ' + String(i) + String(j) + String(k),
                        StartDate : dt,
                        Duration  : 2,
                        leaf      : true
                    });
                }
                cn.push({
                    Id        : 100 * i + 10 * j,
                    Name      : 'Child task ' + String(i) + String(j),
                    StartDate : dt,
                    Duration  : 2,
                    expanded  : true,
                    children  : cn2
                });
                dt = Ext.Date.add(dt, Ext.Date.DAY, 7)
            }
            arr.push({
                Id        : 100 * i,
                Name      : 'Root task #' + i,
                StartDate : new Date(2010, 0, 5),
                EndDate   : dt,
                children  : cn,
                expanded  : true
            });
        }

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            sortOnLoad : false,
            root       : {
                expanded : true
            },
            proxy      : {
                type : 'memory'
            }
        });

        taskStore.proxy.data = arr

        taskStore.load()

        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            proxy : 'memory',
            data  : [
                { From : 112, To : 115, Type : 2},
                { From : 111, To : 200, Type : 0}
            ]
        });

        var gantt = Ext.create('Gnt.panel.Gantt', {
            height            : 400,
            width             : 500,
            renderTo          : document.body,
            rightLabelField   : 'Name',
            highlightWeekends : false,
            loadMask          : true,
            cascadeChanges    : false,

            viewPreset : 'weekAndDayLetter',

            startDate : new Date(2010, 0, 4),
            endDate   : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 20),

            // Setup your static columns
            columns   : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'percentdonecolumn'
                }
            ],

            taskStore       : taskStore,
            dependencyStore : dependencyStore,

            plugins : new Ext.grid.plugin.BufferedRenderer()
        });


        var schedulingView = gantt.getSchedulingView()
        var scrollWidth;

        t.chain(
            { waitForRowsVisible : gantt },
            { waitFor : 100 },

            function (next) {
                gantt.collapseAll();
                t.waitFor(100, next);
            },

            function (next) {
                scrollWidth = schedulingView.el.dom.scrollWidth

                gantt.expandAll();
                t.waitFor(100, next);
            },

            function (next) {
                t.is(schedulingView.el.dom.scrollWidth, scrollWidth, 'Scroll width should not be affected by collapse/expand all')
            }
        )
    })

    t.it('Should not crash when calling setRootNode with empty store', function (t) {
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            proxy : 'memory',
            root  : { text : 'Root', expanded : true }
        });

        var g = t.getGantt({
            renderTo  : document.body,
            taskStore : taskStore,
            plugins   : 'bufferedrenderer'
        });

        taskStore.setRootNode({
            children : [{
                expanded  : true,
                leaf      : false

                // Works ok if uncommenting this
                // ,children  : []
            }]
        });
    })
})
