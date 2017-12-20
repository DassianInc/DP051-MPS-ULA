StartTest(function(t) {

    t.describe("A constraint might advise what constraint date a task should have if given constraint type is applyed", function(t) {
        
        t.it("Should use set constraint date if one's already set", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date();

            model.setConstraintDate(date);
            model.setConstraintType('startnoearlierthan');

            t.is(model.getConstraintDate(), date);
        });

        t.it("Start No Earlier Then constraint must use Start Date if constraint date isn't set for a task", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date(2014, 7, 11); // Monday

            model.setStartDate(date);
            model.setConstraintType('startnoearlierthan');

            t.is(model.getConstraintDate(), date);
        });

        t.it("Strat No Later Then constraint must use Start Date if constraint date isn't set for a task", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date(2014, 7, 11); // Monday

            model.setStartDate(date);
            model.setConstraintType('startnolaterthan');

            t.is(model.getConstraintDate(), date);
        });

        t.it("Finish No Earlier Then constraint must use End Date if constraint date isn't set for a task", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date(2014, 7, 12); // Tuesday

            model.setStartDate(date - 24 * 60 * 60 * 1000);
            model.setEndDate(date);
            model.setConstraintType('finishnoearlierthan');

            t.is(model.getConstraintDate(), date);
        });

        t.it("Finish No Later Then constraint must use End Date if constraint date isn't set for a task", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date(2014, 7, 12); // Tuesday

            model.setStartDate(date - 24 * 60 * 60 * 1000);
            model.setEndDate(date);
            model.setConstraintType('finishnolaterthan');

            t.is(model.getConstraintDate(), date);
        });

        t.it("Must Start On constraint must use Start Date if constraint date isn't set for a task", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date(2014, 7, 11); // Monday

            model.setStartDate(date);
            model.setConstraintType('muststarton');

            t.is(model.getConstraintDate(), date);

        });

        t.it("Must Finish On constraint must use End Date if constraint date isn't set for a task", function(t) {
            var model = new Gnt.model.Task(),
                date = new Date(2014, 7, 12); // Tuesday

            model.setStartDate(date - 24 * 60 * 60 * 1000);
            model.setEndDate(date);
            model.setConstraintType('mustfinishon');

            t.is(model.getConstraintDate(), date);
        }); 

    });

});
