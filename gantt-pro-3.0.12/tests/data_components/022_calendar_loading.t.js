StartTest(function(t) {
    
    var calendar        = new Gnt.data.Calendar({
        proxy   : {
            type        : 'ajax',
            url         : 'data_components/022_calendar_loading.t.json',
            method      : 'GET',
            reader      : {
                type    : 'json'
            }
        }
    })

    t.loadStoresAndThen(calendar, function () {

        t.is(calendar.getCount(), 3, '3 special days in calendar ')
        
        t.isDateEq(calendar.getAt(0).get('Date'), new Date(2011, 8, 2), 'Correct date for 1st holiday')
    })
})    
