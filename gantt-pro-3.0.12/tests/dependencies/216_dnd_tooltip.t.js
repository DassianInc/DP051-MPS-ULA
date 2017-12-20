StartTest(function (t) {
    t.diag('Gantt dependency proxy drag tooltip should be set properly');

    var getDataSet = function () {
        var dependencyStore = t.getDependencyStore({data : [] });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            cascadeDelay    : 0,

            root : {
                children : [
                    {
                        Id        : 1,
                        Name      : 'Test 1',
                        leaf      : true,
                        StartDate : new Date(2011, 6, 5),
                        EndDate   : new Date(2011, 6, 10)
                    },
                    {
                        Id        : 2,
                        Name      : 'Test 2',
                        leaf      : true,
                        Cls       : 'Test2',
                        StartDate : new Date(2011, 6, 1),
                        EndDate   : new Date(2011, 6, 5)
                    }
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }

    var dataSet = getDataSet()
    var taskStore = dataSet.taskStore
    var dependencyStore = dataSet.dependencyStore

    var gantt = t.getGantt2({
        startDate       : new Date(2011, 6, 1),
        endDate         : new Date(2011, 6, 28),
        taskStore       : taskStore,
        width           : 400,
        height          : 200,
        dependencyStore : dependencyStore,
        renderTo        : Ext.getBody()
    });


    var assertDragDropLabels = function(fromLabel, toLabel){

        var toolTip = Ext.getBody().down('.sch-dd-dependency');

        t.ok(toolTip, 'Tooltip is here');

        var from =  toolTip.down('.sch-dd-dependency-from');

        t.ok(from, 'From label is there');

        var fromNameEl = toolTip.down('.sch-dd-dependency-from-name');

        t.ok(fromNameEl, 'From name is there');

        t.contentLike(fromNameEl, fromLabel, 'From label is correct');

        var to = toolTip.down('.sch-dd-dependency-to');

        t.ok(to, 'To label is there');

        var toName = toolTip.down('.sch-dd-dependency-to-name');

        t.ok(toName, 'To name is there');

        var toNameValue = toolTip.down('span.sch-dd-dependency-to-name');

        t.contentLike(toNameValue, toLabel, 'To label is correct');

    }

    t.it('Should drag dependency from Task 1 Start to Task 2 Start', function (t) {

        t.chain(

            { action : 'moveCursorTo', target : '.sch-gantt-task-bar' },

            { action : 'moveCursorTo', target : '.sch-gantt-task-bar .sch-gantt-terminal-start' },

            {
                drag      : '.sch-gantt-task-bar .sch-gantt-terminal-start',
                dragOnly  : true,
                to        :  '.Test2'
            },

            { action : 'moveCursorTo', target : '.Test2 .sch-gantt-terminal-start' },

            function(next){

                assertDragDropLabels('Test 1', 'Test 2');
                next();

            },

            { action : 'mouseUp' }
        );
    });

    t.it('Should drag dependency from Task 1 End to Task 2 End', function (t) {

        t.chain(

            { action : 'moveCursorTo', target : '.sch-gantt-task-bar' },

            { action : 'moveCursorTo', target : '.sch-gantt-task-bar .sch-gantt-terminal-end' },

            {
                drag      : '.sch-gantt-task-bar .sch-gantt-terminal-end',
                dragOnly  : true,
                to        :  '.Test2'
            },

            { action : 'moveCursorTo', target : '.Test2' },

            { action : 'moveCursorTo', target : '.Test2 .sch-gantt-terminal-end' },

            function(next){

                assertDragDropLabels('Test 1', 'Test 2');
                next();

            },

            { action : 'mouseUp' },

            function (next) {

                gantt.destroy()
            }
        );
    });

})
