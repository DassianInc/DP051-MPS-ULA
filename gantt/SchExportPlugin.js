Ext.define('DSch.plugin.exporter.AbstractExporter', {

    extend : 'Ext.util.Observable',

    pageSizes : {
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
            width   : 11.5,
            height  : 19
        },
        Legal   : {
            width   : 8.5,
            height  : 14
        }
    },

    paperWith : 0,

    paperHeight : 0,

    printHeight : 0,

    calculatedPages : undefined,

    constructor  : function (config) {

        this.callParent(arguments);

        if (!this.tpl) {
            this.tpl = new Ext.XTemplate('<!DOCTYPE html>' +
                '<html class="' + Ext.baseCSSPrefix + 'border-box {htmlClasses}">' +
                '<head>' +
                '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />' +
                '<title>{column}/{row}</title>' +
                '{styles}' +
                '</head>' +
                '<body class="' + Ext.baseCSSPrefix + 'webkit sch-export {bodyClasses}">' +
                '<tpl if="showHeader">' +
                '<div class="sch-export-header" style="width:{totalWidth}px"><h2>{column}/{row}</h2></div>' +
                '</tpl>' +
                '<div class="{componentClasses}" style="height:{bodyHeight}px; width:{totalWidth}px; position: relative !important">' +
                '{HTML}' +
                '</div>' +
                '</body>' +
                '</html>',
                {
                    disableFormats: true
                }
            );
        }

        this.styles = this.getStylesheets();
    },

    setPaperSize : function () {

        var settings = this.settings;

        //size of paper we will be printing on. 72 DPI used by phantomJs generator
        //take orientation into account
        if (settings.orientation === 'landscape') {
            this.paperWidth = this.pageSizes[settings.format].height * this.DPI;
            this.paperHeight = this.pageSizes[settings.format].width * this.DPI;
        } else {
            this.paperWidth = this.pageSizes[settings.format].width * this.DPI;
            this.paperHeight = this.pageSizes[settings.format].height * this.DPI;
        }

        var pageHeaderHeight = 41;

        this.printHeight = Math.floor(this.paperHeight) - this.headerHeight - (settings.showHeader ? pageHeaderHeight : 0);
    },

    getFormat  :function () {},

    getExportJsonHtml : function (range) {},

    setExportRange : function (config) {

        var me           = this,
            component    = me.component,
            view         = component.getSchedulingView(),
            skippedColsBefore   = 0,
            skippedColsAfter    = 0,
            ticks           = component.timeAxis.getTicks(),
            timeColumnWidth = view.timeAxisViewModel.getTickWidth();

        view.timeAxisViewModel.suppressFit = true;

        // if we export a part of scheduler
        if (config.range !== 'complete') {
            var newStart, newEnd;

            switch (config.range) {
                case 'date' :
                    newStart    = new Date(config.dateFrom);
                    newEnd      = new Date(config.dateTo);

                    // ensure that specified period has at least a day
                    if (Sch.util.Date.getDurationInDays(newStart, newEnd) < 1) {
                        newEnd  = Sch.util.Date.add(newEnd, Sch.util.Date.DAY, 1);
                    }

                    newStart    = Sch.util.Date.constrain(newStart, component.getStart(), component.getEnd());
                    newEnd      = Sch.util.Date.constrain(newEnd, component.getStart(), component.getEnd());
                    break;

                case 'current' :
                    var visibleSpan = view.getVisibleDateRange();
                    newStart        = visibleSpan.startDate;
                    newEnd          = visibleSpan.endDate || view.timeAxis.getEnd();

                    if (config.cellSize) {
                        // will change columns width to provided value
                        timeColumnWidth = config.cellSize[0];

                        // change the row height only if value is provided
                        if (config.cellSize.length > 1) {
                            view.setRowHeight(config.cellSize[1]);
                        }
                    }
                    break;
            }

            // set specified time frame
            component.setTimeSpan(newStart, newEnd);

            var startTick   = Math.floor(view.timeAxis.getTickFromDate(newStart));
            var endTick     = Math.floor(view.timeAxis.getTickFromDate(newEnd));

            ticks       = component.timeAxis.getTicks();
            // filter only needed ticks
            ticks       = Ext.Array.filter(ticks, function (tick, index) {
                if (index < startTick) {
                    skippedColsBefore++;
                    return false;
                } else if (index > endTick) {
                    skippedColsAfter++;
                    return false;
                }
                return true;
            });
        }

        return {
            newStart : newStart,
            newEnd : newEnd,
            startTick : startTick,
            endTick : endTick,
            ticks  : ticks,
            skippedColsBefore: skippedColsBefore,
            skippedColsAfter : skippedColsAfter,
            timeColumnWidth : timeColumnWidth
        };

    },

    /**
     * @protected
     * Get links to the stylesheets of current page.
     */
    getStylesheets : function() {
        var translate   = this.translateURLsToAbsolute,
            styleSheets = Ext.getDoc().select('link[rel="stylesheet"]'),
            ctTmp       = Ext.get(Ext.core.DomHelper.createDom({
                tag : 'div'
            })),
            stylesString;

        styleSheets.each(function(s) {
            var node    = s.dom.cloneNode(true);
            // put absolute URL to node `href` attribute
            translate && node.setAttribute('href', s.dom.href);
            ctTmp.appendChild(node);
        });

        stylesString = ctTmp.dom.innerHTML + '';

        return stylesString;
    },

    /*
     * @private
     * Hide rows from the panel that are not needed on current export page by adding css class to them.
     *
     * @param {Number} visibleFrom Start index of rows that have to be visible.
     * @param {Number} visibleTo End index of rows that have to be visible.
     * @param {Number} page Current page number.
     */
    hideRows : function (visibleFrom, visibleTo) {
        var scheduler   = this.component,
            lockedRows  = scheduler.lockedGrid.view.getNodes(),
            normalRows  = scheduler.normalGrid.view.getNodes();

        for (var i = 0, l = normalRows.length; i < l; i++) {
            if (i < visibleFrom || i > visibleTo) {
                lockedRows[i].className += ' sch-remove';
                normalRows[i].className += ' sch-remove';
            }
        }
    },

    /*
     * @private
     * Unhide all rows of the panel by removing the previously added css class from them.
     */
    showRows : function () {
        this.component.getEl().select(this.view.getItemSelector()).each(function(el){
            el.removeCls('sch-remove');
        });
    },

    getRowPagesBounds : function (printHeight, rowHeights) {
        var me              = this,
            component       = me.component,
            view            = me.view,
            nodes           = view.getNodes();

        var result          = [],
            normalHeight    = this.getRowHeight(),
            pageHeight      = 0,
            pageStart       = 0,
            pageEnd         = 0;

        for (var i = 0, l = nodes.length; i < l; i++) {
            var rowHeight   = rowHeights.hasOwnProperty(i) ? rowHeights[i] : normalHeight;

            pageHeight      += rowHeight;

            if (pageHeight > printHeight) {
                result.push([ pageStart, pageEnd ]);
                pageHeight  = rowHeight;
                pageStart   = i;
            }

            pageEnd     = i;
        }

        result.push([ pageStart, pageEnd ]);

        return result;
    },

    getRowHeight : function () {
        return this.view.timeAxisViewModel.getViewRowHeight();
    },

    getRowHeights : function () {
        var component       = this.component,
            view            = this.view,
            nodes           = view.getNodes(),
            normalHeight    = this.getRowHeight(),
            result  = {};

        for (var i = 0, l = nodes.length; i < l; i++) {
            var height  = Ext.fly(nodes[i]).getHeight();
            if (height != normalHeight) {
                result[i]   = height;
            }
        }

        return result;
    },

    getPanelHTML : function (range, calculatedPages) {
        return {};
    },

    /*
     * @private
     * Function returning full width and height of both grids.
     *
     * @return {Object} values Object containing width and height properties.
     */
    getRealSize : function() {
        var component     = this.component,
            headerHeight  = component.normalGrid.headerCt.getHeight(),
            tableSelector = '.' + Ext.baseCSSPrefix + (Ext.versions.extjs.isLessThan('5.0') ? 'grid-table' : 'grid-item-container'),
            height        = (headerHeight + component.lockedGrid.getView().getEl().down(tableSelector).getHeight()),
            width         = (component.lockedGrid.headerCt.getEl().first().getWidth() +
            component.normalGrid.body.down(tableSelector).getWidth());

        return {
            width   : width,
            height  : height
        };
    },

    /*
     * @private
     * Resizes panel elements to fit on the print page. This has to be done manually in case of wrapping Scheduler
     * inside another, smaller component.
     *
     * @param {Object} HTML Object with html of panel, and row & column number.
     *
     * @return {Object} frag Ext.dom.Element with resized html.
     */
    resizePanelHTML: function (HTML) {
        //create empty div that will temporarily hold our panel current HTML
        var frag        = Ext.get(Ext.core.DomHelper.createDom({
                tag     : 'div',
                html    : HTML.dom
            })),
            component   = this.component,
            lockedGrid  = component.lockedGrid,
            normalGrid  = component.normalGrid;

        frag.el.select('.sch-remove').remove();


        var get             = function (s) { var el = frag.select('#' + s, true).first(); return el && el.dom; },
            elapseWidth     = function (el) { if (el) el.style.width  = '100%'; },
            elapseHeight    = function (el) { if (el) el.style.height = '100%'; },
            dFrag;


        //HACK for resizing in IE6/7 and Quirks mode. Requires operating on a document fragment with DOM methods
        //instead of using unattached div and Ext methods.
        if (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks) {
            dFrag       = document.createDocumentFragment();

            var prefix  = dFrag.getElementById ? '' : '#';
            //IE removed getElementById from documentFragment in later browsers
            var fn      = (dFrag.getElementById || dFrag.querySelector);

            get         = function (s) { return fn(prefix + s); };

            dFrag.appendChild(frag.dom);
        }

        // we elapse some elements width and/or height

        var lockedElements  = [
            get(component.id + '-targetEl'),
            get(component.id + '-innerCt'),
            get(lockedGrid.id),
            get(lockedGrid.body.id),
            get(lockedGrid.view.el.id)
        ];

        Ext.Array.each(lockedElements, elapseHeight);

        elapseWidth(lockedElements[0]);
        elapseWidth(lockedElements[1]);

        elapseWidth(get(normalGrid.headerCt.id));

        Ext.Array.each([
            get(normalGrid.id),
            get(normalGrid.body.id),
            get(normalGrid.getView().id)
        ], function(el) {
            if (el) {
                el.style.height = '100%';
                el.style.width  = '100%';
            }
        });

        // if we used documentFragment pull HTML from it
        if (dFrag) {
            frag.dom.innerHTML = dFrag.firstChild.innerHTML;
        }

        return frag;
    }
});

