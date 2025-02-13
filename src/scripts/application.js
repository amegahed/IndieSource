/******************************************************************************\
|                                                                              |
|                                application.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level view of the application.                   |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|        Copyright (C) 2016-2024, Megahed Labs LLC, www.sharedigm.com          |
\******************************************************************************/

// library imports
//
import '../library/underscore/underscore.js';
import '../library/jquery/jquery-3.6.0.js';
import '../library/backbone/backbone.js';
import '../library/backbone/marionette/backbone.marionette.js';

// vendor imports
//
import '../vendor/jquery/jquery-ui/js/jquery-ui.js';
import '../vendor/jquery/jquery-bridget/jquery-bridget.js';
import '../vendor/jquery/doubletap/jquery-doubletap.js';
import '../vendor/jquery/jquery-finger/jquery.finger.js';
import '../vendor/flickity/js/flickity.pkgd.js';

// module imports
//
import Router from './router.js';
import ThemeSettings from './models/settings/theme-settings.js';
import ControlSettings from './models/settings/control-settings.js';
import DialogSettings from './models/settings/dialog-settings.js';
import MainView from './views/layout/main-view.js';
import PageView from './views/layout/page-view.js';
import ModalView from './views/dialogs/modal-view.js';
import Loadable from './views/behaviors/effects/loadable.js';
import Alertable from './views/dialogs/behaviors/alertable.js';
import Browser from './utilities/web/browser.js';
import CssUtils from './utilities/web/css-utils.js';

export default Marionette.Application.extend(_.extend({}, Loadable, Alertable, {

	//
	// attributes
	//

	region: 'body',

	settings: {

		// theme settings
		//
		theme: new ThemeSettings(),
		controls: new ControlSettings(),
		dialogs: new DialogSettings()
	},
	
	defaults: config.defaults,

	//
	// constructor
	//

	initialize: function(options) {

		// set attributes
		//
		if (!options) {
			options = {};
		}
		this.options = options;
		this.name = config.branding.name;

		// set web page title
		//
		if (config.branding.title) {
			document.title = config.branding.title;
		}

		// make Flickety a jquery plug-in
		//
		$.bridget('flickity', Flickity);

		// disable pinch zoom on touch devices
		//
		if (Browser.is_touch_enabled) {
			document.addEventListener('touchmove', (event) => {
				if (event.scale !== 1) {
					event.preventDefault();
				}
			}, false);
		}
	
		// store handle to application
		//
		window.application = this;

		// create routers
		//
		this.router = new Router();
	},

	//
	// querying methods
	//

	hasChildView: function(name) {
		return this.getView().hasChildView(name);
	},

	//
	// getting methods
	//

	getChildView: function(name) {
		return this.getView().getChildView(name);
	},

	getTheme: function() {
		return localStorage.getItem('theme') || this.settings.theme.getCurrentTheme();
	},

	//
	// setting methods
	//

	setTheme: function(theme) {
		this.settings.theme.setCurrentTheme(theme);
	},

	//
	// startup methods
	//

	start: function(options) {

		// call superclass method
		//
		Marionette.Application.prototype.start.call(this, options);

		// start router
		//
		this.startRouter();
	},

	startRouter: function() {
		if (!Backbone.history.start({
			pushState: config.usePushState
		})) {
			this.router.showNotFound();
		}
	},

	//
	// navigating methods
	//

	navigate: function(url, options) {

		// navigate to route
		//
		this.router.navigate(url, options);

		// force reload
		//
		if (options && options.reset) {
			Backbone.history.loadUrl(url);
		}
	},

	//
	// rendering methods
	//

	onStart: function() {

		// show main view
		//
		this.showView(new MainView({
			keyboard: this.keyboard,
			showHeader: true
		}), {
			replaceElement: true
		});

		this.onRender();
	},

	loadFont: function(font) {
		if (font && font != '' && config.fonts[font]) {
			let fontName = config.fonts[font]['font-family'];
			let fontUrl = config.fonts[font].url;
			if (fontUrl) {
				ThemeSettings.loadFont(fontName, fontUrl);
			}
		}
	},

	onRender: function() {

		// listen for changes to system color scheme preferences
		//
		Browser.onChangeColorScheme((colorScheme) => {
			this.settings.theme.set('day_theme', colorScheme);
			this.settings.theme.set('night_theme', colorScheme);
		});

		// set initial theme
		//
		this.setTheme(this.getTheme());

		// set initial style
		//
		this.settings.theme.apply();
		this.settings.controls.apply();
		this.settings.dialogs.apply();

		// add helpful class for mobile OS'es
		//
		$('body').attr('device', Browser.device);
		if (Browser.device == 'phone' || Browser.device == 'tablet') {
			$('body').addClass('mobile');
		}

		// add helpful classes for browser detection
		//
		if (Browser.mobile_os) {
			$('body').attr('os', Browser.mobile_os.toLowerCase());
		}
		if (Browser.name) {
			$('body').attr('browser', Browser.name.toLowerCase());
		}
		if (Browser.os_type) {
			$('body').attr('os', Browser.os_type.toLowerCase());
		}

		// remove hover styles to avoid double tap on mobile
		//
		if (Browser.is_touch_enabled) {
			CssUtils.removeAllHoverStyles();
		}

		// listen for window resize
		//
		$(window).on('resize', (event) => {
			this.onResize(event);
		});
	},
	
	show: function(view, options) {
		if (view instanceof ModalView) {

			// show view in global modals
			//
			this.showModal(view, options);
		} else {

			// show page view
			//
			this.showMain(view, options);
		}

		return view;
	},

	showModal: function(view, options) {
		this.getChildView('modals').show(view, options);
	},

	showMain: function(view, options) {

		// show page navigation
		//
		if (this.hasChildView('header')) {
			if (options && options.nav) {
				this.getChildView('header').setNav(options.nav);
			} else {
				this.getChildView('header').setNav();				
			}
		}

		// show view in main region
		//
		this.getView().showMain(view, options);

		// scroll to top
		//
		$('#main')[0].scrollTo(0, 0);
	},

	showPage: function(view, options) {
		application.desktop = null;
		
		// show page view
		//
		this.showMain(new PageView({
			className: options && options.nav? options.nav + ' page': 'page',
			contentsView: view,
			showFooter: options? options.showFooter : true,
			alignment: options? options.alignment : undefined,
			theme: options? options.theme : undefined
		}), options);
	},

	//
	// window event handling methods
	//

	onResize: function(event) {
		let view = this.getView();
		if (view && view.onResize) {
			view.onResize(event);
		}
	}
}));