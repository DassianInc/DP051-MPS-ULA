USE [bryntum_gantt]
GO

IF OBJECT_ID('dbo.Dependencies', 'U') IS NOT NULL
  DROP TABLE dbo.Dependencies;

IF OBJECT_ID('dbo.Assignments', 'U') IS NOT NULL
  DROP TABLE dbo.Assignments;

IF OBJECT_ID('dbo.Resources', 'U') IS NOT NULL
  DROP TABLE dbo.Resources;

IF OBJECT_ID('dbo.TaskSegments', 'U') IS NOT NULL
  DROP TABLE dbo.TaskSegments;

IF OBJECT_ID('dbo.Tasks', 'U') IS NOT NULL
  DROP TABLE dbo.Tasks;

IF OBJECT_ID('dbo.CalendarDays', 'U') IS NOT NULL
  DROP TABLE dbo.CalendarDays;

IF OBJECT_ID('dbo.Calendars', 'U') IS NOT NULL
  DROP TABLE dbo.Calendars;

IF OBJECT_ID('dbo.Options', 'U') IS NOT NULL
  DROP TABLE dbo.Options;


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Assignments](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TaskId] [int] NOT NULL,
	[ResourceId] [int] NOT NULL,
	[Units] [int] NOT NULL,
 CONSTRAINT [PK_Aassignments] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarDays](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[calendarId] [int] NOT NULL,
	[Name] [nvarchar](255) NULL,
	[Typ] [nvarchar](45) NOT NULL,
	[Dt] [date] NULL,
	[Availability] [nvarchar](255) NULL,
	[Weekday] [int] NULL,
	[OverrideStartDate] [date] NULL,
	[OverrideEndDate] [date] NULL,
	[IsWorkingDay] [tinyint] NULL,
	[Cls] [nvarchar](45) NULL,
 CONSTRAINT [PK_CalendarDays] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Calendars](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[parentId] [int] NULL,
	[Name] [nvarchar](255) NULL,
	[DaysPerMonth] [int] NULL,
	[DaysPerWeek] [int] NULL,
	[HoursPerDay] [int] NULL,
	[WeekendsAreWorkdays] [tinyint] NULL,
	[WeekendFirstDay] [int] NULL,
	[WeekendSecondDay] [int] NULL,
	[DefaultAvailability] [nvarchar](255) NULL,
 CONSTRAINT [PK_Calendars] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Dependencies](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FromId] [int] NOT NULL,
	[ToId] [int] NOT NULL,
	[Typ] [int] NULL,
	[Cls] [nvarchar](255) NULL,
	[Lag] [int] NULL,
	[LagUnit] [nvarchar](1) NULL,
 CONSTRAINT [PK_Dependencies] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Options](
	[name] [varchar](45) NOT NULL,
	[value] [varchar](45) NULL,
	[dt] [timestamp] NOT NULL,
 CONSTRAINT [PK_Options] PRIMARY KEY CLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Resources](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[CalendarId] [int] NULL,
 CONSTRAINT [PK_Resources] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tasks](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[parentId] [int] NULL,
	[Name] [nvarchar](255) NULL,
	[StartDate] [datetime] NULL,
	[EndDate] [datetime] NULL,
	[Duration] [decimal](18,2) NULL,
	[DurationUnit] [nvarchar](255) NULL,
	[PercentDone] [int] NULL,
	[SchedulingMode] [nvarchar](255) NULL,
	[BaselineStartDate] [datetime] NULL,
	[BaselineEndDate] [datetime] NULL,
	[BaselinePercentDone] [int] NULL,
	[Cls] [nvarchar](255) NULL,
	[idx] [int] NULL,
	[CalendarId] [int] NULL,
	[expanded] [bit] NOT NULL,
	[Effort] [decimal](18,2) NULL,
	[EffortUnit] [varchar](255) NULL,
	[Note] [varchar](255) NULL,
	[ConstraintType] [varchar](255) NULL,
	[ConstraintDate] [datetime] NULL,
	[ManuallyScheduled] [bit] NOT NULL,
	[Draggable] [bit] NOT NULL,
	[Resizable] [bit] NOT NULL,
	[Rollup] [bit] NOT NULL,
	[ShowInTimeline] [bit] NOT NULL,
	[Color] [nvarchar](255) NULL,
 CONSTRAINT [PK_Tasks] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskSegments](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TaskId] [int] NOT NULL,
	[StartDate] [datetime] NOT NULL,
	[EndDate] [datetime] NULL,
	[Duration] [decimal](18,2) NULL,
	[DurationUnit] [nvarchar](255) NULL,
	[Cls] [nvarchar](255) NULL,
 CONSTRAINT [PK_TaskSegments] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET IDENTITY_INSERT [dbo].[Assignments] ON 

