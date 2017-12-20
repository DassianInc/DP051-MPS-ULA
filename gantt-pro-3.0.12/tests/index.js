/* globals Siesta: true, Bryntum: true, $: true, Joose: true */
/*
 * FOR THE TESTS TO WORK, YOU NEED TO HAVE YOUR EXT JS SDK FOLDER ON THE SAME LEVEL AS THE EXT SCHEDULER/GANTT FOLDER
 */

var Harness      = new Siesta.Harness.Browser.ExtJS();
var extRoot      = Harness.getQueryParam('extroot');
var debug        = typeof Ext !== "undefined";  // Use debug versions when a browser harness is present
var isSmokeTest  = Harness.getQueryParam('smoke');
var isRelease    = Harness.getQueryParam('release') == 1;
var isExtNightly = Harness.getQueryParam('extNightly');
var targetExtVersions;

// Using external Ext copy
if (extRoot) {
    // strip any trailing slashes
    extRoot = extRoot.replace(/\/$/, '');
    targetExtVersions = ['external'];
} else {
    targetExtVersions = [
        '5.1.1',
        '5.1.2'
    ];
}

if (isSmokeTest || isRelease) {
    // Only run smoke/release tests against latest version
    targetExtVersions = [targetExtVersions[targetExtVersions.length-1]];
}


var injectVersion = function (items, version) {

    for (var i = 0; i < items.length; i++) {
        var test = items[ i ];

        if (typeof test == 'string') test = { url : test };

        if (test) {
            if (test.items)
                injectVersion(test.items, version);
            else {
                test.url += (test.url.match(/\?/) ? '&' : '?') + 'Ext=' + version;
            }

            items[i] = test;
        }
    }
};

Harness.configure({
    title                           : 'Ext Gantt Test Suite',

    keepResults                     : false,
    testClass                       : Bryntum.Test,

    allowExtVersionChange           : true,
    disableCaching                  : false,
    autoCheckGlobals                : true,
    overrideSetTimeout              : true,
    sandboxBoundaryByGroup          : true,
    enableCodeCoverage              : !isSmokeTest && Boolean(window.IstanbulCollector),
    cachePreload                    : isSmokeTest,
    coverageUnit                    : 'extjs_class',
    failOnMultipleComponentMatches  : true,
    excludeCoverageUnits            : /^Ext|^Sch/,

    innerHtmlHead                   : '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">',

    expectedGlobals                 : [
        'Sch',
        'Gnt',
        // Ext leak
        'i',
        'checkErrorTask',
        'onDirectCaptureEvent'
    ]
});

var topItems = [];

function getExtPaths(extRoot, jsFile, rtl) {

    if (isExtNightly) {
        // two days ago
        var dt = new Date(new Date() - 1 * 1000 * 60 * 60 * 24),
            m = dt.getMonth() + 1,
            d = dt.getDate();

        extRoot = extRoot + '/s5-' + dt.getFullYear() + (m < 10 ? '0' : '') + m + (d < 10 ? '0' : '') + d + '/ext/';
    }

    jsFile = jsFile || 'ext-all-debug.js';

    // Ext 6
    //return {
    //    extRoot : extRoot,
    //    jsRoot  : extRoot + '/build/',
    //    cssRoot : extRoot + '/build/classic/theme-classic/resources/',
    //    js      : extRoot + '/build/' + jsFile,
    //    css     : extRoot + '/build/classic/theme-classic/resources/' + (rtl ? 'ext-theme-classic-all-rtl.css' : 'theme-classic-all.css')
    //};

    return {
        extRoot : extRoot,
        jsRoot  : extRoot + '/build/',
        cssRoot : extRoot + '/packages/ext-theme-classic/build/resources',
        js      : extRoot + '/build/' + jsFile,
        css     : extRoot + '/packages/ext-theme-classic/build/resources/' + (rtl ? 'ext-theme-classic-all-rtl.css' : 'ext-theme-classic-all.css')
    };
}

