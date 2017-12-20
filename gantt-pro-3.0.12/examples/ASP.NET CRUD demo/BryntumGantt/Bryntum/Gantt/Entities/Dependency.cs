using Bryntum.CRUD.Entities;
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

namespace Bryntum.Gantt
{
    [MetadataType(typeof(DependencyMetadata))]
    public partial class Dependency : General
    {
        [JsonIgnore]
        public string PhantomFromId { get; set; }

        [JsonProperty("From")]
        public string FromId
        {
            set
            {
                PhantomFromId = value;
                if (value == null) return;

                try
                {
                    FromIdRaw = Convert.ToInt32(value);
                    PhantomFromId = value;
                }
                catch (System.Exception)
                {
                    FromIdRaw = 0;
                }
            }

            get
            {
                return FromIdRaw > 0 ? Convert.ToString(FromIdRaw) : PhantomFromId;
            }
        }

        [JsonIgnore]
        public string PhantomToId { get; set; }

        [JsonProperty("To")]
        public string ToId
        {
            set
            {
                PhantomToId = value;
                if (value == null) return;

                try
                {
                    ToIdRaw = Convert.ToInt32(value);
                    PhantomToId = value;
                }
                catch (System.Exception)
                {
                    ToIdRaw = 0;
                }
            }

            get
            {
                return ToIdRaw > 0 ? Convert.ToString(ToIdRaw) : PhantomToId;
            }
        }
    }

    public partial class DependencyMetadata
    {
        [JsonIgnore]
        public int FromIdRaw { get; set; }
        [JsonIgnore]
        public int ToIdRaw { get; set; }
        [JsonIgnore]
        public virtual Task FromTask { get; set; }
        [JsonIgnore]
        public virtual Task ToTask { get; set; }
    }
}
