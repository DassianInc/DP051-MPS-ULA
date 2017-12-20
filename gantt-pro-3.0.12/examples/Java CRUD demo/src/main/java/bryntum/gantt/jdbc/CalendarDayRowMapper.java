package bryntum.gantt.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import bryntum.gantt.domain.CalendarDay;

public class CalendarDayRowMapper implements RowMapper<CalendarDay> {

    @Override
    public CalendarDay mapRow(ResultSet rs, int n) throws SQLException {
        CalendarDay result = new CalendarDay();

        result.setId(rs.getInt("Id"));
        result.setName(rs.getString("Name"));
        result.setDate(rs.getDate("Dt"));
        result.setType(rs.getString("Typ"));
        result.setWeekday(rs.getInt("Weekday"));
        result.setOverrideStartDate(rs.getDate("OverrideStartDate"));
        result.setOverrideEndDate(rs.getDate("OverrideEndDate"));
        result.setWorkingDay(rs.getInt("IsWorkingDay") == 1);
        result.setCls(rs.getString("Cls"));
        result.setAvailability(rs.getString("Availability"));
        result.setCalendarId(rs.getInt("calendarId"));

        return result;
    }

}
