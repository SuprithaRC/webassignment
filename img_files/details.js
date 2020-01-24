var SEMANTIC_SUPPORTED = SemanticFallback.support.isSupported;
jQuery(document).on('ready', function(e){
	if(SEMANTIC_SUPPORTED){
		jQuery('.ui.dropdown').not('.license-select').dropdown();
	}
	jQuery('#addToLikeboxModal').modal({
		autofocus: false,
		duration: 300,
		onShow : function(){
			lockDocument(true);
		},
		onHidden: function(){
			lockDocument(false);
		}
	});
	// options popup
	jQuery('.pop-options').popup({
		on: 'click',
		position: 'bottom right',
		lastResort: 'bottom right',
		inline: true,
		popup: jQuery(this).siblings('.ui.options.popup'),
		hoverable: false,
		closable: true,
		observeChanges: false,
		distanceAway: -5
	});
	// help popups
	jQuery('.pop-help').popup({
		on: 'hover',
		position: 'bottom left',
		lastResort: 'bottom left',
		inline: true,
		popup: jQuery(this).siblings('.ui.help.popup'),
		observeChanges: false,
		distanceAway: -5
	});

	// add fave
	jQuery("#addfave").on('click', function(e){
		jQuery.ajax({
			method : 'GET',
			url : site_https+"/details_licensetab_img_ajax.php",
			data : {
				action : 'addfave',
				pid : jQuery(this).attr('data-pid')
			},
			success: function(data){
				data = JSON.parse(data);
				if(data.stat == 'ok'){
					jQuery('#addfave').html(langDetails.myFave);
					jQuery('#addfave').unbind('click');
					jQuery('#addfave').attr('href', site_https+"/favphotog.php");
				}
			}
		});
	});

	// keywords
	jQuery('.keywords-expander').on('click', function(e){
		jQuery(this).closest('.keywords-container').toggleClass('expanded');
	});

	// download comp
	jQuery('.downloadcomp.non-login').on('click', function(e){
		downloadNonCompGTM();
		e.preventDefault();
		window.top.location.href= site_https+'/login.php';
	});
	jQuery('.downloadcomp.log_comp_download').on('click', function(e){
		// gtm track
		downloadCompGTM();
	});

	// addToLikebox
	jQuery('.likebox.track').on('click', function(e){
		// gtm track
		likeboxGTM();
	});
	var selectedLikebox = jQuery('#likeboxSelection').val();
	initLikeboxAction();
	jQuery('#likeboxSelection').on('change', function(e){
		selectedLikebox = jQuery(this).val();
	});
	jQuery('#addToLikeboxModal').find('.add-to-likebox.button').on('click', function(e){
		var lbFilename = jQuery('#addToLikeboxModal').attr('data-filename');
		jQuery.ajax({
			url: "/lightbox/lightbox_action.php",
			method: "POST",
			data: {
				action: 'additem',
				lb_id: selectedLikebox,
				item_id: lbFilename,
				csrf_token: csrf_token
			},
			success: function(data){
				data = JSON.parse(data);
				console.log(data.message);
				if(data.status){
					var notifMsg = langNotifications.image_added_toLikebox;
					SemanticNotify.notify_success(notifMsg);
				} else {
					var notifMsg = langNotifications.image_exists_inLikebox;
					SemanticNotify.notify_error(notifMsg);
				}
				jQuery('#addToLikeboxModal').modal('hide');
			}
		});
	});

	// share image action
	jQuery(".share-action").on('click', function(e){
		var shareMedium = jQuery(this).attr('data-medium');
		shareGTM(shareMedium);
	});

    jQuery('.log_comp_download').click(function(){
        // Remaining Data set in details_v2.php
        var log_lang = js_lang;
        var log_image_id = gtmVar.imageId;

        jQuery.ajax({
            method : "POST",
            url : site_https + "/details_logging_ajax.php",
            data : {
                action : 'log_comp_download',
                uid: log_uid,
                keyword : log_keyword,
                user_agent_id : log_user_agent_id,
                lang : log_lang,
                image_id : log_image_id
            },
        });
    });

	jQuery('#compImg_link').click(function(){
		viewPhotoBigThumbnailGTM();
	});

	jQuery('#licenseTabSelector .license-type').click(function(){
		var type = jQuery(this).text().trim();
		if(type === "Extended License"){
			useExtendedLicenseGTM();
		}
	});

	tagKeywordsGTM();

	jQuery("#download_nopurchased").on('click', function(e){
		clickPurchaseGTM();
	});
});

