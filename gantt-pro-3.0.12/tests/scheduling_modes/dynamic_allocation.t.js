StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet1()
    
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    var resourceStore       = dataSet.resourceStore
    

    //======================================================================================================================================================================================================================================================
    t.diag('DynamicAllocation scheduling mode')
    
    var task4       = taskStore.getNodeById(4);
    var resource5   = resourceStore.getById('Res5')   
    var resource6   = resourceStore.getById('Res6')
    var resource7   = resourceStore.getById('Res7')

    t.is(task4.getSchedulingMode(), 'DynamicAssignment', 'We are testing DynamicAllocation scheduling mode')
    
    t.is(task4.getDuration('h'), 16, 'Duration is 16 working hours - 2 full days (26 is a holiday in the taks`s calendar)')
    t.is(task4.getDuration(), 2, 'Duration is 2 working days')
    
    t.is(task4.getEffort(), 16, '16 hours effort - should be provided upfront')
    
    t.isDeeply(t.sortByInternalId(task4.getResources()), [ resource5, resource6 ], 'Res5, 6 are assigned to task4')
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 80, 'Correct initial assignment level for resource 5')
    t.is(task4.getAssignmentFor(resource6).getUnits(), 80, 'Correct initial assignment level for resource 6')
    
    // now increasing the duration by 1 days - the assignment levels should decrease
    task4.setDuration(3)
    
    t.is(task4.getEffort(), 16, "Effort should not change")
    t.is(task4.getEndDate(), new Date(2011, 6, 28, 17), "Correct new end date")
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 16 / (20 + 16) * 100, 'Correct new assignment level for resource 5')
    t.is(task4.getAssignmentFor(resource6).getUnits(), 16 / (20 + 16) * 100, 'Correct new assignment level for resource 6')
    
    // now increasing the duration by 1 days - the assignment levels should decrease
    task4.setDuration(1)
    
    t.is(task4.getEffort(), 16, "Effort should not change")
    t.is(task4.getEndDate(), new Date(2011, 6, 25, 17), "Correct new end date")
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 16 / (3 + 8) * 100, 'Correct new assignment level for resource 5')
    t.is(task4.getAssignmentFor(resource6).getUnits(), 16 / (3 + 8) * 100, 'Correct new assignment level for resource 6')
    
    
    // now unassigning one resource
    task4.unAssign(resource6)
    
    t.is(task4.getDuration(), 1, 'Duration should not change')
    t.is(task4.getEffort(), 16, 'Effort should not change')
    t.is(task4.getEndDate(), new Date(2011, 6, 25, 17), "End date should not change")
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 16 / 3 * 100, 'Correct new assignment level for resource 5')
    t.is(task4.getAssignmentFor(resource6), null, 'No assignment for Resource6')
    
    // now assigning old resource back
    task4.assign(resource6)

    t.is(task4.getDuration(), 1, 'Duration should not change')
    t.is(task4.getEffort(), 16, 'Effort should not change')
    t.is(task4.getEndDate(), new Date(2011, 6, 25, 17), "End date should not change")
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 16 / (3 + 8) * 100, 'Assignment level for resource 5 was restored back')
    t.is(task4.getAssignmentFor(resource6).getUnits(), 16 / (3 + 8) * 100, 'Assignment level for resource 6 was restored back')
    
    
    // assigning additional resource and increasing the duration till 2 days
    task4.assign(resourceStore.getById('Res7'))
    task4.setDuration(2)
    
    t.is(task4.getEffort(), 16, 'Effort should not change')
    
    t.is(task4.getAssignments().length, 3, 'Now 3 resources are working on the task')
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 16 / (19 + 17) * 100, 'Correct assignment level for resource 5')
    t.is(task4.getAssignmentFor(resource6).getUnits(), 16 / (19 + 17) * 100, 'Correct assignment level for resource 6')
    t.is(task4.getAssignmentFor(resource7).getUnits(), 16 / (19 + 17) * 100, 'Correct assignment level for resource 7')
    
    // doubling the effort of the task - assignment units should double too 
    task4.setEffort(32)
    
    t.is(task4.getAssignmentFor(resource5).getUnits(), 32 / (19 + 17) * 100, 'Correct assignment level for resource 5')
    t.is(task4.getAssignmentFor(resource6).getUnits(), 32 / (19 + 17) * 100, 'Correct assignment level for resource 6')
    t.is(task4.getAssignmentFor(resource7).getUnits(), 32 / (19 + 17) * 100, 'Correct assignment level for resource 7')
})    
