package bryntum.crud.dao;

import static bryntum.crud.exception.Codes.*;
import bryntum.crud.domain.Node;
import bryntum.crud.exception.CrudException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

public class Util {

    protected JdbcTemplate tmpl;
    protected Map<String, Map<String, Integer>> phantomIdMap;
    protected Map<String, Map<Integer, Map<String, Object>>> removedRows;
    protected Map<String, Map<Integer, Map<String, Object>>> updatedRows;

    public Util(JdbcTemplate tmpl) {
        this.tmpl = tmpl;
        phantomIdMap = new HashMap<String, Map<String, Integer>>();
    }

    /**
     * Joins list of strings into one string with a glue string.
     * @param glue A glue string.
     * @param list List of strings to join.
     * @return Returns a string containing all the list elements in the same order, with the glue string between each element.
     */
    public String implode(String glue, List<String> list) {
        if (list == null) return null;

        int k = list.size();
        if (k == 0) return null;

        StringBuilder out = new StringBuilder();
        out.append(list.get(0));

        int j = 1;
        while (j < k) {
            out.append(glue).append(list.get(j));
            j++;
        }

        return out.toString();
    }

    /**
     * Sets a whole map keeping phantom to real Id references for all tables.
     * @param map Map to keep references.
     */
    public void setPhantomIdMap(Map<String, Map<String, Integer>> map) {
        phantomIdMap = map;
    }

    /**
     * Gets map keeping phantom to real Id references for a specific store.
     * @param store Store identifier to get references for.
     * @return Map keeping phantom to real Id references.
     */
    public Map<String, Integer> getPhantomIdMap(String store) {
        return phantomIdMap.get(store);
    }

    /**
     * Gets real record identifier matching specified phantom one.
     * @param store Store identifier.
     * @param phantomId Phantom record identifier.
     * @return Real record identifier.
     */
    public Integer getIdByPhantom(String store, String phantomId) {
        Map<String, Integer> map = getPhantomIdMap(store);
        if (map == null) return null;

        // get real task Id
        if (phantomId != null && map.containsKey(phantomId)) {
            return map.get(phantomId);
        }

        return null;
    }

    public void setRemovedRows(Map<String, Map<Integer, Map<String, Object>>> map) {
        removedRows = map;
    }

    public void setRemovedRows(String store, Map<Integer, Map<String, Object>> map) {
        removedRows.put(store, map);
    }

    public void addRemovedRow(String store, Integer id, Map<String, Object> row) {
        removedRows.get(store).put(id, row);
    }

    public Map<Integer, Map<String, Object>> getRemovedRows(String store) {
        return removedRows.get(store);
    }

    public void setUpdatedRows(Map<String, Map<Integer, Map<String, Object>>> map) {
        updatedRows = map;
    }

    public void setUpdatedRows(String store, Map<Integer, Map<String, Object>> map) {
        updatedRows.put(store, map);
    }

    public void addUpdatedRow(String store, Integer id, Map<String, Object> row) {
        updatedRows.get(store).put(id, row);
    }

    public Map<Integer, Map<String, Object>> getUpdatedRows(String store) {
        return updatedRows.get(store);
    }

    /**
     * Gets current server revision stamp.
     * @return Server revision stamp.
     * @throws CrudException
     */
    public int getRevision() throws CrudException {
        return Integer.parseInt(getOption("revision"));
    }

    /**
     * Increments server revision stamp.
     * @throws CrudException
     */
    public void updateRevision() throws CrudException {
        try {
            setOption("revision", "value + 1", true);
        } catch (Exception e) {
            throw new CrudException("Cannot update server revision stamp.", UPDATE_REVISION);
        }
    }

    /**
     * Checks if specified revision stamp is not older than current server one.
     * @param revision Revision stamp to check.
     * @throws CrudException If specified revision is older than server one method throws CrudException with code OUTDATED_REVISION.
     */
    public void checkRevision(int revision) throws CrudException {
        if (revision > 0 && getRevision() > revision) {
            throw new CrudException("Client data snapshot is outdated please reload you stores before.", OUTDATED_REVISION);
        }
    }

    /**
     * Gets application option.
     * @param name Option name.
     * @return Option value.
     * @throws CrudException
     */
    public String getOption(String name) throws CrudException {
        try {
            return tmpl.queryForObject("select value from options where name = ?", String.class, new Object[] { name });
        } catch (Exception e) {
            throw new CrudException("Cannot get option " + name + ".", GET_OPTION);
        }
    }

    /**
     * Sets application option.
     * @param name Option name.
     * @param value Option value.
     * @return Number of updated options.
     * @throws CrudException
     */
    public int setOption(String name, String value) throws CrudException {
        return setOption(name, value, false);
    }

    /**
     * Sets application option.
     * @param name Option name.
     * @param value Option value.
     * @param injectQuery True to inject value right into a query body without parameters using.
     * @return Number of updated options.
     * @throws CrudException
     */
    public int setOption(String name, String value, Boolean injectQuery) throws CrudException {
        try {
            List<String> strLst = tmpl.query("select name from options where name = ?", new Object[] { name }, new RowMapper<String>() {
                @Override
                public String mapRow(ResultSet rs, int rowNum) throws SQLException {
                    return rs.getString(1);
                }
            });

            if (!strLst.isEmpty()) {
                if (injectQuery) {
                    return tmpl.update("update options set value = " + value + " where name = ?", new Object[] { name });
                } else {
                    return tmpl.update("update options set value = ? where name = ?", new Object[] { value, name });
                }
            } else {
                if (injectQuery) {
                    return tmpl.update("insert into options (name, value) values (?, " + value + ")", new Object[] { name });
                } else {
                    return tmpl.update("insert into options (name, value) values (?, ?)", new Object[] { name, value});
                }
            }
        } catch (Exception e) {
            throw new CrudException("Cannot set option " + name + ".", SET_OPTION);
        }
    }

    /**
     * Returns total number of rows found by last query.
     * @return Total number of rows.
     * @throws CrudException if request fails.
     */
    public int getFoundRows() throws CrudException {
        try {
            return tmpl.queryForInt("select found_rows()");
        } catch (Exception e) {
            throw new CrudException("Cannot get total number of rows.", FOUND_ROWS);
        }
    }

    /**
     * Gets identifier of last inserted record.
     * @return Identifier of last inserted record.
     */
    public Integer getLastInsertId() {
        return tmpl.queryForInt("select last_insert_id()");
    }

    /**
     * Gets node collection in a proper form to send to a client.
     * Fill children for each node.
     * @param byParent Map where key is identifier of a node and value is list of its children.
     * @param parentId Identifier of node to start tree building from.
     * @return List of nodes
     */
    @SuppressWarnings("unchecked")
    public <T extends Node> List<T> buildTree(Map<Integer, List<T>> byParent, int parentId) {

        // each byParent element keeps children for particular parentId

        // get child nodes of specified parent
        List<T> nodes = byParent.get(parentId);

        if (nodes != null) {
            List<T> result = new ArrayList<T>();
            for (T node : nodes) {
                List<T> children = buildTree(byParent, node.getId());

                if (children != null) {
                    node.setChildren((List<Node>)children);
                }

                result.add(node);
            }

            return result;
        }

        return null;
    }
}