Ext.define('DSch.plugin.exporter.MultiPageHorizontal', {

    extend  : 'DSch.plugin.exporter.AbstractExporter',

    constructor : function (config) {

        this.callParent(arguments);
        this.setPaperSize();
    },

    /**
     * @private
     * Function calculating amount of pages in vertical/horizontal direction in the exported document/image.
     *
     * @param {Array} ticks Ticks from the TickStore.
     * @param {Number} timeColumnWidth Width of a single time column.
     * @return {Object} valuesObject Object containing calculated amount of pages, rows and columns.
     */
    calculatePages : function (range) {
        var me                  = this,
            component           = me.component,
            lockedGrid          = component.lockedGrid,
            rowHeight           = this.getRowHeight(),
            lockedHeader        = lockedGrid.headerCt,
            lockedGridWidth     = lockedHeader.getEl().first().getWidth(),
            lockedColumnPages   = null;

        var customRowHeights    = me.getRowHeights();

        return {
            rowHeights          : customRowHeights,
            rowPagesBounds      : me.getRowPagesBounds(me.printHeight, customRowHeights),
            // amount of pages vertically
            rowPages            : Math.ceil((me.getRealSize().height - component.normalGrid.headerCt.getHeight()) / me.printHeight),
            timeColumnWidth     : range.timeColumnWidth,
            lockedGridWidth     : lockedGridWidth,
            rowHeight           : rowHeight,
            panelHTML           : {}
        };
    },

    getFormat : function () {
        return this.settings.format;
    },

    getExportJsonHtml : function (range, callback) {

        var me = this,
            component    = me.component,
            view         = me.view,
            styles       = me.styles,
            normalGrid   = component.normalGrid,
            lockedGrid   = component.lockedGrid,
            htmlArray   = [];

        var ticks = range.ticks,
            timeColumnWidth = range.timeColumnWidth;

        me.sizeToFit(range);

        //calculate amount of pages in the document
        this.calculatedPages = me.calculatePages(range);
        Ext.apply(this.calculatedPages.panelHTML, me.getPanelHTML(range, this.calculatedPages));

        var calculatedPages     = this.calculatedPages,
            bodyClasses         = this.bodyClasses,
            componentClasses    = this.componentClasses,
            rowPagesBounds      = calculatedPages.rowPagesBounds,
            rowPages            = calculatedPages.rowPages,
            panelHTML           = calculatedPages.panelHTML,
            printHeight         = me.printHeight,
            headerHeight        = me.headerHeight,
            html;

        var task = undefined;

        var createExportPage =  function (page) {
            //hide rows that are not supposed to be visible on the current page

            if (page < rowPagesBounds.length) {

                me.hideRows(rowPagesBounds[page][0], rowPagesBounds[page][1]);

                panelHTML.dom = component.body.dom.innerHTML;
                panelHTML.k = page;
                panelHTML.i = 0;
                panelHTML.rowPagesBounds = rowPagesBounds;
                panelHTML.rowHeights = calculatedPages.rowHeights;
                panelHTML.rowHeight = calculatedPages.rowHeight;

                var readyHTML = me.resizePanelHTML(panelHTML);

                html = me.tpl.apply(Ext.apply({
                    bodyClasses : bodyClasses,
                    bodyHeight : printHeight + headerHeight,
                    componentClasses : componentClasses,
                    styles : styles,
                    showHeader : me.settings.showHeader,
                    HTML : readyHTML.dom.innerHTML,
                    totalWidth : me.paperWidth,
                    headerHeight : headerHeight,
                    column : 1,
                    row : page + 1
                }));

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
                if (page >= rowPagesBounds.length-1) {
                    console.log('Last Page: '+page);
                }
                //htmlArray.push(htmlObject);
                //unhide all rows
                me.showRows();
                me.exporter.fireEvent('updateprogressbar', ((page+1) / rowPagesBounds.length) * 1.0);
                task.delay(10, undefined, undefined, [page+1]);
            }
            else {
                callback.call(me.exporter, htmlObject);
            }
        };
        var task =new Ext.util.DelayedTask(createExportPage, this, [0]);
        task.delay(10);
    },
    sizeToFit : function (range) {

        var me = this,
            component    = me.component,
            view         = me.view,
            normalGrid   = component.normalGrid,
            lockedGrid   = component.lockedGrid;

        var realSize  = me.getRealSize();

        var ticks = range.ticks,
            timeColumnWidth = range.timeColumnWidth;

        component.setTimeSpan(ticks[0].start, ticks[ticks.length-1].end);

        var currentLockedWidth = me.getVisibleColumnWidth();
        var currentTimeLineWidth = ticks.length * timeColumnWidth;

        var visibleColumns = this.restoreSettings.visibleColumns;
        var cols = visibleColumns.length;
        if (cols > 4) {
            var lockedWidth = Math.floor(me.paperWidth*0.65);
            var normalWidth = Math.floor(me.paperWidth*0.65);
            var tickWidth = Math.floor((normalWidth / ticks.length)*1.55);
            component.setWidth(me.paperWidth);
            normalGrid.setWidth(me.paperWidth*0.65);
            lockedGrid.setWidth(me.paperWidth*0.65);
            component.setTimeColumnWidth(me.paperWidth*0.35);
            view.timeAxisViewModel.setTickWidth(tickWidth*0.35);
            me.fitLockedColumnWidth(me.paperWidth*0.65);
        } else {
            var lockedWidth = Math.floor(me.paperWidth*0.5);
            var normalWidth = Math.floor(me.paperWidth*0.5);
            var tickWidth = Math.floor((normalWidth / ticks.length)*2);
            component.setWidth(me.paperWidth);
            normalGrid.setWidth(me.paperWidth/2);
            lockedGrid.setWidth(me.paperWidth/2);
            me.fitLockedColumnWidth(me.paperWidth/2);
            component.setTimeColumnWidth(me.paperWidth/2);
            view.timeAxisViewModel.setTickWidth(tickWidth/2);
        }

        var rowHeight = ( tickWidth / timeColumnWidth) * me.getRowHeight();

        rowHeight = rowHeight < 20 ? 20 : rowHeight;

        me.view.setRowHeight(rowHeight);

        switch (true) {
            case (cols > 5 && cols < 9):
                Ext.select('.sch-gantt-label-right').setStyle({
                    'font-size':'0.50rem',
                    'margin-left':'1px',
                    'padding':'1px',
                    'font-family':'Verdana'
                });
                Ext.select('.sch-gantt-label-left').setStyle({
                    'font-size':'0.50rem',
                    'margin-right':'4px',
                    'padding':'1px',
                    'font-family':'Verdana'
                });
                Ext.select('.sch-simple-timeheader').setStyle({
                    'font-size':'0.50rem',
                    'font-family':'Verdana'
                });
                Ext.select('.x-grid-cell-inner').setStyle({
                    'font-size':'0.50rem',
                    'font-weight':'600',
                    'font-family':'Verdana',
                    'padding':'1px'
                });
                Ext.select('.x-column-header-text').setStyle({
                    'font-size':'0.50rem',
                    'white-space':'normal',
                    'font-family':'Verdana',
                    'font-weight':'bold'
                });
                Ext.select('.x-tree-elbow-img').setStyle({
                    'width':'3px',
                    'height':'20px',
                    'margin-right':'0'
                });
                Ext.select('.sch-gantt-labelct').setStyle({
                    'padding':'2px'
                });
                Ext.select('.sch-gantt-labelct-right').setStyle({
                    'margin-left':'1px'
                });
                Ext.select('.sch-gantt-labelct-left').setStyle({
                    'width':'599px'
                });
                break;
            case (cols > 8 && cols < 15):
                Ext.select('.x-grid-cell-inner').setStyle({
                    'font-size':'0.47rem',
                    'font-family':'Verdana',
                    'font-weight':'600'
                });
                Ext.select('.x-column-header-text').setStyle({
                    'font-size':'0.50rem',
                    'font-family':'Verdana',
                    'white-space':'normal',
                });
                Ext.select('.sch-gantt-label-left').setStyle({
                    'font-size':'0.50rem',
                    'font-family':'Verdana',
                    'margin-right':'3px',
                    'padding':'1px'
                });
                Ext.select('.sch-gantt-label-right').setStyle({
                    'font-size':'0.50rem',
                    'margin-left':'3px',
                    'font-family':'Verdana',
                    'padding':'1px'
                });
                Ext.select('.sch-simple-timeheader').setStyle({
                    'font-size':'0.50rem',
                    'font-weight':'bold',
                    'font-family':'Verdana'
                });
                Ext.select('.x-tree-elbow-img').setStyle({
                    'width':'4px',
                    'height':'20px',
                    'margin-right':'0'
                });
                Ext.select('.sch-gantt-labelct').setStyle({
                    'padding':'2px'
                });
                Ext.select('.sch-gantt-labelct-right').setStyle({
                    'margin-left':'1px'
                });
                Ext.select('.sch-gantt-labelct-left').setStyle({
                    'width':'599px'
                });
                break;
            case (cols > 14 && cols < 20):
                Ext.select('.x-grid-cell-inner').setStyle({
                    'font-size':'0.425rem',
                    'font-weight':'600',
                    'padding':'1px'
                });
                Ext.select('.x-column-header-text').setStyle({
                    'font-size':'0.40rem',
                    'font-family':'Verdana',
                    'font-weight':'bold',
                    'white-space':'normal'
                });
                Ext.select('.sch-gantt-label-left').setStyle({
                    'font-size':'0.40rem',
                    'margin-right':'3px',
                    'font-weight':'bold'
                });
                Ext.select('.sch-gantt-label-right').setStyle({
                    'font-size':'0.40rem',
                    'margin-left':'3px',
                    'font-weight':'bold'
                });
                Ext.select('.sch-simple-timeheader').setStyle({
                    'font-size':'0.40em',
                    'font-weight':'bold'
                });
                Ext.select('.x-tree-elbow-img').setStyle({
                    'width':'3px',
                    'height':'20px',
                    'margin-right':'0'
                });
                Ext.select('.sch-gantt-labelct-right').setStyle({
                    'margin-left':'1px'
                });
                Ext.select('.sch-gantt-labelct-left').setStyle({
                    'width':'599px'
                });
                break;
            default:
                Ext.Msg.alert('Print Error','20 columns maximum available for printing to PDF.');
        }
    },

    getVisibleColumnWidth : function () {
        var me = this,
            lockedGrid    = me.component.lockedGrid,
            width = 0;

        var visibleColumns = this.restoreSettings.visibleColumns;

        for (var i = 0; i < visibleColumns.length; i++) {
            width += visibleColumns[i].width;
        }

        return width;
    },

    fitLockedColumnWidth : function (totalWidth) {
        var me = this;
        var visibleColumns = this.restoreSettings.visibleColumns;
        var currentLockedWidth = me.getVisibleColumnWidth();
        var lockedGrid = me.component.lockedGrid;
        var ganttConfigStore = Ext.getStore('GanttConfigStoreXml');
        var cols = visibleColumns.length;
        var printCls = ganttConfigStore.findExact('name','printCls');
        me.fireEvent('updateprogressbar', 0.3);

        if(visibleColumns.length > 3) {
            for (var i = 0; i < visibleColumns.length; i++) {
                var width = visibleColumns[i].column.getWidth()/currentLockedWidth;
                width = totalWidth*width;
                visibleColumns[i].column.setWidth(width);
            }
            this.restoreSettings.restoreColumnWidth = true;
        }
    }
});

