StartTest(function(t) {
    Ext.define('Gnt.MyModel', {
        extend : 'Gnt.model.Task'
    });

    var taskStore = t.getTaskStore({
        model : 'Gnt.MyModel',
        DATA : [{
            "Id" : 1,
            "Name" : "name1",
            "StartDate" : "2010-01-18",
            "Duration" : 11,
            "expanded" : true,
            "children" : [
                {
                    "Id" : 11,
                    "leaf" : true,
                    "Name" : "name2",
                    "StartDate" : "2010-01-18",
                    "Duration" : 8
                },
                {
                    "Id" : 12,
                    "leaf" : true,
                    "Name" : "name3",
                    "StartDate" : "2010-01-18",
                    "Duration" : 0
                }
            ]
        }]
    });

    var gantt = t.getGantt2({
        taskStore               : taskStore,
        viewPreset              : 'weekAndDayLetter',
        renderTo                : Ext.getBody(),
        parentTaskBodyTemplate  : '<span id="1">{foo}</span>',
        taskBodyTemplate        : '<span id="2">{[values.record.data.Name]}</span>',
        milestoneBodyTemplate   : '<span id="3">{[values.record.data.leaf]}</span>',
        eventRenderer           : function (task) {
            return { foo : 'foo value' };
        }
    });

    t.waitForEventsToRender(gantt, function () {
        t.selectorExists('#1', 'Should be able to customize task body template');
        t.contentLike(document.getElementById('1'), 'foo value', 'Should be able to read model fields');

        t.selectorExists('#2', 'Should be able to customize parent task body template');
        t.contentLike(document.getElementById('2'), 'name2', 'Should be able to read model fields');

        t.selectorExists('#3', 'Should be able to customize milestone task body template');
        t.contentLike(document.getElementById('3'), 'true', 'Should be able to read model fields');
    });
});
