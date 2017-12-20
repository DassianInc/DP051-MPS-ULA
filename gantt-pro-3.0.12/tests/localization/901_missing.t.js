StartTest(function(t) {
    // this test compares each locale class with english one to find not supported phrases or sub-classes
    Ext.Loader.setPath('Sch', '../../ExtScheduler3.x/js/Sch');
    Ext.Loader.setPath('Gnt', '../js/Gnt');

    // list specifying phrases equal to English which should be ignored
    var ignoreRe = {
        RuRU    : /WBS\.text|DependencyGrid\.(idText|snText)|Sequence\.text/,
        Pl      : /ok|OK|baseline|idText|snText|Sequence\.text/,
        SvSE    : /startText|ok|OK|idText|snText|StartDate\.text|WBS\.text|Slack\.text|baselineStartText|Sequence\.text|typeText\.SS|SchedulingMode\.Normal|Gnt\.panel\.Timeline\.start/,
        De      : 'OK|TaskForm\\.rollupText|DependencyDragDrop\\.startText|DependencyEditor\\.(lagText|endToStartText|startToStartText|endToEndText|startToEndText)|'+
            'DependencyGrid\\.(clsText|idText|lagText|snText|endToStartText|startToStartText|endToEndText|startToEndText)|'+
            'CalendarWindow\\.ok|TaskEditor\\.(wbsCodeText)|BaseEditor\\.(okText|alertCaption)|Sequence\\.text|WBS\\.text|Slack\\.text|Calendar\\.(okText|dayOverrideNameHeaderText|overrideName)|'+
            'AvailabilityGrid\\.startText|ResourceCalendarGrid\\.name|TaskForm\\.(taskNameText|startText|baselineStartText|baselineText)|SchedulingMode\\.Normal|'+
            'ProjectForm\\.(nameText|startText)|Gnt\\.panel\\.Timeline\\.start',
        It      : 'OK|Calendar\\.okText|CalendarWindow\\.ok|DependencyEditor\\.lagText|DependencyGrid\\.(idText|lagText|snText)|BaseEditor\\.okText|Milestone\\.no|Milestone\\.text|Note\\.text|'+
            'TaskContextMenu\\.addMilestone|Sequence\\.text|Rollup\\.no|ManuallyScheduled\\.no|typeText\\.FF|ReadOnly\\.no|Gnt\\.field\\.ShowInTimeline\\.no',
        Nl      : 'DependencyDragDrop\\.startText|DependencyEditor\\.typeText|Calendar\\.(weekendsText|okText)|AvailabilityGrid\\.startText|CalendarWindow\\.ok|' +
            'SchedulingMode\\.text|Sequence\\.text|WBS\\.text|TaskForm\\.(schedulingModeText|baselineText)|DependencyGrid\\.(idText|snText|typeText|clsText)|' +
            'TaskEditor\\.(resourcesText|wbsCodeText)|BaseEditor\\.(okText)|OK|ResourceHistogram\\.resourceText|ProjectForm\\.projectText|Gnt\\.panel\\.Timeline\\.start'
    };
    var errors = 0;

    var checkObject = function (t, master, tested, path, ignoreRe) {
        for (var prop in master) {
            var p = path + (path ? '.' : '') + prop;

            if (prop in tested && typeof tested[prop] === typeof master[prop]) {
                if ('object' === typeof master[prop]) {
                    checkObject(t, master[prop], tested[prop], p, ignoreRe);

                    // if phrase matches corresponding one from En locale and not mentioned in ignore list
                } else if (master[prop] === tested[prop] && (!ignoreRe || !p.match(ignoreRe))) {
                    t.fail(p + ' matches En locale');
                    errors++;
                }
            } else {
                t.fail(p + ' is not supported');
                errors++;
            }
        }
    };

    function assertLocale(t, master, tested) {
        errors = 0;

        // get last fraction of class name to retreive corresponding list from ignoreRe
        var id = Ext.getClassName(Ext.getClass(tested)).split('.').pop();

        // compare the content of l10n
        checkObject(t, master.l10n, tested.l10n, '', ignoreRe[id]);

        !errors && t.is(errors, 0, id + ': Locale is completely translated');
    }

    t.requireOk(
        [
            'Gnt.locale.En',
            'Gnt.locale.RuRU',
            'Gnt.locale.De',
            'Gnt.locale.Pl',
            'Gnt.locale.SvSE',
            'Gnt.locale.It',
            'Gnt.locale.Nl'
        ],
        function () {

            t.it('Gnt.locale.RuRU', function(t) {
                assertLocale(t, Gnt.locale.En, Gnt.locale.RuRU);
            });

            t.it('Gnt.locale.SvSE', function (t) {
                assertLocale(t, Gnt.locale.En, Gnt.locale.SvSE);
            });

            t.it('Gnt.locale.De', function (t) {
                assertLocale(t, Gnt.locale.En, Gnt.locale.De);
            });

            t.it('Gnt.locale.Pl', function (t) {
                assertLocale(t, Gnt.locale.En, Gnt.locale.Pl);
            });

            t.it('Gnt.locale.It', function (t) {
                assertLocale(t, Gnt.locale.En, Gnt.locale.It);
            });

            t.it('Gnt.locale.Nl', function (t) {
                assertLocale(t, Gnt.locale.En, Gnt.locale.Nl);
            });
        }
    );
});
