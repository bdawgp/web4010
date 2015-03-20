"use strict";
(function(){
	var gallery;
	this.addEventListener('load', function(){
		/**
		 * Launch Gallery when page is loaded
		 * @type {Gallery}
		 */
		gallery = new Gallery({
			pictureList: this.piclist,
			baseUrl: this.baseurl,
			container: '#photo-gallery',
			categoryList: '#categories',
			title: '#title'
		});
	}.bind(this));
}).call(this);
