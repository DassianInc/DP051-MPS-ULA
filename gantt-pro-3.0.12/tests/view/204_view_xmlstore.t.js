StartTest(function (t) {
    t.diag('TreeStore throws exception in IE when loading & parsing nested data in Ext 4.0.x');

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        model   : 'Gnt.model.Task',
        proxy   : {
            type   : 'ajax',
            method : 'GET',
            url    : 'data/tasks.xml',
            reader : {
                type         : 'xml',
                // records will have a 'Task' tag
                record       : "Task",
                rootProperty : "Tasks"
            }
        },
        sorters : [
            {
                property  : 'leaf',
                direction : 'ASC'
            }
        ]
    });

    var gantt = t.getGantt({
        taskStore : taskStore,
        width     : 300,
        renderTo  : Ext.getBody()
    });

    t.waitForRowsVisible(gantt, function () {
        t.pass('Rendered gantt ok with XML input');
        gantt.setWidth(1000)
    });
})    