function getTestSuite(extRoot, version) {
    var extPaths = getExtPaths(extRoot);
    var extRTLPaths = getExtPaths(extRoot, 'ext-all-rtl-debug.js', true);

    var rtlPreloads = [
        extRTLPaths.css,
        extRTLPaths.js,
        '../resources/css/sch-gantt-all.css',
        '../gnt-all' + (debug ? '-debug' : '') + '.js'
    ];
    var suite = [
        {
            group : 'Scheduling Modes',
            forceDOMVisible : false, // test group for data-model only!
            sandbox : false,

            items : [
                'scheduling_modes/data_model.t.js',
                'scheduling_modes/data_model_calendar.t.js',

                'scheduling_modes/availability1.t.js',
                'scheduling_modes/availability2.t.js',

                'scheduling_modes/effort_conversion.t.js',

                'scheduling_modes/fixed_duration.t.js',
                'scheduling_modes/fixed_duration2.t.js',

                'scheduling_modes/effort_driven.t.js',
                'scheduling_modes/effort_driven2.t.js',
                'scheduling_modes/effort_driven3.t.js',
                'scheduling_modes/effort_driven4.t.js',
                'scheduling_modes/effort_driven5.t.js',

                'scheduling_modes/dynamic_allocation.t.js',
                'scheduling_modes/dynamic_allocation_2.t.js',
                'scheduling_modes/dynamic_allocation_3.t.js',

                'scheduling_modes/resource_allocation.t.js',
                'scheduling_modes/resource_calendar.t.js',
                'scheduling_modes/task_calendar.t.js',
                'scheduling_modes/parent_calendar.t.js',

                'scheduling_modes/constrain.t.js',
                'scheduling_modes/task_with_own_calendar_and_assignments.t.js',
                'scheduling_modes/task_availability_iterator.t.js',
                'scheduling_modes/parent_normal_mode.t.js'
            ]
        },
        {
            group           : 'Sanity',
            forceDOMVisible : false,
            sandbox         : false,
            items : [
                'sanity/010_sanity.t.js',

                'sanity/014_subclassing.t.js',
                'sanity/015_taskstore_events.t.js',
                'sanity/016_dom_footprint.t.js'
            ]
        },
        {
            group           : 'Sanity slow',
            forceDOMVisible : false,

            items : [
                // For this test work, you also need a copy of the Ext Scheduler source files
                $.browser.chrome ? {
                    url     : 'sanity/011_on_demand.t.js',
                    defaultTimeout : 90000,
                    preload : [
                        extPaths.jsRoot + "ext-debug.js"
                    ]
                } : null,
                'sanity/012_no_overrides.t.js',
                // No point in running lint in all browsers
                $.browser.msie ? null : {
                    url         : 'sanity/013_lint.t.js',
                    alsoPreload : [ "sanity/jshint.js" ]
                },
                {
                    url         : 'sanity/017_private_method_overrides.t.js',
                    alsoPreload : ['sanity/symbols.js']
                },

                $.browser.msie ? null : {
                    url             : 'sanity/020_sencha_cmd_app.t.js',
                    hostPageUrl     : 'cmd_app/build/production/TestApp/'
                },
                {
                    url     : 'sanity/019_unscoped_css_rules.t.js',
                    preload : [
                        '../resources/css/sch-gantt-all.css',
                        extPaths.jsRoot + 'ext-all.js'
                    ]
                }
            ]
        },
        {
            group       : 'Constraints',
            sandbox     : false,

            items       : [
                'constraints/001_linearization.t.js',
                'constraints/002_linearization_cycle_cut_strategies.t.js',
                'constraints/003_projection.t.js',
                'constraints/004_panel_projection.t.js',
                'constraints/010_adding_constraint.t.js',
                'constraints/020_breaking_constraint.t.js',
                'constraints/030_default_constraint_date.t.js',
                'constraints/040_violations.t.js',
                'constraints/050_tricky_dependency_case.t.js',
                'constraints/060_async_behaviour.t.js',
                'constraints/070_task_segments.t.js'
            ]
        },
        {
            group : 'Dependencies',

            items : [
                'legacyIE:dependencies/200_reorder_task.t.js',
                'legacyIE:dependencies/201_create.t.js',
                {
                    url             : 'dependencies/202_dnd_container_scroll.t.js',
                    forceDOMVisible : true
                },
                'legacyIE:dependencies/203_critical_path.t.js',
                'legacyIE:dependencies/204_rendering.t.js',
                'legacyIE:dependencies/205_buffered_dependencies.t.js',
                'legacyIE:dependencies/205_buffered_dependencies2.t.js',
                'legacyIE:dependencies/206_cyclic_detection.t.js',
                'legacyIE:dependencies/207_rendering_edges.t.js',
                'legacyIE:dependencies/208_repaint_triggers.t.js',
                'legacyIE:dependencies/209_terminal_zindex.t.js',
                'legacyIE:dependencies/210_null_dates.t.js',
                'legacyIE:dependencies/211_z-index.t.js',
                'dependencies/212_locked_view_repaint_triggers.t.js',
                'dependencies/213_tasks_outside_view.t.js',
                'dependencies/214_dependency_view_events.t.js',
                'dependencies/215_delete_row_with_dependencies.t.js',
                'dependencies/216_dnd_tooltip.t.js',
                'dependencies/217_types.t.js',
                'dependencies/217_no_repaint_upon_no_edit.t.js'
            ]
        },
        {
            group : 'State',

            items : [
                'state/130_stateful.t.js'
            ]
        },
        {
            group : 'Localization',

            items : [
                'localization/900_localization.t.js',
                'localization/901_missing.t.js',
                'localization/902_unused.t.js',
                //'localization/903_legacy.t.js',
                {
                    url : 'localization/904_on_demand.t.js',
                    preload : [
                        extPaths.jsRoot + "ext-all-debug.js"
                    ]
                },
                'localization/905_superclass.t.js',
                'localization/906_date_units.t.js',
                'localization/907_dependency_parser.t.js'
            ]
        },
        {
            group           : 'Data components',
            forceDOMVisible : false,
            sandbox         : false,
            items : [
                'data_components/020_calendar.t.js',
                'data_components/020_calendar_tree.t.js',
                'data_components/021_calendar_raw.t.js',
                'data_components/022_calendar_loading.t.js',
                'data_components/023_custom_taskmodel_fields.t.js',
                'data_components/024_taskstore_calendar_loading_changing.t.js',
                'data_components/024_calendar_late_binding.t.js',
                'data_components/025_calendar_custom_weekend.t.js',
                'data_components/026_taskstore.t.js',
                'data_components/027_taskmodel_in_treestore.t.js',
                'data_components/028_calendar_dst.t.js',
                'data_components/029_assignment_missing_resource.t.js',
                'data_components/030_task.t.js',
                'data_components/030_task_readonly.t.js',
                'data_components/031_task_manual.t.js',
                'data_components/032_task_manual.t.js',
                'data_components/032_task_index.t.js',
                'data_components/033_task_lag.t.js',
                'data_components/033_task_lag_with_units.t.js',
                'data_components/034_taskstore_getTotalTimespan.t.js',
                'data_components/034_taskstore_get_by_id.t.js',

                'data_components/035_task_indent.t.js',
                'data_components/035_task_indent2.t.js',
                'data_components/035_task_indent_dirty.t.js',
                'data_components/035_task_segments.t.js',
                'data_components/035_task_segments2.t.js',
                'data_components/035_task_segments3.t.js',
                'data_components/035_task_segments4.t.js',
                'data_components/036_recalculate_parents.t.js',
                'data_components/036_recalculate_parents_effort.t.js',
                'data_components/036_recalculate_parents_percent_done.t.js',
                'data_components/036_cascade_changes_perf_regr.t.js',
                'data_components/037_task_indent_update.t.js',
                'data_components/038_task_model.t.js',
                'data_components/039_parent_task_update.t.js',
                'data_components/040_dependency_model.t.js',
                'data_components/041_dependency_model_crud.t.js',
                'data_components/042_dependency_store.t.js',
                'data_components/042_dependency_store2.t.js',
                'data_components/043_nested_beginedit.t.js',

                'data_components/050_assignment.t.js',
                'data_components/051_assignment.t.js',
                'data_components/061_sorting.t.js',
                'data_components/063_store_ids.t.js',

                'data_components/cross-dst-task.t.js',
                'data_components/064_model_binding_to_taskstore.t.js',
                'data_components/065_task_milestone_startdate.t.js',
                'data_components/064_task_is_above.t.js',

                'data_components/066_load_store.t.js',
                'data_components/067_cascade_on_scheduling_mode.t.js',
                'data_components/068_total_time_span_cache.t.js',
                'data_components/069_task_outdent_recalc.t.js',
                'data_components/070_task_indent_drop_deps.t.js',
                'data_components/072_resource_allocation_info.t.js',
                'data_components/072_resource_allocation_info2.t.js',
                'data_components/073_lag_processing.t.js',
                'data_components/074_resource_skip_void_tasks.t.js',
                'data_components/075_task_insertbefore.t.js',
                'data_components/076_reorder_task.t.js',
                'data_components/077_task_replace_child.t.js',

                'data_components/080_milestone_skipnonworkingtime.t.js',
                'data_components/090_move_parent_task.t.js',
                'data_components/091_move_parent_task_cascade.t.js',

                'data_components/092_task_sequence_number.t.js',
                'data_components/093_cascade_changes.t.js',

                'data_components/100_deps_from_to_parent_task.t.js',
                'data_components/110_dependencies_caching.t.js',
                'data_components/111_assignments_caching.t.js',
                'data_components/112_calendar_infinite_loop.t.js',
                'data_components/113_resource_vs_task_iterator.t.js',
                'data_components/120_cycles_protection.t.js',
                'data_components/121_violated_dependency_propagation.t.js',
                'data_components/122_effort_driven_on_unscheduled_task.t.js',
                'data_components/123_task_store_adjusttocalendar.t.js',
                'data_components/123_taskstore_move_parent.t.js',
                'data_components/124_parent_task_null.t.js',
                'data_components/125_resource_allocation_info_segmented_task.t.js',
                'data_components/126_taskstore_phantom_parent.t.js',
                {
                    alsoPreload : [
                        '../examples/MSProject_import/Gnt.data.ux.Importer.js'
                    ],
                    url : 'data_components/200_data_importer.t.js'
                },
                'data_components/201_calendar_change.t.js',
                'data_components/202_calendar_model.t.js'
            ]
        },
        {
            group           : 'Life cycles',
            forceDOMVisible : false,

            items : [
                'lifecycle/040_lifecycle.t.js',
                {
                    alsoPreload : [
                        "../../ExtScheduler3.x/sch-all-debug.js"
                    ],
                    url         : 'lifecycle/042_gantt_scheduler.t.js'
                },

                'lifecycle/044_gantt_in_autoWidth_panel.t.js'
            ]
        },
        {
            group : 'CSS',

            items : [
                'css/041_task_hover_css_class.t.js',
                'css/043_task_css_classes.t.js'
            ]
        },
        {
            group : 'Performance',
            sandbox : false,

            items : [
                'performance/010_meta_data_change.t.js',
                'performance/011_task_update.t.js',
                'performance/012_editor_layouts.t.js',
                'performance/212_cascade_no_layouts.t.js',
                'performance/013_add_remove_update_layouts.t.js',
                'performance/014_drag_drop_layouts.t.js'
                //,
                //'performance/500_taskstore_load_4_vs_5.t.js'
            ]
        },
        {
            group       : 'CRUD',
            sandbox     : false,

            items : [
                'crud/060_crud.t.js',
                'crud/061_ui_with_clear_on_load.t.js',
                'crud/063_crud_autosync_with_ui.t.js',
                'crud/064_autosync_successor.t.js',
                'crud/065_autosync_predecessor.t.js',
                'crud/066_autosync_add_subtask.t.js',
                //'crud/067_phantom_parent.t.js',
                'crud/067_phantom_parent2.t.js',
                'crud/068_assignment_crud.t.js',
                'crud/069_crud_autosync_with_ui_2.t.js',
                'crud/070_crud_modify_during_sync.t.js',
                {
                    requires : ['Ext.ux.ajax.SimManager'],
                    url      : 'crud/072_assignment_crud_phantom_task.t.js'
                }
            ]
        },
        {
            group       : 'CRUD Manager',

            items : [
                'crud_manager/01_add_stores.t.js',
                'crud_manager/01_add_stores_proto.t.js',
                'crud_manager/02_calendar_manager.t.js',
                'crud_manager/03_reset_ids.t.js',
                'crud_manager/03_change_set_package.t.js',
                'crud_manager/04_calendar_manager.t.js',
                'crud_manager/04_calendar_manager_haschanges.t.js',
                {
                    requires : ['Ext.ux.ajax.SimManager'],
                    url      : 'crud_manager/05_load_with_filtered_view.t.js'
                },
                {
                    url         : 'crud_manager/11_backend.t.js',
                    load        : {
                        url     : '../examples/PHP demo/php/read.php'
                    },
                    sync        : {
                        url     : '../examples/PHP demo/php/save.php'
                    },
                    resetUrl    : '../examples/PHP demo/php/reset.php'
                }/*
                ,

                // Uncommenting following tests will enable backend CRUD samples testing.
                // Note: This will require configuring requests proxying on your web-server (to avoid "same origin" issues).
                // Here is an example of how it can be done for Apache web server:
                //
                //     ProxyPass        /asp.net-gantt-demo  http://192.168.1.10:50696/ganttcrud
                //     ProxyPassReverse /asp.net-gantt-demo  http://192.168.1.10:50696/ganttcrud
                //
                //     ProxyPass        /java-gantt-demo  http://127.0.0.1:8080/java-gantt-demo
                //     ProxyPassReverse /java-gantt-demo  http://127.0.0.1:8080/java-gantt-demo
                {
                    url         : 'crud_manager/11_backend.t.js?java',
                    load        : {
                        url     : '/java-gantt-demo/services/load'
                    },
                    sync        : {
                        url     : '/java-gantt-demo/services/sync'
                    },
                    resetUrl    : '/java-gantt-demo/services/reset'
                },
                {
                    url         : 'crud_manager/11_backend.t.js?asp.net',
                    load        : {
                        url     : '/asp.net-gantt-demo/ganttcrud/load'
                    },
                    sync        : {
                        url     : '/asp.net-gantt-demo/ganttcrud/sync'
                    },
                    resetUrl    : '/asp.net-gantt-demo/ganttcrud/reset'
                }
                */
            ]
        },

        {
            group : 'Calendar manager',

            items : [
                'calendar_manager/01_calendar_manager.t.js'
            ]
        },

        {
            group       : 'Columns',

            items : [
                'legacyIE:columns/1000_cols_dirty_reset.t.js',
                'legacyIE:columns/1001_enddate.t.js',
                {
                    url             : 'legacyIE:columns/1002_tabbing.t.js',
                    forceDOMVisible : true
                },
                {
                    url             : 'legacyIE:columns/1002_tabbing_2.t.js',
                    forceDOMVisible : true
                },
                'legacyIE:columns/1003_enddate_milestone.t.js',
                'legacyIE:columns/1004_enddate2.t.js',
                'legacyIE:columns/1005_startdate.t.js',
                'legacyIE:columns/1006_date_clear.t.js',
                'legacyIE:columns/start_end_dates_editing.t.js',
                'legacyIE:columns/start_end_dates_editing_461.t.js',
                'legacyIE:columns/1007_predecessor.t.js',
                'legacyIE:columns/1007_predecessor2.t.js',
                'legacyIE:columns/1008_addnew.t.js',
                'legacyIE:columns/1008_addnew_custom.t.js',
                'legacyIE:columns/1009_wbs.t.js',
                'legacyIE:columns/1010_percentdone.t.js',
                'legacyIE:columns/1011_schedulingmode.t.js',
                'legacyIE:columns/1012_resource_assignment.t.js',
                'legacyIE:columns/1013_duration.t.js',
                'legacyIE:columns/1014_dependency.t.js',
                'legacyIE:columns/1014_dependency_dirty.t.js',
                'legacyIE:columns/1014_dependency_column_hidden.t.js',
                'legacyIE:columns/1015_enddate_3.t.js',
                'legacyIE:columns/1016_earlylate.t.js',
                'legacyIE:columns/1017_duration_editor_place.t.js',
                'legacyIE:columns/1018_reorder_task.t.js',
                'legacyIE:columns/1019_effort.t.js',
                'legacyIE:columns/1020_sequence.t.js',
                'legacyIE:columns/1021_sequence.t.js',
                'legacyIE:columns/1022_calendar.t.js',
                'legacyIE:columns/1023_constraints.t.js',
                'legacyIE:columns/1024_manualmode.t.js',
                'legacyIE:columns/1025_note.t.js',
                'legacyIE:columns/1025_enddate_cancel.t.js',
                'legacyIE:columns/1026_baseline_columns.t.js',
                'legacyIE:columns/1027_readonly.t.js',
                'legacyIE:columns/1028_editor_default_type.t.js',
                'legacyIE:columns/1029_editable_column.t.js'
            ]
        },
        {
            group : 'Fields',

            items : [
                'fields/10_startdate.t.js',
                'fields/11_startdate_null.t.js',
                'fields/11_startdate_null2.t.js',
                'fields/10_startdate_with_time.t.js',
                'fields/12_startdate_new_milestone.t.js',
                'fields/13_startdate_editable.t.js',
                'fields/14_startdate_invalid.t.js',
                'fields/20_enddate.t.js',
                'fields/21_enddate_with_time.t.js',
                'fields/22_enddate_null.t.js',
                'legacyIE:fields/30_duration.t.js',
                'legacyIE:fields/31_duration.t.js',
                'legacyIE:fields/40_schedulingmode.t.js',
                'legacyIE:fields/50_calendar.t.js',
                'legacyIE:fields/50_calendar2.t.js',
                'legacyIE:fields/60_startdate_enddate.t.js',
                'legacyIE:fields/65_startdate_enddate2.t.js',
                'legacyIE:fields/70_dependency.t.js',
                'legacyIE:fields/71_dependency_allowed_types.t.js',
                'legacyIE:fields/72_readonly.t.js',
                'legacyIE:fields/80_constraint_date.t.js',
                'legacyIE:fields/85_constraint_type.t.js',
                'legacyIE:fields/90_note.t.js'
            ]
        },
        {
            group       : 'Composite & advanced tests',
            alsoPreload : [
                '../../ExtScheduler3.x/resources/css/sch-all.css',
                '../../ExtScheduler3.x/sch-all-debug.js'
            ],
            items       : [
                'composite/1100_gantt_scheduler.t.js',
                {
                    hostPageUrl : '../examples/gantt-scheduler/gantt-scheduler.html',
                    url         : 'composite/1101_gantt_scheduler2.t.js'
                },
                {
                    hostPageUrl : '../examples/gantt-scheduler/gantt-scheduler.html',
                    url         : 'composite/1102_gantt_scheduler_dynamic_assignment.t.js'
                }
            ]
        },
        {
            group : 'Plugins',

            items : [
                'legacyIE:plugins/090_cell_editing.t.js',
                'legacyIE:plugins/091_task_context_menu.t.js',
                'legacyIE:plugins/092_dependency_editor.t.js',
                'plugins/094_print.t.js',
                'legacyIE:plugins/095_task_context_menu2.t.js',
                'legacyIE:plugins/096_taskeditor.t.js',
                'legacyIE:plugins/099_task_context_menu_taskeditor.t.js',
                'legacyIE:plugins/100_dependencyeditor_allowed_types.t.js',
                'legacyIE:plugins/101_taskeditor_destroy.t.js',
                'legacyIE:plugins/102_taskeditor_assignments.t.js',
                'legacyIE:plugins/102_cell_editing.t.js',
                'legacyIE:plugins/103_task_context_menu_split.t.js',
                'legacyIE:plugins/103_taskeditor_segments.t.js'
            ]
        },
        {
            group : 'Features',
            sandbox : true,

            items : [
                'legacyIE:features/1200_label_editing.t.js',
                'legacyIE:features/1201_resize.t.js',
                'legacyIE:features/1201_resize2.t.js',
                'legacyIE:features/1201_resize_async.t.js',
                'legacyIE:features/1202_dragcreator.t.js',
                'legacyIE:features/1203_working_time.t.js',
                'legacyIE:features/1204_dragdrop.t.js',
                'legacyIE:features/1204_dragdrop_rows.t.js',
                'legacyIE:features/1204_dragdrop_async.t.js',
                {
                    preload : rtlPreloads,
                    url     : 'legacyIE:features/1204_dragdrop_rtl.t.js'
                },
                'legacyIE:features/1205_dragcreator.t.js',
                'legacyIE:features/1205_dragcreator_async.t.js',
                {
                    alsoPreload : [
                        '../../ExtScheduler3.x/resources/css/sch-all.css',
                        '../../ExtScheduler3.x/sch-all-debug.js'
                    ],
                    url         : 'legacyIE:features/1206_multiassignment_drag_drop_scheduler.t.js'
                },
                'legacyIE:features/1207_readonly_features.t.js'
            ]
        },
        {
            group   : 'Early/Late dates',
            sandbox : false,

            items : [
                'earlylate_dates/010_earlylate_dates.t.js',
                'earlylate_dates/011_dependencies_changes.t.js',
                'earlylate_dates/012_cache_invalidate.t.js',
                'earlylate_dates/012_cache_invalidate2.t.js',
                'earlylate_dates/012_cache_invalidate_free_task.t.js',
                'earlylate_dates/012_cache_invalidate_manual_task.t.js'
            ]
        },
        {
            group : 'Event API & Interaction',

            items : [
                'legacyIE:event/050_task_events.t.js',
                'legacyIE:event/051_schedule_events.t.js',
                'event/052_dependency_events.t.js',
                'event/053_update_events.t.js'
            ]
        },
        {
            group : 'Task Bar Interaction',

            items : [
                'legacyIE:taskbar/070_interaction_dnd.t.js',
                'legacyIE:taskbar/071_interaction_progress_dnd.t.js',
                'legacyIE:taskbar/072_dd_container_scroll.t.js',
                'legacyIE:taskbar/073_task_resize.t.js',
                'legacyIE:taskbar/074_drag_parent.t.js',
                'legacyIE:taskbar/075_sel_model.t.js',
                'legacyIE:taskbar/076_click_parent_task.t.js'
            ]
        },
        {
            group : 'Rendering',
            sandbox : false,

            items : [
                'rendering/080_highlight_weekends.t.js',
                'rendering/081_highlight_tasks.t.js',
                'rendering/082_highlight_tasks_no_scroll.t.js',
                'rendering/083_baseline.t.js',
                'rendering/083_baseline2.t.js',
                'rendering/084_task_missing_data.t.js',
                'legacyIE:rendering/085_scroll_size.t.js',
                'legacyIE:rendering/086_cascade_redraw.t.js',
                'rendering/087_css_classes.t.js',
                'legacyIE:rendering/090_task_fields.t.js',
                'rendering/091_labels_for_hidden_tasks.t.js',
                'rendering/113_animated_collapse_expand.t.js',
                'rendering/114_sel_model.t.js',
                'legacyIE:rendering/115_collapse_expand.t.js',
                'legacyIE:rendering/116_locked_grid_cell_height.t.js',
                'legacyIE:rendering/174_column_headers_widths.t.js',
                'legacyIE:rendering/columnlines_misalignment.t.js',
                'rendering/201_zoom_to_fit.t.js',
                'rendering/202_custom_template.t.js',
                'rendering/203_zoom_to_fit_span.t.js',
                'rendering/204_rollup_to_summary.t.js',
                'rendering/205_progress_bar.t.js'
            ]
        },
        {
            group : 'Validation',

            items : [
                'validation/169_cascade_bug.t.js',
                'validation/172_overriding_params.t.js'
            ]
        },
        {
            group : 'View',

            items : [
                'view/062_reload_store.t.js',
                'view/200_view.t.js',
                'view/200_view_autospan.t.js',
                'view/201_dependency.t.js',
                'view/202_treenode_reorder.t.js',
                'view/203_buffered_view_1.t.js',
                'view/203_buffered_view_2.t.js',
                'view/203_buffered_view_3.t.js',
                'view/203_buffered_view_4.t.js',
                'view/203_buffered_view_5.t.js',
                'view/203_buffered_view_6.t.js',
                'view/204_view_xmlstore.t.js',
                'view/205_taskmodel_in_ext_tree.t.js',
                'view/206_load_collapsed.t.js',
                'view/207_dependency_drawing.t.js',
                {
                    preload : rtlPreloads,
                    url     : 'view/207_dependency_drawing.t.js?rtl'
                },
                'view/208_scroll_into_view.t.js',
                'view/209_sort_and_filter.t.js',
                'view/210_no_width_available.t.js',
                'view/211_view_ui_elements.t.js',
                {
                    hostPageUrl : '../examples/advanced/advanced.html',
                    url : 'view/212_scroll_after_cascade.t.js'
                },
                'view/213_indent.t.js',
                'view/214_keynav.t.js',
                'view/215_dependencyStore_population.t.js',
                'view/216_indent_dependencies.t.js',
                'view/217_view_cascade.t.js',
                'view/218_scroll_position.t.js',
                'view/220_buffered_view_node_collapse.t.js',
                'view/221_cascade_parents_refresh.t.js',
                'view/222_filtering_selmodel.t.js'
            ]
        },
        {
            group : 'Widget',

            items : [
                'widget/1100_durationfield.t.js',
                'widget/1101_assignmentfield.t.js',
                'widget/1103_calendar.t.js',
                'widget/1104_assignmentgrid.t.js',
                'widget/1105_dependencygrid.t.js',
                'widget/1106_assignmenteditgrid.t.js',
                'widget/1107_taskform.t.js',
                'widget/1108_dependencygrid_phantoms.t.js',
                'widget/1109_calendar_load.t.js',
                'widget/1110_assignmenteditgrid_combo_filter.t.js',
                'widget/1111_dependencygrid_tasks_refresh.t.js',
                'widget/1112_calendar_save_changes.t.js',
                'widget/1113_dependencygrid_negative_lag.t.js',
                'widget/1114_taskeditor.t.js',
                'widget/1114_taskeditor_effort_driven_task.t.js',
                'widget/1114_taskeditor_notefield.t.js',
                'widget/1114_taskeditor_project_calendar.t.js',
                'widget/1115_dependencygrid_allowed_types.t.js',
                'widget/1116_assignment_readonly.t.js',
                'widget/1117_calendar_week_save.t.js',
                'widget/1118_taskeditor_manualmode.t.js',
                'widget/1119_assignmenteditgrid.t.js',
                'widget/1120_calendar.t.js'
            ]
        },
        {
            group : 'Panel',

            items : [
                'panel/1200_panel_event_bindings.t.js',
                'panel/1201_panel_property_translation.t.js',
                $.browser.msie ? null : {
                    preload : [
                        { text : 'Ext = {buildSettings: {scopeResetCSS: true}};' },
                        extPaths.cssRoot + '/ext-all-scoped.css',
                        extPaths.jsRoot + "/ext-all-debug.js",
                        '../gnt-all' + (debug ? '-debug' : '') + '.js',
                        '../resources/css/sch-gantt-all.css'
                    ],
                    url     : 'panel/1202_css_scoping.t.js'
                },
                'panel/1203_lockable_spacer.t.js',
                'panel/1204_panel_scroll_rowclick.t.js',
                'panel/1206_select_then_sort.t.js',
                'panel/1207_resizing_column.t.js',
                'panel/1208_expand_collapse_panels.t.js',
                'panel/1209_async_set_root_node.t.js',
                'panel/1209_click_row_scroll.t.js',
                'panel/1210_start_end_dates.t.js',
                'panel/1211_partner_panel.t.js',
                'panel/1212_redraw_columns.t.js',
                'panel/1213_auto_fit_on_load.t.js'
            ]
        },
        {
            group : 'Histogram',

            sandbox : false,
            items : [
                'histogram/00_build_bars.t.js',
                'histogram/00_build_bars2.t.js',
                'histogram/00_build_bars3.t.js',
                'histogram/01_get_time_span.t.js',
                'histogram/10_refresh.t.js',
                'histogram/20_view_renderers.t.js',
                'histogram/21_reacting_to_timeaxis.t.js',
                'histogram/30_bar_events.t.js',
                'histogram/31_initialization.t.js',
                'histogram/32_view_renderers_after_respan.t.js',
                'histogram/33_template.t.js',
                'histogram/34_zoom.t.js',
                'histogram/35_phantom_resource_assign.t.js',
                'histogram/36_change_assigned_resource.t.js',
                'histogram/37_duplicate_rows.t.js',
                'histogram/38_build_bars_crud_manager.t.js',
                'histogram/39_performance.t.js',
                'histogram/40_show_limit_lines.t.js',
                'histogram/41_approx.t.js',
                'histogram/42_performance_crud_manager.t.js',
                'histogram/43_calendar_change.t.js'
            ]
        },
        {
            group   : 'Util',
            sandbox : false,

            items : [
                'util/300_dependency_parser.t.js',
                'util/301_duration_parser.t.js'
            ]
        },
        {
            group : 'Exporter',

            items : [
                'export/001_export.t.js',
                'legacyIE:export/002_export_after_export.t.js',
                'legacyIE:export/003_export_dependencies.t.js',
                'legacyIE:export/004_export_dependencies_range.t.js',
                'legacyIE:export/005_export_dependencies_horizontal.t.js'
            ]
        },
        {
            group : 'Project',
            sandbox : false,

            items : [
                'project/001_project_sanity.t.js',
                'project/002_project_dependencies.t.js',
                'project/004_project_form.t.js',
                'project/005_project_editor.t.js',
                'project/006_project_editor_plugin.t.js',
                'project/007_project_lines_plugin.t.js'
            ]
        }
    ];


    injectVersion(suite, version);

    return suite;
}


