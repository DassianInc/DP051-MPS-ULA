StartTest(function (t) {

    //======================================================================================================================================================================================================================================================
    t.diag('Tasks in store miss start/date/name field but should still render ok')

    var start = new Date(2010, 0, 1),
        end = Sch.util.Date.add(start, Sch.util.Date.MONTH, 10);

    t.expectGlobal('TaskModelWithBaseline');

    Ext.define("TaskModelWithBaseline", {
        extend : "Gnt.model.Task"
    });
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        model : 'TaskModelWithBaseline',
        proxy : {
            type   : 'memory',
            reader : {
                type : 'json'
            },
            data   : [
                {
                    "BaselineStartDate" : "2010-01-04",
                    "StartDate"         : "2010-01-04",
                    "EndDate"           : "2010-01-18",
                    "Id"                : 1,
                    "leaf"              : true,
                    "Name"              : "Investigate",
                    "ParentId"          : null
                },
                {
                    "BaselineEndDate"     : "2010-01-14",
                    "EndDate"             : "2010-01-18",
                    "Id"                  : 2,
                    "leaf"                : true,
                    "Name"                : "Investigate2",
                    "ParentId"            : null,
                    "BaselineStartDate"   : "2010-01-14",
                    "PercentDone"         : 30,
                    "BaselinePercentDone" : 10
                },
                {
                    "StartDate"   : "2010-01-18",
                    "Id"          : 3,
                    "leaf"        : true,
                    "ParentId"    : null,
                    "PercentDone" : 30
                },
                {
                    "Id"       : 4,
                    "leaf"     : true,
                    "Name"     : "Investigate3",
                    "ParentId" : null
                }
            ]
        },
        root  : {
            expanded : true
        }
    });
    taskStore.load();

    var gantt = t.getGantt({
        showBaseline : true,
        renderTo     : Ext.getBody(),
        taskStore    : taskStore,
        loadMask     : true
    });

    t.waitForEventsToRender(gantt, function () {
        var ganttView = gantt.getSchedulingView();

        ganttView.el.select(ganttView.eventWrapSelector).remove();

        ganttView.el.select('.x-grid-cell-inner').each(function (cellEl) {
            t.isStrict(Ext.String.trim(cellEl.dom.innerHTML.replace('&nbsp;', '')), '', 'Cell is empty as expected');
        })
    })
})    
