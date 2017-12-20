package bryntum.crud.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonAnyGetter;
import org.codehaus.jackson.annotate.JsonProperty;


public class LoadResponse extends GeneralResponse {

    /**
     * Map internally holding all the returning stores data.
     */
    protected Map<String, Object> content;

    /**
     * Revision stamp set for the response.
     */
    protected Integer revision;

    public LoadResponse() {
        super(null);
        content = new HashMap<String, Object>();
    }

    public LoadResponse(Long requestId) {
        super(requestId);
        content = new HashMap<String, Object>();
    }

    public LoadResponse(Long requestId, Integer revision) {
        this(requestId);
        this.revision = revision;
    }

    /**
     * Method used for a proper serialization of the class.
     * @return Response content for each store.
     */
    @JsonAnyGetter
    public Map<String, Object> getContent() {
        return content;
    }

    /**
     * Gets revision stamp set for the response.
     * @return Revision stamp.
     */
    @JsonProperty("revision")
    public Integer getRevision() {
        return revision;
    }
    /**
     * Sets revision stamp to respond.
     * @param revision Revision stamp.
     */
    public void setRevision(Integer revision) {
        this.revision = revision;
    }

    /**
     * Sets load response for an arbitrary store.
     * @param storeId Store identifier.
     * @param records List of store records.
     */
    public <T> void setStore(String storeId, List<T> records) {
        content.put(storeId, new LoadStoreResponse<T>(records));
    }

    /**
     * Sets load response for an arbitrary store.
     * @param storeId Store identifier.
     * @param records List of store records.
     * @param calcTotal `False` to not set total number of records based on `rows` list size.
     */
    public <T> void setStore(String storeId, List<T> records, Boolean calcTotal) {
        content.put(storeId, new LoadStoreResponse<T>(records, calcTotal));
    }

    /**
     * Sets load response for an arbitrary store.
     * @param storeId Store identifier.
     * @param records List of store records.
     * @param calcTotal `False` to not set total number of records based on `rows` list size.
     * @param metaData Meta data for the store.
     */
    public <T> void setStore(String storeId, List<T> records, Boolean calcTotal, Map<String, Object> metaData) {
        content.put(storeId, new LoadStoreResponse<T>(records, calcTotal, metaData));
    }

    /**
     * Sets load response for an arbitrary store.
     * @param storeId Store identifier.
     * @param records List of store records.
     * @param totalRows Total number of records in the store.
     * @param metaData Meta data for the store.
     */
    public <T> void setStore(String storeId, List<T> records, Integer totalRows, Map<String, Object> metaData) {
        content.put(storeId, new LoadStoreResponse<T>(records, totalRows, metaData));
    }

    /**
     * `True` for this type of response.
     */
    @Override
    public Boolean getSuccess() {
        return true;
    }

}
