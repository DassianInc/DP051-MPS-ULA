package bryntum.crud.request;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonProperty;

/**
 * This class implements general load request structure.
 */
public class LoadRequest extends GeneralRequest {

    /**
     * Keeps map of all stores request parameters.
     */
    protected Map<String, Map<String, Object>> storeParams;

    /**
     * Sets all stores parameters.
     * Note: this method is invoked during request deserialization.
     * @param stores
     */
    @JsonProperty("stores")
    public void setStores(List<Object> stores) {

        storeParams = new HashMap<String, Map<String, Object>>();

        for (Object store : stores) {
            // if store is specified as an object with extra request parameters
            if (store instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> storeMap = (Map<String, Object>) store;
                // let's keep request parameters for the store
                storeParams.put((String) storeMap.get("storeId"), storeMap);
            // if just store Id specified
            } else if (store instanceof String) {
                String storeId = (String) store;
                // let's keep identifier
                storeParams.put(storeId, new HashMap<String, Object>());
            }
        }
    }

    /**
     * Gets an arbitrary store request parameters.
     * @param storeId Store identifier.
     * @return Request parameters.
     */
    public Map<String, Object> getStoreParams(String storeId) {
        return storeParams.containsKey(storeId) ? storeParams.get(storeId) : null;
    }

    /**
     * Checks if an arbitrary store is requested.
     * @param storeId Store identifier.
     * @return `True` if store is requested.
     */
    public Boolean hasStore(String storeId) {
        return storeParams.containsKey(storeId);
    }
}