Ext.define('DSch.plugin.exporter.SinglePage', {

    extend  : 'DSch.plugin.exporter.AbstractExporter',

    constructor : function (config) {

        this.callParent(arguments);
    },

    getFormat : function () {

        var me        = this,
            realSize  = me.getRealSize();
        width     = Ext.Number.toFixed(realSize.width / me.DPI, 1);
        height    = Ext.Number.toFixed(realSize.height / me.DPI, 1);

        return width+'in*'+height+'in';
    },

    getExportJsonHtml : function (range, callback) {

        var me = this,
            component = me.component,
            bodyClasses = me.bodyClasses,
            componentClasses = me.componentClasses,
            view = me.view,
            styles = me.styles,
            normalGrid = component.normalGrid,
            lockedGrid = component.lockedGrid,
            headerHeight = normalGrid.headerCt.getHeight(),
            htmlArray = [],
            panelHTML = me.getPanelHTML(),
            html;

        var ticks = range.ticks,
            timeColumnWidth = range.timeColumnWidth;

        component.setTimeSpan(ticks[0].start, ticks[ticks.length - 1].end);
        lockedGrid.setWidth(component.lockedGrid.headerCt.getEl().first().getWidth());
        component.setTimeColumnWidth(timeColumnWidth);
        view.timeAxisViewModel.setTickWidth(timeColumnWidth);

        var task = undefined;

        var createExportPage = function (page) {

            var realSize = me.getRealSize();

            Ext.apply(panelHTML, {
                dom : component.body.dom.innerHTML,
                column : 1,
                row : page + 1,
                timeColumnWidth : timeColumnWidth,
                skippedColsBefore : range.skippedColsBefore,
                skippedColsAfter : range.skippedColsAfter
            });

            var readyHTML = me.resizePanelHTML(panelHTML);

            html = me.tpl.apply(Ext.apply({
                bodyClasses : bodyClasses,
                bodyHeight : realSize.height,
                componentClasses : componentClasses,
                styles : styles,
                showHeader : false,
                HTML : readyHTML.dom.innerHTML,
                totalWidth : realSize.width
            }));

            var htmlObject = html ;
            htmlArray.push(htmlObject);

            callback.call(me.exporter, htmlArray);
        };

        var task = new Ext.util.DelayedTask(createExportPage, this, [0]);
        task.delay(10);

    }

});

