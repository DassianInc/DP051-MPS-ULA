package bryntum.gantt.request.handler;

import java.text.DateFormat;
import java.util.HashMap;
import java.util.Map;

import bryntum.crud.exception.CrudException;
import bryntum.crud.request.SyncStoreRequestHandler;
import bryntum.gantt.domain.CalendarDay;
import bryntum.gantt.dao.Gantt;

public class CalendarDaySyncHandler extends SyncStoreRequestHandler<CalendarDay> {

    private final Gantt app;
    private Integer calendarId;

    public CalendarDaySyncHandler(Gantt app, DateFormat dateFormat) {
        super(dateFormat);
        this.app = app;
    }

    @Override
    public CalendarDay getRecord(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");
        if (id == null) return null;

        CalendarDay record = app.getCalendarDay(id);
        if (record == null) return null;

        if (changes.containsKey("Cls")) {
            record.setCls((String) changes.get("Cls"));
        }
        if (changes.containsKey("Date")) {
            try {
                record.setDate(strToDate((String) changes.get("Date")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("Name")) {
            record.setName((String) changes.get("Name"));
        }
        if (changes.containsKey("OverrideStartDate")) {
            try {
                record.setOverrideStartDate(strToDate((String) changes.get("OverrideStartDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("OverrideEndDate")) {
            try {
                record.setOverrideEndDate(strToDate((String) changes.get("OverrideEndDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("Type")) {
            record.setType((String) changes.get("Type"));
        }
        if (changes.containsKey("Weekday")) {
            record.setWeekday((Integer) changes.get("Weekday"));
        }
        if (changes.containsKey("IsWorkingDay")) {
            record.setWorkingDay((Boolean) changes.get("IsWorkingDay"));
        }
        if (changes.containsKey(record.getPhantomIdField())) {
            record.setPhantomId((String) changes.get(record.getPhantomIdField()));
        }

        return record;
    }

    public void setCalendarId(Integer calendarId) {
        this.calendarId = calendarId;
    }

    @Override
    public Map<String, Object> add(CalendarDay calendarDay) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();
        calendarDay.setCalendarId(calendarId);
        app.saveCalendarDay(calendarDay);
        return result;
    }

    @Override
    public Map<String, Object> update(CalendarDay calendarDay, Map<String, Object> changes) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();
        calendarDay.setCalendarId(calendarId);
        app.saveCalendarDay(calendarDay);
        return result;
    }

    @Override
    public Map<String, Object> remove(CalendarDay calendarDay) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();
        app.removeCalendarDay(calendarDay);
        return result;
    }

}
