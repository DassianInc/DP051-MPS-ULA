StartTest(function (t) {

    function setup(config, storeConfig) {

        var taskStore   = t.getTaskStore(storeConfig);


        return t.getGantt(Ext.apply({
            renderTo    : Ext.getBody(),
            plugins     : [
                'gantt_taskeditor',
                {
                    ptype           : 'gantt_projecteditor',
                    // for project editor we use right click event to not sporadically
                    // interfere with collapse/exand which happens on left button click
                    triggerEvent    : 'taskcontextmenu'
                }
            ],
            startDate   : new Date(2015, 0, 1),
            endDate     : Sch.util.Date.add(new Date(2015, 0, 1), Sch.util.Date.WEEK, 20),
            taskStore   : taskStore
        }, config));

    }

    t.it('Switch Project/Task editor plugin', function (t) {

        var gantt           = setup(null, {
            DATA            : [ t.getProject('Project') ]
        });


        t.chain(
            { waitForEventsToRender : gantt },
            { rightclick : '.Project' },
            { waitForCQVisible : 'projecteditor' },

            function (next) {
                t.isInstanceOf(gantt.projectEditor, Gnt.plugin.taskeditor.ProjectEditor, 'Editor plugin is projecteditor');
                t.isInstanceOf(gantt.projectEditor.taskEditor, Gnt.widget.taskeditor.ProjectEditor, 'Editor widget is projecteditor');

                gantt.projectEditor.close();
                next();
            },

            { doubleclick : '.Project_task_1' },
            { waitForCQVisible : 'taskeditor' },

            function (next) {
                t.isInstanceOf(gantt.taskEditor, Gnt.plugin.taskeditor.TaskEditor, 'Editor plugin is taskeditor');
                t.isInstanceOf(gantt.taskEditor.taskEditor, Gnt.widget.taskeditor.TaskEditor, 'Editor widget is taskeditor');

                gantt.taskEditor.close();
            }
        );

    });
});