// keywords container, if the keywords is not as long as the container, hide the show more
var keywordsExpWidth = jQuery('.keywords-container').find('.keywords-expander').width();
var keywordsContHeight = jQuery('#keywordsSpan').closest('.keywords-container').innerHeight();
function checkKeywordExpander(){
	var keywordsSpanWidth = jQuery('#keywordsSpan').width();
	var keywordsSpanHeight = jQuery('#keywordsSpan').innerHeight();
	var keywordsContWidth = jQuery('#keywordsSpan').closest('.keywords-container').width();
	if((keywordsSpanWidth > (keywordsContWidth-keywordsExpWidth)) || keywordsSpanHeight > keywordsContHeight){
		jQuery('.keywords-container').find(".keywords-expander-cover").show();
	} else {
		jQuery('.keywords-container').find(".keywords-expander-cover").hide();
	}
}
jQuery(window).on('resize', function(e){
	checkKeywordExpander();
});
checkKeywordExpander();

// function for initializing on click of likebox actions. Useful for post-retrieval of similar images through ajax
function initLikeboxAction(){
	//New Minilikebox details popup
	jQuery(".add-to-likebox-pdetail").off().on('click', function(e){
		var filename = jQuery(this).attr('data-filename');
		var status = 0;
		if (is_pdetail == 1){
			if (typeof parent.obj_mini != 'undefined') {
				status = parent.obj_mini.add(filename,"pdetail");
			}
		} else {
			if (typeof obj_mini != 'undefined') {
				status = obj_mini.add(filename,"pdetail");
			}
		}

		if (status == 1) {
			SemanticNotify.notify_success(langNotifications.image_added_toLikebox);
		} else if (status == 2) {
			SemanticNotify.notify_error(langNotifications.image_exists_inLikebox);
		}
	});

	jQuery(".add-to-likebox-pdetailsimilar").off().on('click', function(e){
		var filename = jQuery(this).attr('data-filename');
		var status = parent.obj_mini.add(filename, "pdetail");
		if (status == 1) {
			likebox_notification(filename, langNotifications.image_added_toLikebox);
		} else if (status == 2) {
			likebox_notification(filename, langNotifications.image_exists_inLikebox);
		}
	});



	// redirect to login page if not logged in
	jQuery('.likebox.non-login').unbind('click');
	jQuery('.likebox.non-login').on('click', function(e){
		window.top.location.href= site_https+'/login.php';
	});
}

function likebox_notification(filename, text){
    if(filename && text ){
        var template = jQuery('<div>');
        template.addClass('likebox-notification');

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) { // If Internet Explorer, return version number
            template.css('width', '200px');
        }
        template.html(text);

        if(jQuery('.item.imgContMosc[data-filename="'+filename+'"]').length) { //image

            jQuery('.item.imgContMosc[data-filename="'+filename+'"]').find('.likebox-notification').remove();
            template.appendTo('.item.imgContMosc[data-filename="'+filename+'"]');
        } else if(jQuery('.adjustment-container[data-filename="'+filename+'"]').length) { //footage

            jQuery('.adjustment-container[data-filename="'+filename+'"]').find('.likebox-notification').remove();
            template.appendTo('.adjustment-container[data-filename="'+filename+'"]');
        }

        setTimeout(function(){
            template.fadeOut();
            setTimeout(function(){
                template.remove();
            }, 250);
        }, 3000);
    }
}

function dismissExtendedPopup(){
	var futdate = new Date();
    var expdate = futdate.getTime();
    expdate += 30 * 24 * 3600 * 1000;
    futdate.setTime(expdate);

	setCookie('elnote1', 1, futdate, '/','.123rf.com');
}

// to check if the fetch is still loading
var isLoadingLicense = false;
function getLicenses(type){
	var showtab = type;
	var url = js_licensetab;

	if(!isLoadingLicense){
		jQuery.ajax({
			url: url,
			method: 'GET',
			data:{
				action: 'showtab',
				filename: js_filename,
				showtab: showtab,
				lang: js_lang,
				dti: bdt_dti
			},
			beforeSend: function(){
				isLoadingLicense = true;
				jQuery('#licensesContainer').html("<div class='ui active centered inline loader margin vertical-top'></div>");
			},
			success: function(response){
				isLoadingLicense = false;
				jQuery('#licensesContainer').html(response);
			}
		});
	}

}
// initial licenses load
// getLicenses(initLicenses);

