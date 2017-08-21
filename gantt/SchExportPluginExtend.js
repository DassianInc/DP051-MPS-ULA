/**
 * Notes:
 *  Search "Modified by" before upgrading to review places changes were made
 *
 **/


/**
 @class Sch.plugin.exporter.AbstractExporter
 @extends Ext.util.Observable

 This class represents the base implementation of an exporter.
 An exporter extracts the provided component content and packs it into array of pages (based on provided export settings and implemented algorithm).
 The main entry point for an exporter that launches the extraction process is {@link #extractPages} method:

 exporter.extractPages(component, config, function (pages) {

                alert(pages.length + " extracted");

                ...

             }, me);


 */
Ext.define('DSch.plugin.exporter.AbstractExporter', {

    extend                  : 'Sch.plugin.exporter.AbstractExporter',


    /**
     * @cfg {Number} pageHeaderHeight
     * Header height. Amount of space for {@link #headerTpl the page header}.
     */
    pageHeaderHeight        : 41,

    /**
     * @cfg {Number} pageFooterHeight
     * Footer height. Amount of space for {@link #footerTpl the page footer}.
     */
    pageFooterHeight        : 0,

    bufferedHeightMargin    : 25,

    /**
     * @property {Boolean} isExporter
     * @readonly
     * `true` in this class to identify an object as an instantiated Exporter, or subclass thereof.
     */
    isExporter              : true,

    /**
     * @property {Number} paperWidth
     * Paper width. Calculated based on provided page format and DPI resolution.
     */
    paperWidth              : 0,

    /**
     * @property {Number} paperHeight
     * Paper height. Calculated based on provided page format and DPI resolution.
     */
    paperHeight             : 0,

    /**
     * @property {Number} printHeight
     * Paper height that can be used for printing rows. Calculated as {@link #paperHeight} minus header heights.
     */
    printHeight             : 0,

    lockedRowsHeight        : 0,

    normalRowsHeight        : 0,

    iterateTimeout          : 5,

    /**
     * @cfg {String} tableSelector
     * The selector for the row container used for both normalGrid and lockedGrid.
     */
    tableSelector           : undefined,

    /**
     * @property {Ext.dom.Element} currentPage
     * Current page being extracted.
     */
    currentPage             : undefined,

    /**
     * @cfg {Function} headerTplDataFn
     * If specified the function result will be applied to {@link #getHeaderTplData} result.
     * To define the scope please use {@link #headerTplDataFnScope}.
     */
    headerTplDataFn        : null,

    /**
     * @cfg {Function} footerTplDataFn
     * If specified the function result will be applied to {@link #getFooterTplData} result.
     * To define the scope please use {@link #footerTplDataFnScope}.
     */
    footerTplDataFn        : null,

    /**
     * @cfg {Object} headerTplDataFnScope The scope for {@link #footerTplDataFn} template method.
     */
    headerTplDataFnScope   : null,

    /**
     * @cfg {Object} footerTplDataFnScope The scope for {@link #footerTplDataFn} template method.
     */
    footerTplDataFnScope   : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - name    : 'Exporter'
     */

    config                 : {
        /**
         * @cfg {String} exporterId
         * Exporter identifier. Has to be unique among other exporters when you register in in {@link Sch.plugin.Export} instance.
         */
        exporterId                : 'abstractexporter',
        /**
         * Exporter name. By default will be taken from the class {@link #l10n locale}.
         * @cfg {String}
         */
        name                      : '',

        translateURLsToAbsolute   : true,

        expandAllBeforeExport     : false,

        /**
         * @cfg {String} headerTpl
         * Template of an extracted page header.
         */
        headerTpl                 : '<div class="sch-export-header" style="height:{height}px; width:{width}px"><h2>{pageNo}/{totalPages}</h2></div>',

        /**
         * @cfg {String/Ext.XTemplate} tpl
         * Template of an extracted page.
         */
        tpl                       : '<!DOCTYPE html>' +
        '<html class="' + Ext.baseCSSPrefix + 'border-box {htmlClasses}">' +
        '<head>' +
        '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />' +
        '<title>{title}</title>' +
        '{styles}' +
        '</head>' +
        '<body class="' + Ext.baseCSSPrefix + 'webkit sch-export {bodyClasses}">' +
        '{header}' +
        '<div class="{componentClasses}" style="height:{bodyHeight}px; width:{totalWidth}px; position: relative !important">' +
        '{HTML}' +
        '</div>' +
        '{footer}' +
        '</body>' +
        '</html>',

        /**
         * @cfg {String} footerTpl
         * Template of an extracted page footer.
         */
        footerTpl                 : '',

        // Row visibility detection threshold (0.6 - means that when 60% of a row height is visible we consider it as visible)
        rowVisibilityThreshold    : 0.6
    },

    //private placeholder for provided callback functions passed in extractPages
    callbacks               : undefined,

    //private String errorMessage, when internally set this message will be displayed in a pop-up message.
    error                   : undefined,

    /**
     * @property {Object[]} extractedPages Collection of extracted pages.
     */
    extractedPages          : undefined,

    /**
     * @property {Number} numberOfPages Total number of pages extracted.
     */
    numberOfPages           : 0,

    // vertical offset of the very first row exported
    firstExportedRowOffset  : 0,

    // Vertical offset of the secondary canvas. Initially equals to the negative "firstExportedRowOffset".
    // Though the value might change while pages getting extracted.
    secondaryCanvasOffset   : 0,

    constructor : function (config) {
        var me  = this;

        config  = config || {};

        me.callParent(arguments);

        // initConfig thinks that we're trying to override methods so we have to delete following
        delete config.getUserHeaderTplData;
        delete config.getUserFooterTplData;

        me.initConfig(config);

        if (!config.tableSelector) {
            me.tableSelector    = '.' + Ext.baseCSSPrefix + 'grid-item-container';
        }

        // get the exporter name from locale (if not provided explicitly)
        if (!config.name) me.setName(me.L('name'));
    },

    setHeaderTpl : function (tpl) {
        this.headerTpl = this.getTplInstance(tpl);
    },

    getHeaderTpl : function () {
        return this.headerTpl;
    },

    setTpl : function (tpl) {
        this.tpl = this.getTplInstance(tpl);
    },

    getTpl : function () {
        return this.tpl;
    },

    setFooterTpl : function (tpl) {
        this.footerTpl = this.getTplInstance(tpl);
    },

    getFooterTpl : function () {
        return this.footerTpl;
    },

    getTplInstance : function (tpl) {
        return (tpl && !tpl.isTemplate) ? new Ext.XTemplate(tpl, { disableFormats : true }) : tpl;
    },

    /**
     * @protected
     * Returns the CSS classes for BODY element of extracted page. Override this if you need to customize exported pages CSS classes.
     * @return {String} CSS classes.
     */
    getBodyClasses : function () {
        var re      = new RegExp(Ext.baseCSSPrefix + 'ie\\d?|' + Ext.baseCSSPrefix + 'gecko', 'g'),
            result  = Ext.getBody().dom.className.replace(re, '');
        result = result.replace('spinner','');
        if (Ext.isIE) {
            result  += ' sch-ie-export';
        }

        return result;
    },

    /**
     * @protected
     * Returns the CSS classes for element containing exported component. Override this if you need to customize exported pages CSS classes.
     * @return {String} CSS classes.
     */
    getComponentClasses : function () {
        return this.getComponent().el.dom.className;
    },

    /**
     * Sets the component being exported.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component The component being exported.
     */
    setComponent : function (component) {
        var me                  = this;

        me.component            = component;
        me.view                 = component.getSchedulingView();
        me.normalGrid           = component.normalGrid;
        me.lockedGrid           = component.lockedGrid;
        me.normalView           = component.normalGrid.view;
        me.lockedView           = component.lockedGrid.view;
        me.lockedBodySelector   = '#' + me.lockedView.getId();
        me.normalBodySelector   = '#' + me.normalView.getId();
        me.lockedHeader         = me.lockedGrid.headerCt;
        me.normalHeader         = me.normalGrid.headerCt;
        me.headerHeight         = me.normalHeader.getHeight();

        // page height w/o component headers
        me.printHeight = Math.floor(me.paperHeight) - me.headerHeight - (me.exportConfig.showHeader ? me.pageHeaderHeight : 0) - (me.exportConfig.showFooter ? me.pageFooterHeight : 0);

        me.saveComponentState(component);
    },

    /**
     * Returns the component being exported.
     * @return {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} The component being exported.
     */
    getComponent : function () {
        return this.component;
    },


    /**
     * @private
     * Applies the selected paper size based on export configuration and {@link #paperSizes} config. Calculates {@link #paperWidth} and {@link #paperHeight} properties.
     */
    setPaperSize : function (pageSize, orientation) {
        var me          = this;

        //size of paper we will be printing on. take orientation into account
        if (orientation === 'landscape') {
            me.paperWidth   = pageSize.height;
            me.paperHeight  = pageSize.width;
        } else {
            me.paperWidth   = pageSize.width;
            me.paperHeight  = pageSize.height;
        }
    },

    /**
     * @return {String} returns the format of the current export operation.
     */
    getPaperFormat : function () {
        return this.exportConfig.format;
    },


    /**
     * @private
     * Returns whether the component uses buffered rendering.
     * @return {boolean} `true` if the underlying component uses buffered rendering.
     */
    isBuffered : function () {
        return !!this.getBufferedRenderer();
    },

    /**
     * @private
     * Returns the normal grid buffered renderer instance (if the component uses buffered rendering).
     * @return {Ext.grid.plugin.BufferedRendererView} The normal grid buffered renderer instance.
     */
    getBufferedRenderer : function () {
        return this.view.bufferedRenderer;
    },

    /**
     * @protected
     * Applies the passed date range to the component.
     * @param {Object} config Export configuration.
     */
    setComponentRange : function (config) {
        var me          = this,
            component   = me.getComponent();

        // if we export a part of scheduler
        if (config.range !== 'complete') {

            var view    = me.view,
                newStart,
                newEnd;

            switch (config.range) {
                case 'date' :
                    newStart = new Date(config.dateFrom);
                    newEnd   = new Date(config.dateTo);
                    // ensure that specified period has at least a day
                    if (Sch.util.Date.getDurationInDays(newStart, newEnd) < 1) {
                        newEnd  = Sch.util.Date.add(newEnd, Sch.util.Date.DAY, 1);
                    }
                    break;

                case 'current' :
                    var visibleSpan = view.getVisibleDateRange();
                    newStart        = visibleSpan.startDate;
                    newEnd          = visibleSpan.endDate || view.timeAxis.getEnd();
                    break;

                case 'completedata' :
                    var span = component.getEventStore().getTotalTimeSpan();
                    newStart = span.start;
                    newEnd   = span.end;
                    break;
            }

            // apply new time frame
            if (newStart && newEnd) {
                component.setTimeSpan(newStart, newEnd);
            }
        }

        me.ticks  = component.timeAxis.getTicks();

        // if only currently visible rows have to be extracted
        if (config.rowsRange == 'visible') {
            // find effective currently visible rows range (an array: [startIndex, endIndex])
            config.rowsRange = me.findVisibleRowsRange();

            // all rows mode
        } else {
            config.rowsRange = null;
        }


    },

    /**
     * @protected
     * Get links to the stylesheets of current page.
     * Modified by: craig
     */
    getStylesheets : function() {
        var translate   = this.translateURLsToAbsolute,
            //styleSheets = Ext.getDoc().select('link[rel="stylesheet"]'),
            ctTmp  = Ext.get(Ext.core.DomHelper.createDom({
                tag : 'div'
            })),
            styles = [
                window.printServer +'resources/MyApp-all.css',
                window.printServer +'resources/css/sch-gantt-all-debug.css'
            ],
            stylesString;

        Ext.each(styles,function(value,key){
            ctTmp.appendChild(Ext.get(Ext.core.DomHelper.createDom({
                tag : 'link',
                rel : 'stylesheet',
                href: value
            })));
        });

        /*styleSheets.each(function(s) {
            var node    = s.dom.cloneNode(true);
            // put absolute URL to node `href` attribute
            var alternateResources = s.dom.href.replace(window.server,window.printServer);

            translate && node.setAttribute('href',alternateResources);
            ctTmp.appendChild(node);
        });*/

        stylesString = ctTmp.dom.innerHTML + '';

        return stylesString;
    },


    // Since export is a sync operation for now, all plugins drawing lines & zones need to be temporarily adjusted
    // to draw their content synchronously.
    forEachTimeSpanPlugin : function (component, fn, scope) {
        if (Sch.feature && Sch.feature.AbstractTimeSpan) {

            var me = this;
            var plugins = (component.plugins || []).concat(component.normalGrid.plugins || []).concat(component.columnLinesFeature || []);

            for (var i = 0, l = plugins.length; i < l; i++) {
                var plugin  = plugins[i];

                if (plugin instanceof Sch.feature.AbstractTimeSpan) {
                    fn.call(scope || me, plugin);
                }
            }
        }
    },


    setCellSize : function (cellSize) {
        var me = this;

        me.timeColumnWidth = cellSize[0];

        if (me.timeColumnWidth) {
            this.getComponent().setTimeColumnWidth(me.timeColumnWidth);
        }

        // change the row height only if value is provided
        if (cellSize.length > 1) {
            me.view.setRowHeight(cellSize[1]);
        }
    },


    findVisibleRowsRange : function () {
        var me         = this,
            nodeCache  = me.lockedView.all,
            startIndex = nodeCache.startIndex,
            endIndex   = nodeCache.endIndex;

        var metVisibleNode       = false,
            firstVisibleRowIndex = -1,
            lastVisibleRowIndex  = -1;

        for (var i = startIndex; i <= endIndex; i++) {
            var node       = nodeCache.item(i, true);

            if (me.isRowVisible(node, me.lockedBox)) {
                if (!metVisibleNode) {
                    firstVisibleRowIndex = i;
                    metVisibleNode = true;
                }
                lastVisibleRowIndex = i;

            } else if (metVisibleNode) {
                break;
            }
        }

        return [firstVisibleRowIndex, lastVisibleRowIndex];
    },


    /**
     * @protected
     * Prepares the component to export. This includes setting requested time span, time column width etc.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component The component being exported.
     * @param {Object} config    Export configuration.
     */
    prepareComponent : function (component, config) {
        var me      = this;

        component   = component || me.getComponent();

        me.suspendInfiniteScroll(component);

        me.forEachTimeSpanPlugin(component, function (plugin) {
            plugin._renderDelay = plugin.renderDelay;
            plugin.renderDelay  = 0;
        });

        component.getSchedulingView().timeAxisViewModel.suppressFit = true;
        component.timeAxis.autoAdjust                               = false;
        //expand grids in case they're collapsed
        component.normalGrid.expand();
        component.lockedGrid.expand();

        // remember view regions (to be able to decide on rows visibility if requested)
        me.lockedBox = me.lockedView.getBox();
        me.normalBox = me.normalView.getBox();

        // change timespan/tick width according to provided settings
        me.setComponentRange(config);

        // if row/column sizes provided
        config.cellSize && me.setCellSize(config.cellSize);

        // launch template method
        config.beforeExport && config.beforeExport(component, me.ticks);

        me.prepareColumns(config.columns);

        // For Tree grid, optionally expand all nodes
        if (me.expandAllBeforeExport && component.expandAll) {
            component.expandAll();
        }

        // resizes the component to fit it into specified paper size (depending on pagination rules)
        me.fitComponentIntoPage();

        //bug fix #2264 - MultiPage export does not sync timeaxis on first run
        me.view.timeAxisViewModel.setTickWidth(me.view.timeAxisViewModel.getTickWidth());

        //IE8 bug
        if (me.isBuffered() && Ext.isIE8) {
            me.normalView.bufferedRenderer.variableRowHeight = false;
            me.lockedView.bufferedRenderer.variableRowHeight = false;
        }
    },

    prepareColumns : function (columns) {

        var me = this;

        if (columns) {

            me.lockedGrid.headerCt.items.each(function (column) {
                if (Ext.Array.contains(columns, column)) {
                    column.show();
                }
                else {
                    column.hide();
                }
            });
        }
    },


    restoreComponent : function (component) {
        var me      = this;

        component   = component || me.getComponent();

        me.forEachTimeSpanPlugin(component, function (plugin) {
            plugin.renderDelay  = plugin._renderDelay;
            delete plugin._renderDelay;
        });

        // restore scheduler state
        me.restoreComponentState(component);

        me.restoreInfiniteScroll(component);

        //We need to update TimeAxisModel for layout fix #1334
        // component.getSchedulingView().timeAxisViewModel.update();

        // call template method
        me.exportConfig.afterExport && me.exportConfig.afterExport(component);
    },


    saveComponentState : function (component) {
        component           = component || this.getComponent();

        var me              = this,
            view            = component.getSchedulingView(),
            normalGrid      = component.normalGrid,
            lockedGrid      = component.lockedGrid;

        var columns = [];

        lockedGrid.headerCt.items.each(function (column) {
            columns.push({
                column : column,
                visible : !column.isHidden()
            });
        });

        //values needed to restore original size/dates of component
        me.restoreSettings    = {
            width               : component.getWidth(),
            height              : component.getHeight(),
            rowHeight           : view.timeAxisViewModel.getViewRowHeight(),
            columnWidth         : view.timeAxisViewModel.getTickWidth(),
            startDate           : component.getStart(),
            endDate             : component.getEnd(),
            normalWidth         : normalGrid.getWidth(),
            normalLeft          : normalGrid.getEl().getStyle('left'),
            lockedWidth         : lockedGrid.getWidth(),
            lockedCollapse      : lockedGrid.collapsed,
            normalCollapse      : normalGrid.collapsed,
            columns             : columns,
            autoAdjust          : component.timeAxis.autoAdjust,
            suppressFit         : view.timeAxisViewModel.suppressFit,
            startIndex          : view.all.startIndex,

            lockedScrollX       : me.lockedView.getScrollX(),
            normalScrollX       : view.getScrollX(),
            scrollY             : view.getScrollY()
        };
    },

    restoreComponentState : function (component) {
        var me      = this;

        component   = component || me.getComponent();

        var config  = me.restoreSettings,
            view    = component.getSchedulingView();

        component.timeAxis.autoAdjust = config.autoAdjust;

        component.normalGrid.show();

        component.setWidth(config.width);
        component.setHeight(config.height);
        component.setTimeSpan(config.startDate, config.endDate);
        component.setTimeColumnWidth(config.columnWidth, true);

        view.setRowHeight(config.rowHeight);

        // resote locked grid columns visibility
        Ext.Array.each(config.columns, function (item) {
            item.column.setVisible(item.visible);
        });

        component.lockedGrid.show();

        component.normalGrid.setWidth(config.normalWidth);
        component.normalGrid.getEl().setStyle('left', config.normalLeft);
        component.lockedGrid.setWidth(config.lockedWidth);
        view.timeAxisViewModel.suppressFit = config.suppressFit;
        view.timeAxisViewModel.setTickWidth(config.columnWidth);

        if (config.lockedCollapse) {
            component.lockedGrid.collapse();
        }

        if (config.normalCollapse) {
            component.normalGrid.collapse();
        }

        // restore scroll position
        me.restoreComponentScroll(config);

        if (me.getBufferedRenderer()) {
            if (Ext.isIE8) {
                me.normalView.bufferedRenderer.variableRowHeight = true;
                me.lockedView.bufferedRenderer.variableRowHeight = true;
            }
        }

    },


    restoreComponentScroll : function (restoreSettings) {
        var me = this;

        me.lockedView.setScrollX(restoreSettings.lockedScrollX);
        me.normalView.scrollTo(restoreSettings.normalScrollX, restoreSettings.scrollY);
    },

    /**
     * Extracts the component content. On completion calls specified callback function providing an array of extracted pages as an argument.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component Component content of which to be extracted
     * @param {Object} config Configuration object. May contain the following properties:
     * @param {String} config.format Page format
     * @param {String} config.orientation Page orientation (either `portrait` or `landscape`)
     * @param {String} config.range Range of the panel to be exported. Options are `complete`, `current`, `date`. When `date` is specified there also has to be specified next two configs.
     * @param {Date} config.dateFrom Range start date. Used only when `config.range` is `date`
     * @param {Date} config.dateTo Range end date. Used only when `config.range` is `date`
     * @param {Boolean} config.showHeader Flag saying that page numbers header has to be shown
     * @param {Function} callback Function which is called after extraction of pages has completed. The callback will have the following arguments:
     * @param {Function} callback.pages An array with extracted pages
     * @param {Object} scope Scope for the callback function
     */
    extractPages : function (component, config, callback, scope) {
        var me          = this;

        // stop garbage collecting
        me.enableGarbageCollector  = Ext.enableGarbageCollector;
        Ext.enableGarbageCollector = false;
        Ext.dom.GarbageCollector.pause();

        // keep provided export config
        me.exportConfig = config;

        me.normalRows             = [];
        me.lockedRows             = [];
        me.extractedPages         = [];
        me.numberOfPages          = 0;
        me.lockedRowsHeight       = 0;
        me.normalRowsHeight       = 0;
        me.firstExportedRowOffset = 0;
        me.secondaryCanvasOffset  = 0;

        // calculates paper sizes based on provided parameters and DPI
        me.setPaperSize(config.pageSize, config.orientation);

        // stores references to the component, its elements and makes a backup of its pre-export state
        me.setComponent(component, config);

        // prepares component to exporting (applies provided timespan etc.)
        me.prepareComponent(component, config);

        me.callbacks        = {
            success : callback || Ext.emptyFn,
            scope   : scope || me
        };

        // fetch all component rows into temporary arrays
        // and call 'onRowsCollected' to collect them into pages and call 'onPagesExtracted' on completion
        setTimeout(function () {
            me.collectRows(me.onRowsCollected, me, config);
        }, 1);
    },

    /**
     * @protected
     * Finishes exporting process. Restores the component to its initial state and returns extracted pages by calling a provided callback.
     * @param  {Object[]} [pages] Extracted pages. If omitted then will take collected pages from {@link #extractedPages} array.
     */
    onPagesExtracted : function (pages) {
        var me  = this;

        // restore panel to initial state
        me.restoreComponent();
        // and return results
        me.submitPages(pages);
    },


    submitPages : function (pages) {
        var me          = this,
            callbacks   = me.callbacks;

        callbacks.success.call(callbacks.scope, me.renderPages(pages));

        // resume garbage collecting
        Ext.enableGarbageCollector = me.enableGarbageCollector;
        Ext.dom.GarbageCollector.resume();
    },


    getCurrentPage : function () {
        return this.currentPage;
    },


    setCurrentPage : function (page) {
        this.currentPage = page;
    },


    getExpectedNumberOfPages : Ext.emptyFn,


    /**
     * Commits a filled page. Pushes the page into {@link #extractedPages resulted set of pages}.
     * Calls {@link #preparePageToCommit} for the final page DOM tweaking.
     * @param [config] An optional configuration object. Will also be passed to {@link #preparePageToCommit} method.
     */
    commitPage : function (config) {

        var me      = this;

        me.numberOfPages++;

        var pageBody = me.preparePageToCommit(config);

        me.fireEvent('beforecommitpage', me, pageBody, me.numberOfPages, me.getExpectedNumberOfPages());

        var page    = Ext.apply({
            html    : pageBody.dom.innerHTML,
            number  : me.numberOfPages
        }, config);

        me.extractedPages.push(page);
        me.fireEvent('commitpage', me, page, me.numberOfPages, me.getExpectedNumberOfPages());
    },


    /**
     * @protected
     * Collects the locked grid row.
     * @param  {Element} item The locked grid row
     * @param  {Ext.data.Model} recordIndex Index of the record corresponding to the row.
     * @return {Object} Object keeping reference to the cloned row element and its height.
     */
    collectLockedRow : function (item, recordIndex) {
        var height  = Ext.fly(item).getHeight();

        this.lockedRowsHeight   += height;

        var result  = {
            height  : height,
            row     : item.cloneNode(true),
            record  : this.lockedView.getRecord(recordIndex)
        };

        this.lockedRows.push(result);

        return result;
    },

    /**
     * @protected
     * Collects the normal grid row.
     * @param  {Element} item The normal grid row
     * @param  {Ext.data.Model} recordIndex Index of the record corresponding to the row.
     * @return {Object} Object keeping reference to the cloned row element and its height.
     */
    collectNormalRow : function (item, recordIndex) {
        var height  = Ext.fly(item).getHeight();

        this.normalRowsHeight   += height;

        var result  = {
            height  : height,
            row     : item.cloneNode(true),
            record  : this.normalView.getRecord(recordIndex)
        };

        this.normalRows.push(result);

        return result;
    },


    onRowsCollected : function () {
        throw 'Sch.plugin.exporter.AbstractExporter: [onRowsCollected] Abstract method called.';
    },


    /**
     * @private
     * Iterates by calling provided function asynchronously with a delay.
     * The delay duration is specified by {@link #iterateTimeout} config.
     * @param  {Function} fn    Function implementing a single iteration step.
     * @param  {Function} fn.next Callback function to be called to run the next iteration step.
     * This will cause `fn` function launch. All arguments passed to {@link #fn.next} will be transfered to {@link #fn}.
     * @param  {[type]}   [scope] Scope for the callback function
     */
    iterateAsync : function (fn, scope) {
        var me      = this;

        scope       = scope || me;

        var next    = function () {
            var args    = arguments;

         //run iteration step asynchronously w/ delay
           var interval = setInterval(function() {
               clearInterval(interval);
                fn.apply(scope, [].concat.apply([ next ], args));
           }, me.iterateTimeout);

        };

        next.apply(me, Ext.Array.slice(arguments, 2));
    },

    callAsync : function (fn, scope) {
        scope = scope || this;

       var interval = setInterval(function() {
            clearInterval(interval);
            fn.apply(scope, Ext.Array.slice(arguments, 2));
       }, 1);
    },


    /**
     * @protected
     * Collects rows from the component. Launches the provided callback and passes collected rows as its arguments.
     * @param callback {Function} The callback function when extraction of rows has finished.
     */
    collectRows : function (callback, scope, config) {

        var me              = this,
            startIndex      = 0;

        var needToScroll = me.isBuffered();

        // if rows to extract range is provided
        if (config.rowsRange) {
            // we know for sure index to start from
            startIndex = config.rowsRange[0];
            // if the range is inside the set of currently rendered rows we don't need to scroll
            needToScroll = !(config.rowsRange[0] >= me.view.all.startIndex && config.rowsRange[1] <= me.view.all.endIndex);
        }

        if (needToScroll) {
            // scroll to start index before rows collecting
            setTimeout(function () {
                me.scrollTo(startIndex, function () {
                    // fill firstExportedRowOffset value ..used to shift the secondary canvas vertically from page to page
                    startIndex && me.initFirstExportedRowOffset(startIndex);

                    me.iterateAsync(me.collectRowsStep, me, startIndex, callback, scope, config);
                });
            }, 1);

        } else {
            // fill firstExportedRowOffset value ..used to shift the secondary canvas vertically from page to page
            startIndex && me.initFirstExportedRowOffset(startIndex);

            setTimeout(function () {
                me.collectRowsStep(null, startIndex, callback, scope, config);
            }, 1);
        }
    },


    initFirstExportedRowOffset : function (firstExportedRowIndex) {
        this.firstExportedRowOffset = this.view.el.getScrollTop() - this.view.el.getTop() + Ext.fly(this.view.getNode(firstExportedRowIndex)).getTop();
    },


    isRowVisible : function (rowNode, visibleBox) {
        var nodeEl        = Ext.fly(rowNode),
            nodeTop       = nodeEl.getTop(),
            nodeHeight    = nodeEl.getHeight(),
            nodeBottom    = nodeTop + nodeHeight,
            nodeThreshold = (1 - this.getRowVisibilityThreshold()) * nodeHeight;

        return nodeTop + nodeThreshold > visibleBox.top &&
            nodeBottom - nodeThreshold < visibleBox.bottom;
    },


    collectRowsStep : function (next, startIndex, callback, scope, config) {
        var me              = this,
            endIndex        = me.normalView.all.endIndex,
            count           = me.component.store.getCount(),
            rowsRange       = config.rowsRange,
            normalRows      = me.normalView.all.slice(startIndex),
            lockedRows      = me.lockedView.all.slice(startIndex),
            i               = 0;

        var lastIndex;

        // If we collect only visible rows
        if (rowsRange) {
            lastIndex = rowsRange[1];
        }

        var collected = false;

        for (var index = startIndex; i < normalRows.length; i++) {
            if (index > lastIndex) {
                collected = true;
                break;
            }

            lockedRows[i] && me.collectLockedRow(lockedRows[i], index, config);
            me.collectNormalRow(normalRows[i], index, config);

            index++;
        }


        me.fireEvent('collectrows', me, startIndex, index, count);


        // if we are in the buffered mode (and not collected all the requested rows yet)
        // we need to scroll further
        if (!collected && me.isBuffered()) {

            if (endIndex + 1 < count) {
                me.callAsync(function () {
                    me.scrollTo(endIndex + 1, function () {
                        next(endIndex + 1, callback, scope, config);
                    });
               });

            } else {
                me.callAsync(function () {
                    me.scrollTo(0, function () {
                        callback.call(scope || me, me.lockedRows, me.normalRows);
                    });
                });
            }

            // if we already collected all the needed rows - invoke the final step
        } else {
            callback.call(scope || me, me.lockedRows, me.normalRows);
        }
    },

    /**
     * @private
     * Fills extracted pages `html` property before submitting them.
     * @param  {Array} [pages] Array of pages. By default {@link #extractedPages} is used.
     * @return {Array} Array of pages.
     */
    renderPages : function (pages) {
        var me  = this;

        pages   = pages || me.extractedPages;

        for (var i = 0, l = pages.length; i < l; i++) {
            var page    = pages[i];
            page.html   = me.applyPageTpl(page);
        }

        return pages;
    },

    /**
     * @protected
     * Builds HTML content of the page by applying provided page data to the {@link #tpl page template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {String}          HTML content of the page.
     */
    applyPageTpl : function (pageInfo) {
        var me  = this;
        return me.getTpl().apply(me.getPageTplData(pageInfo));
    },

    /**
     * @protected
     * Builds HTML content of the page header by applying provided page data to the {@link #headerTpl header template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {String}          HTML content of the header.
     */
    applyHeaderTpl : function (pageInfo) {
        var me          = this,
            headerTpl   = me.getHeaderTpl();

        if (me.exportConfig.showHeader && headerTpl) {
            // if function was provided to alter tpl data
            var fn          = me.headerTplDataFn;
            var alterData   = fn && fn.call(me.headerTplDataFnScope || me, pageInfo);

            return headerTpl.apply(Ext.apply(me.getHeaderTplData(pageInfo), alterData));
        }

        return '';
    },

    /**
     * @protected
     * Builds HTML content of the page footer by applying provided page data to the {@link #footerTpl footer template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {String}          HTML content of the footer.
     */
    applyFooterTpl : function (pageInfo) {
        var me          = this,
            footerTpl   = me.getFooterTpl();

        if (me.exportConfig.showFooter && footerTpl) {
            // if function was provided to alter tpl data
            var fn          = me.footerTplDataFn;
            var alterData   = fn && fn.call(me.footerTplDataFnScope || me, pageInfo);

            return footerTpl.apply(Ext.apply(me.getFooterTplData(pageInfo), alterData));
        }

        return '';
    },

    /**
     * @protected
     * Function to provide data for the {@link #headerTpl} template.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {Object} The template data:
     * @return {Number} return.width width of the page header (page width)
     * @return {Number} return.height height of the page header
     * @return {Number} return.totalPages total number of pages
     * @return {Number} return.pageNo the page number
     */
    getHeaderTplData : function (pageInfo) {
        var me  = this;

        return {
            width       : me.paperWidth,
            height      : me.pageHeaderHeight,
            totalPages  : me.numberOfPages,
            pageNo      : pageInfo.number
        };
    },

    /**
     * @protected
     * Function to provide data for the {@link #footerTpl} template.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {Object} The template data:
     * @return {Number} return.width width of the page footer (page width)
     * @return {Number} return.height height of the page footer
     * @return {Number} return.totalPages total number of pages
     * @return {Number} return.pageNo the page number
     */
    getFooterTplData : function (pageInfo) {
        var me  = this;

        return {
            width       : me.paperWidth,
            height      : me.pageFooterHeight,
            totalPages  : me.numberOfPages,
            pageNo      : pageInfo.number
        };
    },

    /**
     * @protected
     * Provides data to be applied to the {@link #tpl page template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {Object}      Data to be applied to the {@link #tpl page template}.
     */
    getPageTplData : function (pageInfo) {
        var me  = this;

        return {
            bodyClasses         : me.getBodyClasses(),
            bodyHeight          : me.printHeight + me.headerHeight,
            componentClasses    : me.getComponentClasses(),
            styles              : me.getStylesheets(),
            showHeader          : me.exportConfig.showHeader,
            showFooter          : me.exportConfig.showFooter,
            header              : me.applyHeaderTpl(pageInfo),
            HTML                : pageInfo.html,
            footer              : me.applyFooterTpl(pageInfo),
            totalWidth          : me.paperWidth,
            title               : pageInfo.number + ' of ' + me.numberOfPages
        };
    },

    /**
     * @protected
     * Resizes the component to fit it into specified paper size, export settings etc. (depending on implemented pagination rules).
     */
    fitComponentIntoPage : Ext.emptyFn,

    /**
     * @private
     * Function that retrieves the table body of the locked grid.
     * @param {Ext.dom.Element} [element] The fragment root for the selector. Defaults to current page.
     * @return {Ext.dom.Element} Table body of the locked grid.
     */
    getLockedGridBody : function (element) {
        element    = element || this.getCurrentPage();

        return element.select(this.lockedBodySelector + ' ' + this.tableSelector).first();
    },

    /**
     * @private
     * Retrieves the table body of the normal grid.
     * @param {Ext.dom.Element} [element] The root element to retrieve from. Defaults to current page.
     * @return {Ext.dom.Element} Table body of the normal grid.
     */
    getNormalGridBody : function (element) {
        element = element || this.getCurrentPage();

        return element.select(this.normalBodySelector + ' ' + this.tableSelector).first();
    },


    emptyLockedGrid : function (element) {
        this.getLockedGridBody(element).select(this.lockedView.getItemSelector()).remove();
    },


    fillGrids : function (lockedRows, normalRows, clone, append) {
        var me  = this;

        me.fillLockedGrid(lockedRows, clone, append);
        me.fillNormalGrid(normalRows, clone, append);
    },


    fillLockedGrid : function (rows, clone, append) {
        var me  = this;
        if (!append) me.emptyLockedGrid();

        me.appendRows(me.getLockedGridBody(), rows || me.lockedRows, clone);
    },


    fillNormalGrid : function (rows, clone, append) {
        var me  = this;
        if (!append) me.emptyNormalGrid();

        me.appendRows(me.getNormalGridBody(), rows || me.normalRows, clone);
    },


    appendRows : function (node, children, clone) {
        var dom     = node.dom;
        for (var i = 0, l = children.length; i < l; i++) {
            dom.appendChild(clone ? children[i].row.cloneNode(true) : children[i].row);
        }
    },


    emptyNormalGrid : function (element) {
        this.getNormalGridBody(element).select(this.normalView.getItemSelector()).remove();
    },


    getRowHeight : function () {
        return this.view.timeAxisViewModel.getViewRowHeight();
    },


    /**
     * @private
     * Returns full width and height of both grids.
     * @return {Object} Object containing `width` and `height` properties.
     */
    getTotalSize : function() {
        return {
            width   : this.getTotalWidth(),
            height  : this.getTotalHeight()
        };
    },

    /**
     * @private
     * Returns full height of the component.
     * @return {Number} Full height of the component.
     */
    getTotalHeight : function () {
        var me  = this,
            viewHeight;

        if (me.isBuffered()) {
            viewHeight  = me.bufferedHeightMargin + me.normalRowsHeight;
        } else {
            viewHeight  = me.lockedView.getEl().down(me.tableSelector).getHeight();
        }

        return me.headerHeight + viewHeight;
    },

    /**
     * @private
     * Returns full width of the component.
     * @return {Number} Full width of both grids.
     */
    getTotalWidth : function () {
        return this.getLockedGridWidth() + this.normalGrid.body.down(this.tableSelector).getWidth();
    },


    getLockedGridWidth : function () {
        return this.lockedHeader.getEl().first().getWidth();
    },


    getNormalGridWidth : function () {
        return this.normalHeader.getEl().first().getWidth();
    },


    /**
     * @protected
     * Performs last changes to {@link #getCurrentPage the current page} being extracted before it's pushed into {@link #extractedPages} array.
     * @param {Object} [config] Optional configuration object.
     * @return {Ext.dom.Element} element Element holding the page.
     */
    preparePageToCommit : function () {
        //create empty div that will temporarily hold our panel current HTML
        var frag        = this.getCurrentPage(),
            component   = this.component,
            lockedGrid  = component.lockedGrid,
            normalGrid  = component.normalGrid,
            secondaryCanvas = frag.down('.sch-secondary-canvas', true);

        frag.select('.sch-remove').remove();

        var get             = function (s) { var el = frag.select('#' + s).first(); return el && el.dom; },
            elapseWidth     = function (el) { if (el) el.style.width  = '100%'; },
            elapseHeight    = function (el) { if (el) el.style.height = '100%'; };

        var normalBody      = frag.select(this.normalBodySelector).first();
        normalBody.dom.style.top    = '0px';

        var lockedBody      = frag.select(this.lockedBodySelector).first();
        lockedBody.dom.style.top    = '0px';

        // remove transform:translate3d(...) from views item container element
        // otherwise it might mess top coordinate of the exported rows (checked in: 015_export_current_view)

        var lockedItemsContainer;

        if (lockedItemsContainer = this.getLockedGridBody()) {
            if (Ext.isIE9m) {
                lockedItemsContainer.dom.style.top = '';
            } else {
                lockedItemsContainer.dom.style.transform = '';
            }
        }

        var normaItemsContainer;

        if (normaItemsContainer = this.getNormalGridBody()) {
            if (Ext.isIE9m) {
                normaItemsContainer.dom.style.top = '';
            } else {
                normaItemsContainer.dom.style.transform = '';
            }
        }

        if (secondaryCanvas) {
            secondaryCanvas.style.top = this.secondaryCanvasOffset + 'px';
            Ext.fly(secondaryCanvas).select('.sch-column-line').setHeight(this.normalRowsHeight);
        }

        // we elapse some elements width and/or height

        var lockedElements  = [
            get(component.id + '-targetEl'),
            get(component.id + '-innerCt'),
            get(lockedGrid.id),
            get(lockedGrid.body.id),
            get(lockedGrid.view.el.id)
        ];

        Ext.Array.forEach(lockedElements, elapseHeight);

        elapseWidth(lockedElements[0]);
        elapseWidth(lockedElements[1]);

        if (!Ext.isIE) {
            elapseWidth(get(normalGrid.headerCt.id));
        }
        else {
            var el = get(normalGrid.headerCt.id);
            if (el) el.style.width  = '';
        }

        Ext.Array.forEach([
            get(normalGrid.id),
            get(normalGrid.body.id),
            get(normalGrid.getView().id)
        ], function(el) {
            if (el) {
                el.style.height = el.style.width = '100%';
            }
        });

        return frag;
    },


    cloneElement : function (el) {
        return new Ext.dom.Element(Ext.core.DomHelper.createDom({
            tag     : 'div',
            html    : el.dom.innerHTML
        }));
    },


    /**
     * Starts a new page. Initializes {@link #currentPage} with a copy of the component that will
     * be filled with collected rows based on implemented pagination rules.
     * @param  {Ext.dom.Element} [pattern] Element to make a copy of. This is optional by default will make a copy of {@link #getComponent the component}.
     */
    startPage : function (pattern) {
        var me      = this;

        // make a detached copy of the component body
        var copy    = me.cloneElement(pattern || me.getComponent().body);

        // and put it into storedFragment
        me.setCurrentPage(copy);
    },

    scrollTo : function (position, callback, scope) {
        var me = this;

        if (me.component.ensureVisible) {

            var record = me.component.store.getAt(position);

            me.component.ensureVisible(record, {
                callback : function () {
                    if (callback && this.isLocked === false) {
                        callback.apply(scope || me);
                    }
                },
                select  : false,
                focus   : false,
                animate : false
            });

        }
        else {
            me.lockedView.bufferedRenderer.scrollTo(position, false, function () {
                me.normalView.bufferedRenderer.scrollTo(position, false, callback, scope || me);
            });
        }
    },

    removeNode : function (el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
        else {
            if (el.elements) {

                for (var i = 0; i < el.elements.length; i++) {
                    var elem = el.elements[i];
                    elem.parentNode.removeChild(elem);
                }

            }
        }
    },

    //private
    restoreInfiniteScroll : function (panel) {

        var view = panel.getSchedulingView();

        if (panel.infiniteScroll && view.rendered) {

            // restore saved time span and scroll position
            panel.timeAxis.setTimeSpan(this._oldStart, this._oldEnd);
            view.setScrollX(this._oldScrollX);

            // enable back infiniteScroll mode event listeners
            view.enableInfiniteScroll();
        }
    },

    //private
    suspendInfiniteScroll : function (panel) {

        var view = panel.getSchedulingView();

        // unbind events reacting on scroll specific to infiniteScroll mode
        if (panel.infiniteScroll && view.rendered) {

            view.disableInfiniteScroll();

            // remember current time span and scroll position
            this._oldStart      = panel.timeAxis.getStart();
            this._oldEnd        = panel.timeAxis.getEnd();
            this._oldScrollX    = view.getScrollX();

            var span = panel.getEventStore().getTotalTimeSpan();
            panel.setTimeSpan(span.start, span.end);
        }
    }

});
/**
 @class Sch.plugin.exporter.SinglePage
 @extends Sch.plugin.exporter.AbstractExporter

 This class extracts all scheduler data to fit in a single page.

 The exporterId of this exporter is `singlepage`
 */


