StartTest(function (t) {

    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            data : [
                {
                    From : 3,
                    To   : 4,
                    Type : 2
                }
            ]
        });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            cascadeChanges  : true,
            cascadeDelay    : 0,
            root            : {
                expanded : true,
                children : [
                    {
                        Id        : 1,
                        StartDate : new Date(2015, 6, 16),
                        Duration  : 6,
                        expanded  : true,
                        children : [
                            {
                                Id        : 2,
                                leaf      : true,
                                ReadOnly  : true,
                                StartDate : new Date(2015, 6, 16),
                                Duration  : 4
                            },
                            {
                                Id        : 3,
                                leaf      : true,
                                StartDate : new Date(2015, 6, 18),
                                Duration  : 4
                            }
                        ]
                    },
                    {
                        Id        : 4,
                        expanded  : true,
                        ReadOnly  : true,
                        StartDate : new Date(2015, 6, 22),
                        EndDate   : new Date(2015, 6, 24),
                        children : [
                            {
                                Id        : 5,
                                leaf      : true,
                                ReadOnly  : true,
                                StartDate : new Date(2015, 6, 16),
                                EndDate   : new Date(2015, 6, 20)
                            }
                        ]
                    }
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    };

    t.it('Child tasks inherit their parent readonly status', function (t) {
        var taskStore = getDataSet().taskStore;

        taskStore.getNodeById(3).appendChild({
            Id        : 33,
            leaf      : true,
            StartDate : new Date(2015, 6, 16),
            Duration  : 4
        });

        taskStore.getNodeById(1).setReadOnly(true);

        t.ok(taskStore.getNodeById(2).isReadOnly(), 'task #2 is readonly');
        t.ok(taskStore.getNodeById(3).isReadOnly(), 'task #3 is readonly');
        t.ok(taskStore.getNodeById(33).isReadOnly(), 'task #33 is readonly');

        taskStore.getNodeById(1).setReadOnly(false);

        t.ok(taskStore.getNodeById(2).isReadOnly(), 'task #2 is readonly');
        t.notOk(taskStore.getNodeById(3).isReadOnly(), 'task #3 is not readonly');
        t.notOk(taskStore.getNodeById(33).isReadOnly(), 'task #33 is not readonly');
    });


    t.it('Readonly child should not update on parent move', function (t) {
        var dataSet   = getDataSet();
        var taskStore = dataSet.taskStore;
        var parent    = taskStore.getNodeById(1);

        parent.setStartDate(new Date(2015, 6, 20), true);

        t.isDateEqual(parent.getStartDate(), taskStore.getNodeById(2).getStartDate(), 'task#1 start aligned to task#2 (r/o) start');
        t.isDateEqual(parent.getEndDate(), new Date(2015, 6, 28), 'task#1 end updated');

        t.isDateEqual(taskStore.getNodeById(2).getStartDate(), new Date(2015, 6, 16), 'task#2 (r/o) start not updated');
        t.isDateEqual(taskStore.getNodeById(2).getEndDate(), new Date(2015, 6, 22), 'task#2 (r/o) end not updated');

        t.isDateEqual(taskStore.getNodeById(3).getStartDate(), new Date(2015, 6, 22), 'task#3 start updated');
        t.isDateEqual(taskStore.getNodeById(3).getEndDate(), new Date(2015, 6, 28), 'task#3 end updated');

        t.isDateEqual(taskStore.getNodeById(4).getStartDate(), new Date(2015, 6, 22), 'task#4 (r/o) start is intact');
        t.isDateEqual(taskStore.getNodeById(4).getEndDate(), new Date(2015, 6, 24), 'task#4 is intact');
    });


    t.it('Cascade after dependency add', function (t) {

        var taskStore = getDataSet().taskStore;
        taskStore.getNodeById(3).setReadOnly(true);

        taskStore.dependencyStore.add({
            From : 2,
            To   : 3,
            Type : 2
        });

        t.is(taskStore.dependencyStore.getCount(), 2, 'dependencyStore has two dependencies');
        t.isDateEqual(taskStore.getNodeById(3).getStartDate(), new Date(2015, 6, 18), 'Child 2 start not updated');

    });


    t.it('ReadOnly task should normalize as a normal task', function (t) {

        var task         = new Gnt.model.Task({
            Duration     : 0,
            DurationUnit : "d",
            ReadOnly     : true,
            StartDate    : new Date(2015, 6, 15)
        });

        task.setCalendar(new Gnt.data.Calendar({ calendarId : 'foo' }));

        task.normalize();

        t.is(task.isReadOnly(), true, 'Task is readonly');

        t.ok(task.normalized, 'Task indicated as normalized');
        t.is(task.getDuration(), 0, 'Task duration 0');
        t.is(task.getStartDate(), new Date(2015, 6, 15), 'Task start date ok');
        t.is(task.getEndDate(), new Date(2015, 6, 15), 'Task end date ok should be same as start date, since duration is 0');

        // If end is specified as inclusive, the below should give an adjusted end date of 2012-06-23 00:00:00
        task             = new Gnt.model.Task({
            Duration     : 5,
            DurationUnit : "d",
            ReadOnly     : true,
            StartDate    : "2015-07-20",
            EndDate      : "2015-07-24"
        });

        task.inclusiveEndDate = true;
        task.setCalendar(new Gnt.data.Calendar({ calendarId : 'bar' }));
        task.normalize();

        t.is(task.isReadOnly(), true, 'Task is readonly');

        t.is(task.getDuration(), 5, 'Task duration 5');
        t.is(task.getStartDate(), new Date(2015, 6, 20), 'Task start date ok');
        t.is(task.getEndDate(), new Date(2015, 6, 25), 'Task end date adjusted to start of next day');

        task             = new Gnt.model.Task({
            Duration     : 4,
            DurationUnit : "d",
            ReadOnly     : true,
            StartDate    : "2015-07-20T10:00:00",
            EndDate      : "2015-07-24T10:00:00"
        });
        task.inclusiveEndDate = true;
        task.setCalendar(new Gnt.data.Calendar({ calendarId : 'lorem' }));
        task.normalize();

        t.is(task.isReadOnly(), true, 'Task is readonly');
        t.is(task.getDuration(), 4, 'Task duration 4');
        t.is(task.getStartDate(), new Date(2015, 6, 20, 10), 'inclusiveEndDate: Task start date ok');
        t.is(task.getEndDate(), new Date(2015, 6, 24, 10), 'inclusiveEndDate: Task end date not adjusted to start of next day, if it has hour info');

        task             = new Gnt.model.Task({
            Duration     : 0,
            DurationUnit : "d",
            ReadOnly     : true,
            StartDate    : "2015-07-20T00:00:00",
            EndDate      : "2015-07-20T00:00:00"
        });
        task.inclusiveEndDate = true;
        task.setCalendar(new Gnt.data.Calendar({ calendarId : 'ipsum' }));
        task.normalize();

        t.is(task.isReadOnly(), true, 'Task is readonly');

        t.is(task.getDuration(), 0, 'Task duration 0');
        t.is(task.getStartDate(), new Date(2015, 6, 20), 'Task start date ok - milestone');
        t.is(task.getEndDate(), new Date(2015, 6, 20), 'Task end date not adjusted to start of next day, if it has hour info - milestone');
    });


    t.it('Removing a single task readonly record', function (t) {

        var resourceStore = new Gnt.data.ResourceStore({
            data : [
                { Id : 1, Name : "Mats" }
            ]
        });

        var assignmentStore = new Gnt.data.AssignmentStore({
            data : [
                { ResourceId : 1, TaskId : 1, Units : 50 }
            ]
        });

        var dependencyStore = new Gnt.data.DependencyStore({
            data : [
                { Id : 1, From : 1, To : 2 },
                { Id : 2, From : 1, To : 3 },
                { Id : 3, From : 2, To : 4 }
            ]
        });

        var taskStore       = new Gnt.data.TaskStore({
            resourceStore   : resourceStore,
            dependencyStore : dependencyStore,
            assignmentStore : assignmentStore,
            root            : {
                expanded : true,
                children : [
                    { Id : 1, StartDate : new Date(2015, 6, 20), Duration : 10, ReadOnly : true },
                    { Id : 2, StartDate : new Date(2015, 6, 20), Duration : 10 },
                    { Id : 3, StartDate : new Date(2015, 6, 20), Duration : 10 },
                    { Id : 4, StartDate : new Date(2015, 6, 20), Duration : 10 }
                ]
            }
        });

        var task = taskStore.getNodeById(1);

        t.is(task.isReadOnly(), true, 'Task is readonly');

        t.is(assignmentStore.getAssignmentsForTask(task).length, 1, 'Should find 1 assignment');
        task.remove();

        t.is(assignmentStore.getCount(), 0, 'Assignment store reacted to task remove');
        t.is(dependencyStore.getCount(), 1, 'Dependency store reacted to task remove');
        t.is(dependencyStore.getAt(0).getId(), 3, 'Dependency store reacted to task remove');
    });

});
