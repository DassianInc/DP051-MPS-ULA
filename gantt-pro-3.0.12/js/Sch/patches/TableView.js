Ext.define('Sch.patches.TableView', {
    extend : 'Sch.util.Patch',

    requires   : ['Ext.view.Table'],
    target     : 'Ext.view.Table',
    minVersion : '5.1.0',

    overrides : {
        //https://www.sencha.com/forum/showthread.php?301110-Last-focused-item-is-not-synced-which-causes-scroll-jump
        getLastFocused : function () {
            var result = this.callParent(arguments);

            return result || this.navigationModel.lastFocused;
        }
    }
});
