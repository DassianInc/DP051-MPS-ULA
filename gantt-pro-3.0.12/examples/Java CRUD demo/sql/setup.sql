SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

DROP TABLE IF EXISTS `calendar_days`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `dependencies`;
DROP TABLE IF EXISTS `task_segments`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `calendars`;
DROP TABLE IF EXISTS `options`;

CREATE TABLE `calendars` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `parentId` int(11) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `DaysPerMonth` int(11) DEFAULT NULL,
  `DaysPerWeek` int(11) DEFAULT NULL,
  `HoursPerDay` int(11) DEFAULT NULL,
  `WeekendsAreWorkdays` tinyint(4) DEFAULT NULL,
  `WeekendFirstDay` int(11) DEFAULT NULL,
  `WeekendSecondDay` int(11) DEFAULT NULL,
  `DefaultAvailability` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`parentId`),
  CONSTRAINT fk_calendars_calendars FOREIGN KEY (`parentId`) REFERENCES `calendars`(`Id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

INSERT INTO `calendars` (`ParentId`,`Name`,`DaysPerMonth`,`DaysPerWeek`,`HoursPerDay`,`WeekendsAreWorkdays`,`WeekendFirstDay`,`WeekendSecondDay`,`DefaultAvailability`) VALUES
(null, 'General', 20, 5, 8, 0, 6, 0, '08:00-12:00|13:00-17:00'),
(1, 'Holidays', 20, 5, 8, 0, 6, 0, '08:00-12:00'),
(null, 'Night shift', 20, 5, 8, 0, 6, 0, '00:00-06:00|22:00-24:00');

CREATE TABLE IF NOT EXISTS `calendar_days` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `calendarId` int(11) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `Typ` varchar(45) DEFAULT NULL,
  `Dt` date DEFAULT NULL,
  `Availability` varchar(255) DEFAULT NULL,
  `Weekday` int(11) DEFAULT NULL,
  `OverrideStartDate` date DEFAULT NULL,
  `OverrideEndDate` date DEFAULT NULL,
  `IsWorkingDay` tinyint(4) DEFAULT '0',
  `Cls` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`calendarId`),
  CONSTRAINT fk_calendardays_calendars FOREIGN KEY (`calendarId`) REFERENCES `calendars`(`Id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

INSERT INTO `calendar_days` (`calendarId`,`Name`,`Typ`,`Dt`,`Availability`,`Weekday`,`OverrideStartDate`,`OverrideEndDate`,`IsWorkingDay`,`Cls`) VALUES
(1, 'Some big holiday', 'DAY', '2010-01-14', null, null, null, null, 0, 'gnt-national-holiday'),
(2, 'Mats''s birthday', 'DAY', '2010-01-13', null, null, null, null, 0, 'gnt-national-holiday'),
(2, 'Bryntum company holiday', 'DAY', '2010-02-01', null, null, null, null, 0, 'gnt-company-holiday'),
(2, 'Bryntum 1st birthday', 'DAY', '2010-12-01', null, null, null, null, 0, null),
(2, 'Half working day', 'DAY', '2012-03-27', '08:00-12:00', null, null, null, 1, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, null, -1, '2012-03-25', '2012-03-31', 0, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, null, 0, '2012-03-25', '2012-03-31', 0, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, '08:00-12:00', 1,'2012-03-25', '2012-03-31', 1, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, '13:00-15:00', 2,'2012-03-25', '2012-03-31', 1, NULL),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, null, 3, '2012-03-25', '2012-03-31', 0, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, '08:00-12:00', 4, '2012-03-25', '2012-03-31', 1, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, null, 5, '2012-03-25', '2012-03-31', 0, null),
(2, 'Non standard week', 'WEEKDAYOVERRIDE', null, null, 6, '2012-03-25', '2012-03-31', 0, null),
(2, 'Non standard feb week', 'WEEKDAYOVERRIDE', null, null, -1, '2012-02-25', '2012-02-28', 0, null),
(2, 'Non standard feb week', 'WEEKDAYOVERRIDE', null, null, 0, '2012-02-25', '2012-02-28', 0, null),
(2, 'Non standard feb week', 'WEEKDAYOVERRIDE', null, '08:00-12:00', 1, '2012-02-25', '2012-02-28', 1, null),
(2, 'Non standard feb week', 'WEEKDAYOVERRIDE', null, '13:00-15:00', 2, '2012-02-25', '2012-02-28', 1, null);


