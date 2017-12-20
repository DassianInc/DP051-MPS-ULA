/* jshint -W085 */
/* global id */
StartTest(function(t) {

    t.describe("Switching scheduling mode to effort driven on a task having no start date set must not throw any exceptions", function(t) {
        with(t.getAllStoresDataSet([
            { Id : 1, leaf : true }
        ])) {
            t.livesOk(
                function(t) {
                    id(1).setSchedulingMode('EffortDriven');
                },
                'Mode set without exceptions'
            );

            t.is(id(1).getSchedulingMode(), 'EffortDriven', 'Mode set confirmed');
        }
    });

});
