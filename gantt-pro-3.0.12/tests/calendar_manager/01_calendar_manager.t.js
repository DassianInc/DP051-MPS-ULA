StartTest(function (t) {
    var panel,
        view,
        calendarManager;

    var calendar    = function (name) { return calendarManager.getRoot().findChild('Name', name, true); };

    t.beforeEach(function () {
        panel && panel.destroy();

        calendarManager = Ext.create('Gnt.data.CalendarManager', {
            root    : {
                expanded    : true,
                children    : [
                    {
                        Id                  : 1,
                        Name                : 'calendar1',
                        DaysPerMonth        : 30,
                        DaysPerWeek         : 7,
                        HoursPerDay         : 24,
                        WeekendsAreWorkdays : true,
                        WeekendFirstDay     : 6,
                        WeekendSecondDay    : 0,
                        DefaultAvailability : [ '00:00-24:00' ],
                        expanded            : true,
                        leaf                : true
                    },
                    {
                        Id                  : 2,
                        Name                : 'calendar2',
                        DaysPerMonth        : 30,
                        DaysPerWeek         : 7,
                        HoursPerDay         : 24,
                        WeekendsAreWorkdays : true,
                        WeekendFirstDay     : 6,
                        WeekendSecondDay    : 0,
                        DefaultAvailability : [ '00:00-24:00' ],
                        expanded            : true,
                        children    : [
                            {
                                Id                  : 21,
                                Name                : 'calendar21',
                                DaysPerMonth        : 30,
                                DaysPerWeek         : 7,
                                HoursPerDay         : 24,
                                WeekendsAreWorkdays : true,
                                WeekendFirstDay     : 6,
                                WeekendSecondDay    : 0,
                                DefaultAvailability : [ '00:00-24:00' ],
                                leaf                : true
                            }
                        ]
                    }
                ]
            }
        });

        calendarManager.getRoot().expand();

        calendarManager.setProjectCalendar(calendar('calendar1').getCalendar());

        calendar('calendar1').getCalendar().loadData([
            { Id : 1, Name: 'day 1', Date : new Date(2013, 1, 1), Type : 'DAY' },
            { Id : 3, Weekday : -1, Name: 'week 1', Type : 'WEEKDAYOVERRIDE', OverrideStartDate : new Date(2014, 0, 14), OverrideEndDate : new Date(2014, 0, 28) },
            { Id : 4, Weekday : 1, Name: 'week 1', Type : 'WEEKDAYOVERRIDE', OverrideStartDate : new Date(2014, 0, 14), OverrideEndDate : new Date(2014, 0, 28), IsWorkingDay: false },
            { Id : 5, Weekday : 2, Name: 'week 1', Type : 'WEEKDAYOVERRIDE', OverrideStartDate : new Date(2014, 0, 14), OverrideEndDate : new Date(2014, 0, 28), IsWorkingDay: false }
        ]);

        calendar('calendar2').getCalendar().loadData([
            { Id : 10, Name: 'day 2', Date : new Date(2013, 3, 1), Type : 'DAY' },
            { Id : 11, Name: 'day 3', Date : new Date(2013, 4, 1), Type : 'DAY' },
            { Id : 12, Weekday : 3, Type : 'WEEKDAY' },
            { Id : 13, Weekday : 4, Type : 'WEEKDAY' },
            { Id : 14, Weekday : -1, Type : 'WEEKDAYOVERRIDE', OverrideStartDate : new Date(2012, 0, 1), OverrideEndDate : new Date(2012, 11, 31) },
            { Id : 15, Weekday : 5, Type : 'WEEKDAYOVERRIDE', OverrideStartDate : new Date(2012, 0, 1), OverrideEndDate : new Date(2012, 11, 31) }
        ]);

        calendar('calendar21').getCalendar().loadData([
            { Id : 100, Name: 'day 4', Date : new Date(2014, 3, 1), Type : 'DAY' }
        ]);

        panel   = Ext.create('Gnt.widget.calendar.CalendarManager', {
            calendarManager : calendarManager,
            height          : 600,
            width           : 800,
            renderTo        : Ext.getBody()
        });

        view    = panel.treePanel.getView();

    });

    t.it('Should populate calendar widget when user click on tree node', function (t) {

        var firstNode = view.getNode(calendar('calendar1'));

        t.hasCls(Ext.fly(view.getNode(calendar('calendar1'))).down('tr'), 'gnt-project-calendar-row', 'project calendar is highlighted');

        t.chain(
            { click :  firstNode },
            function (next) {
                t.is(panel.calendarPanel.calendar, calendar('calendar1').getCalendar(), 'calendar1 set properly');

                t.ok(panel.treePanel.down('#btnRemove').isDisabled(), 'remove bitton disabled');
                t.ok(panel.contextMenu.down('#remove-node').isDisabled(), 'remove menu item disabled');

                var store   = panel.calendarPanel.dayGrid.getStore();

                t.is(store.count(), 1, 'proper number of records in day overrides grid');
                t.is(store.getAt(0).getId(), 1, '1st record has proper Id');
                t.is(store.getAt(0).getName(), 'day 1', '1st record has proper name');
                t.is(store.getAt(0).getDate(), new Date(2013, 1, 1), '1st record has proper Date');

                store = panel.calendarPanel.weekGrid.getStore();

                t.is(store.count(), 1, 'proper number of records in week overrides grid');
                t.is(store.getAt(0).get('startDate'), new Date(2014, 0, 14), '1st record has proper startDate');
                t.is(store.getAt(0).get('endDate'), new Date(2014, 0, 28), '1st record has proper endDate');
                t.is(store.getAt(0).get('name'), 'week 1', '1st record has proper name');

                t.isDeeply(panel.treePanel.getSelectionModel().getSelection(), [calendar('calendar1')], 'first calendar is selected');
                t.is(panel.calendarPanel.down('#calendarName').getValue(), calendar('calendar1').getName(), 'calendar is set');

                next();
            },
            { click: function () { return view.getNode(calendar('calendar2')); } },
            function (next) {
                t.is(panel.calendarPanel.calendar, calendar('calendar2').getCalendar(), 'calendar2 set properly');

                t.notOk(panel.treePanel.down('#btnRemove').isDisabled(), 'remove button enabled');
                t.notOk(panel.contextMenu.down('#remove-node').isDisabled(), 'remove menu item enabled');

                var store   = panel.calendarPanel.dayGrid.getStore();

                t.is(store.count(), 2, 'proper number of records in day overrides grid');
                t.is(store.getAt(0).getId(), 10, '1st record has proper Id');
                t.is(store.getAt(0).getName(), 'day 2', '1st record has proper name');
                t.is(store.getAt(0).getDate(), new Date(2013, 3, 1), '1st record has proper Date');
                t.is(store.getAt(1).getId(), 11, '2nd record has proper Id');
                t.is(store.getAt(1).getName(), 'day 3', '2nd record has proper name');
                t.is(store.getAt(1).getDate(), new Date(2013, 4, 1), '2nd record has proper Date');

                next();
            },
            { click: function () { return view.getNode(calendar('calendar21')); } },
            function (next) {
                t.is(panel.calendarPanel.calendar, calendar('calendar21').getCalendar(), 'calendar21 set properly');

                t.notOk(panel.treePanel.down('#btnRemove').isDisabled(), 'remove button enabled');
                t.notOk(panel.contextMenu.down('#remove-node').isDisabled(), 'remove menu item enabled');

                var store   = panel.calendarPanel.dayGrid.getStore();

                t.is(store.count(), 1, 'proper number of records in day overrides grid');
                t.is(store.getAt(0).getId(), 100, '1st record has proper Id');
                t.is(store.getAt(0).getName(), 'day 4', '1st record has proper name');
                t.is(store.getAt(0).getDate(), new Date(2014, 3, 1), '1st record has proper Date');

                next();
            }
        );
        // TODO: add assertions for setCalendar(calendar2) and setCalendar(calendar21)
    });

    t.it('Should drag\'n\'drop tree nodes', function (t){

        t.chain(
            // add a calendar
            { rightclick : view },
            { click : '>>menuitem[text=Add calendar]' },

            // add child node Calendar2 to Calendar1
            { rightclick : '.x-tree-node-text:contains(Calendar1)' },
            { click : '>>menuitem[text=Add child]' },

            //add child node Calendar3 to Calendar2
            { rightclick : '.x-tree-node-text:contains(Calendar2)' },
            { click : '>>menuitem[text=Add child]' },

            // add child node Calendar4 to Calendar3
            { rightclick : '.x-tree-node-text:contains(Calendar3)' },
            { click : '>>menuitem[text=Add child]' },

            // add sibling node Calendar5 to Calendar2
            { rightclick : '.x-tree-node-text:contains(Calendar2)' },
            { click : '>>menuitem[text=Add sibling]' },

            function (next) {
                t.is(calendar('Calendar2').getCalendar().parent, calendar('Calendar1').getCalendar(), 'data.Calendar hierarchy between Calendar1 and Calendar2 is correct');
                t.is(calendar('Calendar3').getCalendar().parent, calendar('Calendar2').getCalendar(), 'data.Calendar hierarchy between Calendar2 and Calendar3 is correct')
                t.is(calendar('Calendar4').getCalendar().parent, calendar('Calendar3').getCalendar(), 'data.Calendar hierarchy between Calendar3 and Calendar4 is correct')
                t.is(calendar('Calendar5').getCalendar().parent, calendar('Calendar1').getCalendar(), 'data.Calendar hierarchy between Calendar1 and Calendar5 is correct');
                next();
            },

            // drag Calendar3 node and drop on calendar2 node
            { drag: '.x-tree-node-text:contains(Calendar3)',
                to: '.x-tree-node-text:contains(calendar2)' },

            function (next) {
                t.pass('Saving changes');

                var before  = panel.treePanel.view.store.getRange();
                panel.applyChanges();

                t.isDeeply(panel.treePanel.view.store.getRange(), before, 'correct nodes order');

                t.is(calendar('Calendar2').getCalendar().parent, calendar('Calendar1').getCalendar(), 'data.Calendar hierarchy between Calendar1 and Calendar2 is correct');
                t.is(calendar('Calendar2').parentNode.getName(), calendar('Calendar1').getName(), 'model.Calendar hierarchy between Calendar1 and Calendar2 is correct');

                t.is(calendar('Calendar3').getCalendar().parent, calendar('calendar2').getCalendar(), 'data.Calendar hierarchy between Calendar5 and Calendar3 is correct')
                t.is(calendar('Calendar3').parentNode.getName(), calendar('calendar2').getName(), 'model.Calendar hierarchy between Calendar5 and Calendar3 is correct')

                t.is(calendar('Calendar4').getCalendar().parent, calendar('Calendar3').getCalendar(), 'data.Calendar hierarchy between Calendar3 and Calendar4 is correct')
                t.is(calendar('Calendar4').parentNode.getName(), calendar('Calendar3').getName(), 'model.Calendar hierarchy between Calendar3 and Calendar4 is correct')

                t.is(calendar('Calendar5').getCalendar().parent, calendar('Calendar1').getCalendar(), 'data.Calendar hierarchy between Calendar1 and Calendar5 is correct');
                t.is(calendar('Calendar5').parentNode.getName(), calendar('Calendar1').getName(), 'model.Calendar hierarchy between Calendar1 and Calendar5 is correct');
            }
        );
    });

    t.it('Should check calendar changes on navigating the tree', function (t) {

        var cp      = panel.calendarPanel,
            date    = new Date();

        t.chain(
            // adding new node
            { rightclick :  view },
            { click : function () { return Ext.WindowManager.getActive().items.getAt(0); } },
            // select new node
            { click : function () { return view.getNode(calendar('Calendar1')); } },
            // do some changes on form
            function (next) {
                cp.down('#calendarName').setValue('Calendar 1');
                cp.datePicker.setValue(date);
                next();
            },
            { click : cp.dayGrid.down('#btnAdd') },
            function (next) {
                cp.dayGrid.getStore().getAt(0).setName('test day');
                var tab = cp.down('tabpanel');
                // select tab "week overrides"
                tab.setActiveTab(tab.items.getAt(1));
                cp.datePicker.setValue(Ext.Date.add(date, Ext.Date.DAY, 1));
                next();
            },
            { click : cp.weekGrid.down('#btnAdd') },
            function (next) {
                cp.weekGrid.getStore().getAt(0).set('name', 'test week');
                next();
            },
            // saving changes
            { click : function () { return view.getNode(calendar('calendar1')); } },
            { click : function () { return Ext.WindowManager.getActive().down('#cancel'); } },
            function (next) {
                t.is(panel.treePanel.getSelectionModel().getSelection()[0], calendar('Calendar1'), 'Selected node is correct');
                next();
            },
            { click : function () { return view.getNode(calendar('calendar1')); } },
            { click : function () { return Ext.WindowManager.getActive().down('#yes'); } },
            // select saved node
            { click : function () { return view.getNode(calendar('Calendar1')); } },
            function (next) {
                t.is(cp.weekGrid.getStore().getAt(0).get('name'), 'test week', 'Content of week grid is correct');
                var tab = cp.down('tabpanel');
                tab.setActiveTab(tab.items.getAt(0));
                t.is(cp.dayGrid.getStore().getAt(0).getName(), 'test day', 'Content of day grid is correct');

                cp.dayGrid.getSelectionModel().select(0);
                cp.dayGrid.down('#btnRemove');
                next();
            },
            { click : function () { return cp.dayGrid.down('#btnRemove'); } },
            { click : function () { return view.getNode(calendar('calendar1')); } },
            { click : function () { return Ext.WindowManager.getActive().down('#no'); } },
            { click : function () { return view.getNode(calendar('Calendar1')); } },
            function (next) {
                t.is(cp.dayGrid.getStore().getAt(0).getName(), 'test day', calendar('Calendar1'), 'Changes are not saved');
                next();
            }
        );
    });
});