CREATE TABLE IF NOT EXISTS `tasks` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `parentId` int(11) DEFAULT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `Effort` float(11, 2) DEFAULT NULL,
  `EffortUnit` varchar(255) DEFAULT 'h',
  `Duration` float(11, 2) unsigned DEFAULT NULL,
  `DurationUnit` varchar(255) DEFAULT NULL,
  `PercentDone` int(11) unsigned DEFAULT NULL,
  `SchedulingMode` varchar(255) DEFAULT NULL,
  `BaselineStartDate` datetime DEFAULT NULL,
  `BaselineEndDate` datetime DEFAULT NULL,
  `BaselinePercentDone` int(11) unsigned DEFAULT NULL,
  `Note` text DEFAULT '',
  `ConstraintType` varchar(255) DEFAULT NULL,
  `ConstraintDate` datetime DEFAULT NULL,
  `ManuallyScheduled` tinyint DEFAULT 0,
  `Draggable` tinyint DEFAULT 1,
  `Resizable` tinyint DEFAULT 1,
  `Rollup` tinyint DEFAULT 0,
  `Cls` varchar(255) DEFAULT NULL,
  `Color` varchar(255) DEFAULT NULL,
  `ShowInTimeline` tinyint DEFAULT 0,
  `idx` INT(11) DEFAULT 0,
  `expanded` tinyint DEFAULT 0,
  `CalendarId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`parentId`),
  CONSTRAINT fk_tasks_tasks FOREIGN KEY (`parentId`) REFERENCES `tasks`(`Id`),
  INDEX (`CalendarId`),
  CONSTRAINT fk_tasks_calendars FOREIGN KEY (`CalendarId`) REFERENCES `calendars`(`Id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

INSERT INTO `tasks` (`parentId`,`Name`,`StartDate`,`EndDate`,`Duration`,`DurationUnit`,`PercentDone`,`Cls`,`idx`,`CalendarId`, `expanded`, `ShowInTimeline`) VALUES
(NULL,'Main project','2012-09-03 08:00:00','2012-12-25 17:00:00',82,'d',11,'',0,NULL,1,0),
(NULL,'Second project','2012-09-17 08:00:00','2012-10-30 17:00:00',32,'d',0,'',1,NULL,1,0),
(NULL,'Release','2012-12-25 17:00:00','2012-12-25 17:00:00',0,'d',0,'',2,NULL,0,1),
(1,'Initial phase','2012-09-03 08:00:00','2012-10-05 17:00:00',25,'d',70,'',0,NULL,0,0),
(1,'Alpha','2012-10-08 08:00:00','2012-11-06 17:00:00',22,'d',0,'',1,NULL,0,1),
(1,'Beta','2012-10-29 08:00:00','2012-12-25 17:00:00',42,'d',0,'',2,NULL,0,1),
(1,'Marketing','2012-11-12 08:00:00','2012-12-25 17:00:00',32,'d',0,'',3,NULL,0,1),
(2,'Research','2012-09-17 08:00:00','2012-10-30 17:00:00',32,'d',60,'',0,NULL,0,0),
(2,'Test implementation','2012-10-30 17:00:00','2012-10-30 17:00:00',0,'d',0,'',1,NULL,0,0),
(5,'Research','2012-10-08 08:00:00','2012-10-19 17:00:00',10,'d',0,'',0,NULL,0,0),
(5,'First implementation','2012-10-22 08:00:00','2012-10-26 17:00:00',5,'d',0,'',1,NULL,0,0),
(5,'Tests','2012-10-25 08:00:00','2012-11-06 17:00:00',9,'d',0,'',2,NULL,0,0),
(6,'Refactoring after Alpha','2012-10-29 08:00:00','2012-11-09 17:00:00',10,'d',0,'',0,NULL,0,0),
(6,'Tests','2012-11-12 08:00:00','2012-11-16 17:00:00',5,'d',0,'',1,NULL,0,0),
(6,'Internal beta','2012-11-19 08:00:00','2012-12-07 17:00:00',15,'d',0,'',2,NULL,0,0),
(6,'Additional testing','2012-11-19 08:00:00','2012-12-17 17:00:00',21,'d',0,'',3,NULL,0,0),
(6,'Public beta','2012-11-19 08:00:00','2012-12-24 17:00:00',26,'d',0,'',4,NULL,0,0),
(6,'Release','2012-12-25 17:00:00','2012-12-25 17:00:00',0,'d',0,'',5,NULL,0,0);

