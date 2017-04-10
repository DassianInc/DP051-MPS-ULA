requirejs.config({
    paths: {
        jquery: 'vendor/jquery.min'
    }
});
require(['jquery'],function($){
    $.ajax({
        url: '/dsnwebui/dsnwebui_rest/ServerStoreXml',
        method: 'GET',
        success: function(res) {
            var server = res.getElementsByTagName("number")[0].firstChild.valueOf().textContent;
            window.server = server;
            $.ajax({
                url: server+'framework/ext-all.js',
                dataType: 'script',
                success: function(res) {
                    $.ajax({
                        url: 'resources/gnt-all-debug.js',
                        dataType: 'script',
                        success: function (res) {
                            $.ajax({
                                url: 'resources/SchExportPlugin.js',
                                dataType: 'script',
                                success: function(res) {
                                    $.ajax({
                                        url: 'resources/GntExportPlugin.js',
                                        dataType: 'script',
                                        success: function(res) {
                                            $.ajax({
                                                url: 'app.js',
                                                dataType: 'script'
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });

                }
            });
            $("head").append("<link rel='stylesheet' href='"+server+'framework/extra/customCss.css'+"' type='text/css' />");
            $("head").append("<link rel='stylesheet' href='resources/customCss.css' type='text/css' />");
            $("head").append("<link rel='stylesheet' href='"+server+'framework/packages/ext-theme-gray/build/resources/ext-theme-gray-all.css'+"' type='text/css' />");
            $("head").append("<link rel='stylesheet' href='"+server+'framework/extra/sch-gantt-all-debug.css'+"' type='text/css' />");
            $("head").append("<link rel='stylesheet' href='resources/font-awesome.min.css' type='text/css' />");
        },
        error: function(res) {
            alert('No entry maintained for source server in Z051ULA_MD01');
        }
    })
});