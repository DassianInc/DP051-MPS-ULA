StartTest(function(t) {

    // Here we test Gnt.data.CalendarManager class

    var calendarManager = Ext.create('Gnt.data.CalendarManager');
    var root = calendarManager.getRoot();

    t.chain(
        t.getSubTest('CalendarManager creates a calendar instances by provided `root` config', function (t) {

            var calendarManager2 = Ext.create('Gnt.data.CalendarManager', {
                root    : {
                    expanded    : true,
                    children    : [
                        {
                            Id                  : 100,
                            Name                : 'c100',
                            DaysPerMonth        : 30,
                            DaysPerWeek         : 7,
                            HoursPerDay         : 24,
                            WeekendsAreWorkdays : true,
                            WeekendFirstDay     : 6,
                            WeekendSecondDay    : 0,
                            DefaultAvailability : [ '00:00-24:00' ],
                            children            : [
                                {
                                    Id          : 101,
                                    Name        : 'c101',
                                    children    : [
                                        {
                                            Id          : 102,
                                            Name        : 'c102'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            });

            var calendar = function (id) {
                return calendarManager2.getNodeById(id);
            };

            t.isStrict(calendar(100).getCalendar(), Gnt.data.Calendar.getCalendar(100), 'c100 calendar created');
            t.isStrict(calendar(101).getCalendar(), Gnt.data.Calendar.getCalendar(101), 'c101 calendar created');
            t.isStrict(calendar(102).getCalendar(), Gnt.data.Calendar.getCalendar(102), 'c102 calendar created');
        }),

        t.getSubTest('CalendarManager creates a calendar instances after setRoot call', function (t) {

            var calendarManager2 = Ext.create('Gnt.data.CalendarManager');

            calendarManager2.setRoot({
                expanded    : true,
                children    : [
                    {
                        Id                  : 1000,
                        Name                : 'c1000',
                        DaysPerMonth        : 30,
                        DaysPerWeek         : 7,
                        HoursPerDay         : 24,
                        WeekendsAreWorkdays : true,
                        WeekendFirstDay     : 6,
                        WeekendSecondDay    : 0,
                        DefaultAvailability : [ '00:00-24:00' ],
                        children            : [
                            {
                                Id          : 1010,
                                Name        : 'c1010',
                                children    : [
                                    {
                                        Id          : 1020,
                                        Name        : 'c1020'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            var calendar = function (id) {
                return calendarManager2.getNodeById(id);
            };

            t.isStrict(calendar(1000).getCalendar(), Gnt.data.Calendar.getCalendar(1000), 'c1000 calendar created');
            t.isStrict(calendar(1010).getCalendar(), Gnt.data.Calendar.getCalendar(1010), 'c1010 calendar created');
            t.isStrict(calendar(1020).getCalendar(), Gnt.data.Calendar.getCalendar(1020), 'c1020 calendar created');
        }),

        t.getSubTest('Calendar managel fills created calendars with provided array of days', function (t) {

            var calendarManager2 = Ext.create('Gnt.data.CalendarManager');

            calendarManager2.setRootNode({
                expanded    : true,
                children    : [
                    {
                        Id                  : 10000,
                        Name                : 'c10000',
                        DaysPerMonth        : 30,
                        DaysPerWeek         : 7,
                        HoursPerDay         : 24,
                        WeekendsAreWorkdays : true,
                        WeekendFirstDay     : 6,
                        WeekendSecondDay    : 0,
                        DefaultAvailability : [ '00:00-24:00' ],
                        Days                : [
                            { Id : 1, Date : new Date(2010, 1, 1), Name : 'day1' },
                            { Id : 2, Date : new Date(2010, 1, 2), Name : 'day2' }
                        ],
                        children            : [
                            {
                                Id          : 10100,
                                Name        : 'c10100',
                                children    : [
                                    {
                                        Id          : 10200,
                                        Name        : 'c10200'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            var calendar = function (id) {
                return calendarManager2.getNodeById(id);
            };

            var c10000 = calendar(10000).getCalendar();

            t.isStrict(c10000, Gnt.data.Calendar.getCalendar(10000), 'c10000 calendar created');
            t.isStrict(calendar(10100).getCalendar(), Gnt.data.Calendar.getCalendar(10100), 'c10100 calendar created');
            t.isStrict(calendar(10200).getCalendar(), Gnt.data.Calendar.getCalendar(10200), 'c10200 calendar created');

            t.is(c10000.count(), 2, 'proper number of days');
            t.is(c10000.getAt(0).getId(), 1, '1st day has proper id');
            t.is(c10000.getAt(0).getName(), 'day1', '1st day has proper name');
            t.is(c10000.getAt(0).getDate(), new Date(2010, 1, 1), '1st day has proper date');
            t.is(c10000.getAt(1).getId(), 2, '2nd day has proper id');
            t.is(c10000.getAt(1).getName(), 'day2', '2nd day has proper name');
            t.is(c10000.getAt(1).getDate(), new Date(2010, 1, 2), '2nd day has proper date');
        }),

        {
            desc    : 'CalendarManager creates a calendar instance for each added record',

            action  : function (next) {
                var general = root.appendChild({});
                var holidays = general.appendChild({});
                var subholidays = holidays.appendChild({});

                t.ok(general.getCalendar(), 'general calendar assigned to its record');
                t.ok(holidays.getCalendar(), 'holidays calendar assigned to its record');
                t.ok(subholidays.getCalendar(), 'subholidays calendar assigned to its record');

                t.isStrict(general.getCalendar(), Gnt.data.Calendar.getCalendar(general.getId()), 'correct general calendar assigned to a proper record');
                t.isStrict(holidays.getCalendar(), Gnt.data.Calendar.getCalendar(holidays.getId()), 'correct holidays calendar assigned to a proper record');
                t.isStrict(subholidays.getCalendar(), Gnt.data.Calendar.getCalendar(subholidays.getId()), 'correct subholidays calendar assigned to a proper record');

                next(general, holidays, subholidays);
            }
        },

        {
            desc    : 'Calendar changes set corresponding calendar manager record as dirty',

            action  : function (next, general, holidays, subholidays) {
                var generalCalendar     = general.getCalendar();
                var holidaysCalendar    = holidays.getCalendar();
                var subholidaysCalendar = subholidays.getCalendar();

                // commit general record to reset its dirty flag
                general.commit(true);

                var added0  = subholidaysCalendar.add({
                    'Date'          : new Date(2013, 0, 3),
                    'Availability'  : ['11:00-11:45']
                });

                // we reset dirty flag from subholidays as well
                // since we want to see how removing of the day added above will cause this record to get dirty
                subholidays.commit(true);

                t.willFireNTimes(calendarManager, 'calendarchange', 11);
                t.willFireNTimes(calendarManager, 'dayadd', 2);
                t.willFireNTimes(calendarManager, 'dayupdate', 2);
                t.willFireNTimes(calendarManager, 'dayremove', 1);

                var added1  = generalCalendar.add({ // will cause 3 calendarchange events : on general, holidays and subholidays calendars
                    'Date'          : new Date(2013, 0, 3),
                    'Availability'  : ['11:00-11:45']
                });

                added1[0].set('Date', new Date(2013, 0, 2)); // will cause 3 calendarchange events

                var added2  = holidaysCalendar.add({ // will cause 2 calendarchange events
                    'Date'          : new Date(2013, 0, 3),
                    'Availability'  : ['11:00-11:45']
                });

                // we reset dirty flag since we wanna see how updating of the day added above will cause this record to get dirty
                holidays.commit(true);

                added2[0].set('Date', new Date(2013, 0, 2)); // will cause 2 calendarchange events

                subholidaysCalendar.remove(added0); // will cause 1 calendarchange event

                t.isDeeply(calendarManager.getUpdatedRecords(), [general, holidays, subholidays], 'proper records got dirty');
            }
        }
    );

    t.it('Creates calendar using specified calendarClass', function (t) {

        var calendarManager = Ext.create('Gnt.data.CalendarManager', {
            calendarClass   : 'Gnt.data.calendar.BusinessTime'
        });

        var root = calendarManager.getRoot();

        var general     = root.appendChild({
            DaysPerMonth : 3
        });

        var holidays = general.appendChild({});

        var subholidays = holidays.appendChild({
            // here we specify some custom class
            CalendarClass   : 'Gnt.data.Calendar'
        });

        var subholidaysCalendar     = subholidays.getCalendar();
        t.is(general.getDaysPerMonth(), 3, 'correct DaysPerMonth in `general` calendar');
        t.isInstanceOf(general.getCalendar(), Gnt.data.calendar.BusinessTime, 'correct class used for `general` calendar');
        t.isInstanceOf(holidays.getCalendar(), Gnt.data.calendar.BusinessTime, 'correct class used for `holidays` calendar');
        t.is(Ext.getClass(subholidaysCalendar), Gnt.data.Calendar, 'correct class used for `subholidays` calendar');

        var generalId   = general.getId() || general.internalId;
        //destroy calendar instance
        root.removeChild(general);

        t.notOk(Gnt.data.Calendar.getCalendar(generalId), 'general calendar destroyed');
    });

    t.it('Calendar instance can be passed to appendChild and insertBefore', function (t) {

        var calendarManager = Ext.create('Gnt.data.CalendarManager', {
            calendarClass   : 'Gnt.data.calendar.BusinessTime'
        });

        var generalCalendar = Ext.create('Gnt.data.Calendar', {
            name                : 'General',
            daysPerMonth : 29,
            weekendsAreWorkdays : true
        });

        var general = calendarManager.getRoot().appendChild(generalCalendar);

        t.is(general.getCalendar(), generalCalendar, 'correct calendar assigned to record');

        t.is(general.getName(), 'General', 'correct Name');
        t.is(general.getDaysPerMonth(), 29, 'correct DaysPerMonth');
        t.is(general.getDaysPerWeek(), 7, 'correct DaysPerWeek');
        t.is(general.getHoursPerDay(), 24, 'correct HoursPerDay');
        t.is(general.getWeekendsAreWorkdays(), true, 'correct WeekendsAreWorkdays');
        t.is(general.getWeekendFirstDay(), 6, 'correct WeekendFirstDay');
        t.is(general.getWeekendSecondDay(), 0, 'correct WeekendSecondDay');
        t.isDeeply(general.getDefaultAvailability(), ['00:00-24:00'], 'correct DefaultAvailability');
    });
});
