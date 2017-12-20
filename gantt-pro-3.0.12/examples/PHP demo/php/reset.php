<?php
// initialize application
include 'init.php';

$app->db->exec('alter table assignments drop foreign key fk_assignments_resources');
$app->db->exec('alter table assignments drop foreign key fk_assignments_tasks');
$app->db->exec('alter table calendar_days drop foreign key fk_calendardays_calendars');
$app->db->exec('alter table calendars drop foreign key fk_calendars_calendars');
$app->db->exec('alter table dependencies drop foreign key fk_dependencies_tasks');
$app->db->exec('alter table dependencies drop foreign key fk_dependencies_tasks1');
$app->db->exec('alter table resources drop foreign key fk_resources_calendars');
$app->db->exec('alter table task_segments drop foreign key fk_task_segments_tasks');
$app->db->exec('alter table tasks drop foreign key fk_tasks_calendars');
$app->db->exec('alter table tasks drop foreign key fk_tasks_tasks');
//print_r($app->db->errorInfo());

$app->db->exec('truncate table dependencies');
$app->db->exec('truncate table calendar_days');
$app->db->exec('truncate table assignments');
$app->db->exec('truncate table resources');
$app->db->exec('truncate table calendars');
$app->db->exec('truncate table task_segments');
$app->db->exec('truncate table tasks');
$app->db->exec('truncate table options');

$app->db->exec('alter table assignments add constraint fk_assignments_resources foreign key(ResourceId) references resources (Id)');
$app->db->exec('alter table assignments add constraint fk_assignments_tasks foreign key(TaskId) references tasks (Id)');
$app->db->exec('alter table calendar_days add constraint fk_calendardays_calendars foreign key(CalendarId) references calendars (Id)');
$app->db->exec('alter table calendars add constraint fk_calendars_calendars foreign key(parentId) references calendars (Id)');
$app->db->exec('alter table dependencies add constraint fk_dependencies_tasks foreign key(FromId) references tasks (Id)');
$app->db->exec('alter table dependencies add constraint fk_dependencies_tasks1 foreign key(ToId) references tasks (Id)');
$app->db->exec('alter table resources add constraint fk_resources_calendars foreign key(CalendarId) references calendars (Id)');
$app->db->exec('alter table task_segments add constraint fk_task_segments_tasks foreign key(TaskId) references tasks (Id)');
$app->db->exec('alter table tasks add constraint fk_tasks_calendars foreign key(CalendarId) references calendars (Id)');
$app->db->exec('alter table tasks add constraint fk_tasks_tasks foreign key(parentId) references tasks (Id)');

// init server revision stamp
$app->insert('options', array('name' => 'revision', 'value' => '1'));
$app->insert('options', array('name' => 'projectCalendar', 'value' => '1'));
