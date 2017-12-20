Ext.define("MyApp.view.Navigation", {
    extend      : 'Ext.Container',
    alias       : 'widget.navigation',
    layout      : 'vbox',
    width       : 86,
    weight      : 100,
    region      : 'west',
    defaultType : 'button',
    cls         : 'navigation',
    defaults    : {
        enableToggle : true,
        scale        : 'large',
        toggleGroup  : 'nav',
        height       : 64,
        width        : 64,
        margin       : 10
    },
    items       : [
        {
            itemId  : 'gantt',
            glyph   : '57346@icomoon',
            pressed : true
        },
        {
            itemId : 'resourceschedule',
            glyph   : '57348@icomoon'
        },
        {
            itemId : 'resourcelist',
            glyph   : '57347@icomoon'
        },
        {
            itemId : 'histogram',
            glyph   : '57344@icomoon'
        },
        {
            xtype : 'tbfill'
        },
        {
            itemId       : 'settings',
            glyph        : '57349@icomoon',
            enableToggle : false
        }
    ]
});