#Using Ext functionality for styling and customizing Ext Gantt 2

##Introduction to Ext Templates

Templates are fragments of HTML, that are used for dynamical creation of content. ExtJs has a two classes for templates, but we'll focus on [XTemplate][1] as it's more advanced. In this section we'll see how templates might be used for customizing Ext Gantt up to user's needs.

###Basic information

The simplest usage of XTemplate looks as follows:

	var tpl = new Ext.XTemplate('<div>Hello {text}</div>');

The tpl variable is now a simple object, with HTML string. The `{text}` fragment is a placeholder for data. It'll be changed to any value sent in the data object under `text` parameter:

	tpl.append(Ext.getBody(), {text: 'World!'});

which will generate us a simple `div` element with `Hello World!` text inside and render it to the body of the page. More details about the `append` function can be found [here][2]. If we don't want to attach our generated html to the DOM, we can use `apply` function which simply returns string with generated html :

	tpl.apply({text: 'Wordl!'});

{@img tpl_apply.png}

The above example was an entry-level example to the world of the XTemplate. A more advanced implementation is needed when you have to deal with a multidimensional dataset.

###Working with more complex datasets.

Now let's try rendernig template with a more developed data structure. Let's say we have some worker's tasks list :

	var data = { 
		workerName: 'John Smith', 
		department: 'QA', 
		tasks: [
			{id: 1, name: 'Test 1', duration: '3h'},
			{id: 2, name: 'Test 2', duration: '4h'},
			{id: 3, name: 'Writing report', duration: '1h'}
		]
	};

First let's focus on rendering the tasks only. We will create a simple div element wrapping our tasks list. Next, we will use a subtemplate for auto-repeating the template block inside the tpl tag for each item in the tasks array. While looping through an array, a special variable `#` gives the current index ( take notice, that the index counter starts from 1 not 0).

	var tpl = new Ext.XTemplate('<div id="tasks-list">',
		'<tpl for=".">',
		'<p>No. : {#}. </p>',
		'<p>Name: {name}</p>',
		'<p>Duration: {duration}</p>',
		'<p class="separator"></p>',
		'</tpl>',
		'</div>'
	);

	tpl.append(Ext.getBody(), data.tasks);

Everything apart of the `tasks` is skipped in the rendered html. But the subtemplate can examine more complicated data structures. For example, let's say we want all of the data from `data` object to be rendered. To achieve this we will call our `append` function in a different way and modify the template itself :

	tpl.append(Ext.getBody(), data);

To inform the template generator, that we want to loop over `tasks` we will change the value assigned to `for` template operator :

	var tpl = new Ext.XTemplate('<div id="users-tasks">',
		'<h1>Name: {workerName}</h1>',
		'<h2>Department: {department</h2>',
		'<h3>Taksks: </h3>',
		'<div id="tasks-list">'
		'<tpl for="tasks">',
		'<p>No. : {#}. </p>',
		'<p>Name: {name}</p>',
		'<p>Duration: {duration}</p>',
		'<p class="separator"></p>',
		'</tpl>',
		'</div>',
		'</div>'
	);


##Styling with Ext

As any other framework ExtJS API exposes methods helpful for selecting and styling html elements. In this section we will introduce and describe functions needed to select and customize part of the page.

###Selecting HTML

In ExtJs we have several methods for selecting html elements from the DOM. They differ in expected parameters and returned value.Let's look at a sample page structure :

	<body>
		<div id="wrapper" class="foo">
			<div class="left menu">
				<p class="left">Menu</p>
				<ul>
					<li class="first">Menu 1</li>
					<li>Menu 2</li>
				</ul>
			</div>
		</div>
	</body>

####Ext.get

Returns [Ext.dom.Element][3] (objects which encapsulate DOM elements) when called with either id of the node, a DOM node itself or Ext.dom.Element. This method is similar to `getElementById`.

Sample usage :

{@img ext_get.png}

####Ext.select

Returns [collection][4] of Ext.dom.Element when called with css selector (the selector should not be an id).

Sample usage :

{@img ext_select.png}

####Ext.query

Returns array of DOM nodes when called with css selector. This method is similar to `querySelectorAll`.

Sample usage :

{@img ext_query.png}

####Ext.getDom

Returns the actual DOM node when called with either id of the node, a DOM node itself or Ext.dom.Element.

Sample usage :

{@img ext_getdom.png}


###Applying inline styling

We have already explained the basics of Cascading StyleS heets in the first part of the guide. If you don't know what CSS is, please start from there. Css styles can be applied to elements either in style declarations or by adding them directly to the element's html (inline style). The only way of adding inline styles we've shown till now was through different renderers. Now we'll take a look into other methods. All of the functions below are methods of Ext.dom.Element, so first let's select one :
	
	var el = Ext.get('wrapper');

