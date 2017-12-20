using Bryntum.CRUD.Entities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bryntum.Gantt
{
    [MetadataType(typeof(CalendarDayMetadata))]
    public partial class CalendarDay : General
    {
        public bool IsWorkingDay { get { return IsWorkingDayRaw == 1; } }
        
        [JsonIgnore]
        public string PhantomCalendarId { set; get; }

        // Since CalendarId transfered from the client may contain a phantom calendar identifier
        // we cannot use just a EDM generated CalendarIdRaw property
        [JsonProperty("calendarId")]
        public string CalendarId
        {
            set
            {
                PhantomCalendarId = value;
                if (value == null) return;

                try
                {
                    CalendarIdRaw = Convert.ToInt32(value);
                    PhantomCalendarId = value;
                }
                catch (System.Exception)
                {
                    CalendarId = null;
                }
            }

            get
            {
                return Convert.ToString(CalendarIdRaw) ?? PhantomCalendarId;
            }
        }

        public IList<String> Availability
        {
            set
            {
                if (value == null)
                {
                    AvailabilityRaw = null;
                    return;
                }
                
                AvailabilityRaw = String.Join("|", value);
            }

            get
            {
                return String.IsNullOrEmpty(AvailabilityRaw) ? null : AvailabilityRaw.Split('|');
            }
        }
    }

    public partial class CalendarDayMetadata
    {
        [JsonIgnore]
        public string AvailabilityRaw { get; set; }
        [JsonIgnore]
        public int CalendarIdRaw { get; set; }
        [JsonIgnore]
        public Nullable<byte> IsWorkingDayRaw { get; set; }
        [JsonIgnore]
        public virtual Calendar Calendar { get; set; }
    }
}
