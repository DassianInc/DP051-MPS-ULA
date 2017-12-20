StartTest(function(t) {

    var sampleDate  = new Date(2014, 7, 14), // Thursday
        sameDate    = new Date(sampleDate),
        earlierDate = new Date(sampleDate.getTime() - 3 * 24 * 60 * 60 * 1000), // Previous Monday
        laterDate   = new Date(sampleDate.getTime() + 4 * 24 * 60 * 60 * 1000), // Next Monday
        data = t.getAllStoresDataSet([{
            Id        : 1,
            leaf      : true,
            StartDate : sampleDate,
            Duration  : 1,
        }, {
            Id        : 2,
            leaf      : true,
            EndDate   : sampleDate,
            Duration  : 1,
        }]),
        task1 = data.id(1),
        task2 = data.id(2),
        taskStore = data.taskStore;

    // Otherwise propagations won't finish
    taskStore.on('constraintconflict', function(task, resolveContext) {
        resolveContext.cancelAction();
    });

    t.describe("Curently each constraint might be violated and as the result the `constraintconflict` store event must be fired.", function(t) {

        t.describe("Start No Earlier Then constraint", function(t) {

            t.it("Must not be violated if a task starts later then a constraint date", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task1.setConstraint('startnoearlierthan', earlierDate);
            });

            t.it("Must not be violated if a task starts at the same date as a constraint date is set to", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task1.setConstraint('startnoearlierthan', sameDate);
            });

            t.it("Must be violated if a task starts earlier then a constraint date", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task1.setConstraint('startnoearlierthan', laterDate);
            });

        });

        t.describe("Start No Later Then constraint", function(t) {

            t.it("Must not be violated if a task starts earlier then a constraint date", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task1.setConstraint('startnolaterthan', laterDate);
            });

            t.it("Must not be violated if a task starts at the same date as a constraint date is set to", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task1.setConstraint('startnolaterthan', sameDate);
            });

            t.it("Must be violated if a task starts later then a constraint date", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task1.setConstraint('startnolaterthan', earlierDate);
            });

        });

        t.describe("Finish No Earlier Then constraint", function(t) {

            t.it("Must not be violated if a task ends later then a constraint date", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task2.setConstraint('finishnoearlierthan', earlierDate);
            });

            t.it("Must not be violated if a task ends at the same date as a constraint date is set to", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task2.setConstraint('finishnoearlierthan', sameDate);
                t.diag([sameDate, task2.getEndDate(), task2.getConstraintDate()].join());
            });

            t.it("Must be violated if a task ends earlier then a constraint date", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task2.setConstraint('finishnoearlierthan', laterDate);
            });

        });

        t.describe("Finish No Later Then constraint", function(t) {

            t.it("Must not be violated if a task ends earlier then a constraint date", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task2.setConstraint('finishnolaterthan', laterDate);
            });

            t.it("Must not be violated if a task ends at the same date as a constraint date is set to", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task2.setConstraint('finishnolaterthan', sameDate);
            });

            t.it("Must be violated if a task ends later then a constraint date", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task2.setConstraint('finishnolaterthan', earlierDate);
            });

        });

        t.describe("Must Start On constraint", function(t) {

            t.it("Must not be violated if a task starts at a constraint date", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task1.setConstraint('muststarton', sameDate);
            });
            
            t.it("Must be violated if a task start earlier then a constraint date is set to", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task1.setConstraint('muststarton', laterDate);
            });

            t.it("Must be violated if a task starts later then a constraint date is set to", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task1.setConstraint('muststarton', earlierDate);
            });

        });

        t.describe("Must Finish On constraint", function(t) {

            t.it("Must not be violated if a task ends at a constraint date", function(t) {
                t.wontFire(taskStore, 'constraintconflict');
                task2.setConstraint('mustfinishon', sameDate);
            });

            t.it("Must be violated if a task ends earlier then a constraint date is set to", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task2.setConstraint('mustfinishon', laterDate);
            });

            t.it("Must be violated if a task ends later then a constraint date is set to", function(t) {
                t.firesOnce(taskStore, 'constraintconflict');
                task2.setConstraint('mustfinishon', laterDate);
            });

        });

    });

});
