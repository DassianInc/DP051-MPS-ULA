package bryntum.crud.response;

import java.util.HashMap;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonAnyGetter;
import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;


public class SyncResponse extends GeneralResponse {

    public SyncResponse() {
        super();
        content = new HashMap<String, Object>();
    }

    public SyncResponse(Long requestId) {
        super(requestId);
        content = new HashMap<String, Object>();
    }

    /**
     * Map internally holding all the returning stores data.
     */
    protected Map<String, Object> content;

    /**
     * Revision stamp set for the response.
     */
    protected Integer revision;

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
     * Method used for a proper serialization of the class.
     * @return
     */
    @JsonAnyGetter
    public Map<String, Object> getContent() {
        return content;
    }

    @Override
    public Boolean getSuccess() {
        return true;
    }

    public void setStore(String storeId, SyncStoreResponse storeData) {
        content.put(storeId, storeData);
    }

    @JsonIgnore
    public SyncStoreResponse getStore(String storeId) {
        if (!content.containsKey(storeId)) return null;
        SyncStoreResponse result = (SyncStoreResponse) content.get(storeId);
        return result;
    }

}
