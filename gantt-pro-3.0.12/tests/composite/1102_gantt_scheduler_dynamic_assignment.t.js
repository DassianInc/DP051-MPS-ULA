StartTest(function (t) {
    t.expectGlobals('App', 'MyApp', 'ExampleDefaults');

    function getGanttFromHostPage() {
        return t.cq1('ganttpanel');
    }

    t.describe("Gantt / Scheduler combination", function(t) {

        t.it([
            "Should not produce a JS error in case Gantt's task with 'Dynamic Assignment' scheduling mode is edited",
            "in a way leading to resource units allocation recalculation"
        ].join(' '), function(t) {

            t.chain(
                
                { waitFor : 'tasksAndDependenciesToRender' },

                { click : '>>#resourceschedule' },

                function(next) {
                    var gantt = getGanttFromHostPage(),
                        taskStore = gantt.getTaskStore(),
                        rootTask  = taskStore.getRootNode(),
                        investigateTask;

                    investigateTask = rootTask.findChild('Name', 'Investigate', true);

                    t.livesOk(function() {
                        investigateTask.setSchedulingMode('DynamicAssignment');
                        investigateTask.setEffort(9);
                        investigateTask.setEffort(10);
                    }, "No error should be produced during effort change of a task with Dynamic Assignment scheduling mode");
                }
            );
        });
    });
});
