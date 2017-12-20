Ext.ns('App');

Ext.Loader.setConfig({ enabled: true, disableCaching : true });
Ext.Loader.setPath('MyApp', 'app');
Ext.require(['MyApp.view.Viewport']);

Ext.application({
    name : 'MyApp',
    autoCreateViewport : true,

    controllers : [
        'Navigation',
        'Settings'
    ],

    launch : function() {
        if (Ext.isIE && Ext.ieVersion < 9) {
            Ext.Msg.alert('Outdated browser detected', 'This sample only works in modern browsers (IE9+)');
        }
    }
});
