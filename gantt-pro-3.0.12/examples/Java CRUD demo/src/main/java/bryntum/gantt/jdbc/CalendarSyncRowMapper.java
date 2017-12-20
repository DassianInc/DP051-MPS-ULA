package bryntum.gantt.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import bryntum.gantt.request.CalendarSyncRequest;

public class CalendarSyncRowMapper implements RowMapper<CalendarSyncRequest> {

    @Override
    public CalendarSyncRequest mapRow(ResultSet rs, int n) throws SQLException {
        CalendarSyncRequest result = new CalendarSyncRequest();

        int id = rs.getInt("Id");
        result.setId(id);
        result.setName(rs.getString("Name"));
        result.setParentId(rs.getInt("parentId"));
        result.setDaysPerMonth(rs.getInt("DaysPerMonth"));
        result.setDaysPerWeek(rs.getInt("DaysPerWeek"));
        result.setHoursPerDay(rs.getInt("HoursPerDay"));
        result.setWeekendsAreWorkdays(rs.getInt("WeekendsAreWorkdays") == 1);
        result.setWeekendFirstDay(rs.getInt("WeekendFirstDay"));
        result.setWeekendSecondDay(rs.getInt("WeekendSecondDay"));
        result.setDefaultAvailability(rs.getString("DefaultAvailability"));

        return result;
    }

}
