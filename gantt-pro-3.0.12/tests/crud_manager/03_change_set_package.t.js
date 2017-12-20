StartTest(function (t) {

    t.expectGlobal('TestTask', 'TestCalendar', 'TestResource', 'TestAssignment', 'TestDependency');

    Ext.define('TestCalendar', {
        extend : 'Gnt.model.Calendar',
        phantomIdField : 'calendarPhantomId'
    });

    Ext.define('TestResource', {
        extend : 'Gnt.model.Resource',
        phantomIdField : 'resourcePhantomId'
    });

    Ext.define('TestAssignment', {
        extend : 'Gnt.model.Assignment',
        phantomIdField : 'assignmentPhantomId'
    });

    Ext.define('TestDependency', {
        extend : 'Gnt.model.Dependency',
        phantomIdField : 'dependencyPhantomId'
    });

    Ext.define('TestTask', {
        extend : 'Gnt.model.Task',
        phantomIdField : 'taskPhantomId'
    });

    var calendarManager = new Gnt.data.CalendarManager({
        model : 'TestCalendar'
    });

    var resourceStore = t.getResourceStore({
        model : 'TestResource',
        DATA : []
    });

    var assignmentStore = t.getAssignmentStore({
        resourceStore : resourceStore,
        model : 'TestAssignment',
        DATA : []
    });

    var dependencyStore = t.getDependencyStore({
        model : 'TestDependency',
        DATA : []
    });

    var taskStore = t.getTaskStore({
        calendarManager : calendarManager,
        assignmentStore : assignmentStore,
        resourceStore : resourceStore,
        dependencyStore : dependencyStore,
        model : 'TestTask',
        DATA : []
    });

    var crud = new Gnt.data.CrudManager({
        taskStore : taskStore,
        revision : 1
    });

    t.it('Change set package for not modified data is null', function (t) {
        var pack = crud.getChangeSetPackage();

        t.notOk(pack, 'No changes yet');
    });

    t.it('Change set package for modified data', function (t) {

        var calendar = calendarManager.getRootNode().appendChild({
            Name : 'General',
            DaysPerMonth : 30,
            DaysPerWeek : 7,
            HoursPerDay : 24,
            WeekendsAreWorkdays : true,
            WeekendFirstDay : 6,
            WeekendSecondDay : 0,
            DefaultAvailability : ['00:00-24:00']
        });

        var resource1 = resourceStore.add({Name : 'resource1'})[0];
        var resource2 = resourceStore.add({Name : 'resource2'})[0];

        var task1 = taskStore.getRootNode().appendChild({Name : 'task1'});
        var task2 = taskStore.getRootNode().appendChild({Name : 'task2'});

        task1.assign(resource1);
        task2.assign(resource2);

        var dependency  = dependencyStore.add({ From : task1.getId(), To : task2.getId() })[0];

        var pack = crud.getChangeSetPackage();

        t.is(pack.type, 'sync', 'Correct package type');
        t.ok(pack.requestId, 'Has some request Id');
        t.ok(pack.revision, 'Has some revision');

        t.is(pack.resources.added.length, 2, 'correct resources number');
        t.is(pack.resources.added[0].resourcePhantomId, resource1.getId(), 'correct resource1 phantom Id');
        t.is(pack.resources.added[1].resourcePhantomId, resource2.getId(), 'correct resource2 phantom Id');

        t.is(pack.tasks.added.length, 2, 'correct tasks number');
        t.is(pack.tasks.added[0].taskPhantomId, task1.getId(), 'correct task1 phantom Id');
        t.is(pack.tasks.added[1].taskPhantomId, task2.getId(), 'correct task2 phantom Id');

        t.is(pack.assignments.added.length, 2, 'correct assignments number');
        t.is(pack.assignments.added[0].assignmentPhantomId, task1.getAssignments()[0].getId(), 'correct assignment1 phantom Id');
        t.is(pack.assignments.added[1].assignmentPhantomId, task2.getAssignments()[0].getId(), 'correct assignment2 phantom Id');

        t.is(pack.dependencies.added.length, 1, 'correct dependencies number');
        t.is(pack.dependencies.added[0].dependencyPhantomId, dependency.getId(), 'correct dependency phantom Id');

        t.is(pack.calendars.added.length, 1, 'correct calendars number');
        t.is(pack.calendars.added[0].calendarPhantomId, calendar.getId(), 'correct calendar phantom Id');
    });
});
