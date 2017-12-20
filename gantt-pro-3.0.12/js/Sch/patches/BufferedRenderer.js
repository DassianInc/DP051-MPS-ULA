if (!Ext.ClassManager.get("Sch.patches.BufferedRenderer")) {

    Ext.define('Sch.patches.BufferedRenderer', {
        extend : 'Sch.util.Patch',

        requires : ['Ext.grid.plugin.BufferedRenderer'],
        target   : 'Ext.grid.plugin.BufferedRenderer',

        overrides : {
            // Patch to solve this issue: http://www.sencha.com/forum/showthread.php?294996
            // remove when fixed
            onRangeFetched : function () {
                this.tableTopBorderWidth = this.tableTopBorderWidth || 0;

                return this.callParent(arguments);
            },

            refreshSize : function (e, t) {

                var me = this,
                    view = me.view;

                if (view.body.dom) {
                    this.callParent(arguments);
                }
            },
            // Ext forces blockRefresh to false for tree view, we need to stop this action, or our
            // autotimespan feature will break refresh.
            // Caught by 062_reload_store in gantt
            init    : function (grid) {
                var blockRefresh = grid.view.blockRefresh;
                this.callParent(arguments);
                grid.view.blockRefresh = blockRefresh;
            }
        }
    });
}
