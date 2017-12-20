StartTest(function (t) {

    t.it('Should find task model data applied to task template, when not using eventRenderer', function (t) {
        var g = t.getGantt({
            renderTo         : Ext.getBody(),
            taskStore        : new Gnt.data.TaskStore({ proxy : 'memory' }),
            taskBodyTemplate : '<span class="leaf">leaf:{leaf} Name:{Name}</span>'
        });

        var newTask = new g.taskStore.model({
            Name      : 'TheName',
            StartDate : g.getStart(),
            EndDate   : g.getEnd(),
            Cls       : 'foo',
            leaf      : true
        });
        g.taskStore.getRootNode().appendChild(newTask);

        var el = g.getSchedulingView().getElementFromEventRecord(newTask);
        var inner = el.dom.innerHTML;

        t.hasCls(el, 'foo', 'Found Cls class ok');

        t.like(inner, 'leaf:true')
        t.like(inner, 'Name:TheName')
    })

    t.it('Should find task model data applied to task template, when not using eventRenderer', function (t) {
        var g = t.getGantt({
            renderTo         : Ext.getBody(),
            taskStore        : new Gnt.data.TaskStore({ proxy : 'memory' }),
            taskBodyTemplate : '<span class="leaf">leaf:{leaf} Name:{Name}</span>',

            eventRenderer    : function() { return { Name : 'OverrideName'}; }
        });

        var newTask = new g.taskStore.model({
            Name      : 'TheName',
            StartDate : g.getStart(),
            EndDate   : g.getEnd(),
            Cls       : 'foo',
            leaf      : true
        });
        g.taskStore.getRootNode().appendChild(newTask);

        var el = g.getSchedulingView().getElementFromEventRecord(newTask);
        var inner = el.dom.innerHTML;

        t.like(inner, 'leaf:true')
        t.like(inner, 'Name:OverrideName')
    })
})
