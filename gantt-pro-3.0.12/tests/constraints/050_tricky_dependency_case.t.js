/*jshint -W085 */
StartTest(function(t) {

    var Ext = t.getExt(),
        monday    = new Date(2014, 7, 18),
        wednesday = new Date(2014, 7, 20),
        thursday  = new Date(2014, 7, 21),
        friday    = new Date(2014, 7, 22);

    function getSampleDataSet() {
        return t.getAllStoresDataSet([{
            Id             : 1,
            StartDate      : monday,
            EndDate        : wednesday,
            ConstraintType : 'mustfinishon',
            ConstraintDate : wednesday,
            children       : [{
                Id             : 2,
                StartDate      : monday,
                EndDate        : wednesday,
                ConstraintType : 'mustfinishon',
                ConstraintDate : wednesday
            }]
        }]);
    }

    t.describe([
        "Dependency linearization and processing has one tricky case, when a parent has a child and both of them",
        "has constraints set, but both of those constraints are mutually exclusive.",
        "If task store has recalulateParents flag set to true then parent must start the same time its earliest",
        "(starting the first) child starts and must finish the same time its latest (finishing the last)",
        "child finishes.",
        "If for example parent has MFON Aug 22, 2014 and it's latest child MFON Aug 20, 2014 then",
        "such a case can be never satisfied either one of the constraints will be violated.",
        "In such a case it's up to a user which constraint shall be left and which one shall be removed,",
        "if user chooses for both to be left then he will find himself in an infinite loop of prompts asking",
        "to remove one of the constraints."
    ].join(' '), function(t) {

        t.it("Should lead to infinite prompt loop until user removes one of the constraints", function(t) {

            var parent, child, done, counter;

            /* global task, taskStore */
            with (getSampleDataSet()) {

                t.is(taskStore.recalculateParents, true, "Store has `recalculateParents` flag set");

                parent = task(1);
                child  = task(2);
                
                counter = 0;
                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    var resolution;

                    if (++counter == 10) {
                        resolution = resolutionContext.getResolution('remove-constraint');
                    }
                    else {
                        resolution = resolutionContext.getResolution('move-task');
                    }

                    Ext.Function.defer(resolution.resolve, 1, resolution);
                });

                done = false;
                child.setConstraintDate(friday, function(cancelChanges) {
                    t.is(cancelChanges, false, "Constraint resolved but changes are not canceled");
                    done = true;
                });

                t.chain(
                    { waitFor : function() { return done; } },
                    function(next) {
                        t.is(counter, 10, "User has been prompted until she choosen to remove constarint"),
                        t.ok(
                            parent.getConstraintType() === '' || 
                            child.getConstraintType() === '',
                            "Either parent or child task must have constraint removed"
                        );
                        t.is(parent.getStartDate(), child.getStartDate(), "Parent starts with child");
                        t.is(parent.getEndDate(), child.getEndDate(), "Parent ends with child");
                        next();
                    }
                );
            }
        });

        t.it("Should lead to infinite prompt loop until user cancels the change", function(t) {

            var parent, child, done, counter;

            /* global task, taskStore */
            with (getSampleDataSet()) {

                t.is(taskStore.recalculateParents, true, "Store has `recalculateParents` flag set");

                parent = task(1);
                child  = task(2);
                
                counter = 0;
                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    var resolution;

                    if (++counter == 10) {
                        resolution = resolutionContext.getResolution('cancel');
                    }
                    else {
                        resolution = resolutionContext.getResolution('move-task');
                    }

                    Ext.Function.defer(resolution.resolve, 1, resolution);
                });

                done = false;
                child.setConstraintDate(friday, function(cancelChanges) {
                    t.is(cancelChanges, true, "Constraint resolved changes are canceled");
                    done = true;
                });

                t.chain(
                    { waitFor : function() { return done; } },
                    function(next) {
                        t.is(counter, 10, "User has been prompted until she choosen to cancel the changes"),
                        t.ok(
                            parent.getConstraintDate() == wednesday || 
                            child.getConstraintDate() == wednesday,
                            "Bath parent or child task must have constraint date unchanged"
                        );
                        t.is(parent.getStartDate(), child.getStartDate(), "Parent starts with child");
                        t.is(parent.getEndDate(), child.getEndDate(), "Parent ends with child");
                        next();
                    }
                );
            }
        });

    });
});
