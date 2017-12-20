package bryntum.gantt.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

import bryntum.gantt.domain.Calendar;

public class CalendarRowMapper implements RowMapper<Calendar> {

    @Override
    public Calendar mapRow(ResultSet rs, int n) throws SQLException {
        Calendar result = new Calendar();

        result.setId(rs.getInt("Id"));
        result.setName(rs.getString("Name"));
        Integer parentId = rs.getInt("parentId");
        result.setParentId(rs.wasNull() ? null : parentId);
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
