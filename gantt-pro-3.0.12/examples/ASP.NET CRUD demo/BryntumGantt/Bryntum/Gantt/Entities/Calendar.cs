using Bryntum.CRUD.Entities;
using Bryntum.CRUD.Response;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bryntum.Gantt
{
    [MetadataType(typeof(CalendarMetadata))]
    public partial class Calendar : Node<Calendar>
    {

        public IList<String> DefaultAvailability
        {
            set
            {
                if (value == null)
                {
                    DefaultAvailabilityRaw = null;
                    return;
                }

                DefaultAvailabilityRaw = String.Join("|", value);
            }

            get
            {
                return String.IsNullOrEmpty(DefaultAvailabilityRaw) ? null : DefaultAvailabilityRaw.Split('|');
            }
        }

        public bool WeekendsAreWorkdays { get { return WeekendsAreWorkdaysRaw == 1; } }

        /// <summary>
        /// This property is used during serialization. It has calendar days collection.
        /// </summary>
        public LoadStoreResponse<CalendarDay> Days
        {
            get { return new LoadStoreResponse<CalendarDay>(CalendarDays); }
        }

        public override bool leaf { get { return ChildrenRaw.Count == 0; } }

        public virtual ICollection<Calendar> children
        { 
            get { if (!leaf) return ChildrenRaw; return null; }
            set { ChildrenRaw = value; } 
        }
    }

    public class CalendarMetadata : NodeMetadata<Calendar>
    {
        [JsonIgnore]
        public virtual ICollection<Calendar> ChildrenRaw { get; set; }
        [JsonIgnore]
        public string DefaultAvailabilityRaw { get; set; }
        [JsonIgnore]
        public Nullable<byte> WeekendsAreWorkdaysRaw { get; set; }
        [JsonIgnore]
        public virtual ICollection<CalendarDay> CalendarDays { get; set; }
        [JsonIgnore]
        public virtual ICollection<Task> Tasks { get; set; }
        [JsonIgnore]
        public virtual ICollection<Resource> Resources { get; set; }
    }
}
