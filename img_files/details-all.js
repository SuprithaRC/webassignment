function openPreview(url){
	$("details_preview_overlay_comp").style.display = "block";
	setTimeout(function(){
		$("details_preview_overlay_comp").style.opacity = 0.6;
	},100);
	$("details_preview_basket").style.display = "block";

	if(preview_loaded){
		showPreview();
	}else{
		var elem = document.createElement("img");
		elem.setAttribute("src", imgcacheserver+"/images/loading1.gif");
		$("details_preview_basket_loading").appendChild(elem);

		var elem = document.createElement("img");
		elem.setAttribute("src", url);
		elem.setAttribute("id", "details_preview_basket_img");
		$("details_preview_basket_img_wrapper").appendChild(elem);
		preview_loaded = 1;

		$("details_preview_basket_img").observe('click', function() {
			closePreview();
		});
		$("details_preview_basket_img").onload = function(){
			showPreview();
		};
	}
	lockDocument(true);
}

function showPreview(){
	var preview_height = document.documentElement.clientHeight * preview_screen_percentage;
	preview_height = ((preview_height>preview_max_size)?preview_max_size:preview_height);
	var preview_width = getWidthForHeight(preview_height);
	if(preview_width > (document.documentElement.clientWidth * preview_screen_percentage)){
		preview_width = document.documentElement.clientWidth * preview_screen_percentage;
		preview_height = getHeightForWidth(preview_width);
	}
	preview_width = Math.floor(preview_width);
	preview_height = Math.floor(preview_height);
	var previewImage_width = preview_width - preview_padding;
	var previewImage_height = preview_height - preview_padding;

	$("details_preview_basket").style.width = Math.max(preview_width,0)+"px";
	$("details_preview_basket").style.height = Math.max(preview_height,0)+"px";
	$("details_preview_basket_img_wrapper").width = previewImage_width;
	$("details_preview_basket_img_wrapper").height = previewImage_height;
	$("details_preview_basket_img").width = previewImage_width;
	$("details_preview_basket_img").height = previewImage_height;
	$("details_preview_basket").style.borderRadius = 0;

	setTimeout(function(){
		$("details_preview_basket_loading").style.display = "none";
		$("details_preview_basket_img_wrapper").style.display = "block";
		$("details_preview_exit_comp").style.display = "block";
		setTimeout(function(){
			$("details_preview_basket_img_wrapper").style.opacity = 1;
		},0);
	},300);
}

function closePreview(){
	$("details_preview_basket").style.display = "none";
	$("details_preview_overlay_comp").style.opacity = 0;
	setTimeout(function(){
		$("details_preview_overlay_comp").style.display = "none";
	},300);
	lockDocument(false);
}

function getWidthForHeight(height){
	return height * ((image_true_width) / (image_true_height));
}

function getHeightForWidth(width){
	return width * ((image_true_height) / (image_true_width));
}