Ext.define('DSch.plugin.exporter.SinglePage', {

    extend  : 'DSch.plugin.exporter.AbstractExporter',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - name    : 'Single page'
     */

    config  : {
        exporterId : 'singlepage',

        headerTpl   : '<div class="sch-export-header" style="height:{height}px; width:{width}px"></div>'
    },

    getExpectedNumberOfPages : function () {
        return 1;
    },

    getPaperFormat : function () {
        var me          = this,
            realSize    = me.getTotalSize(),
            dpi         = me.exportConfig.DPI,
            width       = Ext.Number.toFixed(realSize.width / dpi, 1),
            height      = Ext.Number.toFixed(realSize.height / dpi, 1);

        return width+'in*'+height+'in';
    },


    onRowsCollected : function () {
        var me = this;

        me.startPage();
        me.fillGrids();
        me.commitPage();

        me.onPagesExtracted();
    },


    getPageTplData : function () {
        var me          = this,
            realSize    = me.getTotalSize();

        return Ext.apply(me.callParent(arguments), {
            bodyHeight  : realSize.height,
            showHeader  : false,
            totalWidth  : realSize.width
        });
    },

    getHeaderTplData : function (pageInfo) {
        var me  = this;

        return {
            width       : me.getTotalWidth(),
            height      : me.pageHeaderHeight
        };
    },


    fitComponentIntoPage : function () {
        var me          = this,
            lockedGrid  = me.lockedGrid;

        lockedGrid.setWidth(lockedGrid.headerCt.getEl().first().getWidth());
    },

    preparePageToCommit : function () {
        var me          = this,
            frag        = me.callParent(arguments),
            secondaryCanvas = frag.select('.sch-secondary-canvas').first(),
            zones = secondaryCanvas.select('.sch-zone'),
            lines = secondaryCanvas.select('.sch-column-line');

        var height = me.getTotalHeight();

        secondaryCanvas.setTop(0);
        zones.setHeight(height);
        lines.setHeight(height);

        return frag;
    }

});
/**
 @class Sch.plugin.exporter.MultiPage
 @extends Sch.plugin.exporter.AbstractExporter

 This class extracts pages in a vertical and horizontal order.

 The exporterId of this exporter is `multipage`
 */

