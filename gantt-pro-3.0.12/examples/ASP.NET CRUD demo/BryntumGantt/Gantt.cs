using Bryntum.CRUD.Exception;
using System;
using System.Collections.Generic;
using System.Linq;
using Bryntum.Gantt.Exception;

namespace Bryntum.Gantt
{
    public class Gantt
    {
        public GanttEntities context;

        /// <summary>
        /// A dictionary keeping phantom to real Id references for all tables.
        /// </summary>
        public IDictionary<String, IDictionary<String, int>> AddedIds { get; set; }

        public IDictionary<String, IDictionary<int, IDictionary<string, object>>> RemovedRows { get; set; }

        public IDictionary<String, IDictionary<int, IDictionary<string, object>>> UpdatedRows { get; set; }

        public Gantt()
        {
            context = new GanttEntities();
        }

        /// <summary>
        /// Gets a task segment by its identifier.
        /// </summary>
        /// <param name="id">Segment identifier.</param>
        /// <returns>Task segment.</returns>
        public TaskSegment getTaskSegment(int id)
        {
            return context.TaskSegments.Find(id);
        }

        /// <summary>
        /// Saves a task segment to the database. Creates a new or updates exisitng record depending on Id value.
        /// </summary>
        /// <param name="segment">Segment to save.</param>
        public void saveTaskSegment(TaskSegment segment)
        {
            if (segment.Id > 0)
            {
                var entity = getTaskSegment(segment.Id);
                if (entity == null) throw new CrudException("Cannot find task segment #" + segment.Id, GanttCodes.TASK_SEGMENT_NOT_FOUND);

                // update record
                entity.Duration = segment.Duration;
                entity.DurationUnit = segment.DurationUnit;
                entity.StartDate = segment.StartDate;
                entity.EndDate = segment.EndDate;
                entity.Cls = segment.Cls;
                context.SaveChanges();
            }
            else
            {
                // create new record
                context.TaskSegments.Add(segment);
                context.SaveChanges();
            }

            updateRevision();
        }

        /// <summary>
        /// Removes all segments of provided task from the database.
        /// </summary>
        /// <param name="task">Task segments of which to be removed.</param>
        public void removeTaskSegments(Task task)
        {
            IList<TaskSegment> toRemove = context.TaskSegments.Where(s => s.TaskIdRaw == task.Id).ToList();

            foreach (TaskSegment segment in toRemove)
            {
                context.TaskSegments.Remove(segment);
            }
        }

