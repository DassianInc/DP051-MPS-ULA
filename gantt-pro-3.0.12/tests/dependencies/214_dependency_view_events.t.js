StartTest(function (t) {

    /**
     * @event beforedependencydrag
     * Fires before a dependency drag operation starts (from a "task terminal"). Return false to prevent this operation from starting.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The source task record
     */

    /**
     * @event dependencydragstart
     * Fires when a dependency drag operation starts
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     */

    /**
     * @event dependencydrop
     * Fires when a dependency drag drop operation has completed successfully and a new dependency has been created.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} fromRecord The source task record
     * @param {Gnt.model.Task} toRecord The destination task record
     * @param {Int} type The dependency type
     */

    /**
     * @event afterdependencydragdrop
     * Always fires after a dependency drag-drop operation, even if the drop was deemed invalid.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     */


    var getDataSet = function () {
        var dependencyStore = t.getDependencyStore({data : [] });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            cascadeDelay    : 0,

            root : {
                expanded : false,

                children : [
                    {
                        Id        : 1,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 1),
                        EndDate   : new Date(2011, 6, 5)
                    },
                    {
                        Id        : 2,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 5),
                        EndDate   : new Date(2011, 6, 20)
                    }
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }

    t.it('Should fire events for a valid drop', function (t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore
        var gantt = t.getGantt2({
            height          : 200,
            startDate       : new Date(2011, 6, 1),
            endDate         : new Date(2011, 6, 28),
            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            renderTo        : Ext.getBody()
        });

        var ganttView = gantt.getSchedulingView();

        t.willFireNTimes(ganttView, 'beforedependencydrag', 1);
        t.willFireNTimes(ganttView, 'dependencydragstart', 1);
        t.willFireNTimes(ganttView, 'dependencydrop', 1);
        t.willFireNTimes(ganttView, 'afterdependencydragdrop', 1);

        t.chain(
            { waitFor : 'rowsVisible' },

            { action : 'moveCursorTo', target : '.sch-gantt-item' },

            { action : 'moveCursorTo', target : '.sch-gantt-item .sch-gantt-terminal-end' },

            { action : 'mouseDown' },

            { action : 'moveCursorTo', target : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

            { action : 'moveCursorTo', target : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start' },

            { action : 'mouseUp' },

            function(next) {
                t.selectorNotExists('.sch-gantt-dep-dd-dragging', 'Should not find sch-gantt-dep-dd-dragging class after drop');
                next();
            }
        )
    })

    t.it('Should fire events for an invalid drop', function (t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore
        var gantt = t.getGantt2({
            itemId          : 'gantt2',
            height          : 200,
            startDate       : new Date(2011, 6, 1),
            endDate         : new Date(2011, 6, 28),
            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            renderTo        : Ext.getBody()
        });

        var ganttView = gantt.getSchedulingView();

        t.willFireNTimes(ganttView, 'beforedependencydrag', 1);
        t.willFireNTimes(ganttView, 'dependencydragstart', 1);
        t.willFireNTimes(ganttView, 'dependencydrop', 0);
        t.willFireNTimes(ganttView, 'afterdependencydragdrop', 1);

        t.chain(
            { waitFor : 'rowsVisible' },

            { action : 'moveCursorTo', target : '#gantt2 => .sch-gantt-item' },

            { 'drag' : '#gantt2 => .sch-gantt-item .sch-gantt-terminal-end', to : [1,1] },

            // Allow repair to finish first which delays the final event
            { waitFor : 1000 }
        )
    })
})
