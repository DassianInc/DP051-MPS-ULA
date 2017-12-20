using Bryntum.CRUD.Request;
using System;
using System.Collections.Generic;

namespace Bryntum.Gantt.Request.Handler
{
    public class CalendarDaySyncHandler : SyncStoreRequestHandler<CalendarDay> {

        private Gantt gantt;
        private int calendarId;

        public CalendarDaySyncHandler(Gantt gantt, string dateFormat) : base(dateFormat) {
            this.gantt = gantt;
        }

        public override CalendarDay GetEntity(IDictionary<String, Object> changes) {
            return gantt.getCalendarDay(Convert.ToInt32(changes["Id"]));
        }

        public void setCalendarId(int calendarId) {
            this.calendarId = calendarId;
        }

        public override IDictionary<String, Object> Add(CalendarDay calendarDay)
        {
            IDictionary<String, Object> response = new Dictionary<String, Object>();
            calendarDay.CalendarIdRaw = calendarId;
            gantt.saveCalendarDay(calendarDay);
            return response;
        }

        public override IDictionary<String, Object> Update(CalendarDay calendarDay, IDictionary<String, Object> changes)
        {
            if (changes.ContainsKey("Name")) calendarDay.Name = Convert.ToString(changes["Name"]);
            if (changes.ContainsKey("Cls")) calendarDay.Cls = Convert.ToString(changes["Cls"]);
            if (changes.ContainsKey("Date")) calendarDay.Date = Convert.ToDateTime(changes["Date"]);
            if (changes.ContainsKey("OverrideStartDate")) calendarDay.OverrideStartDate = Convert.ToDateTime(changes["OverrideStartDate"]);
            if (changes.ContainsKey("OverrideEndDate")) calendarDay.OverrideEndDate = Convert.ToDateTime(changes["OverrideEndDate"]);
            if (changes.ContainsKey("Type")) calendarDay.Type = Convert.ToString(changes["Type"]);
            if (changes.ContainsKey("Weekday")) calendarDay.Weekday = Convert.ToInt32(changes["Weekday"]);
            if (changes.ContainsKey("IsWorkingDay"))
                calendarDay.IsWorkingDayRaw = (byte) ((bool) changes["IsWorkingDay"] ? 1 : 0);
            if (changes.ContainsKey(calendarDay.PhantomIdField))
                calendarDay.PhantomId = Convert.ToString(changes[calendarDay.PhantomIdField]);

            IDictionary<String, Object> response = new Dictionary<String, Object>();
            calendarDay.CalendarIdRaw = calendarId;
            gantt.saveCalendarDay(calendarDay);
            return response;
        }

        public override IDictionary<String, Object> Remove(CalendarDay calendarDay)
        {
            IDictionary<String, Object> response = new Dictionary<String, Object>();
            gantt.removeCalendarDay(calendarDay);
            return response;
        }

    }
}
