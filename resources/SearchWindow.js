/**
* Ext.dassian.search.searchHelpField
*/
Ext.define('Ext.dassian.search.searchHelpField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.searchhelpfield',
    
    triggerCls: Ext.baseCSSPrefix + 'form-search-trigger',
    	
    initComponent: function() {
        var me = this;	
        me.callParent(arguments);
    },

    onTriggerClick: function() {
        var me = this;
        var searchStore = Ext.getStore('Search');
        var resultsStore = Ext.getStore('Results');
        var parameters = {};

        parameters.bsp       = me.bsp;
        parameters.fieldname = me.itemId;
		
        if (me.searchInput){
            parameters.searchInput = me.getValue();
        }
        
        if (!searchStore){
		searchStore = Ext.create('Ext.dassian.store.Search');
        }
        
        if (!resultsStore){
		resultsStore = Ext.create('Ext.dassian.store.Results');
        }
        
        // load the data stores
        searchStore.load({
            action: "read",
            params: parameters,
            scope: this
        });

        parameters.getResult = true;
        resultsStore.load({
            action: "read",
            params: parameters,
            scope: this
        });

        var searchWindow = Ext.ComponentQuery.query('searchwindow[fieldname='+me.itemId+']')[0];

        // create search window
        if (!searchWindow) {
            searchWindow = 
            Ext.create('Ext.dassian.search.SearchWindow',
            {
                bsp: me.bsp,
                fieldname: me.itemId,
                windowHeight: me.windowHeight,
                title: me.searchWindowTitle
            });
        }

        searchWindow.show(me);
    }

});
/**
* Ext.dassian.search.SearchWindow
*/
Ext.define('Ext.dassian.search.SearchWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.searchwindow',

    height: 500,
    minHeight: 500,
    width: 500,
    layout: {
        type: 'fit'
    },
    closeAction: 'hide',
    title: 'Search',
    modal: true,

    initComponent: function() {
        var me = this;

		if (me.windowHeight){
            me.height = me.windowHeight;
            me.minHeight = me.windowHeight;
		}
        
        Ext.applyIf(me, {
            dockedItems: [
                {
                    xtype: 'gridpanel',
                    dock: 'top',
                    maxHeight: 160,
                    itemId: 'selectGrid',
                    header: false,
                    title: 'My Grid Panel',
                    store: 'Search',
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'filter',
                            text: 'Filter Description',
                            flex: 2
                        },
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'filterValue',
                            text: 'Filter Value',
                            flex: 2,
                            editor: {
                                xtype: 'textfield',
                                listeners: {
                                    change: {
                                        fn: me.onTextfieldChange,
                                        scope: me
                                    }
                                }
                            }
                        },
                        {
                            xtype: 'checkcolumn',
                            disabled: true,
                            dataIndex: 'lowerCase',
                            text: 'Case Sensitive',
                            flex: 1
                        }
                    ],
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1
                        })
                    ]                   
                },
                {
                    xtype: 'dynamicgrid',
                    dock: 'top',
                    itemId: 'dynamicGrid',
                    header: false,
                    title: 'Dynamic Grid',
                    forceFit: true,
                    manageHeight:false,
                    store: 'Results',
                    columns: [
                        {
                            xtype: 'gridcolumn',
                            dataIndex: 'string',
                            text: 'String'
                        },
                        {
                            xtype: 'numbercolumn',
                            dataIndex: 'number',
                            text: 'Number'
                        },
                        {
                            xtype: 'datecolumn',
                            dataIndex: 'date',
                            text: 'Date'
                        },
                        {
                            xtype: 'booleancolumn',
                            dataIndex: 'bool',
                            text: 'Boolean'
                        }
                    ],
                    viewConfig: {
                        listeners: {
                            itemdblclick: {
                                fn: me.onViewItemDblClick,
                                scope: me
                            }
                        }
                    }
                }
            ],
            listeners: {
                resize: {
                    fn: me.onWindowResize,
                    scope: me
                }
            }
        });

        me.callParent(arguments);
    },
       
    onTextfieldChange: function(field, newValue, oldValue, eOpts) {
        var me = this;
        var searchStore = Ext.getStore('Search');
        var parameters = {};
        var resultsStore = Ext.getStore('Results');
        var selectGrid = field.up('grid');
        var gridRecord = selectGrid.getSelectionModel().getSelection();
        var selectedIndex = selectGrid.getStore().indexOf(gridRecord[0]);
        var selectedField = selectGrid.getStore().getAt(selectedIndex).get('fieldName');

        // build dynamic key parameters
        parameters[selectedField] = field.value;
        for (var i = 0; i < searchStore.getCount(); i++){
            var record = searchStore.getAt(i);
            var fieldName = record.get('fieldName');
            if (fieldName == selectedField) continue;
            var filterValue = record.get('filterValue');
            parameters[fieldName] = filterValue;
        }

        parameters.bsp       = field.up('window').bsp;
        parameters.fieldname = field.up('window').fieldname;
        parameters.getResult = true;

        resultsStore.load({
            action: "read",
            params: parameters,
            scope: this
        });
    },

    onViewItemDblClick: function(dataview, record, item, index, e, eOpts) {
        var returnValue = dataview.up('window').fieldname;
        var searchHelpField = Ext.ComponentQuery.query('searchhelpfield#'+returnValue)[0];
        searchHelpField.searchGo = true;
        searchHelpField.setValue(record.get(returnValue));
        dataview.up('window').close();
    },
    
    onWindowResize: function(window, width, height, eOpts) {
        var me = this;
        var selectGrid = window.down('grid#selectGrid');
        var dynamicGrid = window.down('dynamicgrid#dynamicGrid');
		var newHeight = window.getHeight() - selectGrid.getHeight() - 30;
		dynamicGrid.setHeight(newHeight);
    }
    
});

