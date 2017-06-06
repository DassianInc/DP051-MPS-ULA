Ext.define('DGnt.plugin.exporter.MultiPageHorizontal', {

    extend : 'DSch.plugin.exporter.MultiPageHorizontal',

    getPanelHTML : function (range, calculatedPages){
        var me              = this,
            ganttView       = me.component.getSchedulingView(),
            depView         = ganttView.dependencyView,
            tplData         = depView.painter.getDependencyTplData(ganttView.dependencyStore.getRange()),
            dependencies    = depView.lineTpl.apply(tplData);

        return {
            dependencies        : dependencies,
            timeColumnWidth     : calculatedPages.timeColumnWidth,
            rowHeight           : calculatedPages.rowHeight
        };
    },

    /*
     * @private
     * Resizes panel elements to fit on the print page. This has to be done manually in case of wrapping Gantt
     * inside another, smaller component. This function also adds dependencies to the output html.
     */
    resizePanelHTML : function (HTML) {
        var frag             = this.callParent(arguments),
            normalRowsDeps   = frag.select('.sch-dependencyview-ct').first(),
            splitterHTML     = frag.select('.' + Ext.baseCSSPrefix + 'splitter').first(),
            left             = 0,
            top              = 0,
            lockedColumnsLen, i;

        var get             = function (s) { var el = frag.select('#' + s, true).first(); return el && el.dom; };

        // if we have skipped ticks before first visible one then we will shift left coordinate of dependencies
        left = HTML.skippedColsBefore * HTML.timeColumnWidth;

        if (HTML.k) {
            top             = this.getRowsRangeHeight(0, HTML.rowPagesBounds[HTML.k][0], HTML.rowHeights, HTML.rowHeight);
        }

        i                   = HTML.i;

        normalRowsDeps.dom.innerHTML = HTML.dependencies;

        //move the dependencies div to match the position of the dependency lines
        normalRowsDeps.applyStyles({
            top     : -top + 'px',
            left    : -left + 'px'
        });

        splitterHTML && splitterHTML.setHeight('100%');

        // hiding dependencies
        var normalGrid  = this.component.normalGrid,
            tableWidth  = normalGrid.el.down('.' + Ext.baseCSSPrefix + 'grid-table').getWidth(),
            id          = normalGrid.getView().id,
            dFrag, el;

        //HACK for resizing in IE6/7 and Quirks mode. Requires operating on a document fragment with DOM methods
        //instead of using unattached div and Ext methods.
        if (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) {
            dFrag   = document.createDocumentFragment();

            dFrag.appendChild(frag.dom);

            id      = (dFrag.getElementById ? '' : '#') + id;

            //IE removed getElementById from documentFragment in later browsers
            el      = (dFrag.getElementById || dFrag.querySelector)(id);

        } else {
            el      = frag.select('#' + id).first().dom;
        }

        el.style.width = tableWidth + 'px';

        //remove scrollbars
        var normalView =  get(normalGrid.getView().id);
        normalView.style.overflow = 'hidden';

        // if we used documentFragment pull HTML from it
        if (dFrag) {
            frag.dom.innerHTML = dFrag.firstChild.innerHTML;
        }

        return frag;
    },

    getRealSize : function(){
        var realSize = this.callParent(arguments);

        realSize.width += this.component.down('splitter').getWidth();

        return realSize;
    },

    getRowsRangeHeight : function (from, to, rowHeights, normalHeight) {
        rowHeights      = rowHeights || this.getRowHeights();
        normalHeight    = normalHeight || this.getRowHeight();

        var result      = 0;

        for (var i = from; i < to; i++) {
            result += rowHeights.hasOwnProperty(i) ? rowHeights[i] : normalHeight;
        }

        return result;
    }

});

Ext.define('DGnt.plugin.exporter.SinglePage', {

    extend : 'DSch.plugin.exporter.SinglePage',

    panelHTML : undefined,

    constructor : function (config) {

        this.callParent(arguments);
    },

    getPanelHTML : function (range, calculatedPages) {
        var ganttView       = this.component.getSchedulingView(),
            depView         = ganttView.dependencyView,
            tplData         = depView.painter.getDependencyTplData(ganttView.dependencyStore.getRange()),
            dependencies    = depView.lineTpl.apply(tplData);

        return {
            dependencies        : dependencies,
            singlePageExport    : true,
            lockedColumnPages   : undefined
        };
    },

    /*
     * @private
     * Function returning full width and height of both grids.
     *
     * @return {Object} values Object containing width and height properties.
     */
    getRealSize : function(){
        var realSize = this.callParent(arguments);

        realSize.width += this.component.down('splitter').getWidth();

        return realSize;
    },

    /*
     * @private
     * Resizes panel elements to fit on the print page. This has to be done manually in case of wrapping Gantt
     * inside another, smaller component. This function also adds dependencies to the output html.
     */
    resizePanelHTML : function (HTML) {
        var frag             = this.callParent(arguments),
            normalRowsDeps   = frag.select('.sch-dependencyview-ct').first(),
            splitterHTML     = frag.select('.' + Ext.baseCSSPrefix + 'splitter').first(),
            left             = 0,
            top              = 0,
            lockedColumnsLen, i;

        // if we have skipped ticks before first visible one then we will shift left coordinate of dependencies
        left = HTML.skippedColsBefore * HTML.timeColumnWidth;

        normalRowsDeps.dom.innerHTML = HTML.dependencies;

        //move the dependencies div to match the position of the dependency lines
        normalRowsDeps.applyStyles({
            top     : -top + 'px',
            left    : -left + 'px'
        });

        splitterHTML && splitterHTML.setHeight('100%');

        // hiding dependencies
        var normalGrid  = this.component.normalGrid,
            tableWidth  = normalGrid.el.down('.' + Ext.baseCSSPrefix + 'grid-table').getWidth(),
            id          = normalGrid.getView().id,
            dFrag, el;

        //HACK for resizing in IE6/7 and Quirks mode. Requires operating on a document fragment with DOM methods
        //instead of using unattached div and Ext methods.
        if (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) {
            dFrag   = document.createDocumentFragment();

            dFrag.appendChild(frag.dom);

            id      = (dFrag.getElementById ? '' : '#') + id;

            //IE removed getElementById from documentFragment in later browsers
            el      = (dFrag.getElementById || dFrag.querySelector)(id);

        } else {
            el      = frag.select('#' + id).first().dom;
        }

        el.style.width = tableWidth + 'px';

        // if we used documentFragment pull HTML from it
        if (dFrag) {
            frag.dom.innerHTML = dFrag.firstChild.innerHTML;
        }

        return frag;
    }

});

Ext.define('DGnt.plugin.Export', {
    extend              : 'DSch.plugin.Export',

    alias               : 'plugin.gantt_dassian_export',
    alternateClassName  : 'DGnt.plugin.PdfExport',

    singlePageExporterClass : 'DGnt.plugin.exporter.SinglePage',

    multiPageExporterClass : 'DGnt.plugin.exporter.MultiPageHorizontal',

    //override added to turn off vertical resizer in the dialog
    showExportDialog    : function() {
        this.exportDialogConfig.scrollerDisabled = true;

        this.callParent(arguments);
    }

});