Ext.define('DSch.plugin.exporter.MultiPage', {

    extend          : 'DSch.plugin.exporter.AbstractExporter',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - name    : 'Multi pages'
     */

    config          : {
        exporterId  : 'multipage'
    },

    rowPageIndex    : 0,

    columnPageIndex : 0,

    pagesPerColumn  : 0,


    onRowsCollected : function (lockedRows, normalRows) {
        var me  = this;

        // reset row/column page counters
        me.rowPageIndex     = 0;
        me.columnPageIndex  = 0;
        me.pagesPerColumn   = 0;

        // - build page frame (skeleton) for each page column,
        me.buildPageFrames(function () {
            // - build pages by filling grids w/ collected rows
            // - finish exporting by launching `onPagesExtracted`
            me.buildPages(me.onPagesExtracted, me, lockedRows, normalRows);
        });
    },

    /**
     * Builds pages using collected rows. Uses {@link #pagesFrames page frames} built by {@link #buildPageFrames} method.
     * Calls provided function on pages building completion.
     * @param  {Function} callback Function to be called on building completion.
     * @param  {Object}   [scope] Scope for the specified function. By default set to this exporter instance.
     */
    buildPages : function (callback, scope, lockedRows, normalRows) {
        var me      = this,
            frame   = me.pageFrames[0];

        // start new column page based on specified frame
        me.startPage(frame, true);

        // handle each collected row w/ `rowIteratorStep` method
        this.iterateAsync(me.rowIteratorStep, me, {
            rowIndex    : 0,
            pageFrame   : frame,
            rowsHeight  : 0,
            leftHeight  : this.printHeight,
            lockeds     : [],
            normals     : [],
            lockedRows  : lockedRows,
            normalRows  : normalRows,
            callback    : callback,
            scope       : scope || me
        });
    },

    /**
     * Processes a collected row and decides on its distribution between pages.
     * @param  {Function} next    A callback function to call to proceed w/ a next row.
     * @param  {Object}   context Processing context:
     * @param  {Object}   context.rowIndex Zero based index of the row.
     */
    rowIteratorStep : function (next, context) {

        var me          = this,
            rowIndex    = context.rowIndex,
            lockedRows  = context.lockedRows,
            normalRows  = context.normalRows,
            leftHeight  = context.leftHeight,
            lockeds     = context.lockeds,
            normals     = context.normals,
            async       = true;

        // if we have rows to handle
        if (rowIndex < normalRows.length) {

            var lockedRow   = lockedRows[rowIndex],
                normalRow   = normalRows[rowIndex];

            // if row fits into current page
            if (normalRow.height <= leftHeight) {
                // gather rows into temp arrays
                lockeds.push(lockedRow);
                normals.push(normalRow);

                context.leftHeight -= normalRow.height;
                context.rowsHeight += normalRow.height;

                async = false;

                // ..if doesn't fit
            } else {
                // flush temp arrays to fill page with gathered rows
                me.fillGrids(lockeds, normals, context.pageFrame);
                // and start a new page
                me.commitPage({ rowsHeight : context.rowsHeight });
                me.startPage( context.pageFrame );

                context.lockeds     = [ lockedRow ];
                context.normals     = [ normalRow ];
                context.leftHeight  = me.printHeight - normalRow.height;
                context.rowsHeight  = normalRow.height;
            }

            context.rowIndex++;

            // if we have more column pages to build
        } else if (me.columnPageIndex < me.pageFrames.length) {

            // flush temp arrays to fill page with gathered rows
            me.fillGrids(lockeds, normals, context.pageFrame);
            me.commitPage({ rowsHeight : context.rowsHeight });
            // me.columnPageIndex is 1-based so it points to the neaxt frame in me.pageFrames array
            context.pageFrame   = me.pageFrames[me.columnPageIndex];

            // start new column page based on specified frame
            me.startPage(context.pageFrame, true);

            context.leftHeight  = me.printHeight;
            context.rowsHeight  = 0;
            context.lockeds = [];
            context.normals = [];
            context.rowIndex = 0;

            // if we ran out of rows & columns then we finished
        } else {

            // flush temp arrays to fill page with gathered rows
            me.fillGrids(lockeds, normals, context.pageFrame);
            me.commitPage({ rowsHeight : context.rowsHeight });

            // run specified callback on completion
            context.callback.call(context.scope);
            return;
        }

        // handle next row
        if (async) {
            next(context);
        }
        else {
            me.rowIteratorStep(next, context);
        }
    },


    fillGrids : function (lockeds, normals, frame) {
        var me              = this,
            hasLockedGrid   = me.lockedColumnPages[me.columnPageIndex - 1],
            hasNormalGrid   = !hasLockedGrid || (hasLockedGrid && hasLockedGrid.leftWidth);

        if (hasLockedGrid) {
            me.fillLockedGrid(lockeds, true);
            me.removeHiddenLockedColumns(hasLockedGrid);
        }

        if (hasNormalGrid) {
            me.fillNormalGrid(normals, true);
            me.removeInvisibleEvents(-frame.normalGridOffset, -frame.normalGridOffset + frame.normalGridWidth);
        }
    },


    /**
     * @protected
     * Builds a page frame, a DOM-"skeleton" for a future pages.
     * @param  {Number} colIndex Zero based index of page column to build frame for.
     * @param  {Number} offset   Proper normal grid offset for the page column.
     * @return {Ext.dom.Element} Column page frame.
     */
    buildPageFrame : function (colIndex, offset) {
        var me          = this,
            lockedCols  = me.lockedColumnPages[ colIndex ];

        // if this page column has locked grid
        if (lockedCols) {
            me.lockedGrid.setWidth( me.showLockedColumns(lockedCols.start, lockedCols.end) + (lockedCols.startOffset || 0) );

            // if there is some room after locked grid let's show normal grid
            if (lockedCols.leftWidth) {
                me.normalGrid.show();
                // otherwise we hide normal grid
            } else {
                me.normalGrid.hide();
            }

            // if no locked grid on the page
        } else {
            me.lockedGrid.setWidth(0);
            me.lockedGrid.hide();
            me.normalGrid.show();
        }

        // now after we set locked columns/grid and normal grid visibility
        // we clone the content of the component
        var copy    = me.cloneElement(me.getComponent().body);

        copy.normalGridOffset   = offset;
        copy.lockedGridOffset   = lockedCols && lockedCols.startOffset || 0;
        copy.normalGridWidth    = me.normalGrid.getWidth();
        copy.lockedGridWidth    = me.lockedGrid.getWidth();

        // do some CSS-tweaks to shift locked grid
        copy.select(me.lockedBodySelector).first().dom.style.position   = '';
        copy.select('#' + me.lockedView.id).first().dom.style.overflow  = 'visible';

        // if normal grid is visible on this column page
        // do some CSS-tweaks to place normal grid to show only this page content
        if (!me.normalGrid.hidden) {
            var table   = copy.select(me.normalBodySelector).first();
            table.dom.style.position    = '';
            table.dom.style.top         = '0px';

            var body            = me.getNormalGridBody(copy);
            var header          = copy.select('#' + me.normalView.headerCt.id).first();
            var secondaryCanvas = copy.select('.sch-secondary-canvas').first();
            var view            = copy.select('#' + me.normalView.id).first();

            body.dom.style.left             = offset + 'px';
            header.dom.style.left           = offset + 'px';
            header.dom.style.overflow       = 'visible';

            if (secondaryCanvas) {
                secondaryCanvas.dom.style.left = offset + 'px';
            }

            view.dom.style.overflow         = 'visible';
        }

        return copy;
    },

    /**
     * @protected
     * Builds column page frames.
     * @param  {Function} callback A callback function to call on completion
     * @param  {Array[Ext.dom.Element]} callback.pageFrames An array of page frames built
     * @param  {[type]}   scope    A scope for the specified callback function
     */
    buildPageFrames : function (callback, scope) {
        var me                  = this;

        scope                   = scope || me;

        // markup locked columns ranges for page columns
        me.lockedColumnPages    = me.calculateLockedColumnPages();

        var columnPagesNum      = Math.ceil(me.getTotalWidth() / me.paperWidth),
            pageFrames          = me.pageFrames = [];

        me.iterateAsync(function (next, colIndex, offset) {
            // on build completion we call provided function
            if (colIndex >= columnPagesNum) {
                callback.call(scope, pageFrames);
                return;
            }

            pageFrames.push( me.buildPageFrame(colIndex, offset) );

            var lockedCols  = me.lockedColumnPages[ colIndex ];

            // adjust normal grid offset for the next page column
            if (lockedCols) {
                offset -= lockedCols.leftWidth || 0;
            } else {
                offset -= me.paperWidth;
            }

            // let's build frame for next page column
            next(colIndex + 1, offset);

        }, me, 0, 0);
    },


    startPage : function (pattern, newColumnPage) {
        var me  = this;

        if (newColumnPage) {
            // on the very first page commit step we know the exact number of row pages
            // let's keep that value
            if (me.columnPageIndex == 1) {
                me.pagesPerColumn = me.extractedPages.length;
            }
            me.rowPageIndex   = 0;
            me.columnPageIndex++;

            me.secondaryCanvasOffset = me.firstExportedRowOffset;
        }

        me.rowPageIndex++;

        me.callParent(arguments);

        me.emptyNormalGrid();
        me.emptyLockedGrid();
    },


    commitPage : function (cfg) {
        var me  = this;

        me.callParent([ Ext.apply({ row : me.rowPageIndex, column : me.columnPageIndex }, cfg) ]);

        // shift the secondary canvas vertically by the sum of processed rows height
        me.secondaryCanvasOffset -= cfg.rowsHeight;
    },


    getExpectedPagesPerColumn : function () {
        return this.pagesPerColumn || Math.ceil((this.normalRowsHeight || this.component.store.count() * this.component.getRowHeight()) / this.printHeight);
    },


    getExpectedColumnsNumber : function () {
        return this.pageFrames ? this.pageFrames.length : Math.ceil((this.lockedGrid.getWidth() + this.ticks.length * this.view.timeAxisViewModel.getTickWidth()) / this.paperWidth);
    },


    getExpectedNumberOfPages : function () {
        return this.getExpectedColumnsNumber() * this.getExpectedPagesPerColumn();
    },


    /**
     * @protected
     * Calculates which locked columns belong to which page.
     * @return {Array[Object]} Array of object
     */
    calculateLockedColumnPages : function () {
        var me          = this,
            result      = [],
            columns     = me.lockedColumns,
            leftWidth   = me.paperWidth,
            page;

        for (var i = 0, l = columns.length; i < l; i++) {
            var column  = columns[i],
                width   = column.width;

            page        = page || { start : i, end : i };
            leftWidth   -= width;

            // if column violated page width
            if (leftWidth < 0) {
                // push page
                result.push(page);

                if (leftWidth) {
                    page    = { start : i, end : i };
                }

                leftWidth   = me.paperWidth - width + leftWidth;
            } else {
                page.end = i;
            }

            /*
             // support for columns sharing between pages

             page        = page || { start : i };
             page.end    = i;
             leftWidth   -= width;

             // if column violated page width
             if (leftWidth <= 0) {
             // push page
             result.push(page);
             // if the column was split next page will start from it w/ corresponding offset
             if (leftWidth) {
             page    = {
             start       : i,
             end         : i,
             startOffset : leftWidth
             };
             } else {
             page    = null;
             }

             leftWidth   = me.paperWidth - width + leftWidth;
             }
             */
        }

        // if we have unpushed column page
        if (page) {
            page.leftWidth  = leftWidth;
            result.push(page);
        }

        return result;
    },


    getPageTplData : function (data) {
        return Ext.apply(this.callParent(arguments), {
            title : data.number + ' of ' + this.numberOfPages + ' (column: ' + data.column + ', row: ' + data.row + ')'
        });
    },


    showLockedColumns : function (startColumn, endColumn) {
        var me      = this,
            columns = me.lockedColumns,
            width   = 0;

        startColumn = startColumn || 0;
        endColumn   = endColumn || columns.length - 1;

        for (var i = 0; i < columns.length; i++) {

            var column = columns[i];

            if (i >= startColumn && i <= endColumn) {
                column.column.show();
                width += column.width;
            } else {
                column.column.hide();
            }
        }

        return width;
    },


    removeInvisibleEvents : function (leftBorder, rightBorder) {
        var me          = this,
            normalBody  = me.getNormalGridBody(),
            eventCls    = me.normalView.eventCls;

        var elements = normalBody.select('.' + eventCls).elements;

        for (var i = 0; i < elements.length; i++) {

            var start   = parseInt(elements[i].style.left, 10),
                end     = start + parseInt(elements[i].style.width, 10);

            if (end < leftBorder || start > rightBorder) {
                me.removeNode(elements[i]);
            }
        }
    },

    removeHiddenLockedColumns : function (lockedGrid) {
        var me = this,
            page = me.getCurrentPage(),
            tableBody = me.getLockedGridBody();

        for (var i = 0; i < me.lockedColumns.length; i++ ) {
            var column = me.lockedColumns[i].column;

            if ( i < lockedGrid.start || i > lockedGrid.end) {
                var headerSelector = '#' + column.getId();
                var header = page.select(headerSelector);
                me.removeNode(header);

                var cellSelector = column.getCellSelector();
                var cells = tableBody.select(cellSelector);
                me.removeNode(cells);
            }
        }
    },


    fitComponentIntoPage : function () {
        var me  = this;

        me.getComponent().setWidth(me.paperWidth);
    },


    prepareComponent : function (component, config) {

        var me      = this,
            columns = me.lockedColumns = [];

        me.callParent(arguments);

        // keep visible locked columns data
        me.lockedGrid.headerCt.items.each(function (column) {
            if (!column.hidden) {
                columns.push({
                    column  : column,
                    width   : column.getWidth()
                });
            }
        });
    },

    restoreComponentState : function () {
        this.callParent(arguments);
        // restore locked columns visibility
        this.showLockedColumns();
    }

});
/**
 @class Sch.plugin.exporter.MultiPageVertical
 @extends Sch.plugin.exporter.AbstractExporter

 This class extracts pages in a vertical order. It fits all locked columns and the timeaxis on a single page and will generate
 new pages vertically down for the rows.

 The exporterId of this exporter is `multipagevertical`

 To adjust column widths for specific export cases the function {@link #fitLockedColumnWidth} can be overridden.

 */