####setStyle

Function used for setting different style attributes of an element. It can be invoked in two ways, with single style value :

	el.setStyle('color', 'red');

or object with multiple parameters at once :

	el.setStyle({
		width  : 100,
		height : 50,
		color  : 'red'
	});

####Other style setters

Ext introduces also specialized functions for setting particular css parameters :

* setWidth - as name suggests this function changes width of the element. It accepts number value :

	el.setWidth(100);


* setHeight - as name suggests this function changes height of the element. It accepts number value :

	el.setHeight(100);


* setLeft - changes left position of the element. It accepts string value :

	el.setLeft('100px');


* setRight - changes right position of the element. It accepts string value :

	el.setRight('100px');


* setTop - changes top position of the element. It accepts string value :

	el.setTop('100px');


* setBottom - changes bottom position of the element. It accepts string value :

	el.setBottom('100px');



###Adding/removing CSS classes

Not always using inline styles is allowed/recommended (for example adding many style settings to one element make the html code less readable). In cases like that, we stick to applying css rules to selectors. Classes are one of the dom selectors, which can appear many times on the same page (in contrary to ID's which should be unique) and can be added to any dom elements. Ext gives us few intuitive methods to control classes, which once again belong to Ext.dom.Element. Let's select some element first :

	var el = Ext.get('wrapper');

This is the initial view on our page structure :

{@img css_initial.png}

####addCls

Method for adding a new CSS class to the element. Accepts string with class name.

	el.addCls('baz');

{@img ext_addcls.png}

####removeCls

Method for removing CSS class. If it's not found, nothing changes. Accepts string with class name.

	el.removeCls('foo');
	el.removeCls('bar');

{@img ext_removecls.png}

####replaceCls

Replaces a CSS class on the element with another. If the old name does not exist, the new name will be added. Accepts strings with old and new names.

	el.replaceCls('foo', 'bar');
	el.replaceCls('baz', 'bar1');

{@img ext_replacecls.png}

####toggleCls

Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it). Accepts string with class name.

	el.toggleCls('foo');

{@img ext_removecls.png}


###Using Ext.util.CSS

Another way of manipulating css rules in Ext is using the [Css util][5] class. We'll describe in a nutshell the most useful methods given in this class. Let's add a simple stylesheet to head of our previously used page :

	<style>
		#wrapper {
			color: black;
		}
	</style>

Here's the initial view of the webpage :

{@img ext_css_initial.png}

####createStyleSheet

Creates a stylesheet DOM element from text with css rules and appends it to the head of the page.

	Ext.util.CSS.createStyleSheet('#wrapper{border: 1px solid black;}');

{@img ext_createstylesheet.png}

{@img ext_createstylesheet2.png}

####removeStyleSheet

Removes a stylesheet or link tag when called with element's ID.

	Ext.util.CSS.removeStyleSheet('style1');

####getRule

Returns css rules by matching selectors. Accepts string or array of strings with css selectors. For example the code below :

	Ext.util.CSS.getRule('#wrapper');

will return us rules defined for `#wrapper` selector.

{@img ext_getrule1.png}

{@img ext_getrule2.png}

####updateRule

Updates css rules for matching selectors. Accepts string or array of strings with css selectors, string with css property and string with this property's value. For example code below :

	Ext.util.CSS.updateRule('#wrapper', 'color', 'red');

will overwrite `color: black` for `#wrapper` selector



##Using column renderers

Column [renderers][6] are a specialized functions called for each cell in the grid while rendering. This gives us control of the look of single table cells. The code below shows a simple css style declaration for `sch-odd-row` class, and a columns definition for Gantt panel. The renderer function shown here creates a "zebra" effect in the locked grid of Ext Gantt by adding previously defined css class to `td` element of the cell :

    .sch-ganttpanel .sch-odd-row{
        background-color: #EBEBEB;
    }

    columns : [
        {
            xtype : 'treecolumn',
            header: 'Tasks',
            sortable: true,
            dataIndex: 'Name',
            width: 200,
		    renderer : function(v, meta, r, rIndex) {

		    	//if index divides by two, add css class
		        if (!(rIndex % 2)) meta.tdCls = 'sch-odd-row';
		        
		        return v;
		    }
        },

And this is how our column looks after rendering :

{@img grid_renderer.png}


[1]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.XTemplate
[2]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.XTemplate-method-apply
[3]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.dom.Element
[4]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.dom.CompositeElement
[5]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.util.CSS
[6]: http://docs.sencha.com/ext-js/4-1/#!/api/Ext.grid.column.Column-cfg-renderer