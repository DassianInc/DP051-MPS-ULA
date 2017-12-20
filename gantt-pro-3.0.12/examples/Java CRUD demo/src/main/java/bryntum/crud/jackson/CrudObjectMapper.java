package bryntum.crud.jackson;

import java.text.SimpleDateFormat;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig;

public class CrudObjectMapper extends ObjectMapper {

    protected SimpleDateFormat dateFormat;

    public CrudObjectMapper(String dateFormat) {
        super();
        this.dateFormat = new SimpleDateFormat(dateFormat);
        configure(SerializationConfig.Feature.WRITE_DATES_AS_TIMESTAMPS, false);
        setDateFormat(this.dateFormat);
    }

}