// on click function for selecting download size
// gtmVals(object) for gtm tracking added sam - 2017-05-11
var gtmdetails = {format:"", res:""};
//Google Tag Manager - GTM Tracking - Added by Sam 2017-05-08
//Other scripts affected=========>
//details_licensetab_img_ajax.php
//details_v2.php
//===============================>
//Likebox icon data push
function likeboxGTM()
{
	 dataLayer.push({
	    "event": "img_add_likebox",
	    "img_id": gtmVar.imageId,
	    "img_owner_id": gtmVar.supplierName,
	    "img_type": gtmVar.filetype,
	    "typeCodeDetails": gtmVar.typeCodeDetails
	});
}
// Share icon data push
// shareMedium = facebook/twitter/etc
function shareGTM(shareMedium)
{
	 dataLayer.push({
	    "event": "img_share_social",
	    "event_label": shareMedium,
	    "img_id": gtmVar.imageId,
	    "img_owner_id": gtmVar.supplierName,
	    "img_type": gtmVar.filetype,
	    "typeCodeDetails": gtmVar.typeCodeDetails
	});

}
// Donwload comp image icon data push
function downloadCompGTM()
{
	 dataLayer.push({
	    "event": "img_download_comp",
	    "img_id": gtmVar.imageId,
	    "img_owner_id": gtmVar.supplierName,
	    "img_type": gtmVar.filetype,
	    "typeCodeDetails": gtmVar.typeCodeDetails
	});
}

// Donwload comp Non image icon data push
function downloadNonCompGTM()
{
	 dataLayer.push({
	    "event": "img_download_comp_nologin",
	    "img_id": gtmVar.imageId,
	    "img_owner_id": gtmVar.supplierName,
	    "img_type": gtmVar.filetype,
	    "typeCodeDetails": gtmVar.typeCodeDetails
	});
}

// Push dataLayer on Page load / Radio button Change / Tab Change
function gtmOnLoad(filetype,gtmlicense,dgtm_res,dformat)
{
	dataLayer.push({
	    "event": "img_view_details",
	    "img_id": gtmVar.imageId,
	    "img_owner_id": gtmVar.supplierName,
	    "img_type": filetype,
	    "typeCodeDetails": gtmVar.typeCodeDetails,
	    "img_license": gtmlicense,
	    "img_size": dgtm_res,
	    "img_format": dformat
	});
}

// Push dataLayer on DownloadButtonClick
function downloadFullGTM(res,format,filetype,gtmlicense, resolution)
{
	dataLayer.push({
	    "event": "img_download_full",
	    "img_id": gtmVar.imageId,
	    "img_owner_id": gtmVar.supplierName,
	    "img_type": filetype,
	    "typeCodeDetails": gtmVar.typeCodeDetails,
	    "img_license": gtmlicense,
	    "img_size": res,
	    "img_format": format,
	    "img_resolution":resolution
	});
}

//Push datalayer on Click More Plans
function clickMorePlans()
{
	dataLayer.push({
	    "event": "click_more_plans",
	    "click_more_plans": "Yes",
	});
}

function sendDataGTM()
{
	return gtmdetails;
}


function viewPhotoBigThumbnailGTM()
{
	dataLayer.push({
	    "event": "view_photo_big_thumbnail",
	    "img_id": gtmVar.imageId,
	    "typeCode": gtmVar.typeCodeDetails,
	});
}

function useExtendedLicenseGTM() {
	dataLayer.push({
	    "event": "use_extended_license",
		"img_id": gtmVar.imageId,
		"typeCode": gtmVar.typeCodeDetails,
		"status": "Yes",
	});
}

function tagKeywordsGTM(){
	dataLayer.push({
		"event": "use_tag_keywords",
		"img_id": gtmVar.imageId,
		"typeCode": gtmVar.typeCodeDetails,
	});
}

function clickPurchaseGTM(){
	dataLayer.push({
			"event": "click_purchase"
	});
}