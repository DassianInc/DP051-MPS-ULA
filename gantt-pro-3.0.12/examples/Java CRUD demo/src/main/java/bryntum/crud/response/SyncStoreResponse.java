package bryntum.crud.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.codehaus.jackson.annotate.JsonAnyGetter;

public class SyncStoreResponse {
    static Logger log = Logger.getLogger(SyncStoreResponse.class.getName());

    /**
     * Content of sync response related to a store.
     */
    protected Map<String, Object> content;

    public SyncStoreResponse() {
        super();
        content = new HashMap<String, Object>();
    }

    public SyncStoreResponse(List<Map<String, Object>> rows, List<Map<String, Object>> removed) {
        this();
        setRows(rows);
        setRemoved(removed);
    }

    /**
     * Gets part of response related to the store.
     * Note: Method is used for a proper serialization of the class.
     * @return Part of response related to the store.
     */
    @JsonAnyGetter
    public Map<String, Object> getContent() {
        return content;
    }

    public void setRows(List<Map<String, Object>> rows) {
        setRows(rows, false);
    }

    @SuppressWarnings("unchecked")
    public void setRows(List<Map<String, Object>> rows, Boolean append) {
        if (append && content.containsKey("rows")) {
            List<Map<String, Object>> r = (List<Map<String, Object>>) content.get("rows");
            r.addAll(rows);
            content.put("rows", r);
        } else {
            content.put("rows", rows);
        }
    }

    @SuppressWarnings("unchecked")
    public Boolean hasRows() {
        if (!content.containsKey("rows")) return false;

        List<Map<String, Object>> rows = (List<Map<String, Object>>) content.get("rows");
        return rows.size() > 0;
    }

    @SuppressWarnings("unchecked")
    public Boolean hasRemoved() {
        if (!content.containsKey("removed")) return false;

        List<Map<String, Object>> removed = (List<Map<String, Object>>) content.get("removed");
        return removed.size() > 0;
    }

    public void setRemoved(List<Map<String, Object>> removed) {
        setRemoved(removed, false);
    }

    @SuppressWarnings("unchecked")
    public void setRemoved(List<Map<String, Object>> removed, Boolean append) {
        if (append && content.containsKey("removed")) {
            List<Map<String, Object>> r = (List<Map<String, Object>>) content.get("removed");
            r.addAll(removed);
            content.put("removed", r);
        } else {
            content.put("removed", removed);
        }
    }
}
