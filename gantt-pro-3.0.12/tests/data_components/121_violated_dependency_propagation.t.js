StartTest(function(t) {

    // See https://www.assembla.com/spaces/bryntum/tickets/1729 for more information about the case
    var monday    = new Date(2014, 10, 17),
        tuesday   = new Date(2014, 10, 18),
        wednesday = new Date(2014, 10, 19),
        thursday  = new Date(2014, 10, 20),
        friday    = new Date(2014, 10, 21),
        saturday  = new Date(2014, 10, 22),
        sundary   = new Date(2014, 10, 23);

    /* global id, taskStore */
    with(t.getAllStoresDataSet([
        { Id : 1, StartDate : thursday, EndDate : friday, leaf : true },
        { Id : 2, StartDate : monday,   EndDate : friday, leaf : false, children : [
            { Id : 3, StartDate : thursday, EndDate : friday,  leaf : true },
            { Id : 4, StartDate : monday,   EndDate : tuesday, leaf : true }
        ] }
    ], [
        { From : 1, To : 2 }
    ])) {
        var t2 = id(2),
            t4 = id(4);

        taskStore.cascadeChanges     = true;
        taskStore.moveParentAsGroup  = true;
        taskStore.recalculateParents = true;

        t4.setStartDate(tuesday);
        t.is(t2.getStartDate(), tuesday, "Parent task start date is correct");
        t.is(t2.getEndDate(),   friday,  "Parent task end date is correct");
    }
});
