describe('Default key nav with arrows should work', function (t) {

    var g = t.getGantt({
        width     : 300,
        renderTo  : Ext.getBody(),
        taskStore : new Gnt.data.TaskStore({
            proxy : 'memory',
            root  : {
                children : [
                    { Id : 1, leaf : true },
                    { Id : 2, leaf : true },
                    { Id : 3, leaf : true },
                    { Id : 4, leaf : true }
                ]
            }
        })
    });

    t.chain(

        { waitForRowsVisible : g },

        { click : '.x-grid-cell-inner' },

        function (next) {
            t.isDeeply(g.getSelectionModel().getSelection()[0].getId(), 1)

            next()
        },

        { type : '[DOWN]' },

        function (next) {
            t.isDeeply(g.getSelectionModel().getSelection()[0].getId(), 2)

            next()
        },

        { type : '[DOWN]' },

        function (next) {
            t.isDeeply(g.getSelectionModel().getSelection()[0].getId(), 3)

            next()
        },

        { type : '[DOWN]' },

        function (next) {
            t.isDeeply(g.getSelectionModel().getSelection()[0].getId(), 4)

            next()
        }
    )
})