CREATE TABLE `task_segments` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `TaskId` int(11) NOT NULL,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime DEFAULT NULL,
  `Duration` float(11, 2) unsigned DEFAULT NULL,
  `DurationUnit` varchar(255) DEFAULT NULL,
  `Cls` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `TaskId` (`TaskId`),
  CONSTRAINT `fk_task_segments_tasks` FOREIGN KEY (`TaskId`) REFERENCES `tasks` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1;

INSERT INTO `task_segments` (`TaskId`, `Duration`, `DurationUnit`, `EndDate`, `StartDate`) VALUES
(4, 2, 'd', '2012-09-04T17:00:00', '2012-09-03T08:00:00'),
(4, 3, 'd', '2012-09-10T17:00:00', '2012-09-06T08:00:00'),
(4, 20, 'd', '2012-10-09T17:00:00', '2012-09-12T08:00:00');

CREATE TABLE IF NOT EXISTS `dependencies` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `FromId` int(11) DEFAULT NULL,
  `ToId` int(11) DEFAULT NULL,
  `Typ` int(11) DEFAULT NULL,
  `Cls` varchar(255) DEFAULT NULL,
  `Lag` int(11) DEFAULT NULL,
  `LagUnit` varchar(255) DEFAULT 'd',
  PRIMARY KEY (`Id`),
  INDEX (`FromId`),
  CONSTRAINT fk_dependencies_tasks FOREIGN KEY (`FromId`) REFERENCES `tasks`(`Id`),
  INDEX (`ToId`),
  CONSTRAINT fk_dependencies_tasks1 FOREIGN KEY (`ToId`) REFERENCES `tasks`(`Id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

INSERT INTO `dependencies` (`FromId`, `ToId`, `Typ`, `Cls`, `Lag`) VALUES
(8, 9, 2, '', 0),
(13, 14, 2, '', 0),
(14, 15, 2, '', 0),
(16, 17, 0, '', 0),
(15, 16, 0, '', 0),
(17, 18, 2, '', 0),
(7, 3, 2, '', 0),
(7, 18, 2, '', 0),
(10, 11, 2, '', 0),
(11, 12, 0, '', 0);


CREATE TABLE IF NOT EXISTS `resources` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `CalendarId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`CalendarId`),
  CONSTRAINT fk_resources_calendars FOREIGN KEY (`CalendarId`) REFERENCES `calendars`(`Id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

INSERT INTO `resources` (`Name`) VALUES
('Mats'),
('Nickolay'),
('Goran'),
('Dan'),
('Jake'),
('Kim');


CREATE TABLE IF NOT EXISTS `assignments` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `TaskId` int(11) DEFAULT NULL,
  `ResourceId` int(11) DEFAULT NULL,
  `Units` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  INDEX (`TaskId`),
  CONSTRAINT `fk_assignments_tasks` FOREIGN KEY (`TaskId`) REFERENCES `tasks`(`Id`),
  INDEX (`ResourceId`),
  CONSTRAINT `fk_assignments_resources` FOREIGN KEY (`ResourceId`) REFERENCES `resources`(`Id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

INSERT INTO `assignments` (`TaskId`, `ResourceId`, `Units`) VALUES
(4, 1, 50),
(4, 2, 50);


CREATE TABLE IF NOT EXISTS `options` (
  `name` varchar(45) NOT NULL,
  `value` varchar(45) DEFAULT NULL,
  `dt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

INSERT INTO `options` (`name`, `value`) VALUES
('revision', '1'),
('projectCalendar', '1');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
