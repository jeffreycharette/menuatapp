/* 
	Author: wearecharette.com
*/
log = function() { return console.log.apply(console, arguments); };

var _ = require('underscore'),
	Handlebars = require('handlebars'),
	random1 = getRandomInt(1000, 9999);
	
	$('.lookup').each(function(i) {
		var that = $(this),
			view = that.find('.view').text(),
			selected = that.find('.selected').text();
		if (view === '_views' || view === '_templates') {
			$.ajax({
		        url: '/_design',
		        expect_json: true,
				dataType: 'json',
				error: function (data) {
					log(err);
				},
				success: function (data) {
					that.find('select').append("<option value=''>no template</option>");
					if (view === '_templates') {
						_.each(data._attachments, function(val, key) {
							if (key.indexOf('static/templates/') !== -1) {
								key = key.replace('static/templates/', '');
								if (selected == key) {
									that.find('select').append("<option selected=\"selected\" value='" + key + "'>" + key + "</option>");
								}
								else {
									that.find('select').append("<option value='" + key + "'>" + key + "</option>");
								}
							}
						});
						//that.show();
					}
					else {
						_.each(data.views, function(val, key) {
							if (selected == key) {
								that.find('select').append("<option selected=\"selected\" value='" + key + "'>" + key + "</option>");
							}
							else {
								that.find('select').append("<option value='" + key + "'>" + key + "</option>");
							}
						});
					}
				}
			});
		}
		else {	
			db.getView('edit', view, function (err, data) {
			    if (err) {
			        // an error occurred
			        throw(err);
			    }
				else {
					that.find('select').append("<option value=''>no view</option>");
					_.each(data.rows, function(val, key) {
						if (selected == val.key) {
							that.find('select').append("<option selected=\"selected\" value='"+val.key+"'>"+val.value+"</option>");
						}
						else {
							that.find('select').append("<option value='"+val.key+"'>"+val.value+"</option>");
						}
					});
				}
			});
		}
	});


