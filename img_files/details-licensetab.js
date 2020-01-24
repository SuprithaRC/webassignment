jQuery( document ).ready(function() {
	(function($){
		var LICENSE_TAB = $('#licenseTabSelector');
		var STDLIC_SIZE_BUTTON = $('#standardSizesContainer').find('button:not(.editor-link)');
		var STDLIC_EDITOR_BUTTON = $('#editorButtonLink');
		var EXTLIC_RES = ['POEL', 'EOEL', 'CEL'];
		var EXTLIC_BUTTON = $('#extendedLicenseSelect');
		var PLANS_BUTTON = $(".plantype-items-container");
		var TOPUP_SHOW_BUTTON = $('#btn_topup_show');
		var TOPUP_HIDE_BUTTON = $('#btn_topup_hide');


		var SIZEGUIDE_BUTTON = $('#btn_sizeguide');
		var SIZEGUIDE_MODAL = $('#modal_sizeguide');

		// var PRICING_PURCHASE_BUTTON_1 = $('#download_nopurchased');
		var PURCHASE_BUTTON = $('#download_nopurchased, #btn_pricingpurchase');
		var DOWNLOAD_BUTTON = $('#downloadlinknew');
		var DOWNLOAD_BUTTON_SCROLL = $('#download_button_scroll');
		var MORE_PLANS_BUTTON = $('#btn_moreplans');

		var QUOTA_PRICE_DISPLAY = $('.plantype-downloadprice');

		var DETAILS_DOWNLOAD_EXIT_COMP = $('#details_download_exit_comp');

		var SELECTED_LICENSE_TAB = '';
		var SELECTED_LICENSE_TAB_ELEMENT = '';
		var SELECTED_STDLIC = '';
		var SELECTED_EXTLIC = '';
		var SELECTED_PLAN = '';
		var SELECTED_PLAN_TEMP = '';
		var SELECTED_SIZE = '';
		var gtmValLicense = "";
		var PRICING_DISPLAYED = false;

		if ($(document).data('UserSubsOnly')){
			var USER_SUBS_ONLY = $(document).data('UserSubsOnly');
		} else {
			var USER_SUBS_ONLY = false;
		}
		if ($('#downloadlinknew').length >= 1){
			var USER_PURCHASED = true;
		} else {
			var USER_PURCHASED = false;
		}
		var page_loading = true;
		var isDownloaded = isDownloaded_temp;
		var listDownloaded = listDownloaded_temp;

		// var QUOTA_TYPE_SELECT = $('#planTypeSelect');
		// var QUOTA_SELECTED_TEXT_STANDARD = $('#quotaSelectedTextStandard');
		// var QUOTA_SELECTED_TEXT_EXTENDED = $('#quotaSelectedTextExtended');
		// var QUOTA_TYPE_DISPLAY = $('#planTypeDisplay');
		// var QUOTA_PRICE_DISPLAY = $('#quotaPriceDisplay');
		// var PRICING_INFO_BOX = $('#details-pricing-info');
		// var PRICING_TITLE_DISPLAY = $('#details-pricing-title');
		// var PRICING_DESC_DISPLAY = $('#details-pricing-desc');

		var DOWNLOAD_TYPE_INFO = $('#downloadTypeInfo');
		var PURCHASE_TYPE_INFO = $('#purchaseTypeInfo');

		if ( USER_PURCHASED || isCNuser ){
			var VIEW_MODE = "download";
		} else {
			var VIEW_MODE = "purchase";
		}

		if ( VIEW_MODE == "download") {
			var PLAN_TYPE_INFO = DOWNLOAD_TYPE_INFO;
		} else {
			var PLAN_TYPE_INFO = PURCHASE_TYPE_INFO;
		}

		onPageLoad();

		function onPageLoad(){
			// console.log('EVERYTHING ON PAGE LOAD GOES HERE');

			//Init UI
			$(".ui.checkbox").checkbox();
			$('#licenseSummaryLink').popup({
				position   : 'right center',
				inline: true,
				distanceAway : 20
			});
			LICENSE_TAB.find('.item').tab();


			//Init value
			SELECTED_LICENSE_TAB = LICENSE_TAB.find('.active.item').data('tab');
			SELECTED_LICENSE_TAB_ELEMENT = LICENSE_TAB.find('.active.item');
			SELECTED_STDLIC = $('#standardSizesContainer').find('button.active');
			SELECTED_SIZE = SELECTED_STDLIC;

			if( $('input[name="'+VIEW_MODE+'TypeSelectBtn"]:checked').length > 0 ) {
				SELECTED_PLAN = $('input[name="'+VIEW_MODE+'TypeSelectBtn"]:checked').attr('data-type');
			} else {
				SELECTED_PLAN = initialPricingPackage;
			}

			if(EXTLIC_BUTTON.find('button.active').length > 0) {
				SELECTED_EXTLIC = EXTLIC_BUTTON.find('button.active');
			} else {
				SELECTED_EXTLIC = EXTLIC_BUTTON.find('button').first();
				EXTLIC_BUTTON.find('button').first().addClass('active');
			}

			updateSelectedPlan(SELECTED_PLAN);
			QUOTA_PRICE_DISPLAY.show();
			if ( (USER_PURCHASED && VIEW_MODE == "download") || isCNuser){
				if(typeof isDownloaded !== 'undefined' && isDownloaded === true){
					QUOTA_PRICE_DISPLAY.html("<div class='ui tiny active inline loader'></div>");
					setTimeout(function(){
						checkDownloaded(SELECTED_SIZE);
	                }, 250);
				}
				updateDownloadLink();
			} else {
				updatePricingInfo();
				updatePurchaseLink();
			}

			//Google Tag Manager - GTM Tracking - Added by Sam 2017-05-08
			// On page load/tab change, call function to push datalayer
			// gtmOnLoad is from JAVASCRIPT_DETAILS
			gtmOnLoad(licenseGtm.filetype, licenseGtm.gtmLicense, licenseGtm.dgtmRes, licenseGtm.dFormat);

			if(typeof goDownloadItem !== 'undefined' && goDownloadItem == true) {
				prepareDownloadLink(); // from JAVASCRIPT_DETAILS_ALL
				DOWNLOAD_BUTTON.trigger('click');
			}

			if(!bot){
				$.ajax({
					url: '/bigdata/logging/details_page_view_log.php',
					method: 'POST',
					data: {
						image_id: $('#imageIdText').html(),
						plan_type: typeof ab_flag !== "undefined" ? ab_flag:null,
						res: typeof preselect_res !== "undefined" ? preselect_res:null,
						popup: typeof is_pdetail !== "undefined" ? is_pdetail:null
					},
					success: function(data){
						// console.log(data);
					}
				});
			}

			checkDisplay();

			// console.log('SELECTED_PLAN : '+SELECTED_PLAN);
			// console.log('SELECTED_EXTLIC : '+SELECTED_EXTLIC);
			// console.log('SELECTED_LICENSE_TAB : '+ SELECTED_LICENSE_TAB);
			// console.log('SELECTED_SIZE.res :'+SELECTED_SIZE.data('res'));

			page_loading = false;
		}

		function toggleSizeButtons(enable){
			// console.log('toggleSizeButtons("'+enable+'")');

			if(enable){
				STDLIC_SIZE_BUTTON.removeClass('disabled');
				STDLIC_EDITOR_BUTTON.removeClass('disabled');
				// SELECTED_SIZE.trigger('click');
			} else {
				STDLIC_SIZE_BUTTON.addClass('disabled');
				STDLIC_EDITOR_BUTTON.addClass('disabled');
			}
		}

		function updateSizeDisplay(btnElement){
			// console.log('updateSizeDisplay(btnElement)');

			if(btnElement.data('res') != 'multi_ul' && btnElement.data('format') != 'EPS'){
				$('#pxWidthDisplay').html(btnElement.data('width-px'));
				$('#pxHeightDisplay').html(btnElement.data('height-px'));
				$('#irlWidthDisplay').html(btnElement.data('width-irl'));
				$('#irlHeightDisplay').html(btnElement.data('height-irl'));
				$('#dpiDisplay').html(btnElement.data('dpi'));
				$('#formatDisplay').html(btnElement.data('format'));

				$('#standardImageSizeDisplay').show();
				$('#epsImageSizeDisplay').hide();
				$('#customSizeDisplay').hide();
			}
			if(btnElement.data('format') == 'EPS'){
				$('#standardImageSizeDisplay').hide();
				$('#epsImageSizeDisplay').show();
				$('#customSizeDisplay').hide();
			} else if(btnElement.data('custom') == 'custom'){
				$('#standardImageSizeDisplay').hide();
				$('#epsImageSizeDisplay').hide();
				$('#customSizeDisplay').show();
			}
		}

		function updateSelectedLicense(tabElement){
			// console.log('updateSelectedLicense('+ tabElement.data('tab')+')');

			SELECTED_LICENSE_TAB = tabElement.data('tab');
			SELECTED_LICENSE_TAB_ELEMENT = tabElement;
			$('.license-container').hide();
			$(".license-container[data-tab='" + SELECTED_LICENSE_TAB + "']").show();

			if(SELECTED_LICENSE_TAB == 'extended'){ //extended tab
				gtmValLicense = SELECTED_SIZE.data('res');

				toggleSizeButtons(false);

				SELECTED_PLAN_TEMP = SELECTED_PLAN;
				if(SELECTED_PLAN_TEMP == "credits" || SELECTED_PLAN_TEMP == "single"){
					updateSelectedPlan(SELECTED_PLAN_TEMP);
				} else {
					updateSelectedPlan("credits");
				}

				$('#'+VIEW_MODE+'TypeCredPack').show();
				$('#'+VIEW_MODE+'TypeSubsPlan').hide(); //hide subs on extended tab
				$('#'+VIEW_MODE+'TypePsubPlan').hide(); //hide psub on extended tab

				updateSelectedSize(SELECTED_EXTLIC);

			} else { //standard tab
				gtmValLicense = $('#gtmImage').data('license');

				toggleSizeButtons(true);
				if (SELECTED_PLAN_TEMP != ""){
					SELECTED_PLAN = SELECTED_PLAN_TEMP;
				}

				if (USER_SUBS_ONLY){

					if( VIEW_MODE == "purchase" ){
						$('#'+VIEW_MODE+'TypeCredPack').show();
						updateSelectedPlan("subs");
					} else {
						$('#'+VIEW_MODE+'TypeCredPack').hide();
						updateSelectedPlan(USER_SUBS_ONLY);
					}
				} else {
					$('#'+VIEW_MODE+'TypeCredPack').show();
					updateSelectedPlan(SELECTED_PLAN);
				}

				$('#'+VIEW_MODE+'TypeSubsPlan').show(); //show subs standard tab
				$('#'+VIEW_MODE+'TypePsubPlan').show(); //show psub standard tab

				updateSelectedSize(SELECTED_STDLIC);
			}

			if ( $('.plantype-items-container:visible').length == 1){ //hide radio buttons
				$('.plantype-items-container:visible').find('.ui.radio.checkbox').hide();
			} else {
				$('.plantype-items-container:visible').find('.ui.radio.checkbox').show();
			}

		}

		function updateSelectedSize(btnElement){
			// console.log('updateSelectedSize()');

			SELECTED_SIZE = btnElement;
			updateSizeDisplay(SELECTED_SIZE);

			if(SELECTED_LICENSE_TAB == 'extended') {
				SELECTED_EXTLIC = SELECTED_SIZE;
			} else {
				SELECTED_STDLIC = SELECTED_SIZE;
			}

			// updateDownloadLink();
		}

		function updateSelectedPlan(plan){
			// console.log('updateSelectedPlan("'+plan+'")');

			SELECTED_PLAN = plan;
			PLAN_TYPE_INFO.find('.plantype-items-container').css('background-color', '');
			PLAN_TYPE_INFO.find('.plantype-hiddendetails').hide();
			PLAN_TYPE_INFO.find('.plantype-selector[data-type="'+plan+'"]').prop('checked', true);

			switch(plan){
				case 'single':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSinglePurchase').css('background-color', '#f9f9f9');
					break;
				case 'credits':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeCredPack').css('background-color', '#f9f9f9');
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeCredPack').find('.plantype-hiddendetails').show();
					break;
				case 'subs':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSubsPlan').css('background-color', '#f9f9f9');
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSubsPlan').find('.plantype-hiddendetails').show();
					break;
				case 'dlpack':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypePsubPlan').css('background-color', '#f9f9f9');
					break;
			}

			// updateDownloadLink();
		}


		function updatePricingInfo(){
			// console.log('updatePricingInfo()');

			// console.log('---- Price Update --- ');
			// console.log('Single, credits : '+pricingText.credits.size[SELECTED_SIZE.data('dispres')].credits );
			// console.log('Single, price : '+pricingText.credits.size[SELECTED_SIZE.data('dispres')].size_price.single);
			// console.log('CreditPack, price : '+ pricingText.credits.size[SELECTED_SIZE.data('dispres')].size_price.pack );
			// console.log('CreditPack, perimage : '+ pricingText.credits.text.LANG_DETAILSPRICING_PERIMAGESIZE.replace("%SIZE%", SELECTED_SIZE.html())  );

			if( VIEW_MODE == "purchase" ) {
				$('#'+VIEW_MODE+'TypeSinglePurchase .plantype-downloadprice').html( pricingText.credits.size[SELECTED_SIZE.data('dispres')].credits );
				$('#'+VIEW_MODE+'TypeCredPack .plantype-downloadprice').html( pricingText.credits.size[SELECTED_SIZE.data('dispres')].credits );
				$('#'+VIEW_MODE+'TypeSinglePurchase .plantype-price').html( pricingText.credits.size[SELECTED_SIZE.data('dispres')].size_price.single );


				if(SELECTED_LICENSE_TAB == 'extended' || SELECTED_SIZE.data('custom')) {
					$('#'+VIEW_MODE+'TypeCredPack .plantype-perimage').html( pricingText.credits.text.LANG_DETAILSPRICING_PERIMAGE );
				} else {
					$('#'+VIEW_MODE+'TypeCredPack .plantype-perimage').html( pricingText.credits.text.LANG_DETAILSPRICING_PERIMAGESIZE.replace("%SIZE%", SELECTED_SIZE.html() ));
				}
				$('#'+VIEW_MODE+'TypeCredPack .plantype-desc').html(
					pricingText.credits.text.LANG_DETAILSPRICING_BUYCREDDETAILS.
					replace("%NUM%", pricingText.credits.size[SELECTED_SIZE.data('dispres')].plan).
					replace("%PRICE%", pricingText.credits.size[SELECTED_SIZE.data('dispres')].plan_price )
				);
				$('#'+VIEW_MODE+'TypeCredPack .plantype-price').html( pricingText.credits.size[SELECTED_SIZE.data('dispres')].size_price.pack );

				// updatePurchaseLink();
			}
		}

		function updateDownloadLink(){
			// console.log('updateDownloadLink()');

			if ( USER_PURCHASED && VIEW_MODE == "download") {
				// set the plan param
				var param_pkg = '1';
				switch (SELECTED_PLAN) {
					case 'single':
					case 'credits':
						param_pkg = '3';
						break;
					case 'subs':
						param_pkg = '1';
						break;
					case 'dlpack':
						param_pkg = '2';
						break;
				}
				var dllink = SELECTED_SIZE.data('download-link');
				dllink = dllink.concat('&pkg=' + param_pkg);

				if ( SELECTED_SIZE.data("custom") == "custom" ){ //Editor
					DOWNLOAD_BUTTON.attr('data-key', 'customsize');
					DOWNLOAD_BUTTON.find('.button').html(langDetails.editImage);
					DOWNLOAD_BUTTON.attr('href', dllink);

					//details for tag manager, gtmdetails is defined in JAVASCRIPT_DETAILS
					gtmdetails['res'] = SELECTED_SIZE.data('gtm-res');
					gtmdetails['format'] = SELECTED_SIZE.data('gtm-format');
					gtmOnLoad(
						$('#gtmImage').data('filetype'),
						$('#gtmImage').data('license'),
						SELECTED_SIZE.data('gtm-res'),
						SELECTED_SIZE.data('gtm-format')
					);

				} else {
					var res = SELECTED_SIZE.data('res');
					var format = SELECTED_SIZE.data('format');
					var mode = 'popup';

					DOWNLOAD_BUTTON.attr('data-key', res+"_"+format.toLowerCase());
					DOWNLOAD_BUTTON.find('.button').html(langDetails.download);
					if(mode=="popup"){
						DOWNLOAD_BUTTON.attr('href', dllink);
					}

					var gtmVals = {
						res : SELECTED_SIZE.data('gtm-res'),
						format : SELECTED_SIZE.data('gtm-format'),
						resolution: SELECTED_SIZE.data('res'),
						filetype : $('#gtmImage').data('filetype'),
						license : gtmValLicense
					}

					//details for tag manager, gtmdetails is defined in JAVASCRIPT_DETAILS
					gtmdetails['res'] = gtmVals.res;
					gtmdetails['format'] = gtmVals.format;
					gtmdetails['resolution'] = gtmVals.resolution;
					gtmOnLoad(gtmVals.filetype, gtmVals.license, gtmVals.res, gtmVals.format);

				}
			} else if ( isCNuser ){
				updatePurchaseLink();
			}
		}

		function updatePurchaseLink(){
			// console.log('updatePurchaseLink()');

			switch (SELECTED_PLAN) {
				case 'single':
					var purchase_url = pricingText.credits.url;
					purchase_url = purchase_url.replace( "%CRED%", pricingText.credits.size[SELECTED_SIZE.data('dispres')].credits );
					PURCHASE_BUTTON.attr('href', purchase_url);
					break;
				case 'credits':
					var purchase_url = pricingText.credits.url;
					purchase_url = purchase_url.replace( "%CRED%", pricingText.credits.size[SELECTED_SIZE.data('dispres')].plan );
					PURCHASE_BUTTON.attr('href', purchase_url);
					break;
				case 'subs':
					PURCHASE_BUTTON.attr('href', pricingText.subs.url);
					break;
			}
		}

		function gtmNoPurchase(){
			// console.log('gtmNoPurchase()');

			// var pricing_box_visibility = PLAN_TYPE_INFO.is(":visible");
			// if(pricing_box_visibility==true)
			// {
			dataLayer.push({
				"event": "details_page_pricing",
				"status": (getCookie("logindone")==null)?"0":"1",
				"country": (getCookie("myregion")!=null)?getCookie("myregion").split('|')[0]:"",
				"package": SELECTED_PLAN
			});
			// }
		}

		function checkDisplay(){

			if ( $(window).width() >=  768 ) {
				DOWNLOAD_BUTTON_SCROLL.detach().insertBefore('#purchaseTypeInfo');
				if( PRICING_DISPLAYED || USER_PURCHASED ){
					DOWNLOAD_BUTTON_SCROLL.hide();
					PLAN_TYPE_INFO.show();
					PURCHASE_BUTTON.show();
					MORE_PLANS_BUTTON.show();
				} else {
					if ( !isCNuser) {
						DOWNLOAD_BUTTON_SCROLL.show();
						PLAN_TYPE_INFO.hide();
						PURCHASE_BUTTON.hide();
						MORE_PLANS_BUTTON.hide();
					}
				}
			} else {
				DOWNLOAD_BUTTON_SCROLL.detach().appendTo('#download_button_scroll_mobile_cont');
				DOWNLOAD_BUTTON_SCROLL.show();
				PLAN_TYPE_INFO.show();
				PURCHASE_BUTTON.show();
				MORE_PLANS_BUTTON.show();
			}
		}

		function checkDownloaded( SELECTED_SIZE ){
			// console.log("checkDownloaded()");
            if(typeof isDownloaded !== 'undefined' && isDownloaded === true){

       			if( SELECTED_SIZE.data('custom') == "custom" ){
       				var size_custom = "L";
       			}

       			if( listDownloaded[SELECTED_SIZE.data('dispres')] || listDownloaded[size_custom] ){
       				QUOTA_PRICE_DISPLAY.html('0');
       			} else {
       				$('#'+VIEW_MODE+'TypeCredPack .plantype-downloadprice').html( SELECTED_SIZE.data('price-credits') );
					$('#'+VIEW_MODE+'TypeSubsPlan .plantype-downloadprice').html( 1 );
					$('#'+VIEW_MODE+'TypePsubPlan .plantype-downloadprice').html( 1 );
       			}

            } else {
            	$('#'+VIEW_MODE+'TypeCredPack .plantype-downloadprice').html( SELECTED_SIZE.data('price-credits') );
            	$('#'+VIEW_MODE+'TypeSubsPlan .plantype-downloadprice').html( 1 );
				$('#'+VIEW_MODE+'TypePsubPlan .plantype-downloadprice').html( 1 );
            }
        }

        function updateDownloaded(){
        	isDownloaded = true;
        	setTimeout(function(){
	        	$.ajax({
	                url: '/bootstrap_mvc/ajax/check_downloaded.php',
	                method: 'GET',
	                dataType: 'json',
	                data: {
	                    filename: image_filename
	                },
	                success: function(data){
	                    listDownloaded = data;
	                }
	            });
        	}, 2000);
        }

        function switchView(view){
			// console.log('================');

        	if ( view == "download"){
        		VIEW_MODE = "download";
        		PURCHASE_TYPE_INFO.hide();
        		DOWNLOAD_TYPE_INFO.show();
        		PLAN_TYPE_INFO = DOWNLOAD_TYPE_INFO;
        		if( $('input[name="'+VIEW_MODE+'TypeSelectBtn"]:checked').length > 0 ) {
					SELECTED_PLAN = $('input[name="'+VIEW_MODE+'TypeSelectBtn"]:checked').attr('data-type');
				} else {
					SELECTED_PLAN = initialPricingPackage;
				}
        		SELECTED_PLAN_TEMP = "";

        		updateSelectedLicense(SELECTED_LICENSE_TAB_ELEMENT);
        		checkDownloaded(SELECTED_SIZE);
        		updateDownloadLink();
        	} else {
				VIEW_MODE = "purchase";
				PURCHASE_TYPE_INFO.show();
        		DOWNLOAD_TYPE_INFO.hide();
				PLAN_TYPE_INFO = PURCHASE_TYPE_INFO;
				SELECTED_PLAN = $('input[name="'+VIEW_MODE+'TypeSelectBtn"]:checked').attr('data-type');
        		SELECTED_PLAN_TEMP = "";

				updateSelectedLicense(SELECTED_LICENSE_TAB_ELEMENT);
				updatePricingInfo();
				updatePurchaseLink();
        	}


        	// console.log('SELECTED_SIZE : '+SELECTED_SIZE.data('dispres'));
        	// console.log('SELECTED_PLAN : '+SELECTED_PLAN);
        	// console.log('SELECTED_LICENSE_TAB : '+SELECTED_LICENSE_TAB);

        }


		PLANS_BUTTON.on('click', function(){
			// console.log('================');

			updateSelectedPlan($(this).find('.plantype-selector').attr('data-type'));
			if ( (USER_PURCHASED && VIEW_MODE == "download") || isCNuser){
				updateDownloadLink();
			} else {
				updatePricingInfo();
				updatePurchaseLink();
			}
		});

		PLANS_BUTTON.on('mouseenter', function(){
			PLAN_TYPE_INFO.find('.plantype-items-container').css('background-color', '');

			var ONHOVER_PLAN = $(this).find('.plantype-selector').attr('data-type');
			switch(ONHOVER_PLAN){
				case 'single':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSinglePurchase').css('background-color', '#f9f9f9');
					break;
				case 'credits':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeCredPack').css('background-color', '#f9f9f9');
					break;
				case 'subs':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSubsPlan').css('background-color', '#f9f9f9');
					break;
				case 'dlpack':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypePsubPlan').css('background-color', '#f9f9f9');
					break;
			}
		});

		PLANS_BUTTON.on('mouseleave', function(){
			PLAN_TYPE_INFO.find('.plantype-items-container').css('background-color', '');
			PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeCredPack').find('.plantype-hiddendetails').hide();
			PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSubsPlan').find('.plantype-hiddendetails').hide();
			switch(SELECTED_PLAN){
				case 'single':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSinglePurchase').css('background-color', '#f9f9f9');
					break;
				case 'credits':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeCredPack').css('background-color', '#f9f9f9');
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeCredPack').find('.plantype-hiddendetails').show();
					break;
				case 'subs':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSubsPlan').css('background-color', '#f9f9f9');
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypeSubsPlan').find('.plantype-hiddendetails').show();
					break;
				case 'dlpack':
					PLAN_TYPE_INFO.children('#'+VIEW_MODE+'TypePsubPlan').css('background-color', '#f9f9f9');
					break;
			}
		});

		//License tab Selector
		LICENSE_TAB.find('.item').on('click', function(e){
			// console.log('================');

			LICENSE_TAB.find('.item').removeClass('active');
			$(this).addClass('active');

			updateSelectedLicense($(this));
			if ( (USER_PURCHASED && VIEW_MODE == "download") || isCNuser){
				checkDownloaded(SELECTED_SIZE);
				updateDownloadLink();
			} else {
				updatePricingInfo();
				updatePurchaseLink();
			}
		})


		EXTLIC_BUTTON.on('click','button', function(){
			// console.log('================');

			if (SELECTED_LICENSE_TAB == 'extended' && SELECTED_EXTLIC != $(this).data('res')) {
				EXTLIC_BUTTON.find('button').removeClass('active');
				$(this).addClass('active');

				updateSelectedSize($(this));
				if ( (USER_PURCHASED && VIEW_MODE == "download")  || isCNuser){
					checkDownloaded(SELECTED_SIZE);
					updateDownloadLink();
				} else {
					updatePricingInfo();
					updatePurchaseLink();
				}
			}

		});


		//SIZE BUTTON
		STDLIC_SIZE_BUTTON.on('click', function(e){
		    // console.log('================');

			STDLIC_SIZE_BUTTON.removeClass('active');
			STDLIC_EDITOR_BUTTON.removeClass('active');
			$(this).addClass('active');

			updateSelectedSize($(this));
	    	if ( (USER_PURCHASED && VIEW_MODE == "download") || isCNuser){
				checkDownloaded(SELECTED_SIZE);
				updateDownloadLink();
			} else {
				updatePricingInfo();
				updatePurchaseLink();
			}

		    // Set cookie for selected res
			var futdate = new Date();
		    var expdate = futdate.getTime();
		    expdate += 14 * 24 * 3600 * 1000; // expires in 14 days (milliseconds)
		    futdate.setTime(expdate);
		    setCookie('lastres', $(this).data('key'), futdate, '/', '.123rf.com');

		});
		STDLIC_SIZE_BUTTON.on('mouseover', function(e){
			updateSizeDisplay($(this));
		});
		STDLIC_SIZE_BUTTON.on('mouseleave', function(e){
			updateSizeDisplay(SELECTED_SIZE);
		});

		//EDITOR BUTTON
		STDLIC_EDITOR_BUTTON.on('click', function(e){
			// console.log('================');

			STDLIC_SIZE_BUTTON.removeClass('active');
			$(this).addClass('active');

			updateSelectedSize($(this));
			if ( (USER_PURCHASED && VIEW_MODE == "download") || isCNuser){
				checkDownloaded(SELECTED_SIZE);
				updateDownloadLink();
			} else {
				updatePricingInfo();
				updatePurchaseLink();
			}

		});
		STDLIC_EDITOR_BUTTON.on('mouseover', function(e){
			updateSizeDisplay($(this));
		});
		STDLIC_EDITOR_BUTTON.on('mouseleave', function(e){
			updateSizeDisplay(SELECTED_SIZE);
		});

		//Pricing Info Related
		DOWNLOAD_BUTTON.on('click', function(){
			// gtmNoPurchase();
			if(!bot){
				// details page download button cta tracker
				$.ajax({
					url: '/bigdata/logging/details_page_download_log.php',
					method: 'POST',
					data: {
						image_id: $('#imageIdText').html(),
						plan_type: typeof ab_flag !== "undefined" ? ab_flag:null,
						res: typeof preselect_res !== "undefined" ? preselect_res:null
					},
					success: function(data){
						updateDownloaded();
						checkDownloaded( SELECTED_SIZE );
					}
				});
			}
		});

		//Fire the gtm pricing popup when pressing the mobile's download button and no login
		DOWNLOAD_BUTTON_SCROLL.on('click', function(){

			gtmNoPurchase();
			if ($(window).width() >=  768) {
				this.hide();
				PLAN_TYPE_INFO.transition('slide down',function(){
					PURCHASE_BUTTON.show();
					MORE_PLANS_BUTTON.show();
					PRICING_DISPLAYED = true;
				});

			} else {

				$('html, body').animate({
                    scrollTop: PLAN_TYPE_INFO.offset().top - 150
                }, 200);

			}
		});

		// details page purchase button CTA
		PURCHASE_BUTTON.on('click', function(){
			if(!bot){
				// details page purchase button cta tracker
				$.ajax({
					url: '/bigdata/logging/details_page_purchase_log.php',
					method: 'POST',
					data: {
						image_id: $('#imageIdText').html(),
						plan_type: typeof ab_flag !== "undefined" ? ab_flag:null,
						res: typeof preselect_res !== "undefined" ? preselect_res:null
					},
					success: function(data){
						// console.log(data);
					}
				});
			}
		});

	    SIZEGUIDE_BUTTON.on("click", function(){
	        SIZEGUIDE_MODAL.modal('show');
	    });

		//Download button - data push
		DOWNLOAD_BUTTON.on('click', function(){
			// send data gtm is from JAVASCRIPT_DETAILS

			data = sendDataGTM();
			if (data['res'] == '' || data['format'] == '')
			{
				data['res']    = licenseGtm.dgtmRes;
				data['format'] = licenseGtm.dFormat;
			}
			if(data['resolution'] == undefined || data['resolution'] == '')
			{
				data['resolution'] = licenseGtm.systemRes;
			}
			downloadFullGTM(data['res'],data['format'], licenseGtm.filetype, licenseGtm.gtmLicense, data['resolution']);
		});

		//Click More Plans Button - data push
		MORE_PLANS_BUTTON.on('click', function(){
			//Fire Click More Plans Event
			clickMorePlans();
		});

		TOPUP_SHOW_BUTTON.on('click', function(){
			switchView("purchase");
			dataLayer.push({
			    "event": "top_up_show"
			});
		});

		TOPUP_HIDE_BUTTON.on('click', function(){
			switchView("download");
			dataLayer.push({
			    "event": "top_up_hide"
			});
		});

		DETAILS_DOWNLOAD_EXIT_COMP.on('click',function(e){
			dataLayer.push({
	        	"event": "top_up_now_continue_close"
	        });
		});


        $(window).bind('resize', function(e){
            window.resizeEvt;
            $(window).resize(function(){
            	checkDisplay();
                clearTimeout(window.resizeEvt);
                window.resizeEvt = setTimeout(function(){ //Only run the refresh once when browser window is done resizing
                }, 250);
            });
        });

	}(jQuery))
});