StartTest(function(t) {

    var DATE        = Sch.util.Date

    var calendar        = new Gnt.data.Calendar({ })
    var nonWorking = calendar.getHolidaysRanges(new Date(2010, 9, 11), new Date(2010, 9, 20), true);

    t.is(nonWorking.length, 1, 'Found one weekend');

    // Tests the DST behavior of Brazil
    t.is(nonWorking[0].getStartDate(), new Date(2010, 9, 16), 'Found one weekend');
    t.is(nonWorking[0].getEndDate(), new Date(2010, 9, 18), 'Found one weekend');
})