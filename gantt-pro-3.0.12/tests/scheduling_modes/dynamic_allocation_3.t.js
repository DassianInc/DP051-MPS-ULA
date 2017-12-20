StartTest(function(t) {

    //======================================================================================================================================================================================================================================================
    t.diag('Setup')

    var dataSet             = t.getSampleDataSet1()
    var taskStore           = dataSet.taskStore
    var resourceStore       = dataSet.resourceStore

    //======================================================================================================================================================================================================================================================
    var task2       = taskStore.getNodeById(2);
    var resource4   = resourceStore.getById('Res4')
    var resource5   = resourceStore.getById('Res5')

    t.describe('DynamicAllocation scheduling mode', function (t) {

        t.it('Assert resource unit calculation', function (t) {

            task2.setSchedulingMode('DynamicAssignment')

            t.is(task2.getSchedulingMode(), 'DynamicAssignment', 'Schedulingmode for task is DynamicAllocation')

            t.is(task2.getDuration('HOUR'), 28, 'Task has a duration of 28 hours')

            t.is(task2.getEffort(), 28, 'Task has an effort of 28 hours')

            task2.getAssignmentFor(resource4).setUnits(120)

            t.is(task2.getAssignmentFor(resource4).getUnits(), 100, 'No more units than needed for duration')

            task2.assign(resource5, 50)

            t.is(task2.getAssignmentFor(resource4).getUnits(), task2.getAssignmentFor(resource5).getUnits(), 'Units are divided between two resources')

            task2.getAssignmentFor(resource5).setUnits(100)

            t.is(task2.getAssignmentFor(resource5).getUnits(), 50, 'Units are recalculated by duration')

            t.is(task2.getDuration('HOUR'), 28, 'Task still has a duration of 28 hours')

            t.is(task2.getEffort(), 28, 'Task still has an effort of 28 hours')

        })

    })

})
