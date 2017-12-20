// fixes issue fix fields layout in Chrome43
Ext.define('Sch.patches.Chrome', {

    extend      : 'Sch.util.Patch',

    requires    : ['Ext.util.CSS'],

    minVersion  : '5.1.0',

    applyFn : function () {
        if (Ext.isChrome && Ext.browser.version.isGreaterThanOrEqual('43')) {
            Ext.util.CSS.createStyleSheet('.sch-timelinepanel .' + Ext.baseCSSPrefix + 'form-text { display: inherit; }');
        }
    }

});