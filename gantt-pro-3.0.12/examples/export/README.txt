/*
* Export demo
* Bryntum AB �2014
*/

This demo utilizes the Export plugin to generate a PDF/PNG file based on the schedule.
Unfortunately since this process is rather complicated, there is no way of running it
completely client side (in the browser).

For this demo to work there are some requirements :

- Webserver for running the PHP files (like Apache)
- PHP5 installed. Please turn the 'magic_quotes_gpc' setting in the php.ini off
  (if for some reasons it's needed, please consult the info at the end of this file).
- Either PhantomJs (http://phantomjs.org) version 1.6+ or SlimerJS (http://slimerjs.org) version 0.9.0+ installed on your system, and added
  to your environment PATH (so that it's runnable from the console/terminal).
  Provide server user with rights to run it. Instead of inserting it into the PATH variable, you can
  update the EXPORT_LAUNCHER constant in "server.php" with the appropriate value.
  By default this constant is set to "phantomjs", so to use SlimerJS instead you'll have to change it to path to the "slimerjs" executable.
- ImageMagick (http://www.imagemagick.org) installed on your system, and runnable
  from the console/terminal. Also check the rights to run it and in the same way
  as phantom, either insert in PATH or provide correct value for $imgkPath in server.php.
  For Windows based systems please consult steps 1-3 of this instruction on installing ImageMagick with PHP support :
  http://elxsy.com/2009/07/installing-imagemagick-on-windows-and-using-with-php-imagick/ (on most systems steps 1-3 give a fully operational installation of ImageMagick). In some environments following the rest of the steps may be needed.
- Provide your server user with the rights for CRUD operations on files in the example folder.
- Server script as well as temporary files should reside in the example folder because
  relative links to CSS files are used.

Configuring the example
=======================

After our environment is ready, we will focus on the `server.php` file. Here at the beginning
of the script you'll find some important variables that need explaining:

        // command to run launcher (phantomjs or slimerjs) in console/terminal
        define('EXPORT_LAUNCHER', 'phantomjs');

        // command to check accessibility of the launcher in console/terminal
        // must give some not empty output
        define('EXPORT_LAUNCHER_VERIFIER', 'phantomjs --version');

        // path to ImageMagick bin folder
        //define('IMGK_PATH', '/usr/local/bin/');
        define('IMGK_PATH', '');

        // path where temporary HTML and resulting PNG/PDF files will be created
        //define('OUTPUT_PATH', '/some/folder');
        define('OUTPUT_PATH', dirname(__FILE__));

        // if you change OUTPUT_PATH then URL string pointing to that folder should be placed here.
        // By default it's set to this script URL w/o 'server.php' ending
        //define('OUTPUT_URL', 'http://localhost/somefolder/');
        define('OUTPUT_URL', getCurrentPageURL(true));

The first EXPORT_LAUNCHER constant defines a command that will be used to render the uploaded chart on the server.
By default it uses PhantomJS, but you can use SlimerJS as an alternative. To use SlimerJS, simply change this value to command using "slimerjs" binary
(read "SlimerJS usage notes" in the bottom part).
The EXPORT_LAUNCHER_VERIFIER defines a command that detects if the corresponding utility (PhantomJS or SlimerJS) is accessible.
The IMGK_PATH constant defines the path to the ImageMagick folder, which can remain blank if its folder is in the PATH variable.
The OUTPUT_PATH constant defines the path where generated PDF/PNG files (and temporary files) will be created. By default this is the path to our example.
Please note: on Windows based systems you may require an absolute path for some of these variables.

All the functions used in `server.php` script are implemented inside of included `functions.php` file.


Exported file naming
====================

By default the name of the exported file contains a timestamp to make it unique. Since many users of your
application may want to print at the same time.
You can change this behavior in two places. The first one is a following line in `server.php` file:

    $out            = $range.buildUniqueFileName('-exportedPanel', '.').$fileFormat;

And the second place is `buildUniqueFileName` function in `functions.php` file.


Managing quality of the exported image
======================================

The last interesting part of the code is the command for the ImageMagick when exporting to PDF. You can find it in `convertImagesToFile` from `functions.php` file:

    $cmd = IMGK_PATH."convert $files \"$file\"";

Depending on the installed version, adding '-density' parameter might be required to prevent the program
from lowering the quality of the exported image. The value of the parameter may be different across
OS, but '-density 30' was tested to work in most cases.

and when exporting to PNG image:

    $cmd = IMGK_PATH."montage -mode concatenate -tile 1x $files \"$file\"";

The current setting is tested and works well on most systems. For more details about the 'montage' command please consult
the link http://www.imagemagick.org/Usage/montage/.
For details regarding commands of ImageMagick see http://www.imagemagick.org/script/command-line-options.php.


Notice about PHP settings
=========================

If for some reasons 'magic_quotes_gpc' flag in `php.ini` can't be set to false one additional
change in the `server.php` is needed.

Change this line :
    // get request parameters
    $html           = json_decode($_POST['html'], true);
to
    // get request parameters
    $html           = json_decode(stripslashes($_POST['html']), true);


Large chart export and PhantomJS
================================

In some versions of PhantomJS there have been reports of rendering problems when exporting large charts as a single PNG/PDF file (without splitting it into pages).
If you experience such problems we recommend you to use SlimerJS instead of PhantomJS.


SlimerJS usage notes
====================

SlimerJS should be used in its headless mode. You can achieve this either by running it through the "xvfb-run" utility or by having pre-configured Xvfb display
(this option looks more affordable for production servers).
SlimerJS requires the HOME environment variable to be set to a folder accessible to the webserver user for write.
Your command for SlimerJS may look like this:

    define('EXPORT_LAUNCHER', 'env HOME=/some/folder XDG_RUNTIME_DIR=/some/folder xvfb-run slimerjs');

or like this (in case of pre-configured Xvfb display usage):

    define('EXPORT_LAUNCHER', 'env DISPLAY=:1 HOME=/some/folder XDG_RUNTIME_DIR=/some/folder slimerjs');

Also since the webserver user normally doesn't have a home folder, a few extra settings folders should be created:

    mkdir -p /var/www/.gnome2 /var/www/.gnome2_private
    chmod 755 /var/www/.gnome2 /var/www/.gnome2_private
    sudo chown -R www-data /var/www/.gnome2 /var/www/.gnome2_private
