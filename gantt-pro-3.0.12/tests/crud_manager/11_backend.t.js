StartTest(function(t) {

    var calendarManager, resourceStore, assignmentStore, dependencyStore, taskStore, crud, root;

    // get test descriptor (it has backend sync/load/reset URLs used in the test)
    var testConfig = t.harness.getScriptDescriptor(t.url);

    Ext.define('Gnt.model.MyTask', {
        extend  : 'Gnt.model.Task',
        customizableFields : [
            { name : 'Draggable', persist : true },
            { name : 'Resizable', persist : true }
        ],

        fields  : [{ name: 'index', type : 'int', persist : true }]
    });

    var task        = function (name) { return taskStore.getRoot().findChild('Name', name, true); };
    var calendar    = function (name) { return calendarManager.getRoot().findChild('Name', name, true); };
    var resource    = function (name) { return resourceStore.findRecord('Name', name); };

    var setup   = function (fn) {
        calendarManager = new Gnt.data.CalendarManager();

        resourceStore   = t.getResourceStore({
            data        : []
        });

        assignmentStore     = t.getAssignmentStore({
            resourceStore   : resourceStore,
            data            : []
        });

        dependencyStore     = t.getDependencyStore({
            data            : []
        });

        taskStore           = t.getTaskStore({
            model           : 'Gnt.model.MyTask',
            calendarManager : calendarManager,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            dependencyStore : dependencyStore,
            DATA            : []
        });

        root            = taskStore.getRoot();

        crud            = new Gnt.data.CrudManager({
            taskStore   : taskStore,
            transport   : {
                load    : Ext.apply({ method : 'GET', paramName : 'q' }, testConfig.load),
                sync    : Ext.apply({ method : 'POST' }, testConfig.sync)
            },
            listeners   : {
                loadfail    : function () { t.fail('Loading failed'); },
                syncfail    : function () { t.fail('Persisting failed'); }
            }
        });

        Ext.Ajax.request({
            url     : testConfig.resetUrl,
            success : fn,
            failure : function () { t.fail('Reset failed'); }
        });
    };

    var noChangesAssertions = function (t) {
        t.notOk(calendarManager.getRemovedRecords().length, 'No removed calendar records');
        t.notOk(calendarManager.getModifiedRecords().length, 'No modified calendar records');

        t.notOk(resourceStore.getRemovedRecords().length, 'No removed resource records');
        t.notOk(resourceStore.getModifiedRecords().length, 'No modified resource records');

        t.notOk(assignmentStore.getRemovedRecords().length, 'No removed assignment records');
        t.notOk(assignmentStore.getModifiedRecords().length, 'No modified assignment records');

        t.notOk(dependencyStore.getRemovedRecords().length, 'No removed dependency records');
        t.notOk(dependencyStore.getModifiedRecords().length, 'No modified dependency records');

        t.notOk(taskStore.getRemovedRecords().length, 'No removed task records');
        t.notOk(taskStore.getModifiedRecords().length, 'No modified task records');
    };

    t.it('Should be possible to save some resources, assignments, dependencies and tasks', function (t) {

        var checkProperties = function (obj, pattern, desc) {
            var result = true;

            for (var key in pattern) {
                var value        = obj[key];
                var controlValue = pattern[key];
                var fail         = (Ext.isDate(value) || Ext.isDate(controlValue)) ? value - controlValue : value !== controlValue;

                if (fail) {
                    t.is(value, controlValue, desc + ' [' + key + ' field]');
                }

                result = result && !fail;
            }

            result && t.ok(result, desc);
        };

        var taskConfig          = {
            Effort              : 1,
            EffortUnit          : 'd',
            Note                : 'Test note',
            ConstraintType      : 'finishnoearlierthan',
            ConstraintDate      : new Date(2013, 0, 8),
            ManuallyScheduled   : true,
            Draggable           : false,
            Resizable           : false,
            Rollup              : true
        };

        t.chain(
            setup,

            function (next) {
                t.diag('Add records');

                var general         = calendarManager.getRoot().appendChild({
                    Name                : 'General',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendsAreWorkdays : true,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                var subGeneral       = general.appendChild({
                    Name                : 'Sub General',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendsAreWorkdays : true,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                general.getCalendar().add({ 'Date' : new Date(2013, 0, 1) });
                subGeneral.getCalendar().add({ 'Date' : new Date(2013, 0, 2) });
                subGeneral.getCalendar().add({ 'Date' : new Date(2013, 0, 3) });

                taskStore.setCalendar(general.getCalendar());

                var addedResources  = resourceStore.add([{ Name : 'resource1', CalendarId : subGeneral.getId() }, { Name : 'resource2' }, { Name : 'resource3' }]);

                var addedTasks      = [];

                addedTasks.push(taskStore.append(Ext.apply({
                    leaf        : true,
                    Name        : 'task1',
                    StartDate   : new Date(2013, 0, 8),
                    Duration    : 2
                }, taskConfig)) );

                addedTasks.push(taskStore.append({
                    leaf        : true,
                    Name        : 'task2',
                    StartDate   : new Date(2013, 0, 5, 8),
                    Duration    : 2
                }));

                addedTasks.push(taskStore.append({
                    leaf        : true,
                    Name        : 'task3',
                    StartDate   : new Date(2013, 0, 7, 8),
                    Duration    : 2,
                    CalendarId  : subGeneral.getId()
                }));

                addedResources[0].assignTo(addedTasks[0], 50);
                addedResources[1].assignTo(addedTasks[0], 100);
                addedResources[0].assignTo(addedTasks[1], 50);

                dependencyStore.add([
                    { From : addedTasks[0].getId(), To : addedTasks[1].getId() },
                    { From : addedTasks[1].getId(), To : addedTasks[2].getId() }
                ]);

                t.diag('Call sync');

                general.idBeforeSync    = general.getId();
                subGeneral.idBeforeSync = subGeneral.getId();

                crud.sync(function () { next(general, subGeneral); }, function () { t.fail('Sync failed'); });
            },

            function (next, general, subGeneral) {
                t.diag('Check records');

                noChangesAssertions(t);

                var resource1   = resource('resource1');
                var resource2   = resource('resource2');

                var task1       = task('task1');
                var task2       = task('task2');
                var task3       = task('task3');

                checkProperties(task1.data, taskConfig, 'task1 fields are correct after sync');

                t.ok(general.getId(), 'general calendar has Id filled');
                t.ok(subGeneral.getId(), 'subGeneral calendar has Id filled');
                t.isnt(general.getId(), general.idBeforeSync, 'general calendar Id was updated');
                t.isnt(subGeneral.getId(), subGeneral.idBeforeSync, 'subGeneral calendar Id was updated');
                t.is(general.getId(), general.getCalendar().getCalendarId(), 'general calendar has proper calendarId');
                t.is(subGeneral.getId(), subGeneral.getCalendar().getCalendarId(), 'subGeneral calendar has proper calendarId');

                t.is(resource1.getCalendar(), subGeneral.getCalendar(), 'Resource resource1 has proper calendar');
                t.is(task3.getCalendar(), subGeneral.getCalendar(), 'task3 has proper calendar');

                t.ok(resource1.getId(), 'Resource resource1 has Id filled');
                t.ok(resource2.getId(), 'Resource resource2 has Id filled');
                t.ok(resource('resource3').getId(), 'Resource resource3 has Id filled');

                var assignments1    = [];
                resource1.forEachAssignment(function (a) { assignments1.push(a.getTask()); });
                var assignments2    = [];
                resource2.forEachAssignment(function (a) { assignments2.push(a.getTask()); });

                t.isDeeply(assignments1, [ task1, task2 ], 'Correct resource1 assignments');
                t.isDeeply(assignments2, [ task1 ], 'Correct resource2 assignments');

                var preds2   = task2.getIncomingDependencies();
                var preds3   = task3.getIncomingDependencies();

                t.is(preds2.length, 1, 'Correct number of task2 predecessors');
                t.ok(preds2[0].getId(), 'Dependency to task2 has Id filled');
                t.is(preds2[0].getSourceTask(), task1, 'task2 has task1 predecessor');

                t.is(preds3.length, 1, 'Correct number of task3 predecessors');
                t.ok(preds3[0].getId(), 'Dependency to task3 has Id filled');
                t.is(preds3[0].getSourceTask(), task2, 'task3 has task2 predecessor');

                t.diag('Call load');
                crud.load(function () { next(general); }, function () { t.fail('Load failed'); });
            },

            function (next, general) {
                t.diag('Check records');

                noChangesAssertions(t);

                t.is(taskStore.getCalendar(), general.getCalendar(), 'taskStore has a proper project calendar set');

                var cal     = general.getCalendar();
                t.is(cal.getCount(), 1, '1 day defined for the general calendar');
                t.is(cal.getAt(0).getDate(), new Date(2013, 0, 1), 'proper day date');
                t.is(cal.getAt(0).getAvailability(true), '', 'proper day availability');

                t.is(resourceStore.getCount(), 3, 'Correct number of resources loaded');
                t.is(assignmentStore.getCount(), 3, 'Correct number of assignments loaded');
                t.is(dependencyStore.getCount(), 2, 'Correct number of dependencies loaded');
                t.is(taskStore.getCount(), 3, 'Correct number of tasks loaded');

                var resource1   = resource('resource1');
                var resource2   = resource('resource2');

                var task1       = task('task1');
                var task2       = task('task2');
                var task3       = task('task3');

                checkProperties(task1.data, taskConfig, 'task1 fields are correct after load');

                t.ok(resource1.getId(), 'Resource resource1 has Id filled');
                t.ok(resource2.getId(), 'Resource resource2 has Id filled');
                t.ok(resource('resource3').getId(), 'Resource resource3 has Id filled');

                var assignments1    = [];
                resource1.forEachAssignment(function (a) { assignments1.push(a.getTask()); });
                var assignments2    = [];
                resource2.forEachAssignment(function (a) { assignments2.push(a.getTask()); });

                t.isDeeply(assignments1, [ task1, task2 ], 'Correct resource1 assignments');
                t.isDeeply(assignments2, [ task1 ], 'Correct resource2 assignments');

                var preds2   = task2.getIncomingDependencies();
                var preds3   = task3.getIncomingDependencies();

                t.is(preds2.length, 1, 'Correct number of task2 predecessors');
                t.ok(preds2[0].getId(), 'Dependency to task2 has Id filled');
                t.is(preds2[0].getSourceTask(), task1, 'task2 has task1 predecessor');

                t.is(preds3.length, 1, 'Correct number of task3 predecessors');
                t.ok(preds3[0].getId(), 'Dependency to task3 has Id filled');
                t.is(preds3[0].getSourceTask(), task2, 'task3 has task2 predecessor');

                next();
            },

            function (next) {
                t.diag('Modify data');

                var assignments1    = [];
                resource('resource1').forEachAssignment(function (a) { assignments1.push(a); });

                var preds2          = task('task2').getIncomingDependencies();
                var preds3          = task('task3').getIncomingDependencies();

                // add + edit + remove resources
                resourceStore.add([{ Name : 'resource4' }]);
                resource('resource1').setName('RESOURCE-1');
                resourceStore.remove(resource('resource3'));

                // remove + edit assignments
                assignmentStore.remove(assignments1[0]);
                assignments1[1].setUnits(30);

                // edit 1 dependency and drop another one
                preds2[0].setLag(1);
                dependencyStore.remove(preds3[0]);

                // edit 1 task and drop another one
                var task1 = task('task1');
                task1.setName('TASK-1');
                task1.setSchedulingMode('FixedDuration');
                task1.setEffort(2);
                task1.setEffortUnit('h');
                task1.setNote('test');
                task1.setConstraintType('startnolaterthan');
                task1.setConstraintDate(new Date(2013, 0, 11));
                task1.setManuallyScheduled(false);
                task1.setDraggable(true);
                task1.setResizable(true);
                task1.setRollup(false);
                taskStore.getRoot().removeChild(task('task3'));

                t.diag('Call sync');
                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Check records');

                noChangesAssertions(t);

                var resource1   = resource('RESOURCE-1');
                var resource4   = resource('resource4');

                var task1       = task('TASK-1');
                var task2       = task('task2');

                t.ok(resource1, 'RESOURCE-1 found');

                var assignments1    = [];
                resource1.forEachAssignment(function (a) { assignments1.push([ a.getTask(), a.getUnits() ]); });

                var preds2          = task2.getIncomingDependencies();

                t.ok(resource('resource2'), 'resource2 found');
                t.notOk(resource('resource3'), 'resource3 NOT found');
                t.ok(resource4, 'resource4 found');
                t.notOk(resource1.dirty, 'RESOURCE1-1 is not dirty');
                t.ok(resource4.getId(), 'Resource resource4 has Id filled');

                t.isDeeply(assignments1, [[task2, 30]], 'Correct assignments of resource1');

                t.is(preds2[0].getLag(), 1, 'Correct Lag of dependency');

                t.ok(task1, 'TASK-1 found');
                t.notOk(task1.dirty, 'TASK-1 is not dirty');
                t.notOk(task('task3'), 'task3 not found');

                t.diag('Call load');
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function (next) {
                t.diag('Check records');
                t.is(resourceStore.getCount(), 3, 'Correct number of resources loaded');
                t.is(assignmentStore.getCount(), 2, 'Correct number of assignments loaded');
                t.is(dependencyStore.getCount(), 1, 'Correct number of dependencies loaded');
                t.is(taskStore.getCount(), 2, 'Correct number of tasks loaded');

                var resource1   = resource('RESOURCE-1');
                var resource4   = resource('resource4');

                var task1       = task('TASK-1');
                var task2       = task('task2');

                checkProperties(task1.data, {
                    Effort              : 2,
                    EffortUnit          : 'h',
                    Note                : 'test',
                    ConstraintType      : 'startnolaterthan',
                    ConstraintDate      : new Date(2013, 0, 11),
                    ManuallyScheduled   : false,
                    SchedulingMode      : 'FixedDuration',
                    Draggable           : true,
                    Resizable           : true,
                    Rollup              : false
                }, 'task1 fields are correct after load');

                t.ok(resource1, 'RESOURCE-1 found');

                var assignments1    = [];
                resource1.forEachAssignment(function (a) { assignments1.push([ a.getTask(), a.getUnits() ]); });
                var preds2          = task2.getIncomingDependencies();

                t.ok(resource('resource2'), 'resource2 found');
                t.notOk(resource('resource3'), 'resource3 NOT found');
                t.ok(resource4, 'resource4 found');
                t.notOk(resource1.dirty, 'RESOURCE1-1 is not dirty');
                t.ok(resource4.getId(), 'Resource resource4 has Id filled');

                t.isDeeply(assignments1, [[task2, 30]], 'Correct assignments of resource1');

                t.is(preds2[0].getLag(), 1, 'Correct Lag of dependency');

                t.ok(task1, 'TASK-1 found');
                t.notOk(task1.dirty, 'TASK-1 is not dirty');
                t.notOk(task('task3'), 'task3 not found');

                next();
            }
        );
    });

    t.it('Prevents from persisiting outdated data', function (t) {

        var resourceStore2  = t.getResourceStore({
            data        : []
        });

        var assignmentStore2    = t.getAssignmentStore({
            resourceStore   : resourceStore,
            data            : []
        });

        var dependencyStore2    = t.getDependencyStore({
            data            : []
        });

        var taskStore2          = t.getTaskStore({
            resourceStore   : resourceStore2,
            assignmentStore : assignmentStore2,
            dependencyStore : dependencyStore2,
            data            : []
        });

        var crud2 = Ext.create('Gnt.data.CrudManager', {
            crud2       : true,
            taskStore   : taskStore2,
            transport   : {
                load    : Ext.apply({ method : 'GET', paramName : 'q' }, testConfig.load),
                sync    : Ext.apply({ method : 'POST' }, testConfig.sync)
            },
            listeners   : {
                loadfail    : function () { t.fail('Loading failed'); }
            }
        });

        t.chain(
            setup,

            function (next) {
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function (next) {
                crud2.load(next, function () { t.fail('Load failed'); });
            },

            function (next) {
                resourceStore.add([{ Name : 'resource1' }, { Name : 'resource2' }]);

                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                resourceStore2.add([{ Name : 'resource3' }, { Name : 'resource4' }]);

                crud2.sync(function(){ t.fail('This sync should be failed'); next(); }, function() { t.pass('Sync successfuly failed'); next(); });
            },

            function () {}
        );
    });

    t.it('Should be possible to save some calendars + resources, assignments, dependencies and tasks', function (t) {
        var crud2;

        t.chain(
            setup,

            function (next) {
                t.diag('Add calendars');

                var general         = calendarManager.getRoot().appendChild({
                    Name                : 'General',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendsAreWorkdays : true,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                var subGeneral       = general.appendChild({
                    Name                : 'Sub General',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendsAreWorkdays : true,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                var subSubGeneral  = subGeneral.appendChild({
                    Name                : 'Sub Sub General',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendsAreWorkdays : true,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                general.getCalendar().add({ 'Date' : new Date(2013, 0, 1) });
                subGeneral.getCalendar().add({ 'Date' : new Date(2013, 0, 2) });
                subGeneral.getCalendar().add({ 'Date' : new Date(2013, 0, 3) });
                subSubGeneral.getCalendar().add({ 'Date' : new Date(2013, 1, 1) });
                subSubGeneral.getCalendar().add({ 'Date' : new Date(2013, 1, 2) });

                t.diag('Call sync');
                crud.sync(
                    function () { next(general, subGeneral, subSubGeneral); },
                    function () { t.fail('Sync failed'); }
                );
            },

            function (next, general, subGeneral, subSubGeneral) {
                t.diag('Check data');
                //check if calendar Id was updated in calendar manager record
                t.ok(general.getId() != general.getPhantomId(), 'general record Id was updated');
                t.ok(subGeneral.getId() != subGeneral.getPhantomId(), 'subGeneral record Id was updated');
                t.ok(subSubGeneral.getId() != subSubGeneral.getPhantomId(), 'general record Id was updated');

                //check if calendar Id was updated in calendar instance
                t.is(general.getCalendar().calendarId, general.getId(), 'general calendarId was updated');
                t.is(subGeneral.getCalendar().calendarId, subGeneral.getId(), 'subGeneral calendarId was updated');
                t.is(subSubGeneral.getCalendar().calendarId, subSubGeneral.getId(), 'subSubGeneral calendarId was updated');

                //check if calendar Id was updated in StoreManager
                t.is(general.getCalendar(), Gnt.data.Calendar.getCalendar(general.getId()), 'general calendar re-registered in StoreManager');
                t.is(subGeneral.getCalendar(), Gnt.data.Calendar.getCalendar(subGeneral.getId()), 'subGeneral calendar re-registered in StoreManager');
                t.is(subSubGeneral.getCalendar(), Gnt.data.Calendar.getCalendar(subSubGeneral.getId()), 'subSubGeneral calendar re-registered in StoreManager');

                //check if days were added to calendar instance
                t.ok(general.getCalendar().getAt(0).getId(), 'general calendar days has filled Id');
                t.ok(subGeneral.getCalendar().getAt(0).getId(), 'subGeneral calendar days has filled Id');
                t.ok(subGeneral.getCalendar().getAt(1).getId(), 'subGeneral calendar days has filled Id');
                t.ok(subSubGeneral.getCalendar().getAt(0).getId(), 'subSubGeneral calendar days has filled Id');
                t.ok(subSubGeneral.getCalendar().getAt(1).getId(), 'subSubGeneral calendar days has filled Id');

                next(general);
            },

            function (next, general) {
                t.diag('Check taskStore with calendarId');

                var generalId   = general.getId();

                //destroy calendar instance
                calendarManager.getRoot().removeChild(general);

                var calendarManager2    = Ext.create('Gnt.data.CalendarManager');

                var taskStore2          = t.getTaskStore({
                    calendarId      : generalId,
                    calendarManager : calendarManager2,
                    data            : []
                });

                crud2               = Ext.create('Gnt.data.CrudManager', {
                    calendarManager : calendarManager2,
                    taskStore       : taskStore2,
                    transport   : {
                        load    : Ext.apply({ method : 'GET', paramName : 'q' }, testConfig.load),
                        sync    : Ext.apply({ method : 'POST' }, testConfig.sync)
                    },
                    listeners   : {
                        loadfail    : function () { t.fail('Loading failed'); },
                        syncfail    : function () { t.fail('Persisting failed'); }
                    }
                });

                t.diag('Call load');

                crud2.load(
                    function () { next(generalId, calendarManager2, taskStore2); },
                    function () { t.fail('Load failed'); }
                );
            },

            function (next, generalId, calendarManager2, taskStore2) {
                t.diag('Check records');

                var calendar    = Gnt.data.Calendar.getCalendar(generalId);
                //make sure that calendar created with a proper Id
                t.ok(calendar, 'general calendar registered back');
                t.is(calendar.getCount(), 1, 'calendar has proper number of days');
                t.is(calendarManager2.getNodeById(generalId).getCalendar(), calendar, 'calendar manager has proper record');
                t.is(calendarManager2.getCalendar(generalId), calendar, 'calendar manager has proper record');

                //make sure that task store has it as a calendar
                t.is(taskStore2.calendar, calendar, 'task store has proper calendar');
            }
        );
    });

    t.it('Should be possible to reorder tasks', function (t) {

        t.chain(
            setup,

            {
                desc   : 'Added tasks & sync invoked',
                action : function (next) {
                    taskStore.append({ leaf : true, Name : 'task1', StartDate : new Date(2013, 0, 1), Duration : 2 });
                    taskStore.append({ leaf : true, Name : 'task2', StartDate : new Date(2013, 0, 5), Duration : 2 });
                    taskStore.append({ leaf : true, Name : 'task3', StartDate : new Date(2013, 0, 7), Duration : 2 });

                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc   : 'Added tasks4 & sync invoked',
                action : function (next) {
                    taskStore.getRoot().insertBefore({ leaf : true, Name : 'task4', StartDate : new Date(2013, 0, 7), Duration : 2 }, task('task2'));
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            function (next) {
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function () {
                t.isDeeply(taskStore.getRoot().childNodes, [ task('task1'), task('task4'), task('task2'), task('task3') ]);
            }
        );
    });

    t.it('Should be possible to change calendar parent', function (t) {
        var root;

        t.chain(
            setup,
            {
                desc   : 'Prepared 2 root calendars',
                action : function (next) {
                    root = calendarManager.getRoot();
                    root.appendChild({ Name : 'cal0' });
                    root.appendChild({ Name : 'cal1' });

                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },
            {
                desc   : 'Changed records & sync invoked',
                action : function (next) {
                    t.notOk(calendarManager.getModifiedRecords().length, 'no non-persisted calendars');

                    var node = root.appendChild({ Name : 'cal2' });
                    node.appendChild(calendar('cal1'));
                    node.insertBefore(calendar('cal0'), calendar('cal1'));
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },
            {
                desc   : 'load invoked',
                action : function (next) {
                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },
            function () {
                root = calendarManager.getRoot();

                t.is(root.childNodes.length, 1, 'root has proper number of children');
                t.is(root.childNodes[0], calendar('cal2'), 'root has cal2 child');

                // check there is no difference between "cal2.childNodes" and set of calendars: [ cal0, cal1 ]
                // we do not use isDeeply since server side does not guarantee the order of nodes
                t.notOk( Ext.Array.difference(calendar('cal2').childNodes, [ calendar('cal0'), calendar('cal1') ]).length, 'cal2 has proper children');
            }
        );
    });

    t.it('Should be possible to change task parent', function (t) {

        t.chain(
            setup,

            function (next) {
                t.diag('Add tasks');

                var node    = root.appendChild({ Name : 'task1', StartDate : new Date(2013, 0, 1), Duration : 2 });

                node.appendChild({ leaf : true, Name : 'task11', StartDate : new Date(2013, 0, 1), Duration : 2 });
                node.appendChild({ leaf : true, Name : 'task12', StartDate : new Date(2013, 0, 5), Duration : 2 });

                root.appendChild({ Name : 'task2', StartDate : new Date(2013, 0, 5), Duration : 2 })
                    .appendChild([
                        { leaf : true, Name : 'task21', StartDate : new Date(2013, 0, 5), Duration : 2 },
                        { leaf : true, Name : 'task22', StartDate : new Date(2013, 0, 6), Duration : 2 }
                    ]);

                root.appendChild({ leaf : true, Name : 'task3', StartDate : new Date(2013, 0, 7), Duration : 2 })
                    .appendChild({ Name : 'task00', StartDate : new Date(2013, 0, 1), Duration : 2 });

                t.diag('Call sync');
                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                noChangesAssertions(t);

                t.notOk(taskStore.getModifiedRecords().length, 'no non-persisted tasks');

                root.insertBefore({ Name : 'task0', StartDate : new Date(2013, 0, 1), Duration : 2 }, task('task1'));

                taskStore.indent(task('task1'));

                task('task0').insertBefore(task('task00'), task('task1'));

                task('task2').appendChild(task('task11'));

                task('task1').insertBefore(task('task22'), task('task12'));

                task('task1').appendChild(task('task3'));

                t.diag('Call sync');
                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Call load');
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function () {
                t.isDeeply(taskStore.getRoot().childNodes, [ task('task0'), task('task2') ], 'root has proper children');
                t.isDeeply(task('task0').childNodes, [ task('task00'), task('task1') ], 'task0 has proper children');
                t.isDeeply(task('task1').childNodes, [ task('task22'), task('task12'), task('task3') ], 'task1 has proper children');
                t.isDeeply(task('task2').childNodes, [ task('task21'), task('task11') ], 'task2 has proper children');
            }
        );
    });

    t.it('Prevents from removing referenced resources, tasks and calendars', function (t) {

        var crud2;

        t.chain(
            setup,

            function (next) {
                crud2           = Ext.create('Gnt.data.CrudManager', {
                    taskStore   : taskStore,
                    transport   : {
                        load    : Ext.apply({ method : 'GET', paramName : 'q' }, testConfig.load),
                        sync    : Ext.apply({ method : 'POST' }, testConfig.sync)
                    }
                });

                next();
            },

            function (next) {
                t.diag('Add records');

                var mainCalendar        = calendarManager.getRoot().appendChild({
                    Name                : 'calendar',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                var subCalendar1        = mainCalendar.appendChild({
                    Name                : 'subcalendar1',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                var subCalendar2        = mainCalendar.appendChild({
                    Name                : 'subcalendar2',
                    DaysPerMonth        : 30,
                    DaysPerWeek         : 7,
                    HoursPerDay         : 24,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '00:00-24:00' ]
                });

                var addedResources  = resourceStore.add({ Name : 'resource', CalendarId : subCalendar1.getId() });

                var task        = new Gnt.model.Task({ leaf : true, Name : 'task', StartDate : new Date(2013, 0, 1, 8), Duration : 2 });
                var subTask     = task.addSubtask(new Gnt.model.Task({ leaf : true, Name : 'subtask', StartDate : new Date(2013, 0, 1, 8), Duration : 2, CalendarId : subCalendar2.getId() }));
                var task2       = new Gnt.model.Task({ leaf : true, Name : 'task2', StartDate : new Date(2013, 0, 1, 8), Duration : 2 });

                taskStore.append(task);
                taskStore.append(task2);

                dependencyStore.add({ From : subTask.getId(), To : task2.getId() });

                addedResources[0].assignTo(subTask, 50);

                t.diag('Call sync');

                crud2.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Prevents removing a calendar having a sub-calendar');

                calendarManager.getRoot().removeChild(calendar('calendar'));

                crud2.sync(function () { t.fail('Sync should fail'); }, function (resp) {
                    t.is(resp.code, 125, 'proper error code returned');

                    t.diag('Load stores');
                    crud2.load(next, function () { t.fail('Load failed'); });
                });
            },

            function (next) {
                t.diag('Prevents removing a calendar referenced by a resource');

                calendar('calendar').removeChild(calendar('subcalendar1'));

                crud2.sync(function () { t.fail('Sync should fail'); }, function (resp) {
                    t.is(resp.code, 126, 'proper error code returned');

                    t.diag('Load stores');
                    crud2.load(next, function () { t.fail('Load failed'); });
                });
            },

            function (next) {
                t.diag('Prevents removing a calendar referenced by a task');

                calendar('calendar').removeChild(calendar('subcalendar2'));

                crud2.sync(function () { t.fail('Sync should fail'); }, function (resp) {
                    t.is(resp.code, 127, 'proper error code returned');

                    t.diag('Load stores');
                    crud2.load(next, function () { t.fail('Load failed'); });
                });
            },

            function (next) {
                t.diag('Doesn`t prevent removing an assigned resource');

                resourceStore.remove(resource('resource'));

                crud2.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Task removal causes removing of its assignments and dependencies');

                task('task').removeChild(task('subtask'));

                crud2.sync(function (resp) {
                    t.ok(resp.success, 'request succeeded');
                    t.notOk(assignmentStore.getCount(), 'assignment has been removed');
                    t.notOk(dependencyStore.getCount(), 'dependencies has been removed');
                    next();
                }, function () { t.fail('Sync failed'); });
            },

            function () {}
        );

    });

    t.it('Saves segmented tasks', function (t) {

        t.chain(
            setup,

            function (next) {
                t.diag('Add records');

                var general         = calendarManager.getRoot().appendChild({
                    Name                : 'General',
                    DaysPerMonth        : 20,
                    DaysPerWeek         : 5,
                    HoursPerDay         : 8,
                    WeekendsAreWorkdays : false,
                    WeekendFirstDay     : 6,
                    WeekendSecondDay    : 0,
                    DefaultAvailability : [ '08:00-12:00', '13:00-17:00' ]
                });

                // set calendar so task being appended will be normalized
                taskStore.setCalendar(general.getCalendar());

                taskStore.append({
                    leaf        : true,
                    Name        : 'task1',
                    StartDate   : new Date(2013, 0, 1, 8),
                    Segments    : [
                        {
                            StartDate   : new Date(2013, 0, 1, 8),
                            Duration    : 2
                        },
                        {
                            StartDate   : new Date(2013, 0, 4, 8),
                            Duration    : 2
                        },
                        {
                            StartDate   : new Date(2013, 0, 9, 8),
                            Duration    : 2
                        }
                    ]
                });

                t.diag('Call sync');

                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Check records');

                var task1       = task('task1'),
                    segments    = task1.getSegments();

                t.is(segments.length, 3, 'proper number of segments');
                t.notOk(task1.dirty, 'task1 is no longer dirty');
                t.is(segments[0].getId(), 1, '#0: proper id');
                t.is(segments[1].getId(), 2, '#1: proper id');
                t.is(segments[2].getId(), 3, '#2: proper id');
                t.is(segments[0].getStartDate(), new Date(2013, 0, 1, 8), '#0: proper start date');
                t.is(segments[1].getStartDate(), new Date(2013, 0, 4, 8), '#1: proper start date');
                t.is(segments[2].getStartDate(), new Date(2013, 0, 9, 8), '#2: proper start date');

                t.diag('Call load');
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function (next) {
                t.diag('Check records');

                var task1       = task('task1'),
                    segments    = task1.getSegments();

                t.is(segments.length, 3, 'proper number of segments');
                t.notOk(task1.dirty, 'task1 is no longer dirty');
                t.is(segments[0].getId(), 1, '#0: proper id');
                t.is(segments[1].getId(), 2, '#1: proper id');
                t.is(segments[2].getId(), 3, '#2: proper id');
                t.is(segments[0].getStartDate(), new Date(2013, 0, 1, 8), '#0: proper start date');
                t.is(segments[1].getStartDate(), new Date(2013, 0, 4, 8), '#1: proper start date');
                t.is(segments[2].getStartDate(), new Date(2013, 0, 9, 8), '#2: proper start date');

                next();
            },

            function (next) {
                t.diag('Modify records');

                task('task1').setStartDate(new Date(2013, 0, 2, 8), true);

                t.diag('Call sync');

                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Check records');

                var task1       = task('task1'),
                    segments    = task1.getSegments();

                t.is(segments.length, 3, 'proper number of segments');
                t.notOk(task1.dirty, 'task1 is no longer dirty');
                t.is(segments[0].getStartDate(), new Date(2013, 0, 2, 8), '#0: proper start date');
                t.is(segments[1].getStartDate(), new Date(2013, 0, 7, 8), '#1: proper start date');
                t.is(segments[2].getStartDate(), new Date(2013, 0, 10, 8), '#2: proper start date');

                t.diag('Call load');
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function (next) {
                t.diag('Check records');

                var task1       = task('task1'),
                    segments    = task1.getSegments();

                t.is(segments.length, 3, 'proper number of segments');
                t.notOk(task1.dirty, 'task1 is no longer dirty');
                t.is(segments[0].getId(), 1, '#0: proper id');
                t.is(segments[1].getId(), 2, '#1: proper id');
                t.is(segments[2].getId(), 3, '#2: proper id');
                t.is(segments[0].getStartDate(), new Date(2013, 0, 2, 8), '#0: proper start date');
                t.is(segments[1].getStartDate(), new Date(2013, 0, 7, 8), '#1: proper start date');
                t.is(segments[2].getStartDate(), new Date(2013, 0, 10, 8), '#2: proper start date');

                next();
            },

            function (next) {
                t.diag('Merge segments');

                var task1   = task('task1');

                task1.merge(task1.getSegment(1), task1.getSegment(2));

                t.diag('Call sync');

                crud.sync(next, function () { t.fail('Sync failed'); });
            },

            function (next) {
                t.diag('Check records');

                var task1       = task('task1'),
                    segments    = task1.getSegments();

                t.is(segments.length, 2, 'proper number of segments');
                t.notOk(task1.dirty, 'task1 is no longer dirty');
                t.is(segments[0].getStartDate(), new Date(2013, 0, 2, 8), '#0: proper start date');
                t.is(segments[1].getStartDate(), new Date(2013, 0, 7, 8), '#1: proper start date');
                t.is(segments[1].getEndDate(), new Date(2013, 0, 11, 17), '#1: proper end date');

                t.diag('Call load');
                crud.load(next, function () { t.fail('Load failed'); });
            },

            function (next) {
                t.diag('Check records');

                var task1       = task('task1'),
                    segments    = task1.getSegments();

                t.is(segments.length, 2, 'proper number of segments');
                t.notOk(task1.dirty, 'task1 is no longer dirty');
                t.is(segments[0].getId(), 1, '#0: proper id');
                t.is(segments[1].getId(), 2, '#1: proper id');
                t.is(segments[0].getStartDate(), new Date(2013, 0, 2, 8), '#0: proper start date');
                t.is(segments[1].getStartDate(), new Date(2013, 0, 7, 8), '#1: proper start date');
                t.is(segments[1].getEndDate(), new Date(2013, 0, 11, 17), '#1: proper end date');

                next();
            }
        );
    });

    t.it('Saves nulled task fields', function (t) {

        var checkRecord = function () {
            var task    = taskStore.getRoot().firstChild;

            t.is(task.getId(), 1, 'task: proper id');
            t.is(task.getName(), '', 'task: proper name');
            t.is(task.getStartDate(), null, 'task: proper start date');
            t.is(task.getEndDate(), null, 'task: proper start date');
            t.is(task.getDuration(), null, 'task: proper duration');
        };

        t.chain(
            setup,

            {
                desc   : 'Record added & sync called',
                action : function (next) {
                    taskStore.append({ leaf : true });
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc   : 'Record checked & load called',
                action : function (next) {
                    checkRecord();
                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },

            {
                desc   : 'Record checked',
                action : checkRecord
            }
        );
    });

    t.it('New tasks are resizable and draggable', function (t) {

        var checkRecords = function () {
            t.ok(task('foo').isResizable() !== false, 'task "foo" is resizable');
            t.ok(task('foo').isDraggable() !== false, 'task "foo" is draggable');
            t.ok(task('bar').isResizable() !== false, 'task "bar" is resizable');
            t.ok(task('bar').isDraggable() !== false, 'task "bar" is draggable');
        };

        t.chain(
            setup,

            {
                desc    : 'Records added & sync invoked',
                action  : function (next) {
                    taskStore.append({ Name : 'foo', leaf : true });
                    taskStore.append({ Name : 'bar', leaf : true });
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc    : 'Records checked after sync & load invoked',
                action  : function (next) {
                    checkRecords();
                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },

            {
                desc    : 'Records checked after load',
                action  : checkRecords
            }
        );
    });

    t.it('Float duration and effort are supported', function (t) {

        var checkRecords = function (duration, effort) {
            t.is(task('foo').getDuration(), duration, 'task "foo" duration is correct');
            t.is(task('bar').getEffort(), effort, 'task "bar" effort is correct');
        };

        t.chain(
            setup,

            {
                desc    : 'Records added & sync invoked',
                action  : function (next) {
                    taskStore.append({ Name : 'foo', Duration : 0.15, leaf : true });
                    taskStore.append({ Name : 'bar', Effort : 0.25, leaf : true });
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc    : 'Records checked after sync & load invoked',
                action  : function (next) {
                    checkRecords(0.15, 0.25);
                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },

            {
                desc    : 'Records checked after load',
                action  : function (next) {
                    checkRecords(0.15, 0.25);
                    next();
                }
            },

            {
                desc    : 'Records updated & sync invoked',
                action  : function (next) {
                    task('foo').setDuration(0.55);
                    task('bar').setEffort(0.65);
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc    : 'Records checked after sync & load invoked',
                action  : function (next) {
                    checkRecords(0.55, 0.65);
                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },

            {
                desc    : 'Records checked after load',
                action  : function () {
                    checkRecords(0.55, 0.65);
                }
            }
        );
    });

    t.it('Allows to split existing task to segments', function (t) {
        var id0, id1;

        t.chain(
            setup,

            {
                desc    : 'Prepared record & sync invoked',
                action  : function (next) {
                    taskStore.append({ Name : 'foo', StartDate : new Date(2015, 7, 31), Duration : 2, leaf : true });
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc    : 'Load invoked',
                action  : function (next) {
                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },

            {
                desc    : 'Record split & sync called',
                action  : function (next) {
                    task('foo').split(new Date(2015, 8, 1));
                    crud.sync(next, function () { t.fail('Sync failed'); });
                }
            },

            {
                desc    : 'Record checked after sync & load invoked',
                action  : function (next) {
                    t.isDeeply(task('foo').getSegments(), [task('foo').getSegment(0), task('foo').getSegment(1)], 'task "foo" segments are presisted');
                    id0 = task('foo').getSegment(0).getId();
                    id1 = task('foo').getSegment(1).getId();

                    crud.load(next, function () { t.fail('Load failed'); });
                }
            },

            {
                desc    : 'Record checked after load',
                action  : function () {
                    t.isDeeply(task('foo').getSegments(), [task('foo').getSegment(0), task('foo').getSegment(1)], 'task "foo" segments are loaded');
                    t.is(id0, task('foo').getSegment(0).getId());
                    t.is(id1, task('foo').getSegment(1).getId());
                }
            }
        );

    });
});
