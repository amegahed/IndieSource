/******************************************************************************\
|                                                                              |
|                                    router.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for this application.        |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.md', which is part of this source code distribution.         |
|                                                                              |
|******************************************************************************|
|        Copyright (C) 2016-2024, Megahed Labs LLC, www.sharedigm.com          |
\******************************************************************************/

import BaseView from './views/base-view.js';

export default Backbone.Router.extend({

	//
	// attributes
	//

	templates: 'templates',

	//
	// route definitions
	//

	routes: {

		// main routes
		//
		'': 'showWelcome',

		// contact routes
		//
		'contact': 'showContact',

		// info routes
		//
		'*address': 'showInfo'
	},

	//
	// main route handlers
	//

	showWelcome: function(options) {
		import(
			'./views/welcome/welcome-view.js'
		).then((WelcomeView) => {

			// show welcome page
			//
			application.showPage(new WelcomeView.default(options), {
				nav: 'welcome',
				alignment: 'middle',
				background: 'none'
			});
		});
	},

	//
	// contact route methods
	//

	showContact: function() {
		import(
			'./views/contact/contact-view.js'
		).then((ContactView) => {

			// show contact page
			//
			application.showPage(new ContactView.default(), {
				nav: 'contact'
			});
		});
	},

	//
	// info route handlers
	//

	showInfo: function(address) {
		this.fetchTemplate(address, (text) => {
			let nav = address.contains('/')? address.split('/')[0] : address;
			if (nav == 'welcome') {
				nav = undefined;
			}

			// show info page
			//
			application.showPage(new BaseView({
				template: template(text)
			}), {
				nav: nav
			});
		});
	},

	//
	// error route handlers
	//

	showNotFound: function(options) {
		import(
			'./views/not-found-view.js'
		).then((NotFoundView) => {

			// show not found page
			//
			application.showPage(new NotFoundView.default(options));
		});
	},

	//
	// utility fetching methods
	//

	fetchTemplate(address, callback) {
		fetch(this.templates + '/' + address + '.tpl').then(response => {
			if (!response.ok) {
				throw response;
			}
			return response.text();
		}).then(template => {
			callback(template);
			return;
		}).catch(error => {

			// show 404 page
			//
			this.showNotFound({
				title: "Page Not Found",
				message: "The page that you are looking for could not be found: " + address,
				error: error
			});
		});
	}
});