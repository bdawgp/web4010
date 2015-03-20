"use strict";
(function(){
	this.Gallery = function(options){
		options = _.pick(options || {}, function(value, key){
			return !_.isFunction(this[key]);
		}, this);
		_.assign(this, options);

		this.container = window.jQuery(this.container)[0];
		this.categoryList = window.jQuery(this.categoryList)[0];
		this.title = window.jQuery(this.title)[0];

		this.galleryId = _.uniqueId('photoGallery');
		this.loadCategoryNames();
		this.loadPictureNames();
		this.templates = {};
		this.storeEvents = {};

		if(this.hashHistory){
			this.loadHashHistory();
			window.addEventListener('hashchange', function(){
				this.loadHashHistory();
				this.setCategory(this.pictureCategory, true);
			}.bind(this));
		}

		this.renderCategoryList();
		this.renderTitle();
		this.setCategory(this.pictureCategory);
	};

	////////////////////
	// Configuration //
	////////////////////

	_.assign(Gallery.prototype, {
		pictureList: [],
		baseUrl: this.location.origin + '/',
		container: '<div />',
		categoryList: '<select />',
		title: '<h2 />',
		pictureCategory: 0,
		hashHistory: true
	});

	///////////////////////
	// Category Methods //
	///////////////////////

	_.assign(Gallery.prototype, {

		/**
		 * Persist Category Names to Local Storage
		 * @return {void}
		 */
		persistCategoryNames: function(){
			window.localStorage['categoryNames'] = JSON.stringify(this.categories);
		},

		/**
		 * Load Category Names from Local Storage
		 * @return {void}
		 */
		loadCategoryNames: function(){
			var stored = window.localStorage['categoryNames'];
			this.categories = stored ? JSON.parse(stored) : {};
		},

		/**
		 * Set a specific category name
		 * @param {string|number} key
		 * @param {string} name
		 * @param {boolean|undefined} updateList
		 * @return {void}
		 */
		setCategoryName: function(key, name, updateList){
			this.categories[key] = name;
			if(updateList){
				var option = _.find(this.categoryList.options, function(option){
					return option.value === String(key);
				});
				if(option) option.text = name;
			}
			this.persistCategoryNames();
			return this.categories[key];
		},

		/**
		 * Fetch the stored category name for key
		 * @param  {string|number} key
		 * @return {string}
		 */
		getCategoryName: function(key){
			return this.categories[key] || this.setCategoryName(key, 'Category ' + (key + 1));
		},

		/**
		 * Change and Render a category
		 * @param {string|number} 	key
		 * @param {boolean} 		updateList
		 * @return {void}
		 */
		setCategory: function(key, updateList){
			var index = parseInt(key);
			if(index < this.pictureList.length){
				this.pictureCategory = index;
				this.render();
				if(updateList) this.categoryList.value = key;
				if(this.hashHistory) this.setHashHistory();
			}
		},

		/**
		 * Apply the location hash for the current category
		 * @return {void}
		 */
		setHashHistory: function(){
			window.location.hash = 'photoGallery-' + this.pictureCategory;
		},

		/**
		 * Load the specified category in the hash (if available)
		 * @return {void}
		 */
		loadHashHistory: function(){
			var hash = window.location.hash;
			var category = hash.replace(/^\#?photoGallery-/,'');
			if(hash !== category){
				this.pictureCategory = parseInt(category);
			}
		}
	});

	//////////////////////
	// Picture Methods //
	//////////////////////

	_.assign(Gallery.prototype, {

		/**
		 * Persist Picture Names to Local Storage
		 * @return {void}
		 */
		persistPictureNames: function(){
			window.localStorage['pictureNames'] = JSON.stringify(this.pictures);
		},

		/**
		 * Load Picture Names from Local Storage
		 * @return {void}
		 */
		loadPictureNames: function(){
			var stored = window.localStorage['pictureNames'];
			this.pictures = stored ? JSON.parse(stored) : {};
		},

		/**
		 * Set a specific picture's name
		 * @param {string[]} picture
		 * @param {string} name
		 * @return {string}
		 */
		setPictureName: function(picture, name, updateThumbnail){
			var split = picture[0].split('/');
			var file = split.pop();
			this.pictures[file] = name;
			if(updateThumbnail){
				var thumbnail = _.find(this.container.getElementsByClassName(this.galleryId), function(link){
					return link.href === this.baseUrl + picture[0];
				}, this);
				if(thumbnail){
					thumbnail.getElementsByClassName('title')[0].innerText = name;
					thumbnail.getElementsByClassName('photoGallery-thumb')[0].alt = name;
				}
			}
			this.persistPictureNames();
			return name;
		},

		/**
		 * Fetch a picture's name
		 * @param  {string[]} picture
		 * @return {string}
		 */
		getPictureName: function(picture){
			var split = picture[0].split('/');
			var file = split.pop();
			return this.pictures[file] || this.setPictureName(picture, 'Untitled Picture');
		},

		/**
		 * Open the large picture in a dialog
		 * @param  {string[]} picture
		 * @return {void}
		 */
		largePicture: function(picture, referer){
			this.clearDialog();

			var dialog = this.renderDialog(picture, referer);
			document.body.appendChild(dialog);
			document.body.classList.add('modal-open');
		},

		/**
		 * Clost the picture dialog
		 * @return {void}
		 */
		closePicture: function(){
			this.clearDialog();
		}
	});

	/////////////////////
	// Render Methods //
	/////////////////////

	_.assign(Gallery.prototype, {

		/**
		 * Load a Mustache template
		 * @param  {string} name
		 * @return {string}
		 */
		loadTemplate: function(name){
			if(name in this.templates) return this.templates[name];

			var template = document.getElementById('tpl-' + name);
			var html = template ? template.innerHTML : '';
			Mustache.parse(html);

			return this.templates[name] = html;
		},

		/**
		 * Remove dialogs fromt the DOM
		 * @return {void}
		 */
		clearDialog: function(){
			document.body.classList.remove('modal-open');
			var dialogs = document.getElementsByClassName(this.galleryId + '-dialog');
			_.each(_.reject(dialogs, _.isUndefined), function(dialog){
				var storeEvents = this.storeEvents[dialog.id];
				if(storeEvents){
					window.removeEventListener('keydown', storeEvents.closeDialog);
					if(storeEvents.prevDialog){
						window.removeEventListener('keydown', storeEvents.prevDialog);
						window.removeEventListener('keydown', storeEvents.nextDialog);
					}
				}
				document.body.removeChild(dialog);
			}, this);
		},

		/**
		 * Render the dialog DOM template
		 * @param  {string[]} picture
		 * @return {HTMLElement}
		 */
		renderDialog: function(picture, referer){
			var content = Mustache.render(this.loadTemplate('modal'), {
				title: this.getPictureName(picture),
				imageUrl: this.baseUrl + picture[0],
				galleryId: this.galleryId
			});

			var dialog = jQuery(content)[0];
			var events = this.storeEvents[dialog.id] = {};

			/** Allow Editting of Picture Title */

			this.applyEventListener(dialog.getElementsByClassName('pictureTitle'), 'click', function(e){
				e.preventDefault();

				var name = prompt('Rename this picture:', this.getPictureName(picture));
				if(name.length){
					this.setPictureName(picture, name, true);
					e.target.innerHTML = name;
				}
			}.bind(this));

			/** Bind elements with destroyModal class to close modal */

			events.closeDialog = function(e){
				if(e.target.classList.contains('destroyModal') || e.which === 27){
					e.preventDefault();
					this.clearDialog();
				}
			}.bind(this);
			this.applyEventListener(dialog.getElementsByClassName('destroyModal'), 'click', events.closeDialog);
			window.addEventListener('keydown', events.closeDialog);

			/** Apply Previous and Next Buttons if referer is available */

			if(referer instanceof HTMLElement){
				var prev = referer.previousElementSibling;
				events.prevDialog = function(e){
					if(e.which === 39) return;
					if(prev instanceof HTMLAnchorElement && (prev.classList.contains(this.galleryId) && !e.target.contains(referer) || e.which === 37)){
						e.preventDefault();
						this.clearDialog();
						prev.click();
					}
				}.bind(this);
				this.applyEventListener(dialog.getElementsByClassName('prevModal'), 'click', events.prevDialog);
				window.addEventListener('keydown', events.prevDialog);

				var next = referer.nextElementSibling;
				events.nextDialog = function(e){
					if(e.which === 37) return;
					if(next instanceof HTMLAnchorElement && (next.classList.contains(this.galleryId) && !e.target.contains(referer) || e.which === 39)){
						e.preventDefault();
						this.clearDialog();
						next.click();
					}
				}.bind(this);
				this.applyEventListener(dialog.getElementsByClassName('nextModal'), 'click', events.nextDialog);
				window.addEventListener('keydown', events.nextDialog);
			}

			return dialog;
		},

		/**
		 * Create a category list select
		 * @return {void}
		 */
		renderCategoryList: function(){
			_.times(this.pictureList.length, function(i){
				var content = Mustache.render(this.loadTemplate('categoryList'), {
					key: i,
					name: this.getCategoryName(i),
					selected: (this.pictureCategory === i ? ' selected="selected"' : '')
				});

				var element = jQuery(content)[0];
				this.categoryList.appendChild(element);
			}, this);

			this.categoryList.addEventListener('change', function(e){
				this.setCategory(this.categoryList.value);
			}.bind(this));
		},

		/**
		 * Delete all elements created for this gallery
		 * @return {void}
		 */
		clearGallery: function(){
			var pictures = this.container.getElementsByClassName(this.galleryId);
			_.each(_.reject(pictures, _.isUndefined), document.removeChild, this.container);
		},

		/**
		 * Render a picture node with the event listeners
		 * @param  {string[]} picture
		 * @return {HTMLElement}
		 */
		renderPicture: function(picture){
			var content = Mustache.render(this.loadTemplate('picture'), {
				largeUrl: this.baseUrl + picture[0],
				thumbUrl: this.baseUrl + picture[1],
				galleryId: this.galleryId,
				title: this.getPictureName(picture)
			});

			var link = jQuery(content)[0];

			link.addEventListener('click', function(e){
				e.preventDefault();
				this.largePicture(picture, link);
			}.bind(this));

			return link;
		},

		/**
		 * Update the provided category title element
		 * @return {void}
		 */
		renderTitle: function(){
			this.title.innerHTML = this.getCategoryName(this.pictureCategory);

			this.title.addEventListener('click', function(e){
				e.preventDefault();

				var name = _.trim(prompt('Rename this category:', this.getCategoryName(this.pictureCategory)));
				if(name.length){
					this.setCategoryName(this.pictureCategory, name, true);
					e.target.innerHTML = name;
				}
			}.bind(this));
		},

		/**
		 * Render the photos for the selected category
		 * @return {void}
		 */
		renderCategoryGallery: function(){
			this.container.classList.add('photoGallery');
			this.clearGallery();
			var pictures = this.pictureList[this.pictureCategory];
			if(!_.isArray(pictures)) return;

			this.title.innerHTML = this.getCategoryName(this.pictureCategory);

			_.each(_.map(pictures, this.renderPicture, this), document.appendChild, this.container);
		},

		/**
		 * Alias for renderCategoryGallery
		 * @return {void}
		 */
		render: function(){
			return this.renderCategoryGallery.apply(this, arguments);
		},

		/**
		 * Helper to wrap around bulk DOM event listeners
		 * @param  {HTMLElement[]|HTMLElement}   items
		 * @param  {string}   event
		 * @param  {Function} callback
		 * @return {void}
		 */
		applyEventListener: function(items, event, callback){
			if(items instanceof HTMLElement) items = [items];
			_.each(_.reject(items, _.isUndefined), function(trigger){
				trigger.addEventListener(event, callback);
			});
		}
	});
}).call(this);
