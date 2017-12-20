Ext.onReady(function () {
    Ext.QuickTips.init();
    
    Ext.state.Manager.setProvider(
        new Ext.state.CookieProvider({ expires: new Date(new Date().getTime() + 10006060247) })
    );

    var viewport        = new Ext.container.Viewport({
        layout      : 'fit',
        
        items       : [
            new Gantt.Fiddle()
        ]
    })
});
