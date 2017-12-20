StartTest(function (t) {

    t.it('Should be able to reload store without side effects, using cascadeChanges', function (t) {

        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            autoLoad : true,
            proxy    : {
                type   : 'ajax',
                url    : 'data/crud/get-dependencies.json',
                method : 'GET',
                reader : {
                    type : 'json'
                }
            }
        });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,

            cascadeChanges : true,
            cascadeDelay   : 0,

            autoSync : false,
            autoLoad : false,

            proxy : {
                type : 'ajax',

                api : {
                    read : 'data/crud/get-tasks-collapsed.js'
                },

                method : 'GET',
                reader : {
                    type : 'json'
                }
            },

            root : {
                expanded : true
            }
        });

        var gantt = t.getGantt({
            height          : 200,
            renderTo        : Ext.getBody(),
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        });

        t.waitForStoresToLoad(taskStore, dependencyStore, function () {
            var renderedNodes = gantt.lockedGrid.getView().getNodes();

            t.is(renderedNodes.length, 5, '5 rendered rows');
            t.is(taskStore.getTotalTaskCount(), 8, '8 tasks in store');

            t.getFirstParentTask(gantt).expand(true);
            t.waitFor(1000, function () {

                t.waitForStoresToLoad(taskStore, function () {
                    t.is(taskStore.getTotalTaskCount(), 8, 'Store was reloaded, 8 tasks in store');
                    var renderedNodes = gantt.lockedGrid.getView().getNodes();

                    t.is(renderedNodes.length, 5, '5 rendered rows');
                })

                taskStore.load();
                t.is(taskStore.getTotalTaskCount(), 0, 'Store cleared after initiating load');
            })
        })
    })

    t.it('Should be able to reload store without side effects, such as duplicated data', function (t) {
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            proxy : {
                type   : 'ajax',
                method : 'GET',
                url    : 'data/tasks.js'
            }
        });

        var gantt = Ext.create("Gnt.panel.Gantt", {
            taskStore : taskStore,
            width     : 400,
            height    : 400,
            renderTo  : Ext.getBody(),
            columns   : [
                {
                    xtype     : 'treecolumn',
                    dataIndex : 'Id'
                }
            ]
        });

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                var renderedNodes = gantt.lockedGrid.getView().getNodes();

                t.is(renderedNodes.length, 2, '2 rendered rows');
                t.is(taskStore.getTotalTaskCount(), 2, '2 tasks in store');

                setTimeout(function () {
                    gantt.getSchedulingView().on('refresh', next, null, { single : true});
                    taskStore.load();
                }, 100);
            },

            { waitForRowsVisible : gantt },

            function (next) {
                var renderedNodes = gantt.lockedGrid.getView().getNodes();

                t.is(renderedNodes.length, 2, '2 rendered rows');
                t.is(taskStore.getTotalTaskCount(), 2, '2 tasks in store');
            }
        );
    })

})    
