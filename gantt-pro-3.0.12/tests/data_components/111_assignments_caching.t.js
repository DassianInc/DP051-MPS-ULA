/* jshint -W085 */
StartTest(function(t) {
    // hint: to understand what's going on in the tests you need to actually draw the tasks with dates on paper

    // Various methods of the dependency store and `successors/predecessors` (incoming/outgoing deps)
    // properties of the task model are cached
    // in this test we'll verify that cache is correctly reset/refreshed after CRUD operations with dependencies

    /* global taskStore, resourceStore, assignmentStore, assId */
    with (t.getAllStoresDataSet(
        [
            {
                Id          : 1,
                children    : [
                    {
                        Id          : 11,
                        leaf        : true
                    },
                    {
                        Id          : 12,
                        leaf        : true
                    }
                ]
            },
            {
                Id          : 20,
                children    : [
                    {
                        Id          : 21,
                        leaf        : true
                    },
                    {
                        Id          : 22,
                        leaf        : true
                    }
                ]
            },
            {
                Id          : 30,
                leaf        : true
            }
        ],
        [],
        [
            {
                Id          : 1,
                TaskId      : 1,
                ResourceId  : 1
            },
            {
                Id          : 2,
                TaskId      : 1,
                ResourceId  : 2
            },
            {
                Id          : 3,
                TaskId      : 1,
                ResourceId  : 3
            },
            {
                Id          : 4,
                TaskId      : 20,
                ResourceId  : 4
            },
            {
                Id          : 5,
                TaskId      : 21,
                ResourceId  : 4
            },
            {
                Id          : 6,
                TaskId      : 22,
                ResourceId  : 4
            }
        ],
        [
            {
                Id          : 1,
                Name        : 'Resource1'
            },
            {
                Id          : 2,
                Name        : 'Resource2'
            },
            {
                Id          : 3,
                Name        : 'Resource3'
            },
            {
                Id          : 4,
                Name        : 'Resource4'
            }
        ]
    )) {
        var ass;

        // Filling in caches
        taskStore.forEachTaskUnordered(function(task) {
            task.getAssignments();
        });
        resourceStore.each(function(resource) {
            resource.getAssignments();
        });

        t.verifyCachedAssignmentsState(taskStore, assignmentStore);

        t.it('Updating cache on new assignment', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            assignmentStore.add({ Id : 7, TaskId : 20, ResourceId : 1 })
            t.expect(getRangeSpy).toHaveBeenCalled(0);

            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated once from t.verifyCachedAssignmentsState();
            t.expect(getRangeSpy).toHaveBeenCalled(1);
        });

        t.it('Updating cache on editing assignment', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            ass = assId(7);
            ass.set({
                TaskId      : 21,
                ResourceId  : 2
            });
            t.expect(getRangeSpy).toHaveBeenCalled(0);

            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated only once from within t.verifyCachedAssignmentsState()
            t.expect(getRangeSpy).toHaveBeenCalled(1);
        });

        t.it('Updating cache on rejecting assignment\'s changes', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            ass.reject();
            t.expect(getRangeSpy).toHaveBeenCalled(0);

            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated only once from within t.verifyCachedAssignmentsState()
            t.expect(getRangeSpy).toHaveBeenCalled(1);
        });

        t.it('Updating cache on setting assignment\'s taskId', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            ass.setTaskId(30);
            t.expect(getRangeSpy).toHaveBeenCalled(0);

            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated only once from within t.verifyCachedAssignmentsState()
            t.expect(getRangeSpy).toHaveBeenCalled(1);
        });

        t.it('Updating cache on removing assignment', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            assignmentStore.remove(ass);
            t.expect(getRangeSpy).toHaveBeenCalled(0);

            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated only once from within t.verifyCachedAssignmentsState()
            t.expect(getRangeSpy).toHaveBeenCalled(1);
        });

        t.it('Updating cache on removing all assignments', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            assignmentStore.removeAll();
            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated 8 times:
            //  1. from within t.verifyCachedAssignmentsState()
            //  2. once per each task for which we are checking assignments (3 tasks including root)
            //  3. once per each resource (4 resources) (due to some calculations done where resource assignments are involved)
            // since at remove all we clear all the caches
            t.expect(getRangeSpy).toHaveBeenCalled(8);
        });

        t.it('Updating cache on changing root node', function (t) {
            var getRangeSpy = t.spyOn(assignmentStore, 'getRange').and.callThrough();

            taskStore.setRootNode({
                Id          : 1,
                children    : [
                    {
                        Id   : '22',
                        leaf : true
                    }
                ]
            });

            t.verifyCachedAssignmentsState(taskStore, assignmentStore);

            // Assignment store should be iterated 3 times:
            //  1. from within t.verifyCachedAssignmentsState()
            //  2. once per each task for which we are checking assignments (2 tasks including root)
            t.expect(getRangeSpy).toHaveBeenCalled(3);
        });
    }
});
