describe("Drag drop of rows in the tree", function (t) {

    t.it('Should support reordering rows', function (t) {
        var gantt = t.getGantt({
            renderTo        : Ext.getBody(),
            taskStore       : t.getTaskStore({
                DATA : [
                    { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
                    { leaf : true, Id : 2, StartDate : new Date(2010, 1, 5), Duration : 2 }
                ]
            })
        });

        t.chain(
            { drag : '.x-grid-cell', to : '.x-grid-item:last-child .x-grid-cell'},

            function(next) {
                t.expect(gantt.getTaskStore().getById(1).get('index')).toBe(1);
                t.expect(gantt.getTaskStore().getById(2).get('index')).toBe(0);

                gantt.setReadOnly(true);
                next()
            },

            { drag : '.x-grid-cell', to : '.x-grid-item:last-child .x-grid-cell'},

            function(next) {
                t.expect(gantt.getTaskStore().getById(1).get('index')).toBe(1);
                t.expect(gantt.getTaskStore().getById(2).get('index')).toBe(0);
            }
        );
    });
});
