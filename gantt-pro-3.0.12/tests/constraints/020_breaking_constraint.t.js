/* global id, taskStore */
StartTest(function(t) {

    var setup = function () {
        return t.getAllStoresDataSet(
            [
                {
                    Id              : 1,
                    leaf            : true,
                    StartDate       : new Date(2014, 4, 5),
                    Duration        : 4,
                    ConstraintType  : 'startnoearlierthan',
                    ConstraintDate  : new Date(2014, 4, 1)
                }
            ]
        );
    };

    t.it('Setting the start date, satisfying to constraint should work', function (t) {
        with (setup()) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict  : 0
                }
            });
            
            var callbackCalled = false;
            
            id(1).setStartDate(
                new Date(2014, 4, 12), 
                undefined,
                undefined,
                function (cancelChanges) {
                    t.is(cancelChanges, false, "Constraint has been applied"); 
                    callbackCalled = true;
                }
            );
            
            t.ok(callbackCalled, "Constraint has been applied synchronously this time");
            
            t.is(id(1).getConstraintType(), 'startnoearlierthan', "Constraint is still applied");
            t.is(id(1).getConstraintDate(), new Date(2014, 4, 1), "Constraint applied");
            
            t.is(id(1).getStartDate(), new Date(2014, 4, 12), "Start date has been updated");
        }
    });

    
    t.it('Setting the start date, breaking constraint should work after resolution', function (t) {
        with (setup()) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict  : 1
                }
            });
            
            taskStore.on('constraintconflict', function (task, resolutionCtx) {
                // resolve the constraint by moving the task to nearest satisfying start date
                resolutionCtx.resolutions[ 2 ].resolve();
            }, null, { single : true, delay : 100 });
            
            var callbackCalled = false;
           
            id(1).setStartDate(
                new Date(2014, 3, 29), 
                undefined,
                undefined,
                function (cancelChanges) {
                    t.is(cancelChanges, false, "Changes has been applied");
                    callbackCalled = true;
                }
            );
            
            t.waitFor(function () {
                return callbackCalled;
            }, function () {
                t.is(id(1).getConstraintType(), 'startnoearlierthan', "Constraint applied");
                t.is(id(1).getStartDate(), new Date(2014, 4, 1), "Constraint has been resolved by moving task to different date");
            });
        }
    });
    
    
    t.it('Several constraints conflicts during one cascade changes should work', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id              : 1,
                    leaf            : true,
                    StartDate       : new Date(2014, 6, 14),
                    Duration        : 1,
                    ConstraintType  : 'startnolaterthan',
                    ConstraintDate  : new Date(2014, 6, 14)
                },
                {
                    Id              : 2,
                    leaf            : true,
                    StartDate       : new Date(2014, 6, 15),
                    Duration        : 1
                },
                {
                    Id              : 3,
                    leaf            : true,
                    StartDate       : new Date(2014, 6, 16),
                    Duration        : 1,
                    ConstraintType  : 'startnolaterthan',
                    ConstraintDate  : new Date(2014, 6, 16)
                }
            ],
            [
                { From : 1, To : 2 },
                { From : 2, To : 3 }
            ]
        )) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict  : 2
                }
            });
            
            taskStore.on('constraintconflict', function (task, resolutionCtx) {
                    
                taskStore.on('constraintconflict', function (task, resolutionCtx) {
                    // resolve the constraint by 2nd resolution - move the task to nearest satisfying start date
                    resolutionCtx.resolutions[ 2 ].resolve();
                    
                }, null, { single : true, delay : 100 });
                    
                // resolve the constraint by 1st resolution - remove the constraint
                resolutionCtx.resolutions[ 1 ].resolve();
                
            }, null, { single : true, delay : 100 });
            
            
            var callbackCalled = false;
            
            id(1).setStartDate(
                new Date(2014, 6, 15),
                undefined,
                undefined,
                function (cancelChanges) {
                    t.is(cancelChanges, false, "Constraint has been applied");
                    callbackCalled = true;
                }
            );
            
            t.waitFor(function () {
                return callbackCalled;
            }, function () {
                t.is(id(1).getConstraintType(), '', "Constraint has been removed");
                
                t.is(id(1).getStartDate(), new Date(2014, 6, 15), "Constraint has been resolved by its removal");
                
                t.is(id(2).getStartDate(), new Date(2014, 6, 16), "Start date defined by dependency");
                
                t.is(
                    id(3).getStartDate(), new Date(2014, 6, 16), 
                    "Start date hasn't been changed, because of chosen constraint resolution option"
                );
            });
        }
    });
    
    t.it('Canceling cascading at the 2nd constraint conflict should restore all data', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id              : 1,
                    leaf            : true,
                    StartDate       : new Date(2014, 6, 14),
                    Duration        : 1,
                    ConstraintType  : 'startnolaterthan',
                    ConstraintDate  : new Date(2014, 6, 14)
                },
                {
                    Id              : 2,
                    leaf            : true,
                    StartDate       : new Date(2014, 6, 15),
                    Duration        : 1
                },
                {
                    Id              : 3,
                    leaf            : true,
                    StartDate       : new Date(2014, 6, 16),
                    Duration        : 1,
                    ConstraintType  : 'startnolaterthan',
                    ConstraintDate  : new Date(2014, 6, 16)
                }
            ],
            [
                { From : 1, To : 2 },
                { From : 2, To : 3 }
            ]
        )) {
            t.firesOk({
                observable      : taskStore,
                events          : {
                    constraintconflict  : 2
                }
            });
            
            taskStore.on('constraintconflict', function (task, resolutionCtx) {
                    
                taskStore.on('constraintconflict', function (task, resolutionCtx) {
                    // resolve the constraint by 0th resolution - cancel whole operation
                    resolutionCtx.cancelAction();
                    
                }, null, { single : true, delay : 100 });
                    
                // resolve the constraint by 1st resolution - remove the constraint
                resolutionCtx.resolutions[ 1 ].resolve();
                
                t.is(id(1).getConstraintType(), '', "Constraint has been removed");
                
            }, null, { single : true, delay : 100 });
            
            
            var callbackCalled = false;
            
            id(1).setStartDate(
                new Date(2014, 6, 15), 
                undefined,
                undefined,
                function (cancelChanges) {
                    t.is(cancelChanges, true, "Operation has been canceled");
                    callbackCalled = true;
                }
            );
            
            t.waitFor(function () {
                return callbackCalled;
            }, function () {
                t.is(id(1).getConstraintType(), 'startnolaterthan', "Constraint has been restored after removal");
                t.is(id(1).getStartDate(), new Date(2014, 6, 14), "Changes has been canceled");
                t.is(id(2).getStartDate(), new Date(2014, 6, 15), "Changes has been canceled");
                t.is(id(3).getStartDate(), new Date(2014, 6, 16), "Changes has been canceled");
            });
        }
    }); 
});