function proceedDownload(mode, url){

	if((mode==0 || mode==1 || mode==2 || mode==3 || mode==4 || mode==9 || mode==10) && $("downloadlinknew").href.indexOf("/editor/?")>0){
		window.top.location = $("downloadlinknew").href;
		return 0;
	}

	if(mode == "footage"){
		var producttype = "Footage";
	}else if(mode == "audio"){
		var producttype = "Audio";
	}else if(mode == 1){
		var producttype = "Vector";
	}else{
		var producttype = "Photo";
	}

	if(dllink_ready){
		console.log('===ready to download===');
		if(mode=="footage" || mode=="audio"){
			var dllink = url;
		}else{
			var dllink = $("downloadlinknew").href;
		}
		console.log("This is the dllink:"+dllink);

		dllink = dllink.replace("https:", "");
		dllink = dllink.replace("http:", "");
		dllink_tmp = dllink.toLowerCase();

		if(dllink_tmp.search("enlargement")>0 || dllink_tmp.search("isfreemode")>0 || old_dl_mode){
			top.location.href = dllink;
		}else{
			jQuery("#details_download_basket").modal('show');
			dllink = dllink + "&overlay=1";
			new Ajax.Request(dllink,
			{
				method:'get',
				requestHeaders:
				{
					Accept: 'application/json'
				},
				parameters:
				{},
				onSuccess: function(response)
				{

					jQuery('#details_download_exit_comp').show();
					jQuery('#top_up_now_continue').hide();

					//set BC cookie
					var d = new Date();
					d.setFullYear(d.getFullYear()+10);
					document.cookie = "bc=1;domain=.123rf.com;path=/;expires="+d+";";

					var data = response.responseText.evalJSON();

					if(data.redirect){
						top.location.href = data.redirect;
					}else{
						jQuery("#details_download_basket_content_wrapper").show();
						jQuery("#details_download_basket_loading").hide();
						jQuery("#details_download_basket").modal('refresh');

						//force the attribution box to display by default
						// if(attributionBox < 1){
						// 	toggleAttributionBox();
						// }

						document.getElementById("dlbox-title").innerHTML = downloadpopup_text[data.title];
						document.getElementById("dlbox-main-contentbox-imageid").innerHTML = data.item;

						//Downloads pop up showing license agreement (Photo and Vector)
						if (data.dlType == "image"){
							switch(data.oriRes){
								case "low":
								case "med":
								case "super":
								case "mega":
									document.getElementById("license-agreement-link").href = "license.php#standard";
									break;
								case "poel":
									document.getElementById("license-agreement-link").href = "license.php#el_print";
									break;
								case "eoel":
									document.getElementById("license-agreement-link").href = "license.php#el_electronic";
									break;
								case "cel":
									document.getElementById("license-agreement-link").href = "license.php#enhanced";
									break;
							}

							if(typeof data.oriRes === "undefined") {
								document.getElementById("license-agreement-link").href = "license.php";
							}

						}

						//Downloads pop up showing license agreement (Footage)
						if (data.dlType == "footage"){
							switch(data.licenseType){
								case "standard":
									document.getElementById("license-agreement-video-link").href = "license.php#standard";
									break;
								case "el_electronic":
									document.getElementById("license-agreement-video-link").href = "license.php#el_electronic";
							}
						}

						if(data.status == "1"){
							finaldllink = data.dlurl;
							jQuery('#license-agreement-text').show();
							var remaining_text_final = "";
							if(data.remaining_text != ""){
								remaining_text_final = downloadpopup_text[data.remaining_text];
								data.remaining_value = ((data.remaining_value!="" && data.remaining_value!=null && data.remaining_value>0)?data.remaining_value:"0");
								remaining_text_final = remaining_text_final.replace("CONST_VAL", data.remaining_value);
							}

							if(data.res == "TIFF" || data.oriRes == "poel" || data.oriRes == "eoel" || data.oriRes == "cel" || data.oriRes == "multi_ul" || mode=="footage" || mode=="audio")
							{
								document.getElementById("dlbox-main-contentbox").innerHTML = downloadpopup_text["LANG_EXT_MSG6"]+" <a href=\"#\" onclick=\"downloadFile();return false;\">"+downloadpopup_text["LANG_CLICKHERE"]+"</a><br><br>"+remaining_text_final;
							}
							else
							{

								document.getElementById("dlbox-main-contentbox").innerHTML = downloadpopup_text["LANG_EXT_MSG6_NEW"];

								var newDiv = document.createElement('div');
								newDiv.id = 'dlbox-main-contentbox-regionddl';
								document.getElementById('dlbox-main-contentbox').appendChild(newDiv);

								document.getElementById('dlbox-main-contentbox-regionddl').innerHTML =
									"<div style='position:relative;height: 30px;margin:40px 0 10px 0 !important' class='margin-tiny vertical-top'><div style='text-align:center;' class='ui active inverted dimmer'><div class='ui small active inline loader'></div></div></div>";
								//10 sec delay to show the alternative link
								setTimeout(function(){
									document.getElementById("dlbox-main-contentbox-regionddl").innerHTML =
									"<div class='margin-tiny vertical-top download-info-greyed'><div class='padding-small vertical horizontal'>"+downloadpopup_text["LANG_EXT_MSG6_CONT"]+"<br><select style=\"width:100%;margin-top:5px;\" name=\"locdropdown\" id=\"locdropdown\" onchange=\"downloadFile2(this.value);\"><option value=\"\" selected>["+downloadpopup_text["LANG_EXT_SELECTMIRROR"]+"]</option></select></div></div>";


									var locationhtml = downloadpopup_text["LANG_DL_LOCATION"];
	                                var locvalue = (data.oriRes == "super") ? downloadpopup_text["LANG_SUPER_DL_LOCATION_VALUE"] : downloadpopup_text["LANG_DL_LOCATION_VALUE"];
									var sel = document.getElementById('locdropdown');


									for(var i = 0; i < locvalue.length; i++) {
							            var lochtml = locationhtml[i];
							            var opt = document.createElement('option');
							            opt.textContent = lochtml;
							            opt.value = locvalue[i];
							            sel.appendChild(opt);
									}
									finaldllink = data.dlurl;
								},10000);
							}

							window.location = data.dlurl;

							//////// tfcp ////////
							if('tfcp_enabled' in data && 'tfcp' in data) {
								// prep data
								var params = {};
								params[data.tfcp.pid_name] = data.tfcp.pid;
								// fire call
								jQuery.ajax({
									url: data.tfcp.url,
									method: 'POST',
									data: params,
								}).done(function(response) {
									if(data.tfcp.debug_mode === true) {
										response = JSON.parse(response);
										console.log('----------------------------------------------------------------------------------------------------');
										for(var key in response) {
											if(response.hasOwnProperty(key)) {
												console.log(key.toUpperCase() + ': ' + (typeof response[key] === 'object' ? JSON.stringify(response[key]) : response[key]));
											}
										}
										console.log('----------------------------------------------------------------------------------------------------');
									}
								});
							}
							//////// tfcp ////////
							if(data.mode=="credits")
							{
								if(data.item)
								{
									img_data = data.item;
									regex_bracket = /\((.*)\)/;
									img_res_gtm = img_data.match(regex_bracket)[1];
								}
								else if (data.licenseType)
								{
									img_res_gtm = data.licenseType
								}
								dataLayer.push({
								'language': js_lang,
								'type': data.dlType,
								'category': ' ',
								'img_resolution': img_res_gtm,
								'credits_used': data.creditcost,
								'remaining_credits_footage': data.remaining_value,
								'event': 'DownloadSuccess'
								});
							}
							else if(data.dlType == "image")
							{
								dataLayer.push({
									'language': js_lang,
									'type': data.dlType,
									'category': ' ',
									'remaining_credits_img': data.remaining_value,
									'event': 'Download_Success_Images'
									});
							}
						}else{

                            var insufficientPlanQuotaErrorCode = 3503;
                            if (data.msg && data.msg.indexOf("LANG_") !== -1) data.msg = downloadpopup_text[data.msg];
                            var errorMessage = (data.msg) ? data.msg + "<br>" : "";

                            errorMessage = (data.errcode == insufficientPlanQuotaErrorCode) ? errorMessage : errorMessage + downloadpopup_text["LANG_ERRORCONTACT"];

							document.getElementById("dlbox-main-contentbox").innerHTML = errorMessage;
							finaldllink = "";

							jQuery('#license-agreement-text').hide();

							if (data.errcode == insufficientPlanQuotaErrorCode){
								jQuery('#details_download_exit_comp').hide();
								jQuery('#top_up_now_continue').show();
							} else {
								jQuery('#details_download_exit_comp').show();
								jQuery('#top_up_now_continue').hide();
							}

							jQuery('#details_download_exit_comp').on('click',function(e){
								jQuery("#details_download_basket").modal('hide');
							});

							jQuery('#top_up_now_continue').on('click',function(e){
								jQuery("#details_download_basket").modal('hide');

								dataLayer.push({
						        	"event": "top_up_now_continue_pricing"
						        });
							});
						}
					}
				}
			});
		}
	}
}
var dllink_ready;
var finaldllink;
function downloadFile(){
	if(finaldllink){
		window.location = finaldllink;
	}
}