$(function() {
	
	/* group start to end elements with div */
	$('[class*="row_"]').each(function(i){
		if (!$(this).parent().hasClass('row')) {
			$('.'+$(this).attr('class').match(/row_[\d]+/gi).toString()).wrapAll('<div class="row"/>');
		}
	});
	$('.render .row').append('<a class="destroy"></a>');
	$('.destroy').click(function(e) {
		$(this).parent().remove();
	})
	$('.permissions').wrapAll('<div class="perm"/>');

	var id = $('#id__id').val();
	var val = $('#id_wc_type').val();
	$('#id__id').remove();
	$('#id_wc_type').closest('.field').after('<div class="field required left"><div class="form-label"><label for="id__id">url</label></div><div class="form-content"><div class="inner"><input size="30" type="text" placeholder="unique url" value="' + id + '" id="id__id" name="_id"/></div><div class="hint"></div><div class="errors"></div><div class="clear"></div></div></div>');

	/*if (val != 'page') {
		$('#id__id').prop('disabled', true);
	}
	else {
		$('#id__id').prop('disabled', false).closest('.field').addClass('required');
	}

	$('#id_wc_type').change(function(e) {
		val = $(this).val();
	
		if (val == 'page') {
			$('#id__id').prop('disabled', false).closest('.field').addClass('required');
		}
		else {
			$('#id__id').prop('disabled', true).closest('.field').removeClass('required');
		}
	});*/

	$('#id__id').change(function(e) {
		var that = $(this);
		val = that.val();
	
		db.getDoc(val, '', function (err, data) {
			if (err) {
		        that.closest('.field').removeClass('error').find('.errors').text('');
		    }
			else {
				that.focus();
				that.closest('.field').addClass('error').find('.errors').text('This url is already taken.');
			}
		});
	});

	/*$.couch.info({
	    success: function(data) {
	        console.log(data);
	    }
	});*/

	/**************** NOT SECURE ******************/
	/* session */
	$.couch.session({
	    success: function(data) {
					if (data.userCtx.name) {
						$('.wrc-user-out').removeClass().addClass('wrc-user-in').text('sign out').fadeIn();
					}
					else {
						$('.wrc-user-out').text('sign in').fadeIn();
					}
	    }
	});

	
	$('form[name="edit"] input.save').bind("click", function(e) {
		e.stopPropagation();
		e.preventDefault();
		$.ajax({
	    url: '/_update/poll/poll',
			type: 'POST',
			data: { menu1:1, menu2:1 },
			success: function (data) {
	    	$('form[name="edit"]').submit();
	    },
	    error: function(status) {
	    }
		});
	});

	/* login */

	/* open modal */
	$('.wrc-user-out').leanModal({ top : 100, closeButton: ".modal_close", ignore: "wrc-user-in" });

	$('.fieldtype').after('<a href="#fieldoptions" id="leanmodal" class="gear wrc-open-fieldoptions">options</a>');
	$('.widgettype').after('<a href="#widgetoptions" id="leanmodal" class="gear wrc-open-widgetoptions">options</a>');
	$('.wrc-open-fieldoptions').leanModal({ top : 100, closeButton: ".wrc-close-fieldoptions" });
	$('.wrc-open-widgetoptions').leanModal({ top : 100, closeButton: ".wrc-close-widgetoptions" });

	var form, scopeClass, formContent, that, isChecked, selectValue = "";
	$('.wrc-open-fieldoptions').click(function(e) {
		form = $('#fieldoptions .options');
		scopeClass = 'scope' + $('.wrc-open-fieldoptions').index(this);
		formContent = $(this).parent().find('.options_field').clone(true);
	
		form.removeClass().addClass('options ' + scopeClass).html('').append(formContent).find('.options_field').fadeIn();
	});

	$('.wrc-open-widgetoptions').click(function(e) {
		form = $('#widgetoptions .options');
		scopeClass = 'scope' + $('.wrc-open-widgetoptions').index(this);
		// get value of select
		selectValue = $(this).parent().find('[name^="widgettype_"]').val();
		formContent = $(this).parent().find('.options_widget, .options_widget_' + selectValue).clone(true);

		form.removeClass().addClass('options ' + scopeClass).html('').append(formContent).find('.options_widget, .options_widget_' + selectValue).fadeIn();
	});

	var name, idx, clone = "";
	/* add entity input */
	$('.wrc-add-input').click( function(e) {
		idx = $('.row').length + 1;
		clone = $('.row:eq(0)').clone(true);
	
		$(clone).find('input[name], select[name]').each(function(i) {
			name = $(this).attr('name');
			name = name.substring(0, name.length - 1) + idx;
			$(this).attr({"name": name});
		});
	
		$(clone).find('input[id], select[id]').each(function(i) {
			name = $(this).attr('id');
			name = name.substring(0, name.length - 1) + idx;
			$(this).attr({"id": name});
		});
	
		$(clone).find('.wrc-open-fieldoptions').leanModal({ top : 100, closeButton: ".wrc-close-fieldoptions" });
		$(clone).find('.wrc-open-widgetoptions').leanModal({ top : 100, closeButton: ".wrc-close-widgetoptions" });
		$(clone).find('input, :checked').not("select, option").val('').prop({'checked': false});
		$(clone).find('select > option:first').attr({'selected': 'selected'});
		$('.final').before(clone);
		e.preventDefault();
	});

	/*$('.wrc-open-fieldoptions').leanModal({ top : 100, closeButton: ".wrc-close-fieldoptions" });
	$('.wrc-open-widgetoptions').leanModal({ top : 100, closeButton: ".wrc-close-widgetoptions" });*/

	$('#signinform').submit(function() {
		var data = $(this).serializeObject();
		$.couch.login({
		    name: data.username,
		    password: data.password,
		    success: function(data) {
						$('.wrc-user-out').removeClass().addClass('wrc-user-in').text('sign out');
						$('.modal_close').trigger('click');
						$('.noty_bar').notify({type: "success", message: "Sign in successful.  Go nuts!", delay: 1000}, function() {
							window.location.reload(true);
						});
		    },
		    error: function(status) {
						$('#signin-header p').text('Try again - that didn\'t work!');
						$('.noty_bar').notify({type: "error", message: status + " Try again - that didn\'t work!"});
		    }
		});
		return false;
	});

	$('#fieldoptions').submit(function(e) {
		that = $(this);
		scope = parseInt($(this).find('.options').attr('class').replace("options", "").replace("scope", "").replace(" ", ""));
	
		$('.row:eq(' + scope + ') .options_field').each(function(i) {
			$(this).find('input').val(that.find('.options_field:eq(' + i + ') input').val());
			isChecked = !!that.find('.options_field:eq(' + i + ') [type="checkbox"]').attr('checked');
			$(this).find('[type="checkbox"]').prop({'checked': isChecked});
		});
	
		$('.wrc-close-fieldoptions').trigger('click');
		$('.noty_bar').notify({type: "success", message: "Remember to save document!"});
		return false;
	});

	$('#widgetoptions').submit(function(e) {
		that = $(this);
		scope = parseInt($(this).find('.options').attr('class').replace("options", "").replace("scope", "").replace(" ", ""));
		selectValue = $('.row:eq(' + scope + ') [name^="widgettype_"]').val();
	
		$('.row:eq(' + scope + ') .options_widget').each(function(i) {
			$(this).find('input').val(that.find('.options_widget:eq(' + i + ') input').val());
			isChecked = !!that.find('.options_widget:eq(' + i + ') [type="checkbox"]').attr('checked');
			$(this).find('[type="checkbox"]').prop({'checked': isChecked})
		});
	
		$('.row:eq(' + scope + ') .options_widget_' + selectValue).each(function(i) {
			$(this).find('input').val(that.find('.options_widget_' + selectValue + ':eq(' + i + ') input').val());
			isChecked = !!that.find('.options_widget_' + selectValue + ':eq(' + i + ') [type="checkbox"]').attr('checked');
			$(this).find('[type="checkbox"]').prop({'checked': isChecked})
		});
	
		$('.wrc-close-widgetoptions').trigger('click');
		$('.noty_bar').notify({type: "success", message: "Remember to save document!"});
		return false;
	});


	/* logout */
	$(document).on('click', '.wrc-user-in', function() {
		$.couch.logout({
		    success: function(data) {
						$('.wrc-user-in').removeClass().addClass('wrc-user-out').text('sign in');
						$('.noty_bar').notify({type: "success", message: "Bye bye!", delay: 1000}, function() {
							location.reload(true);
						});
		    }
		});
		return false;
	});

	/* remove all docs */
/*
	var mapFunction = function(doc) {
		if (doc) {
	    emit(doc, null);
		}
	};
	$.couch.db("edit").query(mapFunction, "_all_docs", "javascript", {
		startKey: 'abc',
		endKey: 'abcZZZZZZZZZ',
		descending: true,
	  success: function(data) {
			$.each(data.rows, function(k, v) {
				var doc = {
					_id : v.key._id,
					_rev : v.key._rev
				}
			$.couch.db("edit").removeDoc(doc, {
			     success: function(data) {
			         console.log(data);
			    },
			    error: function(status) {
			        console.log(status);
			    }
			});
			});
	  },
	  error: function(status) {
	      console.log(status);
	  },
	  reduce: false
	});*/
	$('form[name="edit"] textarea').addClass('mceEditor');
	tinyMCE.init({
		mode : "specific_textareas",
		editor_selector : "mceEditor",

		// General options
		theme : "advanced",
		skin : "thebigreason",
		plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,advlist,codemagic",

		// Theme options
		theme_advanced_buttons1 : "fullscreen,|,undo,redo,|,search,|,pastetext,pasteword,|,bold,italic,underline,strikethrough,|,formatselect,styleselect,|,bullist,|,link,unlink,anchor,|,cleanup,codemagic,|,sub,sup,charmap,|,print",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_statusbar_location : "bottom",
		theme_advanced_resizing : true,
		remove_linebreaks : false,
		force_br_newlines : false,
		force_p_newlines : false,
		forced_root_block : '',
		width: "100%",
		height: "200",

		// Example content CSS (should be your site CSS)
		content_css : "/static/wc-lib/css/editor.css",

		// Drop lists for link/image/media/template dialogs
		template_external_list_url : "lists/template_list.js",
		external_link_list_url : "lists/link_list.js",
		external_image_list_url : "lists/image_list.js",
		media_external_list_url : "lists/media_list.js"
	});

	if ($('#uploader #revision').val() == '') {
		$.getJSON($('#uploader').attr('action'), function(data) {
			$('#uploader #revision').val(data._rev);
		});
	}

	var form = $('#uploader'),
		file_array = {},
		_URL = window.URL || window.webkitURL,
		file_list = filenames = img = parentCloned = parentForm = "";
	
	$(document).on('click', '.wc-files li .remove', function() {
		var uploader = $('#uploader'),
			file = $(this).attr('rel').toString(),
			url = uploader.attr('action') + '/' + file + '?rev=' + uploader.find('#revision').val(),
			file_list = $(this).closest('.field').find('.file_array'),
			file_array = JSON.parse(file_list.val());

		/* remove from input */
		delete file_array[decodeURI(file)];
		file_list.val(JSON.stringify(file_array));
	
		/* remove from dom */
		$(this).parent().remove();
	
		$.ajax({
			url: url,
			type: 'DELETE',
			success: function(resp) {
				$('[name="edit"]').ajaxSubmit({
					success: function(resp) {
						$.getJSON($('#uploader').attr('action'), function(data) {
							$('#uploader #revision').val(data._rev);
						});
					}
				});
			},
			error: function(resp) {
			}
		});
	});
	
	$(document).on('change', 'input[type="file"]', function(e) {
		/* clone parent objects */
		filenames = "";
		parentCloned = $(this).parent();
		parentForm = parentCloned.closest('form');
	
		/* set filenames and data */
		file_list = parentCloned.find('.file_array');
		file_array = JSON.parse(file_list.val());
	
		_.each(this.files, function(val) {
			filenames += val.name + ', ';
		
			if(val.type.indexOf("image") !== -1) {
				img = new Image();
			    img.onload = function() {
		            val['width'] = this.width;
					val['height'] = this.height;
					file_array[val.name] = val;
		        };
		        img.src = _URL.createObjectURL(val);
			}
			else {
				file_array[val.name] = val;
			}
		});
	
		/* upload form */
		$('#uploader').append($(this));
		$('#uploader').ajaxSubmit({
			success: function(resp) {
				file_list.val(JSON.stringify(file_array));
				/* update list */
				var html = "";
				_.each(file_array, function(val, key) {
					if (val.type.indexOf("image") !== -1) {
						html += '<li>' + key + ' <div class="wc-image-meta">(' + bytesToSize(val.size, 2) + ') ' + val.width + ' X ' + val.height + '</div> <a class="remove" href="#" rel="' + key + '"></a></li>';
					}
					else if (val.type.indexOf("text") !== -1 || val.type.indexOf("application") !== -1) {
						html += '<li>' + key + ' <div class="wc-image-meta">(' + bytesToSize(val.size, 2) + ') ' + val.type + '</div> <a class="remove" href="#" rel="' + key + '"></a></li>';
					}
					else {
						html += '<li>' + key + ' <div class="wc-image-meta">(' + bytesToSize(val.size, 2) + ') ' + 'unsupported type' + val.type + '</div> <a class="remove" href="#" rel="' + key + '"></a></li>';
					}
				});
				parentCloned.find('.wc-files').html(html);
			
				$('.noty_bar').notify({type: "success", message: filenames + " uploaded successfully."});
				$('#uploader [name="_attachments"]').remove();
				//$('#uploader #revision').val(resp.rev);
				parentCloned.append('<input name="_attachments" multiple="" type="file" />');
				parentForm.ajaxSubmit({
					success: function(resp) {
						$.getJSON($('#uploader').attr('action'), function(data) {
							$('#uploader #revision').val(data._rev);
						});
					}
				});
			},
			error: function(data) {
		  		$('.noty_bar').notify({type: "error", message: filenames + " failed to upload!"});
				$('#uploader [name="_attachments"]').remove();
				parentCloned.append('<input name="_attachments" multiple="" type="file" />');
			}
		});
		return false;
	});

	$('body').bind('query', function(e) {
		var opts = {};
		opts.elem = $('.wc-query:not(.processing):first');
		opts.elem.addClass('processing');
		if (opts.elem.length) {
			try {
				opts.query = $.parseJSON(opts.elem.text());
			}
			catch(e) {
				return;
			}
			if (typeof getUrlVars()["random"] === "string") {
				opts.query['random'] = random1;
			}
			if (!!opts.query.lookup) {
				opts.req = opts.query.lookup;
				opts.query = "";
				opts.key = "";
			}
			else {
				opts.req = ( $('.wc_editable:first').length > 0 ) ? "/queryedit" : "/query";
				opts.req += '/' + opts.query["key"];
			}
			delete opts.query['key'];
			delete opts.query['sort'];
			query(opts);
		}
		else {
			if ($('.wc_editable:first').length > 0) {
				editor();
			}
			else {
				
			}
		}
	});

	/* parse queries - make this simpler!*/
	if ($('.wc-query:not(.processing)').length <= 0 && $('.wc_editable:first').length > 0) {
		editor();
	}
	else {
		$('body').trigger('query');
	}
});