Ext.define('DSch.plugin.exporter.MultiPageVertical', {

    extend                : 'DSch.plugin.exporter.AbstractExporter',
    alternateClassName      : 'DSch.plugin.exporter.MultiPageHorizontal',
    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - name    : 'Multi pages (vertically)'
     */

    config                : {
        exporterId : 'multipagevertical'
    },


    minRowHeight          : 20,

    minAverageColumnWidth : 100,

    visibleColumns        : null,

    visibleColumnsWidth   : 0,

    onRowsCollected : function (lockedRows, normalRows) {
        var me          = this;

        me.iterateAsync(function (next, rowIndex) {

            if (rowIndex === normalRows.length) {
                me.onPagesExtracted();
                return;
            }

            var index       = rowIndex,
                spaceLeft   = me.printHeight,
                rowsHeight  = 0,
                lockeds     = [],
                normals     = [],
                newPage     = false,
                normal,
                locked;

            me.startPage();

            while (!newPage && index < normalRows.length) {

                normal      = normalRows[index];
                locked      = lockedRows[index];
                spaceLeft   -= normal.height;

                if (spaceLeft > 0) {
                    rowsHeight  += normal.height;
                    locked && lockeds.push(locked);
                    normals.push(normal);
                    index++;
                }
                else {
                    newPage = true;
                }
            }

            me.fillGrids(lockeds, normals);
            me.commitPage({ rowIndex : index, rowsHeight : rowsHeight });
            me.secondaryCanvasOffset -= rowsHeight;

            next( index );

        }, me, 0);
    },


    startPage : function () {
        var me      = this;
        me.callParent(arguments);

        var view    = me.getCurrentPage().select('#' + me.lockedView.id).first();
        view.dom.style.overflow = 'visible';
    },


    getExpectedNumberOfPages : function () {
        return Math.ceil(this.normalRowsHeight / this.printHeight);
    },


    prepareColumns : function (columns) {

        this.callParent(arguments);

        var me                  = this,
            visibleColumns      = me.visibleColumns = [];

        me.visibleColumnsWidth  = 0;

        me.lockedGrid.headerCt.items.each(function (column) {
            if (!column.hidden) {
                visibleColumns.push({
                    column  : column,
                    width   : column.getWidth()
                });

                me.visibleColumnsWidth += column.getWidth();
            }
        });
    },


    fitComponentIntoPage : function () {
        var me              = this,
            component       = me.getComponent(),
            view            = component.getSchedulingView(),
            normalGrid      = component.normalGrid,
            lockedGrid      = component.lockedGrid,
            totalWidth      = me.getTotalWidth(),
            ticks           = me.ticks,
            timeColumnWidth = me.timeColumnWidth || view.timeAxisViewModel.getTickWidth();

        var lockedWidth     = Math.floor((me.visibleColumnsWidth / totalWidth) * me.paperWidth);

        //correct lockedcolumn width if it is too small
        var visibleColumnCount = me.visibleColumns.length,
            preferedLockedWidth = visibleColumnCount * me.minAverageColumnWidth;

        //preferred locked width can never take more than half of the page
        preferedLockedWidth = preferedLockedWidth > me.paperWidth / 2 ? Math.floor(me.paperWidth / 2) : preferedLockedWidth;
        //if preferred width is wider than current locked width, then use preferred width
        lockedWidth = preferedLockedWidth > lockedWidth ? preferedLockedWidth : lockedWidth;

        var normalWidth = me.paperWidth - lockedWidth;

        var tickWidth   = normalWidth / ticks.length,
            rowHeight   = (tickWidth / timeColumnWidth) * me.getRowHeight();

        me.view.setRowHeight( rowHeight < me.minRowHeight ? me.minRowHeight : rowHeight );

        component.setWidth(me.paperWidth);
        normalGrid.setWidth(normalWidth);
        lockedGrid.setWidth(lockedWidth);
        //spread lockedcolums over the available width
        me.fitLockedColumnWidth(lockedWidth);

        component.setTimeColumnWidth(tickWidth);
    },


    /**
     * Function that fits locked columns based on the available width.
     *
     * @param {String} totalWidth int indicating the totalWidth available for the locked columns.
     */

    fitLockedColumnWidth : function (totalWidth) {
        var me = this,
            visibleColumns = this.visibleColumns;

        //Keep ratio
        var ratio = totalWidth / me.visibleColumnsWidth;

        if (visibleColumns.length) {

            for (var i = 0; i < visibleColumns.length; i++) {

                var column = visibleColumns[i],
                    currentWidth = column.width,
                    width = Math.floor(currentWidth * ratio);

                column.column.setWidth(width);
            }

            this._restoreColumnWidth = true;
        }
    },


    restoreComponentState : function (component) {

        var me      = this;

        component   = component || me.getComponent();

        // restore original columns width (since we fit them while exporting)
        if (this._restoreColumnWidth) {

            var visibleColumns = this.visibleColumns;

            for (var i = 0; i < visibleColumns.length; i++) {
                var cWrap = visibleColumns[i];
                cWrap.column.setWidth(cWrap.width);
            }
        }

        this.callParent(arguments);

    }

});

