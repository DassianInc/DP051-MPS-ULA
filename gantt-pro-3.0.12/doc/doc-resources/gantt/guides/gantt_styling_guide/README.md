#Styling and customizing Ext Gantt 2

##Short introduction to Firebug

This chapter is a short introduction to Firebug (a plugin for Firefox), which should provide you the knowledge required to start theming the Gantt chart to your needs
and debug any visual problems more efficiently.

Firebug is a web development tool used for debugging, editing, and monitoring of any website's CSS, HTML, and JavaScript. Its main features are:

* JavaScript debugging
* JavaScript CommandLine
* Monitoring Ajax requests
* Inspecting and editing HTML
* Editing CSS

(more info available [here][1]. To make yourself comfortable using the plugin it's also useful to learn keyboard and mouse shortcuts [here][2]).

After installing and running Firebug, the plugin window will be displayed at the bottom of the browser window.

{@img 1_FB_Window.png}

It contains several buttons and tabs, but we'll focus on the `Inspect button` (1) and the six tabs : `Console` (2), `HTML` (3), `CSS` (4), `Script` (5), `DOM` (6) and `Net` (7),
and three additional tabs in the right panel of the `HTML` window : `Style` (8), `Computed` (9) and `Layout` (10).

###Inspect button/HTML Tab

Shows the HTML/CSS of any element on the page as you move around it. Whatever is beneath your mouse will be instantly revealed within Firebug and the element itself will be highlighted for improved visibility (activating the plugin will automatically focus the HTML tab).

{@img 1_Selected_element.png}

After clicking the button (1) and moving the mouse over an element, we will see it's position in the HTML tree (left panel) (2) and the element itself will get a blue border (3). `HTML` tab shows page as an indented hierachy of DOM nodes, which you can open and close to see or hide child nodes. In the right panel we can inspect the css styles of the element :

{@img 1_StylePanel_1.png}

All css style declarations valid for our selected element (1) are displayed (according to the importance and place where they were declared) in the `Style` panel (2). Next to the style rule itself, Firebug shows filename and line in which it was defined.

###Edit on the fly/Style tab

The true power of Firebug lies in the on-the-fly editing, which means that changes made to the HTML/CSS of the page or any scripts run from the console take place instantaneously (no need to refresh the page). Let's try modifying our previously selected element, by changing it's background color :

{@img 1_StylePanel_2.png}

As you can see, the change took place immediately, but take notice - to save this change for the future, the value inside the CSS file still needs to be overriden. Since we're already in the right panel, let's get familiar with the two other interesting tabs :

###Computed tab

When this tab is selected,right panel displays all css properties currently applied to the highlighted element and their respective values.

{@img 1_ComputedPanel.png}

The properties are divided into several groups (1) of settings (2). On the left is the css parameter name, and to the right we can see the value (3) which was set/calculated for the element.

###Layout tab

The last interesting tab in this panel is the `Layout` tab. It gives us a visual representation of the element's sizing and layout properties : width, height, position, borders, margins, paddings, z-index.

{@img 1_LayoutPanel.png}

The `Layout` tab adds two useful elements: a ruler which is helpful for scaling (1), and guides surrounding the edges of the element (2). The visualization of the size/layout settings currently applied to node is shown in the panel (3).

###CSS tab

The `CSS` tab provides access to all style sheets loaded for the page (either inline or external files).

{@img 1_CSS_Tab.png}

Button (1) opens a list of css files with their url. When a file is selected, its content is loaded to panel (2) and can be modified live in the same way as with the `Style` panel.

###Script tab

This tab gives insight in the script files attached to the site.

{@img 1_Script_Tab.png}

Button (1) opens a list of javascript files with their urls. The selected file content is loaded to panel (3). Search bar (4) allows searching for text through all/single file (depending on the settings (5) ). When the query returns a result, panel scrolls to appropriate line (2) of the file.

###DOM tab

Shows all the page objects and properties of the window. As variables are properties of the window object, Firebug displays all JavaScript variables and their values.

{@img 1_DOM_tab.png}

In the top bar of the panel (1) the current object's name (in this case the window object) is shown, and below is the list of all of it's properties. Because `Sch` and `Gnt` variables are added to the global scope, they can be seen in this list (2). All objects can be further expanded until the last level.

###Net tab

Shows all the downloaded resources, how long each resource took to download, the HTTP request headers and the server response sent for each resource. The XHR tab is very useful for AJAX debugging.

{@img 1_NET_tab.png}

Button (1) allows switching the type of content that will be displayed in the panel (2).

###Console

Contains a JavaScript command line, which shows javascript message log. You can use it to debug JavaScript and execute commands after the `>>>` sign at the bottom.

{@img 1_CONSOLE_tab.png}

Buttons (1), (2), (3), (4) allow filtering the type of messages displayed in the console. If message is of a request or bug type on the far right side of the corresponding row Firebug shows name of the file and line (5) in which the request/bug appeared.

{@img 1_CONSOLE_tab_2.png}

As shown in the image, the javascript code is running on the fly, and the full functionality of the language is available.


##Basic CSS properties

If you're already familiar with CSS, you can skip this section as it describes some of the CSS properties that will be helpful when styling the Gantt and Scheduler to your needs. Each of them is complemented by an animation showing it's influence on a simple dummy element, and below you'll find the declaration that was used to achieve the change. The default settings for the presented element are :

    width: 200px;
    height: 100px;
    border: 2px solid black;
    text-align: left;
    color: black;

* width - Property responsible for setting the width of the element. Accepts pixels, or percentage value.

{@img 2_css_width.gif}

    width: 100px;

* height - Property responsible for setting height of the element. Accepts number, or percentage value.

{@img 2_css_height.gif}

* margin - Property defining the free space around the element. Accepts pixels, or percentage value. In FireBug it's colored in yellow. Margin can be defined either for all edges at once using :

    /* top, right, bottom, left */
    margin: 2px 1px 5px 3px;

or for each edge separately :

    margin-top/left/bottom/right: 1px

{@img 2_css_margin.gif}

    margin-top: 50px;

* border - Property defining border around the element. The declaration should look as follows :

    border: border-width border-style border-color;

Width accepts number value, style accepts string with name and color accepts either color in hexadecimal (ie #000000) format, or predefined name of the color (red, blue, green, etc). Each setting can be also defined separately :

    border-width: 1px;
    border-color: red;

{@img 2_css_border.gif}

    border: 1px dashed red;

* padding - Property defining free space inside the element. Accepts number value. In firebug it's colored in purple. Padding can be defined in the similar way as margin, either for all edges at once or separately.

{@img 2_css_padding.gif}

    padding: 15px;

* background-color - Property defining the background color of the element. Accepts either color in hexadecimal (ie #000000) format, or predefined name of the color (red, blue, green, etc).

{@img 2_css_background-color.gif}

    background-color: red;

* background - Property defining the background color and/or image of the element. It accepts the following parameters : `background-color background-image background-repeat background-attachment background-position`. All of them are optional (can be defined separately), and should be defined in the following way :

    * background-color: the same as background-color
    * background-image: url(`url to image')
    * background-repeat: repeat/no-repeat
    * background-attachment: scroll/fixed
    * background-position:  positionX/positionY or positionXY

{@img 2_css_background.gif}

    background: transparent url(image.png) repeat scroll 0;

* color - Property defining the color of the text in element. Accepts either color in hexadecimal (ie. #000000) format, or predefined name of the color (red, blue, green, etc).

{@img 2_css_color.gif}

* text-align - Property defining text alignment inside of the element. Accepts three values : 'left', 'right', 'center'.

{@img 2_css_text_align.gif}

    text-align: center;


##Styling Ext Gantt

This section shows you how to style different parts of the Gantt panel using simple CSS declarations.

###The grid background color

The Gantt panel is made up of two grids, one "locked" table and one "schedule" section. The backgrounds of both grids can be easily modified using CSS. For the locked grid we can use the rules below to change the background image and the border color of all rows:

    .sch-ganttpanel .x-grid-inner-locked .x-grid-body { background: url("images/white_carbonfiber.png") repeat scroll 0 0 transparent; }

	.sch-ganttpanel .x-grid-inner-locked .x-grid-cell { border-color: #7B7B7B; }

For the schedule grid we'll use the following CSS rule :

    .sch-ganttpanel .x-grid-body {
        background: url("images/brillant.png") repeat scroll 0 0 transparent;
    }

And this is the final look after our changes :

{@img 3_grids_1.png}


###Customizing icons in the locked grid

The locked grid can be further customized, by changing the icons of parent/leaf tasks, as well as the background color of a selected row :

    .sch-ganttpanel .x-grid-inner-locked .x-grid-row-selected
    {
        background-color: #333;
        color:white;
    }
    .sch-ganttpanel .x-tree-icon-parent {
        background: url(images/bryntum.png) no-repeat scroll left center transparent;
    }

    .sch-ganttpanel .x-tree-icon-leaf {
        background: url(images/clover.png) no-repeat scroll left center transparent;
    }

{@img 3_grids_2.png}


###Styling single task

To be able to style a single task, we need to define the {@link Gnt.model.Task#clsField clsField} for our Task model, or use the default `Cls` field.
Individual records that should be styled need to have the value of `clsField` provided in their data :

        {
            (...)
            "Name" : "Custom task",
            "Cls" : "custom-task"
        },

Using the "custom-task" CSS selector we can now easily style that specific task in different ways.
First let's change the background of the horizontal bar and let's add some matching border color :

    .custom-task {
        background: transparent url("images/noise_lines.png") repeat scroll 0 0;
        border: 1px solid #666666;
    }

{@img 3_task_1.png}

Now let's take it one step further, changing also the border-radius, height and styling of the progress bar :

    .custom-task {
        background: transparent url("images/noise_lines.png") repeat scroll 0 0;
        border: 1px solid #666666;
        border-radius: 3px 3px 3px 3px;
        height: 17px;
    }

    .custom-task .sch-gantt-progress-bar{
        background: url("images/low_contrast_linen.png") repeat scroll 0 0 transparent;
        border: 1px solid #333333;
        height: 13px;
    }

{@img 3_task_2.png}

Of course we can also apply custom styling to parent events (`custom-parent-task` used for `Cls` value):

    .custom-parent-task {
        background: #FFBC00 url("images/texture.png") repeat scroll 0 0;
        border: 1px solid #666666;
    }

    .custom-parent-task .sch-gantt-progress-bar{
        background: #FFF3A5 url("images/texture.png") repeat scroll 0 0 transparent;
    }

{@img 3_task_3.png}


###Styling dependency lines

Using the same approach as above, it is easy to style individual dependency lines to by setting custom colors and styles of the line-border, and you can also customize the arrows.
Take notice, that your Dependency model must to have {@link Gnt.model.Dependency#clsField} defined and assigned a value (similarly to Task model above).
In the simplest case, add this code to your CSS declarations :

    .custom-dependency-line {
        border: 1px dotted #00AFFF;
    }

{@img 3_dependency_1.png}

Taking the customization further requires a bit more CSS, as there are separate CSS definitions for right/left/bottom-oriented arrows :

    .custom-dependency-line {
        border: 1px dotted #00AFFF;
    }
    .custom-dependency-arrow-ct  .sch-dependency-arrow-right{
        border-color: transparent #00AFFF;
    }
    .custom-dependency-arrow-ct  .sch-dependency-arrow-left{
        border-color: transparent #00AFFF;
    }
    .custom-dependency-arrow-ct  .sch-dependency-arrow-down{
        border-color: #00AFFF transparent;
    }

{@img 3_dependency_2.png}


###Styling tooltips

Next up are the are the tooltips. First let's take a look at modifying the task-hovering tooltip :

    .sch-tip {
        background-color: #f8f8f8;
        border-color: #888;
    }

{@img 3_tooltip_1.png}

We can modify the drag & drop tooltips in similar way. Just take notice, that the `sch-tip` class is used for both tooltip types :

    .sch-tip {
        padding:0;
    }

    .sch-tip-ok
    {
      padding-left:20px;
      background-color: #C3FFBB;
    }

    .sch-tip-notok
    {
      padding-left:20px;
      background-color: #FFBBBB;
    }

{@img 3_tooltip_2.png}


###Additional styling

The Ext Gantt SDK also contains a number of plugins that can be styled. Let's take a look at a simple modification of the {@link Gnt.plugin.DependencyEditor} plugin :

        .sch-gantt-dependencyeditor {
            background: url(noise_lines.png) repeat scroll 0 0;
            border-color: #666;
        }
        .sch-gantt-dependencyeditor .x-panel-body {
            background-color: transparent;
        }

{@img 3_plugin_dependency.png}


##Styling during runtime with the {@link Gnt.panel.Gantt#eventRenderer}

Sometimes we need to be able to apply styles based on complex logic which cannot be easily expressed in CSS.
This is where the {@link Gnt.panel.Gantt#eventRenderer eventRenderer} function comes in handy. It is called every time before a task is rendered to allow you to apply custom CSS classes and inline styling to each task.

The function should return an object with properties that will be applied to the task Ext.Template. Possible parameters to return are:

- `ctcls` : css class added to the task wrapper element
- `cls` : css class added to the task bar element
- `style` : inline css style declaration, which will be added to the task bar element.

Sample usage can be seen below :

    eventRenderer : function (task) {
        return {
            ctcls		: 'foo',
            cls			: 'foobar',
            style		: 'color: red',		// inline style for the task bar
			basecls		: 'baseline-foo'	// CSS class for the baseline task bar (if any)
        };
    }

And this is how the DOM structure looks, when the function above is used :

{@img 4_eventRenderer.png}


##Styling rows with getRowClass

Override this function to apply custom CSS classes to grid rows during rendering. This function should return the CSS class name (or empty string '' for none)
that will be added to the row element (the TR tag). Ext Gantt allows separate renderers for locked and normal grids. Example usage:

        normalViewConfig : {
            getRowClass : function(rec) {
                if (rec.internalId < 5) {
                    return 'foo';
                }
            }
        },

        lockedViewConfig: {
            getRowClass : function(rec) {
                if (rec.internalId > 5 && rec.internalId < 20) {
                    return 'baz';
                }
            }
        },

The css declarations used are really basic :

    .foo {
        background-color: red;
    }
    .bar {
        background-color: blue;
    }


{@img 5_grid_rows.png}


##Modifying the layout of the Gantt panel

###Rendering Gantt

The first step when creating your Gantt panel is choosing where it will be rendered. You can control this with the [renderTo][3] property when creating your panel.
This parameter can be set to either the id of an exsisting DOM element (e.g. 'my-div'), or it can be a reference to a DOM element or Ext.Element.
To render it directly to the body element, use Ext.getBody() as the value. If `renderTo` is not defined, the panel can still be rendered manually with the `render` function accepting similar parameters.

###Gantt panel size

The dimensions of the Gantt panel are controlled by the `height` and `width` config options (inherited from [Ext.AbstractComponent][4]).
They accept numerical values (e.g. 100, 500).

###Grid configs

Under the hood, the Ext Gantt extends the [Ext.TreePanel][5] class, and accepts most of its config options too.
Below are two configs, for both normal and locked grid. We want both of them to have a title and allow collapsing :

    lockedGridConfig : {
        width: 300,
        title : 'Locked Section',
        collapsible : true
    },

    schedulerConfig : {
        collapsible : true,
        title : 'Scheduling Section'
    },


{@img 6_config_collapsible.png}

We can also load Ext Gantt with any of the grids collapsed. Let's try changing the lockedGridConfig like this :

    lockedGridConfig : {
        width: 300,
        title : 'Locked Section',
        collapsible : true,
        collapsed: true
    }

{@img 6_config_collapsed.png}

###Customizing columns

Columns of the Gantt panel are also instances of built-in ExtJs class - [Ext.Column][6]. Thus they can be configured like any grid column.The code below uses a modified column definition of the advanced example, showing most of the possible config options.

    columns : [
        {
            xtype : 'treecolumn',
            header: 'Tasks',
            sortable: true,
            dataIndex: 'Name',
            width: 200
        },
        {
            xtype : 'startdatecolumn',
            resizable: true,
            sortable: false
        },
        {
            xtype : 'enddatecolumn',
            hidden : true
        },
        {
            xtype : 'durationcolumn',
            tdCls : 'sch-column-duration',
            menuDisabled: true,
        },
        {
            xtype : 'percentdonecolumn',
            width : 50,
            hideable: false
        }
    ]

{@img 6_columns_config.png}

Here's a short list of possible options with explanation:

* hidden       - column is not visible after loading the component
* cls		   - a CSS class added to the header element
* tdCls		   - a CSS class added to each TD cell for this column
* sortable     - when set to false, users won't be able to sort tasks using value from this column
* width        - width in pixels of the column
* resizable    - when set to false, column's width is fixed
* text		   - the text in the column header
* renderer     - custom rendering function for this column. Please refer to [Ext JS docs][7] for more info.

For more thorough explanation of config options please refer to [Ext docs][6].


##Advanced section - adding/overriding default templates

Ext Gantt gives a simple ways of defining custom templates for parts of application or overriding the default templates used across the component.


###Defining a tooltip template

Let's take a look at defining the template shown when hovering over a task. To achieve this, we'll assign a new XTemplate to panel's [tooltipTpl][8] config property. You can see this in action in our "advanced" example.

    tooltipTpl : new Ext.XTemplate(
        '<h4 class="tipHeader">{Name}</h4>',
        '<table class="taskTip">',
            '<tr><td>Start:</td> <td align="right">{[values._record.getDisplayStartDate("y-m-d")]}</td></tr>',
            '<tr><td>End:</td> <td align="right">{[values._record.getDisplayStartDate("y-m-d")}</td></tr>',
            '<tr><td>Progress:</td><td align="right">{Math.round(values.PercentDone)}%</td></tr>',
        '</table>'
    ).compile()

{@img 7_tooltip_1.png}

And here is a similar code used in the basic example, which creates a slightly different tooltip :

    tooltipTpl: new Ext.XTemplate(
        '<ul class="taskTip">',
            '<li><strong>Task:</strong>{Name}</li>',
            '<li><strong>Start:</strong>{[values._record.getDisplayStartDate("y-m-d")]}</li>',
            '<li><strong>Duration:</strong> {Duration}d</li>',
            '<li><strong>Progress:</strong>{PercentDone}%</li>',
        '</ul>'
    ).compile()

{@img 7_tooltip_2.png}


[1]: http://getfirebug.com/whatisfirebug
[2]: http://getfirebug.com/wiki/index.php/Keyboard_and_Mouse_Shortcuts
[3]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.AbstractComponent-cfg-renderTo
[4]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.AbstractComponent
[5]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.tree.Panel
[6]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.grid.column.Column
[7]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.grid.column.Column-cfg-renderer
[8]: http://bryntum.com/docs/#!/api/Sch.mixin.TimelinePanel-cfg-tooltipTpl