// Add one top group per supported Ext JS version
for (var i = 0; i < targetExtVersions.length; i++) {
    var version = targetExtVersions[i];
    var root = extRoot || '../../extjs-' + version;
    var extPaths = getExtPaths(root, 'ext-all-debug.js');

    topItems.push({
        group       : extRoot ? extRoot : ('Ext JS ' + version),
        loaderPath : { 'Ext.ux' : extPaths.extRoot + '/examples/ux' },

        // Only expand latest supported version
        expanded : i === targetExtVersions.length - 1,

        preload : [
            extPaths.js,
            extPaths.css,

            {
                // specifying type will be optional after merging "coverage" branch
                type        : 'js',
                url         : '../gnt-all-debug.js',
                instrument  : true
            },
            { text : 'Ext.XTemplate.override({ strict : true });' },
            '../resources/css/sch-gantt-all.css'
        ],

        items : getTestSuite(root, version)
    });
}

if (!extRoot && !isSmokeTest) {
    // Inject tests exercising the examples
    var exampleUrls =
            [
                'advanced/advanced.html',
                'baseline/baseline.html',
                'basic/basic.html',
                'calendars/calendar.html',
                'constraints/constraints.html',
                'dependencyeditor/dependencyeditor.html',
                'export/gantt-export.html',
                'gantt-print/gantt-print.html',
                'gantt-scheduler/gantt-scheduler.html',
                'holidays/holidays.html',
                'labels/labels.html',
                'MSProject_import/import.html',
                'rtl/rtl.html',
                'scheduling_modes/scheduling_modes.html',
                'styles/styles.html'
            ],
        exampleItems = [];

    for (var i = 0; i < exampleUrls.length; i++) {
        exampleItems[i] = {
            defaultTimeout : $.browser.msie ? 60000 : 30000,
            hostPageUrl : '../examples/' + exampleUrls[i],
            preload     : 'inherit',
            url         : 'legacyIE:sdk_examples/10000_sanity.t.js?' + exampleUrls[i],
            name        : '[' + i + '] ' + exampleUrls[i]
        };
    }

    // since advanced example localized we need to
    // make test entry for each locale
    var locales = ['en', 'sv_SE', 'de', 'it', 'ru', 'pl', 'nl'];
    var tests   = [];

    for (var i = 0; i < locales.length; i++) {
        tests.push({
            hostPageUrl     : '../examples/advanced/advanced.html#'+locales[i],
            defaultTimeout  : 60000,
            preload         : 'inherit',
            url             : 'sdk_examples/advanced.t.js?'+locales[i]
        });
    }

    topItems.push(
        {
            group              : 'Monkey Test of examples',
            autoCheckGlobals   : false,
            overrideSetTimeout : false,
            mouseMovePrecision : 10000,
            preload            : [
                {
                    text : 'Ext.XTemplate.override({ strict : true });'
                }
            ],
            items              : exampleItems
        },
        {
            group              : 'Examples sanity tests',
            autoCheckGlobals   : false,
            overrideSetTimeout : false,
            mouseMovePrecision : 10000,
            preload            : [ { text : 'Ext.XTemplate.override({ strict : true });' } ],
            items              : [
                {
                    hostPageUrl : '../examples/advanced/advanced.html',
                    preload     : 'inherit',
                    url         : 'sdk_examples/advanced2.t.js'
                },
                {
                    hostPageUrl : '../examples/histogram/histogram.html',
                    preload     : 'inherit',
                    url         : 'sdk_examples/histogram.t.js'
                },
                {
                    hostPageUrl : '../examples/holidays/holidays.html',
                    preload     : 'inherit',
                    url         : 'sdk_examples/holidays.t.js'
                }
            ].concat(tests)
        }
    );
}