/**
 @class Sch.plugin.Export
 @extends Ext.util.Observable

 A plugin (ptype = 'scheduler_export') generating PDF/PNG out of a scheduler panel. NOTE: This plugin will make an AJAX request to the server, POSTing
 the HTML to be exported. The {@link #printServer} URL must therefore be on the same domain as your application.

 ##Configuring/usage

 To use this plugin, add it to your scheduler as any other plugin. It is also required to have [PhantomJS][1] and [Imagemagick][2]
 installed on the server. The complete process of setting up a backend for the plugin can be found in the readme file inside export examples
 as well as on our [blog][3]. Note that the export feature is currently not supported if your store is buffered.

 var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
            ...

            resourceStore : resourceStore,
            eventStore    : eventStore,

            plugins       : [
                Ext.create('Sch.plugin.Export', {
                    printServer : 'server.php'
                })
            ]
        });

 The Scheduler instance will be extended with two new methods:

 - {@link #showExportDialog}, which shows export settings dialog

 scheduler.showExportDialog();

 - {@link #doExport} which actually performs the export operation using {@link #exportConfig} or provided config object :

 scheduler.doExport({
            format      : "A5",
            orientation : "landscape",
            range       : "complete",
            showHeader  : true,
            exporterId  : "singlepage"
        });


 ##Export options

 In the current state, the plugin gives few options to modify the look and feel of the generated PDF document through a dialog window :

 {@img scheduler/images/export_dialog.png}

 If no changes are made to the form, the {@link #exportConfig} will be used.

 ###Schedule range

 This setting controls the timespan visible on the exported document. The following options are available here :

 {@img scheduler/images/export_dialog_ranges.png}

 ####Complete schedule

 Whole current timespan of the panel will be visible in the exported document.

 ####Complete schedule (for all events)

 The timespan will be adjusted to include all the events registered in the event store.

 ####Date range

 User can select the start and end dates visible on the exported document.

 {@img scheduler/images/export_dialog_ranges_date.png}

 ####Visible schedule

 Timespan of the exported document/image will be set to the currently visible part of the time axis.

 ###Select columns

 This field allows to pick the locked grid columns to be exported:

 {@img scheduler/images/export_dialog_columns.png}

 ###Rows range

 This setting controls rows to be included into the exported document. The following options are available here :

 {@img scheduler/images/export_dialog_row_ranges.png}

 ####All rows

 All the panel rows will be included (default mode).

 ####Visible rows

 Only currently visible part of rows will be included into the result document.

 ##Control pagination

 This field allows to pick an exporter implementing needed way of pagination. The default exporter is `Multi pages`.

 {@img scheduler/images/export_modes.png}

 Options:

 -  `Single page`. Creates an export that fits one single page.

 -  `Multi pages`. Creates an export that creates pages in both vertical and horizontal direction.

 -  `Multi pages (vertically)`. Creates an export that creates pages in vertical direction.

 ##Paper Format

 This combo gives control of the size of the generated document/image by choosing one from a list of supported ISO paper sizes : (`A5`, `A4`, `A3`, `Letter`). Default format is `A4`.

 {@img scheduler/images/export_dialog_format.png}

 ###Orientation

 This setting defines the orientation of the generated document/image.

 {@img scheduler/images/export_dialog_orientation.png}

 Default option is the `portrait` (vertical) orientation :

 {@img scheduler/images/export_dialog_portrait.png}

 Second option is the `landscape` (horizontal) orientation :

 {@img scheduler/images/export_dialog_landscape.png}

 ##DPI (dots per inch)

 This field controls the DPI value to use for paper format related calculations:

 {@img scheduler/images/export_dialog_dpi.png}

 ##Page number

 This option allows to add a header to a page displaying the page number:

 {@img scheduler/images/export_page_number.png}

 ##Custom export styling

 A special "sch-export" CSS class is added to the body of the exported pages so that you can have special
 styles in your exported chart.

 [1]: http://www.phantomjs.org
 [2]: http://www.imagemagick.org
 [3]: http://bryntum.com/blog

 */