function downloadFile2(){
	var location = document.getElementById("locdropdown");
	var mirrorlocation = location.options[location.selectedIndex].value;
	var spliturl = finaldllink.split("/");

	if(mirrorlocation != "")
	{
		//replace currently location with mirror location
		spliturl[2] = mirrorlocation;

		//merge back the download link
		var new_finaldllink = spliturl.join("/");
		if(new_finaldllink){
			window.location = new_finaldllink;
		}
	}

}

var attributionBox = 0;
function toggleAttributionBox(){
	if(attributionBox){
		$("details_download_attribution_content").style.display = "none";
		$("dlbox_arrow").className = "dlbox_arrow";
		attributionBox = 0;
	}else{
		$("details_download_attribution_content").style.display = "block";
		$("dlbox_arrow").className = "dlbox_arrow_rotate";
		var referrallink_text = $("referrallink").value;
		referrallink_text = referrallink_text.replace("profile_'", "profile_"+image_contributor+"'");
		referrallink_text = referrallink_text.replace("CONTRINAME", image_contributor);
		$("referrallink").value = referrallink_text;
		attributionBox = 1;
	}
	jQuery("#details_download_basket").modal('refresh');
}

function prepareDownloadLink(){
	if($("details_preview_basket") && image_true_width && image_true_height && $("compImg_link") && $("details_preview_overlay_comp") && $("details_preview_exit_comp")){
		jQuery("#compImg_link").on('click', function(e){
			e.preventDefault();
			openPreview(jQuery(this).attr("href"));
		});
		jQuery("#details_preview_overlay_comp").on('click', function(e) {
			closePreview();
		});
		jQuery("#details_preview_exit_comp").on('click', function(e) {
			closePreview();
		});
	}

	dllink_ready = 1;
	jQuery("#details_download_basket").modal({
		onShow: function(){
			jQuery(this).modal('refresh');
			lockDocument(true);
		},
		onHidden: function(){
			jQuery("#details_download_basket_content_wrapper").hide();
			jQuery("#details_download_basket_loading").show();
			jQuery(this).modal('refresh');
			lockDocument(false);
		}
	});
	jQuery("#details_download_attribution_bar").unbind('click');
	jQuery("#details_download_attribution_bar").on('click', function(e) {
		toggleAttributionBox();
	});
	jQuery('#details_download_exit_comp').on('click',function(e){
		jQuery("#details_download_basket").modal('hide');
	});
}

