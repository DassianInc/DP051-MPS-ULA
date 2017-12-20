/* global LOAD_TIME:true */
describe('The time of task store loading should not be significantly worse than in 2.x version', function (t) {

    t.expectGlobals('LOAD_TIME');

    var MEASURE_LOAD_TIME = function (hundreds) {

        var getLargeDataset = function (hundreds) {
            hundreds       = hundreds || 10

            var arr = [],
                i, j, k,
                cn, cn2,
                dt = new Date(2010, 0, 5);

            for (i = 1; i < hundreds; i++) {
                cn = [];
                for (j = 1; j < 10; j++) {
                    cn2 = [];
                    for (k = 1; k < 10; k++) {
                        var nbr = (100 * i) + (10 * j) + k;
                        cn2.push({
                            Id        : nbr,
                            Name      : 'Child task ' + nbr,
                            StartDate : dt,
                            EndDate   : Ext.Date.add(dt, Ext.Date.DAY, 2),
                            leaf      : true
                        });
                    }
                    cn.push({
                        Id        : 'Child task ' + String(i) + String(j),
                        Name      : 'Child task ' + String(i) + String(j),
                        StartDate : dt,
                        EndDate   : Ext.Date.add(dt, Ext.Date.DAY, 2),
                        expanded  : true,
                        children  : cn2
                    });
                }
                arr.push({
                    Id        : 'Root task #' + i,
                    Name      : 'Root task #' + i,
                    StartDate : new Date(2010, 0, 5),
                    EndDate   : dt,
                    children  : cn,
                    expanded  : true
                });
            }

            return arr;
        }

        var data        = getLargeDataset(Number(hundreds))

        var time        = new Date()

        var taskStore   = new Gnt.data.TaskStore({
            // sorting slow downs the initial loading/rendering time for big trees
            sortOnLoad  : false,

            proxy       : {
                type    : 'memory',
                data    : data
            }
        });

        taskStore.load()

        return LOAD_TIME = new Date() - time
    }


    var iframe, win, loadTime4x

    t.chain(
        function (next) {
            iframe              = Ext.get(document.createElement("iframe"))

            iframe.on('load', next, null, { single : true })

            iframe.dom.src      = 'performance/500_taskstore_load_4_vs_5.t.html'

            document.body.appendChild(iframe.dom)
        },
        function (next) {
            win                 = iframe.dom.contentWindow

            win.Ext.globalEval('(MEASURE_LOAD_TIME = ' + MEASURE_LOAD_TIME.toString() + ');')

            win.MEASURE_LOAD_TIME(50)

            next()
        },
        { waitFor : function () { return win.LOAD_TIME != null } },
        function () {
            loadTime4x      = win.LOAD_TIME;

            //console.profile("Loading");
            var loadTime5x  = MEASURE_LOAD_TIME(50);
            //console.profileEnd("Loading");
            t.diag('5.x: ' + loadTime5x + ', 4.x: ' + loadTime4x);

            if (loadTime5x < loadTime4x) {
                t.pass("Load performance has improved");
            }
            else {
                if (loadTime5x / loadTime4x > 1.5) {
                    t.knownBugIn("5.1.0", function(t) {
                        t.fail("Load time should not be 1.5 times slower than in 2.x version", {
                            got         : loadTime5x,
                            need        : loadTime4x,
                            gotDesc     : 'Ext5 load time',
                            needDesc    : 'Ext4 load time'
                        })
                    });
                }
                else {
                    // considering also unstable measuring, not taking into account possibly temporarily slow down of browser
                    t.pass("Load performance is worse, but acceptable");
                }
            }

            // cleanup to pass the globals check
            iframe.dom.parentNode.removeChild(iframe.dom);
        }
    )
})