/**
* Ext.dassian.grid.DynamicGridPanel
*/
Ext.define('Ext.dassian.grid.DynamicGridPanel', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.dynamicgrid',
	/**
	* initialising the components
	*/
    initComponent: function(){
        /**
        * set the config we want
        */
        var config = {
            columns:[],
            rowNumberer: false
        };
        var me = this;
        Ext.apply(me, config);
        Ext.apply(me.initialConfig, config);

        me.callParent(arguments);
    },
    /**
    * When the store is loading then reconfigure the column model of the grid
    */
    storeLoad: function()
    {
        var me = this;
        if (!me.newHeight){
            var window = me.up('window');
            var selectGrid = window.down('grid[itemId=selectGrid]');
			me.newHeight = window.getHeight() - selectGrid.getHeight() - 30;
			me.setHeight(me.newHeight);
        }
        /**
        * JSON data returned from server has the column definitions
        */
        if(typeof(me.store.proxy.reader.jsonData.columns) === 'object') {
            var columns = [];
            /**
            * adding RowNumberer as we need to add them
            * before other columns to display first
            */
            if(me.rowNumberer) { columns.push(Ext.create('Ext.grid.RowNumberer')); }
            /**
            * assign new columns from the json data columns
            */
            Ext.each(me.store.proxy.reader.jsonData.columns, function(column){
                columns.push(column);
            });
       
            /**
            *  reconfigure the column model of the grid
            */
            me.reconfigure(me.store, columns);
        }
    },
    /**
    * assign the event to itself when the object is initialising
    */
    afterRender: function(ct, position){
        var me = this;
        me.callParent(ct, position);        
		me.store.on('load', me.storeLoad, this);
    }
});
/**
* Ext.dassian.store.Search
*/
Ext.define('Ext.dassian.store.Search', {
    extend: 'Ext.data.Store',

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            storeId: 'Search',
            fields: [
                {
                    name: 'returnValue',
                    type: 'boolean'
                },
                {
                    name: 'fieldName',
                    type: 'string'
                },
                {
                    name: 'filter',
                    type: 'string'
                },
                {
                    name: 'filterValue',
                    type: 'string'
                },
                {
                    name: 'lowerCase',
                    type: 'boolean'
                }
            ],
            proxy: {
                type: 'ajax',
                url: '/dsnwebui/dsnwebui_rest/dsnwebui/SearchRest',
                reader: {
                    type: 'xml',
                    root: 'searchData',
                    record: 'searchRecord'
                }
            }
        }, cfg)]);
    }
});
/**
* Ext.dassian.store.Results
*/
Ext.define('Ext.dassian.store.Results', {
    extend: 'Ext.data.Store',

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            autoLoad: false,
            model: 'Ext.dassian.model.Result',
            storeId: 'Results'
        }, cfg)]);
    }
});
/**
* Ext.dassian.model.Result
*/
Ext.define('Ext.dassian.model.Result', {
    extend: 'Ext.data.Model',

    proxy: {
        type: 'rest',
        url: '/dsnwebui/dsnwebui_rest/dsnwebui/SearchRest',
        reader: {
            type: 'json'
        }
    }
});