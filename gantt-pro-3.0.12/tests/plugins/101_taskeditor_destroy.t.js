StartTest(function(t) {
    // Ensure that task editor plugin clear all listeners to gantt panel on destroying #1364

    var taskEditor = new Gnt.plugin.TaskEditor({
        enableProjectEditor : true
    });

    var g = t.getGantt({
        renderTo        : Ext.getBody(),
        resourceStore   : t.getResourceStore(),
        forceFit        : true
    });

    t.snapShotListeners(g, 'gantt');

    taskEditor.init(g);

    taskEditor.destroy();

    t.verifyListeners(g, 'gantt', 'task editor dropped all its listeners');
});
