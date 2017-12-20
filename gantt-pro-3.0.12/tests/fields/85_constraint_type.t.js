/*jshint -W085 */
StartTest(function(t) {
    t.describe("Constraint type field", function(t) {
        // {{{ Should reset constraint date to null when type is set to none
        t.it("Should reset constraint date to null when type is set to none", function(t) {
            /* global id */
            with(t.getAllStoresDataSet([
                { Id : 1, leaf : true, ConstraintType: 'startnoearlierthan', ConstraintDate : new Date() }
            ])) {
                var field = Ext.create('Gnt.field.ConstraintType', {
                    id       : 'field-none',
                    task     : id(1),
                    renderTo : Ext.getBody()
                });

                t.chain(
                    { click : "#field-none => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-none.getPicker() => .x-boundlist-item:contains(None)" },
                    function(next) {
                        t.ok(
                            Ext.isEmpty(id(1).getConstraintDate()),
                            "Constraint date has been reset upon switching to none"
                        );
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Should reset constraint date to initial value when type is changed
        t.it("Should reset constraint date to initial value when type is changed", function(t) {
            /* global id */
            with(t.getAllStoresDataSet([
                { Id : 1, leaf : true }
            ])) {
                var field = Ext.create('Gnt.field.ConstraintType', {
                    id       : 'field-types',
                    task     : id(1),
                    renderTo : Ext.getBody()
                });

                t.chain(
                    // FNET
                    { click : "#field-types => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-types.getPicker() => .x-boundlist-item:contains(Finish no earlier)" },
                    function(next) {
                        var task = id(1);
                        t.isDateEqual(
                            task.getConstraintDate(),
                            task.getConstraintClass().getInitialConstraintDate(task),
                            "FNET constraint date has been reset to initial"
                        );
                        next();
                    },

                    // FNLT
                    { click : "#field-types => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-types.getPicker() => .x-boundlist-item:contains(Finish no later)" },
                    function(next) {
                        var task = id(1);
                        t.isDateEqual(
                            task.getConstraintDate(),
                            task.getConstraintClass().getInitialConstraintDate(task),
                            "FNLT constraint date has been reset to initial"
                        );
                        next();
                    },

                    // MFO
                    { click : "#field-types => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-types.getPicker() => .x-boundlist-item:contains(Must finish on)" },
                    function(next) {
                        var task = id(1);
                        t.isDateEqual(
                            task.getConstraintDate(),
                            task.getConstraintClass().getInitialConstraintDate(task),
                            "MFO constraint date has been reset to initial"
                        );
                        next();
                    },

                    // MSO
                    { click : "#field-types => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-types.getPicker() => .x-boundlist-item:contains(Must start on)" },
                    function(next) {
                        var task = id(1);
                        t.isDateEqual(
                            task.getConstraintDate(),
                            task.getConstraintClass().getInitialConstraintDate(task),
                            "MSO constraint date has been reset to initial"
                        );
                        next();
                    },

                    // SNET
                    { click : "#field-types => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-types.getPicker() => .x-boundlist-item:contains(Start no earlier)" },
                    function(next) {
                        var task = id(1);
                        t.isDateEqual(
                            task.getConstraintDate(),
                            task.getConstraintClass().getInitialConstraintDate(task),
                            "SNET constraint date has been reset to initial"
                        );
                        next();
                    },
                    // SNLT
                    { click : "#field-types => .x-form-trigger", offset : [6, 12] },
                    { click : "#field-types.getPicker() => .x-boundlist-item:contains(Start no later)" },
                    function(next) {
                        var task = id(1);
                        t.isDateEqual(
                            task.getConstraintDate(),
                            task.getConstraintClass().getInitialConstraintDate(task),
                            "SNLT constraint date has been reset to initial"
                        );
                        next();
                    }
                );
            }
        });
        // }}}
    });
});