INSERT [dbo].[Assignments] ([Id], [TaskId], [ResourceId], [Units]) VALUES
(1, 4, 1, 50)
,(2, 4, 2, 50)

SET IDENTITY_INSERT [dbo].[Assignments] OFF

SET IDENTITY_INSERT [dbo].[CalendarDays] ON 

INSERT [dbo].[CalendarDays] ([Id], [calendarId], [Name], [Typ], [Dt], [Availability], [Weekday], [OverrideStartDate], [OverrideEndDate], [IsWorkingDay], [Cls]) VALUES
(1, 1, N'Some big holiday', N'DAY', CAST(0x59320B00 AS Date), NULL, NULL, NULL, NULL, 0, N'gnt-national-holiday')
,(2, 2, N'Mats''s birthday', N'DAY', CAST(0x58320B00 AS Date), NULL, NULL, NULL, NULL, 0, N'gnt-national-holiday')
,(3, 2, N'Bryntum company holiday', N'DAY', CAST(0x6B320B00 AS Date), NULL, NULL, NULL, NULL, 0, N'gnt-company-holiday')
,(4, 2, N'Bryntum 1st birthday', N'DAY', CAST(0x9A330B00 AS Date), NULL, NULL, NULL, NULL, 0, NULL)
,(5, 2, N'Half working day', N'DAY', CAST(0x7C350B00 AS Date), N'08:00-12:00', NULL, NULL, NULL, 1, NULL)
,(6, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, NULL, -1, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 0, NULL)
,(7, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, NULL, 0, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 0, NULL)
,(8, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, N'08:00-12:00', 1, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 1, NULL)
,(9, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, N'13:00-15:00', 2, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 1, NULL)
,(10, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, NULL, 3, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 0, NULL)
,(11, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, N'08:00-12:00', 4, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 1, NULL)
,(12, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, NULL, 5, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 0, NULL)
,(13, 2, N'Non standard week', N'WEEKDAYOVERRIDE', NULL, NULL, 6, CAST(0x7A350B00 AS Date), CAST(0x80350B00 AS Date), 0, NULL)
,(14, 2, N'Non standard feb week', N'WEEKDAYOVERRIDE', NULL, NULL, -1, CAST(0x5D350B00 AS Date), CAST(0x60350B00 AS Date), 0, NULL)
,(15, 2, N'Non standard feb week', N'WEEKDAYOVERRIDE', NULL, NULL, 0, CAST(0x5D350B00 AS Date), CAST(0x60350B00 AS Date), 0, NULL)
,(16, 2, N'Non standard feb week', N'WEEKDAYOVERRIDE', NULL, N'08:00-12:00', 1, CAST(0x5D350B00 AS Date), CAST(0x60350B00 AS Date), 1, NULL)
,(17, 2, N'Non standard feb week', N'WEEKDAYOVERRIDE', NULL, N'13:00-15:00', 2, CAST(0x5D350B00 AS Date), CAST(0x60350B00 AS Date), 1, NULL)

SET IDENTITY_INSERT [dbo].[CalendarDays] OFF

SET IDENTITY_INSERT [dbo].[Calendars] ON 

