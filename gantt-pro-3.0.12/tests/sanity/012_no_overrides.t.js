StartTest(function (t) {
    if (Ext.isIE8m) return;

    // http://www.sencha.com/forum/newreply.php?p=1063168&noquote=1
    // + a few IE Patches

    t.expectGlobals('Ext.globalEvents.curHeight', 'Ext.globalEvents.curWidth', 'Ext.GlobalEvents.curHeight',
        'Ext.GlobalEvents.curWidth');

    // commented out untill #1843 fixed
    t.todo(function (t) {
        t.assertMaxNumberOfGlobalExtOverrides(9, "No global Ext overrides");
    });
})
