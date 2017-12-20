package bryntum.crud.request;

import java.util.List;
import java.util.Map;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown=true)
public class SyncStoreRequest<T> {

    public List<T> added;

    public List<Map<String, Object>> updated;

    public List<T> removed;

}