INSERT [dbo].[Calendars] ([Id], [parentId], [Name], [DaysPerMonth], [DaysPerWeek], [HoursPerDay], [WeekendsAreWorkdays], [WeekendFirstDay], [WeekendSecondDay], [DefaultAvailability]) VALUES
(1, NULL, N'General', 20, 5, 8, 0, 6, 0, N'08:00-12:00|13:00-17:00')
,(2, 1, N'Holidays', 20, 5, 8, 0, 6, 0, N'08:00-12:00')
,(3, NULL, N'Night shift', 20, 5, 8, 0, 6, 0, N'00:00-06:00|22:00-24:00')

SET IDENTITY_INSERT [dbo].[Calendars] OFF

SET IDENTITY_INSERT [dbo].[Dependencies] ON 

INSERT [dbo].[Dependencies] ([Id], [FromId], [ToId], [Typ], [Cls], [Lag], [LagUnit]) VALUES
(1, 8, 9, 2, N'', 0, N'd')
,(2, 13, 14, 2, N'', 0, N'd')
,(3, 14, 15, 2, N'', 0, N'd')
,(4, 16, 17, 0, N'', 0, N'd')
,(5, 15, 16, 0, N'', 0, N'd')
,(6, 17, 18, 2, N'', 0, N'd')
,(7, 7, 3, 2, N'', 0, N'd')
,(8, 7, 18, 2, N'', 0, N'd')
,(9, 10, 11, 2, N'', 0, N'd')
,(10, 11, 12, 0, N'', 0, N'd')

SET IDENTITY_INSERT [dbo].[Dependencies] OFF

INSERT [dbo].[Options] ([name], [value]) VALUES 
(N'projectCalendar', N'1')
,(N'revision', N'1')

SET IDENTITY_INSERT [dbo].[Resources] ON 

INSERT [dbo].[Resources] ([Id], [Name], [CalendarId]) VALUES
(1, N'Mats', NULL)
,(2, N'Nickolay', NULL)
,(3, N'Goran', NULL)
,(4, N'Dan', NULL)
,(5, N'Jake', NULL)
,(6, N'Kim', NULL)

SET IDENTITY_INSERT [dbo].[Resources] OFF

SET IDENTITY_INSERT [dbo].[Tasks] ON 

