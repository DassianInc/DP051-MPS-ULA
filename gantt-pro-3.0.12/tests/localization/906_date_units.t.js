StartTest(function(t) {

    // Check unit names locales to match corresponding regular expressions for Gnt.util.DurationParser (#1190)

    Ext.Loader.setPath('Sch', '../js/Sch');
    Ext.Loader.setPath('Gnt', '../js/Gnt');

    var assertUnitNames = function (t, lang) {
        // apply corresponding translation
        Gnt.locale[lang].apply();

        var unitNames   = Sch.locale[lang].l10n['Sch.util.Date'].unitNames;

        var parser  = new Gnt.util.DurationParser({
            parseNumberFn   : parseFloat
        });

        // check if unit names are parseable
        for (var unit in unitNames) {
            t.ok(parser.parse('1 '+unitNames[unit].single), 'single form of `' + unit + '` (`'+unitNames[unit].single+'`) unit matches parser`s regular expression');
            t.ok(parser.parse('1 '+unitNames[unit].plural), 'plural form of `' + unit + '` (`'+unitNames[unit].plural+'`) unit matches parser`s regular expression');
            t.ok(parser.parse('1 '+unitNames[unit].abbrev), 'abbreviation of `' + unit + '` (`'+unitNames[unit].abbrev+'`) unit matches parser`s regular expression');
        }

    };

    var locales     = [
        'Gnt.locale.En',
        'Gnt.locale.RuRU',
        'Gnt.locale.De',
        'Gnt.locale.Pl',
        'Gnt.locale.SvSE',
        'Gnt.locale.It',
        'Gnt.locale.Nl'
    ]

    t.requireOk(
        locales,
        function () {

            t.chain(
                {
                    waitFor : function () {
                        for (var i = 0; i < locales.length; i++)
                            // "isCreated" will activate the class creation triggers, which
                            // are sometimes activated after the test has already complete and throws exception (in IE)
                            if (!Ext.ClassManager.isCreated(locales[ i ])) return false

                        return true
                    }
                },
                { waitFor : 100 },

                t.getSubTest('Gnt.locale.RuRU', function (t) {
                    assertUnitNames(t, 'RuRU');
                }),

                t.getSubTest('Gnt.locale.SvSE', function (t) {
                    assertUnitNames(t, 'SvSE');
                }),

                t.getSubTest('Gnt.locale.De', function (t) {
                    assertUnitNames(t, 'De');
                }),

                t.getSubTest('Gnt.locale.Pl', function (t) {
                    assertUnitNames(t, 'Pl');
                }),

                t.getSubTest('Gnt.locale.It', function (t) {
                    assertUnitNames(t, 'It');
                }),

                t.getSubTest('Gnt.locale.Nl', function (t) {
                    assertUnitNames(t, 'Nl');
                })
            )
        }
    );
});

