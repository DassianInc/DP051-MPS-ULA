package bryntum.gantt.jdbc;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import bryntum.gantt.domain.Dependency;

public class DependencyRowMapper implements RowMapper<Dependency> {

    @Override
    public Dependency mapRow(ResultSet rs, int n) throws SQLException {
        Dependency result = new Dependency();

        result.setId(rs.getInt("Id"));
        result.setFrom(rs.getInt("FromId"));
        result.setTo(rs.getInt("ToId"));
        result.setType(rs.getInt("Typ"));
        result.setCls(rs.getString("Cls"));
        result.setLag(rs.getInt("Lag"));
        result.setLagUnit(rs.getString("LagUnit"));

        return result;
    }

}
