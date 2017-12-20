StartTest(function(t) {

    function getDataModel() {
        var resources = [{
                "Id"   : "r1",
                "Name" : "Mike"
            }, {
                "Id"   : "r2",
                "Name" : "Linda"
            }, {
                "Id"   : "r3",
                "Name" : "Don"
            }],
            events = [{
                "Id"         : "e1",
                "Name"       : "Event 1",
                "StartDate"  : "2011-01-04",
                "EndDate"    : "2011-01-06"
            }, {
                "Id"         : "e2",
                "Name"       : "Event 2",
                "StartDate"  : "2011-01-05",
                "EndDate"    : "2011-01-08"
            }, {
                "Id"         : "e3",
                "Name"       : "Event 3",
                "StartDate"  : "2011-01-06",
                "EndDate"    : "2011-01-08"
            }],
            assignments = [{
                "TaskId"     : "e1",
                "ResourceId" : "r1"
            }, {
                "TaskId"     : "e1",
                "ResourceId" : "r2"
            }, {
                "TaskId"     : "e2",
                "ResourceId" : "r2"
            }, {
                "TaskId"     : "e2",
                "ResourceId" : "r3"
            }, {
                "TaskId"     : "e3",
                "ResourceId" : "r3"
            }],
            resourceStore   = new Gnt.data.ResourceStore({ data : resources }),
            assignmentStore = new Gnt.data.AssignmentStore({ data : assignments }),
            eventStore      = t.getTaskStore({
                DATA            : events,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore
            });

        return {
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            eventStore      : eventStore
        }
    }

    function renderScheduler(dataModel, renderTo) {
        var scheduler = new Sch.panel.SchedulerGrid({
            renderTo           : renderTo || Ext.getBody(),
            eventStore         : dataModel.eventStore,
            resourceStore      : dataModel.resourceStore,
            viewPreset         : 'dayAndWeek',
            startDate          : new Date(2011, 0, 4),
            endDate            : Sch.util.Date.add(new Date(2011, 0, 4), Sch.util.Date.DAY, 30),
            rowHeight          : 45,
            width              : 600,
            height             : 300,
            simpleSelect       : true,
            dragConfig         : {
                enableCopy     : true
            },
            columns            : [
                { header : 'Name', sortable : true, width : 100, dataIndex : 'Name' }
            ]
        });

        return scheduler;
    }

    t.describe("In multiple assignment store event might be assigned to different resource, thus selecting an event bar actually means that a particular assignment has been selected", function(t) {

        t.it("Should be possible to reassign a single event from one resource to another by dragging an event bar which corresponds to the event", function(t) {

            var data = getDataModel(),
                eventStore = data.eventStore,
                resourceStore = data.resourceStore,
                assignmentStore = data.assignmentStore,
                scheduler = renderScheduler(data),
                schedView = scheduler.getSchedulingView(),
                e2 = eventStore.getModelById('e2'),
                r2 = resourceStore.getModelById('r2'),
                r1 = resourceStore.getModelById('r1'),
                e2r2bar, r1row;

            t.chain(
                {
                    waitForRowsVisible : scheduler
                },
                function(next) {
                    t.ok(e2, "Got event 2 record");
                    t.ok(r2, "Got resource 2 record");
                    t.ok(r1, "Gor resource 1 record");

                    r1row = schedView.getRow(r1);
                    t.ok(r1row, "Got resource 1 row element");

                    e2r2bar = schedView.getElementsFromEventRecord(e2, r2).pop();
                    t.ok(e2r2bar, "Got event 2 bar element on resource 2 row");

                    next();
                },
                {
                    action : 'drag',
                    target : function() { return e2r2bar; },
                    to: function() { return r1row; },
                    toOffset : [200, 0]
                },
                function(next) {
                    t.is(assignmentStore.isEventAssignedToResource(e2, r2), false, "Event 1 has been unassigned from " + r2.getName());
                    t.is(assignmentStore.isEventAssignedToResource(e2, r1), true,  "Event 1 has been assigned to " + r1.getName());

                    Ext.destroy(scheduler);
                }
            );
        });

        t.it("Should be possible to reassign a single event from several resources to single resource by dragging event bars which correspond to assignments being changed", function(t) {
            var data = getDataModel(),
                eventStore = data.eventStore,
                resourceStore = data.resourceStore,
                assignmentStore = data.assignmentStore,
                scheduler = renderScheduler(data),
                schedView = scheduler.getSchedulingView(),
                e2 = eventStore.getModelById('e2'),
                e3 = eventStore.getModelById('e3'),
                r1 = resourceStore.getModelById('r1'),
                r2 = resourceStore.getModelById('r2'),
                r3 = resourceStore.getModelById('r3'),
                e2r3bar, e3r3bar, r1row;

            t.chain(
                {
                    waitForRowsVisible : scheduler
                },
                function(next) {
                    t.ok(e2, "Got event 2 record");
                    t.ok(e3, "Got event 3 record");
                    t.ok(r1, "Gor resource 1 record");
                    t.ok(r2, "Got resource 2 record");
                    t.ok(r3, "Got resource 3 record");

                    r1row = schedView.getRow(r1);
                    t.ok(r1row, "Got resource 1 row element");

                    e2r3bar = schedView.getElementsFromEventRecord(e2, r3).pop();
                    t.ok(e2r3bar, "Got event 2 bar element on resource 3 row");
                    e3r3bar = schedView.getElementsFromEventRecord(e3, r3).pop();
                    t.ok(e3r3bar, "Got event 3 bar element on resource 3 row");

                    next();
                },
                {
                    action : 'click',
                    target : function() { return e3r3bar; }
                },
                {
                    action : 'click',
                    target : function() { return  e2r3bar; }
                },
                {
                    action : 'drag',
                    target : function() { return e2r3bar; },
                    to: function() { return r1row; },
                    toOffset : [200, 0]
                },
                function(next) {
                    t.is(assignmentStore.isEventAssignedToResource(e2, r3), false, "Event 2 has been unassigned from " + r3.getName());
                    t.is(assignmentStore.isEventAssignedToResource(e3, r3), false, "Event 3 has been unassigned from " + r3.getName());
                    t.is(assignmentStore.isEventAssignedToResource(e2, r1), true,  "Event 2 has been assigned to " + r1.getName());
                    t.is(assignmentStore.isEventAssignedToResource(e3, r1), true,  "Event 3 has been assigned to " + r1.getName());

                    Ext.destroy(scheduler);
                }
            );
        });

        t.it("Prevents dragging an event to a resource that is already assigned to it", function(t) {
            var data = getDataModel(),
                eventStore = data.eventStore,
                resourceStore = data.resourceStore,
                assignmentStore = data.assignmentStore,
                scheduler = renderScheduler(data),
                schedView = scheduler.getSchedulingView(),
                e1 = eventStore.getModelById('e1'),
                r1 = resourceStore.getModelById('r1'),
                r2 = resourceStore.getModelById('r2'),
                e1r2bar, r1row;

            t.chain(
                {
                    waitForRowsVisible : scheduler
                },
                function(next) {
                    t.ok(e1, "Got event 1 record");
                    t.ok(r1, "Gor resource 1 record");
                    t.ok(r2, "Got resource 2 record");

                    r1row = schedView.getRow(r1);
                    t.ok(r1row, "Got resource 1 row element");

                    e1r2bar = schedView.getElementsFromEventRecord(e1, r2).pop();
                    t.ok(e1r2bar, "Got event 1 bar element on resource 2 row");

                    next();
                },
                {
                    action : 'drag',
                    target : function() { return e1r2bar; },
                    to: function() { return r1row; },
                    toOffset : [200, 0]
                },
                function(next) {
                    t.ok(assignmentStore.isEventAssignedToResource(e1, r2), "Event 1 is still assigned to " + r2.getName());
                    t.ok(assignmentStore.isEventAssignedToResource(e1, r1),  "Event 1 is still assigned to " + r1.getName());

                    Ext.destroy(scheduler);
                }
            );
        });
    });
});