hash = window.location.hash.replace("#","");
var timeout = 3600000;
//if it is a menu url then do the below
if (hash === "menu1" || hash === "menu2") {
	if (typeof getUrlVars()["random"] !== "string") {
		timeout = 10000;
	}
	setInterval(function() {
		checkSave(hash);
	}, timeout);
}
if (hash === "menu1") {
	setTimeout(function() {
		window.scrollTo(0, 0);
	}, 1000);
}
else if (hash === "menu2") {
	setTimeout(function() {
		var pos = parseInt($('#position').text());
		window.scrollTo(pos, 0);
	}, 1000);
}

var checkSave = function(hash) {
	//var h = new Date().getHours();
	//if (h >= 6) {
		$.getJSON('/chamblinsdev/poll', function(doc) {
			if (typeof getUrlVars()["random"] !== "string") {
				window.location = 'http://chamblins.menuat.com/index.html?random=' + random1 + '#' + hash;
			}
			if(doc[hash] === 1) {
				$.ajax({
			    url: '/_update/poll/poll',
					type: 'POST',
					data: JSON.parse('{"'+hash+'": 0}'),
					success: function (data) {
			    	window.location = 'http://chamblins.menuat.com/index.html?random=' + random1 + '#' + hash;
			    },
			    error: function(status) {
			    }
				});
			}
		}).error(function() {
			window.location = 'http://chamblins.menuat.com/index.html#' + hash;
		});
	//}
}

