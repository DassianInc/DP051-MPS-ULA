/* global id, taskStore */
StartTest(function(t) {

    var setup = function () {
        return t.getAllStoresDataSet([
            {
                Id              : 1,
                leaf            : true,
                StartDate       : new Date(2014, 4, 5),
                Duration        : 4
            },
            {
                Id              : 2,
                leaf            : true,
                StartDate       : new Date(2014, 4, 5),
                Duration        : 4
            }
        ]);
    };

    t.it('Setting the satisfied constraint should work', function (t) {
        with (setup()) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict : 0
                }
            });
            
            var callbackCalled = false;
            
            id(1).setConstraint('startnoearlierthan', new Date(2014, 4, 1), function (cancelChanges) {
                t.is(cancelChanges, false, "Constraint successfully applied");
                callbackCalled = true;
            });
            
            t.ok(callbackCalled, "Callback has been called synchronously this time");
            
            t.is(id(1).getConstraintType(), 'startnoearlierthan', "Constraint applied");
            t.is(id(1).getConstraintDate(), new Date(2014, 4, 1), "Constraint applied");
        }
    });
    
    
    t.it('Resolving constraint by doing nothing should work', function (t) {
        with (setup()) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict : 1
                }
            });
            
            taskStore.on('constraintconflict', function (task, resolutionCtx) {
                resolutionCtx.cancelAction();
            }, null, { single : true, delay : 10 });
            
            var callbackCalled = false;
            
            id(1).setConstraint('startnoearlierthan', new Date(2014, 4, 10),  function (cancelChanges) {
                t.is(cancelChanges, true, "Constraint not applied");
                callbackCalled = true;
            });
            
            t.waitFor(function () {
                return callbackCalled;
            }, function () {
                t.is(id(1).getConstraintType(), '', "Constraint not applied");
                t.isStartEnd(id(1), new Date(2014, 4, 5), new Date(2014, 4, 9), "Task has not been changed");
            });
        }
    });
    
    
    t.it('Resolving constraint by moving start date of the task should work', function (t) {
        with (setup()) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict : 1
                }
            }); 
            
            taskStore.on('constraintconflict', function (task, resolutionCtx) {
                resolutionCtx.resolutions[ 2 ].resolve();
            }, null, { single : true, delay : 10});
            
            var callbackCalled = false;
            
            id(1).setConstraint('startnoearlierthan', new Date(2014, 4, 10), function (cancelChanges) {
                t.is(cancelChanges, false, "Constraint successfully applied");
                callbackCalled = true;
            });
            
            t.waitFor(function () {
                return callbackCalled;
            }, function () {
                t.is(id(1).getConstraintType(), 'startnoearlierthan', "Constraint applied");
                t.isStartEnd(id(1), new Date(2014, 4, 12), new Date(2014, 4, 16), "Constraint has been reolved by moving task to different date");
            });
        }
    });


    t.it('Adding a valid constraint to a task outside of the task store should call the callback with cancelChanges flag set to true', function (t) {
        var newTask = new Gnt.model.Task({
            StartDate : new Date(2014, 4, 5),
            Duration  : 5
        });
        
        var callbackCalled = false;
        
        newTask.setConstraint('startnoearlierthan', new Date(2014, 4, 5), function (cancelChanges) {
            t.is(cancelChanges, false, "Keep changes requiest recieved");
            callbackCalled = true;
        });
        
        t.waitFor(function () {
            return callbackCalled;
        });
    });


    t.it('Adding a conflicting constraint to a task outside of the task store should call the callback with cancelChanges flag set to true', function (t) {
        var newTask = new Gnt.model.Task({
            StartDate : new Date(2014, 4, 5),
            Duration  : 5
        });
        
        var callbackCalled = false;
        
        newTask.setConstraint('startnoearlierthan', new Date(2014, 4, 10), function (cancelChanges) {
            t.is(cancelChanges, true, "Cancel changes requiest recieved");
            callbackCalled = true;
        });
        
        t.waitFor(function () {
            return callbackCalled;
        });
    });

});
