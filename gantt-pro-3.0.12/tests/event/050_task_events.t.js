StartTest(function (t) {

    var taskStore = t.getTaskStore({
        autoLoad : false,
        proxy    : 'memory',
        root     : {
            Id        : 0,
            expanded  : true
        }
    });

    taskStore.getRootNode().appendChild(new taskStore.model({
        "EndDate"     : Ext.Date.parse("2010-01-19", 'Y-m-d'),
        "Id"          : 11,
        "leaf"        : true,
        "StartDate"   : Ext.Date.parse("2010-01-17", 'Y-m-d')
    }));

    taskStore.getRootNode().appendChild(new taskStore.model({
        "EndDate"     : Ext.Date.parse("2010-01-19", 'Y-m-d'),
        "Id"          : 21,
        "leaf"        : true,
        "StartDate"   : Ext.Date.parse("2010-01-17", 'Y-m-d')
    }));

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        data     : [
            {
                "From" : 11,
                "To"   : 21,
                "Type" : 2
            }
        ]
    });

    var g = t.getGantt({
        renderTo        : Ext.getBody(),
        startDate       : new Date(2010, 0, 4),
        endDate         : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 10),
        taskStore       : taskStore,
        dependencyStore : dependencyStore
    });


    function verifyTaskEventSignature() {
        t.isInstanceOf(arguments[0], Gnt.view.Gantt);
        t.isInstanceOf(arguments[1], Gnt.model.Task);
        t.ok(arguments[2].getTarget, Gnt.model.Dependency);
    }

    function verifyDependencyEventSignature() {
        t.isInstanceOf(arguments[0], Gnt.view.Dependency);
        t.ok(arguments[1], Gnt.model.Dependency);
        t.ok(arguments[2].getTarget, Gnt.model.Dependency);
        t.ok(arguments[3], Ext.isIE8 ? Element : HTMLElement);
    }

    g.on({
        taskclick          : verifyTaskEventSignature,
        taskdblclick       : verifyTaskEventSignature,
        taskcontextmenu    : verifyTaskEventSignature,
        dependencydblclick : verifyDependencyEventSignature
    });

    t.firesOk({
        observable : g,
        events     : {
            taskclick          : 3,
            taskdblclick       : 1,
            taskcontextmenu    : 1,
            dependencydblclick : 1
        }
    });

    t.chain(
        { click : '.sch-gantt-task-bar' },
        { action : 'contextmenu', target : '.sch-gantt-task-bar' },
        { dblclick : '.sch-gantt-task-bar' },

        { dblclick : '.sch-dependency-line-v:last' }
    );
});