Ext.define('DSch.plugin.Export', {
    extend                  : 'Ext.util.Observable',

    alternateClassName      : 'DSch.plugin.PdfExport',

    alias                   : 'plugin.scheduler_dassian_export',

    mixins                  : ['Ext.AbstractPlugin'],

    requires        : [
        'Ext.XTemplate',
        'DSch.plugin.exporter.SinglePage',
        'DSch.plugin.exporter.MultiPageHorizontal'
    ],

    lockableScope           : 'top',

    /**
     * @cfg {String}
     * URL of the server responsible for running the export steps.
     */
    printServer             : undefined,

    //private template for the temporary export html page
    tpl                     : null,

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
     * Default export configuration.
     */
    defaultConfig           : {
        format              : "Letter",
        orientation         : "landscape",
        range               : "complete",
        showHeader          : false,
        singlePageExport    : false,
        multiPageHorizontal : false
    },

    /**
     * @cfg {Boolean} expandAllBeforeExport Only applicable for tree views, set to true to do a full expand prior to the export. Defaults to false.
     */
    expandAllBeforeExport   : false,

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
     * @method beforeExport
     */
    beforeExport            : Ext.emptyFn,

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * after the export plugin has extracted the data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @method afterExport
     */
    afterExport             : Ext.emptyFn,

    /**
     * @cfg {String}
     * Format of the exported file, selectable from `pdf` or `png`. By default plugin exports panel contents to PDF
     * but PNG file format is also available.
     */
    fileFormat              : 'pdf',

    //private Constant DPI value for generated PDF
    DPI                     : 72,

    //private variable to hold an instance of the exporter during export
    exporter    : undefined,

    singlePageExporterClass : 'DSch.plugin.exporter.SinglePage',

    multiPageExporterClass : 'DSch.plugin.exporter.MultiPageHorizontal',

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
     * @param {Object} [response] Full server response. This argument is specified only when `value` equals to `1`.
     */

    constructor : function (config) {
        config = config || {};

        if (config.exportDialogConfig) {
            Ext.Object.each(this.defaultConfig, function(k, v, o){
                var configK = config.exportDialogConfig[k];
                if (configK) {
                    o[k] = configK;
                }
            });
        }

        this.callParent([ config ]);

        this.setFileFormat(this.fileFormat);
    },

    init : function (scheduler) {
        this.scheduler = scheduler;

        scheduler.showExportDialog = Ext.Function.bind(this.showExportDialog, this);
        scheduler.doExport         = Ext.Function.bind(this.doExport, this);
    },

    /**
     * Function for setting the {@link #fileFormat} of exporting panel. Can be either `pdf` or `png`.
     *
     * @param {String} format format of the file to set. Can take either `pdf` or `png`.
     */
    setFileFormat : function (format) {
        if (typeof format !== 'string') {
            this.fileFormat = 'pdf';
        } else {
            format = format.toLowerCase();

            if (format === 'png') {
                this.fileFormat = format;
            } else {
                this.fileFormat = 'pdf';
            }
        }
    },

    /**
     * Instantiates and shows a new {@link #exportDialogClassName} class using {@link #exportDialogConfig} config.
     * This popup should give user possibility to change export settings.
     */
    showExportDialog : function() {
        var me   = this,
            view = me.scheduler.getSchedulingView();

        //dialog window is always removed to avoid resetting its layout after hiding
        if (me.win) {
            me.win.destroy();
            me.win = null;
        }

        me.win  = Ext.create(me.exportDialogClassName, {
            plugin                  : me,
            exportDialogConfig      : Ext.apply({
                startDate       : me.scheduler.getStart(),
                endDate         : me.scheduler.getEnd(),
                rowHeight       : view.timeAxisViewModel.getViewRowHeight(),
                columnWidth     : view.timeAxisViewModel.getTickWidth(),
                defaultConfig   : me.defaultConfig
            }, me.exportDialogConfig)
        });

        me.saveRestoreData();

        me.win.show();
    },

    /**
     * Function performing the export operation using config from arguments or default {@link #defaultConfig config}. After getting data
     * from the scheduler an XHR request to {@link #printServer} will be made with the following JSON encoded data :
     *
     * * `html` {Array}         - array of html strings containing data of each page
     * * `format` {String}      - paper size of the exported file
     * * `orientation` {String} - orientation of the exported file
     * * `range`       {String} - range of the exported file
     * * `fileFormat`  {String} - file format of the exported file
     *
     * @param {Object} [conf] Config options for exporting. If not provided, {@link #defaultConfig} is used.
     * Possible parameters are :
     *
     * * `format` {String}            - format of the exported document/image, selectable from the {@link #pageSizes} list.
     * * `orientation` {String}       - orientation of the exported document/image. Either `portrait` or `landscape`.
     * * `range` {String}             - range of the panel to be exported. Selectable from `complete`, `current`, `date`.
     * * `showHeader` {Boolean}       - boolean value defining if exported pages should have row/column numbers added in the headers.
     * * `singlePageExport` {Boolean} - boolean value defining if exported file should be divided into separate pages or not.
     * * `multiPageHorizontal` {Boolean} - boolean value defining if exported file should be divided into separate horizontal pages or not.
     *
     * @param {Function} [callback] Optional function that will be called after successful response from export backend script.
     * @param {Function} [errback] Optional function that will be called if export backend script returns error.
     */
    doExport : function (conf, callback, errback) {
        // put mask on the panel
        this.mask();
        var me           = this,
            component    = me.scheduler,
            view         = component.getSchedulingView(),
            config       = conf || me.defaultConfig;

        // keep scheduler state to restore after export
        me.saveRestoreData();

        me.fireEvent('updateprogressbar', 0.1);

        this.forEachTimeSpanPlugin(component, function(plug) {
            plug._renderDelay = plug.renderDelay;
            plug.renderDelay = 0;
        });
        me.getExportJsonHtml(config, function (htmlArray) {
            //further update progress bar
            // me.fireEvent('updateprogressbar', 0.4);
            /*
             if (me.printServer) {
             // if it's not debugging or test environment
             if (!me.debug && !me.test) {
             var ajaxConfig = {
             type : 'POST',
             url : me.printServer,
             timeout : 60000000,
             params : Ext.apply({
             html : {
             array : htmlArray
             },
             startDate : component.getStartDate(),
             endDate : component.getEndDate(),
             format : me.exporter.getFormat(),
             orientation : config.orientation,
             range : config.range,
             fileFormat : me.fileFormat
             }, this.getParameters()),
             success : function (response) {
             var main = MyApp.app.getController('Main');
             var url = "http://apps.dassian.com/topdf/toPdf.php?now="+main.getTime();
             window.open(url,'_blank');
             me.onSuccess(response, callback, errback);
             },
             failure : function (response) {
             me.onFailure(response, errback);
             },
             scope : me
             };
             Ext.apply(ajaxConfig, this.getAjaxConfig(ajaxConfig));
             Ext.Ajax.request(ajaxConfig);
             // for debugging mode we just show output instead of sending it to server
             } else if (me.debug) {
             var w, a = Ext.JSON.decode(htmlArray);
             for (var i = 0, l = a.length; i < l; i++) {
             w = window.open();
             w.document.write(a[i].html);
             w.document.close();
             }

             }
             } else {
             throw 'Print server URL is not defined, please specify printServer config';
             }
             */
            var main = MyApp.app.getController('Main');
            var now = main.getTime();
            var toPdf = window.server+'topdf/toPdf.php?now='+now;
            //var pdf = window.server+'topdf/output/pdf/mps_output-'+now+'.pdf';
            var toPdfAjaxConfig = {
                method: 'POST',
                url: toPdf,
                async: false,
                params: {
                    now: now
                },
                success: function () {
                    console.log('Success');
                    window.open(toPdf);
                },
                failure: function() {
                    console.log('Failure');
                }
            };
            Ext.Ajax.request(toPdfAjaxConfig);
            me.onSuccess();
            view.timeAxisViewModel.suppressFit = false;
            this.forEachTimeSpanPlugin(component, function (plug) {
                plug.renderDelay = plug._renderDelay;
                delete plug._renderDelay;
            });
            // restore scheduler state
            me.restorePanel();
            // run template method
            this.afterExport(component);

            // for test environment we return export results
            if (me.test) {
                if(callback) {
                    callback.call(this, {
                        htmlArray : Ext.JSON.decode(htmlArray),
                        calculatedPages : me.exporter.calculatedPages || {}
                    });
                }
            }
        });
    },

    /**
     * This method can be used to apply additional parameters to the 'params' property of the export {@link Ext.Ajax XHR} request.
     * By default this method returns an empty object.
     *
     * @return {Object}
     */
    getParameters : function () {
        return {};
    },

    /**
     * This method can be used to return any extra configuration properties applied to the {@link Ext.Ajax#request} call.
     *
     * @param {Object} config The proposed Ajax configuration settings. You may read any properties from this object, but modify it at your own risk.
     * @return {Object}
     */
    getAjaxConfig : function (config) {
        return {};
    },

    /*
     * @private
     * Method exporting panel's HTML to JSON structure. This function is taking snapshots of the visible panel (by changing timespan
     * and hiding rows) and pushing their html to an array, which is then encoded to JSON.
     *
     * @param {Object} config Object with properties from the editor dialog.
     *
     * @return {Array} htmlArray JSON string created from an array of objects with stringified html.
     */
    getExportJsonHtml : function (config, callback) {
        var me                  = this,
            component           = me.scheduler,
        //            htmlArray           = [],
        //Remove any non-webkit browser-specific css classes
            re                  = new RegExp(Ext.baseCSSPrefix + 'ie\\d?|' + Ext.baseCSSPrefix + 'gecko', 'g'),
            bodyClasses         = Ext.getBody().dom.className.replace(re, ''),
            componentClasses    = component.el.dom.className;

        //Hack for IE
        if (Ext.isIE) {
            bodyClasses += ' sch-ie-export';
        }

        var exportConfig = {
            settings : config,
            component : component,
            view : component.getSchedulingView(),
            exporter : me,
            normalGrid : component.normalGrid,
            lockedGrid : component.lockedGrid,
            headerHeight : component.normalGrid.headerCt.getHeight(),
            bodyClasses : bodyClasses,
            componentClasses : componentClasses,
            translateURLsToAbsolute : this.translateURLsToAbsolute,
            tpl : this.tpl,
            DPI : this.DPI,
            lockableScope : this.lockableScope,
            fileFormat : this.fileFormat,
            restoreSettings : this.restoreSettings
        };

        //check if we're not exporting to single image as those calculations are not needed in this case
        if (config.singlePageExport) {
            me.exporter = Ext.create(me.singlePageExporterClass, exportConfig);
        }
        else{
            me.exporter = Ext.create(me.multiPageExporterClass, exportConfig);
        }

        var range = me.exporter.setExportRange(config);

        //expand grids in case they're collapsed
        component.normalGrid.expand();
        component.lockedGrid.expand();

        // For Tree grid, optionally expand all nodes
        if (this.expandAllBeforeExport && component.expandAll) {
            component.expandAll();
        }

        this.beforeExport(component, range.ticks);

        //we need to prevent Scheduler from auto adjusting the timespan
        component.timeAxis.autoAdjust = false;
        me.exporter.getExportJsonHtml(range, function (htmlArray) {
            component.timeAxis.autoAdjust = true;
            callback.call(me, Ext.JSON.encode(htmlArray));
        });
    },

    // Since export is a sync operation for now, all plugins drawing lines & zones need to be temporarily adjusted
    // to draw their content synchronously.
    forEachTimeSpanPlugin : function(timelinePanel, fn, scope) {
        var me = this;

        if (Sch.feature && Sch.feature.AbstractTimeSpan) {
            var toIterate = (timelinePanel.plugins || []).concat(timelinePanel.normalGrid.plugins || []).concat(timelinePanel.columnLinesFeature || []);

            Ext.each(toIterate, function(plug) {
                if (plug instanceof Sch.feature.AbstractTimeSpan) {
                    fn.call(scope || me, plug);
                }
            });
        }
    },


    //Private used to prevent using old reference in the response callbacks
    getWin : function () {
        return this.win || null;
    },

    hideDialogWindow : function(response) {
        var me  = this;
        //fire event for hiding window
        me.fireEvent('hidedialogwindow', response);
        me.unmask();

        if (me.openAfterExport) {
            window.open(response.url, 'ExportedPanel');
        }
    },

    //Private.
    onSuccess : function () {
        var me  = this,
            win = me.getWin(),
            result;
        //set progress to 100%
        me.fireEvent('updateprogressbar', 1);
        me.unmask();
    },

    //Private.
    onFailure : function (response, errback) {
        var win = this.getWin(),                     // Not JSON           // Decoded JSON ok
            msg = response.status === 200 ? response.responseText : response.statusText;

        this.fireEvent('showdialogerror', win, msg);
        this.unmask();

        if (errback) {
            errback.call(this, response);
        }
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
        if (this.win) {
            this.win.destroy();
        }
    },

    /*
     * @private
     * Save values to restore panel after exporting
     */
    saveRestoreData : function() {
        var component  = this.scheduler,
            view       = component.getSchedulingView(),
            normalGrid = component.normalGrid,
            lockedGrid = component.lockedGrid;

        var hiddenColumns = {},
            visibleColumns = [];

        var columnCount = 0;

        lockedGrid.headerCt.items.each(function(column){
            if (column.hidden) {
                hiddenColumns[column.id] = column;
            }
            else {
                visibleColumns.push(
                    {
                        column : column,
                        width : column.getWidth()
                    });
            }
        });

        //values needed to restore original size/dates of panel
        this.restoreSettings = {
            width           : component.getWidth(),
            height          : component.getHeight(),
            rowHeight       : view.timeAxisViewModel.getViewRowHeight(),
            columnWidth     : view.timeAxisViewModel.getTickWidth(),
            startDate       : component.getStart(),
            endDate         : component.getEnd(),
            normalWidth     : normalGrid.getWidth(),
            normalLeft      : normalGrid.getEl().getStyle('left'),
            lockedWidth     : lockedGrid.getWidth(),
            lockedCollapse  : lockedGrid.collapsed,
            normalCollapse  : normalGrid.collapsed,
            hiddenColumns   : hiddenColumns,
            visibleColumns  : visibleColumns,
            restoreColumnWidth : false
        };
    },

    /*
     * @private
     * Restore panel to pre-export state.
     */
    restorePanel : function () {
        var s      = this.scheduler,
            config = this.restoreSettings;

        s.setWidth(config.width);
        s.setHeight(config.height);
        s.setTimeSpan(config.startDate, config.endDate);
        s.setTimeColumnWidth(config.columnWidth, true);

        s.getSchedulingView().setRowHeight(config.rowHeight);
        s.lockedGrid.show();

        if(config.restoreColumnWidth) {
            var visibleColumns = config.visibleColumns;
            for (var i = 0; i < visibleColumns.length; i++) {
                var cWrap = visibleColumns[i];
                cWrap.column.setWidth(cWrap.width);
            }
        }

        s.normalGrid.setWidth(config.normalWidth);
        s.normalGrid.getEl().setStyle('left', config.normalLeft);
        s.lockedGrid.setWidth(config.lockedWidth);
        s.getSchedulingView().timeAxisViewModel.setTickWidth(config.columnWidth);

        if (config.lockedCollapse) {
            s.lockedGrid.collapse();
        }
        if (config.normalCollapse) {
            s.normalGrid.collapse();
        }
        //We need to update TimeAxisModel for layout fix #1334
        s.getSchedulingView().timeAxisViewModel.update();
        Ext.select('.sch-gantt-label-right').setStyle({
            'font-size':'1.0em',
            'font-family': 'tahoma',
            'font-weight':'normal'
        });
        Ext.select('.sch-gantt-label-left').setStyle({
            'font-size':'1.0em',
            'font-family': 'tahoma',
            'font-weight':'normal'
        });
        Ext.select('.sch-simple-timeheader').setStyle({
            'font-size':'1.0em',
            'font-family': 'tahoma',
            'font-weight':'normal',
            'white-space':'nowrap'
        });
        Ext.select('.x-grid-cell-inner').setStyle({
            'font-size':'1.0em',
            'font-weight':'normal',
            'font-family': 'tahoma',
            'white-space':'nowrap'
        });
        Ext.select('.x-column-header-text').setStyle({
            'font-size':'1.0em',
            'font-weight':'normal',
            'font-family': 'tahoma',
            'white-space':'nowrap'
        });
        Ext.select('.x-tree-elbow-img').setStyle({
            'width':'16px',
            'height':'20px',
            'margin-right':'0'
        });
        Ext.select('.sch-gantt-labelct-right').setStyle({
            'margin-left':'20px'
        });
        Ext.select('.sch-gantt-labelct-left').setStyle({
            'width':'570px'
        });
    }
});