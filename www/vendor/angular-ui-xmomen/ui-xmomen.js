/*!
 * jQuery Validation Plugin v1.14.0
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2015 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend($.fn, {
	// http://jqueryvalidation.org/validate/
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {
				if ( validator.settings.submitHandler ) {
					validator.submitButton = event.target;
				}

				// allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			});

			// validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
				function handle() {
					var hidden, result;
					if ( validator.settings.submitHandler ) {
						if ( validator.submitButton ) {
							// insert a hidden input as a replacement for the missing submit button
							hidden = $( "<input type='hidden'/>" )
								.attr( "name", validator.submitButton.name )
								.val( $( validator.submitButton ).val() )
								.appendTo( validator.currentForm );
						}
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( validator.submitButton ) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				errorList = errorList.concat( validator.errorList );
			});
			validator.errorList = errorList;
		}
		return valid;
	},

	// http://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			settings, staticRules, existingRules, data, param, filtered;

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );
				// remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
					if ( method === "required" ) {
						$( element ).removeAttr( "aria-required" );
					}
				});
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
			$( element ).attr( "aria-required", "true" );
		}

		// make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param });
		}

		return data;
	}
});

// Custom selectors
$.extend( $.expr[ ":" ], {
	// http://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},
	// http://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		return !!$.trim( "" + $( a ).val() );
	},
	// http://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// http://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		});
	});
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {
			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element === this.lastElement ) {
				this.element( element );
			}
		},
		onclick: function( element ) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date ( ISO ).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				});
			});
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			});

			function delegate( event ) {
				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox']", delegate)
				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on("click.validate", "select, option, [type='radio'], [type='checkbox']", delegate);

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}

			// Add aria-required to any Static/Data/Class required fields before first validation
			// Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
			$( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
		},

		// http://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend({}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// http://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				result = true;

			this.lastElement = checkElement;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				result = this.check( checkElement ) !== false;
				if ( result ) {
					delete this.invalid[ checkElement.name ];
				} else {
					this.invalid[ checkElement.name ] = true;
				}
			}
			// Add aria-invalid status for screen readers
			$( element ).attr( "aria-invalid", !result );

			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[ name ],
						element: this.findByName( name )[ 0 ]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				});
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// http://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.submitted = {};
			this.lastElement = null;
			this.prepareForm();
			this.hideErrors();
			var i, elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
				}
			} else {
				elements.removeClass( this.settings.errorClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {
				count++;
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [])
					.filter( ":visible" )
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			}).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				if ( !this.name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ this.name ] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var val,
				$element = $( element ),
				type = element.type;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter(":checked").val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? false : $element.val();
			}

			val = $element.val();
			if ( typeof val === "string" ) {
				return val.replace(/\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				}).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule;

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {

					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		defaultMessage: function( element, method ) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customDataMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[ method ],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}
			this.errorList.push({
				message: message,
				element: element,
				method: rule.method
			});

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map(function() {
				return this.element;
			});
		},

		showLabel: function( element, message ) {
			var place, group, errorID,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );
			if ( error.length ) {
				// refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
				// replace message on existing label
				error.html( message );
			} else {
				// create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement( place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {
					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );
				} else if ( error.parents( "label[for='" + elementID + "']" ).length === 0 ) {
					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby

					errorID = error.attr( "id" ).replace( /(:|\.|\[|\]|\$)/g, "\\$1");
					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + errorID + "\\b" ) ) ) {
						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						$.each( this.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + name + "']", this.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						});
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.idOrName( element ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// aria-describedby should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + describer.replace( /\s+/g, ", #" );
			}
			return this
				.errors()
				.filter( selector );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + name + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[typeof param] ? this.dependTypes[typeof param]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
				this.formSubmitted = false;
			}
		},

		previousValue: function( element ) {
			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		},

		// cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ]);
				}
			});
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// maxlength may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {
		// handle dependency check
		$.each( rules, function( prop, val ) {
			// ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[ prop ];
				}
			}
		});

		// evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) ? parameter( element ) : parameter;
		});

		// clean number parameters
		$.each([ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		});
		$.each([ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ]), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace(/[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ]), Number( parts[ 1 ] ) ];
				}
			}
		});

		if ( $.validator.autoCreateRanges ) {
			// auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	methods: {

		// http://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {
			// check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value.length > 0;
		},

		// http://jqueryvalidation.org/email-method/
		email: function( value, element ) {
			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// http://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// http://jqueryvalidation.org/date-method/
		date: function( value, element ) {
			return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
		},

		// http://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// http://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// http://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// http://jqueryvalidation.org/creditcard-method/
		// based on http://en.wikipedia.org/wiki/Luhn_algorithm
		creditcard: function( value, element ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}
			// accept only spaces, digits and dashes
			if ( /[^0-9 \-]+/.test( value ) ) {
				return false;
			}
			var nCheck = 0,
				nDigit = 0,
				bEven = false,
				n, cDigit;

			value = value.replace( /\D/g, "" );

			// Basing min and max length on
			// http://developer.ean.com/general_info/Valid_Credit_Card_Types
			if ( value.length < 13 || value.length > 19 ) {
				return false;
			}

			for ( n = value.length - 1; n >= 0; n--) {
				cDigit = value.charAt( n );
				nDigit = parseInt( cDigit, 10 );
				if ( bEven ) {
					if ( ( nDigit *= 2 ) > 9 ) {
						nDigit -= 9;
					}
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return ( nCheck % 10 ) === 0;
		},

		// http://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// http://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// http://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// http://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// http://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// http://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $( param );
			if ( this.settings.onfocusout ) {
				target.off( ".validate-equalTo" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				});
			}
			return value === target.val();
		},

		// http://jqueryvalidation.org/remote-method/
		remote: function( value, element, param ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			var previous = this.previousValue( element ),
				validator, data;

			if (!this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = this.settings.messages[ element.name ].remote;
			this.settings.messages[ element.name ].remote = previous.message;

			param = typeof param === "string" && { url: param } || param;

			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true" || response == param.handler(response),
						errors, message, submitted;

					validator.settings.messages[ element.name ].remote = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.prepareElement( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						delete validator.invalid[ element.name ];
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, "remote" );
						errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

});

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;
// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter(function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			pendingRequests[port] = xhr;
		}
	});
} else {
	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			pendingRequests[port] = ajax.apply(this, arguments);
			return pendingRequests[port];
		}
		return ajax.apply(this, arguments);
	};
}

}));
'use strict';

/*
 * AngularJS Toaster
 * Version: 0.4.8
 *
 * Copyright 2013 Jiri Kavulak.  
 * All Rights Reserved.  
 * Use, reproduction, distribution, and modification of this code is subject to the terms and 
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Author: Jiri Kavulak
 * Related to project of John Papa and Hans Fjällemark
 */

angular.module('toaster', ['ngAnimate'])
.service('toaster', ['$rootScope', function ($rootScope) {
    this.pop = function (type, title, body, timeout, bodyOutputType, clickHandler) {
        this.toast = {
            type: type,
            title: title,
            body: body,
            timeout: timeout,
            bodyOutputType: bodyOutputType,
            clickHandler: clickHandler
        };
        $rootScope.$broadcast('toaster-newToast');
    };

    this.clear = function () {
        $rootScope.$broadcast('toaster-clearToasts');
    };
}])
.constant('toasterConfig', {
    'limit': 0,                   // limits max number of toasts 
    'tap-to-dismiss': true,
    'close-button': false,
    'newest-on-top': true,
    //'fade-in': 1000,            // done in css
    //'on-fade-in': undefined,    // not implemented
    //'fade-out': 1000,           // done in css
    // 'on-fade-out': undefined,  // not implemented
    //'extended-time-out': 1000,    // not implemented
    'time-out': 2000, // Set timeOut and extendedTimeout to 0 to make it sticky
    'icon-classes': {
        error: 'toast-error',
        info: 'toast-info',
        wait: 'toast-wait',
        success: 'toast-success',
        warning: 'toast-warning'
    },
    'body-output-type': '', // Options: '', 'trustedHtml', 'template'
    'body-template': 'toasterBodyTmpl.html',
    'icon-class': 'toast-info',
    'position-class': 'toast-top-right',
    'title-class': 'toast-title',
    'message-class': 'toast-message'
})
.directive('toasterContainer', ['$compile', '$timeout', '$sce', 'toasterConfig', 'toaster',
function ($compile, $timeout, $sce, toasterConfig, toaster) {
    return {
        replace: true,
        restrict: 'EA',
        scope: true, // creates an internal scope for this directive
        link: function (scope, elm, attrs) {

            var id = 0,
                mergedConfig;

            mergedConfig = angular.extend({}, toasterConfig, scope.$eval(attrs.toasterOptions));

            scope.config = {
                position: mergedConfig['position-class'],
                title: mergedConfig['title-class'],
                message: mergedConfig['message-class'],
                tap: mergedConfig['tap-to-dismiss'],
                closeButton: mergedConfig['close-button']
            };

            scope.configureTimer = function configureTimer(toast) {
                var timeout = typeof (toast.timeout) == "number" ? toast.timeout : mergedConfig['time-out'];
                if (timeout > 0)
                    setTimeout(toast, timeout);
            };

            function addToast(toast) {
                toast.type = mergedConfig['icon-classes'][toast.type];
                if (!toast.type)
                    toast.type = mergedConfig['icon-class'];

                id++;
                angular.extend(toast, { id: id });

                // Set the toast.bodyOutputType to the default if it isn't set
                toast.bodyOutputType = toast.bodyOutputType || mergedConfig['body-output-type'];
                switch (toast.bodyOutputType) {
                    case 'trustedHtml':
                        toast.html = $sce.trustAsHtml(toast.body);
                        break;
                    case 'template':
                        toast.bodyTemplate = toast.body || mergedConfig['body-template'];
                        break;
                }

                scope.configureTimer(toast);

                if (mergedConfig['newest-on-top'] === true) {
                    scope.toasters.unshift(toast);
                    if (mergedConfig['limit'] > 0 && scope.toasters.length > mergedConfig['limit']) {
                        scope.toasters.pop();
                    }
                } else {
                    scope.toasters.push(toast);
                    if (mergedConfig['limit'] > 0 && scope.toasters.length > mergedConfig['limit']) {
                        scope.toasters.shift();
                    }
                }
            }

            function setTimeout(toast, time) {
                toast.timeout = $timeout(function () {
                    scope.removeToast(toast.id);
                }, time);
            }

            scope.toasters = [];
            scope.$on('toaster-newToast', function () {
                addToast(toaster.toast);
            });

            scope.$on('toaster-clearToasts', function () {
                scope.toasters.splice(0, scope.toasters.length);
            });
        },
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            $scope.stopTimer = function (toast) {
                if (toast.timeout) {
                    $timeout.cancel(toast.timeout);
                    toast.timeout = null;
                }
            };

            $scope.restartTimer = function (toast) {
                if (!toast.timeout)
                    $scope.configureTimer(toast);
            };

            $scope.removeToast = function (id) {
                var i = 0;
                for (i; i < $scope.toasters.length; i++) {
                    if ($scope.toasters[i].id === id)
                        break;
                }
                $scope.toasters.splice(i, 1);
            };

            $scope.click = function (toaster) {
                if ($scope.config.tap === true) {
                    if (toaster.clickHandler && angular.isFunction($scope.$parent.$eval(toaster.clickHandler))) {
                        var result = $scope.$parent.$eval(toaster.clickHandler)(toaster);
                        if (result === true)
                            $scope.removeToast(toaster.id);
                    } else {
                        if (angular.isString(toaster.clickHandler))
                            console.log("TOAST-NOTE: Your click handler is not inside a parent scope of toaster-container.");
                        $scope.removeToast(toaster.id);
                    }
                }
            };
        }],
        template:
        '<div  id="toast-container" ng-class="config.position">' +
            '<div ng-repeat="toaster in toasters" class="toast" ng-class="toaster.type" ng-click="click(toaster)" ng-mouseover="stopTimer(toaster)"  ng-mouseout="restartTimer(toaster)">' +
              '<button class="toast-close-button" ng-show="config.closeButton">&times;</button>' +
              '<div ng-class="config.title">{{toaster.title}}</div>' +
              '<div ng-class="config.message" ng-switch on="toaster.bodyOutputType">' +
                '<div ng-switch-when="trustedHtml" ng-bind-html="toaster.html"></div>' +
                '<div ng-switch-when="template"><div ng-include="toaster.bodyTemplate"></div></div>' +
                '<div ng-switch-default >{{toaster.body}}</div>' +
              '</div>' +
            '</div>' +
        '</div>'
    };
}]);

/* Chosen v1.1.0 | (c) 2011-2013 by Harvest | MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md */
!function(){var a,AbstractChosen,Chosen,SelectParser,b,c={}.hasOwnProperty,d=function(a,b){function d(){this.constructor=a}for(var e in b)c.call(b,e)&&(a[e]=b[e]);return d.prototype=b.prototype,a.prototype=new d,a.__super__=b.prototype,a};SelectParser=function(){function SelectParser(){this.options_index=0,this.parsed=[]}return SelectParser.prototype.add_node=function(a){return"OPTGROUP"===a.nodeName.toUpperCase()?this.add_group(a):this.add_option(a)},SelectParser.prototype.add_group=function(a){var b,c,d,e,f,g;for(b=this.parsed.length,this.parsed.push({array_index:b,group:!0,label:this.escapeExpression(a.label),children:0,disabled:a.disabled}),f=a.childNodes,g=[],d=0,e=f.length;e>d;d++)c=f[d],g.push(this.add_option(c,b,a.disabled));return g},SelectParser.prototype.add_option=function(a,b,c){return"OPTION"===a.nodeName.toUpperCase()?(""!==a.text?(null!=b&&(this.parsed[b].children+=1),this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,value:a.value,text:a.text,html:a.innerHTML,selected:a.selected,disabled:c===!0?c:a.disabled,group_array_index:b,classes:a.className,style:a.style.cssText})):this.parsed.push({array_index:this.parsed.length,options_index:this.options_index,empty:!0}),this.options_index+=1):void 0},SelectParser.prototype.escapeExpression=function(a){var b,c;return null==a||a===!1?"":/[\&\<\>\"\'\`]/.test(a)?(b={"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},c=/&(?!\w+;)|[\<\>\"\'\`]/g,a.replace(c,function(a){return b[a]||"&amp;"})):a},SelectParser}(),SelectParser.select_to_array=function(a){var b,c,d,e,f;for(c=new SelectParser,f=a.childNodes,d=0,e=f.length;e>d;d++)b=f[d],c.add_node(b);return c.parsed},AbstractChosen=function(){function AbstractChosen(a,b){this.form_field=a,this.options=null!=b?b:{},AbstractChosen.browser_is_supported()&&(this.is_multiple=this.form_field.multiple,this.set_default_text(),this.set_default_values(),this.setup(),this.set_up_html(),this.register_observers())}return AbstractChosen.prototype.set_default_values=function(){var a=this;return this.click_test_action=function(b){return a.test_active_click(b)},this.activate_action=function(b){return a.activate_field(b)},this.active_field=!1,this.mouse_on_container=!1,this.results_showing=!1,this.result_highlighted=null,this.allow_single_deselect=null!=this.options.allow_single_deselect&&null!=this.form_field.options[0]&&""===this.form_field.options[0].text?this.options.allow_single_deselect:!1,this.disable_search_threshold=this.options.disable_search_threshold||0,this.disable_search=this.options.disable_search||!1,this.enable_split_word_search=null!=this.options.enable_split_word_search?this.options.enable_split_word_search:!0,this.group_search=null!=this.options.group_search?this.options.group_search:!0,this.search_contains=this.options.search_contains||!1,this.single_backstroke_delete=null!=this.options.single_backstroke_delete?this.options.single_backstroke_delete:!0,this.max_selected_options=this.options.max_selected_options||1/0,this.inherit_select_classes=this.options.inherit_select_classes||!1,this.display_selected_options=null!=this.options.display_selected_options?this.options.display_selected_options:!0,this.display_disabled_options=null!=this.options.display_disabled_options?this.options.display_disabled_options:!0},AbstractChosen.prototype.set_default_text=function(){return this.default_text=this.form_field.getAttribute("data-placeholder")?this.form_field.getAttribute("data-placeholder"):this.is_multiple?this.options.placeholder_text_multiple||this.options.placeholder_text||AbstractChosen.default_multiple_text:this.options.placeholder_text_single||this.options.placeholder_text||AbstractChosen.default_single_text,this.results_none_found=this.form_field.getAttribute("data-no_results_text")||this.options.no_results_text||AbstractChosen.default_no_result_text},AbstractChosen.prototype.mouse_enter=function(){return this.mouse_on_container=!0},AbstractChosen.prototype.mouse_leave=function(){return this.mouse_on_container=!1},AbstractChosen.prototype.input_focus=function(){var a=this;if(this.is_multiple){if(!this.active_field)return setTimeout(function(){return a.container_mousedown()},50)}else if(!this.active_field)return this.activate_field()},AbstractChosen.prototype.input_blur=function(){var a=this;return this.mouse_on_container?void 0:(this.active_field=!1,setTimeout(function(){return a.blur_test()},100))},AbstractChosen.prototype.results_option_build=function(a){var b,c,d,e,f;for(b="",f=this.results_data,d=0,e=f.length;e>d;d++)c=f[d],b+=c.group?this.result_add_group(c):this.result_add_option(c),(null!=a?a.first:void 0)&&(c.selected&&this.is_multiple?this.choice_build(c):c.selected&&!this.is_multiple&&this.single_set_selected_text(c.text));return b},AbstractChosen.prototype.result_add_option=function(a){var b,c;return a.search_match?this.include_option_in_results(a)?(b=[],a.disabled||a.selected&&this.is_multiple||b.push("active-result"),!a.disabled||a.selected&&this.is_multiple||b.push("disabled-result"),a.selected&&b.push("result-selected"),null!=a.group_array_index&&b.push("group-option"),""!==a.classes&&b.push(a.classes),c=document.createElement("li"),c.className=b.join(" "),c.style.cssText=a.style,c.setAttribute("data-option-array-index",a.array_index),c.innerHTML=a.search_text,this.outerHTML(c)):"":""},AbstractChosen.prototype.result_add_group=function(a){var b;return a.search_match||a.group_match?a.active_options>0?(b=document.createElement("li"),b.className="group-result",b.innerHTML=a.search_text,this.outerHTML(b)):"":""},AbstractChosen.prototype.results_update_field=function(){return this.set_default_text(),this.is_multiple||this.results_reset_cleanup(),this.result_clear_highlight(),this.results_build(),this.results_showing?this.winnow_results():void 0},AbstractChosen.prototype.reset_single_select_options=function(){var a,b,c,d,e;for(d=this.results_data,e=[],b=0,c=d.length;c>b;b++)a=d[b],a.selected?e.push(a.selected=!1):e.push(void 0);return e},AbstractChosen.prototype.results_toggle=function(){return this.results_showing?this.results_hide():this.results_show()},AbstractChosen.prototype.results_search=function(){return this.results_showing?this.winnow_results():this.results_show()},AbstractChosen.prototype.winnow_results=function(){var a,b,c,d,e,f,g,h,i,j,k,l,m;for(this.no_results_clear(),e=0,g=this.get_search_text(),a=g.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),d=this.search_contains?"":"^",c=new RegExp(d+a,"i"),j=new RegExp(a,"i"),m=this.results_data,k=0,l=m.length;l>k;k++)b=m[k],b.search_match=!1,f=null,this.include_option_in_results(b)&&(b.group&&(b.group_match=!1,b.active_options=0),null!=b.group_array_index&&this.results_data[b.group_array_index]&&(f=this.results_data[b.group_array_index],0===f.active_options&&f.search_match&&(e+=1),f.active_options+=1),(!b.group||this.group_search)&&(b.search_text=b.group?b.label:b.html,b.search_match=this.search_string_match(b.search_text,c),b.search_match&&!b.group&&(e+=1),b.search_match?(g.length&&(h=b.search_text.search(j),i=b.search_text.substr(0,h+g.length)+"</em>"+b.search_text.substr(h+g.length),b.search_text=i.substr(0,h)+"<em>"+i.substr(h)),null!=f&&(f.group_match=!0)):null!=b.group_array_index&&this.results_data[b.group_array_index].search_match&&(b.search_match=!0)));return this.result_clear_highlight(),1>e&&g.length?(this.update_results_content(""),this.no_results(g)):(this.update_results_content(this.results_option_build()),this.winnow_results_set_highlight())},AbstractChosen.prototype.search_string_match=function(a,b){var c,d,e,f;if(b.test(a))return!0;if(this.enable_split_word_search&&(a.indexOf(" ")>=0||0===a.indexOf("["))&&(d=a.replace(/\[|\]/g,"").split(" "),d.length))for(e=0,f=d.length;f>e;e++)if(c=d[e],b.test(c))return!0},AbstractChosen.prototype.choices_count=function(){var a,b,c,d;if(null!=this.selected_option_count)return this.selected_option_count;for(this.selected_option_count=0,d=this.form_field.options,b=0,c=d.length;c>b;b++)a=d[b],a.selected&&(this.selected_option_count+=1);return this.selected_option_count},AbstractChosen.prototype.choices_click=function(a){return a.preventDefault(),this.results_showing||this.is_disabled?void 0:this.results_show()},AbstractChosen.prototype.keyup_checker=function(a){var b,c;switch(b=null!=(c=a.which)?c:a.keyCode,this.search_field_scale(),b){case 8:if(this.is_multiple&&this.backstroke_length<1&&this.choices_count()>0)return this.keydown_backstroke();if(!this.pending_backstroke)return this.result_clear_highlight(),this.results_search();break;case 13:if(a.preventDefault(),this.results_showing)return this.result_select(a);break;case 27:return this.results_showing&&this.results_hide(),!0;case 9:case 38:case 40:case 16:case 91:case 17:break;default:return this.results_search()}},AbstractChosen.prototype.clipboard_event_checker=function(){var a=this;return setTimeout(function(){return a.results_search()},50)},AbstractChosen.prototype.container_width=function(){return null!=this.options.width?this.options.width:""+this.form_field.offsetWidth+"px"},AbstractChosen.prototype.include_option_in_results=function(a){return this.is_multiple&&!this.display_selected_options&&a.selected?!1:!this.display_disabled_options&&a.disabled?!1:a.empty?!1:!0},AbstractChosen.prototype.search_results_touchstart=function(a){return this.touch_started=!0,this.search_results_mouseover(a)},AbstractChosen.prototype.search_results_touchmove=function(a){return this.touch_started=!1,this.search_results_mouseout(a)},AbstractChosen.prototype.search_results_touchend=function(a){return this.touch_started?this.search_results_mouseup(a):void 0},AbstractChosen.prototype.outerHTML=function(a){var b;return a.outerHTML?a.outerHTML:(b=document.createElement("div"),b.appendChild(a),b.innerHTML)},AbstractChosen.browser_is_supported=function(){return"Microsoft Internet Explorer"===window.navigator.appName?document.documentMode>=8:/iP(od|hone)/i.test(window.navigator.userAgent)?!1:/Android/i.test(window.navigator.userAgent)&&/Mobile/i.test(window.navigator.userAgent)?!1:!0},AbstractChosen.default_multiple_text="Select Some Options",AbstractChosen.default_single_text="Select an Option",AbstractChosen.default_no_result_text="No results match",AbstractChosen}(),a=jQuery,a.fn.extend({chosen:function(b){return AbstractChosen.browser_is_supported()?this.each(function(){var c,d;c=a(this),d=c.data("chosen"),"destroy"===b&&d?d.destroy():d||c.data("chosen",new Chosen(this,b))}):this}}),Chosen=function(c){function Chosen(){return b=Chosen.__super__.constructor.apply(this,arguments)}return d(Chosen,c),Chosen.prototype.setup=function(){return this.form_field_jq=a(this.form_field),this.current_selectedIndex=this.form_field.selectedIndex,this.is_rtl=this.form_field_jq.hasClass("chosen-rtl")},Chosen.prototype.set_up_html=function(){var b,c;return b=["chosen-container"],b.push("chosen-container-"+(this.is_multiple?"multi":"single")),this.inherit_select_classes&&this.form_field.className&&b.push(this.form_field.className),this.is_rtl&&b.push("chosen-rtl"),c={"class":b.join(" "),style:"width: "+this.container_width()+";",title:this.form_field.title},this.form_field.id.length&&(c.id=this.form_field.id.replace(/[^\w]/g,"_")+"_chosen"),this.container=a("<div />",c),this.is_multiple?this.container.html('<ul class="chosen-choices"><li class="search-field"><input type="text" value="'+this.default_text+'" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chosen-drop"><ul class="chosen-results"></ul></div>'):this.container.html('<a class="chosen-single chosen-default" tabindex="-1"><span>'+this.default_text+'</span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off" /></div><ul class="chosen-results"></ul></div>'),this.form_field_jq.hide().after(this.container),this.dropdown=this.container.find("div.chosen-drop").first(),this.search_field=this.container.find("input").first(),this.search_results=this.container.find("ul.chosen-results").first(),this.search_field_scale(),this.search_no_results=this.container.find("li.no-results").first(),this.is_multiple?(this.search_choices=this.container.find("ul.chosen-choices").first(),this.search_container=this.container.find("li.search-field").first()):(this.search_container=this.container.find("div.chosen-search").first(),this.selected_item=this.container.find(".chosen-single").first()),this.results_build(),this.set_tab_index(),this.set_label_behavior(),this.form_field_jq.trigger("chosen:ready",{chosen:this})},Chosen.prototype.register_observers=function(){var a=this;return this.container.bind("mousedown.chosen",function(b){a.container_mousedown(b)}),this.container.bind("mouseup.chosen",function(b){a.container_mouseup(b)}),this.container.bind("mouseenter.chosen",function(b){a.mouse_enter(b)}),this.container.bind("mouseleave.chosen",function(b){a.mouse_leave(b)}),this.search_results.bind("mouseup.chosen",function(b){a.search_results_mouseup(b)}),this.search_results.bind("mouseover.chosen",function(b){a.search_results_mouseover(b)}),this.search_results.bind("mouseout.chosen",function(b){a.search_results_mouseout(b)}),this.search_results.bind("mousewheel.chosen DOMMouseScroll.chosen",function(b){a.search_results_mousewheel(b)}),this.search_results.bind("touchstart.chosen",function(b){a.search_results_touchstart(b)}),this.search_results.bind("touchmove.chosen",function(b){a.search_results_touchmove(b)}),this.search_results.bind("touchend.chosen",function(b){a.search_results_touchend(b)}),this.form_field_jq.bind("chosen:updated.chosen",function(b){a.results_update_field(b)}),this.form_field_jq.bind("chosen:activate.chosen",function(b){a.activate_field(b)}),this.form_field_jq.bind("chosen:open.chosen",function(b){a.container_mousedown(b)}),this.form_field_jq.bind("chosen:close.chosen",function(b){a.input_blur(b)}),this.search_field.bind("blur.chosen",function(b){a.input_blur(b)}),this.search_field.bind("keyup.chosen",function(b){a.keyup_checker(b)}),this.search_field.bind("keydown.chosen",function(b){a.keydown_checker(b)}),this.search_field.bind("focus.chosen",function(b){a.input_focus(b)}),this.search_field.bind("cut.chosen",function(b){a.clipboard_event_checker(b)}),this.search_field.bind("paste.chosen",function(b){a.clipboard_event_checker(b)}),this.is_multiple?this.search_choices.bind("click.chosen",function(b){a.choices_click(b)}):this.container.bind("click.chosen",function(a){a.preventDefault()})},Chosen.prototype.destroy=function(){return a(this.container[0].ownerDocument).unbind("click.chosen",this.click_test_action),this.search_field[0].tabIndex&&(this.form_field_jq[0].tabIndex=this.search_field[0].tabIndex),this.container.remove(),this.form_field_jq.removeData("chosen"),this.form_field_jq.show()},Chosen.prototype.search_field_disabled=function(){return this.is_disabled=this.form_field_jq[0].disabled,this.is_disabled?(this.container.addClass("chosen-disabled"),this.search_field[0].disabled=!0,this.is_multiple||this.selected_item.unbind("focus.chosen",this.activate_action),this.close_field()):(this.container.removeClass("chosen-disabled"),this.search_field[0].disabled=!1,this.is_multiple?void 0:this.selected_item.bind("focus.chosen",this.activate_action))},Chosen.prototype.container_mousedown=function(b){return this.is_disabled||(b&&"mousedown"===b.type&&!this.results_showing&&b.preventDefault(),null!=b&&a(b.target).hasClass("search-choice-close"))?void 0:(this.active_field?this.is_multiple||!b||a(b.target)[0]!==this.selected_item[0]&&!a(b.target).parents("a.chosen-single").length||(b.preventDefault(),this.results_toggle()):(this.is_multiple&&this.search_field.val(""),a(this.container[0].ownerDocument).bind("click.chosen",this.click_test_action),this.results_show()),this.activate_field())},Chosen.prototype.container_mouseup=function(a){return"ABBR"!==a.target.nodeName||this.is_disabled?void 0:this.results_reset(a)},Chosen.prototype.search_results_mousewheel=function(a){var b;return a.originalEvent&&(b=-a.originalEvent.wheelDelta||a.originalEvent.detail),null!=b?(a.preventDefault(),"DOMMouseScroll"===a.type&&(b=40*b),this.search_results.scrollTop(b+this.search_results.scrollTop())):void 0},Chosen.prototype.blur_test=function(){return!this.active_field&&this.container.hasClass("chosen-container-active")?this.close_field():void 0},Chosen.prototype.close_field=function(){return a(this.container[0].ownerDocument).unbind("click.chosen",this.click_test_action),this.active_field=!1,this.results_hide(),this.container.removeClass("chosen-container-active"),this.clear_backstroke(),this.show_search_field_default(),this.search_field_scale()},Chosen.prototype.activate_field=function(){return this.container.addClass("chosen-container-active"),this.active_field=!0,this.search_field.val(this.search_field.val()),this.search_field.focus()},Chosen.prototype.test_active_click=function(b){var c;return c=a(b.target).closest(".chosen-container"),c.length&&this.container[0]===c[0]?this.active_field=!0:this.close_field()},Chosen.prototype.results_build=function(){return this.parsing=!0,this.selected_option_count=null,this.results_data=SelectParser.select_to_array(this.form_field),this.is_multiple?this.search_choices.find("li.search-choice").remove():this.is_multiple||(this.single_set_selected_text(),this.disable_search||this.form_field.options.length<=this.disable_search_threshold?(this.search_field[0].readOnly=!0,this.container.addClass("chosen-container-single-nosearch")):(this.search_field[0].readOnly=!1,this.container.removeClass("chosen-container-single-nosearch"))),this.update_results_content(this.results_option_build({first:!0})),this.search_field_disabled(),this.show_search_field_default(),this.search_field_scale(),this.parsing=!1},Chosen.prototype.result_do_highlight=function(a){var b,c,d,e,f;if(a.length){if(this.result_clear_highlight(),this.result_highlight=a,this.result_highlight.addClass("highlighted"),d=parseInt(this.search_results.css("maxHeight"),10),f=this.search_results.scrollTop(),e=d+f,c=this.result_highlight.position().top+this.search_results.scrollTop(),b=c+this.result_highlight.outerHeight(),b>=e)return this.search_results.scrollTop(b-d>0?b-d:0);if(f>c)return this.search_results.scrollTop(c)}},Chosen.prototype.result_clear_highlight=function(){return this.result_highlight&&this.result_highlight.removeClass("highlighted"),this.result_highlight=null},Chosen.prototype.results_show=function(){return this.is_multiple&&this.max_selected_options<=this.choices_count()?(this.form_field_jq.trigger("chosen:maxselected",{chosen:this}),!1):(this.container.addClass("chosen-with-drop"),this.results_showing=!0,this.search_field.focus(),this.search_field.val(this.search_field.val()),this.winnow_results(),this.form_field_jq.trigger("chosen:showing_dropdown",{chosen:this}))},Chosen.prototype.update_results_content=function(a){return this.search_results.html(a)},Chosen.prototype.results_hide=function(){return this.results_showing&&(this.result_clear_highlight(),this.container.removeClass("chosen-with-drop"),this.form_field_jq.trigger("chosen:hiding_dropdown",{chosen:this})),this.results_showing=!1},Chosen.prototype.set_tab_index=function(){var a;return this.form_field.tabIndex?(a=this.form_field.tabIndex,this.form_field.tabIndex=-1,this.search_field[0].tabIndex=a):void 0},Chosen.prototype.set_label_behavior=function(){var b=this;return this.form_field_label=this.form_field_jq.parents("label"),!this.form_field_label.length&&this.form_field.id.length&&(this.form_field_label=a("label[for='"+this.form_field.id+"']")),this.form_field_label.length>0?this.form_field_label.bind("click.chosen",function(a){return b.is_multiple?b.container_mousedown(a):b.activate_field()}):void 0},Chosen.prototype.show_search_field_default=function(){return this.is_multiple&&this.choices_count()<1&&!this.active_field?(this.search_field.val(this.default_text),this.search_field.addClass("default")):(this.search_field.val(""),this.search_field.removeClass("default"))},Chosen.prototype.search_results_mouseup=function(b){var c;return c=a(b.target).hasClass("active-result")?a(b.target):a(b.target).parents(".active-result").first(),c.length?(this.result_highlight=c,this.result_select(b),this.search_field.focus()):void 0},Chosen.prototype.search_results_mouseover=function(b){var c;return c=a(b.target).hasClass("active-result")?a(b.target):a(b.target).parents(".active-result").first(),c?this.result_do_highlight(c):void 0},Chosen.prototype.search_results_mouseout=function(b){return a(b.target).hasClass("active-result")?this.result_clear_highlight():void 0},Chosen.prototype.choice_build=function(b){var c,d,e=this;return c=a("<li />",{"class":"search-choice"}).html("<span>"+b.html+"</span>"),b.disabled?c.addClass("search-choice-disabled"):(d=a("<a />",{"class":"search-choice-close","data-option-array-index":b.array_index}),d.bind("click.chosen",function(a){return e.choice_destroy_link_click(a)}),c.append(d)),this.search_container.before(c)},Chosen.prototype.choice_destroy_link_click=function(b){return b.preventDefault(),b.stopPropagation(),this.is_disabled?void 0:this.choice_destroy(a(b.target))},Chosen.prototype.choice_destroy=function(a){return this.result_deselect(a[0].getAttribute("data-option-array-index"))?(this.show_search_field_default(),this.is_multiple&&this.choices_count()>0&&this.search_field.val().length<1&&this.results_hide(),a.parents("li").first().remove(),this.search_field_scale()):void 0},Chosen.prototype.results_reset=function(){return this.reset_single_select_options(),this.form_field.options[0].selected=!0,this.single_set_selected_text(),this.show_search_field_default(),this.results_reset_cleanup(),this.form_field_jq.trigger("change"),this.active_field?this.results_hide():void 0},Chosen.prototype.results_reset_cleanup=function(){return this.current_selectedIndex=this.form_field.selectedIndex,this.selected_item.find("abbr").remove()},Chosen.prototype.result_select=function(a){var b,c;return this.result_highlight?(b=this.result_highlight,this.result_clear_highlight(),this.is_multiple&&this.max_selected_options<=this.choices_count()?(this.form_field_jq.trigger("chosen:maxselected",{chosen:this}),!1):(this.is_multiple?b.removeClass("active-result"):this.reset_single_select_options(),c=this.results_data[b[0].getAttribute("data-option-array-index")],c.selected=!0,this.form_field.options[c.options_index].selected=!0,this.selected_option_count=null,this.is_multiple?this.choice_build(c):this.single_set_selected_text(c.text),(a.metaKey||a.ctrlKey)&&this.is_multiple||this.results_hide(),this.search_field.val(""),(this.is_multiple||this.form_field.selectedIndex!==this.current_selectedIndex)&&this.form_field_jq.trigger("change",{selected:this.form_field.options[c.options_index].value}),this.current_selectedIndex=this.form_field.selectedIndex,this.search_field_scale())):void 0},Chosen.prototype.single_set_selected_text=function(a){return null==a&&(a=this.default_text),a===this.default_text?this.selected_item.addClass("chosen-default"):(this.single_deselect_control_build(),this.selected_item.removeClass("chosen-default")),this.selected_item.find("span").text(a)},Chosen.prototype.result_deselect=function(a){var b;return b=this.results_data[a],this.form_field.options[b.options_index].disabled?!1:(b.selected=!1,this.form_field.options[b.options_index].selected=!1,this.selected_option_count=null,this.result_clear_highlight(),this.results_showing&&this.winnow_results(),this.form_field_jq.trigger("change",{deselected:this.form_field.options[b.options_index].value}),this.search_field_scale(),!0)},Chosen.prototype.single_deselect_control_build=function(){return this.allow_single_deselect?(this.selected_item.find("abbr").length||this.selected_item.find("span").first().after('<abbr class="search-choice-close"></abbr>'),this.selected_item.addClass("chosen-single-with-deselect")):void 0},Chosen.prototype.get_search_text=function(){return this.search_field.val()===this.default_text?"":a("<div/>").text(a.trim(this.search_field.val())).html()},Chosen.prototype.winnow_results_set_highlight=function(){var a,b;return b=this.is_multiple?[]:this.search_results.find(".result-selected.active-result"),a=b.length?b.first():this.search_results.find(".active-result").first(),null!=a?this.result_do_highlight(a):void 0},Chosen.prototype.no_results=function(b){var c;return c=a('<li class="no-results">'+this.results_none_found+' "<span></span>"</li>'),c.find("span").first().html(b),this.search_results.append(c),this.form_field_jq.trigger("chosen:no_results",{chosen:this})},Chosen.prototype.no_results_clear=function(){return this.search_results.find(".no-results").remove()},Chosen.prototype.keydown_arrow=function(){var a;return this.results_showing&&this.result_highlight?(a=this.result_highlight.nextAll("li.active-result").first())?this.result_do_highlight(a):void 0:this.results_show()},Chosen.prototype.keyup_arrow=function(){var a;return this.results_showing||this.is_multiple?this.result_highlight?(a=this.result_highlight.prevAll("li.active-result"),a.length?this.result_do_highlight(a.first()):(this.choices_count()>0&&this.results_hide(),this.result_clear_highlight())):void 0:this.results_show()},Chosen.prototype.keydown_backstroke=function(){var a;return this.pending_backstroke?(this.choice_destroy(this.pending_backstroke.find("a").first()),this.clear_backstroke()):(a=this.search_container.siblings("li.search-choice").last(),a.length&&!a.hasClass("search-choice-disabled")?(this.pending_backstroke=a,this.single_backstroke_delete?this.keydown_backstroke():this.pending_backstroke.addClass("search-choice-focus")):void 0)},Chosen.prototype.clear_backstroke=function(){return this.pending_backstroke&&this.pending_backstroke.removeClass("search-choice-focus"),this.pending_backstroke=null},Chosen.prototype.keydown_checker=function(a){var b,c;switch(b=null!=(c=a.which)?c:a.keyCode,this.search_field_scale(),8!==b&&this.pending_backstroke&&this.clear_backstroke(),b){case 8:this.backstroke_length=this.search_field.val().length;break;case 9:this.results_showing&&!this.is_multiple&&this.result_select(a),this.mouse_on_container=!1;break;case 13:a.preventDefault();break;case 38:a.preventDefault(),this.keyup_arrow();break;case 40:a.preventDefault(),this.keydown_arrow()}},Chosen.prototype.search_field_scale=function(){var b,c,d,e,f,g,h,i,j;if(this.is_multiple){for(d=0,h=0,f="position:absolute; left: -1000px; top: -1000px; display:none;",g=["font-size","font-style","font-weight","font-family","line-height","text-transform","letter-spacing"],i=0,j=g.length;j>i;i++)e=g[i],f+=e+":"+this.search_field.css(e)+";";return b=a("<div />",{style:f}),b.text(this.search_field.val()),a("body").append(b),h=b.width()+25,b.remove(),c=this.container.outerWidth(),h>c-10&&(h=c-10),this.search_field.css({width:h+"px"})}},Chosen}(AbstractChosen)}.call(this);
/**
 * angular-chosen-localytics - Angular Chosen directive is an AngularJS Directive that brings the Chosen jQuery in a Angular way
 * @version v1.5.1
 * @link http://github.com/leocaseiro/angular-chosen
 * @license MIT
 */
(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('localytics.directives', []);

  angular.module('localytics.directives').directive('chosen', [
    '$timeout', function($timeout) {
      var CHOSEN_OPTION_WHITELIST, NG_OPTIONS_REGEXP, isEmpty, snakeCase;
      NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;
      CHOSEN_OPTION_WHITELIST = ['persistentCreateOption', 'createOptionText', 'createOption', 'skipNoResults', 'noResultsText', 'allowSingleDeselect', 'disableSearchThreshold', 'disableSearch', 'enableSplitWordSearch', 'inheritSelectClasses', 'maxSelectedOptions', 'placeholderTextMultiple', 'placeholderTextSingle', 'searchContains', 'singleBackstrokeDelete', 'displayDisabledOptions', 'displaySelectedOptions', 'width', 'includeGroupLabelInSelected', 'maxShownResults'];
      snakeCase = function(input) {
        return input.replace(/[A-Z]/g, function($1) {
          return "_" + ($1.toLowerCase());
        });
      };
      isEmpty = function(value) {
        var key;
        if (angular.isArray(value)) {
          return value.length === 0;
        } else if (angular.isObject(value)) {
          for (key in value) {
            if (value.hasOwnProperty(key)) {
              return false;
            }
          }
        }
        return true;
      };
      return {
        restrict: 'A',
        require: '?ngModel',
        priority: 1,
        link: function(scope, element, attr, ngModel) {
          var chosen, empty, initOrUpdate, match, options, origRender, startLoading, stopLoading, updateMessage, valuesExpr, viewWatch;
          scope.disabledValuesHistory = scope.disabledValuesHistory ? scope.disabledValuesHistory : [];
          element = $(element);
          element.addClass('localytics-chosen');
          options = scope.$eval(attr.chosen) || {};
          angular.forEach(attr, function(value, key) {
            if (indexOf.call(CHOSEN_OPTION_WHITELIST, key) >= 0) {
              return attr.$observe(key, function(value) {
                var prefix;
                prefix = String(element.attr(attr.$attr[key])).slice(0, 2);
                options[snakeCase(key)] = prefix === '{{' ? value : scope.$eval(value);
                return updateMessage();
              });
            }
          });
          startLoading = function() {
            return element.addClass('loading').attr('disabled', true).trigger('chosen:updated');
          };
          stopLoading = function() {
            element.removeClass('loading');
            if (angular.isDefined(attr.disabled)) {
              element.attr('disabled', attr.disabled);
            } else {
              element.attr('disabled', false);
            }
            return element.trigger('chosen:updated');
          };
          chosen = null;
          empty = false;
          initOrUpdate = function() {
            var defaultText, dropListDom;
            if (chosen) {
              dropListDom = $(element.parent()).find("div.chosen-drop");
              if (dropListDom && dropListDom.length > 0 && parseInt(dropListDom.css("left")) >= 0) {
                return;
              }
              return element.trigger('chosen:updated');
            } else {
              scope.$evalAsync(function() {
                chosen = element.chosen(options).data('chosen');
              });
              if (angular.isObject(chosen)) {
                return defaultText = chosen.default_text;
              }
            }
          };
          updateMessage = function() {
            if (chosen && empty) {
              element.attr('data-placeholder', chosen.results_none_found).attr('disabled', true);
            } else {
              element.removeAttr('data-placeholder');
            }
            return element.trigger('chosen:updated');
          };
          if (ngModel) {
            origRender = ngModel.$render;
            ngModel.$render = function() {
              origRender();
              return initOrUpdate();
            };
            element.on('chosen:hiding_dropdown', function() {
              return scope.$apply(function() {
                return ngModel.$setTouched();
              });
            });
            if (attr.multiple) {
              viewWatch = function() {
                return ngModel.$viewValue;
              };
              scope.$watch(viewWatch, ngModel.$render, true);
            }
          } else {
            initOrUpdate();
          }
          attr.$observe('disabled', function() {
            return element.trigger('chosen:updated');
          });
          if (attr.ngOptions && ngModel) {
            match = attr.ngOptions.match(NG_OPTIONS_REGEXP);
            valuesExpr = match[7];
            scope.$watchCollection(valuesExpr, function(newVal, oldVal) {
              var timer;
              return timer = $timeout(function() {
                if (angular.isUndefined(newVal)) {
                  return startLoading();
                } else {
                  empty = isEmpty(newVal);
                  stopLoading();
                  return updateMessage();
                }
              });
            });
            return scope.$on('$destroy', function(event) {
              if (typeof timer !== "undefined" && timer !== null) {
                return $timeout.cancel(timer);
              }
            });
          }
        }
      };
    }
  ]);

}).call(this);

/*!
* jquery.inputmask.bundle.js
* https://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2016 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.3.4
*/
!function($) {
    function Inputmask(alias, options) {
        return this instanceof Inputmask ? ($.isPlainObject(alias) ? options = alias : (options = options || {},
        options.alias = alias), this.el = void 0, this.opts = $.extend(!0, {}, this.defaults, options),
        this.maskset = void 0, this.noMasksCache = options && void 0 !== options.definitions,
        this.userOptions = options || {}, this.events = {}, this.dataAttribute = "data-inputmask",
        this.isRTL = this.opts.numericInput, void resolveAlias(this.opts.alias, options, this.opts)) : new Inputmask(alias, options);
    }
    function resolveAlias(aliasStr, options, opts) {
        var aliasDefinition = opts.aliases[aliasStr];
        return aliasDefinition ? (aliasDefinition.alias && resolveAlias(aliasDefinition.alias, void 0, opts),
        $.extend(!0, opts, aliasDefinition), $.extend(!0, opts, options), !0) : (null === opts.mask && (opts.mask = aliasStr),
        !1);
    }
    function generateMaskSet(opts, nocache) {
        function generateMask(mask, metadata, opts) {
            if (null !== mask && "" !== mask) {
                if (1 === mask.length && opts.greedy === !1 && 0 !== opts.repeat && (opts.placeholder = ""),
                opts.repeat > 0 || "*" === opts.repeat || "+" === opts.repeat) {
                    var repeatStart = "*" === opts.repeat ? 0 : "+" === opts.repeat ? 1 : opts.repeat;
                    mask = opts.groupmarker.start + mask + opts.groupmarker.end + opts.quantifiermarker.start + repeatStart + "," + opts.repeat + opts.quantifiermarker.end;
                }
                var masksetDefinition;
                return void 0 === Inputmask.prototype.masksCache[mask] || nocache === !0 ? (masksetDefinition = {
                    mask: mask,
                    maskToken: Inputmask.prototype.analyseMask(mask, opts),
                    validPositions: {},
                    _buffer: void 0,
                    buffer: void 0,
                    tests: {},
                    metadata: metadata,
                    maskLength: void 0
                }, nocache !== !0 && (Inputmask.prototype.masksCache[opts.numericInput ? mask.split("").reverse().join("") : mask] = masksetDefinition,
                masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[opts.numericInput ? mask.split("").reverse().join("") : mask]))) : masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[opts.numericInput ? mask.split("").reverse().join("") : mask]),
                masksetDefinition;
            }
        }
        var ms;
        if ($.isFunction(opts.mask) && (opts.mask = opts.mask(opts)), $.isArray(opts.mask)) {
            if (opts.mask.length > 1) {
                opts.keepStatic = null === opts.keepStatic || opts.keepStatic;
                var altMask = opts.groupmarker.start;
                return $.each(opts.numericInput ? opts.mask.reverse() : opts.mask, function(ndx, msk) {
                    altMask.length > 1 && (altMask += opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start),
                    altMask += void 0 === msk.mask || $.isFunction(msk.mask) ? msk : msk.mask;
                }), altMask += opts.groupmarker.end, generateMask(altMask, opts.mask, opts);
            }
            opts.mask = opts.mask.pop();
        }
        return opts.mask && (ms = void 0 === opts.mask.mask || $.isFunction(opts.mask.mask) ? generateMask(opts.mask, opts.mask, opts) : generateMask(opts.mask.mask, opts.mask, opts)),
        ms;
    }
    function maskScope(actionObj, maskset, opts) {
        function getMaskTemplate(baseOnInput, minimalPos, includeMode) {
            minimalPos = minimalPos || 0;
            var ndxIntlzr, test, testPos, maskTemplate = [], pos = 0, lvp = getLastValidPosition();
            maxLength = void 0 !== el ? el.maxLength : void 0, maxLength === -1 && (maxLength = void 0);
            do baseOnInput === !0 && getMaskSet().validPositions[pos] ? (testPos = getMaskSet().validPositions[pos],
            test = testPos.match, ndxIntlzr = testPos.locator.slice(), maskTemplate.push(includeMode === !0 ? testPos.input : includeMode === !1 ? test.nativeDef : getPlaceholder(pos, test))) : (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1),
            test = testPos.match, ndxIntlzr = testPos.locator.slice(), (opts.jitMasking === !1 || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && maskTemplate.push(includeMode === !1 ? test.nativeDef : getPlaceholder(pos, test))),
            pos++; while ((void 0 === maxLength || pos < maxLength) && (null !== test.fn || "" !== test.def) || minimalPos > pos);
            return "" === maskTemplate[maskTemplate.length - 1] && maskTemplate.pop(), getMaskSet().maskLength = pos + 1,
            maskTemplate;
        }
        function getMaskSet() {
            return maskset;
        }
        function resetMaskSet(soft) {
            var maskset = getMaskSet();
            maskset.buffer = void 0, soft !== !0 && (maskset._buffer = void 0, maskset.validPositions = {},
            maskset.p = 0);
        }
        function getLastValidPosition(closestTo, strict, validPositions) {
            var before = -1, after = -1, valids = validPositions || getMaskSet().validPositions;
            void 0 === closestTo && (closestTo = -1);
            for (var posNdx in valids) {
                var psNdx = parseInt(posNdx);
                valids[psNdx] && (strict || null !== valids[psNdx].match.fn) && (psNdx <= closestTo && (before = psNdx),
                psNdx >= closestTo && (after = psNdx));
            }
            return before !== -1 && closestTo - before > 1 || after < closestTo ? before : after;
        }
        function stripValidPositions(start, end, nocheck, strict) {
            function IsEnclosedStatic(pos) {
                var posMatch = getMaskSet().validPositions[pos];
                if (void 0 !== posMatch && null === posMatch.match.fn) {
                    var prevMatch = getMaskSet().validPositions[pos - 1], nextMatch = getMaskSet().validPositions[pos + 1];
                    return void 0 !== prevMatch && void 0 !== nextMatch;
                }
                return !1;
            }
            var i, startPos = start, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), needsValidation = !1;
            for (getMaskSet().p = start, i = end - 1; i >= startPos; i--) void 0 !== getMaskSet().validPositions[i] && (nocheck !== !0 && (!getMaskSet().validPositions[i].match.optionality && IsEnclosedStatic(i) || opts.canClearPosition(getMaskSet(), i, getLastValidPosition(), strict, opts) === !1) || delete getMaskSet().validPositions[i]);
            for (resetMaskSet(!0), i = startPos + 1; i <= getLastValidPosition(); ) {
                for (;void 0 !== getMaskSet().validPositions[startPos]; ) startPos++;
                if (i < startPos && (i = startPos + 1), void 0 === getMaskSet().validPositions[i] && isMask(i)) i++; else {
                    var t = getTestTemplate(i);
                    needsValidation === !1 && positionsClone[startPos] && positionsClone[startPos].match.def === t.match.def ? (getMaskSet().validPositions[startPos] = $.extend(!0, {}, positionsClone[startPos]),
                    getMaskSet().validPositions[startPos].input = t.input, delete getMaskSet().validPositions[i],
                    i++) : positionCanMatchDefinition(startPos, t.match.def) ? isValid(startPos, t.input || getPlaceholder(i), !0) !== !1 && (delete getMaskSet().validPositions[i],
                    i++, needsValidation = !0) : isMask(i) || (i++, startPos--), startPos++;
                }
            }
            resetMaskSet(!0);
        }
        function determineTestTemplate(tests, guessNextBest) {
            for (var testPos, testPositions = tests, lvp = getLastValidPosition(), lvTest = getMaskSet().validPositions[lvp] || getTests(0)[0], lvTestAltArr = void 0 !== lvTest.alternation ? lvTest.locator[lvTest.alternation].toString().split(",") : [], ndx = 0; ndx < testPositions.length && (testPos = testPositions[ndx],
            !(testPos.match && (opts.greedy && testPos.match.optionalQuantifier !== !0 || (testPos.match.optionality === !1 || testPos.match.newBlockMarker === !1) && testPos.match.optionalQuantifier !== !0) && (void 0 === lvTest.alternation || lvTest.alternation !== testPos.alternation || void 0 !== testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAltArr))) || guessNextBest === !0 && (null !== testPos.match.fn || /[0-9a-bA-Z]/.test(testPos.match.def))); ndx++) ;
            return testPos;
        }
        function getTestTemplate(pos, ndxIntlzr, tstPs) {
            return getMaskSet().validPositions[pos] || determineTestTemplate(getTests(pos, ndxIntlzr ? ndxIntlzr.slice() : ndxIntlzr, tstPs));
        }
        function getTest(pos) {
            return getMaskSet().validPositions[pos] ? getMaskSet().validPositions[pos] : getTests(pos)[0];
        }
        function positionCanMatchDefinition(pos, def) {
            for (var valid = !1, tests = getTests(pos), tndx = 0; tndx < tests.length; tndx++) if (tests[tndx].match && tests[tndx].match.def === def) {
                valid = !0;
                break;
            }
            return valid;
        }
        function getTests(pos, ndxIntlzr, tstPs) {
            function resolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) {
                function handleMatch(match, loopNdx, quantifierRecurse) {
                    function isFirstMatch(latestMatch, tokenGroup) {
                        var firstMatch = 0 === $.inArray(latestMatch, tokenGroup.matches);
                        return firstMatch || $.each(tokenGroup.matches, function(ndx, match) {
                            if (match.isQuantifier === !0 && (firstMatch = isFirstMatch(latestMatch, tokenGroup.matches[ndx - 1]))) return !1;
                        }), firstMatch;
                    }
                    function resolveNdxInitializer(pos, alternateNdx, targetAlternation) {
                        var bestMatch, indexPos;
                        return (getMaskSet().tests[pos] || getMaskSet().validPositions[pos]) && $.each(getMaskSet().tests[pos] || [ getMaskSet().validPositions[pos] ], function(ndx, lmnt) {
                            var alternation = void 0 !== targetAlternation ? targetAlternation : lmnt.alternation, ndxPos = void 0 !== lmnt.locator[alternation] ? lmnt.locator[alternation].toString().indexOf(alternateNdx) : -1;
                            (void 0 === indexPos || ndxPos < indexPos) && ndxPos !== -1 && (bestMatch = lmnt,
                            indexPos = ndxPos);
                        }), bestMatch ? bestMatch.locator.slice((void 0 !== targetAlternation ? targetAlternation : bestMatch.alternation) + 1) : void 0 !== targetAlternation ? resolveNdxInitializer(pos, alternateNdx) : void 0;
                    }
                    function staticCanMatchDefinition(source, target) {
                        return null === source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def, getMaskSet(), pos, !1, opts, !1);
                    }
                    if (testPos > 1e4) throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet().mask;
                    if (testPos === pos && void 0 === match.matches) return matches.push({
                        match: match,
                        locator: loopNdx.reverse(),
                        cd: cacheDependency
                    }), !0;
                    if (void 0 !== match.matches) {
                        if (match.isGroup && quantifierRecurse !== match) {
                            if (match = handleMatch(maskToken.matches[$.inArray(match, maskToken.matches) + 1], loopNdx)) return !0;
                        } else if (match.isOptional) {
                            var optionalToken = match;
                            if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) {
                                if (latestMatch = matches[matches.length - 1].match, !isFirstMatch(latestMatch, optionalToken)) return !0;
                                insertStop = !0, testPos = pos;
                            }
                        } else if (match.isAlternator) {
                            var maltMatches, alternateToken = match, malternateMatches = [], currentMatches = matches.slice(), loopNdxCnt = loopNdx.length, altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
                            if (altIndex === -1 || "string" == typeof altIndex) {
                                var amndx, currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr = [];
                                if ("string" == typeof altIndex) altIndexArr = altIndex.split(","); else for (amndx = 0; amndx < alternateToken.matches.length; amndx++) altIndexArr.push(amndx);
                                for (var ndx = 0; ndx < altIndexArr.length; ndx++) {
                                    if (amndx = parseInt(altIndexArr[ndx]), matches = [], ndxInitializer = resolveNdxInitializer(testPos, amndx, loopNdxCnt) || ndxInitializerClone.slice(),
                                    match = handleMatch(alternateToken.matches[amndx] || maskToken.matches[amndx], [ amndx ].concat(loopNdx), quantifierRecurse) || match,
                                    match !== !0 && void 0 !== match && altIndexArr[altIndexArr.length - 1] < alternateToken.matches.length) {
                                        var ntndx = $.inArray(match, maskToken.matches) + 1;
                                        maskToken.matches.length > ntndx && (match = handleMatch(maskToken.matches[ntndx], [ ntndx ].concat(loopNdx.slice(1, loopNdx.length)), quantifierRecurse),
                                        match && (altIndexArr.push(ntndx.toString()), $.each(matches, function(ndx, lmnt) {
                                            lmnt.alternation = loopNdx.length - 1;
                                        })));
                                    }
                                    maltMatches = matches.slice(), testPos = currentPos, matches = [];
                                    for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
                                        var altMatch = maltMatches[ndx1], hasMatch = !1;
                                        altMatch.alternation = altMatch.alternation || loopNdxCnt;
                                        for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
                                            var altMatch2 = malternateMatches[ndx2];
                                            if (("string" != typeof altIndex || $.inArray(altMatch.locator[altMatch.alternation].toString(), altIndexArr) !== -1) && (altMatch.match.def === altMatch2.match.def || staticCanMatchDefinition(altMatch, altMatch2))) {
                                                hasMatch = altMatch.match.nativeDef === altMatch2.match.nativeDef, altMatch.alternation == altMatch2.alternation && altMatch2.locator[altMatch2.alternation].toString().indexOf(altMatch.locator[altMatch.alternation]) === -1 && (altMatch2.locator[altMatch2.alternation] = altMatch2.locator[altMatch2.alternation] + "," + altMatch.locator[altMatch.alternation],
                                                altMatch2.alternation = altMatch.alternation, null == altMatch.match.fn && (altMatch2.na = altMatch2.na || altMatch.locator[altMatch.alternation].toString(),
                                                altMatch2.na.indexOf(altMatch.locator[altMatch.alternation]) === -1 && (altMatch2.na = altMatch2.na + "," + altMatch.locator[altMatch.alternation])));
                                                break;
                                            }
                                        }
                                        hasMatch || malternateMatches.push(altMatch);
                                    }
                                }
                                "string" == typeof altIndex && (malternateMatches = $.map(malternateMatches, function(lmnt, ndx) {
                                    if (isFinite(ndx)) {
                                        var mamatch, alternation = lmnt.alternation, altLocArr = lmnt.locator[alternation].toString().split(",");
                                        lmnt.locator[alternation] = void 0, lmnt.alternation = void 0;
                                        for (var alndx = 0; alndx < altLocArr.length; alndx++) mamatch = $.inArray(altLocArr[alndx], altIndexArr) !== -1,
                                        mamatch && (void 0 !== lmnt.locator[alternation] ? (lmnt.locator[alternation] += ",",
                                        lmnt.locator[alternation] += altLocArr[alndx]) : lmnt.locator[alternation] = parseInt(altLocArr[alndx]),
                                        lmnt.alternation = alternation);
                                        if (void 0 !== lmnt.locator[alternation]) return lmnt;
                                    }
                                })), matches = currentMatches.concat(malternateMatches), testPos = pos, insertStop = matches.length > 0,
                                ndxInitializer = ndxInitializerClone.slice();
                            } else match = handleMatch(alternateToken.matches[altIndex] || maskToken.matches[altIndex], [ altIndex ].concat(loopNdx), quantifierRecurse);
                            if (match) return !0;
                        } else if (match.isQuantifier && quantifierRecurse !== maskToken.matches[$.inArray(match, maskToken.matches) - 1]) for (var qt = match, qndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max) && testPos <= pos; qndx++) {
                            var tokenGroup = maskToken.matches[$.inArray(qt, maskToken.matches) - 1];
                            if (match = handleMatch(tokenGroup, [ qndx ].concat(loopNdx), tokenGroup)) {
                                if (latestMatch = matches[matches.length - 1].match, latestMatch.optionalQuantifier = qndx > qt.quantifier.min - 1,
                                isFirstMatch(latestMatch, tokenGroup)) {
                                    if (qndx > qt.quantifier.min - 1) {
                                        insertStop = !0, testPos = pos;
                                        break;
                                    }
                                    return !0;
                                }
                                return !0;
                            }
                        } else if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) return !0;
                    } else testPos++;
                }
                for (var tndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; tndx < maskToken.matches.length; tndx++) if (maskToken.matches[tndx].isQuantifier !== !0) {
                    var match = handleMatch(maskToken.matches[tndx], [ tndx ].concat(loopNdx), quantifierRecurse);
                    if (match && testPos === pos) return match;
                    if (testPos > pos) break;
                }
            }
            function mergeLocators(tests) {
                var locator = [];
                return $.isArray(tests) || (tests = [ tests ]), tests.length > 0 && (void 0 === tests[0].alternation ? (locator = determineTestTemplate(tests.slice()).locator.slice(),
                0 === locator.length && (locator = tests[0].locator.slice())) : $.each(tests, function(ndx, tst) {
                    if ("" !== tst.def) if (0 === locator.length) locator = tst.locator.slice(); else for (var i = 0; i < locator.length; i++) tst.locator[i] && locator[i].toString().indexOf(tst.locator[i]) === -1 && (locator[i] += "," + tst.locator[i]);
                })), locator;
            }
            function filterTests(tests) {
                return opts.keepStatic && pos > 0 && tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0) && tests[0].match.optionality !== !0 && tests[0].match.optionalQuantifier !== !0 && null === tests[0].match.fn && !/[0-9a-bA-Z]/.test(tests[0].match.def) ? [ determineTestTemplate(tests) ] : tests;
            }
            var latestMatch, maskTokens = getMaskSet().maskToken, testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr ? ndxIntlzr.slice() : [ 0 ], matches = [], insertStop = !1, cacheDependency = ndxIntlzr ? ndxIntlzr.join("") : "";
            if (pos > -1) {
                if (void 0 === ndxIntlzr) {
                    for (var test, previousPos = pos - 1; void 0 === (test = getMaskSet().validPositions[previousPos] || getMaskSet().tests[previousPos]) && previousPos > -1; ) previousPos--;
                    void 0 !== test && previousPos > -1 && (ndxInitializer = mergeLocators(test), cacheDependency = ndxInitializer.join(""),
                    testPos = previousPos);
                }
                if (getMaskSet().tests[pos] && getMaskSet().tests[pos][0].cd === cacheDependency) return filterTests(getMaskSet().tests[pos]);
                for (var mtndx = ndxInitializer.shift(); mtndx < maskTokens.length; mtndx++) {
                    var match = resolveTestFromToken(maskTokens[mtndx], ndxInitializer, [ mtndx ]);
                    if (match && testPos === pos || testPos > pos) break;
                }
            }
            return (0 === matches.length || insertStop) && matches.push({
                match: {
                    fn: null,
                    cardinality: 0,
                    optionality: !0,
                    casing: null,
                    def: "",
                    placeholder: ""
                },
                locator: [],
                cd: cacheDependency
            }), void 0 !== ndxIntlzr && getMaskSet().tests[pos] ? filterTests($.extend(!0, [], matches)) : (getMaskSet().tests[pos] = $.extend(!0, [], matches),
            filterTests(getMaskSet().tests[pos]));
        }
        function getBufferTemplate() {
            return void 0 === getMaskSet()._buffer && (getMaskSet()._buffer = getMaskTemplate(!1, 1),
            void 0 === getMaskSet().buffer && getMaskSet()._buffer.slice()), getMaskSet()._buffer;
        }
        function getBuffer(noCache) {
            return void 0 !== getMaskSet().buffer && noCache !== !0 || (getMaskSet().buffer = getMaskTemplate(!0, getLastValidPosition(), !0)),
            getMaskSet().buffer;
        }
        function refreshFromBuffer(start, end, buffer) {
            var i;
            if (start === !0) resetMaskSet(), start = 0, end = buffer.length; else for (i = start; i < end; i++) delete getMaskSet().validPositions[i];
            for (i = start; i < end; i++) resetMaskSet(!0), buffer[i] !== opts.skipOptionalPartCharacter && isValid(i, buffer[i], !0, !0);
        }
        function casing(elem, test, pos) {
            switch (opts.casing || test.casing) {
              case "upper":
                elem = elem.toUpperCase();
                break;

              case "lower":
                elem = elem.toLowerCase();
                break;

              case "title":
                var posBefore = getMaskSet().validPositions[pos - 1];
                elem = 0 === pos || posBefore && posBefore.input === String.fromCharCode(Inputmask.keyCode.SPACE) ? elem.toUpperCase() : elem.toLowerCase();
            }
            return elem;
        }
        function checkAlternationMatch(altArr1, altArr2) {
            for (var altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1), isMatch = !1, alndx = 0; alndx < altArr1.length; alndx++) if ($.inArray(altArr1[alndx], altArrC) !== -1) {
                isMatch = !0;
                break;
            }
            return isMatch;
        }
        function isValid(pos, c, strict, fromSetValid, fromAlternate) {
            function isSelection(posObj) {
                var selection = isRTL ? posObj.begin - posObj.end > 1 || posObj.begin - posObj.end === 1 && opts.insertMode : posObj.end - posObj.begin > 1 || posObj.end - posObj.begin === 1 && opts.insertMode;
                return selection && 0 === posObj.begin && posObj.end === getMaskSet().maskLength ? "full" : selection;
            }
            function _isValid(position, c, strict) {
                var rslt = !1;
                return $.each(getTests(position), function(ndx, tst) {
                    for (var test = tst.match, loopend = c ? 1 : 0, chrs = "", i = test.cardinality; i > loopend; i--) chrs += getBufferElement(position - (i - 1));
                    if (c && (chrs += c), getBuffer(!0), rslt = null != test.fn ? test.fn.test(chrs, getMaskSet(), position, strict, opts, isSelection(pos)) : (c === test.def || c === opts.skipOptionalPartCharacter) && "" !== test.def && {
                        c: test.placeholder || test.def,
                        pos: position
                    }, rslt !== !1) {
                        var elem = void 0 !== rslt.c ? rslt.c : c;
                        elem = elem === opts.skipOptionalPartCharacter && null === test.fn ? test.placeholder || test.def : elem;
                        var validatedPos = position, possibleModifiedBuffer = getBuffer();
                        if (void 0 !== rslt.remove && ($.isArray(rslt.remove) || (rslt.remove = [ rslt.remove ]),
                        $.each(rslt.remove.sort(function(a, b) {
                            return b - a;
                        }), function(ndx, lmnt) {
                            stripValidPositions(lmnt, lmnt + 1, !0);
                        })), void 0 !== rslt.insert && ($.isArray(rslt.insert) || (rslt.insert = [ rslt.insert ]),
                        $.each(rslt.insert.sort(function(a, b) {
                            return a - b;
                        }), function(ndx, lmnt) {
                            isValid(lmnt.pos, lmnt.c, !0, fromSetValid);
                        })), rslt.refreshFromBuffer) {
                            var refresh = rslt.refreshFromBuffer;
                            if (strict = !0, refreshFromBuffer(refresh === !0 ? refresh : refresh.start, refresh.end, possibleModifiedBuffer),
                            void 0 === rslt.pos && void 0 === rslt.c) return rslt.pos = getLastValidPosition(),
                            !1;
                            if (validatedPos = void 0 !== rslt.pos ? rslt.pos : position, validatedPos !== position) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0, fromSetValid)),
                            !1;
                        } else if (rslt !== !0 && void 0 !== rslt.pos && rslt.pos !== position && (validatedPos = rslt.pos,
                        refreshFromBuffer(position, validatedPos, getBuffer().slice()), validatedPos !== position)) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0)),
                        !1;
                        return (rslt === !0 || void 0 !== rslt.pos || void 0 !== rslt.c) && (ndx > 0 && resetMaskSet(!0),
                        setValidPosition(validatedPos, $.extend({}, tst, {
                            input: casing(elem, test, validatedPos)
                        }), fromSetValid, isSelection(pos)) || (rslt = !1), !1);
                    }
                }), rslt;
            }
            function alternate(pos, c, strict) {
                var lastAlt, alternation, altPos, prevAltPos, i, validPos, altNdxs, decisionPos, validPsClone = $.extend(!0, {}, getMaskSet().validPositions), isValidRslt = !1, lAltPos = getLastValidPosition();
                for (prevAltPos = getMaskSet().validPositions[lAltPos]; lAltPos >= 0; lAltPos--) if (altPos = getMaskSet().validPositions[lAltPos],
                altPos && void 0 !== altPos.alternation) {
                    if (lastAlt = lAltPos, alternation = getMaskSet().validPositions[lastAlt].alternation,
                    prevAltPos.locator[altPos.alternation] !== altPos.locator[altPos.alternation]) break;
                    prevAltPos = altPos;
                }
                if (void 0 !== alternation) {
                    decisionPos = parseInt(lastAlt);
                    var decisionTaker = void 0 !== prevAltPos.locator[prevAltPos.alternation || alternation] ? prevAltPos.locator[prevAltPos.alternation || alternation] : altNdxs[0];
                    decisionTaker.length > 0 && (decisionTaker = decisionTaker.split(",")[0]);
                    var possibilityPos = getMaskSet().validPositions[decisionPos], prevPos = getMaskSet().validPositions[decisionPos - 1];
                    $.each(getTests(decisionPos, prevPos ? prevPos.locator : void 0, decisionPos - 1), function(ndx, test) {
                        altNdxs = test.locator[alternation] ? test.locator[alternation].toString().split(",") : [];
                        for (var mndx = 0; mndx < altNdxs.length; mndx++) {
                            var validInputs = [], staticInputsBeforePos = 0, staticInputsBeforePosAlternate = 0, verifyValidInput = !1;
                            if (decisionTaker < altNdxs[mndx] && (void 0 === test.na || $.inArray(altNdxs[mndx], test.na.split(",")) === -1)) {
                                getMaskSet().validPositions[decisionPos] = $.extend(!0, {}, test);
                                var possibilities = getMaskSet().validPositions[decisionPos].locator;
                                for (getMaskSet().validPositions[decisionPos].locator[alternation] = parseInt(altNdxs[mndx]),
                                null == test.match.fn ? (possibilityPos.input !== test.match.def && (verifyValidInput = !0,
                                possibilityPos.generatedInput !== !0 && validInputs.push(possibilityPos.input)),
                                staticInputsBeforePosAlternate++, getMaskSet().validPositions[decisionPos].generatedInput = !/[0-9a-bA-Z]/.test(test.match.def),
                                getMaskSet().validPositions[decisionPos].input = test.match.def) : getMaskSet().validPositions[decisionPos].input = possibilityPos.input,
                                i = decisionPos + 1; i < getLastValidPosition(void 0, !0) + 1; i++) validPos = getMaskSet().validPositions[i],
                                validPos && validPos.generatedInput !== !0 && /[0-9a-bA-Z]/.test(validPos.input) ? validInputs.push(validPos.input) : i < pos && staticInputsBeforePos++,
                                delete getMaskSet().validPositions[i];
                                for (verifyValidInput && validInputs[0] === test.match.def && validInputs.shift(),
                                resetMaskSet(!0), isValidRslt = !0; validInputs.length > 0; ) {
                                    var input = validInputs.shift();
                                    if (input !== opts.skipOptionalPartCharacter && !(isValidRslt = isValid(getLastValidPosition(void 0, !0) + 1, input, !1, fromSetValid, !0))) break;
                                }
                                if (isValidRslt) {
                                    getMaskSet().validPositions[decisionPos].locator = possibilities;
                                    var targetLvp = getLastValidPosition(pos) + 1;
                                    for (i = decisionPos + 1; i < getLastValidPosition() + 1; i++) validPos = getMaskSet().validPositions[i],
                                    (void 0 === validPos || null == validPos.match.fn) && i < pos + (staticInputsBeforePosAlternate - staticInputsBeforePos) && staticInputsBeforePosAlternate++;
                                    pos += staticInputsBeforePosAlternate - staticInputsBeforePos, isValidRslt = isValid(pos > targetLvp ? targetLvp : pos, c, strict, fromSetValid, !0);
                                }
                                if (isValidRslt) return !1;
                                resetMaskSet(), getMaskSet().validPositions = $.extend(!0, {}, validPsClone);
                            }
                        }
                    });
                }
                return isValidRslt;
            }
            function trackbackAlternations(originalPos, newPos) {
                var vp = getMaskSet().validPositions[newPos];
                if (vp) for (var targetLocator = vp.locator, tll = targetLocator.length, ps = originalPos; ps < newPos; ps++) if (void 0 === getMaskSet().validPositions[ps] && !isMask(ps, !0)) {
                    var tests = getTests(ps), bestMatch = tests[0], equality = -1;
                    $.each(tests, function(ndx, tst) {
                        for (var i = 0; i < tll && (void 0 !== tst.locator[i] && checkAlternationMatch(tst.locator[i].toString().split(","), targetLocator[i].toString().split(","))); i++) equality < i && (equality = i,
                        bestMatch = tst);
                    }), setValidPosition(ps, $.extend({}, bestMatch, {
                        input: bestMatch.match.placeholder || bestMatch.match.def
                    }), !0);
                }
            }
            function setValidPosition(pos, validTest, fromSetValid, isSelection) {
                if (isSelection || opts.insertMode && void 0 !== getMaskSet().validPositions[pos] && void 0 === fromSetValid) {
                    var i, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), lvp = getLastValidPosition(void 0, !0);
                    for (i = pos; i <= lvp; i++) delete getMaskSet().validPositions[i];
                    getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                    var j, valid = !0, vps = getMaskSet().validPositions, needsValidation = !1, initialLength = getMaskSet().maskLength;
                    for (i = j = pos; i <= lvp; i++) {
                        var t = positionsClone[i];
                        if (void 0 !== t) for (var posMatch = j; posMatch < getMaskSet().maskLength && (null === t.match.fn && vps[i] && (vps[i].match.optionalQuantifier === !0 || vps[i].match.optionality === !0) || null != t.match.fn); ) {
                            if (posMatch++, needsValidation === !1 && positionsClone[posMatch] && positionsClone[posMatch].match.def === t.match.def) getMaskSet().validPositions[posMatch] = $.extend(!0, {}, positionsClone[posMatch]),
                            getMaskSet().validPositions[posMatch].input = t.input, fillMissingNonMask(posMatch),
                            j = posMatch, valid = !0; else if (positionCanMatchDefinition(posMatch, t.match.def)) {
                                var result = isValid(posMatch, t.input, !0, !0);
                                valid = result !== !1, j = result.caret || result.insert ? getLastValidPosition() : posMatch,
                                needsValidation = !0;
                            } else valid = t.generatedInput === !0;
                            if (getMaskSet().maskLength < initialLength && (getMaskSet().maskLength = initialLength),
                            valid) break;
                        }
                        if (!valid) break;
                    }
                    if (!valid) return getMaskSet().validPositions = $.extend(!0, {}, positionsClone),
                    resetMaskSet(!0), !1;
                } else getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                return resetMaskSet(!0), !0;
            }
            function fillMissingNonMask(maskPos) {
                for (var pndx = maskPos - 1; pndx > -1 && !getMaskSet().validPositions[pndx]; pndx--) ;
                var testTemplate, testsFromPos;
                for (pndx++; pndx < maskPos; pndx++) void 0 === getMaskSet().validPositions[pndx] && (opts.jitMasking === !1 || opts.jitMasking > pndx) && (testsFromPos = getTests(pndx, getTestTemplate(pndx - 1).locator, pndx - 1).slice(),
                "" === testsFromPos[testsFromPos.length - 1].match.def && testsFromPos.pop(), testTemplate = determineTestTemplate(testsFromPos),
                testTemplate && (testTemplate.match.def === opts.radixPointDefinitionSymbol || !isMask(pndx, !0) || $.inArray(opts.radixPoint, getBuffer()) < pndx && testTemplate.match.fn && testTemplate.match.fn.test(getPlaceholder(pndx), getMaskSet(), pndx, !1, opts)) && (result = _isValid(pndx, testTemplate.match.placeholder || (null == testTemplate.match.fn ? testTemplate.match.def : "" !== getPlaceholder(pndx) ? getPlaceholder(pndx) : getBuffer()[pndx]), !0),
                result !== !1 && (getMaskSet().validPositions[result.pos || pndx].generatedInput = !0)));
            }
            strict = strict === !0;
            var maskPos = pos;
            void 0 !== pos.begin && (maskPos = isRTL && !isSelection(pos) ? pos.end : pos.begin);
            var result = !1, positionsClone = $.extend(!0, {}, getMaskSet().validPositions);
            if (fillMissingNonMask(maskPos), isSelection(pos) && (handleRemove(void 0, Inputmask.keyCode.DELETE, pos),
            maskPos = getMaskSet().p), maskPos < getMaskSet().maskLength && (result = _isValid(maskPos, c, strict),
            (!strict || fromSetValid === !0) && result === !1)) {
                var currentPosValid = getMaskSet().validPositions[maskPos];
                if (!currentPosValid || null !== currentPosValid.match.fn || currentPosValid.match.def !== c && c !== opts.skipOptionalPartCharacter) {
                    if ((opts.insertMode || void 0 === getMaskSet().validPositions[seekNext(maskPos)]) && !isMask(maskPos, !0)) {
                        var testsFromPos = getTests(maskPos).slice();
                        "" === testsFromPos[testsFromPos.length - 1].match.def && testsFromPos.pop();
                        var staticChar = determineTestTemplate(testsFromPos, !0);
                        staticChar && null === staticChar.match.fn && (staticChar = staticChar.match.placeholder || staticChar.match.def,
                        _isValid(maskPos, staticChar, strict), getMaskSet().validPositions[maskPos].generatedInput = !0);
                        for (var nPos = maskPos + 1, snPos = seekNext(maskPos); nPos <= snPos; nPos++) if (result = _isValid(nPos, c, strict),
                        result !== !1) {
                            trackbackAlternations(maskPos, void 0 !== result.pos ? result.pos : nPos), maskPos = nPos;
                            break;
                        }
                    }
                } else result = {
                    caret: seekNext(maskPos)
                };
            }
            return result === !1 && opts.keepStatic && !strict && fromAlternate !== !0 && (result = alternate(maskPos, c, strict)),
            result === !0 && (result = {
                pos: maskPos
            }), $.isFunction(opts.postValidation) && result !== !1 && !strict && fromSetValid !== !0 && (result = !!opts.postValidation(getBuffer(!0), result, opts) && result),
            void 0 === result.pos && (result.pos = maskPos), result === !1 && (resetMaskSet(!0),
            getMaskSet().validPositions = $.extend(!0, {}, positionsClone)), result;
        }
        function isMask(pos, strict) {
            var test;
            if (strict ? (test = getTestTemplate(pos).match, "" === test.def && (test = getTest(pos).match)) : test = getTest(pos).match,
            null != test.fn) return test.fn;
            if (strict !== !0 && pos > -1) {
                var tests = getTests(pos);
                return tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0);
            }
            return !1;
        }
        function seekNext(pos, newBlock) {
            var maskL = getMaskSet().maskLength;
            if (pos >= maskL) return maskL;
            for (var position = pos; ++position < maskL && (newBlock === !0 && (getTest(position).match.newBlockMarker !== !0 || !isMask(position)) || newBlock !== !0 && !isMask(position)); ) ;
            return position;
        }
        function seekPrevious(pos, newBlock) {
            var tests, position = pos;
            if (position <= 0) return 0;
            for (;--position > 0 && (newBlock === !0 && getTest(position).match.newBlockMarker !== !0 || newBlock !== !0 && !isMask(position) && (tests = getTests(position),
            tests.length < 2 || 2 === tests.length && "" === tests[1].match.def)); ) ;
            return position;
        }
        function getBufferElement(position) {
            return void 0 === getMaskSet().validPositions[position] ? getPlaceholder(position) : getMaskSet().validPositions[position].input;
        }
        function writeBuffer(input, buffer, caretPos, event, triggerInputEvent) {
            if (event && $.isFunction(opts.onBeforeWrite)) {
                var result = opts.onBeforeWrite(event, buffer, caretPos, opts);
                if (result) {
                    if (result.refreshFromBuffer) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(refresh === !0 ? refresh : refresh.start, refresh.end, result.buffer || buffer),
                        buffer = getBuffer(!0);
                    }
                    void 0 !== caretPos && (caretPos = void 0 !== result.caret ? result.caret : caretPos);
                }
            }
            input.inputmask._valueSet(buffer.join("")), void 0 === caretPos || void 0 !== event && "blur" === event.type ? renderColorMask(input, buffer, caretPos) : caret(input, caretPos),
            triggerInputEvent === !0 && (skipInputEvent = !0, $(input).trigger("input"));
        }
        function getPlaceholder(pos, test) {
            if (test = test || getTest(pos).match, void 0 !== test.placeholder) return test.placeholder;
            if (null === test.fn) {
                if (pos > -1 && void 0 === getMaskSet().validPositions[pos]) {
                    var prevTest, tests = getTests(pos), staticAlternations = [];
                    if (tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0)) for (var i = 0; i < tests.length; i++) if (tests[i].match.optionality !== !0 && tests[i].match.optionalQuantifier !== !0 && (null === tests[i].match.fn || void 0 === prevTest || tests[i].match.fn.test(prevTest.match.def, getMaskSet(), pos, !0, opts) !== !1) && (staticAlternations.push(tests[i]),
                    null === tests[i].match.fn && (prevTest = tests[i]), staticAlternations.length > 1 && /[0-9a-bA-Z]/.test(staticAlternations[0].match.def))) return opts.placeholder.charAt(pos % opts.placeholder.length);
                }
                return test.def;
            }
            return opts.placeholder.charAt(pos % opts.placeholder.length);
        }
        function checkVal(input, writeOut, strict, nptvl, initiatingEvent, stickyCaret) {
            function isTemplateMatch() {
                var isMatch = !1, charCodeNdx = getBufferTemplate().slice(initialNdx, seekNext(initialNdx)).join("").indexOf(charCodes);
                if (charCodeNdx !== -1 && !isMask(initialNdx)) {
                    isMatch = !0;
                    for (var bufferTemplateArr = getBufferTemplate().slice(initialNdx, initialNdx + charCodeNdx), i = 0; i < bufferTemplateArr.length; i++) if (" " !== bufferTemplateArr[i]) {
                        isMatch = !1;
                        break;
                    }
                }
                return isMatch;
            }
            var inputValue = nptvl.slice(), charCodes = "", initialNdx = 0, result = void 0;
            if (resetMaskSet(), getMaskSet().p = seekNext(-1), !strict) if (opts.autoUnmask !== !0) {
                var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(""), matches = inputValue.join("").match(new RegExp("^" + Inputmask.escapeRegex(staticInput), "g"));
                matches && matches.length > 0 && (inputValue.splice(0, matches.length * staticInput.length),
                initialNdx = seekNext(initialNdx));
            } else initialNdx = seekNext(initialNdx);
            if ($.each(inputValue, function(ndx, charCode) {
                if (void 0 !== charCode) {
                    var keypress = new $.Event("keypress");
                    keypress.which = charCode.charCodeAt(0), charCodes += charCode;
                    var lvp = getLastValidPosition(void 0, !0), lvTest = getMaskSet().validPositions[lvp], nextTest = getTestTemplate(lvp + 1, lvTest ? lvTest.locator.slice() : void 0, lvp);
                    if (!isTemplateMatch() || strict || opts.autoUnmask) {
                        var pos = strict ? ndx : null == nextTest.match.fn && nextTest.match.optionality && lvp + 1 < getMaskSet().p ? lvp + 1 : getMaskSet().p;
                        result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, strict, pos),
                        initialNdx = pos + 1, charCodes = "";
                    } else result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, !0, lvp + 1);
                    if (!strict && $.isFunction(opts.onBeforeWrite) && (result = opts.onBeforeWrite(keypress, getBuffer(), result.forwardPosition, opts),
                    result && result.refreshFromBuffer)) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(refresh === !0 ? refresh : refresh.start, refresh.end, result.buffer),
                        resetMaskSet(!0), result.caret && (getMaskSet().p = result.caret);
                    }
                }
            }), writeOut) {
                var caretPos = void 0, lvp = getLastValidPosition();
                document.activeElement === input && (initiatingEvent || result) && (caretPos = caret(input).begin,
                initiatingEvent && result === !1 && (caretPos = seekNext(getLastValidPosition(caretPos))),
                result && stickyCaret !== !0 && (caretPos < lvp + 1 || lvp === -1) && (caretPos = opts.numericInput && void 0 === result.caret ? seekPrevious(result.forwardPosition) : result.forwardPosition)),
                writeBuffer(input, getBuffer(), caretPos, initiatingEvent || new $.Event("checkval"));
            }
        }
        function unmaskedvalue(input) {
            if (input && void 0 === input.inputmask) return input.value;
            var umValue = [], vps = getMaskSet().validPositions;
            for (var pndx in vps) vps[pndx].match && null != vps[pndx].match.fn && umValue.push(vps[pndx].input);
            var unmaskedValue = 0 === umValue.length ? "" : (isRTL ? umValue.reverse() : umValue).join("");
            if ($.isFunction(opts.onUnMask)) {
                var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join("");
                unmaskedValue = opts.onUnMask(bufferValue, unmaskedValue, opts) || unmaskedValue;
            }
            return unmaskedValue;
        }
        function caret(input, begin, end, notranslate) {
            function translatePosition(pos) {
                if (notranslate !== !0 && isRTL && "number" == typeof pos && (!opts.greedy || "" !== opts.placeholder)) {
                    var bffrLght = getBuffer().join("").length;
                    pos = bffrLght - pos;
                }
                return pos;
            }
            var range;
            if ("number" != typeof begin) return input.setSelectionRange ? (begin = input.selectionStart,
            end = input.selectionEnd) : window.getSelection ? (range = window.getSelection().getRangeAt(0),
            range.commonAncestorContainer.parentNode !== input && range.commonAncestorContainer !== input || (begin = range.startOffset,
            end = range.endOffset)) : document.selection && document.selection.createRange && (range = document.selection.createRange(),
            begin = 0 - range.duplicate().moveStart("character", -input.inputmask._valueGet().length),
            end = begin + range.text.length), {
                begin: translatePosition(begin),
                end: translatePosition(end)
            };
            begin = translatePosition(begin), end = translatePosition(end), end = "number" == typeof end ? end : begin;
            var scrollCalc = parseInt(((input.ownerDocument.defaultView || window).getComputedStyle ? (input.ownerDocument.defaultView || window).getComputedStyle(input, null) : input.currentStyle).fontSize) * end;
            if (input.scrollLeft = scrollCalc > input.scrollWidth ? scrollCalc : 0, mobile || opts.insertMode !== !1 || begin !== end || end++,
            input.setSelectionRange) input.selectionStart = begin, input.selectionEnd = end; else if (window.getSelection) {
                if (range = document.createRange(), void 0 === input.firstChild || null === input.firstChild) {
                    var textNode = document.createTextNode("");
                    input.appendChild(textNode);
                }
                range.setStart(input.firstChild, begin < input.inputmask._valueGet().length ? begin : input.inputmask._valueGet().length),
                range.setEnd(input.firstChild, end < input.inputmask._valueGet().length ? end : input.inputmask._valueGet().length),
                range.collapse(!0);
                var sel = window.getSelection();
                sel.removeAllRanges(), sel.addRange(range);
            } else input.createTextRange && (range = input.createTextRange(), range.collapse(!0),
            range.moveEnd("character", end), range.moveStart("character", begin), range.select());
            renderColorMask(input, void 0, {
                begin: begin,
                end: end
            });
        }
        function determineLastRequiredPosition(returnDefinition) {
            var pos, testPos, buffer = getBuffer(), bl = buffer.length, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet().validPositions[lvp], ndxIntlzr = void 0 !== lvTest ? lvTest.locator.slice() : void 0;
            for (pos = lvp + 1; pos < buffer.length; pos++) testPos = getTestTemplate(pos, ndxIntlzr, pos - 1),
            ndxIntlzr = testPos.locator.slice(), positions[pos] = $.extend(!0, {}, testPos);
            var lvTestAlt = lvTest && void 0 !== lvTest.alternation ? lvTest.locator[lvTest.alternation] : void 0;
            for (pos = bl - 1; pos > lvp && (testPos = positions[pos], (testPos.match.optionality || testPos.match.optionalQuantifier || lvTestAlt && (lvTestAlt !== positions[pos].locator[lvTest.alternation] && null != testPos.match.fn || null === testPos.match.fn && testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAlt.toString().split(",")) && "" !== getTests(pos)[0].def)) && buffer[pos] === getPlaceholder(pos, testPos.match)); pos--) bl--;
            return returnDefinition ? {
                l: bl,
                def: positions[bl] ? positions[bl].match : void 0
            } : bl;
        }
        function clearOptionalTail(buffer) {
            for (var rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
            return buffer.splice(rl, lmib + 1 - rl), buffer;
        }
        function isComplete(buffer) {
            if ($.isFunction(opts.isComplete)) return opts.isComplete(buffer, opts);
            if ("*" !== opts.repeat) {
                var complete = !1, lrp = determineLastRequiredPosition(!0), aml = seekPrevious(lrp.l);
                if (void 0 === lrp.def || lrp.def.newBlockMarker || lrp.def.optionality || lrp.def.optionalQuantifier) {
                    complete = !0;
                    for (var i = 0; i <= aml; i++) {
                        var test = getTestTemplate(i).match;
                        if (null !== test.fn && void 0 === getMaskSet().validPositions[i] && test.optionality !== !0 && test.optionalQuantifier !== !0 || null === test.fn && buffer[i] !== getPlaceholder(i, test)) {
                            complete = !1;
                            break;
                        }
                    }
                }
                return complete;
            }
        }
        function handleRemove(input, k, pos, strict) {
            function generalize() {
                if (opts.keepStatic) {
                    for (var validInputs = [], lastAlt = getLastValidPosition(-1, !0), positionsClone = $.extend(!0, {}, getMaskSet().validPositions), prevAltPos = getMaskSet().validPositions[lastAlt]; lastAlt >= 0; lastAlt--) {
                        var altPos = getMaskSet().validPositions[lastAlt];
                        if (altPos) {
                            if (altPos.generatedInput !== !0 && /[0-9a-bA-Z]/.test(altPos.input) && validInputs.push(altPos.input),
                            delete getMaskSet().validPositions[lastAlt], void 0 !== altPos.alternation && altPos.locator[altPos.alternation] !== prevAltPos.locator[altPos.alternation]) break;
                            prevAltPos = altPos;
                        }
                    }
                    if (lastAlt > -1) for (getMaskSet().p = seekNext(getLastValidPosition(-1, !0)); validInputs.length > 0; ) {
                        var keypress = new $.Event("keypress");
                        keypress.which = validInputs.pop().charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !1, !1, getMaskSet().p);
                    } else getMaskSet().validPositions = $.extend(!0, {}, positionsClone);
                }
            }
            if ((opts.numericInput || isRTL) && (k === Inputmask.keyCode.BACKSPACE ? k = Inputmask.keyCode.DELETE : k === Inputmask.keyCode.DELETE && (k = Inputmask.keyCode.BACKSPACE),
            isRTL)) {
                var pend = pos.end;
                pos.end = pos.begin, pos.begin = pend;
            }
            k === Inputmask.keyCode.BACKSPACE && (pos.end - pos.begin < 1 || opts.insertMode === !1) ? (pos.begin = seekPrevious(pos.begin),
            void 0 === getMaskSet().validPositions[pos.begin] || getMaskSet().validPositions[pos.begin].input !== opts.groupSeparator && getMaskSet().validPositions[pos.begin].input !== opts.radixPoint || pos.begin--) : k === Inputmask.keyCode.DELETE && pos.begin === pos.end && (pos.end = isMask(pos.end, !0) ? pos.end + 1 : seekNext(pos.end) + 1,
            void 0 === getMaskSet().validPositions[pos.begin] || getMaskSet().validPositions[pos.begin].input !== opts.groupSeparator && getMaskSet().validPositions[pos.begin].input !== opts.radixPoint || pos.end++),
            stripValidPositions(pos.begin, pos.end, !1, strict), strict !== !0 && generalize();
            var lvp = getLastValidPosition(pos.begin, !0);
            lvp < pos.begin ? getMaskSet().p = seekNext(lvp) : strict !== !0 && (getMaskSet().p = pos.begin);
        }
        function initializeColorMask(input) {
            function findCaretPos(clientx) {
                var caretPos, e = document.createElement("span");
                for (var style in computedStyle) isNaN(style) && style.indexOf("font") !== -1 && (e.style[style] = computedStyle[style]);
                e.style.textTransform = computedStyle.textTransform, e.style.letterSpacing = computedStyle.letterSpacing,
                e.style.position = "absolute", e.style.height = "auto", e.style.width = "auto",
                e.style.visibility = "hidden", e.style.whiteSpace = "nowrap", document.body.appendChild(e);
                var itl, inputText = input.inputmask._valueGet(), previousWidth = 0;
                for (caretPos = 0, itl = inputText.length; caretPos <= itl; caretPos++) {
                    if (e.innerHTML += inputText.charAt(caretPos) || "_", e.offsetWidth >= clientx) {
                        var offset1 = clientx - previousWidth, offset2 = e.offsetWidth - clientx;
                        e.innerHTML = inputText.charAt(caretPos), offset1 -= e.offsetWidth / 3, caretPos = offset1 < offset2 ? caretPos - 1 : caretPos;
                        break;
                    }
                    previousWidth = e.offsetWidth;
                }
                return document.body.removeChild(e), caretPos;
            }
            function position() {
                colorMask.style.position = "absolute", colorMask.style.top = offset.top + "px",
                colorMask.style.left = offset.left + "px", colorMask.style.width = parseInt(input.offsetWidth) - parseInt(computedStyle.paddingLeft) - parseInt(computedStyle.paddingRight) - parseInt(computedStyle.borderLeftWidth) - parseInt(computedStyle.borderRightWidth) + "px",
                colorMask.style.height = parseInt(input.offsetHeight) - parseInt(computedStyle.paddingTop) - parseInt(computedStyle.paddingBottom) - parseInt(computedStyle.borderTopWidth) - parseInt(computedStyle.borderBottomWidth) + "px",
                colorMask.style.lineHeight = colorMask.style.height, colorMask.style.zIndex = isNaN(computedStyle.zIndex) ? -1 : computedStyle.zIndex - 1,
                colorMask.style.webkitAppearance = "textfield", colorMask.style.mozAppearance = "textfield",
                colorMask.style.Appearance = "textfield";
            }
            var offset = $(input).position(), computedStyle = (input.ownerDocument.defaultView || window).getComputedStyle(input, null);
            input.parentNode;
            colorMask = document.createElement("div"), document.body.appendChild(colorMask);
            for (var style in computedStyle) isNaN(style) && "cssText" !== style && style.indexOf("webkit") == -1 && (colorMask.style[style] = computedStyle[style]);
            input.style.backgroundColor = "transparent", input.style.color = "transparent",
            input.style.webkitAppearance = "caret", input.style.mozAppearance = "caret", input.style.Appearance = "caret",
            position(), $(window).on("resize", function(e) {
                offset = $(input).position(), computedStyle = (input.ownerDocument.defaultView || window).getComputedStyle(input, null),
                position();
            }), $(input).on("click", function(e) {
                return caret(input, findCaretPos(e.clientX)), EventHandlers.clickEvent.call(this, [ e ]);
            }), $(input).on("keydown", function(e) {
                e.shiftKey || opts.insertMode === !1 || setTimeout(function() {
                    renderColorMask(input);
                }, 0);
            });
        }
        function renderColorMask(input, buffer, caretPos) {
            function handleStatic() {
                static || null !== test.fn && void 0 !== testPos.input ? static && null !== test.fn && void 0 !== testPos.input && (static = !1,
                maskTemplate += "</span>") : (static = !0, maskTemplate += "<span class='im-static''>");
            }
            if (void 0 !== colorMask) {
                buffer = buffer || getBuffer(), void 0 === caretPos ? caretPos = caret(input) : void 0 === caretPos.begin && (caretPos = {
                    begin: caretPos,
                    end: caretPos
                });
                var maskTemplate = "", static = !1;
                if ("" != buffer) {
                    var ndxIntlzr, test, testPos, pos = 0, lvp = getLastValidPosition();
                    do pos === caretPos.begin && document.activeElement === input && (maskTemplate += "<span class='im-caret' style='border-right-width: 1px;border-right-style: solid;'></span>"),
                    getMaskSet().validPositions[pos] ? (testPos = getMaskSet().validPositions[pos],
                    test = testPos.match, ndxIntlzr = testPos.locator.slice(), handleStatic(), maskTemplate += testPos.input) : (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1),
                    test = testPos.match, ndxIntlzr = testPos.locator.slice(), (opts.jitMasking === !1 || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && (handleStatic(),
                    maskTemplate += getPlaceholder(pos, test))), pos++; while ((void 0 === maxLength || pos < maxLength) && (null !== test.fn || "" !== test.def) || lvp > pos);
                }
                colorMask.innerHTML = maskTemplate;
            }
        }
        function mask(elem) {
            function isElementTypeSupported(input, opts) {
                function patchValueProperty(npt) {
                    function patchValhook(type) {
                        if ($.valHooks && (void 0 === $.valHooks[type] || $.valHooks[type].inputmaskpatch !== !0)) {
                            var valhookGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function(elem) {
                                return elem.value;
                            }, valhookSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function(elem, value) {
                                return elem.value = value, elem;
                            };
                            $.valHooks[type] = {
                                get: function(elem) {
                                    if (elem.inputmask) {
                                        if (elem.inputmask.opts.autoUnmask) return elem.inputmask.unmaskedvalue();
                                        var result = valhookGet(elem);
                                        return getLastValidPosition(void 0, void 0, elem.inputmask.maskset.validPositions) !== -1 || opts.nullable !== !0 ? result : "";
                                    }
                                    return valhookGet(elem);
                                },
                                set: function(elem, value) {
                                    var result, $elem = $(elem);
                                    return result = valhookSet(elem, value), elem.inputmask && $elem.trigger("setvalue"),
                                    result;
                                },
                                inputmaskpatch: !0
                            };
                        }
                    }
                    function getter() {
                        return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : getLastValidPosition() !== -1 || opts.nullable !== !0 ? document.activeElement === this && opts.clearMaskOnLostFocus ? (isRTL ? clearOptionalTail(getBuffer().slice()).reverse() : clearOptionalTail(getBuffer().slice())).join("") : valueGet.call(this) : "" : valueGet.call(this);
                    }
                    function setter(value) {
                        valueSet.call(this, value), this.inputmask && $(this).trigger("setvalue");
                    }
                    function installNativeValueSetFallback(npt) {
                        EventRuler.on(npt, "mouseenter", function(event) {
                            var $input = $(this), input = this, value = input.inputmask._valueGet();
                            value !== getBuffer().join("") && $input.trigger("setvalue");
                        });
                    }
                    var valueGet, valueSet;
                    if (!npt.inputmask.__valueGet) {
                        if (opts.noValuePatching !== !0) {
                            if (Object.getOwnPropertyDescriptor) {
                                "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" == typeof "test".__proto__ ? function(object) {
                                    return object.__proto__;
                                } : function(object) {
                                    return object.constructor.prototype;
                                });
                                var valueProperty = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(npt), "value") : void 0;
                                valueProperty && valueProperty.get && valueProperty.set ? (valueGet = valueProperty.get,
                                valueSet = valueProperty.set, Object.defineProperty(npt, "value", {
                                    get: getter,
                                    set: setter,
                                    configurable: !0
                                })) : "INPUT" !== npt.tagName && (valueGet = function() {
                                    return this.textContent;
                                }, valueSet = function(value) {
                                    this.textContent = value;
                                }, Object.defineProperty(npt, "value", {
                                    get: getter,
                                    set: setter,
                                    configurable: !0
                                }));
                            } else document.__lookupGetter__ && npt.__lookupGetter__("value") && (valueGet = npt.__lookupGetter__("value"),
                            valueSet = npt.__lookupSetter__("value"), npt.__defineGetter__("value", getter),
                            npt.__defineSetter__("value", setter));
                            npt.inputmask.__valueGet = valueGet, npt.inputmask.__valueSet = valueSet;
                        }
                        npt.inputmask._valueGet = function(overruleRTL) {
                            return isRTL && overruleRTL !== !0 ? valueGet.call(this.el).split("").reverse().join("") : valueGet.call(this.el);
                        }, npt.inputmask._valueSet = function(value, overruleRTL) {
                            valueSet.call(this.el, null === value || void 0 === value ? "" : overruleRTL !== !0 && isRTL ? value.split("").reverse().join("") : value);
                        }, void 0 === valueGet && (valueGet = function() {
                            return this.value;
                        }, valueSet = function(value) {
                            this.value = value;
                        }, patchValhook(npt.type), installNativeValueSetFallback(npt));
                    }
                }
                var elementType = input.getAttribute("type"), isSupported = "INPUT" === input.tagName && $.inArray(elementType, opts.supportsInputType) !== -1 || input.isContentEditable || "TEXTAREA" === input.tagName;
                if (!isSupported) if ("INPUT" === input.tagName) {
                    var el = document.createElement("input");
                    el.setAttribute("type", elementType), isSupported = "text" === el.type, el = null;
                } else isSupported = "partial";
                return isSupported !== !1 && patchValueProperty(input), isSupported;
            }
            var isSupported = isElementTypeSupported(elem, opts);
            if (isSupported !== !1 && (el = elem, $el = $(el), ("rtl" === el.dir || opts.rightAlign) && (el.style.textAlign = "right"),
            ("rtl" === el.dir || opts.numericInput) && (el.dir = "ltr", el.removeAttribute("dir"),
            el.inputmask.isRTL = !0, isRTL = !0), opts.colorMask === !0 && initializeColorMask(el),
            android && (el.hasOwnProperty("inputmode") && (el.inputmode = opts.inputmode, el.setAttribute("inputmode", opts.inputmode)),
            "rtfm" === opts.androidHack && (opts.colorMask !== !0 && initializeColorMask(el),
            el.type = "password")), EventRuler.off(el), isSupported === !0 && (EventRuler.on(el, "submit", EventHandlers.submitEvent),
            EventRuler.on(el, "reset", EventHandlers.resetEvent), EventRuler.on(el, "mouseenter", EventHandlers.mouseenterEvent),
            EventRuler.on(el, "blur", EventHandlers.blurEvent), EventRuler.on(el, "focus", EventHandlers.focusEvent),
            EventRuler.on(el, "mouseleave", EventHandlers.mouseleaveEvent), opts.colorMask !== !0 && EventRuler.on(el, "click", EventHandlers.clickEvent),
            EventRuler.on(el, "dblclick", EventHandlers.dblclickEvent), EventRuler.on(el, "paste", EventHandlers.pasteEvent),
            EventRuler.on(el, "dragdrop", EventHandlers.pasteEvent), EventRuler.on(el, "drop", EventHandlers.pasteEvent),
            EventRuler.on(el, "cut", EventHandlers.cutEvent), EventRuler.on(el, "complete", opts.oncomplete),
            EventRuler.on(el, "incomplete", opts.onincomplete), EventRuler.on(el, "cleared", opts.oncleared),
            opts.inputEventOnly !== !0 && (EventRuler.on(el, "keydown", EventHandlers.keydownEvent),
            EventRuler.on(el, "keypress", EventHandlers.keypressEvent)), EventRuler.on(el, "compositionstart", $.noop),
            EventRuler.on(el, "compositionupdate", $.noop), EventRuler.on(el, "compositionend", $.noop),
            EventRuler.on(el, "keyup", $.noop), EventRuler.on(el, "input", EventHandlers.inputFallBackEvent)),
            EventRuler.on(el, "setvalue", EventHandlers.setValueEvent), getBufferTemplate(),
            "" !== el.inputmask._valueGet() || opts.clearMaskOnLostFocus === !1 || document.activeElement === el)) {
                var initialValue = $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(el.inputmask._valueGet(), opts) || el.inputmask._valueGet() : el.inputmask._valueGet();
                checkVal(el, !0, !1, initialValue.split(""));
                var buffer = getBuffer().slice();
                undoValue = buffer.join(""), isComplete(buffer) === !1 && opts.clearIncomplete && resetMaskSet(),
                opts.clearMaskOnLostFocus && document.activeElement !== el && (getLastValidPosition() === -1 ? buffer = [] : clearOptionalTail(buffer)),
                writeBuffer(el, buffer), document.activeElement === el && caret(el, seekNext(getLastValidPosition()));
            }
        }
        maskset = maskset || this.maskset, opts = opts || this.opts;
        var undoValue, $el, maxLength, colorMask, valueBuffer, el = this.el, isRTL = this.isRTL, skipKeyPressEvent = !1, skipInputEvent = !1, ignorable = !1, mouseEnter = !1, EventRuler = {
            on: function(input, eventName, eventHandler) {
                var ev = function(e) {
                    if (void 0 === this.inputmask && "FORM" !== this.nodeName) {
                        var imOpts = $.data(this, "_inputmask_opts");
                        imOpts ? new Inputmask(imOpts).mask(this) : EventRuler.off(this);
                    } else {
                        if ("setvalue" === e.type || !(this.disabled || this.readOnly && !("keydown" === e.type && e.ctrlKey && 67 === e.keyCode || opts.tabThrough === !1 && e.keyCode === Inputmask.keyCode.TAB))) {
                            switch (e.type) {
                              case "input":
                                if (skipInputEvent === !0) return skipInputEvent = !1, e.preventDefault();
                                break;

                              case "keydown":
                                skipKeyPressEvent = !1, skipInputEvent = !1;
                                break;

                              case "keypress":
                                if (skipKeyPressEvent === !0) return e.preventDefault();
                                skipKeyPressEvent = !0;
                                break;

                              case "click":
                                if (iemobile || iphone) {
                                    var that = this, args = arguments;
                                    return setTimeout(function() {
                                        eventHandler.apply(that, args);
                                    }, 0), !1;
                                }
                            }
                            var returnVal = eventHandler.apply(this, arguments);
                            return returnVal === !1 && (e.preventDefault(), e.stopPropagation()), returnVal;
                        }
                        e.preventDefault();
                    }
                };
                input.inputmask.events[eventName] = input.inputmask.events[eventName] || [], input.inputmask.events[eventName].push(ev),
                $.inArray(eventName, [ "submit", "reset" ]) !== -1 ? null != input.form && $(input.form).on(eventName, ev) : $(input).on(eventName, ev);
            },
            off: function(input, event) {
                if (input.inputmask && input.inputmask.events) {
                    var events;
                    event ? (events = [], events[event] = input.inputmask.events[event]) : events = input.inputmask.events,
                    $.each(events, function(eventName, evArr) {
                        for (;evArr.length > 0; ) {
                            var ev = evArr.pop();
                            $.inArray(eventName, [ "submit", "reset" ]) !== -1 ? null != input.form && $(input.form).off(eventName, ev) : $(input).off(eventName, ev);
                        }
                        delete input.inputmask.events[eventName];
                    });
                }
            }
        }, EventHandlers = {
            keydownEvent: function(e) {
                function isInputEventSupported(eventName) {
                    var el = document.createElement("input"), evName = "on" + eventName, isSupported = evName in el;
                    return isSupported || (el.setAttribute(evName, "return;"), isSupported = "function" == typeof el[evName]),
                    el = null, isSupported;
                }
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);
                if (k === Inputmask.keyCode.BACKSPACE || k === Inputmask.keyCode.DELETE || iphone && k === Inputmask.keyCode.BACKSPACE_SAFARI || e.ctrlKey && k === Inputmask.keyCode.X && !isInputEventSupported("cut")) e.preventDefault(),
                handleRemove(input, k, pos), writeBuffer(input, getBuffer(!0), getMaskSet().p, e, input.inputmask._valueGet() !== getBuffer().join("")),
                input.inputmask._valueGet() === getBufferTemplate().join("") ? $input.trigger("cleared") : isComplete(getBuffer()) === !0 && $input.trigger("complete"); else if (k === Inputmask.keyCode.END || k === Inputmask.keyCode.PAGE_DOWN) {
                    e.preventDefault();
                    var caretPos = seekNext(getLastValidPosition());
                    opts.insertMode || caretPos !== getMaskSet().maskLength || e.shiftKey || caretPos--,
                    caret(input, e.shiftKey ? pos.begin : caretPos, caretPos, !0);
                } else k === Inputmask.keyCode.HOME && !e.shiftKey || k === Inputmask.keyCode.PAGE_UP ? (e.preventDefault(),
                caret(input, 0, e.shiftKey ? pos.begin : 0, !0)) : (opts.undoOnEscape && k === Inputmask.keyCode.ESCAPE || 90 === k && e.ctrlKey) && e.altKey !== !0 ? (checkVal(input, !0, !1, undoValue.split("")),
                $input.trigger("click")) : k !== Inputmask.keyCode.INSERT || e.shiftKey || e.ctrlKey ? opts.tabThrough === !0 && k === Inputmask.keyCode.TAB ? (e.shiftKey === !0 ? (null === getTest(pos.begin).match.fn && (pos.begin = seekNext(pos.begin)),
                pos.end = seekPrevious(pos.begin, !0), pos.begin = seekPrevious(pos.end, !0)) : (pos.begin = seekNext(pos.begin, !0),
                pos.end = seekNext(pos.begin, !0), pos.end < getMaskSet().maskLength && pos.end--),
                pos.begin < getMaskSet().maskLength && (e.preventDefault(), caret(input, pos.begin, pos.end))) : e.shiftKey || opts.insertMode === !1 && (k === Inputmask.keyCode.RIGHT ? setTimeout(function() {
                    var caretPos = caret(input);
                    caret(input, caretPos.begin);
                }, 0) : k === Inputmask.keyCode.LEFT && setTimeout(function() {
                    var caretPos = caret(input);
                    caret(input, isRTL ? caretPos.begin + 1 : caretPos.begin - 1);
                }, 0)) : (opts.insertMode = !opts.insertMode, caret(input, opts.insertMode || pos.begin !== getMaskSet().maskLength ? pos.begin : pos.begin - 1));
                opts.onKeyDown.call(this, e, getBuffer(), caret(input).begin, opts), ignorable = $.inArray(k, opts.ignorables) !== -1;
            },
            keypressEvent: function(e, checkval, writeOut, strict, ndx) {
                var input = this, $input = $(input), k = e.which || e.charCode || e.keyCode;
                if (!(checkval === !0 || e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable)) return k === Inputmask.keyCode.ENTER && undoValue !== getBuffer().join("") && (undoValue = getBuffer().join(""),
                setTimeout(function() {
                    $input.trigger("change");
                }, 0)), !0;
                if (k) {
                    46 === k && e.shiftKey === !1 && "," === opts.radixPoint && (k = 44);
                    var forwardPosition, pos = checkval ? {
                        begin: ndx,
                        end: ndx
                    } : caret(input), c = String.fromCharCode(k);
                    getMaskSet().writeOutBuffer = !0;
                    var valResult = isValid(pos, c, strict);
                    if (valResult !== !1 && (resetMaskSet(!0), forwardPosition = void 0 !== valResult.caret ? valResult.caret : checkval ? valResult.pos + 1 : seekNext(valResult.pos),
                    getMaskSet().p = forwardPosition), writeOut !== !1) {
                        var self = this;
                        if (setTimeout(function() {
                            opts.onKeyValidation.call(self, k, valResult, opts);
                        }, 0), getMaskSet().writeOutBuffer && valResult !== !1) {
                            var buffer = getBuffer();
                            writeBuffer(input, buffer, opts.numericInput && void 0 === valResult.caret ? seekPrevious(forwardPosition) : forwardPosition, e, checkval !== !0),
                            checkval !== !0 && setTimeout(function() {
                                isComplete(buffer) === !0 && $input.trigger("complete");
                            }, 0);
                        }
                    }
                    if (e.preventDefault(), checkval) return valResult.forwardPosition = forwardPosition,
                    valResult;
                }
            },
            pasteEvent: function(e) {
                var tempValue, input = this, ev = e.originalEvent || e, $input = $(input), inputValue = input.inputmask._valueGet(!0), caretPos = caret(input);
                isRTL && (tempValue = caretPos.end, caretPos.end = caretPos.begin, caretPos.begin = tempValue);
                var valueBeforeCaret = inputValue.substr(0, caretPos.begin), valueAfterCaret = inputValue.substr(caretPos.end, inputValue.length);
                if (valueBeforeCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(0, caretPos.begin).join("") && (valueBeforeCaret = ""),
                valueAfterCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(caretPos.end).join("") && (valueAfterCaret = ""),
                isRTL && (tempValue = valueBeforeCaret, valueBeforeCaret = valueAfterCaret, valueAfterCaret = tempValue),
                window.clipboardData && window.clipboardData.getData) inputValue = valueBeforeCaret + window.clipboardData.getData("Text") + valueAfterCaret; else {
                    if (!ev.clipboardData || !ev.clipboardData.getData) return !0;
                    inputValue = valueBeforeCaret + ev.clipboardData.getData("text/plain") + valueAfterCaret;
                }
                var pasteValue = inputValue;
                if ($.isFunction(opts.onBeforePaste)) {
                    if (pasteValue = opts.onBeforePaste(inputValue, opts), pasteValue === !1) return e.preventDefault();
                    pasteValue || (pasteValue = inputValue);
                }
                return checkVal(input, !1, !1, isRTL ? pasteValue.split("").reverse() : pasteValue.toString().split("")),
                writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()), e, undoValue !== getBuffer().join("")),
                isComplete(getBuffer()) === !0 && $input.trigger("complete"), e.preventDefault();
            },
            inputFallBackEvent: function(e) {
                var input = this, inputValue = input.inputmask._valueGet();
                if (getBuffer().join("") !== inputValue) {
                    var caretPos = caret(input);
                    if (inputValue = inputValue.replace(new RegExp("(" + Inputmask.escapeRegex(getBufferTemplate().join("")) + ")*"), ""),
                    iemobile) {
                        var inputChar = inputValue.replace(getBuffer().join(""), "");
                        if (1 === inputChar.length) {
                            var keypress = new $.Event("keypress");
                            return keypress.which = inputChar.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, getMaskSet().validPositions[caretPos.begin - 1] ? caretPos.begin : caretPos.begin - 1),
                            !1;
                        }
                    }
                    if (caretPos.begin > inputValue.length && (caret(input, inputValue.length), caretPos = caret(input)),
                    getBuffer().length - inputValue.length !== 1 || inputValue.charAt(caretPos.begin) === getBuffer()[caretPos.begin] || inputValue.charAt(caretPos.begin + 1) === getBuffer()[caretPos.begin] || isMask(caretPos.begin)) {
                        for (var lvp = getLastValidPosition() + 1, bufferTemplate = getBufferTemplate().join(""); null === inputValue.match(Inputmask.escapeRegex(bufferTemplate) + "$"); ) bufferTemplate = bufferTemplate.slice(1);
                        inputValue = inputValue.replace(bufferTemplate, ""), inputValue = inputValue.split(""),
                        checkVal(input, !0, !1, inputValue, e, caretPos.begin < lvp), isComplete(getBuffer()) === !0 && $(input).trigger("complete");
                    } else e.keyCode = Inputmask.keyCode.BACKSPACE, EventHandlers.keydownEvent.call(input, e);
                    e.preventDefault();
                }
            },
            setValueEvent: function(e) {
                var input = this, value = input.inputmask._valueGet();
                checkVal(input, !0, !1, ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(value, opts) || value : value).split("")),
                undoValue = getBuffer().join(""), (opts.clearMaskOnLostFocus || opts.clearIncomplete) && input.inputmask._valueGet() === getBufferTemplate().join("") && input.inputmask._valueSet("");
            },
            focusEvent: function(e) {
                var input = this, nptValue = input.inputmask._valueGet();
                opts.showMaskOnFocus && (!opts.showMaskOnHover || opts.showMaskOnHover && "" === nptValue) && (input.inputmask._valueGet() !== getBuffer().join("") ? writeBuffer(input, getBuffer(), seekNext(getLastValidPosition())) : mouseEnter === !1 && caret(input, seekNext(getLastValidPosition()))),
                opts.positionCaretOnTab === !0 && EventHandlers.clickEvent.apply(input, [ e, !0 ]),
                undoValue = getBuffer().join("");
            },
            mouseleaveEvent: function(e) {
                var input = this;
                if (mouseEnter = !1, opts.clearMaskOnLostFocus && document.activeElement !== input) {
                    var buffer = getBuffer().slice(), nptValue = input.inputmask._valueGet();
                    nptValue !== input.getAttribute("placeholder") && "" !== nptValue && (getLastValidPosition() === -1 && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer),
                    writeBuffer(input, buffer));
                }
            },
            clickEvent: function(e, tabbed) {
                function doRadixFocus(clickPos) {
                    if ("" !== opts.radixPoint) {
                        var vps = getMaskSet().validPositions;
                        if (void 0 === vps[clickPos] || vps[clickPos].input === getPlaceholder(clickPos)) {
                            if (clickPos < seekNext(-1)) return !0;
                            var radixPos = $.inArray(opts.radixPoint, getBuffer());
                            if (radixPos !== -1) {
                                for (var vp in vps) if (radixPos < vp && vps[vp].input !== getPlaceholder(vp)) return !1;
                                return !0;
                            }
                        }
                    }
                    return !1;
                }
                var input = this;
                setTimeout(function() {
                    if (document.activeElement === input) {
                        var selectedCaret = caret(input);
                        if (tabbed && (selectedCaret.begin = selectedCaret.end), selectedCaret.begin === selectedCaret.end) switch (opts.positionCaretOnClick) {
                          case "none":
                            break;

                          case "radixFocus":
                            if (doRadixFocus(selectedCaret.begin)) {
                                var radixPos = $.inArray(opts.radixPoint, getBuffer().join(""));
                                caret(input, opts.numericInput ? seekNext(radixPos) : radixPos);
                                break;
                            }

                          default:
                            var clickPosition = selectedCaret.begin, lvclickPosition = getLastValidPosition(clickPosition, !0), lastPosition = seekNext(lvclickPosition);
                            if (clickPosition < lastPosition) caret(input, isMask(clickPosition) || isMask(clickPosition - 1) ? clickPosition : seekNext(clickPosition)); else {
                                var placeholder = getPlaceholder(lastPosition);
                                ("" !== placeholder && getBuffer()[lastPosition] !== placeholder && getTest(lastPosition).match.optionalQuantifier !== !0 || !isMask(lastPosition) && getTest(lastPosition).match.def === placeholder) && (lastPosition = seekNext(lastPosition)),
                                caret(input, lastPosition);
                            }
                        }
                    }
                }, 0);
            },
            dblclickEvent: function(e) {
                var input = this;
                setTimeout(function() {
                    caret(input, 0, seekNext(getLastValidPosition()));
                }, 0);
            },
            cutEvent: function(e) {
                var input = this, $input = $(input), pos = caret(input), ev = e.originalEvent || e, clipboardData = window.clipboardData || ev.clipboardData, clipData = isRTL ? getBuffer().slice(pos.end, pos.begin) : getBuffer().slice(pos.begin, pos.end);
                clipboardData.setData("text", isRTL ? clipData.reverse().join("") : clipData.join("")),
                document.execCommand && document.execCommand("copy"), handleRemove(input, Inputmask.keyCode.DELETE, pos),
                writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join("")),
                input.inputmask._valueGet() === getBufferTemplate().join("") && $input.trigger("cleared");
            },
            blurEvent: function(e) {
                var $input = $(this), input = this;
                if (input.inputmask) {
                    var nptValue = input.inputmask._valueGet(), buffer = getBuffer().slice();
                    undoValue !== buffer.join("") && setTimeout(function() {
                        $input.trigger("change"), undoValue = buffer.join("");
                    }, 0), "" !== nptValue && (opts.clearMaskOnLostFocus && (getLastValidPosition() === -1 && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer)),
                    isComplete(buffer) === !1 && (setTimeout(function() {
                        $input.trigger("incomplete");
                    }, 0), opts.clearIncomplete && (resetMaskSet(), buffer = opts.clearMaskOnLostFocus ? [] : getBufferTemplate().slice())),
                    writeBuffer(input, buffer, void 0, e));
                }
            },
            mouseenterEvent: function(e) {
                var input = this;
                mouseEnter = !0, document.activeElement !== input && opts.showMaskOnHover && input.inputmask._valueGet() !== getBuffer().join("") && writeBuffer(input, getBuffer());
            },
            submitEvent: function(e) {
                undoValue !== getBuffer().join("") && $el.trigger("change"), opts.clearMaskOnLostFocus && getLastValidPosition() === -1 && el.inputmask._valueGet && el.inputmask._valueGet() === getBufferTemplate().join("") && el.inputmask._valueSet(""),
                opts.removeMaskOnSubmit && (el.inputmask._valueSet(el.inputmask.unmaskedvalue(), !0),
                setTimeout(function() {
                    writeBuffer(el, getBuffer());
                }, 0));
            },
            resetEvent: function(e) {
                setTimeout(function() {
                    $el.trigger("setvalue");
                }, 0);
            }
        };
        if (void 0 !== actionObj) switch (actionObj.action) {
          case "isComplete":
            return el = actionObj.el, isComplete(getBuffer());

          case "unmaskedvalue":
            return void 0 !== el && void 0 === actionObj.value || (valueBuffer = actionObj.value,
            valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(valueBuffer, opts) || valueBuffer : valueBuffer).split(""),
            checkVal(void 0, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite(void 0, getBuffer(), 0, opts)),
            unmaskedvalue(el);

          case "mask":
            mask(el);
            break;

          case "format":
            return valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(actionObj.value, opts) || actionObj.value : actionObj.value).split(""),
            checkVal(void 0, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite(void 0, getBuffer(), 0, opts),
            actionObj.metadata ? {
                value: isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join(""),
                metadata: maskScope.call(this, {
                    action: "getmetadata"
                }, maskset, opts)
            } : isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join("");

          case "isValid":
            actionObj.value ? (valueBuffer = actionObj.value.split(""), checkVal(void 0, !1, !0, isRTL ? valueBuffer.reverse() : valueBuffer)) : actionObj.value = getBuffer().join("");
            for (var buffer = getBuffer(), rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
            return buffer.splice(rl, lmib + 1 - rl), isComplete(buffer) && actionObj.value === getBuffer().join("");

          case "getemptymask":
            return getBufferTemplate().join("");

          case "remove":
            if (el) {
                $el = $(el), el.inputmask._valueSet(unmaskedvalue(el)), EventRuler.off(el);
                var valueProperty;
                Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? (valueProperty = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value"),
                valueProperty && el.inputmask.__valueGet && Object.defineProperty(el, "value", {
                    get: el.inputmask.__valueGet,
                    set: el.inputmask.__valueSet,
                    configurable: !0
                })) : document.__lookupGetter__ && el.__lookupGetter__("value") && el.inputmask.__valueGet && (el.__defineGetter__("value", el.inputmask.__valueGet),
                el.__defineSetter__("value", el.inputmask.__valueSet)), el.inputmask = void 0;
            }
            return el;

          case "getmetadata":
            if ($.isArray(maskset.metadata)) {
                var maskTarget = getMaskTemplate(!0, 0, !1).join("");
                return $.each(maskset.metadata, function(ndx, mtdt) {
                    if (mtdt.mask === maskTarget) return maskTarget = mtdt, !1;
                }), maskTarget;
            }
            return maskset.metadata;
        }
    }
    var ua = navigator.userAgent, mobile = /mobile/i.test(ua), iemobile = /iemobile/i.test(ua), iphone = /iphone/i.test(ua) && !iemobile, android = /android/i.test(ua) && !iemobile;
    return Inputmask.prototype = {
        defaults: {
            placeholder: "_",
            optionalmarker: {
                start: "[",
                end: "]"
            },
            quantifiermarker: {
                start: "{",
                end: "}"
            },
            groupmarker: {
                start: "(",
                end: ")"
            },
            alternatormarker: "|",
            escapeChar: "\\",
            mask: null,
            oncomplete: $.noop,
            onincomplete: $.noop,
            oncleared: $.noop,
            repeat: 0,
            greedy: !0,
            autoUnmask: !1,
            removeMaskOnSubmit: !1,
            clearMaskOnLostFocus: !0,
            insertMode: !0,
            clearIncomplete: !1,
            aliases: {},
            alias: null,
            onKeyDown: $.noop,
            onBeforeMask: null,
            onBeforePaste: function(pastedValue, opts) {
                return $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(pastedValue, opts) : pastedValue;
            },
            onBeforeWrite: null,
            onUnMask: null,
            showMaskOnFocus: !0,
            showMaskOnHover: !0,
            onKeyValidation: $.noop,
            skipOptionalPartCharacter: " ",
            numericInput: !1,
            rightAlign: !1,
            undoOnEscape: !0,
            radixPoint: "",
            radixPointDefinitionSymbol: void 0,
            groupSeparator: "",
            keepStatic: null,
            positionCaretOnTab: !0,
            tabThrough: !1,
            supportsInputType: [ "text", "tel", "password" ],
            definitions: {
                "9": {
                    validator: "[0-9]",
                    cardinality: 1,
                    definitionSymbol: "*"
                },
                a: {
                    validator: "[A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
                    cardinality: 1,
                    definitionSymbol: "*"
                },
                "*": {
                    validator: "[0-9A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
                    cardinality: 1
                }
            },
            ignorables: [ 8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123 ],
            isComplete: null,
            canClearPosition: $.noop,
            postValidation: null,
            staticDefinitionSymbol: void 0,
            jitMasking: !1,
            nullable: !0,
            inputEventOnly: !1,
            noValuePatching: !1,
            positionCaretOnClick: "lvp",
            casing: null,
            inputmode: "verbatim",
            colorMask: !1,
            androidHack: !1
        },
        masksCache: {},
        mask: function(elems) {
            function importAttributeOptions(npt, opts, userOptions, dataAttribute) {
                function importOption(option, optionData) {
                    optionData = void 0 !== optionData ? optionData : npt.getAttribute(dataAttribute + "-" + option),
                    null !== optionData && ("string" == typeof optionData && (0 === option.indexOf("on") ? optionData = window[optionData] : "false" === optionData ? optionData = !1 : "true" === optionData && (optionData = !0)),
                    userOptions[option] = optionData);
                }
                var option, dataoptions, optionData, p, attrOptions = npt.getAttribute(dataAttribute);
                if (attrOptions && "" !== attrOptions && (attrOptions = attrOptions.replace(new RegExp("'", "g"), '"'),
                dataoptions = JSON.parse("{" + attrOptions + "}")), dataoptions) {
                    optionData = void 0;
                    for (p in dataoptions) if ("alias" === p.toLowerCase()) {
                        optionData = dataoptions[p];
                        break;
                    }
                }
                importOption("alias", optionData), userOptions.alias && resolveAlias(userOptions.alias, userOptions, opts);
                for (option in opts) {
                    if (dataoptions) {
                        optionData = void 0;
                        for (p in dataoptions) if (p.toLowerCase() === option.toLowerCase()) {
                            optionData = dataoptions[p];
                            break;
                        }
                    }
                    importOption(option, optionData);
                }
                return $.extend(!0, opts, userOptions), opts;
            }
            var that = this;
            return "string" == typeof elems && (elems = document.getElementById(elems) || document.querySelectorAll(elems)),
            elems = elems.nodeName ? [ elems ] : elems, $.each(elems, function(ndx, el) {
                var scopedOpts = $.extend(!0, {}, that.opts);
                importAttributeOptions(el, scopedOpts, $.extend(!0, {}, that.userOptions), that.dataAttribute);
                var maskset = generateMaskSet(scopedOpts, that.noMasksCache);
                void 0 !== maskset && (void 0 !== el.inputmask && el.inputmask.remove(), el.inputmask = new Inputmask(),
                el.inputmask.opts = scopedOpts, el.inputmask.noMasksCache = that.noMasksCache, el.inputmask.userOptions = $.extend(!0, {}, that.userOptions),
                el.inputmask.el = el, el.inputmask.maskset = maskset, $.data(el, "_inputmask_opts", scopedOpts),
                maskScope.call(el.inputmask, {
                    action: "mask"
                }));
            }), elems && elems[0] ? elems[0].inputmask || this : this;
        },
        option: function(options, noremask) {
            return "string" == typeof options ? this.opts[options] : "object" == typeof options ? ($.extend(this.userOptions, options),
            this.el && noremask !== !0 && this.mask(this.el), this) : void 0;
        },
        unmaskedvalue: function(value) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache),
            maskScope.call(this, {
                action: "unmaskedvalue",
                value: value
            });
        },
        remove: function() {
            return maskScope.call(this, {
                action: "remove"
            });
        },
        getemptymask: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache),
            maskScope.call(this, {
                action: "getemptymask"
            });
        },
        hasMaskedValue: function() {
            return !this.opts.autoUnmask;
        },
        isComplete: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache),
            maskScope.call(this, {
                action: "isComplete"
            });
        },
        getmetadata: function() {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache),
            maskScope.call(this, {
                action: "getmetadata"
            });
        },
        isValid: function(value) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache),
            maskScope.call(this, {
                action: "isValid",
                value: value
            });
        },
        format: function(value, metadata) {
            return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache),
            maskScope.call(this, {
                action: "format",
                value: value,
                metadata: metadata
            });
        },
        analyseMask: function(mask, opts) {
            function MaskToken(isGroup, isOptional, isQuantifier, isAlternator) {
                this.matches = [], this.openGroup = isGroup || !1, this.isGroup = isGroup || !1,
                this.isOptional = isOptional || !1, this.isQuantifier = isQuantifier || !1, this.isAlternator = isAlternator || !1,
                this.quantifier = {
                    min: 1,
                    max: 1
                };
            }
            function insertTestDefinition(mtoken, element, position) {
                var maskdef = opts.definitions[element];
                position = void 0 !== position ? position : mtoken.matches.length;
                var prevMatch = mtoken.matches[position - 1];
                if (maskdef && !escaped) {
                    maskdef.placeholder = $.isFunction(maskdef.placeholder) ? maskdef.placeholder(opts) : maskdef.placeholder;
                    for (var prevalidators = maskdef.prevalidator, prevalidatorsL = prevalidators ? prevalidators.length : 0, i = 1; i < maskdef.cardinality; i++) {
                        var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator.validator, cardinality = prevalidator.cardinality;
                        mtoken.matches.splice(position++, 0, {
                            fn: validator ? "string" == typeof validator ? new RegExp(validator) : new function() {
                                this.test = validator;
                            }() : new RegExp("."),
                            cardinality: cardinality ? cardinality : 1,
                            optionality: mtoken.isOptional,
                            newBlockMarker: void 0 === prevMatch || prevMatch.def !== (maskdef.definitionSymbol || element),
                            casing: maskdef.casing,
                            def: maskdef.definitionSymbol || element,
                            placeholder: maskdef.placeholder,
                            nativeDef: element
                        }), prevMatch = mtoken.matches[position - 1];
                    }
                    mtoken.matches.splice(position++, 0, {
                        fn: maskdef.validator ? "string" == typeof maskdef.validator ? new RegExp(maskdef.validator) : new function() {
                            this.test = maskdef.validator;
                        }() : new RegExp("."),
                        cardinality: maskdef.cardinality,
                        optionality: mtoken.isOptional,
                        newBlockMarker: void 0 === prevMatch || prevMatch.def !== (maskdef.definitionSymbol || element),
                        casing: maskdef.casing,
                        def: maskdef.definitionSymbol || element,
                        placeholder: maskdef.placeholder,
                        nativeDef: element
                    });
                } else mtoken.matches.splice(position++, 0, {
                    fn: null,
                    cardinality: 0,
                    optionality: mtoken.isOptional,
                    newBlockMarker: void 0 === prevMatch || prevMatch.def !== element,
                    casing: null,
                    def: opts.staticDefinitionSymbol || element,
                    placeholder: void 0 !== opts.staticDefinitionSymbol ? element : void 0,
                    nativeDef: element
                }), escaped = !1;
            }
            function verifyGroupMarker(maskToken) {
                maskToken && maskToken.matches && $.each(maskToken.matches, function(ndx, token) {
                    var nextToken = maskToken.matches[ndx + 1];
                    (void 0 === nextToken || void 0 === nextToken.matches || nextToken.isQuantifier === !1) && token && token.isGroup && (token.isGroup = !1,
                    insertTestDefinition(token, opts.groupmarker.start, 0), token.openGroup !== !0 && insertTestDefinition(token, opts.groupmarker.end)),
                    verifyGroupMarker(token);
                });
            }
            function defaultCase() {
                if (openenings.length > 0) {
                    if (currentOpeningToken = openenings[openenings.length - 1], insertTestDefinition(currentOpeningToken, m),
                    currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                        openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1],
                        currentOpeningToken.matches.push(alternator)) : currentToken.matches.push(alternator);
                    }
                } else insertTestDefinition(currentToken, m);
            }
            function reverseTokens(maskToken) {
                function reverseStatic(st) {
                    return st === opts.optionalmarker.start ? st = opts.optionalmarker.end : st === opts.optionalmarker.end ? st = opts.optionalmarker.start : st === opts.groupmarker.start ? st = opts.groupmarker.end : st === opts.groupmarker.end && (st = opts.groupmarker.start),
                    st;
                }
                maskToken.matches = maskToken.matches.reverse();
                for (var match in maskToken.matches) {
                    var intMatch = parseInt(match);
                    if (maskToken.matches[match].isQuantifier && maskToken.matches[intMatch + 1] && maskToken.matches[intMatch + 1].isGroup) {
                        var qt = maskToken.matches[match];
                        maskToken.matches.splice(match, 1), maskToken.matches.splice(intMatch + 1, 0, qt);
                    }
                    void 0 !== maskToken.matches[match].matches ? maskToken.matches[match] = reverseTokens(maskToken.matches[match]) : maskToken.matches[match] = reverseStatic(maskToken.matches[match]);
                }
                return maskToken;
            }
            for (var match, m, openingToken, currentOpeningToken, alternator, lastMatch, groupToken, tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})|[^.?*+^${[]()|\\]+|./g, escaped = !1, currentToken = new MaskToken(), openenings = [], maskTokens = []; match = tokenizer.exec(mask); ) if (m = match[0],
            escaped) defaultCase(); else switch (m.charAt(0)) {
              case opts.escapeChar:
                escaped = !0;
                break;

              case opts.optionalmarker.end:
              case opts.groupmarker.end:
                if (openingToken = openenings.pop(), openingToken.openGroup = !1, void 0 !== openingToken) if (openenings.length > 0) {
                    if (currentOpeningToken = openenings[openenings.length - 1], currentOpeningToken.matches.push(openingToken),
                    currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                        openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1],
                        currentOpeningToken.matches.push(alternator)) : currentToken.matches.push(alternator);
                    }
                } else currentToken.matches.push(openingToken); else defaultCase();
                break;

              case opts.optionalmarker.start:
                openenings.push(new MaskToken((!1), (!0)));
                break;

              case opts.groupmarker.start:
                openenings.push(new MaskToken((!0)));
                break;

              case opts.quantifiermarker.start:
                var quantifier = new MaskToken((!1), (!1), (!0));
                m = m.replace(/[{}]/g, "");
                var mq = m.split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                if ("*" !== mq1 && "+" !== mq1 || (mq0 = "*" === mq1 ? 0 : 1), quantifier.quantifier = {
                    min: mq0,
                    max: mq1
                }, openenings.length > 0) {
                    var matches = openenings[openenings.length - 1].matches;
                    match = matches.pop(), match.isGroup || (groupToken = new MaskToken((!0)), groupToken.matches.push(match),
                    match = groupToken), matches.push(match), matches.push(quantifier);
                } else match = currentToken.matches.pop(), match.isGroup || (groupToken = new MaskToken((!0)),
                groupToken.matches.push(match), match = groupToken), currentToken.matches.push(match),
                currentToken.matches.push(quantifier);
                break;

              case opts.alternatormarker:
                openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1],
                lastMatch = currentOpeningToken.matches.pop()) : lastMatch = currentToken.matches.pop(),
                lastMatch.isAlternator ? openenings.push(lastMatch) : (alternator = new MaskToken((!1), (!1), (!1), (!0)),
                alternator.matches.push(lastMatch), openenings.push(alternator));
                break;

              default:
                defaultCase();
            }
            for (;openenings.length > 0; ) openingToken = openenings.pop(), currentToken.matches.push(openingToken);
            return currentToken.matches.length > 0 && (verifyGroupMarker(currentToken), maskTokens.push(currentToken)),
            opts.numericInput && reverseTokens(maskTokens[0]), maskTokens;
        }
    }, Inputmask.extendDefaults = function(options) {
        $.extend(!0, Inputmask.prototype.defaults, options);
    }, Inputmask.extendDefinitions = function(definition) {
        $.extend(!0, Inputmask.prototype.defaults.definitions, definition);
    }, Inputmask.extendAliases = function(alias) {
        $.extend(!0, Inputmask.prototype.defaults.aliases, alias);
    }, Inputmask.format = function(value, options, metadata) {
        return Inputmask(options).format(value, metadata);
    }, Inputmask.unmask = function(value, options) {
        return Inputmask(options).unmaskedvalue(value);
    }, Inputmask.isValid = function(value, options) {
        return Inputmask(options).isValid(value);
    }, Inputmask.remove = function(elems) {
        $.each(elems, function(ndx, el) {
            el.inputmask && el.inputmask.remove();
        });
    }, Inputmask.escapeRegex = function(str) {
        var specials = [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ];
        return str.replace(new RegExp("(\\" + specials.join("|\\") + ")", "gim"), "\\$1");
    }, Inputmask.keyCode = {
        ALT: 18,
        BACKSPACE: 8,
        BACKSPACE_SAFARI: 127,
        CAPS_LOCK: 20,
        COMMA: 188,
        COMMAND: 91,
        COMMAND_LEFT: 91,
        COMMAND_RIGHT: 93,
        CONTROL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        MENU: 93,
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_ENTER: 108,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38,
        WINDOWS: 91,
        X: 88
    }, window.Inputmask = Inputmask, Inputmask;
}(jQuery), function($, Inputmask) {
    return void 0 === $.fn.inputmask && ($.fn.inputmask = function(fn, options) {
        var nptmask, input = this[0];
        if (void 0 === options && (options = {}), "string" == typeof fn) switch (fn) {
          case "unmaskedvalue":
            return input && input.inputmask ? input.inputmask.unmaskedvalue() : $(input).val();

          case "remove":
            return this.each(function() {
                this.inputmask && this.inputmask.remove();
            });

          case "getemptymask":
            return input && input.inputmask ? input.inputmask.getemptymask() : "";

          case "hasMaskedValue":
            return !(!input || !input.inputmask) && input.inputmask.hasMaskedValue();

          case "isComplete":
            return !input || !input.inputmask || input.inputmask.isComplete();

          case "getmetadata":
            return input && input.inputmask ? input.inputmask.getmetadata() : void 0;

          case "setvalue":
            $(input).val(options), input && void 0 === input.inputmask && $(input).triggerHandler("setvalue");
            break;

          case "option":
            if ("string" != typeof options) return this.each(function() {
                if (void 0 !== this.inputmask) return this.inputmask.option(options);
            });
            if (input && void 0 !== input.inputmask) return input.inputmask.option(options);
            break;

          default:
            return options.alias = fn, nptmask = new Inputmask(options), this.each(function() {
                nptmask.mask(this);
            });
        } else {
            if ("object" == typeof fn) return nptmask = new Inputmask(fn), void 0 === fn.mask && void 0 === fn.alias ? this.each(function() {
                return void 0 !== this.inputmask ? this.inputmask.option(fn) : void nptmask.mask(this);
            }) : this.each(function() {
                nptmask.mask(this);
            });
            if (void 0 === fn) return this.each(function() {
                nptmask = new Inputmask(options), nptmask.mask(this);
            });
        }
    }), $.fn.inputmask;
}(jQuery, Inputmask), function($, Inputmask) {}(jQuery, Inputmask), function($, Inputmask) {
    function isLeapYear(year) {
        return isNaN(year) || 29 === new Date(year, 2, 0).getDate();
    }
    return Inputmask.extendAliases({
        "dd/mm/yyyy": {
            mask: "1/2/y",
            placeholder: "dd/mm/yyyy",
            regex: {
                val1pre: new RegExp("[0-3]"),
                val1: new RegExp("0[1-9]|[12][0-9]|3[01]"),
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|[12][0-9]|3[01])" + escapedSeparator + "[01])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|[12][0-9])" + escapedSeparator + "(0[1-9]|1[012]))|(30" + escapedSeparator + "(0[13-9]|1[012]))|(31" + escapedSeparator + "(0[13578]|1[02]))");
                }
            },
            leapday: "29/02/",
            separator: "/",
            yearrange: {
                minyear: 1900,
                maxyear: 2099
            },
            isInYearRange: function(chrs, minyear, maxyear) {
                if (isNaN(chrs)) return !1;
                var enteredyear = parseInt(chrs.concat(minyear.toString().slice(chrs.length))), enteredyear2 = parseInt(chrs.concat(maxyear.toString().slice(chrs.length)));
                return !isNaN(enteredyear) && (minyear <= enteredyear && enteredyear <= maxyear) || !isNaN(enteredyear2) && (minyear <= enteredyear2 && enteredyear2 <= maxyear);
            },
            determinebaseyear: function(minyear, maxyear, hint) {
                var currentyear = new Date().getFullYear();
                if (minyear > currentyear) return minyear;
                if (maxyear < currentyear) {
                    for (var maxYearPrefix = maxyear.toString().slice(0, 2), maxYearPostfix = maxyear.toString().slice(2, 4); maxyear < maxYearPrefix + hint; ) maxYearPrefix--;
                    var maxxYear = maxYearPrefix + maxYearPostfix;
                    return minyear > maxxYear ? minyear : maxxYear;
                }
                if (minyear <= currentyear && currentyear <= maxyear) {
                    for (var currentYearPrefix = currentyear.toString().slice(0, 2); maxyear < currentYearPrefix + hint; ) currentYearPrefix--;
                    var currentYearAndHint = currentYearPrefix + hint;
                    return currentYearAndHint < minyear ? minyear : currentYearAndHint;
                }
                return currentyear;
            },
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString()),
                    $input.trigger("setvalue");
                }
            },
            getFrontValue: function(mask, buffer, opts) {
                for (var start = 0, length = 0, i = 0; i < mask.length && "2" !== mask.charAt(i); i++) {
                    var definition = opts.definitions[mask.charAt(i)];
                    definition ? (start += length, length = definition.cardinality) : length++;
                }
                return buffer.join("").substr(start, length);
            },
            postValidation: function(buffer, currentResult, opts) {
                var dayMonthValue, year, bufferStr = buffer.join("");
                return 0 === opts.mask.indexOf("y") ? (year = bufferStr.substr(0, 4), dayMonthValue = bufferStr.substr(4, 11)) : (year = bufferStr.substr(6, 11),
                dayMonthValue = bufferStr.substr(0, 6)), currentResult && (dayMonthValue !== opts.leapday || isLeapYear(year));
            },
            definitions: {
                "1": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.regex.val1.test(chrs);
                        return strict || isValid || chrs.charAt(1) !== opts.separator && "-./".indexOf(chrs.charAt(1)) === -1 || !(isValid = opts.regex.val1.test("0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0",
                        {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            pos: pos,
                            c: chrs.charAt(0)
                        });
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var pchrs = chrs;
                            isNaN(maskset.buffer[pos + 1]) || (pchrs += maskset.buffer[pos + 1]);
                            var isValid = 1 === pchrs.length ? opts.regex.val1pre.test(pchrs) : opts.regex.val1.test(pchrs);
                            if (!strict && !isValid) {
                                if (isValid = opts.regex.val1.test(chrs + "0")) return maskset.buffer[pos] = chrs,
                                maskset.buffer[++pos] = "0", {
                                    pos: pos,
                                    c: "0"
                                };
                                if (isValid = opts.regex.val1.test("0" + chrs)) return maskset.buffer[pos] = "0",
                                pos++, {
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 1
                    } ]
                },
                "2": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                        frontValue.indexOf(opts.placeholder[0]) !== -1 && (frontValue = "01" + opts.separator);
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        return strict || isValid || chrs.charAt(1) !== opts.separator && "-./".indexOf(chrs.charAt(1)) === -1 || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0",
                        {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            pos: pos,
                            c: chrs.charAt(0)
                        });
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            isNaN(maskset.buffer[pos + 1]) || (chrs += maskset.buffer[pos + 1]);
                            var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                            frontValue.indexOf(opts.placeholder[0]) !== -1 && (frontValue = "01" + opts.separator);
                            var isValid = 1 === chrs.length ? opts.regex.val2pre(opts.separator).test(frontValue + chrs) : opts.regex.val2(opts.separator).test(frontValue + chrs);
                            return strict || isValid || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs)) ? isValid : (maskset.buffer[pos] = "0",
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                y: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                    },
                    cardinality: 4,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (!strict && !isValid) {
                                var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 1);
                                if (isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0),
                                {
                                    pos: pos
                                };
                                if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 2),
                                isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0),
                                maskset.buffer[pos++] = yearPrefix.charAt(1), {
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 1
                    }, {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (!strict && !isValid) {
                                var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);
                                if (isValid = opts.isInYearRange(chrs[0] + yearPrefix[1] + chrs[1], opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(1),
                                {
                                    pos: pos
                                };
                                if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2),
                                isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos - 1] = yearPrefix.charAt(0),
                                maskset.buffer[pos++] = yearPrefix.charAt(1), maskset.buffer[pos++] = chrs.charAt(0),
                                {
                                    refreshFromBuffer: {
                                        start: pos - 3,
                                        end: pos
                                    },
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 2
                    }, {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        },
                        cardinality: 3
                    } ]
                }
            },
            insertMode: !1,
            autoUnmask: !1
        },
        "mm/dd/yyyy": {
            placeholder: "mm/dd/yyyy",
            alias: "dd/mm/yyyy",
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            leapday: "02/29/",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()),
                    $input.trigger("setvalue");
                }
            }
        },
        "yyyy/mm/dd": {
            mask: "y/1/2",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            leapday: "/02/29",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString()),
                    $input.trigger("setvalue");
                }
            }
        },
        "dd.mm.yyyy": {
            mask: "1.2.y",
            placeholder: "dd.mm.yyyy",
            leapday: "29.02.",
            separator: ".",
            alias: "dd/mm/yyyy"
        },
        "dd-mm-yyyy": {
            mask: "1-2-y",
            placeholder: "dd-mm-yyyy",
            leapday: "29-02-",
            separator: "-",
            alias: "dd/mm/yyyy"
        },
        "mm.dd.yyyy": {
            mask: "1.2.y",
            placeholder: "mm.dd.yyyy",
            leapday: "02.29.",
            separator: ".",
            alias: "mm/dd/yyyy"
        },
        "mm-dd-yyyy": {
            mask: "1-2-y",
            placeholder: "mm-dd-yyyy",
            leapday: "02-29-",
            separator: "-",
            alias: "mm/dd/yyyy"
        },
        "yyyy.mm.dd": {
            mask: "y.1.2",
            placeholder: "yyyy.mm.dd",
            leapday: ".02.29",
            separator: ".",
            alias: "yyyy/mm/dd"
        },
        "yyyy-mm-dd": {
            mask: "y-1-2",
            placeholder: "yyyy-mm-dd",
            leapday: "-02-29",
            separator: "-",
            alias: "yyyy/mm/dd"
        },
        datetime: {
            mask: "1/2/y h:s",
            placeholder: "dd/mm/yyyy hh:mm",
            alias: "dd/mm/yyyy",
            regex: {
                hrspre: new RegExp("[012]"),
                hrs24: new RegExp("2[0-4]|1[3-9]"),
                hrs: new RegExp("[01][0-9]|2[0-4]"),
                ampm: new RegExp("^[a|p|A|P][m|M]"),
                mspre: new RegExp("[0-5]"),
                ms: new RegExp("[0-5][0-9]")
            },
            timeseparator: ":",
            hourFormat: "24",
            definitions: {
                h: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        if ("24" === opts.hourFormat && 24 === parseInt(chrs, 10)) return maskset.buffer[pos - 1] = "0",
                        maskset.buffer[pos] = "0", {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            c: "0"
                        };
                        var isValid = opts.regex.hrs.test(chrs);
                        if (!strict && !isValid && (chrs.charAt(1) === opts.timeseparator || "-.:".indexOf(chrs.charAt(1)) !== -1) && (isValid = opts.regex.hrs.test("0" + chrs.charAt(0)))) return maskset.buffer[pos - 1] = "0",
                        maskset.buffer[pos] = chrs.charAt(0), pos++, {
                            refreshFromBuffer: {
                                start: pos - 2,
                                end: pos
                            },
                            pos: pos,
                            c: opts.timeseparator
                        };
                        if (isValid && "24" !== opts.hourFormat && opts.regex.hrs24.test(chrs)) {
                            var tmp = parseInt(chrs, 10);
                            return 24 === tmp ? (maskset.buffer[pos + 5] = "a", maskset.buffer[pos + 6] = "m") : (maskset.buffer[pos + 5] = "p",
                            maskset.buffer[pos + 6] = "m"), tmp -= 12, tmp < 10 ? (maskset.buffer[pos] = tmp.toString(),
                            maskset.buffer[pos - 1] = "0") : (maskset.buffer[pos] = tmp.toString().charAt(1),
                            maskset.buffer[pos - 1] = tmp.toString().charAt(0)), {
                                refreshFromBuffer: {
                                    start: pos - 1,
                                    end: pos + 6
                                },
                                c: maskset.buffer[pos]
                            };
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.hrspre.test(chrs);
                            return strict || isValid || !(isValid = opts.regex.hrs.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0",
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                s: {
                    validator: "[0-5][0-9]",
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.mspre.test(chrs);
                            return strict || isValid || !(isValid = opts.regex.ms.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0",
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                t: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return opts.regex.ampm.test(chrs + "m");
                    },
                    casing: "lower",
                    cardinality: 1
                }
            },
            insertMode: !1,
            autoUnmask: !1
        },
        datetime12: {
            mask: "1/2/y h:s t\\m",
            placeholder: "dd/mm/yyyy hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "mm/dd/yyyy hh:mm xm": {
            mask: "1/2/y h:s t\\m",
            placeholder: "mm/dd/yyyy hh:mm xm",
            alias: "datetime12",
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            leapday: "02/29/",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()),
                    $input.trigger("setvalue");
                }
            }
        },
        "hh:mm t": {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "h:s t": {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "hh:mm:ss": {
            mask: "h:s:s",
            placeholder: "hh:mm:ss",
            alias: "datetime",
            autoUnmask: !1
        },
        "hh:mm": {
            mask: "h:s",
            placeholder: "hh:mm",
            alias: "datetime",
            autoUnmask: !1
        },
        date: {
            alias: "dd/mm/yyyy"
        },
        "mm/yyyy": {
            mask: "1/y",
            placeholder: "mm/yyyy",
            leapday: "donotuse",
            separator: "/",
            alias: "mm/dd/yyyy"
        },
        shamsi: {
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "[0-3])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[1-9]|1[012])" + escapedSeparator + "30)|((0[1-6])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            yearrange: {
                minyear: 1300,
                maxyear: 1499
            },
            mask: "y/1/2",
            leapday: "/12/30",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            clearIncomplete: !0
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendDefinitions({
        A: {
            validator: "[A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
            cardinality: 1,
            casing: "upper"
        },
        "&": {
            validator: "[0-9A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
            cardinality: 1,
            casing: "upper"
        },
        "#": {
            validator: "[0-9A-Fa-f]",
            cardinality: 1,
            casing: "upper"
        }
    }), Inputmask.extendAliases({
        url: {
            definitions: {
                i: {
                    validator: ".",
                    cardinality: 1
                }
            },
            mask: "(\\http://)|(\\http\\s://)|(ftp://)|(ftp\\s://)i{+}",
            insertMode: !1,
            autoUnmask: !1,
            inputmode: "url"
        },
        ip: {
            mask: "i[i[i]].i[i[i]].i[i[i]].i[i[i]]",
            definitions: {
                i: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return pos - 1 > -1 && "." !== maskset.buffer[pos - 1] ? (chrs = maskset.buffer[pos - 1] + chrs,
                        chrs = pos - 2 > -1 && "." !== maskset.buffer[pos - 2] ? maskset.buffer[pos - 2] + chrs : "0" + chrs) : chrs = "00" + chrs,
                        new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]").test(chrs);
                    },
                    cardinality: 1
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                return maskedValue;
            },
            inputmode: "numeric"
        },
        email: {
            mask: "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}.-{1,63}[.-{1,63}][.-{1,63}]",
            greedy: !1,
            onBeforePaste: function(pastedValue, opts) {
                return pastedValue = pastedValue.toLowerCase(), pastedValue.replace("mailto:", "");
            },
            definitions: {
                "*": {
                    validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
                    cardinality: 1,
                    casing: "lower"
                },
                "-": {
                    validator: "[0-9A-Za-z-]",
                    cardinality: 1,
                    casing: "lower"
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                return maskedValue;
            },
            inputmode: "email"
        },
        mac: {
            mask: "##:##:##:##:##:##"
        },
        vin: {
            mask: "V{13}9{4}",
            definitions: {
                V: {
                    validator: "[A-HJ-NPR-Za-hj-npr-z\\d]",
                    cardinality: 1,
                    casing: "upper"
                }
            },
            clearIncomplete: !0,
            autoUnmask: !0
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendAliases({
        numeric: {
            mask: function(opts) {
                function autoEscape(txt) {
                    for (var escapedTxt = "", i = 0; i < txt.length; i++) escapedTxt += opts.definitions[txt.charAt(i)] || opts.optionalmarker.start === txt.charAt(i) || opts.optionalmarker.end === txt.charAt(i) || opts.quantifiermarker.start === txt.charAt(i) || opts.quantifiermarker.end === txt.charAt(i) || opts.groupmarker.start === txt.charAt(i) || opts.groupmarker.end === txt.charAt(i) || opts.alternatormarker === txt.charAt(i) ? "\\" + txt.charAt(i) : txt.charAt(i);
                    return escapedTxt;
                }
                if (0 !== opts.repeat && isNaN(opts.integerDigits) && (opts.integerDigits = opts.repeat),
                opts.repeat = 0, opts.groupSeparator === opts.radixPoint && ("." === opts.radixPoint ? opts.groupSeparator = "," : "," === opts.radixPoint ? opts.groupSeparator = "." : opts.groupSeparator = ""),
                " " === opts.groupSeparator && (opts.skipOptionalPartCharacter = void 0), opts.autoGroup = opts.autoGroup && "" !== opts.groupSeparator,
                opts.autoGroup && ("string" == typeof opts.groupSize && isFinite(opts.groupSize) && (opts.groupSize = parseInt(opts.groupSize)),
                isFinite(opts.integerDigits))) {
                    var seps = Math.floor(opts.integerDigits / opts.groupSize), mod = opts.integerDigits % opts.groupSize;
                    opts.integerDigits = parseInt(opts.integerDigits) + (0 === mod ? seps - 1 : seps),
                    opts.integerDigits < 1 && (opts.integerDigits = "*");
                }
                opts.placeholder.length > 1 && (opts.placeholder = opts.placeholder.charAt(0)),
                "radixFocus" === opts.positionCaretOnClick && "" === opts.placeholder && opts.integerOptional === !1 && (opts.positionCaretOnClick = "lvp"),
                opts.definitions[";"] = opts.definitions["~"], opts.definitions[";"].definitionSymbol = "~",
                opts.numericInput === !0 && (opts.positionCaretOnClick = "radixFocus" === opts.positionCaretOnClick ? "lvp" : opts.positionCaretOnClick,
                opts.digitsOptional = !1, isNaN(opts.digits) && (opts.digits = 2), opts.decimalProtect = !1);
                var mask = "[+]";
                if (mask += autoEscape(opts.prefix), mask += opts.integerOptional === !0 ? "~{1," + opts.integerDigits + "}" : "~{" + opts.integerDigits + "}",
                void 0 !== opts.digits) {
                    opts.decimalProtect && (opts.radixPointDefinitionSymbol = ":");
                    var dq = opts.digits.toString().split(",");
                    isFinite(dq[0] && dq[1] && isFinite(dq[1])) ? mask += (opts.decimalProtect ? ":" : opts.radixPoint) + ";{" + opts.digits + "}" : (isNaN(opts.digits) || parseInt(opts.digits) > 0) && (mask += opts.digitsOptional ? "[" + (opts.decimalProtect ? ":" : opts.radixPoint) + ";{1," + opts.digits + "}]" : (opts.decimalProtect ? ":" : opts.radixPoint) + ";{" + opts.digits + "}");
                }
                return mask += autoEscape(opts.suffix), mask += "[-]", opts.greedy = !1, null !== opts.min && (opts.min = opts.min.toString().replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""),
                "," === opts.radixPoint && (opts.min = opts.min.replace(opts.radixPoint, "."))),
                null !== opts.max && (opts.max = opts.max.toString().replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""),
                "," === opts.radixPoint && (opts.max = opts.max.replace(opts.radixPoint, "."))),
                mask;
            },
            placeholder: "",
            greedy: !1,
            digits: "*",
            digitsOptional: !0,
            radixPoint: ".",
            positionCaretOnClick: "radixFocus",
            groupSize: 3,
            groupSeparator: "",
            autoGroup: !1,
            allowPlus: !0,
            allowMinus: !0,
            negationSymbol: {
                front: "-",
                back: ""
            },
            integerDigits: "+",
            integerOptional: !0,
            prefix: "",
            suffix: "",
            rightAlign: !0,
            decimalProtect: !0,
            min: null,
            max: null,
            step: 1,
            insertMode: !0,
            autoUnmask: !1,
            unmaskAsNumber: !1,
            inputmode: "numeric",
            postFormat: function(buffer, pos, opts) {
                opts.numericInput === !0 && (buffer = buffer.reverse(), isFinite(pos) && (pos = buffer.join("").length - pos - 1));
                var i, l;
                pos = pos >= buffer.length ? buffer.length - 1 : pos < 0 ? 0 : pos;
                var charAtPos = buffer[pos], cbuf = buffer.slice();
                charAtPos === opts.groupSeparator && (cbuf.splice(pos--, 1), charAtPos = cbuf[pos]);
                var isNegative = cbuf.join("").match(new RegExp("^" + Inputmask.escapeRegex(opts.negationSymbol.front)));
                isNegative = null !== isNegative && 1 === isNegative.length, pos > (isNegative ? opts.negationSymbol.front.length : 0) + opts.prefix.length && pos < cbuf.length - opts.suffix.length && (cbuf[pos] = "!");
                var bufVal = cbuf.join(""), bufValOrigin = cbuf.join();
                if (isNegative && (bufVal = bufVal.replace(new RegExp("^" + Inputmask.escapeRegex(opts.negationSymbol.front)), ""),
                bufVal = bufVal.replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), "")),
                bufVal = bufVal.replace(new RegExp(Inputmask.escapeRegex(opts.suffix) + "$"), ""),
                bufVal = bufVal.replace(new RegExp("^" + Inputmask.escapeRegex(opts.prefix)), ""),
                bufVal.length > 0 && opts.autoGroup || bufVal.indexOf(opts.groupSeparator) !== -1) {
                    var escapedGroupSeparator = Inputmask.escapeRegex(opts.groupSeparator);
                    bufVal = bufVal.replace(new RegExp(escapedGroupSeparator, "g"), "");
                    var radixSplit = bufVal.split(charAtPos === opts.radixPoint ? "!" : opts.radixPoint);
                    if (bufVal = "" === opts.radixPoint ? bufVal : radixSplit[0], charAtPos !== opts.negationSymbol.front && (bufVal = bufVal.replace("!", "?")),
                    bufVal.length > opts.groupSize) for (var reg = new RegExp("([-+]?[\\d?]+)([\\d?]{" + opts.groupSize + "})"); reg.test(bufVal) && "" !== opts.groupSeparator; ) bufVal = bufVal.replace(reg, "$1" + opts.groupSeparator + "$2"),
                    bufVal = bufVal.replace(opts.groupSeparator + opts.groupSeparator, opts.groupSeparator);
                    bufVal = bufVal.replace("?", "!"), "" !== opts.radixPoint && radixSplit.length > 1 && (bufVal += (charAtPos === opts.radixPoint ? "!" : opts.radixPoint) + radixSplit[1]);
                }
                bufVal = opts.prefix + bufVal + opts.suffix, isNegative && (bufVal = opts.negationSymbol.front + bufVal + opts.negationSymbol.back);
                var needsRefresh = bufValOrigin !== bufVal.split("").join(), newPos = $.inArray("!", bufVal);
                if (newPos === -1 && (newPos = pos), needsRefresh) {
                    for (buffer.length = bufVal.length, i = 0, l = bufVal.length; i < l; i++) buffer[i] = bufVal.charAt(i);
                    buffer[newPos] = charAtPos;
                }
                return newPos = opts.numericInput && isFinite(pos) ? buffer.join("").length - newPos - 1 : newPos,
                opts.numericInput && (buffer = buffer.reverse(), $.inArray(opts.radixPoint, buffer) < newPos && buffer.join("").length - opts.suffix.length !== newPos && (newPos -= 1)),
                {
                    pos: newPos,
                    refreshFromBuffer: needsRefresh,
                    buffer: buffer,
                    isNegative: isNegative
                };
            },
            onBeforeWrite: function(e, buffer, caretPos, opts) {
                var rslt;
                if (e && ("blur" === e.type || "checkval" === e.type || "keydown" === e.type)) {
                    var maskedValue = opts.numericInput ? buffer.slice().reverse().join("") : buffer.join(""), processValue = maskedValue.replace(opts.prefix, "");
                    processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""),
                    "," === opts.radixPoint && (processValue = processValue.replace(opts.radixPoint, "."));
                    var isNegative = processValue.match(new RegExp("[-" + Inputmask.escapeRegex(opts.negationSymbol.front) + "]", "g"));
                    if (isNegative = null !== isNegative && 1 === isNegative.length, processValue = processValue.replace(new RegExp("[-" + Inputmask.escapeRegex(opts.negationSymbol.front) + "]", "g"), ""),
                    processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), ""),
                    isNaN(opts.placeholder) && (processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.placeholder), "g"), "")),
                    processValue = processValue === opts.negationSymbol.front ? processValue + "0" : processValue,
                    "" !== processValue && isFinite(processValue)) {
                        var floatValue = parseFloat(processValue), signedFloatValue = isNegative ? floatValue * -1 : floatValue;
                        if (null !== opts.min && isFinite(opts.min) && signedFloatValue < parseFloat(opts.min) ? (floatValue = Math.abs(opts.min),
                        isNegative = opts.min < 0, maskedValue = void 0) : null !== opts.max && isFinite(opts.max) && signedFloatValue > parseFloat(opts.max) && (floatValue = Math.abs(opts.max),
                        isNegative = opts.max < 0, maskedValue = void 0), processValue = floatValue.toString().replace(".", opts.radixPoint).split(""),
                        isFinite(opts.digits)) {
                            var radixPosition = $.inArray(opts.radixPoint, processValue), rpb = $.inArray(opts.radixPoint, maskedValue);
                            radixPosition === -1 && (processValue.push(opts.radixPoint), radixPosition = processValue.length - 1);
                            for (var i = 1; i <= opts.digits; i++) opts.digitsOptional || void 0 !== processValue[radixPosition + i] && processValue[radixPosition + i] !== opts.placeholder.charAt(0) ? rpb !== -1 && void 0 !== maskedValue[rpb + i] && (processValue[radixPosition + i] = processValue[radixPosition + i] || maskedValue[rpb + i]) : processValue[radixPosition + i] = "0";
                            processValue[processValue.length - 1] === opts.radixPoint && delete processValue[processValue.length - 1];
                        }
                        if (floatValue.toString() !== processValue && floatValue.toString() + "." !== processValue || isNegative) return processValue = (opts.prefix + processValue.join("")).split(""),
                        !isNegative || 0 === floatValue && "blur" === e.type || (processValue.unshift(opts.negationSymbol.front),
                        processValue.push(opts.negationSymbol.back)), opts.numericInput && (processValue = processValue.reverse()),
                        rslt = opts.postFormat(processValue, opts.numericInput ? caretPos : caretPos - 1, opts),
                        rslt.buffer && (rslt.refreshFromBuffer = rslt.buffer.join("") !== buffer.join("")),
                        rslt;
                    }
                }
                if (opts.autoGroup) return rslt = opts.postFormat(buffer, opts.numericInput ? caretPos : caretPos - 1, opts),
                rslt.caret = caretPos < (rslt.isNegative ? opts.negationSymbol.front.length : 0) + opts.prefix.length || caretPos > rslt.buffer.length - (rslt.isNegative ? opts.negationSymbol.back.length : 0) ? rslt.pos : rslt.pos + 1,
                rslt;
            },
            regex: {
                integerPart: function(opts) {
                    return new RegExp("[" + Inputmask.escapeRegex(opts.negationSymbol.front) + "+]?\\d+");
                },
                integerNPart: function(opts) {
                    return new RegExp("[\\d" + Inputmask.escapeRegex(opts.groupSeparator) + Inputmask.escapeRegex(opts.placeholder.charAt(0)) + "]+");
                }
            },
            signHandler: function(chrs, maskset, pos, strict, opts) {
                if (!strict && opts.allowMinus && "-" === chrs || opts.allowPlus && "+" === chrs) {
                    var matchRslt = maskset.buffer.join("").match(opts.regex.integerPart(opts));
                    if (matchRslt && matchRslt[0].length > 0) return maskset.buffer[matchRslt.index] === ("-" === chrs ? "+" : opts.negationSymbol.front) ? "-" === chrs ? "" !== opts.negationSymbol.back ? {
                        pos: 0,
                        c: opts.negationSymbol.front,
                        remove: 0,
                        caret: pos,
                        insert: {
                            pos: maskset.buffer.length - 1,
                            c: opts.negationSymbol.back
                        }
                    } : {
                        pos: 0,
                        c: opts.negationSymbol.front,
                        remove: 0,
                        caret: pos
                    } : "" !== opts.negationSymbol.back ? {
                        pos: 0,
                        c: "+",
                        remove: [ 0, maskset.buffer.length - 1 ],
                        caret: pos
                    } : {
                        pos: 0,
                        c: "+",
                        remove: 0,
                        caret: pos
                    } : maskset.buffer[0] === ("-" === chrs ? opts.negationSymbol.front : "+") ? "-" === chrs && "" !== opts.negationSymbol.back ? {
                        remove: [ 0, maskset.buffer.length - 1 ],
                        caret: pos - 1
                    } : {
                        remove: 0,
                        caret: pos - 1
                    } : "-" === chrs ? "" !== opts.negationSymbol.back ? {
                        pos: 0,
                        c: opts.negationSymbol.front,
                        caret: pos + 1,
                        insert: {
                            pos: maskset.buffer.length,
                            c: opts.negationSymbol.back
                        }
                    } : {
                        pos: 0,
                        c: opts.negationSymbol.front,
                        caret: pos + 1
                    } : {
                        pos: 0,
                        c: chrs,
                        caret: pos + 1
                    };
                }
                return !1;
            },
            radixHandler: function(chrs, maskset, pos, strict, opts) {
                if (!strict && opts.numericInput !== !0 && chrs === opts.radixPoint && void 0 !== opts.digits && (isNaN(opts.digits) || parseInt(opts.digits) > 0)) {
                    var radixPos = $.inArray(opts.radixPoint, maskset.buffer), integerValue = maskset.buffer.join("").match(opts.regex.integerPart(opts));
                    if (radixPos !== -1 && maskset.validPositions[radixPos]) return maskset.validPositions[radixPos - 1] ? {
                        caret: radixPos + 1
                    } : {
                        pos: integerValue.index,
                        c: integerValue[0],
                        caret: radixPos + 1
                    };
                    if (!integerValue || "0" === integerValue[0] && integerValue.index + 1 !== pos) return maskset.buffer[integerValue ? integerValue.index : pos] = "0",
                    {
                        pos: (integerValue ? integerValue.index : pos) + 1,
                        c: opts.radixPoint
                    };
                }
                return !1;
            },
            leadingZeroHandler: function(chrs, maskset, pos, strict, opts, isSelection) {
                if (!strict) {
                    var buffer = maskset.buffer.slice("");
                    if (buffer.splice(0, opts.prefix.length), buffer.splice(buffer.length - opts.suffix.length, opts.suffix.length),
                    opts.numericInput === !0) {
                        var buffer = buffer.reverse(), bufferChar = buffer[0];
                        if ("0" === bufferChar && void 0 === maskset.validPositions[pos - 1]) return {
                            pos: pos,
                            remove: buffer.length - 1
                        };
                    } else {
                        pos -= opts.prefix.length;
                        var radixPosition = $.inArray(opts.radixPoint, buffer), matchRslt = buffer.slice(0, radixPosition !== -1 ? radixPosition : void 0).join("").match(opts.regex.integerNPart(opts));
                        if (matchRslt && (radixPosition === -1 || pos <= radixPosition)) {
                            var decimalPart = radixPosition === -1 ? 0 : parseInt(buffer.slice(radixPosition + 1).join(""));
                            if (0 === matchRslt[0].indexOf("" !== opts.placeholder ? opts.placeholder.charAt(0) : "0") && (matchRslt.index + 1 === pos || isSelection !== !0 && 0 === decimalPart)) return maskset.buffer.splice(matchRslt.index + opts.prefix.length, 1),
                            {
                                pos: matchRslt.index + opts.prefix.length,
                                remove: matchRslt.index + opts.prefix.length
                            };
                            if ("0" === chrs && pos <= matchRslt.index && matchRslt[0] !== opts.groupSeparator) return !1;
                        }
                    }
                }
                return !0;
            },
            definitions: {
                "~": {
                    validator: function(chrs, maskset, pos, strict, opts, isSelection) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        if (!isValid && (isValid = opts.radixHandler(chrs, maskset, pos, strict, opts),
                        !isValid && (isValid = strict ? new RegExp("[0-9" + Inputmask.escapeRegex(opts.groupSeparator) + "]").test(chrs) : new RegExp("[0-9]").test(chrs),
                        isValid === !0 && (isValid = opts.leadingZeroHandler(chrs, maskset, pos, strict, opts, isSelection),
                        isValid === !0)))) {
                            var radixPosition = $.inArray(opts.radixPoint, maskset.buffer);
                            isValid = radixPosition !== -1 && (opts.digitsOptional === !1 || maskset.validPositions[pos]) && opts.numericInput !== !0 && pos > radixPosition && !strict ? {
                                pos: pos,
                                remove: pos
                            } : {
                                pos: pos
                            };
                        }
                        return isValid;
                    },
                    cardinality: 1
                },
                "+": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        return !isValid && (strict && opts.allowMinus && chrs === opts.negationSymbol.front || opts.allowMinus && "-" === chrs || opts.allowPlus && "+" === chrs) && (isValid = !(!strict && "-" === chrs) || ("" !== opts.negationSymbol.back ? {
                            pos: pos,
                            c: "-" === chrs ? opts.negationSymbol.front : "+",
                            caret: pos + 1,
                            insert: {
                                pos: maskset.buffer.length,
                                c: opts.negationSymbol.back
                            }
                        } : {
                            pos: pos,
                            c: "-" === chrs ? opts.negationSymbol.front : "+",
                            caret: pos + 1
                        })), isValid;
                    },
                    cardinality: 1,
                    placeholder: ""
                },
                "-": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        return !isValid && strict && opts.allowMinus && chrs === opts.negationSymbol.back && (isValid = !0),
                        isValid;
                    },
                    cardinality: 1,
                    placeholder: ""
                },
                ":": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        if (!isValid) {
                            var radix = "[" + Inputmask.escapeRegex(opts.radixPoint) + "]";
                            isValid = new RegExp(radix).test(chrs), isValid && maskset.validPositions[pos] && maskset.validPositions[pos].match.placeholder === opts.radixPoint && (isValid = {
                                caret: pos + 1
                            });
                        }
                        return isValid;
                    },
                    cardinality: 1,
                    placeholder: function(opts) {
                        return opts.radixPoint;
                    }
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                if ("" === unmaskedValue && opts.nullable === !0) return unmaskedValue;
                var processValue = maskedValue.replace(opts.prefix, "");
                return processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""),
                opts.unmaskAsNumber ? ("" !== opts.radixPoint && processValue.indexOf(opts.radixPoint) !== -1 && (processValue = processValue.replace(Inputmask.escapeRegex.call(this, opts.radixPoint), ".")),
                Number(processValue)) : processValue;
            },
            isComplete: function(buffer, opts) {
                var maskedValue = buffer.join(""), bufClone = buffer.slice();
                if (opts.postFormat(bufClone, 0, opts), bufClone.join("") !== maskedValue) return !1;
                var processValue = maskedValue.replace(opts.prefix, "");
                return processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""),
                "," === opts.radixPoint && (processValue = processValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".")),
                isFinite(processValue);
            },
            onBeforeMask: function(initialValue, opts) {
                if (opts.numericInput === !0 && (initialValue = initialValue.split("").reverse().join("")),
                "" !== opts.radixPoint && isFinite(initialValue)) {
                    var vs = initialValue.split("."), groupSize = "" !== opts.groupSeparator ? parseInt(opts.groupSize) : 0;
                    2 === vs.length && (vs[0].length > groupSize || vs[1].length > groupSize) && (initialValue = initialValue.toString().replace(".", opts.radixPoint));
                }
                var kommaMatches = initialValue.match(/,/g), dotMatches = initialValue.match(/\./g);
                if (dotMatches && kommaMatches ? dotMatches.length > kommaMatches.length ? (initialValue = initialValue.replace(/\./g, ""),
                initialValue = initialValue.replace(",", opts.radixPoint)) : kommaMatches.length > dotMatches.length ? (initialValue = initialValue.replace(/,/g, ""),
                initialValue = initialValue.replace(".", opts.radixPoint)) : initialValue = initialValue.indexOf(".") < initialValue.indexOf(",") ? initialValue.replace(/\./g, "") : initialValue = initialValue.replace(/,/g, "") : initialValue = initialValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""),
                0 === opts.digits && (initialValue.indexOf(".") !== -1 ? initialValue = initialValue.substring(0, initialValue.indexOf(".")) : initialValue.indexOf(",") !== -1 && (initialValue = initialValue.substring(0, initialValue.indexOf(",")))),
                "" !== opts.radixPoint && isFinite(opts.digits) && initialValue.indexOf(opts.radixPoint) !== -1) {
                    var valueParts = initialValue.split(opts.radixPoint), decPart = valueParts[1].match(new RegExp("\\d*"))[0];
                    if (parseInt(opts.digits) < decPart.toString().length) {
                        var digitsFactor = Math.pow(10, parseInt(opts.digits));
                        initialValue = initialValue.replace(Inputmask.escapeRegex(opts.radixPoint), "."),
                        initialValue = Math.round(parseFloat(initialValue) * digitsFactor) / digitsFactor,
                        initialValue = initialValue.toString().replace(".", opts.radixPoint);
                    }
                }
                return opts.numericInput === !0 && (initialValue = initialValue.split("").reverse().join("")),
                initialValue.toString();
            },
            canClearPosition: function(maskset, position, lvp, strict, opts) {
                var positionInput = maskset.validPositions[position].input, canClear = positionInput !== opts.radixPoint || null !== maskset.validPositions[position].match.fn && opts.decimalProtect === !1 || isFinite(positionInput) || position === lvp || positionInput === opts.groupSeparator || positionInput === opts.negationSymbol.front || positionInput === opts.negationSymbol.back;
                return canClear;
            },
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey) switch (e.keyCode) {
                  case Inputmask.keyCode.UP:
                    $input.val(parseFloat(this.inputmask.unmaskedvalue()) + parseInt(opts.step)), $input.trigger("setvalue");
                    break;

                  case Inputmask.keyCode.DOWN:
                    $input.val(parseFloat(this.inputmask.unmaskedvalue()) - parseInt(opts.step)), $input.trigger("setvalue");
                }
            }
        },
        currency: {
            prefix: "$ ",
            groupSeparator: ",",
            alias: "numeric",
            placeholder: "0",
            autoGroup: !0,
            digits: 2,
            digitsOptional: !1,
            clearMaskOnLostFocus: !1
        },
        decimal: {
            alias: "numeric"
        },
        integer: {
            alias: "numeric",
            digits: 0,
            radixPoint: ""
        },
        percentage: {
            alias: "numeric",
            digits: 2,
            radixPoint: ".",
            placeholder: "0",
            autoGroup: !1,
            min: 0,
            max: 100,
            suffix: " %",
            allowPlus: !1,
            allowMinus: !1
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    function maskSort(a, b) {
        var maska = (a.mask || a).replace(/#/g, "9").replace(/\)/, "9").replace(/[+()#-]/g, ""), maskb = (b.mask || b).replace(/#/g, "9").replace(/\)/, "9").replace(/[+()#-]/g, ""), maskas = (a.mask || a).split("#")[0], maskbs = (b.mask || b).split("#")[0];
        return 0 === maskbs.indexOf(maskas) ? -1 : 0 === maskas.indexOf(maskbs) ? 1 : maska.localeCompare(maskb);
    }
    var analyseMaskBase = Inputmask.prototype.analyseMask;
    return Inputmask.prototype.analyseMask = function(mask, opts) {
        function reduceVariations(masks, previousVariation, previousmaskGroup) {
            previousVariation = previousVariation || "", previousmaskGroup = previousmaskGroup || maskGroups,
            "" !== previousVariation && (previousmaskGroup[previousVariation] = {});
            for (var variation = "", maskGroup = previousmaskGroup[previousVariation] || previousmaskGroup, i = masks.length - 1; i >= 0; i--) mask = masks[i].mask || masks[i],
            variation = mask.substr(0, 1), maskGroup[variation] = maskGroup[variation] || [],
            maskGroup[variation].unshift(mask.substr(1)), masks.splice(i, 1);
            for (var ndx in maskGroup) maskGroup[ndx].length > 500 && reduceVariations(maskGroup[ndx].slice(), ndx, maskGroup);
        }
        function rebuild(maskGroup) {
            var mask = "", submasks = [];
            for (var ndx in maskGroup) $.isArray(maskGroup[ndx]) ? 1 === maskGroup[ndx].length ? submasks.push(ndx + maskGroup[ndx]) : submasks.push(ndx + opts.groupmarker.start + maskGroup[ndx].join(opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start) + opts.groupmarker.end) : submasks.push(ndx + rebuild(maskGroup[ndx]));
            return mask += 1 === submasks.length ? submasks[0] : opts.groupmarker.start + submasks.join(opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start) + opts.groupmarker.end;
        }
        var maskGroups = {};
        opts.phoneCodes && opts.phoneCodes.length > 1e3 && (mask = mask.substr(1, mask.length - 2),
        reduceVariations(mask.split(opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start)),
        mask = rebuild(maskGroups));
        var mt = analyseMaskBase.call(this, mask, opts);
        return mt;
    }, Inputmask.extendAliases({
        abstractphone: {
            groupmarker: {
                start: "<",
                end: ">"
            },
            countrycode: "",
            phoneCodes: [],
            mask: function(opts) {
                return opts.definitions = {
                    "#": opts.definitions[9]
                }, opts.phoneCodes.sort(maskSort);
            },
            keepStatic: !0,
            onBeforeMask: function(value, opts) {
                var processedValue = value.replace(/^0{1,2}/, "").replace(/[\s]/g, "");
                return (processedValue.indexOf(opts.countrycode) > 1 || processedValue.indexOf(opts.countrycode) === -1) && (processedValue = "+" + opts.countrycode + processedValue),
                processedValue;
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                return unmaskedValue;
            },
            inputmode: "tel"
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendAliases({
        Regex: {
            mask: "r",
            greedy: !1,
            repeat: "*",
            regex: null,
            regexTokens: null,
            tokenizer: /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
            quantifierFilter: /[0-9]+[^,]/,
            isComplete: function(buffer, opts) {
                return new RegExp(opts.regex).test(buffer.join(""));
            },
            definitions: {
                r: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        function RegexToken(isGroup, isQuantifier) {
                            this.matches = [], this.isGroup = isGroup || !1, this.isQuantifier = isQuantifier || !1,
                            this.quantifier = {
                                min: 1,
                                max: 1
                            }, this.repeaterPart = void 0;
                        }
                        function analyseRegex() {
                            var match, m, currentToken = new RegexToken(), opengroups = [];
                            for (opts.regexTokens = []; match = opts.tokenizer.exec(opts.regex); ) switch (m = match[0],
                            m.charAt(0)) {
                              case "(":
                                opengroups.push(new RegexToken((!0)));
                                break;

                              case ")":
                                groupToken = opengroups.pop(), opengroups.length > 0 ? opengroups[opengroups.length - 1].matches.push(groupToken) : currentToken.matches.push(groupToken);
                                break;

                              case "{":
                              case "+":
                              case "*":
                                var quantifierToken = new RegexToken((!1), (!0));
                                m = m.replace(/[{}]/g, "");
                                var mq = m.split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                                if (quantifierToken.quantifier = {
                                    min: mq0,
                                    max: mq1
                                }, opengroups.length > 0) {
                                    var matches = opengroups[opengroups.length - 1].matches;
                                    match = matches.pop(), match.isGroup || (groupToken = new RegexToken((!0)), groupToken.matches.push(match),
                                    match = groupToken), matches.push(match), matches.push(quantifierToken);
                                } else match = currentToken.matches.pop(), match.isGroup || (groupToken = new RegexToken((!0)),
                                groupToken.matches.push(match), match = groupToken), currentToken.matches.push(match),
                                currentToken.matches.push(quantifierToken);
                                break;

                              default:
                                opengroups.length > 0 ? opengroups[opengroups.length - 1].matches.push(m) : currentToken.matches.push(m);
                            }
                            currentToken.matches.length > 0 && opts.regexTokens.push(currentToken);
                        }
                        function validateRegexToken(token, fromGroup) {
                            var isvalid = !1;
                            fromGroup && (regexPart += "(", openGroupCount++);
                            for (var mndx = 0; mndx < token.matches.length; mndx++) {
                                var matchToken = token.matches[mndx];
                                if (matchToken.isGroup === !0) isvalid = validateRegexToken(matchToken, !0); else if (matchToken.isQuantifier === !0) {
                                    var crrntndx = $.inArray(matchToken, token.matches), matchGroup = token.matches[crrntndx - 1], regexPartBak = regexPart;
                                    if (isNaN(matchToken.quantifier.max)) {
                                        for (;matchToken.repeaterPart && matchToken.repeaterPart !== regexPart && matchToken.repeaterPart.length > regexPart.length && !(isvalid = validateRegexToken(matchGroup, !0)); ) ;
                                        isvalid = isvalid || validateRegexToken(matchGroup, !0), isvalid && (matchToken.repeaterPart = regexPart),
                                        regexPart = regexPartBak + matchToken.quantifier.max;
                                    } else {
                                        for (var i = 0, qm = matchToken.quantifier.max - 1; i < qm && !(isvalid = validateRegexToken(matchGroup, !0)); i++) ;
                                        regexPart = regexPartBak + "{" + matchToken.quantifier.min + "," + matchToken.quantifier.max + "}";
                                    }
                                } else if (void 0 !== matchToken.matches) for (var k = 0; k < matchToken.length && !(isvalid = validateRegexToken(matchToken[k], fromGroup)); k++) ; else {
                                    var testExp;
                                    if ("[" == matchToken.charAt(0)) {
                                        testExp = regexPart, testExp += matchToken;
                                        for (var j = 0; j < openGroupCount; j++) testExp += ")";
                                        var exp = new RegExp("^(" + testExp + ")$");
                                        isvalid = exp.test(bufferStr);
                                    } else for (var l = 0, tl = matchToken.length; l < tl; l++) if ("\\" !== matchToken.charAt(l)) {
                                        testExp = regexPart, testExp += matchToken.substr(0, l + 1), testExp = testExp.replace(/\|$/, "");
                                        for (var j = 0; j < openGroupCount; j++) testExp += ")";
                                        var exp = new RegExp("^(" + testExp + ")$");
                                        if (isvalid = exp.test(bufferStr)) break;
                                    }
                                    regexPart += matchToken;
                                }
                                if (isvalid) break;
                            }
                            return fromGroup && (regexPart += ")", openGroupCount--), isvalid;
                        }
                        var bufferStr, groupToken, cbuffer = maskset.buffer.slice(), regexPart = "", isValid = !1, openGroupCount = 0;
                        null === opts.regexTokens && analyseRegex(), cbuffer.splice(pos, 0, chrs), bufferStr = cbuffer.join("");
                        for (var i = 0; i < opts.regexTokens.length; i++) {
                            var regexToken = opts.regexTokens[i];
                            if (isValid = validateRegexToken(regexToken, regexToken.isGroup)) break;
                        }
                        return isValid;
                    },
                    cardinality: 1
                }
            }
        }
    }), Inputmask;
}(jQuery, Inputmask);
/**
 * angular-permission
 * Fully featured role and permission based access control for your angular applications
 * @version v5.2.1 - 2017-01-31
 * @link https://github.com/Narzerus/angular-permission
 * @author Rafael Vidaurre <narzerus@gmail.com> (http://www.rafaelvidaurre.com), Blazej Krysiak <blazej.krysiak@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (window, angular, undefined) {
  'use strict';

  /**
   * @namespace permission
   */

  $q.$inject = ['$delegate'];
  PermPermission.$inject = ['$q', '$injector', 'PermTransitionProperties'];
  PermRole.$inject = ['$q', '$injector', 'PermPermissionStore', 'PermTransitionProperties'];
  PermPermissionStore.$inject = ['PermPermission'];
  PermRoleStore.$inject = ['PermRole'];
  PermissionDirective.$inject = ['$log', '$injector', 'PermPermissionMap', 'PermPermissionStrategies'];
  PermAuthorization.$inject = ['$q'];
  PermPermissionMap.$inject = ['$q', '$log', '$injector', 'PermTransitionProperties', 'PermRoleStore', 'PermPermissionStore'];
  var permission = angular.module('permission', []);

  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
    module.exports = permission.name;
  }

  /**
   * Extends $q implementation by A+ *any* method
   * @name permission.$q
   *
   * @extends {angular.$q}
   *
   * @param $delegate {Object} Parent instance being extended
   */
  function $q($delegate) {
    'ngInject';

    $delegate.any = any;

    /**
     * Implementation of missing $q `any` method that wits for first resolution of provided promise set
     * @methodOf permission.$q
     *
     * @param promises {Array|promise} Single or set of promises
     *
     * @returns {Promise} Returns a single promise that will be rejected with an array/hash of values,
     *  each value corresponding to the promise at the same index/key in the `promises` array/hash.
     *  If any of the promises is resolved, this resulting promise will be returned
     *  with the same resolution value.
     */
    function any(promises) {
      var deferred = $delegate.defer(),
        counter = 0,
        results = angular.isArray(promises) ? [] : {};

      angular.forEach(promises, function (promise, key) {
        counter++;
        $delegate
          .when(promise)
          .then(function (value) {
            deferred.resolve(value);
          })
          .catch(function (reason) {
            results[key] = reason;
            if (!(--counter)) {
              deferred.reject(reason);
            }
          });
      });

      if (counter === 0) {
        deferred.reject(results);
      }

      return deferred.promise;
    }

    return $delegate;
  }

  angular
    .module('permission')
    .decorator('$q', $q);


  /**
   * Pre-defined available configurable behaviours of directive `permission`
   * @name permission.PermPermissionStrategies
   * @readonly
   *
   * @example
   * <div permission
   *      permission-except="'MANAGER'"
   *      permission-on-authorized="PermPermissionStrategies.renderContent"
   *      permission-on-unauthorized="PermPermissionStrategies.removeContent">
   * </div>
   *
   * @property enableElement {Function}
   * @property disableElement {Function}
   * @property showElement {Function}
   * @property hideElement {Function}
   */
  var PermPermissionStrategies = {
    enableElement: function ($element) {
      $element.removeAttr('disabled');
    },
    disableElement: function ($element) {
      $element.attr('disabled', 'disabled');
    },
    showElement: function ($element) {
      $element.removeClass('ng-hide');
    },
    hideElement: function ($element) {
      $element.addClass('ng-hide');
    }
  };

  angular
    .module('permission')
    .value('PermPermissionStrategies', PermPermissionStrategies)
    .value('PermissionStrategies', PermPermissionStrategies);


  /**
   * Helper object used for storing ui-router/ng-route transition parameters
   * @name permission.PermTransitionProperties
   *
   * @type {Object.<String,Object>}
   *
   * Transition properties for ui-router:
   * @property toState {Object} Target state object [ui-router]
   * @property toParams {Object} Target state params [ui-router]
   * @property fromState {Object} Source state object [ui-router]
   * @property fromParams {Object} Source state params [ui-router]
   * @property options {Object} Transition options [ui-router]
   *
   * Transition properties for ng-route:
   * @property current {Object} Current state properties [ng-route]
   * @property next {Object} Next state properties [ng-route]
   */
  var PermTransitionProperties = {};

  angular
    .module('permission')
    .value('PermTransitionProperties', PermTransitionProperties);

  /**
   * Interface responsible for managing and emitting events dependent on router implementation
   * @name permission.PermTransitionEvents
   */
  function PermTransitionEvents() {
    'ngInject';

    this.broadcastPermissionStartEvent = function () {
      throw new Error('Method broadcastPermissionStartEvent in PermTransitionEvents interface must be implemented');
    };

    this.broadcastPermissionAcceptedEvent = function () {
      throw new Error('Method broadcastPermissionAcceptedEvent in PermTransitionEvents interface must be implemented');
    };

    this.broadcastPermissionDeniedEvent = function () {
      throw new Error('Method broadcastPermissionDeniedEvent in PermTransitionEvents interface must be implemented');
    };
  }

  angular
    .module('permission')
    .service('PermTransitionEvents', PermTransitionEvents);


  /**
   * PermPermission definition factory
   * @function
   *
   * @param $q {Object} Angular promise implementation
   * @param $injector {Object} Dependency injection instance
   * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
   *
   * @return {Permission}
   */
  function PermPermission($q, $injector, PermTransitionProperties) {
    'ngInject';

    /**
     * PermPermission definition object constructor
     * @constructor Permission
     *
     * @param permissionName {String} Name repressing permission
     * @param validationFunction {Function} Function used to check if permission is valid
     */
    function Permission(permissionName, validationFunction) {
      validateConstructor(permissionName, validationFunction);

      this.permissionName = permissionName;
      this.validationFunction = annotateValidationFunction(validationFunction);
    }

    /**
     * Checks if permission is still valid
     * @methodOf permission.Permission
     *
     * @returns {Promise}
     */
    Permission.prototype.validatePermission = function () {
      var validationLocals = {
        permissionName: this.permissionName,
        transitionProperties: PermTransitionProperties
      };
      var validationResult = $injector.invoke(this.validationFunction, null, validationLocals);

      if (!angular.isFunction(validationResult.then)) {
        validationResult = wrapInPromise(validationResult, this.permissionName);
      }

      return validationResult;
    };

    /**
     * Converts a value into a promise, if the value is truthy it resolves it, otherwise it rejects it
     * @methodOf permission.Permission
     * @private
     *
     * @param result {Boolean} Function to be wrapped into promise
     * @param permissionName {String} Returned value in promise
     *
     * @return {Promise}
     */
    function wrapInPromise(result, permissionName) {
      if (result) {
        return $q.resolve(permissionName);
      }

      return $q.reject(permissionName);
    }

    /**
     * Checks if provided permission has accepted parameter types
     * @methodOf permission.Permission
     * @private
     *
     * @throws {TypeError}
     *
     * @param permissionName {String} Name repressing permission
     * @param validationFunction {Function} Function used to check if permission is valid
     */
    function validateConstructor(permissionName, validationFunction) {
      if (!angular.isString(permissionName)) {
        throw new TypeError('Parameter "permissionName" name must be String');
      }
      if (!angular.isFunction(validationFunction) && !angular.isArray(validationFunction)) {
        throw new TypeError('Parameter "validationFunction" must be Function or an injectable Function using explicit annotation');
      }
    }

    /**
     * Ensures the validation is injectable using explicit annotation.
     * Wraps a non-injectable function for backwards compatibility
     * @methodOf permission.Permission
     * @private
     *
     * @param validationFunction {Function} Function to wrap with injectable if needed
     *
     * @return {Function} Explicitly injectable function
     */
    function annotateValidationFunction(validationFunction) {
      if (!angular.isArray(validationFunction.$inject || validationFunction)) {
        // The function is not explicitly annotated, so assume using old-style parameters
        // and manually prepare for injection using our known old API parameters
        validationFunction = ['permissionName', 'transitionProperties', validationFunction];
      }

      return validationFunction;
    }

    return Permission;
  }

  angular
    .module('permission')
    .factory('PermPermission', PermPermission);

  /**
   * Role definition factory
   * @function
   *
   * @param $q {Object} Angular promise implementation
   * @param $injector {Object} Dependency injection instance
   * @param PermPermissionStore {permission.PermPermissionStore} Permission definition storage
   * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
   *
   * @return {Role}
   */
  function PermRole($q, $injector, PermPermissionStore, PermTransitionProperties) {
    'ngInject';

    /**
     * Role definition constructor
     * @constructor Role
     *
     * @param roleName {String} Name representing role
     * @param validationFunction {Function|Array<String>} Optional function used to validate if permissions are still
     *   valid or list of permission names representing role
     */
    function Role(roleName, validationFunction) {
      validateConstructor(roleName, validationFunction);

      this.roleName = roleName;
      this.validationFunction = annotateValidationFunction(validationFunction);
    }

    /**
     * Checks if role is still valid
     * @methodOf permission.Role
     *
     * @returns {Promise} $q.promise object
     */
    Role.prototype.validateRole = function () {
      var validationLocals = {
        roleName: this.roleName,
        transitionProperties: PermTransitionProperties
      };
      var validationResult = $injector.invoke(this.validationFunction, null, validationLocals);

      if (!angular.isFunction(validationResult.then)) {
        validationResult = wrapInPromise(validationResult, this.roleName);
      }

      return validationResult;
    };

    /**
     * Converts a value into a promise, if the value is truthy it resolves it, otherwise it rejects it
     * @methodOf permission.Role
     * @private
     *
     * @param result {Boolean} Function to be wrapped into promise
     * @param [roleName] {String} Returned value in promise
     *
     * @return {Promise}
     */
    function wrapInPromise(result, roleName) {
      if (result) {
        return $q.resolve(roleName);
      }

      return $q.reject(roleName);
    }

    /**
     * Checks if provided permission has accepted parameter types
     * @methodOf permission.Role
     * @private
     *
     * @throws {TypeError}
     *
     * @param roleName {String} Name representing role
     * @param validationFunction {Function|Array<String>} Optional function used to validate if permissions are still
     *   valid or list of permission names representing role
     */
    function validateConstructor(roleName, validationFunction) {
      if (!angular.isString(roleName)) {
        throw new TypeError('Parameter "roleName" name must be String');
      }

      if (!angular.isArray(validationFunction) && !angular.isFunction(validationFunction)) {
        throw new TypeError('Parameter "validationFunction" must be array or function');
      }
    }


    /**
     * Ensures the validation is injectable using explicit annotation.
     * Wraps a non-injectable function for backwards compatibility
     * @methodOf permission.Role
     * @private
     *
     * @param validationFunction {Function|Array} Function to wrap with injectable if needed
     *
     * @return {Function} Explicitly injectable function
     */
    function annotateValidationFunction(validationFunction) {
      // Test if the validation function is just an array of permission names
      if (angular.isArray(validationFunction) && !angular.isFunction(validationFunction[validationFunction.length - 1])) {
        validationFunction = preparePermissionEvaluation(validationFunction);
      } else if (!angular.isArray(validationFunction.$inject || validationFunction)) {
        // The function is not explicitly annotated, so assume using old-style parameters
        // and manually prepare for injection using our known old API parameters
        validationFunction = ['roleName', 'transitionProperties', validationFunction];
      }

      return validationFunction;
    }

    /**
     * Creates an injectable function that evaluates a set of permissions in place of a role validation function
     * @methodOf permission.Role
     * @private
     *
     * @param permissions {Array<String>} List of permissions to evaluate
     *
     * @return {Function}
     */
    function preparePermissionEvaluation(permissions) {
      return function () {
        var promises = permissions.map(function (permissionName) {
          if (PermPermissionStore.hasPermissionDefinition(permissionName)) {
            var permission = PermPermissionStore.getPermissionDefinition(permissionName);

            return permission.validatePermission();
          }

          return $q.reject(permissionName);
        });

        return $q.all(promises);
      };
    }

    return Role;
  }

  angular
    .module('permission')
    .factory('PermRole', PermRole);

  /**
   * Permission definition storage
   * @name permission.PermPermissionStore
   *
   * @param PermPermission {permission.PermPermission|Function}
   */
  function PermPermissionStore(PermPermission) {
    'ngInject';

    /**
     * @property permissionStore
     *
     * @type {Object}
     */
    var permissionStore = {};

    this.definePermission = definePermission;
    this.defineManyPermissions = defineManyPermissions;
    this.removePermissionDefinition = removePermissionDefinition;
    this.hasPermissionDefinition = hasPermissionDefinition;
    this.getPermissionDefinition = getPermissionDefinition;
    this.getStore = getStore;
    this.clearStore = clearStore;

    /**
     * Allows to define permission on application configuration
     * @methodOf permission.PermPermissionStore
     *
     * @param permissionName {String} Name of defined permission
     * @param validationFunction {Function} Function used to validate if permission is valid
     */
    function definePermission(permissionName, validationFunction) {
      permissionStore[permissionName] = new PermPermission(permissionName, validationFunction);
    }

    /**
     * Allows to define set of permissionNames with shared validation function on application configuration
     * @methodOf permission.PermPermissionStore
     * @throws {TypeError}
     *
     * @param permissionNames {Array<Number>} Set of permission names
     * @param validationFunction {Function} Function used to validate if permission is valid
     */
    function defineManyPermissions(permissionNames, validationFunction) {
      if (!angular.isArray(permissionNames)) {
        throw new TypeError('Parameter "permissionNames" name must be Array');
      }

      angular.forEach(permissionNames, function (permissionName) {
        definePermission(permissionName, validationFunction);
      });
    }

    /**
     * Deletes permission
     * @methodOf permission.PermPermissionStore
     *
     * @param permissionName {String} Name of defined permission
     */
    function removePermissionDefinition(permissionName) {
      delete permissionStore[permissionName];
    }

    /**
     * Checks if permission exists
     * @methodOf permission.PermPermissionStore
     *
     * @param permissionName {String} Name of defined permission
     * @returns {Boolean}
     */
    function hasPermissionDefinition(permissionName) {
      return angular.isDefined(permissionStore[permissionName]);
    }

    /**
     * Returns permission by it's name
     * @methodOf permission.PermPermissionStore
     *
     * @returns {permission.Permission} Permissions definition object
     */
    function getPermissionDefinition(permissionName) {
      return permissionStore[permissionName];
    }

    /**
     * Returns all permissions
     * @methodOf permission.PermPermissionStore
     *
     * @returns {Object} Permissions collection
     */
    function getStore() {
      return permissionStore;
    }

    /**
     * Removes all permissions
     * @methodOf permission.PermPermissionStore
     */
    function clearStore() {
      permissionStore = {};
    }
  }

  angular
    .module('permission')
    .service('PermPermissionStore', PermPermissionStore);


  /**
   * Role definition storage
   * @name permission.PermRoleStore
   *
   * @param PermRole {permission.PermRole} Role definition constructor
   */
  function PermRoleStore(PermRole) {
    'ngInject';

    var roleStore = {};

    this.defineRole = defineRole;
    this.defineManyRoles = defineManyRoles;
    this.getRoleDefinition = getRoleDefinition;
    this.hasRoleDefinition = hasRoleDefinition;
    this.removeRoleDefinition = removeRoleDefinition;
    this.getStore = getStore;
    this.clearStore = clearStore;

    /**
     * Allows to add single role definition to the store by providing it's name and validation function
     * @methodOf permission.PermRoleStore
     *
     * @param roleName {String} Name of defined role
     * @param [validationFunction] {Function|Array<String>} Function used to validate if role is valid or set of
     *   permission names that has to be owned to have a role
     */
    function defineRole(roleName, validationFunction) {
      roleStore[roleName] = new PermRole(roleName, validationFunction);
    }

    /**
     * Allows to define set of roleNames with shared validation function
     * @methodOf permission.PermPermissionStore
     * @throws {TypeError}
     *
     * @param roleMap {String, Function|Array<String>} Map of roles with matching validators
     */
    function defineManyRoles(roleMap) {
      if (!angular.isObject(roleMap)) {
        throw new TypeError('Parameter "roleNames" name must be object');
      }

      angular.forEach(roleMap, function (validationFunction, roleName) {
        defineRole(roleName, validationFunction);
      });
    }

    /**
     * Deletes role from store
     * @method permission.PermRoleStore
     *
     * @param roleName {String} Name of defined permission
     */
    function removeRoleDefinition(roleName) {
      delete roleStore[roleName];
    }

    /**
     * Checks if role is defined in store
     * @method permission.PermRoleStore
     *
     * @param roleName {String} Name of role
     * @returns {Boolean}
     */
    function hasRoleDefinition(roleName) {
      return angular.isDefined(roleStore[roleName]);
    }

    /**
     * Returns role definition object by it's name
     * @method permission.PermRoleStore
     *
     * @returns {permission.PermRole} PermRole definition object
     */
    function getRoleDefinition(roleName) {
      return roleStore[roleName];
    }

    /**
     * Returns all role definitions
     * @method permission.PermRoleStore
     *
     * @returns {Object} Defined roles collection
     */
    function getStore() {
      return roleStore;
    }

    /**
     * Removes all role definitions
     * @method permission.PermRoleStore
     */
    function clearStore() {
      roleStore = {};
    }
  }

  angular
    .module('permission')
    .service('PermRoleStore', PermRoleStore);

  /**
   * Handles authorization based on provided permissions/roles.
   * @name permission.permissionDirective
   *
   * Directive accepts single or combined attributes `permission-only` and `permission-except` that checks on
   * DOM rendering if permissions/roles are met. Attributes can be passed either as String, Array or variable from
   * parent scope. Directive also will watch for changes if applied and automatically update the view.
   *
   * @example
   * <div permission
   *      permission-only="'USER'">
   * </div>
   * <div permission
   *      permission-only="['USER','ADMIN']"
   *      permission-except="'MANAGER'">
   * </div>
   * <div permission permission-sref="'app.login'"></div>
   *
   * By default directive will show/hide elements if provided permissions matches.
   * You can override this behaviour by passing `permission-on-authorized` and `permission-on-unauthorized`
   *   attributes that will pass to your function `$element` as argument that you can freely manipulate your DOM
   *   behaviour.
   *
   * Important! Function should be as references - `vm.disableElement` not `vm.disableElement()` to be able to
   *   accept passed $element reference from inside of permissionDirective
   *
   * @example
   * <div permission
   *      permission-only="['USER','ADMIN']"
   *      permission-on-authorized="PermPermissionStrategies.disableElement"
   *      permission-on-unauthorized="PermPermissionStrategies.enableElement">
   * </div>
   *
   * @param $log {Object} Logging service
   * @param $injector {Object} Injector instance object
   * @param PermPermissionMap {permission.permPermissionMap|Function} Map of state access rights
   * @param PermPermissionStrategies {permission.permPermissionStrategies} Set of pre-defined directive behaviours
   *
   * @returns {{
   *   restrict: string,
   *   bindToController: {
   *     sref: string
   *     only: string,
   *     except: string,
   *     onAuthorized: function,
   *     onUnauthorized: function
   *   },
   *   controllerAs: string,
   *   controller: controller
   * }} Directive instance
   */
  function PermissionDirective($log, $injector, PermPermissionMap, PermPermissionStrategies) {
    'ngInject';

    return {
      restrict: 'A',
      bindToController: {
        sref: '=?permissionSref',
        only: '=?permissionOnly',
        except: '=?permissionExcept',
        onAuthorized: '&?permissionOnAuthorized',
        onUnauthorized: '&?permissionOnUnauthorized'
      },
      controllerAs: 'permission',
      controller: ['$scope', '$element', function ($scope, $element) {
        var permission = this;

        $scope.$watchGroup(['permission.only', 'permission.except', 'sref'],
          function () {
            try {
              if (isSrefStateDefined()) {
                var PermStateAuthorization = $injector.get('PermStateAuthorization');

                PermStateAuthorization
                  .authorizeByStateName(permission.sref)
                  .then(function () {
                    onAuthorizedAccess();
                  })
                  .catch(function () {
                    onUnauthorizedAccess();
                  });
              } else {
                var PermAuthorization = $injector.get('PermAuthorization');
                var permissionMap = new PermPermissionMap({
                  only: permission.only,
                  except: permission.except
                });

                PermAuthorization
                  .authorizeByPermissionMap(permissionMap)
                  .then(function () {
                    onAuthorizedAccess();
                  })
                  .catch(function () {
                    onUnauthorizedAccess();
                  });
              }
            } catch (e) {
              onUnauthorizedAccess();
              $log.error(e.message);
            }
          });

        /**
         * Returns true when permissions should be checked based on state name
         * @private
         *
         * @returns {boolean}
         */
        function isSrefStateDefined() {
          return $injector.has('$state') && permission.sref;
        }

        /**
         * Calls `onAuthorized` function if provided or show element
         * @private
         */
        function onAuthorizedAccess() {
          if (angular.isFunction(permission.onAuthorized)) {
            permission.onAuthorized()($element);
          } else {
            PermPermissionStrategies.showElement($element);
          }
        }

        /**
         * Calls `onUnauthorized` function if provided or hide element
         * @private
         */
        function onUnauthorizedAccess() {
          if (angular.isFunction(permission.onUnauthorized)) {
            permission.onUnauthorized()($element);
          } else {
            PermPermissionStrategies.hideElement($element);
          }
        }
      }]
    };
  }

  angular
    .module('permission')
    .directive('permission', PermissionDirective);


  /**
   * Service responsible for handling view based authorization
   * @name permission.PermAuthorization
   *
   * @param $q {Object} Angular promise implementation
   */
  function PermAuthorization($q) {
    'ngInject';

    this.authorizeByPermissionMap = authorizeByPermissionMap;

    /**
     * Handles authorization based on provided permissions map
     * @methodOf permission.PermAuthorization
     *
     * @param map {permission.PermissionMap} Map of permission names
     *
     * @returns {promise} $q.promise object
     */
    function authorizeByPermissionMap(map) {
      var deferred = $q.defer();

      resolveExceptPrivilegeMap(deferred, map);

      return deferred.promise;
    }

    /**
     * Resolves flat set of "except" privileges
     * @methodOf permission.PermAuthorization
     * @private
     *
     * @param deferred {Object} Promise defer
     * @param map {permission.PermissionMap} Access rights map
     *
     */
    function resolveExceptPrivilegeMap(deferred, map) {
      var exceptPromises = map.resolvePropertyValidity(map.except);

      $q.any(exceptPromises)
        .then(function (rejectedPermissions) {
          deferred.reject(rejectedPermissions);
        })
        .catch(function () {
          resolveOnlyPermissionMap(deferred, map);
        });
    }

    /**
     * Resolves flat set of "only" privileges
     * @methodOf permission.PermAuthorization
     * @private
     *
     * @param deferred {Object} Promise defer
     * @param map {permission.PermissionMap} Access rights map
     */
    function resolveOnlyPermissionMap(deferred, map) {
      if (!map.only.length) {
        deferred.resolve();
        return;
      }

      var onlyPromises = map.resolvePropertyValidity(map.only);
      $q.any(onlyPromises)
        .then(function (resolvedPermissions) {
          deferred.resolve(resolvedPermissions);
        })
        .catch(function (rejectedPermission) {
          deferred.reject(rejectedPermission);
        });
    }
  }

  angular
    .module('permission')
    .service('PermAuthorization', PermAuthorization);


  /**
   * Access rights map factory
   * @name permission.PermPermissionMap
   *
   * @param $q {Object} Angular promise implementation
   * @param $log {Object} Angular logging utility
   * @param $injector {Object} Dependency injection instance
   * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
   * @param PermRoleStore {permission.PermRoleStore} Role definition storage
   * @param PermPermissionStore {permission.PermPermissionStore} Permission definition storage
   *
   * @return {permission.PermissionMap}
   */
  function PermPermissionMap($q, $log, $injector, PermTransitionProperties, PermRoleStore, PermPermissionStore) {
    'ngInject';

    /**
     * Constructs map object instructing authorization service how to handle authorizing
     * @constructor permission.PermissionMap
     *
     * @param [permissionMap] {Object} Map of permissions provided to authorization service
     * @param [permissionMap.only] {String|Array|Function} List of exclusive access right names allowed for
     *   authorization
     * @param [permissionMap.except] {String|Array|Function} List of exclusive access right names denied for
     *   authorization
     * @param [permissionMap.redirectTo] {String|Function|Object|promise} Handling redirection when rejected
     *   authorization
     */
    function PermissionMap(permissionMap) {
      // Suppress not defined object errors
      permissionMap = permissionMap || {};

      this.only = normalizeOnlyAndExceptProperty(permissionMap.only);
      this.except = normalizeOnlyAndExceptProperty(permissionMap.except);
      this.redirectTo = normalizeRedirectToProperty(permissionMap.redirectTo);
    }

    /**
     * Redirects to fallback states when permissions fail
     * @methodOf permission.PermissionMap
     *
     * @param [rejectedPermissionName] {String} Permission name
     *
     * @return {Promise}
     */
    PermissionMap.prototype.resolveRedirectState = function (rejectedPermissionName) {

      // If redirectTo definition is not found stay where you are
      if (!angular.isDefined(this.redirectTo)) {
        return $q.reject();
      }

      var redirectState = this.redirectTo[rejectedPermissionName] || this.redirectTo['default'];

      return resolveRedirectState(redirectState, rejectedPermissionName);
    };

    /**
     * Resolves weather permissions set for "only" or "except" property are valid
     * @methodOf permission.PermissionMap
     *
     * @param property {Array} "only" or "except" map property
     *
     * @return {Array<Promise>}
     */
    PermissionMap.prototype.resolvePropertyValidity = function (property) {

      return property.map(function (privilegeName) {
        if (PermRoleStore.hasRoleDefinition(privilegeName)) {
          var role = PermRoleStore.getRoleDefinition(privilegeName);
          return role.validateRole();
        }

        if (PermPermissionStore.hasPermissionDefinition(privilegeName)) {
          var permission = PermPermissionStore.getPermissionDefinition(privilegeName);
          return permission.validatePermission();
        }

        $log.warn('Permission or role ' + privilegeName + ' was not defined.');
        return $q.reject(privilegeName);
      });
    };

    /**
     * Handles function based redirection for rejected permissions
     * @methodOf permission.PermissionMap
     *
     * @throws {TypeError}
     *
     * @param redirectFunction {Function} Redirection function
     * @param rejectedPermissionName {String} Rejected permission
     *
     * @return {Promise}
     */
    function resolveRedirectState(redirectFunction, rejectedPermissionName) {
      return $q
        .when($injector.invoke(redirectFunction, null, {
          rejectedPermission: rejectedPermissionName,
          transitionProperties: PermTransitionProperties
        }))
        .then(function (redirectState) {
          if (angular.isString(redirectState)) {
            return {
              state: redirectState
            };
          }

          if (angular.isObject(redirectState)) {
            return redirectState;
          }

          return $q.reject();
        });
    }

    /**
     * Handles extraction of permission map "only" and "except" properties and converts them into array objects
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param property {String|Array|Function} PermPermission map property "only" or "except"
     *
     * @returns {Array<String>} Array of permission "only" or "except" names
     */
    function normalizeOnlyAndExceptProperty(property) {
      if (angular.isString(property)) {
        return [property];
      }

      if (angular.isArray(property)) {
        return property;
      }

      if (angular.isFunction(property)) {
        return property.call(null, PermTransitionProperties);
      }

      return [];
    }

    /**
     * Convert user provided input into key value dictionary with permission/role name as a key and injectable resolver
     * function as a value
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param redirectTo {String|Function|Array|Object} PermPermission map property "redirectTo"
     *
     * @returns {Object<String, Object>} Redirection dictionary object
     */
    function normalizeRedirectToProperty(redirectTo) {
      if (!angular.isDefined(redirectTo)) {
        return;
      }

      if (isInjectable(redirectTo) || angular.isFunction(redirectTo)) {
        return normalizeFunctionRedirectionRule(redirectTo);
      }

      if (angular.isObject(redirectTo)) {
        if (isObjectSingleRedirectionRule(redirectTo)) {
          return normalizeObjectSingleRedirectionRule(redirectTo);
        }

        return normalizeObjectMultipleRedirectionRule(redirectTo);
      }

      if (angular.isString(redirectTo)) {
        return normalizeStringRedirectionRule(redirectTo);
      }

      throw new ReferenceError('Property "redirectTo" must be String, Function, Array or Object');
    }

    /**
     * Convert string redirection rule into single-element redirection dictionary
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param redirectTo {String} PermPermission map property "redirectTo"
     *
     * @returns {Object<String, Object>} Redirection dictionary object
     */
    function normalizeStringRedirectionRule(redirectTo) {
      var redirectionMap = {};

      redirectionMap.default = function () {
        return {
          state: redirectTo
        };
      };
      redirectionMap.default.$inject = ['rejectedPermission', 'transitionProperties'];

      return redirectionMap;
    }

    /**
     * Checks if redirection object is single rule type
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param redirectTo {Object} PermPermission map property "redirectTo"
     *
     * @returns {boolean}
     */
    function isObjectSingleRedirectionRule(redirectTo) {
      return angular.isDefined(redirectTo.state);
    }

    /**
     * Convert single redirection rule object into single-element redirection dictionary
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param redirectTo {Object} PermPermission map property "redirectTo"
     *
     * @returns {Object<String, Object>} Redirection dictionary object
     */
    function normalizeObjectSingleRedirectionRule(redirectTo) {
      var redirectionMap = {};

      redirectionMap.default = function () {
        return redirectTo;
      };

      return redirectionMap;
    }

    /**
     * Convert multiple redirection rule object into redirection dictionary
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param redirectTo {Object} PermPermission map property "redirectTo"
     *
     * @returns {Object<String, Object>} Redirection dictionary object
     */
    function normalizeObjectMultipleRedirectionRule(redirectTo) {
      var redirectionMap = {};

      angular.forEach(redirectTo, function (redirection, permission) {
        if (isInjectable(redirection)) {
          redirectionMap[permission] = redirection;
        } else {
          if (angular.isFunction(redirection)) {
            redirectionMap[permission] = redirection;
            redirectionMap[permission].$inject = [];
          }
        }

        if (angular.isObject(redirection)) {
          redirectionMap[permission] = function () {
            return redirection;
          };
          redirectionMap[permission].$inject = [];
        }

        if (angular.isString(redirection)) {
          redirectionMap[permission] = function () {
            return {
              state: redirection
            };
          };
          redirectionMap[permission].$inject = [];
        }
      });

      return redirectionMap;
    }

    /**
     * Checks if property is injectable
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param property {Array|Object}
     *
     * @returns {boolean}
     */
    function isInjectable(property) {
      return angular.isArray(property) || (angular.isFunction(property) && angular.isArray(property.$inject));
    }

    /**
     * Convert function redirection rule into redirection dictionary
     * @methodOf permission.PermissionMap
     * @private
     *
     * @param redirectTo {Function} PermPermission map property "redirectTo"
     *
     * @returns {Object<String, Object>} Redirection dictionary object
     */
    function normalizeFunctionRedirectionRule(redirectTo) {
      var redirectionMap = {};

      redirectionMap.default = redirectTo;

      if (!angular.isDefined(redirectTo.$inject)) {
        redirectionMap.default.$inject = ['rejectedPermission', 'transitionProperties'];
      }

      return redirectionMap;
    }

    return PermissionMap;
  }

  angular
    .module('permission')
    .factory('PermPermissionMap', PermPermissionMap);

}(window, window.angular));

/* =========================================================
 * bootstrap-datetimepicker.js
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
 * Improvements by Sébastien Malot
 * Improvements by Yun Lai
 * Project URL : http://www.malot.fr/bootstrap-datetimepicker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

/*
 * Improvement by CuGBabyBeaR @ 2013-09-12
 *
 * Make it work in bootstrap v3
 */

!function ($) {

	function UTCDate() {
		return new Date(Date.UTC.apply(Date, arguments));
	}

	function UTCToday() {
		var today = new Date();
		return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), 0);
	}

	// Picker object

	var Datetimepicker = function (element, options) {
		var that = this;

		this.element = $(element);

		this.language = options.language || this.element.data('date-language') || "en";
		this.language = this.language in dates ? this.language : "en";
		this.isRTL = dates[this.language].rtl || false;
		this.formatType = options.formatType || this.element.data('format-type') || 'standard';
		this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || dates[this.language].format || DPGlobal.getDefaultFormat(this.formatType, 'input'), this.formatType);
		this.isInline = false;
		this.isVisible = false;
		this.isInput = this.element.is('input');

		this.bootcssVer = this.isInput ? (this.element.is('.form-control') ? 3 : 2) : ( this.bootcssVer = this.element.is('.input-group') ? 3 : 2 );

		this.component = this.element.is('.date') ? ( this.bootcssVer == 3 ? this.element.find('.input-group-addon .glyphicon-th, .input-group-addon .glyphicon-time, .input-group-addon .glyphicon-calendar').parent() : this.element.find('.add-on .icon-th, .add-on .icon-time, .add-on .icon-calendar').parent()) : false;
		this.componentReset = this.element.is('.date') ? ( this.bootcssVer == 3 ? this.element.find('.input-group-addon .glyphicon-remove').parent() : this.element.find('.add-on .icon-remove').parent()) : false;
		this.hasInput = this.component && this.element.find('input').length;
		if (this.component && this.component.length === 0) {
			this.component = false;
		}
		this.linkField = options.linkField || this.element.data('link-field') || false;
		this.linkFormat = DPGlobal.parseFormat(options.linkFormat || this.element.data('link-format') || DPGlobal.getDefaultFormat(this.formatType, 'link'), this.formatType);
		this.minuteStep = options.minuteStep || this.element.data('minute-step') || 5;
		this.pickerPosition = options.pickerPosition || this.element.data('picker-position') || 'bottom-right';
		this.showMeridian = options.showMeridian || this.element.data('show-meridian') || false;
		this.initialDate = options.initialDate || new Date();

		this._attachEvents();

		this.formatViewType = "datetime";
		if ('formatViewType' in options) {
			this.formatViewType = options.formatViewType;
		} else if ('formatViewType' in this.element.data()) {
			this.formatViewType = this.element.data('formatViewType');
		}

		this.minView = 0;
		if ('minView' in options) {
			this.minView = options.minView;
		} else if ('minView' in this.element.data()) {
			this.minView = this.element.data('min-view');
		}
		this.minView = DPGlobal.convertViewMode(this.minView);

		this.maxView = DPGlobal.modes.length - 1;
		if ('maxView' in options) {
			this.maxView = options.maxView;
		} else if ('maxView' in this.element.data()) {
			this.maxView = this.element.data('max-view');
		}
		this.maxView = DPGlobal.convertViewMode(this.maxView);

		this.wheelViewModeNavigation = false;
		if ('wheelViewModeNavigation' in options) {
			this.wheelViewModeNavigation = options.wheelViewModeNavigation;
		} else if ('wheelViewModeNavigation' in this.element.data()) {
			this.wheelViewModeNavigation = this.element.data('view-mode-wheel-navigation');
		}

		this.wheelViewModeNavigationInverseDirection = false;

		if ('wheelViewModeNavigationInverseDirection' in options) {
			this.wheelViewModeNavigationInverseDirection = options.wheelViewModeNavigationInverseDirection;
		} else if ('wheelViewModeNavigationInverseDirection' in this.element.data()) {
			this.wheelViewModeNavigationInverseDirection = this.element.data('view-mode-wheel-navigation-inverse-dir');
		}

		this.wheelViewModeNavigationDelay = 100;
		if ('wheelViewModeNavigationDelay' in options) {
			this.wheelViewModeNavigationDelay = options.wheelViewModeNavigationDelay;
		} else if ('wheelViewModeNavigationDelay' in this.element.data()) {
			this.wheelViewModeNavigationDelay = this.element.data('view-mode-wheel-navigation-delay');
		}

		this.startViewMode = 2;
		if ('startView' in options) {
			this.startViewMode = options.startView;
		} else if ('startView' in this.element.data()) {
			this.startViewMode = this.element.data('start-view');
		}
		this.startViewMode = DPGlobal.convertViewMode(this.startViewMode);
		this.viewMode = this.startViewMode;

		this.viewSelect = this.minView;
		if ('viewSelect' in options) {
			this.viewSelect = options.viewSelect;
		} else if ('viewSelect' in this.element.data()) {
			this.viewSelect = this.element.data('view-select');
		}
		this.viewSelect = DPGlobal.convertViewMode(this.viewSelect);

		this.forceParse = true;
		if ('forceParse' in options) {
			this.forceParse = options.forceParse;
		} else if ('dateForceParse' in this.element.data()) {
			this.forceParse = this.element.data('date-force-parse');
		}

		this.picker = $((this.bootcssVer == 3) ? DPGlobal.templateV3 : DPGlobal.template)
			.appendTo(this.isInline ? this.element : 'body')
			.on({
				click:     $.proxy(this.click, this),
				mousedown: $.proxy(this.mousedown, this)
			});

		if (this.wheelViewModeNavigation) {
			if ($.fn.mousewheel) {
				this.picker.on({mousewheel: $.proxy(this.mousewheel, this)});
			} else {
				console.log("Mouse Wheel event is not supported. Please include the jQuery Mouse Wheel plugin before enabling this option");
			}
		}

		if (this.isInline) {
			this.picker.addClass('datetimepicker-inline');
		} else {
			this.picker.addClass('datetimepicker-dropdown-' + this.pickerPosition + ' dropdown-menu');
		}
		if (this.isRTL) {
			this.picker.addClass('datetimepicker-rtl');
			if (this.bootcssVer == 3) {
				this.picker.find('.prev span, .next span')
					.toggleClass('glyphicon-arrow-left glyphicon-arrow-right');
			} else {
				this.picker.find('.prev i, .next i')
					.toggleClass('icon-arrow-left icon-arrow-right');
			}
		}
		$(document).on('mousedown', function (e) {
			// Clicked outside the datetimepicker, hide it
			if ($(e.target).closest('.datetimepicker').length === 0) {
				that.hide();
			}
		});

		this.autoclose = false;
		if ('autoclose' in options) {
			this.autoclose = options.autoclose;
		} else if ('dateAutoclose' in this.element.data()) {
			this.autoclose = this.element.data('date-autoclose');
		}

		this.keyboardNavigation = true;
		if ('keyboardNavigation' in options) {
			this.keyboardNavigation = options.keyboardNavigation;
		} else if ('dateKeyboardNavigation' in this.element.data()) {
			this.keyboardNavigation = this.element.data('date-keyboard-navigation');
		}

		this.todayBtn = (options.todayBtn || this.element.data('date-today-btn') || false);
		this.todayHighlight = (options.todayHighlight || this.element.data('date-today-highlight') || false);

		this.weekStart = ((options.weekStart || this.element.data('date-weekstart') || dates[this.language].weekStart || 0) % 7);
		this.weekEnd = ((this.weekStart + 6) % 7);
		this.startDate = -Infinity;
		this.endDate = Infinity;
		this.daysOfWeekDisabled = [];
		this.setStartDate(options.startDate || this.element.data('date-startdate'));
		this.setEndDate(options.endDate || this.element.data('date-enddate'));
		this.setDaysOfWeekDisabled(options.daysOfWeekDisabled || this.element.data('date-days-of-week-disabled'));
		this.fillDow();
		this.fillMonths();
		this.update();
		this.showMode();

		if (this.isInline) {
			this.show();
		}

		// 添加清除事件
		this.picker.find('tfoot th.date-clear').on({
			click:     $.proxy(this.reset, this)
		});
	};

	Datetimepicker.prototype = {
		constructor: Datetimepicker,

		_events:       [],
		_attachEvents: function () {
			this._detachEvents();
			if (this.isInput) { // single input
				this._events = [
					[this.element, {
						focus:   $.proxy(this.show, this),
						keyup:   $.proxy(this.update, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			else if (this.component && this.hasInput) { // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus:   $.proxy(this.show, this),
						keyup:   $.proxy(this.update, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
				if (this.componentReset) {
					this._events.push([
						this.componentReset,
						{click: $.proxy(this.reset, this)}
					]);
				}
			}
			else if (this.element.is('div')) {  // inline datetimepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			for (var i = 0, el, ev; i < this._events.length; i++) {
				el = this._events[i][0];
				ev = this._events[i][1];
				el.on(ev);
			}
		},

		_detachEvents: function () {
			for (var i = 0, el, ev; i < this._events.length; i++) {
				el = this._events[i][0];
				ev = this._events[i][1];
				el.off(ev);
			}
			this._events = [];
		},

		show: function (e) {
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			if (this.forceParse) {
				this.update();
			}
			this.place();
			$(window).on('resize', $.proxy(this.place, this));
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}
			this.isVisible = true;
			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},

		hide: function (e) {
			if (!this.isVisible) return;
			if (this.isInline) return;
			this.picker.hide();
			$(window).off('resize', this.place);
			this.viewMode = this.startViewMode;
			this.showMode();
			if (!this.isInput) {
				$(document).off('mousedown', this.hide);
			}

			if (
				this.forceParse &&
					(
						this.isInput && this.element.val() ||
							this.hasInput && this.element.find('input').val()
						)
				)
				this.setValue();
			this.isVisible = false;
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
		},

		remove: function () {
			this._detachEvents();
			this.picker.remove();
			delete this.picker;
			delete this.element.data().datetimepicker;
		},

		getDate: function () {
			var d = this.getUTCDate();
			return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
		},

		getUTCDate: function () {
			return this.date;
		},

		setDate: function (d) {
			this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
		},

		setUTCDate: function (d) {
			if (d >= this.startDate && d <= this.endDate) {
				this.date = d;
				this.setValue();
				this.viewDate = this.date;
				this.fill();
			} else {
				this.element.trigger({
					type:      'outOfRange',
					date:      d,
					startDate: this.startDate,
					endDate:   this.endDate
				});
			}
		},

		setFormat: function (format) {
			this.format = DPGlobal.parseFormat(format, this.formatType);
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component) {
				element = this.element.find('input');
			}
			if (element && element.val()) {
				this.setValue();
			}
		},

		setValue: function () {
			var formatted = this.getFormattedDate();
			if (!this.isInput) {
				if (this.component) {
					this.element.find('input').val(formatted);
				}
				this.element.data('date', formatted);
			} else {
				this.element.val(formatted);
			}
			if (this.linkField) {
				$('#' + this.linkField).val(this.getFormattedDate(this.linkFormat));
			}
		},

		getFormattedDate: function (format) {
			if (format == undefined) format = this.format;
			return DPGlobal.formatDate(this.date, format, this.language, this.formatType);
		},

		setStartDate: function (startDate) {
			this.startDate = startDate || -Infinity;
			if (this.startDate !== -Infinity) {
				this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language, this.formatType);
			}
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function (endDate) {
			this.endDate = endDate || Infinity;
			if (this.endDate !== Infinity) {
				this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language, this.formatType);
			}
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
			this.daysOfWeekDisabled = daysOfWeekDisabled || [];
			if (!$.isArray(this.daysOfWeekDisabled)) {
				this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
			}
			this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, function (d) {
				return parseInt(d, 10);
			});
			this.update();
			this.updateNavArrows();
		},

		place: function () {
			if (this.isInline) return;

			var index_highest = 0;
			$('div').each(function () {
				var index_current = parseInt($(this).css("zIndex"), 10);
				if (index_current > index_highest) {
					index_highest = index_current;
				}
			});
			var zIndex = index_highest + 10;

			var offset, top, left;
			if (this.component) {
				offset = this.component.offset();
				left = offset.left;
				if (this.pickerPosition == 'bottom-left' || this.pickerPosition == 'top-left') {
					left += this.component.outerWidth() - this.picker.outerWidth();
				}
			} else {
				offset = this.element.offset();
				left = offset.left;
			}
			if (this.pickerPosition == 'top-left' || this.pickerPosition == 'top-right') {
				top = offset.top - this.picker.outerHeight();
			} else {
				top = offset.top + this.height;
			}
			this.picker.css({
				top:    top,
				left:   left,
				zIndex: zIndex
			});
		},

		update: function () {
			var date, fromArgs = false;
			if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
				date = arguments[0];
				fromArgs = true;
			} else {
				date = this.element.data('date') || (this.isInput ? this.element.val() : this.element.find('input').val()) || this.initialDate;
				if (typeof date == 'string' || date instanceof String) {
				  date = date.replace(/^\s+|\s+$/g,'');
				}
			}

			if (!date) {
				date = new Date();
				fromArgs = false;
			}

			this.date = DPGlobal.parseDate(date, this.format, this.language, this.formatType);

			if (fromArgs) this.setValue();

			if (this.date < this.startDate) {
				this.viewDate = new Date(this.startDate);
			} else if (this.date > this.endDate) {
				this.viewDate = new Date(this.endDate);
			} else {
				this.viewDate = new Date(this.date);
			}
			this.fill();
		},

		fillDow: function () {
			var dowCnt = this.weekStart,
				html = '<tr>';
			while (dowCnt < this.weekStart + 7) {
				html += '<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>';
			}
			html += '</tr>';
			this.picker.find('.datetimepicker-days thead').append(html);
		},

		fillMonths: function () {
			var html = '',
				i = 0;
			while (i < 12) {
				html += '<span class="month">' + dates[this.language].monthsShort[i++] + '</span>';
			}
			this.picker.find('.datetimepicker-months td').html(html);
		},

		fill: function () {
			if (this.date == null || this.viewDate == null) {
				return;
			}
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				dayMonth = d.getUTCDate(),
				hours = d.getUTCHours(),
				minutes = d.getUTCMinutes(),
				startYear = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity,
				endYear = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity,
				endMonth = this.endDate !== Infinity ? this.endDate.getUTCMonth() : Infinity,
				currentDate = (new UTCDate(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())).valueOf(),
				today = new Date();
			this.picker.find('.datetimepicker-days thead th:eq(1)')
				.text(dates[this.language].months[month] + ' ' + year);
			if (this.formatViewType == "time") {
				var hourConverted = hours % 12 ? hours % 12 : 12;
				var hoursDisplay = (hourConverted < 10 ? '0' : '') + hourConverted;
				var minutesDisplay = (minutes < 10 ? '0' : '') + minutes;
				var meridianDisplay = dates[this.language].meridiem[hours < 12 ? 0 : 1];
				this.picker.find('.datetimepicker-hours thead th:eq(1)')
					.text(hoursDisplay + ':' + minutesDisplay + ' ' + meridianDisplay.toUpperCase());
				this.picker.find('.datetimepicker-minutes thead th:eq(1)')
					.text(hoursDisplay + ':' + minutesDisplay + ' ' + meridianDisplay.toUpperCase());
			} else {
				this.picker.find('.datetimepicker-hours thead th:eq(1)')
					.text(dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
				this.picker.find('.datetimepicker-minutes thead th:eq(1)')
					.text(dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
			}
			this.picker.find('tfoot th.today')
				.text(dates[this.language].today)
				.toggle(this.todayBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			/*var prevMonth = UTCDate(year, month, 0,0,0,0,0);
			 prevMonth.setUTCDate(prevMonth.getDate() - (prevMonth.getUTCDay() - this.weekStart + 7)%7);*/
			var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getUTCDay() == this.weekStart) {
					html.push('<tr>');
				}
				clsName = '';
				if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() < month)) {
					clsName += ' old';
				} else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() > month)) {
					clsName += ' new';
				}
				// Compare internal UTC date with local today, not UTC today
				if (this.todayHighlight &&
					prevMonth.getUTCFullYear() == today.getFullYear() &&
					prevMonth.getUTCMonth() == today.getMonth() &&
					prevMonth.getUTCDate() == today.getDate()) {
					clsName += ' today';
				}
				if (prevMonth.valueOf() == currentDate) {
					clsName += ' active';
				}
				if ((prevMonth.valueOf() + 86400000) <= this.startDate || prevMonth.valueOf() > this.endDate ||
					$.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1) {
					clsName += ' disabled';
				}
				html.push('<td class="day' + clsName + '">' + prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() == this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
			}
			this.picker.find('.datetimepicker-days tbody').empty().append(html.join(''));

			html = [];
			var txt = '', meridian = '', meridianOld = '';
			for (var i = 0; i < 24; i++) {
				var actual = UTCDate(year, month, dayMonth, i);
				clsName = '';
				// We want the previous hour for the startDate
				if ((actual.valueOf() + 3600000) <= this.startDate || actual.valueOf() > this.endDate) {
					clsName += ' disabled';
				} else if (hours == i) {
					clsName += ' active';
				}
				if (this.showMeridian && dates[this.language].meridiem.length == 2) {
					meridian = (i < 12 ? dates[this.language].meridiem[0] : dates[this.language].meridiem[1]);
					if (meridian != meridianOld) {
						if (meridianOld != '') {
							html.push('</fieldset>');
						}
						html.push('<fieldset class="hour"><legend>' + meridian.toUpperCase() + '</legend>');
					}
					meridianOld = meridian;
					txt = (i % 12 ? i % 12 : 12);
					html.push('<span class="hour' + clsName + ' hour_' + (i < 12 ? 'am' : 'pm') + '">' + txt + '</span>');
					if (i == 23) {
						html.push('</fieldset>');
					}
				} else {
					txt = i + ':00';
					html.push('<span class="hour' + clsName + '">' + txt + '</span>');
				}
			}
			this.picker.find('.datetimepicker-hours td').html(html.join(''));

			html = [];
			txt = '', meridian = '', meridianOld = '';
			for (var i = 0; i < 60; i += this.minuteStep) {
				var actual = UTCDate(year, month, dayMonth, hours, i, 0);
				clsName = '';
				if (actual.valueOf() < this.startDate || actual.valueOf() > this.endDate) {
					clsName += ' disabled';
				} else if (Math.floor(minutes / this.minuteStep) == Math.floor(i / this.minuteStep)) {
					clsName += ' active';
				}
				if (this.showMeridian && dates[this.language].meridiem.length == 2) {
					meridian = (hours < 12 ? dates[this.language].meridiem[0] : dates[this.language].meridiem[1]);
					if (meridian != meridianOld) {
						if (meridianOld != '') {
							html.push('</fieldset>');
						}
						html.push('<fieldset class="minute"><legend>' + meridian.toUpperCase() + '</legend>');
					}
					meridianOld = meridian;
					txt = (hours % 12 ? hours % 12 : 12);
					//html.push('<span class="minute'+clsName+' minute_'+(hours<12?'am':'pm')+'">'+txt+'</span>');
					html.push('<span class="minute' + clsName + '">' + txt + ':' + (i < 10 ? '0' + i : i) + '</span>');
					if (i == 59) {
						html.push('</fieldset>');
					}
				} else {
					txt = i + ':00';
					//html.push('<span class="hour'+clsName+'">'+txt+'</span>');
					html.push('<span class="minute' + clsName + '">' + hours + ':' + (i < 10 ? '0' + i : i) + '</span>');
				}
			}
			this.picker.find('.datetimepicker-minutes td').html(html.join(''));

			var currentYear = this.date.getUTCFullYear();
			var months = this.picker.find('.datetimepicker-months')
				.find('th:eq(1)')
				.text(year)
				.end()
				.find('span').removeClass('active');
			if (currentYear == year) {
				months.eq(this.date.getUTCMonth()).addClass('active');
			}
			if (year < startYear || year > endYear) {
				months.addClass('disabled');
			}
			if (year == startYear) {
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year == endYear) {
				months.slice(endMonth + 1).addClass('disabled');
			}

			html = '';
			year = parseInt(year / 10, 10) * 10;
			var yearCont = this.picker.find('.datetimepicker-years')
				.find('th:eq(1)')
				.text(year + '-' + (year + 9))
				.end()
				.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year' + (i == -1 || i == 10 ? ' old' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
				year += 1;
			}
			yearCont.html(html);
			this.place();
		},

		updateNavArrows: function () {
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				day = d.getUTCDate(),
				hour = d.getUTCHours();
			switch (this.viewMode) {
				case 0:
					if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()
						&& month <= this.startDate.getUTCMonth()
						&& day <= this.startDate.getUTCDate()
						&& hour <= this.startDate.getUTCHours()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()
						&& month >= this.endDate.getUTCMonth()
						&& day >= this.endDate.getUTCDate()
						&& hour >= this.endDate.getUTCHours()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
					if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()
						&& month <= this.startDate.getUTCMonth()
						&& day <= this.startDate.getUTCDate()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()
						&& month >= this.endDate.getUTCMonth()
						&& day >= this.endDate.getUTCDate()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 2:
					if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()
						&& month <= this.startDate.getUTCMonth()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()
						&& month >= this.endDate.getUTCMonth()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 3:
				case 4:
					if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		mousewheel: function (e) {

			e.preventDefault();
			e.stopPropagation();

			if (this.wheelPause) {
				return;
			}

			this.wheelPause = true;

			var originalEvent = e.originalEvent;

			var delta = originalEvent.wheelDelta;

			var mode = delta > 0 ? 1 : (delta === 0) ? 0 : -1;

			if (this.wheelViewModeNavigationInverseDirection) {
				mode = -mode;
			}

			this.showMode(mode);

			setTimeout($.proxy(function () {

				this.wheelPause = false

			}, this), this.wheelViewModeNavigationDelay);

		},

		click: function (e) {
			e.stopPropagation();
			e.preventDefault();
			var target = $(e.target).closest('span, td, th, legend');
			if (target.length == 1) {
				if (target.is('.disabled')) {
					this.element.trigger({
						type:      'outOfRange',
						date:      this.viewDate,
						startDate: this.startDate,
						endDate:   this.endDate
					});
					return;
				}
				switch (target[0].nodeName.toLowerCase()) {
					case 'th':
						switch (target[0].className) {
							case 'switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
								switch (this.viewMode) {
									case 0:
										this.viewDate = this.moveHour(this.viewDate, dir);
										break;
									case 1:
										this.viewDate = this.moveDate(this.viewDate, dir);
										break;
									case 2:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										break;
									case 3:
									case 4:
										this.viewDate = this.moveYear(this.viewDate, dir);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);

								// Respect startDate and endDate.
								if (date < this.startDate) date = this.startDate;
								else if (date > this.endDate) date = this.endDate;

								this.viewMode = this.startViewMode;
								this.showMode(0);
								this._setDate(date);
								this.fill();
								if (this.autoclose) {
									this.hide();
								}
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled')) {
							var year = this.viewDate.getUTCFullYear(),
								month = this.viewDate.getUTCMonth(),
								day = this.viewDate.getUTCDate(),
								hours = this.viewDate.getUTCHours(),
								minutes = this.viewDate.getUTCMinutes(),
								seconds = this.viewDate.getUTCSeconds();

							if (target.is('.month')) {
								this.viewDate.setUTCDate(1);
								month = target.parent().find('span').index(target);
								day = this.viewDate.getUTCDate();
								this.viewDate.setUTCMonth(month);
								this.element.trigger({
									type: 'changeMonth',
									date: this.viewDate
								});
								if (this.viewSelect >= 3) {
									this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
								}
							} else if (target.is('.year')) {
								this.viewDate.setUTCDate(1);
								year = parseInt(target.text(), 10) || 0;
								this.viewDate.setUTCFullYear(year);
								this.element.trigger({
									type: 'changeYear',
									date: this.viewDate
								});
								if (this.viewSelect >= 4) {
									this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
								}
							} else if (target.is('.hour')) {
								hours = parseInt(target.text(), 10) || 0;
								if (target.hasClass('hour_am') || target.hasClass('hour_pm')) {
									if (hours == 12 && target.hasClass('hour_am')) {
										hours = 0;
									} else if (hours != 12 && target.hasClass('hour_pm')) {
										hours += 12;
									}
								}
								this.viewDate.setUTCHours(hours);
								this.element.trigger({
									type: 'changeHour',
									date: this.viewDate
								});
								if (this.viewSelect >= 1) {
									this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
								}
							} else if (target.is('.minute')) {
								minutes = parseInt(target.text().substr(target.text().indexOf(':') + 1), 10) || 0;
								this.viewDate.setUTCMinutes(minutes);
								this.element.trigger({
									type: 'changeMinute',
									date: this.viewDate
								});
								if (this.viewSelect >= 0) {
									this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
								}
							}
							if (this.viewMode != 0) {
								var oldViewMode = this.viewMode;
								this.showMode(-1);
								this.fill();
								if (oldViewMode == this.viewMode && this.autoclose) {
									this.hide();
								}
							} else {
								this.fill();
								if (this.autoclose) {
									this.hide();
								}
							}
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')) {
							var day = parseInt(target.text(), 10) || 1;
							var year = this.viewDate.getUTCFullYear(),
								month = this.viewDate.getUTCMonth(),
								hours = this.viewDate.getUTCHours(),
								minutes = this.viewDate.getUTCMinutes(),
								seconds = this.viewDate.getUTCSeconds();
							if (target.is('.old')) {
								if (month === 0) {
									month = 11;
									year -= 1;
								} else {
									month -= 1;
								}
							} else if (target.is('.new')) {
								if (month == 11) {
									month = 0;
									year += 1;
								} else {
									month += 1;
								}
							}
							this.viewDate.setUTCFullYear(year);
							this.viewDate.setUTCMonth(month, day);
							this.element.trigger({
								type: 'changeDay',
								date: this.viewDate
							});
							if (this.viewSelect >= 2) {
								this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
							}
						}
						var oldViewMode = this.viewMode;
						this.showMode(-1);
						this.fill();
						if (oldViewMode == this.viewMode && this.autoclose) {
							this.hide();
						}
						break;
				}
			}
		},

		_setDate: function (date, which) {
			if (!which || which == 'date')
				this.date = date;
			if (!which || which == 'view')
				this.viewDate = date;
			this.fill();
			this.setValue();
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component) {
				element = this.element.find('input');
			}
			if (element) {
				element.change();
				if (this.autoclose && (!which || which == 'date')) {
					//this.hide();
				}
			}
			this.element.trigger({
				type: 'changeDate',
				date: this.date
			});
		},

		moveMinute: function (date, dir) {
			if (!dir) return date;
			var new_date = new Date(date.valueOf());
			//dir = dir > 0 ? 1 : -1;
			new_date.setUTCMinutes(new_date.getUTCMinutes() + (dir * this.minuteStep));
			return new_date;
		},

		moveHour: function (date, dir) {
			if (!dir) return date;
			var new_date = new Date(date.valueOf());
			//dir = dir > 0 ? 1 : -1;
			new_date.setUTCHours(new_date.getUTCHours() + dir);
			return new_date;
		},

		moveDate: function (date, dir) {
			if (!dir) return date;
			var new_date = new Date(date.valueOf());
			//dir = dir > 0 ? 1 : -1;
			new_date.setUTCDate(new_date.getUTCDate() + dir);
			return new_date;
		},

		moveMonth: function (date, dir) {
			if (!dir) return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag == 1) {
				test = dir == -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function () {
					return new_date.getUTCMonth() == month;
				}
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function () {
					return new_date.getUTCMonth() != new_month;
				};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			} else {
				// For magnitudes >1, move one month at a time...
				for (var i = 0; i < mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function () {
					return new_month != new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()) {
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function (date, dir) {
			return this.moveMonth(date, dir * 12);
		},

		dateWithinRange: function (date) {
			return date >= this.startDate && date <= this.endDate;
		},

		keydown: function (e) {
			if (this.picker.is(':not(:visible)')) {
				if (e.keyCode == 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, day, month,
				newDate, newViewDate;
			switch (e.keyCode) {
				case 27: // escape
					this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.keyboardNavigation) break;
					dir = e.keyCode == 37 ? -1 : 1;
					viewMode = this.viewMode;
					if (e.ctrlKey) {
						viewMode += 2;
					} else if (e.shiftKey) {
						viewMode += 1;
					}
					if (viewMode == 4) {
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
					} else if (viewMode == 3) {
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
					} else if (viewMode == 2) {
						newDate = this.moveDate(this.date, dir);
						newViewDate = this.moveDate(this.viewDate, dir);
					} else if (viewMode == 1) {
						newDate = this.moveHour(this.date, dir);
						newViewDate = this.moveHour(this.viewDate, dir);
					} else if (viewMode == 0) {
						newDate = this.moveMinute(this.date, dir);
						newViewDate = this.moveMinute(this.viewDate, dir);
					}
					if (this.dateWithinRange(newDate)) {
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.keyboardNavigation) break;
					dir = e.keyCode == 38 ? -1 : 1;
					viewMode = this.viewMode;
					if (e.ctrlKey) {
						viewMode += 2;
					} else if (e.shiftKey) {
						viewMode += 1;
					}
					if (viewMode == 4) {
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
					} else if (viewMode == 3) {
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
					} else if (viewMode == 2) {
						newDate = this.moveDate(this.date, dir * 7);
						newViewDate = this.moveDate(this.viewDate, dir * 7);
					} else if (viewMode == 1) {
						if (this.showMeridian) {
							newDate = this.moveHour(this.date, dir * 6);
							newViewDate = this.moveHour(this.viewDate, dir * 6);
						} else {
							newDate = this.moveHour(this.date, dir * 4);
							newViewDate = this.moveHour(this.viewDate, dir * 4);
						}
					} else if (viewMode == 0) {
						newDate = this.moveMinute(this.date, dir * 4);
						newViewDate = this.moveMinute(this.viewDate, dir * 4);
					}
					if (this.dateWithinRange(newDate)) {
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					break;
				case 13: // enter
					if (this.viewMode != 0) {
						var oldViewMode = this.viewMode;
						this.showMode(-1);
						this.fill();
						if (oldViewMode == this.viewMode && this.autoclose) {
							this.hide();
						}
					} else {
						this.fill();
						if (this.autoclose) {
							this.hide();
						}
					}
					e.preventDefault();
					break;
				case 9: // tab
					this.hide();
					break;
			}
			if (dateChanged) {
				var element;
				if (this.isInput) {
					element = this.element;
				} else if (this.component) {
					element = this.element.find('input');
				}
				if (element) {
					element.change();
				}
				this.element.trigger({
					type: 'changeDate',
					date: this.date
				});
			}
		},

		showMode: function (dir) {
			if (dir) {
				var newViewMode = Math.max(0, Math.min(DPGlobal.modes.length - 1, this.viewMode + dir));
				if (newViewMode >= this.minView && newViewMode <= this.maxView) {
					this.element.trigger({
						type:        'changeMode',
						date:        this.viewDate,
						oldViewMode: this.viewMode,
						newViewMode: newViewMode
					});

					this.viewMode = newViewMode;
				}
			}
			/*
			 vitalets: fixing bug of very special conditions:
			 jquery 1.7.1 + webkit + show inline datetimepicker in bootstrap popover.
			 Method show() does not set display css correctly and datetimepicker is not shown.
			 Changed to .css('display', 'block') solve the problem.
			 See https://github.com/vitalets/x-editable/issues/37

			 In jquery 1.7.2+ everything works fine.
			 */
			//this.picker.find('>div').hide().filter('.datetimepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
			this.picker.find('>div').hide().filter('.datetimepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
			this.updateNavArrows();
		},

		reset: function (e) {
			this._setDate(null, 'date');
		}
	};

	$.fn.datetimepicker = function (option) {
		var args = Array.apply(null, arguments);
		args.shift();
		return this.each(function () {
			var $this = $(this),
				data = $this.data('datetimepicker'),
				options = typeof option == 'object' && option;
			if (!data) {
				$this.data('datetimepicker', (data = new Datetimepicker(this, $.extend({}, $.fn.datetimepicker.defaults, options))));
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				data[option].apply(data, args);
			}
		});
	};

	$.fn.datetimepicker.defaults = {
	};
	$.fn.datetimepicker.Constructor = Datetimepicker;
	var dates = $.fn.datetimepicker.dates = {
		en: {
			days:        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort:   ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin:     ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months:      ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			meridiem:    ["am", "pm"],
			suffix:      ["st", "nd", "rd", "th"],
			today:       "Today"
		}
	};

	var DPGlobal = {
		modes:            [
			{
				clsName: 'minutes',
				navFnc:  'Hours',
				navStep: 1
			},
			{
				clsName: 'hours',
				navFnc:  'Date',
				navStep: 1
			},
			{
				clsName: 'days',
				navFnc:  'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc:  'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc:  'FullYear',
				navStep: 10
			}
		],
		isLeapYear:       function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		},
		getDaysInMonth:   function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		},
		getDefaultFormat: function (type, field) {
			if (type == "standard") {
				if (field == 'input')
					return 'yyyy-mm-dd hh:ii';
				else
					return 'yyyy-mm-dd hh:ii:ss';
			} else if (type == "php") {
				if (field == 'input')
					return 'Y-m-d H:i';
				else
					return 'Y-m-d H:i:s';
			} else {
				throw new Error("Invalid format type.");
			}
		},
		validParts:       function (type) {
			if (type == "standard") {
				return /hh?|HH?|p|P|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g;
			} else if (type == "php") {
				return /[dDjlNwzFmMnStyYaABgGhHis]/g;
			} else {
				throw new Error("Invalid format type.");
			}
		},
		nonpunctuation:   /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
		parseFormat:      function (format, type) {
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts(type), '\0').split('\0'),
				parts = format.match(this.validParts(type));
			if (!separators || !separators.length || !parts || parts.length == 0) {
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate:        function (date, format, language, type) {
			if (date instanceof Date) {
				var dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
				dateUTC.setMilliseconds(0);
				return dateUTC;
			}
			if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
				format = this.parseFormat('yyyy-mm-dd', type);
			}
			if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
				format = this.parseFormat('yyyy-mm-dd hh:ii', type);
			}
			if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
				format = this.parseFormat('yyyy-mm-dd hh:ii:ss', type);
			}
			if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
				var part_re = /([-+]\d+)([dmwy])/,
					parts = date.match(/([-+]\d+)([dmwy])/g),
					part, dir;
				date = new Date();
				for (var i = 0; i < parts.length; i++) {
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch (part[2]) {
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), 0);
			}
			var parts = date && date.match(this.nonpunctuation) || [],
				date = new Date(0, 0, 0, 0, 0, 0, 0),
				parsed = {},
				setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH', 'p', 'P'],
				setters_map = {
					hh:   function (d, v) {
						return d.setUTCHours(v);
					},
					h:    function (d, v) {
						return d.setUTCHours(v);
					},
					HH:   function (d, v) {
						return d.setUTCHours(v == 12 ? 0 : v);
					},
					H:    function (d, v) {
						return d.setUTCHours(v == 12 ? 0 : v);
					},
					ii:   function (d, v) {
						return d.setUTCMinutes(v);
					},
					i:    function (d, v) {
						return d.setUTCMinutes(v);
					},
					ss:   function (d, v) {
						return d.setUTCSeconds(v);
					},
					s:    function (d, v) {
						return d.setUTCSeconds(v);
					},
					yyyy: function (d, v) {
						return d.setUTCFullYear(v);
					},
					yy:   function (d, v) {
						return d.setUTCFullYear(2000 + v);
					},
					m:    function (d, v) {
						v -= 1;
						while (v < 0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() != v)
							d.setUTCDate(d.getUTCDate() - 1);
						return d;
					},
					d:    function (d, v) {
						return d.setUTCDate(v);
					},
					p:    function (d, v) {
						return d.setUTCHours(v == 1 ? d.getUTCHours() + 12 : d.getUTCHours());
					}
				},
				val, filtered, part;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			setters_map['P'] = setters_map['p'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
			if (parts.length == format.parts.length) {
				for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10);
					part = format.parts[i];
					if (isNaN(val)) {
						switch (part) {
							case 'MM':
								filtered = $(dates[language].months).filter(function () {
									var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
									return m == p;
								});
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(function () {
									var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
									return m == p;
								});
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
							case 'p':
							case 'P':
								val = $.inArray(parts[i].toLowerCase(), dates[language].meridiem);
								break;
						}
					}
					parsed[part] = val;
				}
				for (var i = 0, s; i < setters_order.length; i++) {
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s]))
						setters_map[s](date, parsed[s])
				}
			}
			return date;
		},
		formatDate:       function (date, format, language, type) {
			if (date == null) {
				return '';
			}
			var val;
			if (type == 'standard') {
				val = {
					// year
					yy:   date.getUTCFullYear().toString().substring(2),
					yyyy: date.getUTCFullYear(),
					// month
					m:    date.getUTCMonth() + 1,
					M:    dates[language].monthsShort[date.getUTCMonth()],
					MM:   dates[language].months[date.getUTCMonth()],
					// day
					d:    date.getUTCDate(),
					D:    dates[language].daysShort[date.getUTCDay()],
					DD:   dates[language].days[date.getUTCDay()],
					p:    (dates[language].meridiem.length == 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
					// hour
					h:    date.getUTCHours(),
					// minute
					i:    date.getUTCMinutes(),
					// second
					s:    date.getUTCSeconds()
				};

				if (dates[language].meridiem.length == 2) {
					val.H = (val.h % 12 == 0 ? 12 : val.h % 12);
				}
				else {
					val.H = val.h;
				}
				val.HH = (val.H < 10 ? '0' : '') + val.H;
				val.P = val.p.toUpperCase();
				val.hh = (val.h < 10 ? '0' : '') + val.h;
				val.ii = (val.i < 10 ? '0' : '') + val.i;
				val.ss = (val.s < 10 ? '0' : '') + val.s;
				val.dd = (val.d < 10 ? '0' : '') + val.d;
				val.mm = (val.m < 10 ? '0' : '') + val.m;
			} else if (type == 'php') {
				// php format
				val = {
					// year
					y: date.getUTCFullYear().toString().substring(2),
					Y: date.getUTCFullYear(),
					// month
					F: dates[language].months[date.getUTCMonth()],
					M: dates[language].monthsShort[date.getUTCMonth()],
					n: date.getUTCMonth() + 1,
					t: DPGlobal.getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth()),
					// day
					j: date.getUTCDate(),
					l: dates[language].days[date.getUTCDay()],
					D: dates[language].daysShort[date.getUTCDay()],
					w: date.getUTCDay(), // 0 -> 6
					N: (date.getUTCDay() == 0 ? 7 : date.getUTCDay()),       // 1 -> 7
					S: (date.getUTCDate() % 10 <= dates[language].suffix.length ? dates[language].suffix[date.getUTCDate() % 10 - 1] : ''),
					// hour
					a: (dates[language].meridiem.length == 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
					g: (date.getUTCHours() % 12 == 0 ? 12 : date.getUTCHours() % 12),
					G: date.getUTCHours(),
					// minute
					i: date.getUTCMinutes(),
					// second
					s: date.getUTCSeconds()
				};
				val.m = (val.n < 10 ? '0' : '') + val.n;
				val.d = (val.j < 10 ? '0' : '') + val.j;
				val.A = val.a.toString().toUpperCase();
				val.h = (val.g < 10 ? '0' : '') + val.g;
				val.H = (val.G < 10 ? '0' : '') + val.G;
				val.i = (val.i < 10 ? '0' : '') + val.i;
				val.s = (val.s < 10 ? '0' : '') + val.s;
			} else {
				throw new Error("Invalid format type.");
			}
			var date = [],
				seps = $.extend([], format.separators);
			for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
				if (seps.length) {
					date.push(seps.shift());
				}
				date.push(val[format.parts[i]]);
			}
			if (seps.length) {
				date.push(seps.shift());
			}
			return date.join('');
		},
		convertViewMode:  function (viewMode) {
			switch (viewMode) {
				case 4:
				case 'decade':
					viewMode = 4;
					break;
				case 3:
				case 'year':
					viewMode = 3;
					break;
				case 2:
				case 'month':
					viewMode = 2;
					break;
				case 1:
				case 'day':
					viewMode = 1;
					break;
				case 0:
				case 'hour':
					viewMode = 0;
					break;
			}

			return viewMode;
		},
		headTemplate:     '<thead>' +
							  '<tr>' +
							  '<th class="prev"><i class="icon-arrow-left glyphicon glyphicon-chevron-left"/></th>' +
							  '<th colspan="5" class="switch"></th>' +
							  '<th class="next"><i class="icon-arrow-right glyphicon glyphicon-chevron-right"/></th>' +
							  '</tr>' +
			'</thead>',
		headTemplateV3:   '<thead>' +
							  '<tr>' +
							  '<th class="prev"><i class="glyphicon glyphicon-arrow-left"></i> </th>' +
							  '<th colspan="5" class="switch"></th>' +
							  '<th class="next"><i class="glyphicon glyphicon-arrow-right"></i> </th>' +
							  '</tr>' +
			'</thead>',
		contTemplate:     '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate:     '<tfoot><tr><th colspan="3" class="date-clear">清除</th><th colspan="4" class="today"></th></tr></tfoot>'
	};
	DPGlobal.template = '<div class="datetimepicker">' +
		'<div class="datetimepicker-minutes">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-hours">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-days">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplate +
		'<tbody></tbody>' +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-months">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-years">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplate +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'</div>';
	DPGlobal.templateV3 = '<div class="datetimepicker">' +
		'<div class="datetimepicker-minutes">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplateV3 +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-hours">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplateV3 +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-days">' +
		'<table class=" table-condensed">' +
		DPGlobal.headTemplateV3 +
		'<tbody></tbody>' +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-months">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplateV3 +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'<div class="datetimepicker-years">' +
		'<table class="table-condensed">' +
		DPGlobal.headTemplateV3 +
		DPGlobal.contTemplate +
		DPGlobal.footTemplate +
		'</table>' +
		'</div>' +
		'</div>';
	$.fn.datetimepicker.DPGlobal = DPGlobal;

	/* DATETIMEPICKER NO CONFLICT
	 * =================== */

	$.fn.datetimepicker.noConflict = function () {
		$.fn.datetimepicker = old;
		return this;
	};

	/* DATETIMEPICKER DATA-API
	 * ================== */

	$(document).on(
		'focus.datetimepicker.data-api click.datetimepicker.data-api',
		'[data-provide="datetimepicker"]',
		function (e) {
			var $this = $(this);
			if ($this.data('datetimepicker')) return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datetimepicker('show');
		}
	);
	$(function () {
		$('[data-provide="datetimepicker-inline"]').datetimepicker();
	});

}(window.jQuery);

/**
 * Simplified Chinese translation for bootstrap-datetimepicker
 * Yuan Cheung <advanimal@gmail.com>
 */
;(function($){
	$.fn.datetimepicker.dates['zh-CN'] = {
        days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
        daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        today: "今日",
		suffix: [],
		meridiem: []
	};
}(jQuery));

/**
 * Created by TANXINZHENG481 on 2017-03-09.
 */
angular.module('uia',[
    'ui.bootstrap',
    'permission',
    'toaster',
    'ngFileUpload',
    'localytics.directives'
]);
/**
 * Created by TANXINZHENG481 on 2017-01-20.
 */
angular.module('uia').controller('UiaBoxController', ['$scope', '$filter', 'uiaDialog', '$timeout','$q',  function ($scope, $filter, $dialog, $timeout, $q) {
    var defaultOption = {

    };
    $scope.formData = {};
    $scope.boxOption = angular.extend({
        formName: "uiaBox_" + new Date().getTime()
    }, defaultOption, $scope.boxOption);
    $scope.cancel = function(){
    	if($scope.boxOption.cancelBtn.click){
            $scope.boxOption.cancelBtn.click();
            return;
		}
	};
    $scope.save = function(){
        if(!$scope[$scope.boxOption.formName].validate()){
            return;
        }
        $dialog.confirm('请确认是否保存？').then(function(){
        	if($scope.formData.id){
                $scope.boxOption.ApiService.update($scope.formData).$promise.then(function(data){
                    $timeout(function(){
                        $scope.lock();
                    }, true);
                    if($scope.boxOption.saveBtn.callback){
                        $scope.boxOption.saveBtn.callback();
                    }
                });
			}else{
                $scope.boxOption.ApiService.save($scope.formData).$promise.then(function(data){
                    $scope.formData = angular.copy(data);
                    $timeout(function(){
                        $scope.lock();
                    }, true);
                    if($scope.boxOption.saveBtn.callback){
                        $scope.boxOption.saveBtn.callback();
					}
                });
			}
		})
    };
    $scope.invalid = function(){
        return $scope[$scope.boxOption.formName].$invalid;
    };
    $scope.unlock = function(){
        $scope[$scope.boxOption.formName].unlock();
    };
    $scope.lock = function(){
        $scope[$scope.boxOption.formName].lock();
    };
    $scope.locked = function(){
        return $scope[$scope.boxOption.formName].locked;
    };
    $scope.unlocked = function(){
        return !$scope[$scope.boxOption.formName].locked;
    };
    $scope.viewEvent = function(){
    	if($scope.boxOption.formData.id){
            $scope.boxOption.ApiService.get($scope.boxOption.formData).$promise.then(function(data){
                $scope.formData = data;
				$timeout(function(){
					$scope.lock();
				}, true);
			});
		}
    };
    // 设置filters属性默认值
    var setPlaceholder = function(){
        angular.forEach($scope.boxOption.columns, function(val, key){
            if(!val.placeholder){
                val.placeholder = '请输入' + val.title;
            }
        });
    };
    // 校验规则
    var setValidRule = function(){
        var rules = {},
            messages = {};
        angular.forEach($scope.boxOption.columns, function(val, key){
            if(val.rules){
                angular.forEach(val.rules, function(ruleVal, rule){
                    rules[val.name] = rules[val.name] || {};
                    rules[val.name][rule] = ruleVal;
                    if(rule == 'required'){
                        val.required = 'required';
                    }
                })
            }
            if(val.messages){
                angular.forEach(val.messages, function(message, rule){
                    messages[val.name] = messages[val.name] || {};
                    messages[val.name][rule] = message;
                })
            }
        });
        $scope.validateOption = {
            rules:rules,
            messages:messages
        };
    };
    var init = function(){
        setPlaceholder();
        setValidRule();
        if($scope.boxOption.formData){
            $scope.viewEvent();
		}
    };
    init();
}]).directive('uiaBox', [function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true, //嵌入
        scope: {
            boxOption: "="
        },
        link:function(scope, element, attr, ctrl){
            if(!attr.boxOption){
                throw new Error('the "uia-box" directive must be define "box-option"');
            }
        },
        templateUrl: function($element, $attr){
            return $attr.templateUrl || 'uia/template/box.html';
        },
        controller:"UiaBoxController"
    };
}]);

/**
 * Created by EX-WUPENGPENG001 on 2017-06-06.
 */
angular.module('uia'
).directive('btnLoading', [function () {
    return {
        restrict: 'A',
        scope:{
            btnLoadingText:'@',
            btnLoading:'='
        },
        link: function (scope, element, attr, ctrl) {
            var defaultLoadingText = attr.btnLoadingText || "<i class='icon-spinner'>&nbsp;稍等</i>";
            scope.insideHtml = element.html();
            scope.$watch(function () {
                    return scope.$eval(attr.btnLoading);
                }, function (value,oldV) {
                    if (angular.isDefined(value)) {
                        if(value){
                            element.attr('disabled', true);
                            element.html(defaultLoadingText);
                        }else{
                            element.removeAttr('disabled');
                            element.html(scope.insideHtml);
                        }
                    }
                }
            );
        }
    }
}]).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
}).directive("btnClose",["uiaDialog", function($dialog){
    return {
        restrict:'E',
        replace:'true',
        template:'<button class="btn" type="button" ng-click="closeWindow()" data-tooltip="关闭"><i class="icon-remove-sign">&nbsp;&nbsp;</i></button>',
        scope:{
            eventClick:'&',
            formName:'@',
            spreadName:'='
        },
        link:function (scope, elm, attrs, ctrl) {
            var formScope;
            var formEle = elm[0].form;
            if(formEle){
                formScope = angular.element(formEle).scope()[formEle.name];
            }
            scope.closeWindow = function(){
                var formName = scope.formName;
                if((formScope && formScope.$dirty) || (formName && scope.$parent
                    && scope.$parent[formName].$dirty) || spreadDirtyCheck()){
                    $dialog.confirm("存在已修改且未保存的数据，请确认是否关闭？").then(function(){
                        if(scope.eventClick){
                            scope.eventClick();
                        }
                        window.close();
                    })
                }else{
                    if(scope.eventClick){
                        scope.eventClick();
                    }
                    window.close();
                }
            };
            var spreadArray = scope.spreadName;
            var spreadDirtyCheck = function(){
                if(!scope.spreadName){
                    return false;
                }
                for (var i = 0; i < spreadArray.length; i++) {
                    var obj = spreadArray[i];
                    var spreadOption = scope.$parent[obj];
                    var row = spreadOption.spread.getActiveSheet().getDirtyRows();
                    if(row.length > 0){
                        return true;
                    }
                }
                return false;
            }
        }
    }
}]).directive('btnCancel',['uiaDialog',function($dialog){
    return{
        restrict:'E',
        replace:true,
        template:'<button class="btn" type="button" ng-click="click()"><i class="icon-undo">&nbsp;&nbsp;取消</i></button>',
        scope:{
            eventClick:'&',
            formName:'@',
            spreadName:'='
        },
        link: function(scope, element, attr, ngModel) {
            var formName = scope.formName;
            var formScope;
            var formEle = element[0].form;
            if(formEle){
                formScope = angular.element(formEle).scope()[formEle.name];
            }
            scope.click = function(){
                if((formScope && formScope.$dirty) || (formName && scope.$parent
                    && scope.$parent[formName].$dirty)){
                    $dialog.confirm("存在已修改且未保存的数据，请确认是否取消？").then(function(){
                        scope.eventClick();
                        element.parents('form').find('.error-popover').remove();
                        //element.parents('form').data('validator').resetForm();
                        if(formScope != undefined && formScope.$dirty){
                            formScope.$setPristine(true);
                        }
                        if(formName && scope.$parent[formName].$dirty){
                            scope.$parent[formName].$setPristine(true);
                        }
//                            if(spreadArray){
//                                cleanSpreadDirty();
//                            }

                    });
                }else{
                    scope.eventClick();
                    element.parents('form').find('.error-popover').remove();

                }
            };
//                var spreadArray = scope.spreadName;
//                var cleanSpreadDirty = function(){
//                    if(!scope.spreadName){
//                        return;
//                    }
//                    for (var i = 0; i < spreadArray.length; i++) {
//                        var obj = spreadArray[i];
//                        var spreadOption = scope.$parent[obj];
//                        if(spreadOption){
//                            var row = spreadOption.spread.getActiveSheet().getDirtyRows();
//                            if(row.length > 0){
//                                spreadOption.spread.getActiveSheet().clearPendingChanges();
//                            }
//                        }
//                    }
//                }
//                var spreadDirtyCheck = function(){
//                    if(!scope.spreadName){
//                        return false;
//                    }
//                    for (var i = 0; i < spreadArray.length; i++) {
//                        var obj = spreadArray[i];
//                        var spreadOption = scope.$parent[obj];
//                        if(spreadOption){
//                            var row = spreadOption.spread.getActiveSheet().getDirtyRows();
//                            if(row.length > 0){
//                                return true;
//                            }
//                        }
//                    }
//                    return false;
//                }
        }
    }
}]).directive("auditBtn", ['AuditService', 'uiaDialog', 'AuditAPI', function(AuditService, $dialog, AuditAPI) {
    return {
        restrict:"E",
        scope:{
            auditCallback:"=",
            auditType:"@",
            auditId:"=",
            auditStatus:"="
        },
        replace:true,
        template:'<div><button class="btn" type="button" ng-show="auditStatus" ng-click="viewHistory()"><i class="icon-eye-open">&nbsp;&nbsp;查看审核历史</i></button>' +
            '<button class="btn" type="button" ng-show="canReject" ng-click="rejectTransaction()"><i class="icon-edit">&nbsp;&nbsp;反审批</i></button>' +
            '<button class="btn" type="button" ng-show="canApprove" ng-click="approveTransaction()"><i class="icon-edit">&nbsp;&nbsp;审批</i></button>' +
            '<button class="btn" type="button" ng-show="canRevoke" ng-click="revokeTransaction()"><i class="icon-undo">&nbsp;&nbsp;撤销提交</i></button>' +
            '<button class="btn" type="button" ng-show="canSubmit" ng-click="submitTransaction()"><i class="icon-cloud-upload">&nbsp;&nbsp;提交</i></button></div>',
        link:function(scope,element,attr,ctrl){
            scope.$watch('auditStatus', function(newValue, oldValue) {
                scope.canReject = false;
                scope.canApprove = false;
                scope.canRevoke = false;
                scope.canSubmit = false;
                if (scope.auditId) {
                    if (scope.auditStatus == "3AUDITTING") {
                        AuditAPI.checkApprove({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canApprove = true;
                            }
                        });
                        AuditAPI.checkRevoke({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canRevoke = true;
                            }
                        });
                    } else if (scope.auditStatus == "4AUDITTED") {
                        AuditAPI.checkReject({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canReject = true;
                            }
                        });
                    } else if (scope.auditStatus == "1SAVED" || scope.auditStatus == "2SUBMITTED") {
                        AuditAPI.checkSubmit({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                            if (result.permitted) {
                                scope.canSubmit = true;
                            }
                        });
                    }
                }
            });

            scope.approveTransaction = function() {
                AuditService.showApproveDialog(scope.auditType, scope.auditId, function(result) {
                    scope.canRevoke = false;
                    scope.canApprove = false;
                    AuditAPI.checkApprove({transactionType : scope.auditType, id : scope.auditId}, function(result) {
                        if (result.permitted) {
                            scope.canApprove = true;
                        }
                    });
                    scope.auditCallback(result);
                });
            }

            scope.rejectTransaction = function() {
                AuditService.reject(scope.auditType, scope.auditId, scope.auditCallback);
            }

            scope.revokeTransaction = function() {
                AuditService.revoke(scope.auditType, scope.auditId, scope.auditCallback);
            }

            scope.submitTransaction = function() {
                AuditService.submit(scope.auditType, scope.auditId, scope.auditCallback);
            }

            scope.viewHistory = function() {
                AuditService.viewHistory(scope.auditType, scope.auditId);
            }

        }
    }
}]).directive('btnAdd',[function(){
    return {
        restrict:'E',
        replace:true,
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-plus">&nbsp;&nbsp;新增</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attr,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnDelete',[function(){
    return {
        restrict:'E',
        replace:true,
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-trash">&nbsp;&nbsp;删除</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnView',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-eye-open">&nbsp;&nbsp;查看</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnSave',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="submit" class="btn" ng-click="click()"><i class="icon icon-ok">&nbsp;&nbsp;保存</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnEdit',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-edit">&nbsp;&nbsp;修改</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnRefresh',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-refresh">&nbsp;&nbsp;刷新</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click = function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnRevise',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-pencil">&nbsp;&nbsp;修订</i></button>',
        scope:{
            eventClick:'&'
        },
        link:function(scope,element,attrs,ctrl){
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive("btnFilter",function(){
    return{
        restrict:"E",
        replace:"true",
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon icon-filter">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            eventClick:'&',
            btnText:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnText){
                scope.text=attrs.btnText
            }else{
                scope.text='过滤'
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}).directive("btnSearch",function(){
    return{
        restrict:"E",
        replace:"true",
        template:'<button type="button" class="btn uia-btn {{class}}" ng-click="click()"><i class="icon icon-search">&nbsp;&nbsp;搜索</i></button>',
        scope:{
            eventClick:'&',
            loading:'=?',
            btnClass:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnClass){
                scope.class=attrs.btnClass;
            }else{
                scope.class='';
            };
            if(attrs.loading){
                scope.insideHtml = element.html();
                scope.$watch('loading',function(newV,oldV){
                    var defaultLoadingText = attrs.btnLoadingText || "<i class='icon-spinner'>&nbsp;稍等</i>";
                    if (angular.isDefined(newV)) {
                        if(newV){
                            element.attr('disabled', true);
                            element.html(defaultLoadingText);
                        }else{
                            element.removeAttr('disabled');
                            element.html(scope.insideHtml);
                        }
                    }
                })
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}).directive("btnReset",function(){
    return{
        restrict:"E",
        replace:"true",
        template:'<button type="reset" class="btn uia-btn {{class}}" ng-click="click()"><i class="icon icon-undo">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            eventClick:'&',
            btnText:'@?',
            btnClass:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnText){
                scope.text=attrs.btnText
            }else{
                scope.text='重置'
            }
            if(attrs.btnClass){
                scope.class=attrs.btnClass;
            }else{
                scope.class='';
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}).directive('btnExport',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="click()"><i class="icon-upload-alt">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            eventClick:'&',
            btnText:'@?'
        },
        link:function(scope,element,attrs,ctrl){
            if(attrs.btnText){
                scope.text=attrs.btnText
            }else{
                scope.text="导出"
            }
            scope.click=function(){
                scope.eventClick();
            }
        }
    }
}]).directive('btnImport',[function(){
    return{
        restrict:'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="handleClick()" ><i class="icon-download-alt">&nbsp;&nbsp;导入</i></button>',
        scope:{
            eventChange:'&',
            fileModel:'='
        },
        link:function(scope,element,attr,ctrl){
            scope.handleClick=function(){
                var clickCount=1;
                scope.$watch('fileModel',function(newV,oldV){
                    if(scope.fileModel){
                        if(newV &&newV!=oldV){
                            if(clickCount==1){
                                scope.eventChange();
                                clickCount++;
                            }
                        }
                    }
                })
            }
        }
    }
}]).directive('btnDownload',["$timeout", "$q", "uiaDialog", function ($timeout, $q, $dialog) {
    return {
        restrict: 'E',
        replace:'true',
        template:'<button type="button" class="btn" ng-click="handleClick()"><i class="icon-cloud-download">&nbsp;&nbsp;{{text}}</i></button>',
        scope:{
            btnText:"@",
            downloadUrl:"=",// 引用scope对象
            downloadParams:"=",// 参数对象
            downloadHref:"@"// 引用链接字符串下载(必须为全路径,如：http://localhost:8080/imsp/excel/demo.xle)
        },
        link: function (scope, element, attr) {
            if(attr.btnText){
                scope.text = attr.btnText;
            }else{
                scope.text = '下载模板';
            }
            scope.handleClick = function(){
                if(!attr.downloadUrl && !attr.downloadHref){
                    $dialog.alert("btn-down directive only choice one attribute: download-url or download-href.");
                }
                var defer = $q.defer();
                var anchor = angular.element("<iframe/>");
                anchor.attr({
                    style:"display:none",
                    src: function(){
                        var params = "";
                        if(attr.downloadParams){
                            for(var p in scope.downloadParams){
                                if(params == ""){
                                    params += "?" + p + '=' + encodeURIComponent(scope.downloadParams[p]);
                                }else{
                                    params += "&" + p + '=' + encodeURIComponent(scope.downloadParams[p]);
                                }
                            }
                        }
                        if(attr.downloadUrl){
                            return scope.downloadUrl + params;
                        }else if(attr.downloadHref){
                            return scope.downloadHref + params;
                        }
                    },
                    onLoad:function(){
                        $timeout(function(){
                            anchor.remove();
                        },50000);
                    }
                });
                angular.element("body").append(anchor);
                return defer.promise;
            };
        }
    }
}])
/**
* Created by EX-WUPENGPENG001 on 2017-05-02.
*/
angular.module('uia').factory("ChoiceWidgetTemplateStore",[function(){
    var templates = {};
    return {
        defineManyTemplate : function(data){
            data.forEach(data, function(val, key){
                if(templates[key]){
                    throw new Error('The choiceWidgetType name "' + key + '" choice-widget exist in templates, please change the key name');
                }
                templates[key] = val;
            });
        },
        defineTemplate : function(key, data){
            if(templates[key]){
                throw new Error('The choiceWidgetType name "' + key + '" choice-widget exist in templates, please change the key name');
            }
            templates[key] = data;
        },
        getTemplate: function(key){
            if(!templates[key]){
                throw new Error('The choiceWidgetType name "' + key + '" choice-widget not exist in templates');
            }
            return templates[key];
        }
    }
}]).directive("uiaChoice",["$compile", "ChoiceWidgetTemplateStore","uiaDialog", "$timeout", "$filter", function($compile, ChoiceWidgetTemplateStore, $dialog, $timeout, $filter){
    return {
        restrict:'A',
        transclude: true,
        require: "ngModel",
        scope:{
            choiceOption:"=?",
            ngModel:"=",
            choiceChange:"&?",
            choiceModelLabel:"=",
            choiceValueKey:"@?",
            choiceLabelKey:"@?",
            // 模板类型
            choiceWidgetType:"@",
            // 父级约束
            parentConstraint:'=?'
        },
        //templateUrl : '',
        link:function(scope, element, attr, ngModel){
            //link里面的方法会在controller之后执行
//            if(!angular.element(element).parent().children('choice-widget-tpl').length){
//                angular.element(element).parent().append($compile("<choice-widget-tpl></choice-widget-tpl>")(scope));
//            }
            angular.element(element).attr('readonly', true);
            element.on('click', function(val){
                scope.openInfoList();
            });
            ngModel.$formatters.push(function(modelValue){
                if(scope.choiceModelLabel) {
                    $timeout(function(){
                        element.val(scope.choiceModelLabel);
                    });
                }
                return modelValue;
            });
            //ngModel.$viewChangeListeners.push(function() {
            //    $scope.ngModel = ngModel.$modelValue;
            //});
            //ngModel.$render(function(isUpdate){
            //    ngModel.$viewValue = currencyValue;
            //})
        },
        controller : ["$scope", "$attrs", "$element", "$uibModal", "uiaDialog",
        function($scope, $attrs, $element, $modal, $dialog){
            $scope.openInfoList = function(){
                $scope.choiceOption = angular.extend({}, $scope.choiceOption);
                if($attrs.choiceWidgetType){
                    $scope.choiceOption.choiceWidgetType = $attrs.choiceWidgetType;
                }
                if(!$scope.choiceOption.choiceWidgetType){
                    $dialog.alert("if you want to matching code, your widget-choice-type must be true.");
                }else{
                    var templateConfig = ChoiceWidgetTemplateStore.getTemplate($scope.choiceOption.choiceWidgetType);
                    if($attrs.choiceValueKey){
                        $scope.choiceOption.choiceValueKey = $scope.choiceValueKey;
                    }
                    if($attrs.parentConstraint){
                        $scope.choiceOption.parentConstraint = $scope.parentConstraint;
                    }
                    if($attrs.choiceLabelKey){
                        $scope.choiceOption.choiceLabelKey= $scope.choiceLabelKey;
                    }
                    $scope.choiceOption = angular.extend($scope.choiceOption, templateConfig);
                }
                $modal.open({
                    templateUrl: 'uia/template/choice.html',
                    windowClass:'widget-choice',
                    resolve:{
                        option:function(){
                            if($scope.choiceOption){
                                return $scope.choiceOption
                            }else{
                                return null;
                            }
                        }
                    },
                    controller:["$scope","$uibModalInstance","option", "$filter",
                        function($scope,$modalInstance,option, $filter){
                            $scope.option=angular.extend({}, angular.copy(option));
                            $scope.queryParam={};
                            $scope.current=function(item){
                                $scope.currentObjList=[];
                                if($scope.option.multiple){
                                    item.isChoiced = !item.isChoiced;
                                }else{
                                    angular.forEach($scope.dataList,function(obj){
                                        obj.isChoiced=false;
                                    });
                                    item.isChoiced=true;
                                }
                            }
                            $scope.choice = function(){
                                //确定按钮
                                produceCurrentObjList();
                                $modalInstance.close($scope.currentObjList);
                            };
                            $scope.currentSave=function(item){
                                item.isChoiced=true;
                                $scope.choice();
                            }
                            $scope.cancel = function () {
                                //取消按钮
                                $modalInstance.dismiss('cancel');
                            };
                            $scope.clear = function () {
                                //清除按钮
                                $modalInstance.dismiss('clear');
                            };
                            $scope.formatter = function(val, column){
                                    return $filter(column.filter)(val, column.formatter);
                            };
                            $scope.pageInfoSetting = {
                                pageSize:10,
                                pageNum:1
                            };
                            $scope.loadParams={};
                            $scope.loadParams=$scope.pageInfoSetting;
                            if($scope.option.handleParams){
                                $scope.loadParams = $scope.option.handleParams($scope.loadParams, option);
                            }
                            var pageSizeName = "pageSize";
                            var pageNumName = "pageNum";
                            if($scope.option.pageSetting){
                                $scope.loadParams[$scope.option.pageSetting.pageNumName]=$scope.loadParams.pageNum;
                                $scope.loadParams[$scope.option.pageSetting.pageSizeName]=$scope.loadParams.pageSize;
                                if($scope.option.pageSetting.pageNumName){
                                    pageNumName = $scope.option.pageSetting.pageNumName;
                                }
                                if($scope.option.pageSetting.pageSizeName){
                                    pageSizeName = $scope.option.pageSetting.pageSizeName;
                                }
                            }
                            $scope.loadDataList = function(){
                                if(!$scope.option.hidePagination){
                                    if($scope.queryParams){
                                        for(var key in $scope.queryParams){
                                            $scope.loadParams[key]=$scope.queryParams[key];
                                        }
                                    }
                                }
                                if($scope.pageInfoSetting){
                                    $scope.loadParams[pageNumName] = $scope.pageInfoSetting.pageNum;
                                    $scope.loadParams[pageSizeName] = $scope.pageInfoSetting.pageSize;
                                }
                                if($scope.option.parentConstraint){
                                    if($scope.option.parentName){
                                        $scope.loadParams[$scope.option.parentName]=$scope.option.parentConstraint;
                                    }
                                }
                                var resourceInstance = $scope.option.loadEvent($scope.loadParams).$promise || $scope.option.loadEvent(params);
                                resourceInstance.then(function(result){
                                    if(result.data){
                                        console.log(result.data);
                                        $scope.dataList=result.data;
                                        $scope.pageInfoSetting = result.pageInfo;

                                    }else{
                                        $scope.dataList=[];
                                    }
                                });
                            }
                            $scope.reset = function(){
                                if($scope.queryParams){
                                    for(var key in $scope.queryParams){
                                        $scope.loadParams[key]='';
                                    }
                                    $scope.queryParams={};
                                }
                                $scope.loadDataList();
                            }
                            $scope.iconsort=false;
                            $scope.sort=function(name){
                                if($scope.option.sort){
                                    $scope.iconsort=name;
                                    $scope.activeThis=name;
                                    if($scope.queryParam.sort && $scope.queryParam.sort === name){
                                        $scope.queryParam.sort = "-" + name;
                                        $scope.sortway=true;
                                    }else{
                                        $scope.queryParam.sort = name;
                                        $scope.sortway=false;
                                    }
                                    $scope.dataList= $filter('orderBy')($scope.dataList,$scope.queryParam.sort,true);
                                }
                            }
                            function produceCurrentObjList(){
                                angular.forEach($scope.dataList,function(obj){
                                   if(obj.isChoiced){
                                       $scope.currentObjList.push(obj);
                                   }
                                })
                            }
                            function init(){
                                if($scope.option){
                                    if($scope.option.loadEvent){
                                        $scope.loadDataList();
                                    };
                                    if($scope.option.filters){
                                        $scope.option.showFilter=true;
                                        $scope.queryParams={};
                                        angular.forEach($scope.option.filters,function(obj){
                                            if(!obj.placeholder){
                                                obj.placeholder='请输入'+obj.title;
                                            }
                                        })
                                    };
                                        if($scope.option['hidePagination']){
                                            $scope.option.hidePagination=true;
                                        }
                                        if($scope.option['multiple']){
                                            $scope.option.multiple=true
                                        }
                                }
                                console.log($scope.option);
                            }
                            init();
                        }]
                }).result.then(function(data){
                        //更改form表单状态
                        if($element.parents('form') && $element.parents('form')[0] && $element.parents('form')[0].name &&
                            $element.parents('form').scope()[$element.parents('form')[0].name] &&$element.parents('form').scope()[$element.parents('form')[0].name].$setDirty){
                            $element.parents('form').scope()[$element.parents('form')[0].name].$setDirty();
                        }
                    if(angular.isDefined($scope.choiceOption.choiceModelLabel)){
                        if($scope.choiceOption.handleResult && $scope.choiceOption.handleResult.choiceModelLabel){
                            if($scope.choiceOption.multiple){
                                $scope.choiceModelLabel=$scope.choiceOption.handleResult.choiceModelLabel(data);
                            }else{
                                if(angular.isUndefined($scope.choiceModelLabel)){
                                    $scope.choiceModelLabel = "";
                                }
                                $scope.choiceModelLabel = $scope.choiceOption.handleResult.choiceModelLabel(data[0]);
                            }
                        }else{
                            if($scope.choiceOption.multiple){
                                if(!$scope.choiceOption.choiceLabelKey){
                                    throw new Error("The choice-widget use 'multiple' property and 'choice-model-mabel' directive must be define 'choiceLabelKey' property");
                                }
                                var labels = null;
                                angular.forEach(data, function(val, key){
                                    if(labels == null){
                                        labels = val[$scope.choiceOption.choiceLabelKey]
                                    }else{
                                        labels = labels + ";" + val[$scope.choiceOption.choiceLabelKey]
                                    }
                                });
                                if(labels != null){
                                    $scope.choiceModelLabel = labels + ";";
                                }
                            }else{
                                if(angular.isUndefined($scope.choiceModelLabel)){
                                    $scope.choiceModelLabel = "";
                                }
                                $scope.choiceModelLabel=data[0][$scope.choiceOption.choiceLabelKey];
                            }
                        }
                    }
                    if(angular.isDefined($attrs.ngModel)){
                        if($scope.choiceOption.handleResult && $scope.choiceOption.handleResult.ngModel){
                            if($scope.choiceOption.multiple){
                                $scope.ngModel=$scope.choiceOption.handleResult.ngModel(data);
                            }else{
                                $scope.ngModel=$scope.choiceOption.handleResult.ngModel(data[0]);
                            }
                        }else{
                            if($scope.choiceOption.multiple){
                                $scope.ngModel= data;
                            }else{
                                $scope.ngModel= data[0][$scope.choiceOption.choiceValueKey];
                            }
                        }
                    }
                    if(angular.isDefined($attrs.choiceOption)){
                        if($scope.choiceOption && $scope.choiceOption.onChoice){
                            $scope.choiceOption.onChoice(data);
                        }
                    }

                },function(data){
                    if(data=='clear'){
                        if($element.parents('form') && $element.parents('form')[0] && $element.parents('form')[0].name &&
                            $element.parents('form').scope()[$element.parents('form')[0].name] &&$element.parents('form').scope()[$element.parents('form')[0].name].$setDirty){
                            $element.parents('form').scope()[$element.parents('form')[0].name].$setDirty();
                        }
                        if(angular.isDefined($attrs.choiceOption)){
                            if($scope.choiceOption && $scope.choiceOption.onChoice){
                                $scope.choiceOption.onChoice([]);
                            }
                        }
                        if(angular.isDefined($attrs.ngModel)){
                            if($scope.choiceOption && $scope.choiceOption.multiple){
                                $scope.ngModel = [];
                            }else{
                                $scope.ngModel='';
                            }
                        }
                        if(angular.isDefined($scope.choiceOption.choiceModelLabel)){
                            $scope.choiceModelLabel='';
                        }
                        if($attrs.choiceChange){
                            var t = $timeout(function(){
                                $scope.choiceChange();
                                $timeout.cancel(t);
                            })
                        }
                    }
                })
            }
        }]
    }
}]);

/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').factory('uiaConfig', [function(){
    return {
        loginUrl:"/login",
        logoutUrl:"/logout",
        accountInfoUrl:"/account",
        menuUrl:"/nav/menu"
    };
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-09.
 */
angular.module('uia').controller('AppUIACtrl', ['$scope', '$uibModal', 'uiaDialog','$timeout', '$interval',
    '$http', 'uiaConfig', '$rootScope',
function($scope, $uibModal, $dialog, $timeout, $interval, $http, uiaConfig, $rootScope){

    $rootScope.logOutUrl = uiaConfig.logoutUrl;
    var t = null;
    window.top.setSessionTimeout = function(time){
        if(t){
            $interval.cancel(t);
        }
        t = $interval(function(){
            $interval.cancel(t);
            $dialog.confirm("会话即将超时，会话将5分钟后失效，单击【确定】将保持当前会话。").then(function(){
                $http.get(uiaConfig.accountInfoUrl);
            });
        }, 1000 * 60 * 25);
    };
    $scope.appSetting = {
        aside:false,
        activeAside:false,
        menuToggler:false,
        showTabScroll:false,
        showFootprints:false,
        tabNav:true
    };
    //页面提示信息位置
    $scope.toasterOptions = {
        "position-class":"toast-bottom-right",
        "close-button":true
    };
    // 切换主题
    $scope.userSet=function(){
        $uibModal.open({
            templateUrl: 'user-setting-modal.html',
            resolve : {
                userSetting : function () {
                    if(localStorage.getItem('userSettings')){
                        var userSettings= JSON.parse(localStorage.getItem('userSettings'));
                        return userSettings;
                    }else{
                        return {
                            theme:'lightBlue',
                            tabNav:true
                        };
                    }
                }
            },
            size:"",
            windowClass:"user-setting-modal",
            controller: ["$scope", "$uibModalInstance","userSetting",function ($scope, $uibModalInstance,userSetting){
                $scope.userTheme=userSetting.theme;
                $scope.themesList=[
                    //梦之蓝，海之蓝，天之蓝，春意盎然，绿树成荫，秋高气爽，冬日暖阳 >>主题色，浅一级主题色，浅二级，tab导航/浅四级
                    {name:'blueDream',colors:[{color:'#015d79'},{color:'#126e8a'},{color:'#237f9b'},{color:'#45a1bd'}]},
                    {name:'blueOcean',colors:[{color:'#057ea5'},{color:'#168fb6'},{color:'#27a0c7'},{color:'#49c2e9'}]},
                    {name:'blueSky',colors:[{color:'#3296b7'},{color:'#43a7c8'},{color:'#54b8d9'},{color:'#76dafb'}]},
                    {name:'spring',colors:[{color:'#69a059'},{color:'#7ab16a'},{color:'#8bc27b'},{color:'#ade49d'}]},
                    {name:'summer',colors:[{color:'#367725'},{color:'#478836'},{color:'#589947'},{color:'#7abb69'}]},
                    {name:'vitalityOrange',colors:[{color:'#b35121'},{color:'#c46232'},{color:' #d57343'},{color:'#e68454'}]},
                    {name:'autumn',colors:[{color:'#9c6d4b'},{color:'#ad7e5c'},{color:'#be8f6d'},{color:'#e0b18f'}]},
                    {name:'winter',colors:[{color:'#827e6b'},{color:'#938f7c'},{color:'#a4a08d'},{color:'#c6c2af'}]},
                    {name:'chineseRed',colors:[{color:'#bf4444'},{color:'#D05555'},{color:'#e16666'},{color:'#f27777'}]},
                    {name:'lightBlue',colors:[{color:'#D1E2FF'},{color:'#E0ECFF'},{color:'#EDF4FF'},{color:'#F6FAFF'}]}

                ];
                angular.forEach($scope.themesList,function(obj,array,index){
                    if(obj.name==$scope.userTheme){
                        $scope.current=obj;
                    }
                });
                $scope.choice=function(obj){
                    $scope.current=obj;
                }
                //******开关***********
                $scope.switch=function(){
                    $scope.switchType?$scope.switchType=false:$scope.switchType=true;
                }

                $scope.yes = function(){
                    $uibModalInstance.close({
                        theme:$scope.current,
                        tabNav:$scope.switchType
                    });
                };
                $scope.no = function(){
                    $uibModalInstance.dismiss();
                };
                function init(){
                    //初始化时足迹为关闭状态
                    if(userSetting.tabNav!=undefined && userSetting.tabNav!=null){
                        $scope.switchType=userSetting.tabNav;
                    }else{
                        $scope.switchType=true;
                    }

                }
                init()
            }]
        }).result.then(function(result){
                if(result){
                    var userTheme=result.theme.name;
                    var userSetting={};
                    userSetting['theme']=userTheme;
                    userSetting['tabNav']=result.tabNav;
                    var setting= JSON.stringify(userSetting);
                    localStorage.setItem('userSettings',setting);
                    window.location.reload();
                };
            });
    };
    //判断tab里li的总宽度和
    var monitorTabLiWidthSum=function(){
        var TabLiWidthtotal = 0;
        angular.forEach(angular.element('#breadcrumbs .tab-header'),function(obj,array,index){
            TabLiWidthtotal+=obj.offsetWidth;
        });
        return TabLiWidthtotal;
    };
    //判断是否显示左右滚动按钮
    var judgeShowTabScroll=function(params){
        $scope.viewWidth = angular.element('#breadcrumbs').eq(0).width()-72;
        $scope.tabLiWidth = monitorTabLiWidthSum();
        if($scope.tabLiWidth>$scope.viewWidth){
            $scope.showTabScroll=true;
            if(!params){
                angular.element('#breadcrumb').animate({left : $scope.viewWidth - $scope.tabLiWidth-28 + 'px'},200,'linear');
            }
        }else{
            $scope.showTabScroll=false;
            angular.element('#breadcrumb').animate({left : 0 + 'px'},200,'linear');
        }
    };
    //初始化焦点给首页
    $scope.navActive = "100000";
    //打开tab页
    $scope.openTab = function(tabId, url, title){
        $scope.navActive = tabId;
        if(!hasTabId(tabId)){
            $scope.tabs.push({
                name:title,
                id:tabId,
                src:url
            });
            console.log("title:", title , "tabId:", tabId, "Url:", url);
            if(!$scope.appSetting.footprints){
                var t=$timeout(function(){
                    //打开新页面时监听tabLi的宽度，确定是否显示左右控制按钮
                    judgeShowTabScroll();
                    clearTimeout(t);

                },20)
            }
            //打开新页面时监听tab标签是否在收藏夹中
            judgeTabCollected();
        }
    };
    //改变焦点tab页
    $scope.changeCurrentTab = function(tab){
        $scope.navActive = tab.id;
    };
    //判断页面是否已经打开
    var hasTabId = function(id){
        for (var i = 0; i < $scope.tabs.length; i++) {
            var obj = $scope.tabs[i];
            if(obj.id == id){
                return true;
            }
        }
        return false;
    };
    //初始化tab导航
    $scope.tabs = [{
        name:"主页",
        id:"100000",
        src:"/home"
    }];
    //移除Tab标签
    var removeTab = function(tabId) {
        if (tabId == '100000') {
            $dialog.alert("首页不能关闭");
            return;
        }
        for (var i = 0; i < $scope.tabs.length; i++) {
            var obj = $scope.tabs[i];
            if (obj.id == tabId) {
                $scope.tabs.splice(i, 1);
            }
        }
        $scope.navActive = $scope.tabs[$scope.tabs.length - 1].id;
        if (!$scope.appSetting.footprints) {
            $timeout(function () {
                //关闭页面时监听tabLi的宽度，确定是否显示左右控制按钮
                judgeShowTabScroll('close');
            }, 30)
        }
    };
    //关闭所有Tab标签
    $scope.closeAllTab = function(){
        $dialog.confirm("是否关闭所有标签").then( function(){
            $scope.tabs.splice(1, $scope.tabs.length - 1);
            $scope.navActive = '100000';
        })
    };
    //关闭tab标签，要判断其内部页面是否有未保存数据
    $scope.closeTabByTabId = function(tabId){
        if(!tabId){
            return;
        }
        // 获取子窗口iframe对象
        var iframe = angular.element('#tabIFrame_' + tabId)[0];
        var formele=iframe.contentWindow.angular ? iframe.contentWindow.angular.element("form") : null;
        var elem = iframe.contentWindow.angular ? iframe.contentWindow.angular.element("#content") : null;
        if(formele && formele.length>0){
            for(i=0;i<formele.length;i++){
                var obj=formele.eq(i);
                var formScope = null;
                if(obj.scope() && obj.scope()[obj[0].name]){
                    formScope = obj.scope()[obj[0].name];
                }
                if(formScope && formScope.$dirty && !formScope.ignoreTip){
                    $dialog.confirm("编辑状态存在已修改且未保存的数据，是否确认关闭？").then(function(){
                        if (elem && elem.scope() && elem.scope().childrenTabClose){
                            elem.scope().childrenTabClose(tabId);
                        } else {
                            removeTab(tabId);
                        }
                    });
                    return;
                }else{
                    removeTab(tabId);
                }
            }
        }else{
            if(elem && elem.scope() && elem.scope().checkUpdatedForm && elem.scope().checkUpdatedForm.$dirty){
                $dialog.confirm("编辑状态存在已修改且未保存的数据，是否确认关闭？").then(function(){
                    removeTab(tabId);
                });
                return;
            }else{
                removeTab(tabId);
            }
        }
    };
    //关闭其它标签页
    $scope.closeOtherTab=function(item){
        $dialog.confirm("确定关闭其它所有标签").then( function(){
            $scope.rootTabs=[{
                name:"主页",
                id:"100000",
                src:"/home"
            }];
            if(item.id != "100000"){
                $scope.rootTabs.push(item);
            }
            $scope.tabs=$scope.rootTabs;
            angular.element('#breadcrumb').animate({left : 0 + 'px'},200,'linear');
            $scope.navActive=tabId;

        })
    };
    //定义父页面事件。子页面调父页面关闭页面
    window.PortalTab = {
        open:function(tabId, url, title){
            $scope.$apply(function(){
                $scope.openTab(tabId, url, title)
            })
        },
        removeTabByTabId:function(tabId){
            $scope.$apply(function(){
                $scope.closeTabByTabId(tabId)
            })
        }

    };
    //crumb左右移动
    //$scope.breadcrumbMove=function(point){
    //    var crumbTabs= angular.element('#breadcrumb').css('left');
    //    var crumbTabsLeft= parseInt(crumbTabs.slice(0,crumbTabs.length-2));
    //    var difference=$scope.viewWidth - $scope.tabLiWidth;
    //   if($scope.showTabScroll) {
    //        if(point=='left'){
    //            if(crumbTabsLeft < -200){
    //                angular.element('#breadcrumb').animate({left : crumbTabsLeft+200 + 'px'},300);
    //            }else if(-200<=crumbTabsLeft&&crumbTabsLeft<=0){
    //                angular.element('#breadcrumb').animate({left : 0 + 'px'},300);
    //            }
    //        }else if(point=='right'){
    //            if(crumbTabsLeft>difference){
    //                if(crumbTabsLeft-200>difference){
    //                    angular.element('#breadcrumb').animate({left : crumbTabsLeft-200 + 'px'},300);
    //                }else if(crumbTabsLeft-200<=difference){
    //                    angular.element('#breadcrumb').animate({left : difference-28 + 'px'},300);
    //                }
    //            }
    //        }
    //   }
    //};
    $scope.breadcrumbMove=function(point,param){
        var aniTime;
        if(param){
            param=param;
            aniTime=0;
        }else{
            param=240;
            aniTime=200;
        }
        var crumbTabs= angular.element('#breadcrumb').css('left');
        var crumbTabsLeft= parseInt(crumbTabs.slice(0,crumbTabs.length-2));
        var difference=$scope.viewWidth - $scope.tabLiWidth;
        if($scope.showTabScroll) {
            if(point=='left'){
                if(crumbTabsLeft < -param){
                    angular.element('#breadcrumb').animate({left : crumbTabsLeft+param + 'px'},aniTime,'linear');
                }else if(crumbTabsLeft >= -param && crumbTabsLeft <=0){
                    angular.element('#breadcrumb').animate({left : 0 + 'px'},aniTime,'linear');
                }
            }else if(point=='right'){
                if(crumbTabsLeft>difference){
                    if(crumbTabsLeft-param>difference){
                        angular.element('#breadcrumb').animate({left : crumbTabsLeft-param + 'px'},aniTime,'linear');
                    }else if(crumbTabsLeft-param<=difference){
                        angular.element('#breadcrumb').animate({left : difference-28 + 'px'},aniTime,'linear');
                    }
                }
            }
        }
    }
    //$scope.tabNavFocus=false;
    //鼠标在Tab导航里滚动滚轮，tab标签会左右移动
    function HandleScroll(e){
        var e=e||window.event;
        e.preventDefault();
        if(e.wheelDelta){
            if($scope.showTabScroll){
                if(e.wheelDelta>0){
                    $scope.breadcrumbMove('left',e.wheelDelta);
                }else if(e.wheelDelta<0){
                    var count=-e.wheelDelta/120;
                    $scope.breadcrumbMove('right',-e.wheelDelta);
                }
            }
        }
    }
    $scope.scrollEvent=function(bool,$event){
        if(bool){
            $event.target.addEventListener('mousewheel',HandleScroll,false);
            //window.onmousewheel=document.onmousewheel=HandleScroll;
        }else{
            $event.target.removeEventListener('mousewheel',HandleScroll,false);
        }
    }

    //收藏页面
    $scope.collectTabs=[];
    $scope.collectTab=function(tab){
        if(tab){
            if(!tab['collected']){
                tab['collected']=true;
                $scope.collectTabs.push(tab);
                setCollectTabs($scope.collectTabs);
                $dialog.alert('成功添加收藏');
            }else if(tab['collected']){
                tab['collected']=false;
                angular.forEach($scope.collectTabs,function(obj,index,array){
                    if(obj.id==tab.id){
                        $scope.collectTabs.splice(index,1);
                        setCollectTabs($scope.collectTabs);
                        $dialog.alert('已取消收藏');
                    }
                })
            }


        }
    };
    //在本地存储里存放收藏的数据
    function setCollectTabs(data){
        var userCollection={};
        userCollection['tab']=data;
        var userCollections= JSON.stringify(userCollection);
        localStorage.setItem('userCollections',userCollections);
    }
    //获取收藏信息
    function getCollectTabs(param){
        if(localStorage.getItem('userCollections')){
            var userCollections= JSON.parse(localStorage.getItem('userCollections'));
            console.log(userCollections);
            $scope.collectTabs=userCollections['tab'];
        }
        if(param){
            judgeTabCollected();
        }
    }
    function judgeTabCollected(){
        if($scope.collectTabs.length){
            angular.forEach($scope.tabs,function(obj,index,array){
                obj['collected']=false;
                angular.forEach($scope.collectTabs,function(member,index,array){
                    if(obj.id==member.id){
                        obj['collected']=true;
                    }
                })
            })
        }else{
            angular.forEach($scope.tabs,function(member,index,array){
                member['collected']=false;
            })
        }
    }
    //弹窗选择已收藏的页面
    $scope.myCollections=function(){
        $uibModal.open({
            templateUrl:'user-collections.html',
            resolve:{
                collectTabs:function(){
                    return $scope.collectTabs
                }
            },
            size:'',
            windowClass:'user-setting-modal user-collections',
            controller:['$scope','$uibModalInstance','collectTabs','$timeout', function($scope, $uibModalInstance, collectTabs, $timeout){
                $scope.collectTabs=angular.copy(collectTabs);
                $scope.currentList=[];
                $scope.removeCollection=function(item,$event){
                    $event.stopPropagation();
                    item.unCollected=true;
                    var t=$timeout(function(){

                        angular.forEach($scope.collectTabs,function(obj,index,array){
                            if(obj.id==item.id){
                                $scope.collectTabs.splice(index,1);
                                //存，取，(取的时候传参数则，取完之后自动判断)
                                setCollectTabs($scope.collectTabs);
                                getCollectTabs(true);
                            }
                        });
                        $timeout.cancel(t);
                    },100)
                };
                $scope.choice=function(item){
                    item.choiced=!item.choiced;
                };
                $scope.choiceSave=function(item){
                    $scope.currentList=[];
                    $scope.currentList.push(item);
                    $uibModalInstance.close($scope.currentList);
                }
                $scope.addCurrentList=function(){
                    angular.forEach($scope.collectTabs,function(obj,index,array){
                        if(obj.choiced){
                            $scope.currentList.push(obj);
                        }
                    })
                };
                $scope.clearAll=function(){
                    if($scope.collectTabs.length){
                        $dialog.confirm('确定清空收藏夹').then(function(){
                            $scope.collectTabs=[];
                            setCollectTabs($scope.collectTabs);
                            getCollectTabs(true);
                            var t=$timeout(function(){
                                $uibModalInstance.dismiss();
                                $dialog.alert('已清空收藏夹');
                                $timeout.cancel(t);
                            },500)
                        })
                    }
                };
                $scope.yes = function(){
                    $scope.addCurrentList();
                    $uibModalInstance.close($scope.currentList);
                };
                $scope.no = function(){
                    $uibModalInstance.dismiss();
                };
            }]

        }).result.then(function(data){
                if(data.length>0){
                    angular.forEach(data,function(obj,index,arry){
                        angular.forEach($scope.tabs,function(member,index,array){
                            if(obj.id!=member.id){
                                $scope.openTab(obj.id, obj.src, obj.name);
                            }
                        })
                    })
                }
            })
    }
    //刷新页面
    $scope.refresh=function(tab){
        document.getElementById('tabIFrame_'+tab.id+'').contentWindow.location.reload(true)
    }
    //监测tabNav是否显示或隐藏
    var judgeTabNav=function(){
        if(localStorage.getItem('userSettings')) {
            var userSettings = JSON.parse(localStorage.getItem('userSettings'));
            if (userSettings.tabNav) {
                $scope.appSetting.tabNav=true;
            } else if (!userSettings.tabNav){
                $scope.appSetting.tabNav=false;
            }
        }
    }
    //*********************查看我的权限*******************
    $scope.myAuthority=function(){
        var myauthorities={
            src:"./account/account.jsp",
            id:"41042519920422",
            name:"我的账户"
        };
        $scope.openTab(myauthorities.id,myauthorities.src,myauthorities.name);
    };
    //初始化
    var init = function(){
        judgeTabNav();
        //定义父页面window事件，报表要用
        window.removeTab = removeTab;
        //初始化获取收藏页面，并判断
        getCollectTabs(true);
    };
    init();
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').directive('uiaDate',["uibDateParser", "$filter",  function(dateParser, $filter){
    var dateFilter = $filter('date');
    return {
        require:'ngModel',
        scope:{
            uiaDateOption:"="
        },

        link : function(scope,elem,attr,ctrl){
            var dateConfig = scope.uiaDateOption;
            var config = angular.extend({
                format: "yyyy-mm-dd",
                autoclose: true,
                todayBtn: true,
                minView:2,
                startDate: dateParser.parse('1900-01-01', 'yyyy-MM-dd'),
                endDate: dateParser.parse('2100-01-01', 'yyyy-MM-dd'),
                forceParse:true,
                keyboardNavigation:true,
                pickerPosition: "bottom-left",
                language:'zh-CN'
            }, dateConfig);
            //月份
            if(config.valueType=='month'){
                config.format='yyyy-mm';
                config.startView=3;
                config.minView=3;
            }
            // 年份
            if(config.valueType == 'year'){
                config.format = 'yyyy';
                config.startView = 4;
                config.minView = 4;
            }


            $(elem).datetimepicker(config).on('change',function(){
                scope.$apply(function(){
                    ctrl.$setViewValue(elem.val());
                });
            }).addClass('uia-date').attr("readonly", true);

            ctrl.$formatters.push(function (value) {
                if (angular.isNumber(value) && config.format == 'yyyy-mm-dd') {
                    return dateFilter(value, 'yyyy-MM-dd'); //format
                }
                return value;
            });
            ctrl.$parsers.unshift(function (value) {
                if (angular.isString(value) && value.length > 0) {
                    if(config.valueType == 'yyyy-MM-dd'){
                        return value;
                    }else if(config.valueType == 'year'){
                        return parseInt(value);
                    }else{
                        var reg = new RegExp(/^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)/);
                        if(reg.test(value)){
                            return new Date(dateParser.parse(value, 'yyyy-MM-dd')).getTime();
                        }
                        return value;
                    }
                } else {
                    if(angular.isNumber(value) && value.length > 0){
                        if(config.valueType == 'year'){
                            return value;
                        }
                        return new Date(dateParser.parse(value, 'yyyy-MM-dd')).getTime();
                    }
                    return value;
                }
            });

            // 添加清除按钮
            $(elem).next("span").children("button").bind('click', function(){
                $(elem).datetimepicker("show");
            });
            //兼容点击按钮组日历图标显示控件
            $(elem).next("span").children("button").bind('click', function(){
                $(elem).datetimepicker("show");
            })
        }
    }
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').factory("uiaDialog", ["$q", "toaster", "$uibModal", "$timeout", function ($q, toaster, $uibModal, $timeout) {
    return {
        reload: function(option){
            var defaultConfig = {
                url: "/"
            };
            angular.extend(defaultConfig, option);
            var paramstr = "";
            if (option.params) {
                paramstr = "?";
                for(var prop in option.params){
                    if(option.params[prop] !== null){
                        paramstr = paramstr + prop + "=" + encodeURIComponent(option.params[prop]) + "&";
                    }
                }
            }
            window.location.href = defaultConfig.url + paramstr;
        },
        modal: function (option, style) {
            var defaultConfig = {
                url: "/"
            };
            angular.extend(defaultConfig, option);
            var paramstr = "";
            if (option.params) {
                paramstr = "?";
                for(var prop in option.params){
                    if(angular.isDefined(option.params[prop])){
                        paramstr = paramstr + prop + "=" + encodeURIComponent(option.params[prop]) + "&";
                    }
                }
            }
            var layerInstance = layer;
            if(parent.layer){
                layerInstance = parent.layer;
            }
            layerInstance.open({
                title:option.title,
                type: 2,
                area: '860px',
                fixed: false, //不固定
                maxmin: true,
                content: defaultConfig.url + paramstr,
                success:function(dom, index){
                    // 修复iframe高度
                    var bodyFrame,
                        bodyDom,
                        layerDiv,
                        layerFrame;
                    bodyFrame = layer.getChildFrame('body', index);
                    bodyDom = bodyFrame[0];
                    layerFrame = $("#layui-layer-iframe" + index);
                    layerDiv = $("#layui-layer" + index);
                    layerDiv.height(bodyDom.scrollHeight);
                    layerFrame.height(bodyDom.scrollHeight);
                },
                cancel: function(index){
                    bodyFrame = layer.getChildFrame('body', index);
                    //return false 开启该代码可禁止点击该按钮关闭
                }
            });
        },
        modalTab: function (option, style) {
            if (!option.id || !option.url || !option.name) {
                throw new Error("$dialog.modalTab parameter: 'id', 'url', 'name' property value must be not null");
            }
            var paramstr = "";
            if (option && option.params) {
                paramstr = "?";
                for(var prop in option.params){
                    if(option.params[prop] !== null){
                        paramstr = paramstr + prop + "=" + encodeURIComponent(option.params[prop]) + "&";
                    }
                }
            }
            if(option && option.id){
                option.id = option.id.replace('.','');
            }
            if(window.top.PortalTab){
                window.top.PortalTab.open(option.id, option.url + paramstr, option.name, null);
            }else{
                if(style){
                    window.open(option.url + paramstr, '_blank' , style);
                }
                window.open(option.url + paramstr, '_blank', 'status,scrollbars=yes,resizable,left=10,top=0,width=1000,height=600');
            }
        },
        alert: function (option) {
            var defaultConfig = {
                type:"info",
                //title: "提示",
                timeout: 5000,
                bodyOutputType: 'trustedHtml'
            };
            if (!angular.isObject(option)) {
                defaultConfig.text = option;
            }
            angular.extend(defaultConfig, option);
            toaster.pop(defaultConfig.type, defaultConfig.title, defaultConfig.text, defaultConfig.timeout, defaultConfig.bodyOutputType);
        },
        cancel: function(){
            return this.confirm("存在已修改且未保存的数据，是否确认关闭？");
        },
        confirm: function (msg, option) {
            var deferred,
                layerInstance;
            deferred = $q.defer();
            var config = {
                btn: ['确认', '取消'] //按钮
            };
            if(option){
                config = angular.extend(config, option);
            }
            if(window.parent){
                layerInstance = parent.layer;
            }else{
                layerInstance = layer;
            }
            layerInstance.confirm(msg, config, function(index){
                layerInstance.close(index);
                deferred.resolve();
            }, function(index){
                layerInstance.close(index);
                deferred.reject();
            });
            return deferred.promise;
        }
    }
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-13.
 */
angular.module('uia').directive("uiaSelect", ['$compile', '$timeout', 'SelectAPI', function($compile, $timeout, SelectAPI){
    return {
        restrict: 'A',
//        transc lude : true, //嵌入
        scope: {
            dictCode: "=",
            dictParentCode: "=",
            dictSource: "=",
            ngModel : "="
        },
        require: ['?ngModel', 'select'],
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'uia/template/dictionary.html';
        },
        link: function(scope, elem, attrs, ctrls){
            scope.isChange = false;
            if(angular.isUndefined(attrs.dictCode)){
                throw new Error("directive dict must be define 'dict-code'.");
            }else{
                scope.dictCode = scope.dictCode || attrs.dictCode;
            }
            if(angular.isDefined(attrs.dictParentCode)){
                scope.$watch("dictParentCode", function(newVal , oldVal){
                    if(newVal != oldVal){
                        if(!newVal){
                            scope.dictInfoList = [];
                            scope.ngModel = null;
                        }else{
                            getDictInfoList();
                        }
                    }
                });
            }
            if(angular.isDefined(attrs.dictSource)){
                scope.dictSource =  attrs.dictSource;
            }
//            scope.dictCode = attrs.dictCode;
            scope.$watch("ngModel", function(newVal , oldVal){
                if(newVal == null){
                    scope.ngModel = null;
                }
                if(newVal != oldVal){
                    angular.forEach(scope.dictInfoList, function(value , index){
                        var code = scope.ngModel;
                        if(value.dictCode == code){
                            scope.dictInfoList[index].selected = true;
                        }
                    });
                }
            });
            var getDictInfoList = function(){
                scope.dictInfoList = [];
                SelectAPI.query({
                    parentCode:  scope.dictParentCode,
                    dictSource: scope.dictSource,
                    typeCode : scope.dictCode
                }).$promise.then(function(data){
                    scope.dictInfoList = data;
                    var change = true;
                    angular.forEach(scope.dictInfoList, function(value , index){
                        var code = scope.ngModel;
                        if(value.dictCode == code){
                            scope.dictInfoList[index].selected = true;
                            change = false;
                        }
                    });
                    if(change){
                        scope.ngModel = null;
                    }

                    //$(elem).trigger("liszt:updated");
                });
            };
            if(!angular.isDefined(attrs.dictParentCode) || (angular.isDefined(attrs.dictParentCode) && scope.dictParentCode) ){
                getDictInfoList();
            }
        }
    }
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').directive('uiaForm',['$uiaValidateDefault', '$timeout', function($uiaValidateDefault, $timeout){
    return{
        restrict:'A',
        require: 'form',
        scope:{
            validateOption:"="
        },
        link: function(scope, element, attr, ctrl){
            // scope.storeData = null;
            // scope.$watch('formModel', function(newVal, oldVal){
            //     if(!ctrl.$dirty){
            //         scope.storeData = angular.copy(newVal);
            //     }
            // }, true);
            // ctrl.persisted = function(data){
            //     scope.storeData = angular.copy(data);
            //     ctrl.$dirty = false;
            // };
            ctrl.lock = function(){
                findInputEle(true);
                ctrl.locked = true;
                // scope.formModel = angular.copy(scope.storeData);
                layer.closeAll();
            };
            ctrl.unlock = function(){
                findInputEle(false);
                ctrl.locked = false;
            };
            var findInputEle = function(locked){
            	$timeout(function(){
                    $(element).find("input,select,textarea").each(function(){
                        var isIgnore = $(this).attr('ignore-disabled');
                        if(isIgnore == undefined){
                            $(this).attr('disabled', locked).trigger("chosen:updated");
                        }
                    });
				});
            }
            if(attr.ignoreTip && attr.ignoreTip == 'true'){
                ctrl.ignoreTip = true;
            }
            var option = scope.validateOption;
            option = angular.extend({}, $uiaValidateDefault, option );
            ctrl.validateConfig = angular.copy(option);
            ctrl.validate = function(){
                if($(element).validate(ctrl.validateConfig).form() && $(element).validate(ctrl.validateConfig).valid()){
                    return true;
                }
                return false;
            };
            // var error = "<span class='error'> *</span>";
            // // html 依赖
            // $(element).find("input[required]").each(function(){
            //     addError(this);
            // });
            // $(element).find("select[required]").each(function(){
            //     addError(this);
            // });
            if($(element).find("input[uia-date]").datetimepicker){
                $(element).find("input[uia-date]").datetimepicker().on('changeDate', function(ev){
                    $(ev.target).valid();
                });
            }
            // js 依赖
            $timeout(function(){
                angular.forEach(option.rules, function(rule, index){
                    var target = $(element).find("[name='" + index + "']");
                    target.attr('required', true);
                    // addError(target);
                })
            }, 1000);
            // function addError(target){
            //     var next = $(target).next();
            //     if(target['type'] == 'hidden' || next[0] != null && next[0].nodeName == 'SPAN'){
            //         return;
            //     }
            //     if(next[0] != null && next[0].nodeName == 'DIV'){
            //         var nextDom = $(next).next();
            //         target = nextDom['prevObject']['0'];
            //     }
            //     $(error).insertAfter(target);
            // }
            var init = function(){
                // 默认锁定
                ctrl.lock();
            }
            init();
        }
    }
}]);
/**
 * Created by TANXINZHENG481 on 2017-01-20.
 */
angular.module('uia').directive('htmlBind', function($compile, $parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.$watch(attr.content, function() {
                element.html($parse(attr.content)(scope));
                $compile(element.contents())(scope);
            }, true);
        }
    }
}).controller('UiaGridController', ['$scope', '$filter', 'uiaDialog', '$uibModal', function ($scope, $filter, $dialog, $uibModal) {
    var defaultOption = {

    };
    $scope.gridOption = angular.extend(defaultOption, $scope.gridOption);
    $scope.queryParams = {};
    $scope.gridOption.pageInfo = {
        pageSize:10,
        pageNum:1
    };
    $scope.$watch('queryParams', function(){
        $scope.gridOption.pageInfo.pageNum = 1;
    }, true);
    $scope.search = function(){
        $scope.pageSetting.loading=true;
        $scope.gridOption.queryParams = $scope.queryParams;
        var params = angular.copy($scope.gridOption.queryParams) || {};
        if(!$scope.gridOption.pageInfo){
            $scope.gridOption.pageInfo = {
                pageSize:10,
                pageNum:1
            }
        }
        params.pageSize = $scope.gridOption.pageInfo.pageSize;
        params.pageNum = $scope.gridOption.pageInfo.pageNum;
        params.sorts = $scope.queryParams.sorts;
        angular.forEach(params, function(val, key){
            if(key == 'undefined' || key == 'null'){
                 delete params[key];
            }
        });
        var instance = $scope.gridOption.loadEvent(params);
        var promise;
        if(instance.$promise){
            promise = instance.$promise;
        }else if(instance.then && angular.isFunction(instance.then)){
            promise = instance;
        }

        promise.then(function(data){
            $scope.gridOption.data = data.data;
            $scope.gridOption.pageInfo = data.pageInfo;
        }).finally(function(){
            $scope.pageSetting.loading=false;
        });
    };
    // 设置filters属性默认值
    var initFilters = function(filters){
        angular.forEach(filters, function(val, key){
            if(!filters[key].placeholder){
                filters[key].placeholder = '请输入' + filters[key].title;
            }
            if(val.type == 'select' && val.disableSearch == undefined){
                val.disableSearch = true;
            }
        });
    };
    var initColumns = function(columns){
        angular.forEach(columns, function(val, key){
            if(!val.type){
                val.type = 'text';
            }
            if(val.type == 'checkbox' && val.checked == undefined){
                val.checked = function(item){
                    if(item[val['name']]){
                        return true;
                    }
                    return false;
                }
            }
        });
    };
    $scope.formatterValue = function(val, column){
        switch (column.type){
            case "text":
                if(column.formatter){
                    return $filter(column.formatter)(val);
                }
                return val;
                break;
            // 日期
            case "date":
                if(!column.formatter){
                    return $filter('date')(val, 'yyyy-MM-dd hh:ss:mm');
                }
                return $filter('date')(val, column.formatter);
                break;
            // 常用币种
            case "currency":
                if(!column.formatter){
                    return $filter('currency')(val, '');
                }
                return $filter('currency')(val, column.formatter);
                break;
            // 万元
            case "million":
                if(!column.formatter){
                    return $filter('currency')(val, '', 4);
                }
                return $filter('currency')(val, column.formatter, 4);
                break;
            case "number":
                var fractionSize = 2;
                if(column.fractionSize){
                    fractionSize = column.fractionSize;
                }
                return $filter('number')(val, fractionSize);
                break;
            default :
                return val;
        }
    };
    $scope.currentChoiceItem = null;
    $scope.currentChoiceItem = null;
    //$scope.choiceEvent = function(item){
    //    if($scope.currentChoiceItem && $scope.currentChoiceItem.$$hashKey == item.$$hashKey){
    //        $scope.currentChoiceItem = null;
    //    }else{
    //        $scope.currentChoiceItem = item;
    //        $scope.currentChoiceItem.isChoice = $scope.currentChoiceItem.isChoice ? true : false;
    //    }
    //};
    $scope.gridSetting = {};
    // 全选
    $scope.checkAll = function(){
        if(!$scope.gridOption.data){
            return;
        }
        for (var i = 0; i < $scope.gridOption.data.length; i++) {
            $scope.gridOption.data[i].checked = $scope.gridSetting.checkAll;
        }
        var num = 0;
        for (var i = 0; i < $scope.gridOption.data.length; i++) {
            if($scope.gridOption.data[i].checked){
                $scope.currentChoiceItem = $scope.gridOption.data[i];
                num++;
            }
        }
        if(num != 1){
            $scope.currentChoiceItem = null;
        }
    };
    // 子集控制全选
    $scope.changeItemChecked = function(){
        if(!$scope.gridOption.data){
            return;
        }
        var num = 0;
        for (var i = 0; i < $scope.gridOption.data.length; i++) {
            if($scope.gridOption.data[i].checked){
                $scope.currentChoiceItem = $scope.gridOption.data[i];
                num++;
            }
        }
        // 子集勾选数量等于集合总数则勾选全选，否则取消全选
        if(num == $scope.gridOption.data.length){
            $scope.gridSetting.checkAll = true;
        }else{
            $scope.gridSetting.checkAll = false;
        }
        if(num != 1){
            $scope.currentChoiceItem = null;
        }
    };
    $scope.iconsort = false;
    $scope.sort = function(name){
        $scope.iconsort = name;
        if($scope.sortway){
            $scope.sortway = false;
            $scope.queryParams.sorts = name;
        }else{
            $scope.sortway = true;
            $scope.queryParams.sorts = "-" + name;
        }
        $scope.search();
    };
    $scope.filterOpen = true;
    $scope.openFilter = function(){
        $scope.filterOpen = !$scope.filterOpen;
    };
    $scope.removeEvent = function(){
        if(!$scope.currentChoiceItem){
            $dialog.alert("请先选择单据");
            return;
        }
        if($scope.gridOption.removeBtn && angular.isFunction($scope.gridOption.removeBtn.click)){
            $scope.gridOption.removeBtn.click($scope.currentChoiceItem);
            return;
        }
        $scope.gridOption.ApiService.delete($scope.currentChoiceItem).$promise.then(function(){
        	$dialog.alert("删除成功");
        	$scope.search();
		})
    };
    $scope.viewEvent = function(item){
        if(!item && !$scope.currentChoiceItem){
            $dialog.alert("请先选择单据");
            return;
        }
        if(item){
            $scope.currentChoiceItem = item;
        }
        $scope.viewModal(angular.copy($scope.currentChoiceItem));
    };
    $scope.viewModal = function(item){
    	$uibModal.open({
			templateUrl: "box.modal.html",
            resolve:{
				Item: function(){
					return item;
				},
				BoxOption: function(){
                    $scope.gridOption.boxOption.title = $scope.gridOption.title;
					return $scope.gridOption.boxOption;
				},
				ApiService: function(){
					return $scope.gridOption.ApiService;
				}
			},
			controller:['$scope', 'Item', 'BoxOption', 'ApiService', 'uiaDialog', '$uibModalInstance',
			function($scope, item, BoxOption, ApiService, uiaDialog, $uibModalInstance){
				if(BoxOption){
					$scope.boxOption = BoxOption;
					$scope.boxOption.cancelBtn = {
						click:function(){
                            $scope.cancel();
						}
					};
                    $scope.boxOption.saveBtn = {
                        callback:function(){
                            uiaDialog.alert('数据更新成功');
                            $uibModalInstance.close();
                        }
                    }
				}
				if(item){
                    $scope.boxOption.formData = item;
				}
				$scope.cancel = function(){
                    $uibModalInstance.dismiss();
				};
			}]
		}).result.finally(function(){
            $scope.search();
		});
	};
    // 新增
    $scope.addEvent = function(){
        if($scope.gridOption.viewBtn && $scope.gridOption.viewBtn.click && angular.isFunction($scope.gridOption.viewBtn.click)){
            $scope.gridOption.viewBtn.click();
            return;
        }
        $scope.viewModal({});
    };
    //双击
    $scope.dbcEvent = function(item){
        $scope.currentChoiceItem = item;
        $scope.viewEvent($scope.currentChoiceItem);
    };
    // 重置
    $scope.reset = function(){
        if($scope.backup && $scope.backup.queryParams){
            $scope.queryParams=angular.copy($scope.backup.queryParams);
        }else{
            $scope.queryParams = {};
        }
        $scope.search();
    };
    // 导出
    $scope.exportEvent = function(){
        if($scope.gridOption.exportBtn && angular.isFunction($scope.gridOption.exportBtn.click)){
            $scope.gridOption.exportBtn($scope.queryParams);
        }
    };
    // 导入
    $scope.importEvent = function(file){
        if($scope.gridOption.importBtn && angular.isFunction($scope.gridOption.importBtn.click)){
            $scope.gridOption.importBtn(file);
        }
    };
    var init = function(){
        $scope.pageSetting={
            loading:false
        }
        initColumns($scope.gridOption.columns);
        initFilters($scope.gridOption.filters);
        if($scope.gridOption.queryParams){
            $scope.queryParams = $scope.gridOption.queryParams;
        }
        $scope.search();
        $scope.gridOption.refresh=$scope.search;
    };
    init();
}]).directive('uiaGrid', [function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true, //嵌入
        scope: {
            gridOption: "="
        },
        link:function(scope, element, attr, ctrl){
            if(!attr.gridOption){
                throw new Error('the "uia-grid" directive must be define "grid-option"');
            }
        },
        templateUrl: function($element, $attr){
            return $attr.templateUrl || 'uia/template/grid.html';
        },
        controller:"UiaGridController"
    };
}]);

/**
 * Created by TANXINZHENG481 on 2017-01-20.
 */
angular.module('uia').run(['$uibModal', 'uiaMessage', function($uibModal, uiaMessage){
    uiaMessage.subscribe("login", function(){
        $uibModal.open({
            templateUrl: 'uia/template/login-dialog.html',
            //size:"sm",
            backdrop: 'static',
            windowTopClass:"isParent",
            appendTo: $(window.parent.document.body),
            controller:["$scope", "$uibModalInstance", "$http", "uiaConfig", function($scope, $modalInstance, $http, uiaConfig){
                $scope.user = {};
                $scope.loginDialogForm = {};
                $scope.change = function(evt){
                    $(evt.target).valid();
                };
                $scope.loginBtnLoading = false;
                $scope.login = function(){
                    $scope.loginBtnLoading = true;
                    $http.post(uiaConfig.ajaxLoginUrl, null, {
                        params:{
                            j_username: $scope.user.username,
                            j_password: $scope.user.password
                        }
                    }).then(function(data){
                        if(data.status == 200){
                            $modalInstance.close();
                        }
                    })['finally'](function(){
                        $scope.loginBtnLoading = false;
                    });
                };
                $scope.no = function(){
                    $modalInstance.dismiss();
                };
            }]
        });
    });
}]);

/**
 * Created by TANXINZHENG481 on 2017-06-09.
 */
angular.module("uia").factory('uiaMessage', ['$rootScope', function ($rootScope) {
    // private notification messages
    var _DATA_UPDATED_ = '_DATA_UPDATED_';
    /*
     * @name: publish
     * @description: 消息发布者，只用$emit冒泡进行消息发布的低能耗无污染方法
     * @param: {string=}: msg, 要发布的消息关键字，默认为'_DATA_UPDATED_'指数据更新
     * @param: {object=}: data，随消息一起传送的数据，默认为空
     * @example:
     *         pubSubService.publish('config.itemAdded', {'id': getID()});
     *         更一般的形式是：
     *      pubSubService.publish();
     */
    var publish = function (msg, data) {
        msg = msg || _DATA_UPDATED_;
        $rootScope.$emit(msg, data);
    };
    /*
     * @name: subscribe
     * @description: 消息订阅者
     * @param: {function}: 回调函数，在订阅消息到来时执行
     * @param: {object=}: 控制器作用域，用以解绑定,默认为空
     * @param: {string=}: 消息关键字，默认为'_DATA_UPDATED_'指数据更新
     * @example:
     *         pubSubService.subscribe(function(event, data) {
     *        $scope.power = data.power;
     *            $scope.mass = data.mass;
     *        },  $scope, 'data_change');
     *        更一般的形式是：
     *        pubSubService.subscribe(function(){});
     */
    var subscribe = function (msg, func, scope) {
        if (!angular.isFunction(func)) {
            console.log("pubSubService.subscribe need a callback function");
            return;
        }
        msg = msg || _DATA_UPDATED_;
        var unbind = $rootScope.$on(msg, func);
        //可控的事件反绑定机制
        if (scope) {
            scope.$on('$destroy', unbind);
        }
    };

    // return the publicly accessible methods
    return {
        publish:        publish,
        subscribe:      subscribe
    };
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-15.
 */
angular.module('uia').directive('uiaNumber',['$timeout', function($timeout){
    return {
        require:'ngModel',
        scope:{
            uiaNumberOption:"=?",
            numberType:'@'
        },
        link: function(scope, element, attr, ngModel){
            var config = {

            };
            scope.uiaNumberOption = scope.uiaNumberOption || {};
            scope.uiaNumberOption = angular.extend(config, scope.uiaNumberOption);
            if(attr.numberType){
                scope.uiaNumberOption.type = scope.numberType;
            }
            var type = angular.copy(scope.uiaNumberOption.type);
            switch (type){
                case 'percentage':
                    $(element).inputmask({
                        alias:'percentage',
                        placeholder:"",
                        suffix:' % ',
                        max:9999999999,
                        autoUnmask:true,
                        rightAlign:false,
                        onUnMask:function(maskedValue, unMaskedValue){
                            var float = parseFloat(unMaskedValue);
                            if(float && !isNaN(float)){
                                float = float/100;
                            }
                            // 修复因jquery.validate校验时required校验value.length > 0的问题（数字无length属性）
                            return float+"";
                        }
                    });
                    ngModel.$formatters.push(function (value) {
                        if(value != "" && value != null && value != undefined){
                            var num = parseFloat(value);
                            if (!isNaN(num) && angular.isNumber(num)) {
                                return (value * 100); //format
                            }
                        }
                        return value;
                    });
                    break;
                case 'integer':
                    $(element).inputmask({
                        alias:'integer',
                        digits:0,
                        suffix:' ',
                        placeholder:"",
                        max:999999999999,
                        rightAlign:false
                    });
                    break;
                case 'decimal':
                    $(element).inputmask({
                        alias:'numeric',
                        placeholder:"",
                        suffix:' ',
                        max:999999999999,
                        rightAlign:false
                    });
                    break;
                case 'million':
                    $(element).inputmask({
                        alias:'currency',
                        placeholder:"",
                        suffix:' ',
                        autoUnmask:true,
                        rightAlign:false,
                        prefix:'',
                        digits: 4
                    });
                    break;
                case 'currency':
                    $(element).inputmask({
                        alias:'currency',
                        placeholder:"",
                        suffix:' ',
                        autoUnmask:true,
                        rightAlign:false,
                        prefix:'',
                        digits: 2
                    });
                    break;
                default :
                    break;
            }
        }
    }
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').directive('uiaPagination', [function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true, //嵌入
        scope: {
            pageInfo: "=",
            loadParameter:"=",
            loadEvent:"&"
        },
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'uia/template/pagination.html';
        },
//        templateUrl:'/template/pagination-tpl.html',//模板url
        controller: ['$scope', '$attrs', function ($scope, $attrs) {
            $scope.maxSize = 10;
            $scope.pageInfo = angular.extend($scope.pageInfo,{
                showSkip: true,
                showTotal: true,
                total: 0,
                showPageNum: true,
                pageSize: 10,
                pageNum: 1,
                styleCss: 1
            });
//            $scope.pageConfig = angular.extend($scope.pageConfig, $scope.pageInfo.pageConfig);
            $scope.$watch('pageInfo', function (newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    $scope.load();
                }
            });
            $scope.load = function () {
                $scope.curPage = $scope.pageInfo.pageNum;//当前页
                $scope.pageSize = $scope.pageInfo.pageSize;//每页总条数
                $scope.total = $scope.pageInfo.total ? $scope.pageInfo.total : 0;//总条数
                if ($scope.pageInfo.pages) {
                    $scope.pages = $scope.pageInfo.pages
                } else {
                    $scope.pages = 1
                }
                $scope.pageList = [];
                for (var i = 1; i <= $scope.pages; i++) {
                    var page = {
                        isDisabled: false,
                        num: i,
                        isOmit: false,
                        text: "",
                        isShow: true
                    };
                    //如果页码等于当前页禁用点击
                    if (page.num == $scope.curPage) {
                        page.isDisabled = true;
                    }
                    //总页数小于7，显示所有分页
                    if ($scope.pages < 7) {
                        $scope.pageList.push(page);
                    } else {
                        //小于3
                        if (i == 1) {
                            $scope.pageList.push(page);
                            continue;
                        }
                        //大于最后2页
                        if (i == $scope.pages) {
                            $scope.pageList.push(page);
                            continue;
                        }
                        if ($scope.curPage >= 1 && $scope.curPage <= $scope.pages) {
                            if (($scope.curPage - 1) == i || ($scope.curPage + 1) == i || i == $scope.curPage) {
                                if (($scope.curPage - 1) == i && i != $scope.curPage) {
                                    var page2 = angular.copy(page);
                                    page2.isOmit = true;
                                    page2.text = "...";
                                    page2.num = "...";
                                    if (i != 2) {
                                        //$scope.pageList.push(page2);
                                    }
                                    $scope.pageList.push(page);
                                } else if (($scope.curPage + 1) == i && i != $scope.curPage) {
                                    $scope.pageList.push(page);
                                    var page2 = angular.copy(page);
                                    page2.isOmit = true;
                                    page2.text = "...";
                                    page2.num = "...";
                                    if (i != ($scope.pages - 1)) {
                                        // $scope.pageList.push(page2);
                                    }
                                }
                                if (i == $scope.curPage) {
                                    $scope.pageList.push(page);
                                }
                            }
                        }
                    }
                }
            };
            $scope.$watch("maxSize", function(newVal, oldVal){
                if(newVal != oldVal){
                    var oldMax = parseInt(oldVal);
                    var newMax = parseInt(newVal);
                    if(oldMax < newMax){
                        $scope.pageInfo.pageNum = 1;
                        $scope.pageInfo.pageSize = newMax;
                    }else{
                        $scope.pageInfo.pageSize = newMax;
                    }
                    if($attrs.loadEvent){
                        $scope.loadEvent();
                    }else{
                        $scope.pageInfo.loadData();
                    }
                }
            });
            $scope.skipPage = function (num) {
                num = parseInt(num);
                if (num <= $scope.pages && num >= 1) {
                    $scope.pageInfo.pageNum = num;
                } else if (num > $scope.pages) {
                    $scope.pageInfo.pageNum = angular.copy($scope.pages);
                    $scope.inPageNo = angular.copy($scope.pages);
                } else if (num < 1) {
                    $scope.pageInfo.pageNum = 1;
                    $scope.inPageNo = 1;
                }
                if($attrs.loadEvent){
                    $scope.loadEvent();
                }else{
                    $scope.pageInfo.loadData();
                }
            };
            $scope.$watch("loadParameter", function(newVal, oldVal){
                if(newVal != oldVal){
                    $scope.pageInfo.pageNum = 1;
                    if($attrs.loadEvent){
                        $scope.loadEvent();
                    }else{
                        $scope.pageInfo.loadData();
                    }
                }
            }, true);
            $scope.load();
        }]
    };
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-08.
 */
angular.module('uia').factory("$UrlUtils", ["$location", function ($location) {
    return {
        getParameters: function () {
//            var params = {};
//            var obj = $location.search();
//            for (var key in obj) {
//                params[key] = obj[key];
//            }
//            return params;
            var url = location.search; //获取url中"?"符后的字串
            var theRequest = {};
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for(var i = 0; i < strs.length; i ++) {
                    theRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        /**
         * 获取url参数字符串
         * @returns {{}}
         */
        getParamsUrlString: function () {
            var params = "";
            var obj = $location.search();
            for (var key in obj) {
                params += key + "=" + encodeURIComponent(obj[key]);
                params += "&";
            }
            params = params.substring(0,params.length-1);
            return "?" + params;
        }
    }
}]).factory('HttpInterceptor', ["$q", "$injector", function ($q, $injector) {
    var uiaMessage,
        $dialog;
    return {
        request: function (config) {
            if(window.top.setSessionTimeout && angular.isFunction(window.top.setSessionTimeout)){
                window.top.setSessionTimeout(new Date().getTime());
            }
            if (config.method == 'GET') {
                if(config.headers['X-Requested-With'] == "XMLHttpRequest" && !config.cache){
                    if(config.params){
                        config.params._noCache = new Date().getTime();
                    }else {
                        config.params = {
                            noCache : new Date().getTime()
                        }
                    }
                }
            }
            return config;
        },
        responseError: function (response, data) {
            $dialog = $dialog || $injector.get("uiaDialog");
            uiaMessage = uiaMessage || $injector.get("uiaMessage");
            if (response.status == 400) {
                $dialog.alert(response.data.message);
            }else if(response.status == 500){
                $dialog.alert("系统错误，请联系管理员");
            }else if(response.status == 401){
                uiaMessage.publish("SessionTimeOut");
                $q.reject(response);
            }
            return $q.reject(response);
        }
    }
}]).config(['$httpProvider', '$qProvider', function ($httpProvider, $qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $httpProvider.interceptors.push('HttpInterceptor');
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-09.
 */
angular.module('uia').directive('uiaTable',['$compile', function($compile){
    return {
        restrict: 'A',
        scope: {
            uiaTableOption:"=",
            loadEvent:"=",
            loadParams:"=",
            tableResultData:"="
        },
        link:function(scope, elem, attr, ctrl){
            scope.uiaTableOption = angular.extend({
                pageInfo:{
                    pageSize:10,
                    pageNum:1
                }
            }, scope.uiaTableOption);
            scope.uiaTableOption.load = function(){
                scope.uiaTableOption.loadParams = scope.loadParams;
                var params = angular.copy(scope.uiaTableOption.loadParams) || {};
                params.pageSize = scope.uiaTableOption.pageInfo.pageSize;
                params.pageNum = scope.uiaTableOption.pageInfo.pageNum;
                var instance = scope.uiaTableOption.loadEvent(params);
                var promise;
                if(instance.$promise){
                    promise = instance.$promise;
                }else if(instance.then && angular.isFunction(instance.then)){
                    promise = instance;
                }
                promise.then(function(data){
                    scope.uiaTableOption.data = data.data;
                    scope.uiaTableOption.pageInfo = data.pageInfo;
                    scope.tableResultData = scope.uiaTableOption.data;
                    if(scope.uiaTableOption.success && angular.isFunction(scope.uiaTableOption.success)){
                        scope.uiaTableOption.success(data);
                    }
                });
            };
            var html = $compile('<uia-pagination page-info="uiaTableOption.pageInfo" load-parameter="uiaTableOption.queryParam" load-event="uiaTableOption.load()"></uia-pagination>')(scope);
            angular.element(elem).parent().parent().parent().append(html);
            scope.uiaTableOption.loadParams = scope.uiaTableOption.loadParams || {};
            scope.uiaTableOption.load();
        }
    }
}]);
/**
 * Created by TANXINZHENG481 on 2017-06-06.
 */
angular.module('uia').run(['$uiaValidateRule', '$uiaValidateProvider', function($uiaValidateRule, $uiaValidateProvider){
    angular.forEach($uiaValidateRule, function(val, key){
        $uiaValidateProvider.addRule(key, val);
    });
    $.extend($.validator.messages, {
        required: "这是必填字段",
        remote: "请修正此字段",
        email: "请输入有效的电子邮件地址",
        url: "请输入有效的网址",
        date: "请输入有效的日期",
        dateISO: "请输入有效的日期 (YYYY-MM-DD)",
        number: "请输入有效的数字",
        digits: "请输入有效的正整数",
        creditcard: "请输入有效的信用卡号码",
        equalTo: "你的输入不相同",
        extension: "请输入有效的后缀",
        maxlength: $.validator.format("最多可以输入 {0} 个字符"),
        minlength: $.validator.format("最少要输入 {0} 个字符"),
        rangelength: $.validator.format("请输入长度在 {0} 到 {1} 之间的字符串"),
        range: $.validator.format("请输入范围在 {0} 到 {1} 之间的数值"),
        max: $.validator.format("请输入不大于 {0} 的数值"),
        min: $.validator.format("请输入不小于 {0} 的数值")
    });
}]).value("$uiaValidateRule", {
    // 整数
    integer: {
        rule:/^\-?[0-9]+$/,
        message:"请输入正确的整数"
    },
    // 正浮点数字
    positiveDecimal: {
        rule:/^[0-9]*\.?[0-9]+$/,
        message:"请输入不小于0的数字"
    },
    // 大小写字母或数字
    notSpecialCharacter: {
        rule:/^[A-Za-z0-9]+$/i,
        message:"请输入大小写字母或数字"
    },
    // 中国身份证
    chinaId: {
        rule:/^[1-9]\d{5}[1-9]\d{3}(((0[13578]|1[02])(0[1-9]|[12]\d|3[0-1]))|((0[469]|11)(0[1-9]|[12]\d|30))|(02(0[1-9]|[12]\d)))(\d{4}|\d{3}[xX])$/,
        message:"请输入正确的身份证号码"
    },
    // 中国邮政编码
    chinaZip: {
        rule:/^\d{6}$/,
        message:"请输入正确的邮政编码"
    },
    // 手机号码
    telephone: {
        rule:/^(1)[0-9]{10}$/,
        message:"请输入正确的手机号码"
    },
    // IP
    ip: {
        rule:/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
        message:"请输入正确的IP"
    },
    latitude: {
        rule:/^-?(([1-8]\d?)|([1-8]\d)|90)(\.\d{1,6})?$/,
        message:"请输入[±90.000000]的有效纬度值"
    },
    longitude: {
        rule:/^-?(([1-9]\d?)|(1[0-7]\d)|180)(\.\d{1,6})?$/,
        message:"请输入[±180.000000]的有效经度值"
    }
}).constant("$uiaValidateDefault", {
    errorElement: "font",
    errorClass: "error",
    onblur: function(element){
        $(element).valid();
    },
    showErrors: function(errorMap, errorList) {
        $.each(this.successList, function(index, value) {
//            return $(value).popover ? $(value).popover("hide"):null;
            var index = $(value).attr('layer-tip-index');
            layer.close(index);
        });
        return $.each(errorList, function(index, value) {
//            var _popover;
//            _popover = $(value.element).popover({
//                trigger: "manual",
//                placement: "top",
//                content: value.message,
//                html:true,
//                template: "<div class=\"popover error-popover\"><div class=\"arrow\"></div> <div class=\"popover-inner\"> <div class=\"popover-content\"><p></p></div> </div></div>"
//            });
//            _popover.data("bs.popover").options.content = value.message;
//            return _popover.popover("show");
            var tipIndex;
            tipIndex = $(value.element).attr('layer-tip-index');
            layer.close(tipIndex);
            tipIndex = layer.tips(value.message, value.element, {
                tips: [1, '#3595CC'],
                time:0,
                tipsMore:true
            });
            $(value.element).attr('layer-tip-index', tipIndex);
        });
    }
}).factory("$uiaValidateProvider", function () {
    return {
        setDefaults: function (options) {
            $.validator.setDefaults(options);
        },
        addMethod: function (name, func, errorText) {
            $.validator.addMethod(name, func, errorText);
        },
        addRule: function(key, rule){
            this.addMethod(key, function(value, element){
                var pattern = new RegExp(rule.rule);
                if(value === false){
                    return false;
                }
                if(value != ""){
                    if(!pattern.test(value)){
                        return false;
                    }
                }
                return true;
            }, rule.message);
        }
    }
}).directive('uiaValidate', ["$uiaValidateDefault", function ($uiaValidateDefault) {
    return {
        restrict: 'A',
        scope:{
            uiaValidateOption:"="
        },
        require: "form",
        link: function (scope, element, attr, ctrl) {
            if(attr.ignoreTip && attr.ignoreTip == 'true'){
                ctrl.ignoreTip = true;
            }
            var option = scope.uiaValidateOption;
            option = angular.extend($uiaValidateDefault, option);
            ctrl.validateConfig = angular.copy(option);
            ctrl.validate = function(){
                if($(element).validate(ctrl.validateConfig).form() && $(element).validate(ctrl.validateConfig).valid()){
                    return true;
                }
                return false;
            };
            $('input,select,textarea').live('blur',function(){
                $(this).closest('form').validate().element($(this));
            });
            // var error = "<span class='error'> *</span>";
            // ///^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/
            // $(element).find("input[required]").each(function(){
            //     var next = $(this).next();
            //     if(this['type'] == 'hidden' || next[0] != null && next[0].nodeName == 'SPAN'){
            //         return;
            //     }
            //     $(error).insertAfter(this);
            // });
            // $(element).find("select[required]").each(function(){
            //     var next = $(this).next();
            //     if(next[0] != null && next[0].nodeName == 'SPAN'){
            //         return;
            //     }
            //     $(error).insertAfter(this);
            // });
            if($(element).find("input[uia-date]").datetimepicker){
                $(element).find("input[uia-date]").datetimepicker().on('changeDate', function(ev){
                    $(ev.target).valid();
                });
            }
        }
    };
}]);