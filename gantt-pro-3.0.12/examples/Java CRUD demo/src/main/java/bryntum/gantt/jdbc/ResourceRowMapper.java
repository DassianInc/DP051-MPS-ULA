package bryntum.gantt.jdbc;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import bryntum.gantt.domain.Resource;

public class ResourceRowMapper implements RowMapper<Resource> {

    @Override
    public Resource mapRow(ResultSet rs, int n) throws SQLException {
        Resource result = new Resource();

        result.setId(rs.getInt("Id"));
        result.setName(rs.getString("Name"));
        result.setCalendarId(rs.getInt("CalendarId"));

        return result;
    }

}
