package bryntum.gantt.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.RowCallbackHandler;

import bryntum.crud.exception.CrudException;
import bryntum.gantt.dao.Gantt;
import bryntum.gantt.response.CalendarLoadResponse;
import bryntum.gantt.domain.Calendar;

public class CalendarRowCallbackHandler implements RowCallbackHandler {

    public Map<Integer, List<Calendar>> byParent;
    protected Gantt gantt;
    protected Boolean forResponse;

    public CalendarRowCallbackHandler(Map<Integer, List<Calendar>> byParent, Gantt app, Boolean forResponse) {
        super();
        this.byParent = byParent;
        this.gantt = app;
        this.forResponse = forResponse;
    }

    @Override
    public void processRow(ResultSet rs) throws SQLException {
        Calendar result = forResponse ? new CalendarLoadResponse() : new Calendar();

        int id = rs.getInt("Id");
        result.setId(id);
        result.setName(rs.getString("Name"));
        int parentId = rs.getInt("parentId");
        result.setParentId(rs.wasNull() ? null : parentId);
        result.setDaysPerMonth(rs.getInt("DaysPerMonth"));
        result.setDaysPerWeek(rs.getInt("DaysPerWeek"));
        result.setHoursPerDay(rs.getInt("HoursPerDay"));
        result.setWeekendsAreWorkdays(rs.getInt("WeekendsAreWorkdays") == 1);
        result.setWeekendFirstDay(rs.getInt("WeekendFirstDay"));
        result.setWeekendSecondDay(rs.getInt("WeekendSecondDay"));
        result.setDefaultAvailability(rs.getString("DefaultAvailability"));

        try {
            result.setDays(gantt.getCalendarDays(Integer.toString(id)));
        } catch (CrudException e) {
            throw new RuntimeException(e);
        }

        if (!byParent.containsKey(parentId)) {
            byParent.put(parentId, new ArrayList<Calendar>());
        }

        byParent.get(parentId).add(result);
    }

}
