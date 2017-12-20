/*
* MSP Import Gantt Demo
* Bryntum AB ©2012-2013
*/

This is a demo showing how to import data from an MS Project ".mpp" file into the Ext Gantt component.

Requirements for this demo to work are:
======================================

1) Java JDK 1.5+ with privileges for server user to run it.

2) You need to download the MPXJ project from here: http://sourceforge.net/projects/mpxj/files/latest/download?source=files
then unpack it and place the mpxj.jar from the root of archive to the `/msprojectreader/dist/lib` folder (near the `poi-3.11-20141221.jar`)

3) Next we need to update the `msp-load.php` to set the path where the JSON-formatted data from the MPP file will be saved. By
default, files are saved in the `/tmp` directory of this example

	$move_path = "/tmp/";
	(...)
	if(move_uploaded_file($file_tmp, $move_path)){

Note: On Windows systems, the path where the file will be saved needs to be absolute and use backslashes:

	$move_path = 'C:\path_to_save_file\$file_name'

You also need to make sure that the server user has privileges for both reading/creating files on this path.

Uploaded file size limitation
=============================

PHP has a couple of settings that restrict the max allowed size of uploaded files. Please make sure to set their values to reasonable values:
http://docs.php.net/manual/en/ini.core.php#ini.upload-max-filesize
http://docs.php.net/manual/en/ini.core.php#ini.post-max-size

Known issues
============

You may encounter this bug, when importing certain MPP files: http://sourceforge.net/p/mpxj/bugs/224/
If it's still not fixed by the time you are reading this, you may want to apply the patch given in the ticket manually,
and then re-compile the mpxj.jar file.

To re-compile, switch to the directory containing the downloaded MPXJ project and launch the following command
(you will need to have [ant](http://ant.apache.org/) installed):

    ant -f ant/build.xml

