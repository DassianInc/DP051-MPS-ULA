package bryntum.crud.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonAnyGetter;

/**
 * This class defines sub-structure of response object for a particular store.
 *
 * @param <T> The class which defines a domain representing corresponding store record.
 */
public class LoadStoreResponse<T> {

    /**
     * List of records.
     */
    public List<T> rows;

    /**
     * Keeps optional response content: total number of records and meta data for the store.
     */
    protected Map<String, Object> content;

    public LoadStoreResponse() {
        super();
        content = new HashMap<String, Object>();
    }

    public LoadStoreResponse(List<T> rows) {
        this();
        setRows(rows);
    }

    public LoadStoreResponse(List<T> rows, Boolean calcTotal) {
        this();
        if (!calcTotal) {
            this.rows = rows;
        } else {
            setRows(rows);
        }
    }

    public LoadStoreResponse(List<T> rows, Boolean calcTotal, Map<String, Object> metaData) {
        this(rows, calcTotal);
        setMetaData(metaData);
    }

    public LoadStoreResponse(List<T> rows, Integer totalRows) {
        this();
        this.rows = rows;
        setTotal(totalRows);
    }

    public LoadStoreResponse(List<T> rows, Integer totalRows, Map<String, Object> metaData) {
        this();
        this.rows = rows;
        setTotal(totalRows);
        setMetaData(metaData);
    }

    /**
     * Gets optional content as a map that may hold total number of records and meta data for corresponding store.
     * Note: Method is used for a proper serialization of the class.
     * @return Content of content property
     */
    @JsonAnyGetter
    public Map<String, Object> getContent() {
        return content;
    }

    /**
     * Sets records list and total number of record to number of records
     * in the `rows` list.
     * @param rows Records list.
     */
    public void setRows(List<T> rows) {
        this.rows = rows;
        setTotal(rows != null ? rows.size() : 0);
    }

    /**
     * Sets total number of records in the store.
     * @param total Number of records.
     */
    public void setTotal(Integer total) {
        content.put("total", total);
    }

    /**
     * Sets meta data that must have been returned for the store.
     * @param metaData Meta data.
     */
    public void setMetaData(Map<String, Object> metaData) {
        content.put("metaData", metaData);
    }

}
