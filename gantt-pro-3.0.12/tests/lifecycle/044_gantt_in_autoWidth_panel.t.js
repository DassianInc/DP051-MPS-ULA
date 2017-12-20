StartTest(function (t) {

    t.livesOk(function () {

        var p = Ext.create("Ext.Panel", {
            renderTo   : document.body,
            autoWidth  : true,
            height     : 300,
            layout     : 'fit',
            items      : [
                {
                    xtype     : 'ganttpanel',
                    taskStore : new Gnt.data.TaskStore(),
                    columns   : [
                        { xtype : 'namecolumn' }
                    ]
                }
            ]
        });
        t.pass("Rendering completed")

        p.destroy();
        t.pass("Destroy completed")

    }, 'autoWidth rendering ok')
})    