function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

function lockDocument(toLock){
	if(toLock){ // lock
		jQuery('html').css({
			'overflow': 'hidden',
			'height' : '100%',
			'position' : 'fixed',
			'width' : '100%'
		});
		// zip is for logged in, mini likebox thingy
		jQuery('#zip').css({
			'overflow': 'hidden',
			'height' : '100%',
			'position' : 'fixed',
			'width' : '100%'
		});
	} else { // release
		jQuery('html').css({
			'overflow': '',
			'height' : '',
			'position' : '',
			'width' : ''
		});
		jQuery('#zip').css({
			'overflow': '',
			'height' : '100%',
			'position' : '',
			'width' : '100%'
		});
	}
}

// addLoadEvent(prepareDownloadLink);
jQuery(document).on('ready', function(e){
	if(!dllink_ready){
		prepareDownloadLink();
	}
});

// Add smooth scrolling for Download button (mobile view)
jQuery(document).ready(function(){
  // Add smooth scrolling to all links
  jQuery("#download_button_scroll").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      jQuery('html, body').animate({
        scrollTop: jQuery(hash).offset().top
      }, 500, function(){

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    }
  });
});


function displaySignformPopup(itemType){
	var query_string = window.location.href.split('?')[1];
	var pathname;
	if(query_string){
		var query_array = query_string.split('&');
		var pdetail_index = query_array.indexOf("pdetail=1");
		if(pdetail_index > -1){
			query_array.splice(pdetail_index, 1);
		}
		if(query_array.length > 0){
			query_string = query_array.join('&');
		}

		pathname = window.location.pathname + '?' + query_string;
	} else {
		pathname = window.location.pathname;
	}
	pathname = pathname.substring(1);
	jQuery.ajax({
		url: '/ajax_update_session.php',
		type: 'post',
		data : {
			updateSession : 'previous_page',
			newSessionValue : pathname
		},
		success: function(data){
			data = JSON.parse(data);
			if(data.status){
				var cboxMemberTimeout = 21000,
			        cboxMemberLoading = 0,
			        cboxMemberTimer;
			    var licensetab = jQuery('.license-type.active').first().attr('data-licensetab');
			    var licenseSelect = '';
			    var chosenQuota = '';
			    if(itemType == 'image'){
				    licenseSelect = jQuery('#standardSizesContainer').find('.active').attr('data-key');
				    chosenQuota = jQuery('#quotaTypeSelect').val();
			    } else if (itemType == 'footage'){
			    	licenseSelect = jQuery('input[type=radio][name=size]:checked').closest('.highlight.size-row').attr('data-res');
			    } else if (itemType == 'audio'){
			    	licenseSelect = jQuery('input[type=radio][name=radio_type]:checked').closest('div.highlight').attr('id');
			    }
			    // redirect to register page if it's in mobile
			    if(inMobile){
			    	window.top.location.href = site_https+"/register.php?intent=download&licensetab="+licensetab+"&select="+licenseSelect+"&quota="+chosenQuota;
			    } else { // use popup for registration/login
			    	jQuery.colorbox({
				        iframe:true,
				        innerWidth:550,
				        innerHeight:signform_height,
				        fastIframe:false,
				        href:site_https+"/member_iframe.php?signform=signup&intent=download&licensetab="+licensetab+"&select="+licenseSelect+"&quota="+chosenQuota,
				        onOpen:function(){
				        	lockDocument(true);
				            cboxMemberLoading = 1;
				            cboxMemberTimer = setTimeout(function(){
				                if(cboxMemberLoading){
				                    window.location = site_https+"/register.php";
				                }
				            }, cboxMemberTimeout);
				        },
				        onClosed: function(){
				        	lockDocument(false);
				        },
				        onComplete: function(){
				            cboxMemberLoading = 0;
				            clearTimeout(cboxMemberTimer);
				        }
				    });
			    }
			}
		}
	});
}
