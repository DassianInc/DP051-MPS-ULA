/*
* JAVA Gantt Demo
* Bryntum AB ©2014
*/

This is a demo showing our Ext Gantt component running with a JAVA backend. It simply implements a backend for the `advanced` example.

Required software
=================

Requirements for this example :
- Apache Maven (http://maven.apache.org/)
- Apache Tomcat 7+ application server
- JDK 7+ (OpenJDK 7+ can be used as well)
- MySQL 5+
- MySQL JDBC driver (available for tomcat applications)

Database connection setup
=========================

The first step is to run the SQL scripts to setup the database tables. It is done easily utilizing the sql/setup.sql file included with the demo. After running
the file in the SQL manager of your choice (like phpMyAdmin), you need to set the DB parameters in `src/main/webapp/META-INF/context.xml` file.
Change host, username, password and database name to the correct values.
For example here we have connection set to use user name "root" and password "password" while database is located at "localhost" server and has "bryntum_gantt" name:

  <Resource name="jdbc/TestDB" auth="Container" type="javax.sql.DataSource"
       maxActive="100" maxIdle="30" maxWait="10000"
       username="root" password="password" driverClassName="com.mysql.jdbc.Driver"
       url="jdbc:mysql://localhost:3306/bryntum_gantt"/>

See this page for extra details: http://tomcat.apache.org/tomcat-7.0-doc/jndi-datasource-examples-howto.html

Building the example
====================

To build the example proceed to its folder and run this command:

mvn package

After the command completion there will be created a new "target" folder where you can find "gantt-crud-1.0.war" file.
Next step to be done is deploying this file to Tomcat application server.

You can skip next step if you prefer embedded tomcat (details here http://tomcat.apache.org/maven-plugin-2.1/run-mojo-features.html):
    
    mvn tomcat7:run-war-only (if port 8080 is being listened by another app, you should change it in pom.xml)


Application deploy
==================

The simplest way to deploy the application is to use special web-interface provided by Tomcat. We need to open "Tomcat Web Application Manager" page in a web browser (by default it's URL is: tomcat_host:tomcat_port/manager/html).
On this page under the list of deployed application you can find a section named "Deploy" and its subsection "WAR file to deploy".
There you have to pick built "java-gantt-demo.war" file using "Select WAR file to upload" input box and then click "Deploy" button.
After this Tomcat will deploy the application to the following URL:

tomcat_host:tomcat_port/java-gantt-demo/

So after opening this page in a browser you will see the running example.

Note: If you want to deploy the application to some another URL please refer Tomcat docs: http://tomcat.apache.org/tomcat-7.0-doc/deployer-howto.html).

Note: There is also a possibility to setup application deployment using "maven" tool that we used for the application building.
So "mvn tomcat7:deploy" command (or "mvn tomcat7:redeploy" in case of re-deploying) will automatically build the application and deploy it to the server.
Details can be found here: http://tomcat.apache.org/maven-plugin-2.2/tomcat7-maven-plugin/usage.html
Also there are a number of related HOWTOs that can be "googled" easily.
