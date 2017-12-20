StartTest(function(t) {

    t.expectGlobals('BaseClass1', 'SubSingeton1', 'Locale1');

    // Here we check that translation will be taken from a parent class if it's not specified for the original class it was requested of

    t.it('not singleton inherits locales from its base class', function (t) {

        var dayEditor   = new Gnt.widget.calendar.DayEditor({
            calendarDay : t.getBusinessTimeCalendar().getAt(0)
        });

        t.is(dayEditor.L('removeText'), 'Remove', 'locale removeText grabbed from parent class');

    });

    t.it('singleton inherits locales from its base class', function (t) {

        Ext.define('BaseClass1', {
            mixins  : ['Sch.mixin.Localizable']
        });

        Ext.define('SubSingeton1', {
            extend      : 'BaseClass1',
            singleton   : true
        });

        Ext.define('Locale1', {
            extend      : 'Sch.locale.Locale',
            singleton   : true,
            l10n        : {
                'BaseClass1' : {
                    'locale1' : 'locale1 is here'
                },

                'SubSingeton1' : {
                    'locale2' : 'locale2 is here'
                }
            }
        });

        var instance    = new BaseClass1({});

        t.ok(instance.L('locale1'), 'base class instance has own locale');
        t.ok(SubSingeton1.L('locale1'), 'sub-class has inherited locale');
        t.ok(SubSingeton1.L('locale2'), 'sub-class has own locale');
    });
});