Ext.define('DSch.plugin.Export', {
    extend                  : 'Sch.plugin.Export',

    alternateClassName      : 'DSch.plugin.PdfExport',


    requires        : [
        'Ext.XTemplate',
        'DSch.plugin.exporter.SinglePage',
        'DSch.plugin.exporter.MultiPage',
        'DSch.plugin.exporter.MultiPageVertical',
        'Sch.widget.ExportDialog'
    ],

    lockableScope           : 'top',

    /**
     * @cfg {Object} pageSizes
     * Definition of all available paper sizes.
     */
    pageSizes               : {
        A5      : {
            width   : 5.8,
            height  : 8.3
        },
        A4      : {
            width   : 8.3,
            height  : 11.7
        },
        A3      : {
            width   : 11.7,
            height  : 16.5
        },
        Letter  : {
            width   : 8.5,
            height  : 11
        },
        Legal   : {
            width   : 8.5,
            height  : 14
        }
    },


    /**
     * @cfg {Number} DPI
     * DPI (Dots per inch) resolution.
     */
    DPI                     : 100,

    /**
     * @cfg {String}
     * URL of the server responsible for running the export steps.
     */
    printServer             : undefined,


    /**
     * @cfg {Number}
     * The timeout in milliseconds to be used for print requests to server.
     */
    timeout                 : 6000000,


    /**
     * @cfg {String} headerTpl
     * Template of extracted page header.
     */
    headerTpl               : null,

    /**
     * @cfg {Function} headerTplDataFn
     * If defined provides data for the {@link #headerTpl}.
     * To define the scope please use {@link #headerTplDataFnScope}.
     * @return {Object} Header template data.
     */
    headerTplDataFn        : null,

    /**
     * @cfg {Object} headerTplDataFnScope Scope for the {@link #headerTplDataFn} function.
     */
    headerTplDataFnScope   : null,

    /**
     * @cfg {String} tpl
     * Template of extracted page.
     */
    tpl                     : null,

    /**
     * @cfg {String} footerTpl
     * Template of extracted page footer.
     */
    footerTpl               : null,

    /**
     * @cfg {Function} footerTplDataFn
     * If defined provides data for the {@link #footerTpl}.
     * To define the scope please use {@link #footerTplDataFnScope}.
     * @return {Object} Footer template data.
     */
    footerTplDataFn        : null,

    /**
     * @cfg {Object} footerTplDataFnScope Scope for the {@link #footerTplDataFn} function.
     */
    footerTplDataFnScope   : null,

    /**
     * @cfg {String}
     * Class name of the dialog used to change export settings.
     */
    exportDialogClassName   : 'Sch.widget.ExportDialog',

    /**
     * @cfg {Object}
     * Config object for the {@link #exportDialogClassName}. Use this to override default values for the export dialog.
     */
    exportDialogConfig      : {},

    /**
     * @cfg {Object}
     * Config object to apply to each {@link Sch.plugin.exporter.AbstractExporter exporter} being registered.
     */
    exporterConfig          : null,

    /**
     * @cfg {Object}
     * Default export configuration.
     */
    exportConfig           : {
        format      : 'Letter',
        orientation : 'landscape',
        range       : 'complete',
        rowsRange   : 'all',
        showDPIField: false,
        showShowHeaderField:false,
        showHeader  : true,
        showFooter  : true
    },

    /**
     * @cfg {Boolean} expandAllBeforeExport Only applicable for tree views, set to true to do a full expand prior to the export. Defaults to false.
     */
    expandAllBeforeExport   : true,

    /**
     * @cfg {Boolean} translateURLsToAbsolute `True` to replace all linked CSS files URLs to absolute before passing HTML to the server.
     */
    translateURLsToAbsolute : true,

    /**
     * @cfg {Boolean}
     * If set to true, open new window with the generated document after the operation has finished.
     */
    openAfterExport         : true,

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * before the export plugin extracts data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @param {Object[]} ticks The ticks gathered by plugin to export.
     * @template
     * @method beforeExport
     */
    beforeExport            : Ext.emptyFn,

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * after the export plugin has extracted the data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @template
     * @method afterExport
     */
    afterExport             : Ext.emptyFn,

    pdfPostTotal            : null,

    /**
     * @cfg {String}
     * Format of the exported file, selectable from `pdf` or `png`. By default plugin exports panel contents to PDF
     * but PNG file format is also available.
     */
    fileFormat              : 'pdf',

    /**
     * @cfg {String}
     * The exporterId of the default exporter to be used.
     * The corresponding export mode will be selected in {@link Sch.widget.ExportDialog export dialog} by default.
     */
    defaultExporter         : 'multipagevertical',

    /**
     * @cfg {Array[Sch.plugin.exporter.AbstractExporter/Object]}
     * The list of available exporters.
     * If no value is provided the list will be filled automatically (see {@link #buildExporters}).
     */
    exporters               : undefined,

    callbacks               : undefined,

    hideExportDialogTimeout : 1000,

    /**
     * @event hidedialogwindow
     * Fires to hide the dialog window.
     * @param {Object} response Full server response.
     */

    /**
     * @event showdialogerror
     * Fires to show error in the dialog window.
     * @param {Ext.window.Window} dialog The dialog used to change export settings.
     * @param {String} message Error message to show in the dialog window.
     * @param {Object} response Full server response.
     */

    /**
     * @event updateprogressbar
     * Fires when a progressbar of the {@link #exportDialogClassName dialog} should update it's value.
     * @param {Number} value Value (between 0 and 1) to set on the progressbar.
     */

    /**
     * @event beforeexport
     * Fires before the exporting is started. Return `false` to cancel exporting.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component A scheduler panel to be exported.
     * @param {Object} config Export configuration.
     */

    constructor : function (config) {
        var me              = this;

        config              = config || {};

        me.exportersIndex   = {};

        if (config.exportDialogConfig) {
            Ext.Object.each(this.exportConfig, function (k, v, o) {
                var configK = config.exportDialogConfig[k];
                if (configK) {
                    o[k] = configK;
                }
            });
        }

        me.callParent([ config ]);

        me.setFileFormat(me.fileFormat);

        // if no exporters specified let's set the list of available by default
        if (!me.exporters) {
            me.exporters    = me.buildExporters();
        }

        // instantiate exporters instances in case there were provided just objects w/ xclass
        me.initExporters();

        // listen to exporters events
        me.bindExporters();
    },

    init : function (scheduler) {
        var me                      = this;

        scheduler.showExportDialog  = Ext.Function.bind(me.showExportDialog, me);
        scheduler.doExport          = Ext.Function.bind(me.doExport, me);

        me.scheduler                = scheduler;
    },


    initExporters : function () {
        var me          = this,
            exporters   = me.exporters;

        for (var i = 0; i < exporters.length; i++) {
            // instantiate the exporter if needed
            if (!exporters[i].isExporter) {
                exporters[i]    = me.createExporter(exporters[i]);
            }
        }
    },


    bindExporters : function () {
        var exporters   = this.exporters;

        for (var i = 0; i < exporters.length; i++) {
            this.bindExporter(exporters[i]);
        }
    },


    bindExporter : function (exporter) {
        var me  = this;

        me.mon(exporter, {
            commitpage  : me.onPageCommit,
            collectrows : me.onRowCollected,
            scope       : me
        });

    },


    unbindExporter : function (exporter) {
        var me  = this;

        me.mun(exporter, {
            commitpage  : me.onPageCommit,
            collectrows : me.onRowCollected,
            setCalcTotalPdfRequest: me.setCalcTotalPdfRequest,
            scope       : me
        });

    },


    /**
     * @protected
     * Provides the list of available exporter instances.
     * This method is used to build the default state of the list when no {@link #exporters} provided.
     * @returns {Array[Sch.plugin.exporter.AbstractExporter]} List of exporters.
     */
    buildExporters : function () {
        return ['DSch.plugin.exporter.MultiPageVertical'];//  'DSch.plugin.exporter.SinglePage','DSch.plugin.exporter.MultiPage',
    },

    /**
     * @protected
     * Returns config for an exporter being initialized.
     * Override this to provide custom options for exporters being created.
     */
    getExporterConfig : function (className, config) {
        var me      = this;

        var result  = Ext.apply({
            translateURLsToAbsolute : me.translateURLsToAbsolute,
            expandAllBeforeExport   : me.expandAllBeforeExport,
            DPI                     : me.DPI
        }, me.exporterConfig);

        if (me.headerTpl) result.headerTpl  = me.headerTpl;

        if (me.headerTplDataFn) {
            result.headerTplDataFn          = me.headerTplDataFn;
            result.headerTplDataFnScope     = me.headerTplDataFnScope;
        }

        if (me.tpl) result.tpl              = me.tpl;
        if (me.footerTpl) result.footerTpl  = me.footerTpl;

        if (me.footerTplDataFn) {
            result.footerTplDataFn          = me.footerTplDataFn;
            result.footerTplDataFnScope     = me.footerTplDataFnScope;
        }

        return result;
    },


    // @protected
    createExporter : function (className, config) {
        var me              = this,
            exporterConfig  = me.getExporterConfig(className, config);

        if (Ext.isObject(className)) {
            return Ext.create(Ext.apply(exporterConfig, className));
        } else {
            return Ext.create(className, Ext.apply(exporterConfig, config));
        }
    },


    /**
     * Adds an exporter.
     * @param  {Sch.plugin.exporter.AbstractExporter/String} [exporter] An exporter to add.
     * Might be provided as {@link Sch.plugin.exporter.AbstractExporter} instance or as a class name string plus a configuration object:
     *
     *   plugin.registerExporter('MyExporter', { foo : 'bar' });
     *
     * Can be ommited to use configuration object only:
     *
     *   plugin.registerExporter({ xclass : 'MyExporter', foo : 'bar' });
     *
     * @param  {Object} [config]    A configuration object
     */
    registerExporter : function (exporter, config) {
        if (!(exporter instanceof Sch.plugin.exporter.AbstractExporter)) {
            exporter    = this.createExporter.apply(this, arguments);
        }

        this.exporters.push(exporter);

        this.bindExporter(exporter);
    },


    /**
     * Function that returns an exporter instance based on provided exporterId.
     *
     * @param {String} exporterId string indicating the registered exporter.
     *
     * @return {Sch.plugin.exporter.AbstractExporter} an instance of the exporter.
     */
    getExporter : function (exporterId) {
        if (!exporterId) return;

        var result  = this.exportersIndex[exporterId];
        if (result) return result;

        result      = this.exportersIndex[exporterId] = Ext.Array.findBy(this.exporters, function (i) {
            return i.getExporterId() == exporterId;
        });

        return result;
    },

    /**
     * Function that returns all registered exporters.
     *
     * @return {Object} an Object containing registered exporters.
     */
    getExporters : function () {
        return this.exporters;
    },

    /**
     * Function for setting the {@link #fileFormat} of exporting panel. Can be either `pdf` or `png`.
     *
     * @param {String} format format of the file to set. Can take either `pdf` or `png`.
     */
    setFileFormat : function (format) {
        this.fileFormat = format;
    },

    /**
     * Instantiates and shows a new {@link #exportDialogClassName} class using {@link #exportDialogConfig} config.
     * This popup should give user possibility to change export settings.
     */
    showExportDialog : function () {
        var me           = this,
            view         = me.scheduler.getSchedulingView(),
            activeDialog = me.getActiveExportDialog();
        window.appState.killExport = false;
        // only one active dialog is allowed
        if (activeDialog) {
            activeDialog.destroy();
        }

        // create export dialog window
        me.setActiveExportDialog(Ext.create(me.exportDialogClassName, Ext.apply({
            // on submit button press we launch export
            doExportFn         : me.doExport,
            doExportFnScope    : me,

            // form related configs
            startDate          : me.scheduler.getStart(),
            endDate            : me.scheduler.getEnd(),
            rowHeight          : view.timeAxisViewModel.getViewRowHeight(),
            columnWidth        : view.timeAxisViewModel.getTickWidth(),
            showDPIField       : false,
            showShowHeaderField: false,
            showHeaderField    : false,
            defaultExporter    : me.defaultExporter,
            // TODO: move "DPI" config to "exportConfig" container and get rid of this Ext.apply()
            exportConfig       : Ext.apply(me.exportConfig, { DPI : me.DPI }),
            exporters          : me.exporters,
            pageFormats        : me.getPageFormats(),
            columnPickerConfig : {
                columns : me.scheduler.lockedGrid.query('gridcolumn')
            }
        }, me.exportDialogConfig)));

        activeDialog = me.getActiveExportDialog();

        activeDialog.on('destroy', function(){
            window.appState.killExport = true;
            me.unmask();
            me.onExportDialogDestroy();
        }, me);

        // if the dialog has a progress bar onboard
        if (activeDialog.progressBar) {
            // let's track the export progress change and update it
            activeDialog.mon(me, {
                updateprogressbar : me.onExportProgress,
                scope             : me
            });
        }

        activeDialog.show();
    },


    onExportDialogDestroy : function () {
        this.setActiveExportDialog();
    },


    onExportProgress : function (value, description) {
        var activeDialog = this.getActiveExportDialog(),
            progressBar  = activeDialog && activeDialog.progressBar;

        if (progressBar) {
            progressBar.updateProgress(value);

            if (typeof description == 'string') {
                progressBar.updateText(description);
            }
        }
    },


    showError : function (error) {
        Ext.Msg.alert('', error || this.L('generalError'));
    },


    getPageFormats : function () {
        var pageSizes   = this.pageSizes,
            sizes       = [];

        Ext.Object.each(pageSizes, function (key, value) {
            sizes.push({
                width   : value.width,
                height  : value.height,
                name    : key
            });
        });

        // let's sort page sizes by width and return array of names
        return Ext.Array.map(sizes.sort(function (a, b) { return a.width - b.width; }), function (size) {
            return size.name;
        });
    },


    getExportConfig : function (config) {
        var me      = this;
        config.showFooter = me.exportConfig.showFooter;
        config.showHeader = me.exportConfig.showHeader;
        var result      = Ext.apply({
            fileFormat      : me.fileFormat,
            exporterId      : me.defaultExporter,
            beforeExport    : Ext.Function.bind(me.beforeExport, me),
            afterExport     : Ext.Function.bind(me.afterExport, me)
        }, config, me.exportConfig);

        // get effective DPI
        result.DPI              = result.DPI || me.DPI;
        // get page size for provided paper format
        result.pageSize         = Ext.apply({}, me.pageSizes[result.format]);
        // covert page size to pixels
        result.pageSize.width   *= result.DPI;
        result.pageSize.height  *= result.DPI;

        return result;
    },


    /**
     * Function performing the export operation using provided config. After getting data
     * from the scheduler an XHR request to {@link #printServer} will be made with the following JSON encoded data :
     *
     * * `html`        - array of HTML strings containing data of each page
     * * `format`      - paper size of the exported file
     * * `orientation` - orientation of the exported file
     * * `range`       - range of the exported file
     * * `fileFormat`  - file format of the exported file
     *
     * @param {Object} [conf] Config options for exporting. If not provided, {@link #exportConfig} is used. Possible parameters are :
     * @param {String} [conf.format]            - format of the exported document/image, selectable from the {@link #pageSizes} list.
     * @param {String} [conf.orientation]       - orientation of the exported document/image. Either `portrait` or `landscape`.
     * @param {String} [conf.range]             - range of the panel to be exported. Selectable from `complete`, `current`, `date`.
     * @param {Boolean} [conf.showHeader]       - boolean value defining if exported pages should have row/column numbers added in the headers.
     * @param {String} [conf.exporterId]        - string value defining which exporter to use.
     *
     * @param {Function} [callback] Optional function that will be called after successful response from export backend script.
     * @param {Function} [errback] Optional function that will be called if export backend script returns error.
     */
    doExport : function (conf, callback, errback, scope) {
        if(window.appState.killExport){
            return;
        }
        var me          = this,
            component   = me.scheduler,
            config      = me.getExportConfig(conf);

        me.callbacks     = {
            success     : callback || Ext.emptyFn,
            failure     : errback || Ext.emptyFn,
            scope       : scope || me
        };

        var exporter    = me.exporter = me.getExporter(config.exporterId);

        // if we have exporter
        if (exporter && me.fireEvent('beforeexport', component, exporter, config) !== false) {

            var activeDialog = this.getActiveExportDialog(),
                progressBar  = activeDialog && activeDialog.progressBar;

            // if export dialog is used and progress bar is there, let's make it visible
            if (progressBar) {
                progressBar.show();
            }

            me.mask();

            me.exporter.extractPages(component, config, function (pages) {
                if(window.appState.killExport){
                    return;
                }
                me.onPagesExtracted(pages, component, exporter, config);
            }, me);
        }
    },


    onPagesExtracted : function (pages, component, exporter, config) {
        this.fireEvent('updateprogressbar', 0.8, this.L('requestingPrintServer'));

        this.doRequest(pages, config);
    },


    onRowCollected : function (exporter, startIndex, endIndex, total) {
        this.fireEvent('updateprogressbar', 0.2 * (endIndex + 1) / total, Ext.String.format(this.L('fetchingRows'), endIndex + 1, total));
    },


    onPageCommit : function (exporter, page, pageNum, total) {
        var me = this;
        if(window.appState.killExport){
            return;
        }
        total   = Math.max(pageNum, total);
        !Ext.isDefined(me.pdfPostTotals) && me.setCalcTotalPdfRequest(total);
        if(me.pdfPostTotals.groupCount === (exporter.extractedPages.length) || me.pdfPostTotals.processGroupsCount === me.pdfPostTotals.groupTotalCount){
            if(me.pdfPostTotals.processGroupsCount === me.pdfPostTotals.groupTotalCount){
                if(me.pdfPostTotals.remainder != (exporter.extractedPages.length)){
                    return;
                }
                me.pdfPostTotals.processGroupsCount += 1;
            }else{
                me.pdfPostTotals.processGroupsCount += me.pdfPostTotals.groupCount;
            }

            var promise = this.postPageToPDF(exporter, page, pageNum, total);
            promise.done(function(){
                me.fireEvent('updateprogressbar', 0.2 + 0.6 * pageNum / total, Ext.String.format(me.L('builtPage'), pageNum, total));
            });
        }

    },

    postPageToPDF:function(exporter, page, pageNum, total){
        //exporter.extractedPages
        var me = this;
        var promise = $.Deferred();
        var htmlArray = [];
        $.each(exporter.extractedPages,function(index,p){
            htmlArray.push({
                html : exporter.applyPageTpl(p),
                pageNum : p.number
            });
        });
        //var html = exporter.applyPageTpl(page);
        //exporter.extractedPages.pop();
        exporter.extractedPages = [];// empty for memory

       /*Ext.Ajax.on('beforerequest', function( conn, options, eOpt){
           debugger;
            //conn.setCors(true);
        });*/
        var ajaxConfig = {
            type        : 'POST',
            url         : me.printPDFServer,
            timeout     : me.timeout,
            useDefaultXhrHeader : false,
            params      : Ext.apply({
                //html        : html,
                pages         : {array:JSON.stringify(htmlArray)}
                //pageNum     : pageNum
                //format      : me.exporter.getPaperFormat(),
                //orientation : me.exporter.exportConfig.orientation,
                //range       : me.exporter.exportConfig.range,
                //fileFormat  : me.fileFormat
            }, this.getParameters()),
            success     : function(){
                promise.resolve();
                me.pdfPostTotals.groupsComplete += 1;
                console.log(pageNum+' :page saved');
            },
            failure     : function(){
                promise.reject();
                me.pdfPostTotals.groupsComplete += 1;
                console.log(pageNum+' :page failed');
            },
            scope       : me
        };
        Ext.apply(ajaxConfig, this.getAjaxConfig(ajaxConfig));

        Ext.Ajax.request(ajaxConfig);

        return promise;
    },

    /**
     * @private
     * Method that is called after the server responds successfully.
     * The exported file is shown if {@link #openAfterExport} config is set to `true` (default).
     */
    onExportSuccess : function (result) {
        var me           = this,
            activeDialog = me.getActiveExportDialog(),
            callbacks    = me.callbacks,
            fn           = callbacks && callbacks.success,
            scope        = callbacks && callbacks.scope || me;

        //set progress to 100%
        me.fireEvent('updateprogressbar', 1);

        me.unmask();

        fn && fn.apply(scope, arguments);

        setTimeout(function() {
            me.fireEvent('hidedialogwindow', result);

            activeDialog && activeDialog.destroy();

        }, me.hideExportDialogTimeout);

        if (me.openAfterExport) {
            setTimeout(function() {
                window.open(result.url, 'ExportedPanel');
            }, 0);
        }
    },

    /**
     * @private
     * Function that is called when the exportserver returned failure. This function will fire the event showdialogerror.
     * When provided in doExport the callback failure is called.
     *
     * @param {String} message Error message provided with the failure.
     * @param {Object} Response object when the failure is a serverside failure.
     */

    onExportFailure : function (message, result) {
        var me          = this,
            dialog      = this.getActiveExportDialog(),
            callbacks   = me.callbacks,
            fn          = callbacks && callbacks.failure,
            scope       = callbacks && callbacks.scope || me;

        fn && fn.call(scope, message);

        me.fireEvent('showdialogerror', dialog, message, result);

        me.showError(message);

        me.unmask();
    },

    /**
     * @protected
     * Launches a request to the {@link #printServer print server}.
     * On return {@link #onRequestSuccess} or {@link #onRequestFailure} will be called with the returned response.
     * @param {Array} exportedPages An array of paginated component content.
     * @param {Object} config Export configuratin.
     */
    doRequest:function(exportedPages, config){
        var me          = this,
            component   = me.scheduler;
        if(window.appState.killExport){
            return;
        }
        if (!me.test && !me.debug) {

            if (me.printServer) {

                var ajaxConfig = {
                    type        : 'POST',
                    url         : me.printServer,
                    timeout     : me.timeout,
                    useDefaultXhrHeader : false,
                    params      : Ext.apply({
                        format      : me.exporter.getPaperFormat(),
                        orientation : config.orientation.substr(0,1).toUpperCase()+config.orientation.substr(1),
                        range       : config.range,
                        DPI         : me.DPI,
                        fileFormat  : me.fileFormat
                    }, this.getParameters()),
                    headers     : {
                        //'X-Requested-With':'XMLHttpRequest'
                    },
                    success     : me.onRequestSuccess,
                    failure     : me.onRequestFailure,
                    scope       : me
                };

                Ext.apply(ajaxConfig, this.getAjaxConfig(ajaxConfig));

                if(me.pdfPostTotals.groupsComplete ===  me.pdfPostTotals.groupsTotal){
                    Ext.Ajax.request(ajaxConfig);
                    delete me.pdfPostTotals;
                }else{
                    window.doRequestId = window.setInterval(function(){

                        if(me.pdfPostTotals.groupsComplete ===  me.pdfPostTotals.groupsTotal){
                            window.clearInterval(window.doRequestId);
                            Ext.Ajax.request(ajaxConfig);
                            delete me.pdfPostTotals;
                        }else if(window.appState.killExport){
                            window.clearInterval(window.doRequestId);
                            return;
                        }
                    },500);
                }


            } else {
                me.onExportFailure('Print server URL is not defined, please specify printServer config');
            }

        } else {

            if (me.debug) {
                var pages   = exportedPages || [];

                for (var i = 0, l = pages.length; i < l; i++) {
                    var w = window.open();

                    w.document.write(pages[i].html);
                    w.document.close();
                }
            }

            me.onExportSuccess(me.testResponse || { success : true, url : 'foo', htmlArray : exportedPages });
        }
    },


    __doRequestSaved : function (exportedPages, config) {

        var me          = this,
            component   = me.scheduler;

        if (!me.test && !me.debug) {

            if (me.printServer) {

                var ajaxConfig = {
                    type        : 'POST',
                    url         : me.printServer,
                    timeout     : me.timeout,
                    params      : Ext.apply({
                        html        : {
                            array : toJson(exportedPages)
                        },
                        startDate   : component.getStartDate(),
                        endDate     : component.getEndDate(),
                        format      : me.exporter.getPaperFormat(),
                        orientation : config.orientation,
                        range       : config.range,
                        fileFormat  : me.fileFormat
                    }, this.getParameters()),
                    success     : me.onRequestSuccess,
                    failure     : me.onRequestFailure,
                    scope       : me
                };

                Ext.apply(ajaxConfig, this.getAjaxConfig(ajaxConfig));

                Ext.Ajax.request(ajaxConfig);

            } else {
                me.onExportFailure('Print server URL is not defined, please specify printServer config');
            }

        } else {

            if (me.debug) {
                var pages   = exportedPages || [];

                for (var i = 0, l = pages.length; i < l; i++) {
                    var w = window.open();

                    w.document.write(pages[i].html);
                    w.document.close();
                }
            }

            me.onExportSuccess(me.testResponse || { success : true, url : 'foo', htmlArray : exportedPages });
        }

        function toJson(arrayValues){
            for(var i=0;i<arrayValues.length;i++){
                arrayValues[i] = JSON.stringify(arrayValues[i]);
            }
            return '['+arrayValues.join(',')+']';
        }
    },

    /**
     * @protected
     * Runs on request succesful completion.
     * @param  {Object} response Server response.
     */
    onRequestSuccess : function (response) {
        var me  = this,
            result;

        try {
            result = Ext.JSON.decode(response.responseText);
        } catch (e) {
            me.onExportFailure('Wrong server response received');
            return;
        }

        if (result.success) {
            me.onExportSuccess(result);

        } else {
            me.onExportFailure(result.msg, result);
        }
    },

    /**
     * @protected
     * Runs on request failure.
     * @param  {Object} response Server response.
     */
    onRequestFailure : function (response) {
        var me  = this,
            msg = response.status === 200 ? response.responseText : response.statusText;

        me.onExportFailure(msg, response);
    },

    /**
     * @template
     * This method can be used to apply additional parameters to the 'params' property of the export {@link Ext.Ajax XHR} request.
     * By default this method returns an empty object.
     * @return {Object}
     */
    getParameters : function () {
        return {};
    },

    /**
     * This method can be used to return any extra configuration properties applied to the {@link Ext.Ajax#request} call.
     * @template
     * @param {Object} config The proposed Ajax configuration settings. You may read any properties from this object, but modify it at your own risk.
     * @return {Object}
     */
    getAjaxConfig : function (config) {
        return {};
    },

    /**
     * Returns the active export dialog window instance.
     * @return {Sch.widget.ExportDialog} Active export dialog window instance.
     */
    getActiveExportDialog : function () {
        return this.win;
    },


    setActiveExportDialog : function (dialog) {
        this.win = dialog;
    },

    /*
     * @private
     * Mask the body, hiding panel to allow changing it's parameters in the background.
     */
    mask : function () {
        var mask = Ext.getBody().mask();
        mask.addCls('sch-export-mask');
    },

    //Private.
    unmask : function () {
        Ext.getBody().unmask();
    },

    destroy : function () {
        this.callParent(arguments);

        if (this.getActiveExportDialog()) {
            this.getActiveExportDialog().destroy();
        }
    },

    /**
     * @private
     * This Calc will be used to reduce pdf posts to server by grouping pages together minimizing network latency
     * calc: Math.floor(Math.sqrt(pageCount))
     **/
    setCalcTotalPdfRequest:function(pageCount){
        var me = this;
        var calGroupTotal = Math.floor(Math.sqrt(pageCount));
        calGroupTotal  = calGroupTotal > 10 ? 10 : calGroupTotal;//max export per request to 10 pages.
        var regularGroupTotalCount = calGroupTotal * calGroupTotal;
        var remainderTotalCount = Math.abs(regularGroupTotalCount - pageCount);
        me.pdfPostTotals          = {
                    total                   : pageCount,
                    processGroupsCount      : 0, //count how many groups process to decide if remainder should be evaluated
                    groupCount              : calGroupTotal,// wait for this many pages before processing create_htmlToPdf
                    groupsComplete          : 0,// count how may groups have completed, will equal groupsTotal
                    groupsTotal             : remainderTotalCount > 0 ? calGroupTotal + 1 : calGroupTotal, //when done wait for groupsComplete count before toPdf
                    groupTotalCount         : regularGroupTotalCount,// total number of pages squared
                    remainder               : remainderTotalCount,// remainder after squared from total pages
                    hasRemainder            : remainderTotalCount > 0//check if has remainder
        };
    }
});



/*
 var htmlLength = html.length;
 //var htmlEnd = htmlLength-3;
 //var html2 = html.substring(0, htmlLength-3);
 var htmlObject = html;
 var ajaxConfig = {};
 var main = MyApp.app.getController('Main');
 var url = window.server+'topdf/create_htmlPage.php';
 var now = main.getTime();
 var toPdf = window.server+'topdf/toPdf.php?now='+now;
 ajaxConfig = {
 method: 'POST',
 url: url,
 async: false,
 params: {
 html : htmlObject,
 page : page,
 now: now
 },
 callback: function () {
 console.log('Page: '+page);
 },
 success: function (res) {
 },
 failure: function (res) {
 }
 };
 Ext.Ajax.request(ajaxConfig);
* */
