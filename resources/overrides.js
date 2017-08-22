/*Ext.define('08152017-globalFocus', {
    override: 'Ext.grid.filters.Filters',
    onMenuBeforeShow: function (menu) {
        var me = this,
            menuItem, filter, ownerGrid, ownerGridId;

        if (me.showMenu) {
            // In the case of a locked grid, we need to cache the 'Filters' menuItem for each grid since
            // there's only one Filters instance. Both grids/menus can't share the same menuItem!
            if (!me.menuItems) {
                me.menuItems = {};
            }

            // Don't get the owner grid if in a locking grid since we need to get the unique menuItems key.
            ownerGrid = menu.up();
            ownerGridId = ownerGrid.id;

            menuItem = me.menuItems[ownerGridId];

            if (!menuItem || menuItem.isDestroyed) {
                menuItem = me.createMenuItem(menu, ownerGridId);
            }

            me.activeFilterMenuItem = menuItem;

            filter = me.getMenuFilter(ownerGrid.headerCt);
            if (filter) {
                filter.showMenu(menuItem);
            }

            menuItem.setVisible(!!filter);
            me.sep.setVisible(!!filter);
        }
    }
});*/