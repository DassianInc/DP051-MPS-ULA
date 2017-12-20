StartTest(function(t) {

    t.it("Should pass the most basic check", function(t) { 

        var ts = new Gnt.data.TaskStore({
            proxy       : {
                type    : 'memory',
                reader  : {
                    type    : 'json'
                }
            },

            root        : {
                expanded    : false,
                children    :  [{
                    Id          : 1,
                    StartDate   : new Date(2011, 6, 1),
                    EndDate     : new Date(2011, 6, 5),
                    children    : [
                        {
                            Id          : 6,
                            leaf        : true,
                            StartDate   : new Date(2011, 6, 1),
                            Duration    : 0
                        }
                    ]
                }]
            }
        });

        var tree = Ext.create('Ext.tree.Panel', {
            store: ts,
            renderTo: document.body,
            height: 300,
            width: 250
        });

        ts.getRootNode().firstChild.setStartDate(new Date(2011, 6, 12));
        t.is(ts.getRootNode().firstChild.getStartDate(), new Date(2011, 6, 12), 'StartDate found using plain treestore');
    });

    t.it([
        "Model remove handling methods and handlers must take into account that a model might not have a reference",
        "to a task store since parent task might have been deleted already."
    ].join(' '), function(t) {
        with (t.getAllStoresDataSet([

            { Id : 1, children : [
                { Id : 2 }
            ]}

        ])) {

            var task1 = task(1),
                task2 = task(2);

            t.livesOk(function() {
                task1.remove();
                task2.remove();
            });

        }
    });
});