/* make this async when you get smart */
function query(opts) {
	$.ajax({
    url: opts.req,
		data: opts.query,
    method: 'GET',
		async: false,
		cache: true,
		error: function (data) {
			$('body').trigger('query');
		},
		success: function(data) {
			if ($('#'+opts.key+'-tpl').length > 0) {
				data = Handlebars.compile($('#'+opts.key+'-tpl').html().replace('<!--value-->', '{{{value}}}'))({value: data});                         
			}
			opts.elem.html(data).hide().fadeIn();
			$('body').trigger('query');
		}
	});
}

function editor() {
	$('.wc_editable').each(function(i){
		$(this).attr('id', $(this).attr('id').replace('.','dot'));
		var el = $(this),
			eid = el.attr('id'),
			elm = el,
			w = el.width(),
			h = el.height(),
			mostLeft = 100000,
			mostTop = 100000,
			tid = $(this).attr('id').split('-')[0] + '-' + $(this).attr('id').split('-')[1]  + '-modal',
			image = '<img class="fold" style="border:none;padding:0;margin:0;" src="/static/wc-lib/img/pin.png" />';

		if (elm.hasClass('wc_global')) {
			image = '<img class="fold" style="border:none;padding:0;margin:0;" src="/static/wc-lib/img/fold.png" />';
		}

		el.children().each(function(i){
			if ($(this).position().left < mostLeft) {
				mostLeft = $(this).position().left;
				elm = $(this);
				if (elm.height() > h) {
					h = elm.height();
				}
				if (elm.width() > w) {
					w = elm.width();
				}
			}
		});
		if (elm.is(':empty')) {
			elm.before('<a class="leanmodal" href="#' + tid + '" style="position:absolute;text-indent:0;">' + image + '</a>');
		}
		else {
			if (elm.hasClass('wc-query')) {
				elm = elm.parent();
			}
			if (elm.prop("tagName") === 'UL') {
				elm.before('<a class="leanmodal" href="#' + tid + '" style="position:absolute;text-indent:0;">' + image + '</a>');
			}
			else {
				elm.prepend('<a class="leanmodal" href="#' + tid + '" style="position:absolute;text-indent:0;">' + image + '</a>');
			}
		}
		$('body').append('<div class="wc_edit_modal" id="' + tid + '"></div>');

		$(this).click(function(e) {
			if ($(window).height() < 636) {
				$('#' + tid).html('<a class="modal_close" href="#close"></a><iframe src="/_show/edit/' + $(this).attr('id').split('-')[0].replace('dot','.') + '?#id_' + $(this).attr('id').split('-')[1] + '" class="wc_edit_content" style="height: 465px;top:0;"></iframe>');
			}
			else {
				$('#' + tid).html('<a class="modal_close" href="#close"></a><iframe src="/_show/edit/' + $(this).attr('id').split('-')[0].replace('dot','.') + '?#id_' + $(this).attr('id').split('-')[1] + '" class="wc_edit_content"></iframe>');
			}
			e.preventDefault();
			$('.modal_close').click(function(e) {
				e.preventDefault();
				$('#lean_overlay').click();
			});
		});
	});
	$('a.leanmodal').leanModal({ top : 30 });
	$('body').trigger('queryDone');
}

_.uniqObjects = function( arr ){
	return _.uniq( _.collect( arr, function( x ){
		return JSON.stringify( x );
	}));
};

function bytesToSize(bytes, precision)
{  
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
   
    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';
 
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';
 
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';
 
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';
 
    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';
 
    } else {
        return bytes + ' B';
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};