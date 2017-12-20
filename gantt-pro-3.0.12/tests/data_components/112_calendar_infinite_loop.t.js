StartTest(function(t) {

    // Here we check that skipNonWorkingTime() doesn't fall into infinite loop and raises exception
    // if no working period of time is specified for the calendar (#1259)

    var calendar        = new Gnt.data.Calendar({
        data        : [
            { Id: 1, Type: "WEEKDAY", Weekday: 1 },
            { Id: 2, Type: "WEEKDAY", Weekday: 2 },
            { Id: 3, Type: "WEEKDAY", Weekday: 3 },
            { Id: 4, Type: "WEEKDAY", Weekday: 4 },
            { Id: 5, Type: "WEEKDAY", Weekday: 5 },
            { Id: 6, Type: "WEEKDAY", Weekday: 6 },
            { Id: 7, Type: "WEEKDAY", Weekday: 0 }
        ]
    });

    t.throwsOk(function () { calendar.skipNonWorkingTime(new Date()); },
        'skipNonWorkingTime: Cannot skip non-working time, please ensure that this calendar has any working period of time specified',
        'skipNonWorkingTime throws exception'
    );

    t.throwsOk(function () { calendar.skipNonWorkingTime(new Date(), true); },
        'skipNonWorkingTime: Cannot skip non-working time, please ensure that this calendar has any working period of time specified',
        'skipNonWorkingTime throws exception'
    );

});