var processIE = function (group) {
    var copy        = [];

    Joose.A.each(group, function (item) {
        if (!item) return;
        if (item.group)
            copy.push(Joose.O.extend(item, {
                items       : processIE(item.items)
            }));
        else {
            var isString    = typeof item == 'string';
            var url         = isString ? item : item.url;

            var match       = /^legacyIE:(.*)/i.exec(url);
            var striped     = match ? match[ 1 ] : url;

            if (!window.IS_LEGACY_IE || match) copy.push(isString ? striped : Joose.O.extend(item, { url : striped }));
        }
    });

    return copy;
};

if (isSmokeTest) {
    topItems[0].items = topItems[0].items.filter(function(group) {
        return group.group in {
            'Sanity'            : 1,
            'Data components'   : 1
        };
    });
}

Harness.start.apply(Harness, processIE(topItems));

Harness.on('teststart', function (ev, test) {
    var console = test.global.console;

    if (console) {
        console.error = console.warn = function (msg) {
           // http://www.sencha.com/forum/showthread.php?2951955
           // https://www.sencha.com/forum/showthread.php?288898-W-targetCls-is-missing.-This-may-mean-that-getTargetEl%28%29-is-being-overridden-but-no
           if (msg && (msg.indexOf('Layout run failed') != -1 || msg.indexOf('targetCls is') != -1)) {
                test.todo(function(t) {t.fail(msg);});
            } else{
                test.fail([].join.apply(arguments));
            }
            console.log(msg);
        };
    }
});