        /// <summary>
        /// Removes a task segment from the database.
        /// </summary>
        /// <param name="segment">Task segment to remove.</param>
        public void removeTask(TaskSegment segment, bool force = false)
        {
            TaskSegment entity = getTaskSegment(segment.Id);
            if (entity != null)
            {
                context.TaskSegments.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        public void saveTaskSegments(Task task, ICollection<TaskSegment> segments) 
        {
            // if list of segments is not empty
            if (segments != null && segments.Count > 0) {
                IList<int> ids = new List<int>();

                // persist each segment
                foreach (TaskSegment segment in segments) 
                {
                    segment.TaskIdRaw = task.Id;
                    saveTaskSegment(segment);
                    // remember id of persisted segment
                    ids.Add(segment.Id);
                }

                // and finally cleanup all segments except passed ones
                try {
                    IList<TaskSegment> toRemove = context.TaskSegments. Where(s => s.TaskIdRaw == task.Id && !ids.Contains(s.Id)).ToList();
                    
                    foreach (TaskSegment segment in toRemove)
                    {
                        context.TaskSegments.Remove(segment);
                    }

                } catch (System.Exception) {
                    throw new CrudException("Cannot remove task segments #" + task.Id + ".", GanttCodes.REMOVE_TASK_SEGMENTS);
                }

            // if passed list is empty we remove existing records
            } else {
                removeTaskSegments(task);
            }

            updateRevision();
        }

        /// <summary>
        /// Gets a task by its identifier.
        /// </summary>
        /// <param name="id">Task identifier.</param>
        /// <returns>Task.</returns>
        public Task getTask(int id)
        {
            return context.Tasks.Find(id);
        }

        /// <summary>
        /// Gets list of existing tasks.
        /// </summary>
        /// <returns>List of tasks.</returns>
        public IEnumerable<Task> getTasks()
        {
            return context.Tasks.Where(t => !t.parentIdRaw.HasValue).OrderBy(t => t.index);
        }

        /// <summary>
        /// Saves a task to the database. Creates a new or updates exisitng record depending on Id value.
        /// </summary>
        /// <param name="task">Task to save.</param>
        public void saveTask(Task task)
        {
            if (task.Id > 0)
            {
                var entity = getTask(task.Id);
                if (entity == null) throw new CrudException("Cannot find task #" + task.Id, GanttCodes.TASK_NOT_FOUND);

                // update record
                entity.Name = task.Name;
                entity.parentId = task.parentId;
                entity.Duration = task.Duration;
                entity.DurationUnit = task.DurationUnit;
                entity.PercentDone = task.PercentDone;
                entity.StartDate = task.StartDate;
                entity.EndDate = task.EndDate;
                entity.SchedulingMode = task.SchedulingMode;
                entity.Cls = task.Cls;
                entity.CalendarId = task.CalendarId;
                entity.BaselineStartDate = task.BaselineStartDate;
                entity.BaselineEndDate = task.BaselineEndDate;
                entity.BaselinePercentDone = task.BaselinePercentDone;
                entity.Effort = task.Effort;
                entity.EffortUnit = task.EffortUnit;
                entity.Note = task.Note;
                entity.ConstraintDate = task.ConstraintDate;
                entity.ConstraintType = task.ConstraintType;
                entity.ManuallyScheduled = task.ManuallyScheduled;
                entity.Draggable = task.Draggable;
                entity.Resizable = task.Resizable;
                entity.Rollup = task.Rollup;
                entity.Color = task.Color;
                entity.ShowInTimeline = task.ShowInTimeline;
                entity.expanded = task.expanded;

                saveTaskSegments(entity, task.Segments);
                context.SaveChanges();
            }
            else
            {
                // create new record
                context.Tasks.Add(task);
                //saveTaskSegments(task, task.Segments);
                context.SaveChanges();
                // let's keep mapping from phantom to real Id
                AddedIds["tasks"].Add(task.PhantomId, task.Id);
            }

            updateRevision();
        }

        /// <summary>
        /// Removes a task from the database.
        /// </summary>
        /// <param name="task">Task to remove.</param>
        public void removeTask(Task task, bool force = false)
        {
            Task entity = getTask(task.Id);
            if (entity != null)
            {
                int id = entity.Id;

                if (entity.children != null && !force)
                    throw new CrudException("Cannot remove task having sub-tasks #" + task.Id, GanttCodes.REMOVE_USED_TASK);

                foreach (Task subTask in entity.ChildrenRaw.ToList())
                {
                    removeTask(subTask);

                    var tsk = new Dictionary<string, object>();
                    tsk.Add("Id", subTask.Id);
                    RemovedRows["tasks"].Add(subTask.Id, tsk);
                }
                foreach (Assignment assignment in entity.Assignments.ToList())
                {
                    removeAssignment(assignment);

                    var asgn = new Dictionary<string, object>();
                    asgn.Add("Id", assignment.Id);
                    RemovedRows["assignments"].Add(assignment.Id, asgn);
                }
                foreach (Dependency predecessor in entity.Predecessors.ToList())
                {
                    removeDependency(predecessor);

                    var item = new Dictionary<string, object>();
                    item.Add("Id", predecessor.Id);
                    RemovedRows["dependencies"].Add(predecessor.Id, item);
                }
                foreach (Dependency successor in entity.Successors.ToList())
                {
                    removeDependency(successor);

                    var item = new Dictionary<string, object>();
                    item.Add("Id", successor.Id);
                    RemovedRows["dependencies"].Add(successor.Id, item);
                }
                
                context.Tasks.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        /// <summary>
        /// Gets an assignment by its identifier.
        /// </summary>
        /// <param name="id">Assignment identifier.</param>
        /// <returns>Assignment.</returns>
        public Assignment getAssignment(int id)
        {
            return context.Assignments.Find(id);
        }

        /// <summary>
        /// Gets list of existing assignments.
        /// </summary>
        /// <returns>List of assignments.</returns>
        public IEnumerable<Assignment> getAssignments()
        {
            return context.Assignments;
        }

        /// <summary>
        /// Saves an assignment to the database. Either creates a new or updates existing record depending on Id value.
        /// </summary>
        /// <param name="assignment">Assignment to save.</param>
        public void saveAssignment(Assignment assignment)
        {
            if (assignment.Id > 0)
            {
                var entity = getAssignment(assignment.Id);
                if (entity == null) throw new CrudException("Cannot find assignment #" + assignment.Id, GanttCodes.ASSIGNMENT_NOT_FOUND);
                
                entity.TaskId = assignment.TaskId;
                entity.ResourceId = assignment.ResourceId;
                entity.Units = assignment.Units;
            }
            else
            {
                context.Assignments.Add(assignment);
            }

            context.SaveChanges();
            updateRevision();
        }

        /// <summary>
        /// Removes an assignment from the database.
        /// </summary>
        /// <param name="assignment">Assignment to remove.</param>
        public void removeAssignment(Assignment assignment)
        {
            Assignment entity = getAssignment(assignment.Id);
            if (entity != null)
            {
                int id = entity.Id;
                context.Assignments.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        /// <summary>
        /// Gets a resource by its identifier.
        /// </summary>
        /// <param name="id">Resource identifier.</param>
        /// <returns>Resource.</returns>
        public Resource getResource(int id)
        {
            return context.Resources.Find(id);
        }

        /// <summary>
        /// Gets list of existing resources.
        /// </summary>
        /// <returns>List of resources.</returns>
        public IEnumerable<Resource> getResources()
        {
            return context.Resources;
        }

        /// <summary>
        /// Saves a resource to the database. Either creates a new or updates existing record (depending on Id value).
        /// </summary>
        /// <param name="resource">Resource to save.</param>
        public void saveResource(Resource resource)
        {
            if (resource.Id > 0)
            {
                var entity = getResource(resource.Id);
                if (entity == null) throw new CrudException("Cannot find resource #" + resource.Id, GanttCodes.RESOURCE_NOT_FOUND);

                entity.Name = resource.Name;
                entity.CalendarId = resource.CalendarId;
                context.SaveChanges();
            }
            else
            {
                context.Resources.Add(resource);
                context.SaveChanges();
                // let's keep mapping from phantom to real Id
                AddedIds["resources"].Add(resource.PhantomId, resource.Id);
            }

            updateRevision();
        }

        /// <summary>
        /// Removes a resource from the database.
        /// </summary>
        /// <param name="resource">Resource to remove.</param>
        public void removeResource(Resource resource, bool force = false)
        {
            Resource entity = getResource(resource.Id);
            if (entity != null)
            {
                int id = entity.Id;

                if (entity.Assignments.Count > 0 && !force)
                    throw new CrudException("Cannot remove resource being used #" + resource.Id, GanttCodes.REMOVE_USED_RESOURCE);
                
                foreach (Assignment assignment in entity.Assignments.ToList()) removeAssignment(assignment);

                context.Resources.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        /// <summary>
        /// Gets a dependency by its identifier.
        /// </summary>
        /// <param name="id">Dependency identifier.</param>
        /// <returns></returns>
        public Dependency getDependency(int id)
        {
            return context.Dependencies.Find(id);
        }

        /// <summary>
        /// Gets list of existing dependencies.
        /// </summary>
        /// <returns>List of dependencies.</returns>
        public IEnumerable<Dependency> getDependencies()
        {
            return context.Dependencies;
        }

        /// <summary>
        /// Saves a dependency to the database. Either creates a new or updates existing record depending on Id value.
        /// </summary>
        /// <param name="dependency">Dependency to save.</param>
        public void saveDependency(Dependency dependency)
        {
            if (dependency.Id > 0)
            {
                var entity = getDependency(dependency.Id);
                if (entity == null) throw new CrudException("Cannot find dependency #" + dependency.Id, GanttCodes.DEPENDENCY_NOT_FOUND);

                entity.FromId = dependency.FromId;
                entity.ToId = dependency.ToId;
                entity.Type = dependency.Type;
                entity.Cls = dependency.Cls;
                entity.Lag = dependency.Lag;
                entity.LagUnit = dependency.LagUnit;
            }
            else
            {
                context.Dependencies.Add(dependency);
            }

            context.SaveChanges();
            updateRevision();
        }

        /// <summary>
        /// Removes a dependency from the database.
        /// </summary>
        /// <param name="dependency">Dependency to remove.</param>
        public void removeDependency(Dependency dependency)
        {
            Dependency entity = getDependency(dependency.Id);
            if (entity != null)
            {
                int id = entity.Id;
                context.Dependencies.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        /// <summary>
        /// Gets a calendar day by its identifier.
        /// </summary>
        /// <param name="id">Calendar day identifier.</param>
        /// <returns></returns>
        public CalendarDay getCalendarDay(int id)
        {
            return context.CalendarDays.Find(id);
        }

        /// <summary>
        /// Gets list of specific calendar's days.
        /// </summary>
        /// <param name="calendarId">Calendar identifier.</param>
        /// <returns></returns>
        public IEnumerable<CalendarDay> getCalendarDays(int calendarId)
        {
            return context.CalendarDays.Where(cd => cd.CalendarIdRaw == calendarId);
        }

        /// <summary>
        /// Saves a calendar day. Either creates a new or updates existing record (depending on Id field value).
        /// </summary>
        /// <param name="day">A calendar day to save.</param>
        public void saveCalendarDay(CalendarDay day)
        {
            if (day.Id > 0)
            {
                var entity = getCalendarDay(day.Id);
                if (entity == null) throw new CrudException("Cannot find day #" + day.Id, GanttCodes.CALENDAR_DAY_NOT_FOUND);

                entity.CalendarId = day.CalendarId;
                entity.Name = day.Name;
                entity.Type = day.Type;
                entity.Date = day.Date;
                entity.Availability = day.Availability;
                entity.Weekday = day.Weekday;
                entity.OverrideStartDate = day.OverrideStartDate;
                entity.OverrideEndDate = day.OverrideEndDate;
                entity.IsWorkingDayRaw = day.IsWorkingDayRaw;
                entity.Cls = day.Cls;
            }
            else
            {
                context.CalendarDays.Add(day);
            }

            context.SaveChanges();
            updateRevision();
        }

        /// <summary>
        /// Removes a calendar day.
        /// </summary>
        /// <param name="day">A calendar day to remove.</param>
        public void removeCalendarDay(CalendarDay day)
        {
            CalendarDay entity = getCalendarDay(day.Id);
            if (entity != null)
            {
                int id = entity.Id;
                context.CalendarDays.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        /// <summary>
        /// Gets a calendar by its identifier.
        /// </summary>
        /// <param name="id">A calendar identifier.</param>
        /// <returns>Calendar.</returns>
        public Calendar getCalendar(int id)
        {
            return context.Calendars.Find(id);
        }

        /// <summary>
        /// Gets list of existing calendars.
        /// </summary>
        /// <returns>List of calendars.</returns>
        public IEnumerable<Calendar> getCalendars()
        {
            return context.Calendars.Where(c => !c.parentIdRaw.HasValue);
        }

        /// <summary>
        /// Saves a calendar to the database. Either creates a new or updates existing record (depending on Id value).
        /// </summary>
        /// <param name="calendar">Calendar to save.</param>
        public void saveCalendar(Calendar calendar)
        {
            if (calendar.Id > 0)
            {
                var entity = getCalendar(calendar.Id);
                if (entity == null) throw new CrudException("Cannot find calendar #" + calendar.Id, GanttCodes.CALENDAR_NOT_FOUND);

                entity.parentId = calendar.parentId;
                entity.PhantomId = calendar.PhantomId;
                entity.PhantomParentId = calendar.PhantomParentId;
                entity.Name = calendar.Name;
                entity.DaysPerMonth = calendar.DaysPerMonth;
                entity.DaysPerWeek = calendar.DaysPerWeek;
                entity.HoursPerDay = calendar.HoursPerDay;
                entity.WeekendsAreWorkdaysRaw = calendar.WeekendsAreWorkdaysRaw;
                entity.WeekendFirstDay = calendar.WeekendFirstDay;
                entity.WeekendSecondDay = calendar.WeekendSecondDay;
                entity.DefaultAvailability = calendar.DefaultAvailability;
                context.SaveChanges();
            }
            else
            {
                context.Calendars.Add(calendar);
                context.SaveChanges();
                // let's keep mapping from phantom to real Id
                AddedIds["calendars"].Add(calendar.PhantomId, calendar.Id);
            }

            updateRevision();
        }

        /// <summary>
        /// Removes a calendar.
        /// </summary>
        /// <param name="calendar">A calendar to remove.</param>
        /// <param name="force">True to automatically reset all references to the removed calendar</param>
        public void removeCalendar(Calendar calendar, bool force = false)
        {
            Calendar entity = getCalendar(calendar.Id);
            if (entity != null)
            {
                int id = entity.Id;
                
                if (force)
                {
                    foreach (Calendar child in entity.ChildrenRaw.ToList())
                    {
                        child.parentIdRaw = null;
                        saveCalendar(child);

                        var cal = new Dictionary<string, object>();
                        cal.Add("Id", child.Id);
                        cal.Add("parentId", null);
                        UpdatedRows["calendars"].Add(child.Id, cal);
                    }
                    foreach (Resource resource in entity.Resources.ToList())
                    {
                        resource.CalendarIdRaw = null;
                        saveResource(resource);

                        var res = new Dictionary<string, object>();
                        res.Add("Id", resource.Id);
                        res.Add("CalendarId", null);
                        UpdatedRows["resources"].Add(resource.Id, res);
                    }
                    foreach (Task task in entity.Tasks.ToList())
                    {
                        task.CalendarIdRaw = null;
                        saveTask(task);

                        var tsk = new Dictionary<string, object>();
                        tsk.Add("Id", task.Id);
                        tsk.Add("CalendarId", null);
                        UpdatedRows["tasks"].Add(task.Id, tsk);
                    }
                }
                else
                {
                    if (entity.ChildrenRaw.Count > 0)
                        throw new CrudException("Cannot remove calendar #" + calendar.Id + " it has child calendars", GanttCodes.CALENDAR_HAS_CALENDARS);
                    
                    if (entity.Resources.Count > 0)
                        throw new CrudException("Cannot remove calendar #" + calendar.Id + " it's used by a resource", GanttCodes.CALENDAR_USED_BY_RESOURCE);
                    
                    if (entity.Tasks.Count > 0)
                        throw new CrudException("Cannot remove calendar #" + calendar.Id + " it's used by a task", GanttCodes.CALENDAR_USED_BY_TASK);
                }
                
                // drop calendar days
                foreach (CalendarDay day in entity.CalendarDays.ToList()) removeCalendarDay(day);

                context.Calendars.Remove(entity);
                context.SaveChanges();
                updateRevision();
            }
        }

        /// <summary>
        /// Sets an arbitrary application option value.
        /// </summary>
        /// <param name="option">Option name.</param>
        /// <param name="val">Option value.</param>
        public void setOption(string option, string val)
        {
            var entity = context.Options.Find(option);
            if (entity == null) {
                context.Options.Add(new Option { name = option, value = val });
            }
            else
            {
                entity.value = val;
            }
            context.SaveChanges();
        }

        /// <summary>
        /// Gets an application option value.
        /// </summary>
        /// <param name="option">Option name.</param>
        /// <param name="reload">True to force value reading from the database. False to get cached value.</param>
        /// <returns>Option value.</returns>
        public string getOption(string option, bool reload = false)
        {
            var entity = context.Options.Find(option);
            if (entity == null) throw new CrudException("Cannot get option " + option + ".", Codes.GET_OPTION);

            if (reload) context.Entry(entity).Reload();

            return entity.value;
        }
        
        /// <summary>
        /// Gets current server revision stamp.
        /// </summary>
        /// <returns>Server revision stamp.</returns>
        public int getRevision() {
            return Convert.ToInt32(getOption("revision", true));
        }

        /// <summary>
        /// Increments server revision stamp.
        /// </summary>
        public void updateRevision() {
            try {
                setOption("revision", Convert.ToString(getRevision() + 1));
            } catch (System.Exception) {
                throw new CrudException("Cannot update server revision stamp.", Codes.UPDATE_REVISION);
            }
        }

        /// <summary>
        /// Checks if specified revision stamp is not older than current server one.
        /// </summary>
        /// <param name="revision">Revision stamp to check.</param>
        /// <exception cref="CrudException">If specified revision is older than server one method throws CrudException with code OUTDATED_REVISION.</exception>
        public void checkRevision(int? revision) {
            if (revision.HasValue && revision > 0 && getRevision() > revision) {
                throw new CrudException("Client data snapshot is outdated please reload you stores before.", Codes.OUTDATED_REVISION);
            }
        }

        /// <summary>
        /// Gets the project calendar identifier.
        /// </summary>
        /// <returns>Identifier of the project calendar.</returns>
        public int getProjectCalendarId() {
            return Convert.ToInt32(getOption("projectCalendar"));
        }

        /// <summary>
        /// Initializes structures to keep mapping between phantom and real Ids
        /// and lists of implicitly updated and removed records dictionaries.
        /// </summary>
        public void InitRowsHolders()
        {
            AddedIds = new Dictionary<String, IDictionary<string, int>>();

            AddedIds.Add("tasks", new Dictionary<String, int>());
            AddedIds.Add("calendars", new Dictionary<String, int>());
            AddedIds.Add("resources", new Dictionary<String, int>());

            UpdatedRows = new Dictionary<String, IDictionary<int, IDictionary<string, object>>>();

            UpdatedRows.Add("tasks", new Dictionary<int, IDictionary<string, object>>());
            UpdatedRows.Add("calendars", new Dictionary<int, IDictionary<string, object>>());
            UpdatedRows.Add("resources", new Dictionary<int, IDictionary<string, object>>());

            RemovedRows = new Dictionary<String, IDictionary<int, IDictionary<string, object>>>();

            RemovedRows.Add("tasks", new Dictionary<int, IDictionary<string, object>>());
            RemovedRows.Add("calendars", new Dictionary<int, IDictionary<string, object>>());
            RemovedRows.Add("calendardays", new Dictionary<int, IDictionary<string, object>>());
            RemovedRows.Add("resources", new Dictionary<int, IDictionary<string, object>>());
            RemovedRows.Add("assignments", new Dictionary<int, IDictionary<string, object>>());
            RemovedRows.Add("dependencies", new Dictionary<int, IDictionary<string, object>>());
        }

        public bool HasUpdatedRows(String table)
        {
            return UpdatedRows.ContainsKey(table) && UpdatedRows[table].Count > 0;
        }

        public IList<IDictionary<string, object>> GetUpdatedRows(String table)
        {
            if (!HasUpdatedRows(table)) return null;

            return UpdatedRows[table].Values.ToList();
        }

        public bool HasRemovedRows(String table)
        {
            return RemovedRows.ContainsKey(table) && RemovedRows[table].Count > 0;
        }

        public IList<IDictionary<string, object>> GetRemovedRows(String table)
        {
            if (!HasRemovedRows(table)) return null;

            return RemovedRows[table].Values.ToList();
        }

        /// <summary>
        /// Gets real record identifier matching specified phantom one.
        /// </summary>
        /// <param name="table">Table name.</param>
        /// <param name="phantomId">Phantom identifier.</param>
        /// <returns>Real record identifier.</returns>
        public int? getIdByPhantom(String table, String phantomId)
        {
            if (!AddedIds.ContainsKey(table)) return null;
            IDictionary<String, int> map = AddedIds[table];
            if (map == null) return null;

            // get real task Id
            if (phantomId != null && map.ContainsKey(phantomId))
            {
                return map[phantomId];
            }

            return null;
        }

        /// <summary>
        /// Gets real task identifier by specified phantom one.
        /// </summary>
        /// <param name="phantomId">Task phantom identifier.</param>
        /// <returns>Task real identifier.</returns>
        public int? getTaskIdByPhantom(String phantomId) {
            return getIdByPhantom("tasks", phantomId);
        }

        /// <summary>
        /// Gets real resource identifier by specified phantom one.
        /// </summary>
        /// <param name="phantomId">Resource phantom identifier.</param>
        /// <returns>Resource real identifier.</returns>
        public int? getResourceIdByPhantom(String phantomId) {
            return getIdByPhantom("resources", phantomId);
        }

        /// <summary>
        /// Gets real calendar identifier by specified phantom one.
        /// </summary>
        /// <param name="phantomId">Calendar phantom identifier.</param>
        /// <returns>Calendar real identifier.</returns>
        public int? getCalendarIdByPhantom(String phantomId) {
            return getIdByPhantom("calendars", phantomId);
        }

        /// <summary>
        /// Back-end test handler providing database cleanup.
        /// TODO: WARNING! This code clears the database. Please get rid of this code before running it on production.
        /// </summary>
        public void Reset()
        {
            var db = context.Database;

            // first let's drop foreign keys to be able to truncate tables
            db.ExecuteSqlCommand("ALTER TABLE [Assignments] DROP CONSTRAINT [FK_Assignments_Resources]");
            db.ExecuteSqlCommand("ALTER TABLE [Assignments] DROP CONSTRAINT [FK_Assignments_Tasks]");
            db.ExecuteSqlCommand("ALTER TABLE [CalendarDays] DROP CONSTRAINT [FK_CalendarDays_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Calendars] DROP CONSTRAINT [FK_Calendars_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Dependencies] DROP CONSTRAINT [FK_Dependencies_Tasks]");
            db.ExecuteSqlCommand("ALTER TABLE [Dependencies] DROP CONSTRAINT [FK_Dependencies_Tasks1]");
            db.ExecuteSqlCommand("ALTER TABLE [Resources] DROP CONSTRAINT [FK_Resources_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Tasks] DROP CONSTRAINT [FK_Tasks_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Tasks] DROP CONSTRAINT [FK_Tasks_Tasks]");
            db.ExecuteSqlCommand("ALTER TABLE [TaskSegments] DROP CONSTRAINT [FK_TaskSegments_Tasks]");

            // now we truncate tables
            db.ExecuteSqlCommand("TRUNCATE TABLE [Dependencies]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [TaskSegments]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [Tasks]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [Assignments]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [CalendarDays]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [Resources]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [Calendars]");
            db.ExecuteSqlCommand("TRUNCATE TABLE [options]");

            // and finally we restore foreign keys back
            db.ExecuteSqlCommand("ALTER TABLE [Assignments] WITH CHECK ADD CONSTRAINT [FK_Assignments_Resources] FOREIGN KEY([ResourceId]) REFERENCES [Resources] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Assignments] CHECK CONSTRAINT [FK_Assignments_Resources]");
            db.ExecuteSqlCommand("ALTER TABLE [Assignments] WITH CHECK ADD CONSTRAINT [FK_Assignments_Tasks] FOREIGN KEY([TaskId]) REFERENCES [Tasks] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Assignments] CHECK CONSTRAINT [FK_Assignments_Tasks]");
            db.ExecuteSqlCommand("ALTER TABLE [CalendarDays] WITH CHECK ADD CONSTRAINT [FK_CalendarDays_Calendars] FOREIGN KEY([calendarId]) REFERENCES [Calendars] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [CalendarDays] CHECK CONSTRAINT [FK_CalendarDays_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Calendars] WITH CHECK ADD CONSTRAINT [FK_Calendars_Calendars] FOREIGN KEY([parentId]) REFERENCES [Calendars] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Calendars] CHECK CONSTRAINT [FK_Calendars_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Dependencies] WITH NOCHECK ADD CONSTRAINT [FK_Dependencies_Tasks] FOREIGN KEY([FromId]) REFERENCES [Tasks] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Dependencies] NOCHECK CONSTRAINT [FK_Dependencies_Tasks]");
            db.ExecuteSqlCommand("ALTER TABLE [Dependencies] WITH NOCHECK ADD CONSTRAINT [FK_Dependencies_Tasks1] FOREIGN KEY([ToId]) REFERENCES [Tasks] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Dependencies] NOCHECK CONSTRAINT [FK_Dependencies_Tasks1]");
            db.ExecuteSqlCommand("ALTER TABLE [Resources] WITH CHECK ADD CONSTRAINT [FK_Resources_Calendars] FOREIGN KEY([CalendarId]) REFERENCES [Calendars] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Resources] CHECK CONSTRAINT [FK_Resources_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Tasks] WITH NOCHECK ADD CONSTRAINT [FK_Tasks_Calendars] FOREIGN KEY([CalendarId]) REFERENCES [Calendars] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Tasks] NOCHECK CONSTRAINT [FK_Tasks_Calendars]");
            db.ExecuteSqlCommand("ALTER TABLE [Tasks] WITH NOCHECK ADD CONSTRAINT [FK_Tasks_Tasks] FOREIGN KEY([parentId]) REFERENCES [Tasks] ([Id])");
            db.ExecuteSqlCommand("ALTER TABLE [Tasks] NOCHECK CONSTRAINT [FK_Tasks_Tasks]");
            db.ExecuteSqlCommand("ALTER TABLE [TaskSegments] WITH NOCHECK ADD CONSTRAINT [FK_TaskSegments_Tasks] FOREIGN KEY([TaskId]) REFERENCES [Tasks] ([Id]) ON UPDATE CASCADE ON DELETE CASCADE");
            db.ExecuteSqlCommand("ALTER TABLE [TaskSegments] NOCHECK CONSTRAINT [FK_TaskSegments_Tasks]");

            // initialize server revision stamp
            setOption("revision", "1");
            setOption("projectCalendar", "1");
        }
    }
}