INSERT [dbo].[Tasks] ([Id], [parentId], [Name], [StartDate], [EndDate], [Duration], [DurationUnit], [PercentDone], [SchedulingMode], [BaselineStartDate], [BaselineEndDate], [BaselinePercentDone], [Cls], [idx], [CalendarId], [expanded], [Effort], [EffortUnit], [Note], [ConstraintType], [ConstraintDate], [ManuallyScheduled], [Draggable], [Resizable], [Rollup], [ShowInTimeline]) VALUES
(1, NULL, N'Main project', CAST(0x0000A0C10083D600 AS DateTime), CAST(0x0000A132011826C0 AS DateTime), 82, N'd', 11, NULL, NULL, NULL, NULL, N'', 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(2, NULL, N'Second project', CAST(0x0000A0CF0083D600 AS DateTime), CAST(0x0000A0FA011826C0 AS DateTime), 32, N'd', 0, NULL, NULL, NULL, NULL, N'', 1, NULL, 1, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(3, NULL, N'Release', CAST(0x0000A132011826C0 AS DateTime), CAST(0x0000A132011826C0 AS DateTime), 0, N'd', 0, NULL, NULL, NULL, NULL, N'', 2, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 1)
,(4, 1, N'Initial phase', CAST(0x0000A0C10083D600 AS DateTime), CAST(0x0000A0E1011826C0 AS DateTime), 25, N'd', 70, NULL, NULL, NULL, NULL, N'', 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(5, 1, N'Alpha', CAST(0x0000A0E40083D600 AS DateTime), CAST(0x0000A101011826C0 AS DateTime), 22, N'd', 0, NULL, NULL, NULL, NULL, N'', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 1)
,(6, 1, N'Beta', CAST(0x0000A0F90083D600 AS DateTime), CAST(0x0000A132011826C0 AS DateTime), 42, N'd', 0, NULL, NULL, NULL, NULL, N'', 2, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 1)
,(7, 1, N'Marketing', CAST(0x0000A1070083D600 AS DateTime), CAST(0x0000A132011826C0 AS DateTime), 32, N'd', 0, NULL, NULL, NULL, NULL, N'', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 1)
,(8, 2, N'Research', CAST(0x0000A0CF0083D600 AS DateTime), CAST(0x0000A0FA011826C0 AS DateTime), 32, N'd', 60, NULL, NULL, NULL, NULL, N'', 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(9, 2, N'Test implementation', CAST(0x0000A0FA011826C0 AS DateTime), CAST(0x0000A0FA011826C0 AS DateTime), 0, N'd', 0, NULL, NULL, NULL, NULL, N'', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(10, 5, N'Research', CAST(0x0000A0E40083D600 AS DateTime), CAST(0x0000A0EF011826C0 AS DateTime), 10, N'd', 0, NULL, NULL, NULL, NULL, N'', 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(11, 5, N'First implementation', CAST(0x0000A0F20083D600 AS DateTime), CAST(0x0000A0F6011826C0 AS DateTime), 5, N'd', 0, NULL, NULL, NULL, NULL, N'', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(12, 5, N'Tests', CAST(0x0000A0F50083D600 AS DateTime), CAST(0x0000A101011826C0 AS DateTime), 9, N'd', 0, NULL, NULL, NULL, NULL, N'', 2, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(13, 6, N'Refactoring after Alpha', CAST(0x0000A0F90083D600 AS DateTime), CAST(0x0000A104011826C0 AS DateTime), 10, N'd', 0, NULL, NULL, NULL, NULL, N'', 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(14, 6, N'Tests', CAST(0x0000A1070083D600 AS DateTime), CAST(0x0000A10B011826C0 AS DateTime), 5, N'd', 0, NULL, NULL, NULL, NULL, N'', 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(15, 6, N'Internal beta', CAST(0x0000A10E0083D600 AS DateTime), CAST(0x0000A120011826C0 AS DateTime), 15, N'd', 0, NULL, NULL, NULL, NULL, N'', 2, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(16, 6, N'Additional testing', CAST(0x0000A10E0083D600 AS DateTime), CAST(0x0000A12A011826C0 AS DateTime), 21, N'd', 0, NULL, NULL, NULL, NULL, N'', 3, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(17, 6, N'Public beta', CAST(0x0000A10E0083D600 AS DateTime), CAST(0x0000A131011826C0 AS DateTime), 26, N'd', 0, NULL, NULL, NULL, NULL, N'', 4, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
,(18, 6, N'Release', CAST(0x0000A132011826C0 AS DateTime), CAST(0x0000A132011826C0 AS DateTime), 0, N'd', 0, NULL, NULL, NULL, NULL, N'', 5, NULL, 0, NULL, NULL, NULL, NULL, NULL, 0, 1, 1, 0, 0)
SET IDENTITY_INSERT [dbo].[Tasks] OFF
SET IDENTITY_INSERT [dbo].[TaskSegments] ON 

INSERT [dbo].[TaskSegments] ([Id], [TaskId], [StartDate], [EndDate], [Duration], [DurationUnit], [Cls]) VALUES
(1, 4, CAST(0x0000A0C10083D600 AS DateTime), CAST(0x0000A0C2011826C0 AS DateTime), 2, N'd', NULL)
,(2, 4, CAST(0x0000A0C40083D600 AS DateTime), CAST(0x0000A0C8011826C0 AS DateTime), 3, N'd', NULL)
,(3, 4, CAST(0x0000A0CA0083D600 AS DateTime), CAST(0x0000A0E5011826C0 AS DateTime), 20, N'd', NULL)
SET IDENTITY_INSERT [dbo].[TaskSegments] OFF
ALTER TABLE [dbo].[CalendarDays] ADD  CONSTRAINT [DF__CalendarD__IsWor__2F10007B]  DEFAULT ((0)) FOR [IsWorkingDay]
GO
ALTER TABLE [dbo].[Dependencies] ADD  CONSTRAINT [DF__Dependenc__LagUn__145C0A3F]  DEFAULT ('d') FOR [LagUnit]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF__Tasks__idx__22AA2996]  DEFAULT ((0)) FOR [idx]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_expanded]  DEFAULT ((0)) FOR [expanded]
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [DF_Tasks_ShowInTimeline]  DEFAULT ((0)) FOR [ShowInTimeline]
GO
ALTER TABLE [dbo].[Assignments]  WITH CHECK ADD  CONSTRAINT [FK_Assignments_Resources] FOREIGN KEY([ResourceId])
REFERENCES [dbo].[Resources] ([Id])
GO
ALTER TABLE [dbo].[Assignments] CHECK CONSTRAINT [FK_Assignments_Resources]
GO
ALTER TABLE [dbo].[Assignments]  WITH CHECK ADD  CONSTRAINT [FK_Assignments_Tasks] FOREIGN KEY([TaskId])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[Assignments] CHECK CONSTRAINT [FK_Assignments_Tasks]
GO
ALTER TABLE [dbo].[CalendarDays]  WITH CHECK ADD  CONSTRAINT [FK_CalendarDays_Calendars] FOREIGN KEY([calendarId])
REFERENCES [dbo].[Calendars] ([Id])
GO
ALTER TABLE [dbo].[CalendarDays] CHECK CONSTRAINT [FK_CalendarDays_Calendars]
GO
ALTER TABLE [dbo].[Calendars]  WITH CHECK ADD  CONSTRAINT [FK_Calendars_Calendars] FOREIGN KEY([parentId])
REFERENCES [dbo].[Calendars] ([Id])
GO
ALTER TABLE [dbo].[Calendars] CHECK CONSTRAINT [FK_Calendars_Calendars]
GO
ALTER TABLE [dbo].[Dependencies]  WITH NOCHECK ADD  CONSTRAINT [FK_Dependencies_Tasks] FOREIGN KEY([FromId])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[Dependencies] NOCHECK CONSTRAINT [FK_Dependencies_Tasks]
GO
ALTER TABLE [dbo].[Dependencies]  WITH NOCHECK ADD  CONSTRAINT [FK_Dependencies_Tasks1] FOREIGN KEY([ToId])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[Dependencies] NOCHECK CONSTRAINT [FK_Dependencies_Tasks1]
GO
ALTER TABLE [dbo].[Resources]  WITH CHECK ADD  CONSTRAINT [FK_Resources_Calendars] FOREIGN KEY([CalendarId])
REFERENCES [dbo].[Calendars] ([Id])
GO
ALTER TABLE [dbo].[Resources] CHECK CONSTRAINT [FK_Resources_Calendars]
GO
ALTER TABLE [dbo].[Tasks]  WITH NOCHECK ADD  CONSTRAINT [FK_Tasks_Calendars] FOREIGN KEY([CalendarId])
REFERENCES [dbo].[Calendars] ([Id])
GO
ALTER TABLE [dbo].[Tasks] NOCHECK CONSTRAINT [FK_Tasks_Calendars]
GO
ALTER TABLE [dbo].[Tasks]  WITH NOCHECK ADD  CONSTRAINT [FK_Tasks_Tasks] FOREIGN KEY([parentId])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[Tasks] NOCHECK CONSTRAINT [FK_Tasks_Tasks]
GO
ALTER TABLE [dbo].[TaskSegments]  WITH NOCHECK ADD  CONSTRAINT [FK_TaskSegments_Tasks] FOREIGN KEY([TaskId])
REFERENCES [dbo].[Tasks] ([Id])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TaskSegments] NOCHECK CONSTRAINT [FK_TaskSegments_Tasks]
GO
