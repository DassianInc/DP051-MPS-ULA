/*
* PHP Gantt Demo
* Bryntum AB ©2014
*/

This is a demo showing our Ext Gantt component running with a PHP backend. It simply implements a backend for the `advanced` example.

Requirements for this example :
- WebServer (Apache or similar)
- PHP 5+
- MySQL 5+

Setup the PHP demo
==================

The first step is to run the SQL script to setup the database tables. It is done easily utilising the "sql/setup.sql" file included with the demo. After running
the file in the SQL manager of your choice (like phpMyAdmin), you need to set the DB parameters. Rename (or copy) "php/config.template.php" file into "php/config.php" and edit its content.
Change host, username, password and database name to the correct values. For example in the follwing code we define that user name is "root" and password is "password". And database named "bryntum_gantt" is located at "localhost" host:

define('DBUSERNAME', 'root');
define('DBUSERPASSWORD', 'password');
define('DSN', 'mysql:dbname=bryntum_gantt;host=localhost');


These simple steps will give us a working demo when running `index.html` on your server.
