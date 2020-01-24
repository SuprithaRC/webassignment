var kwcluster = { "setup" : ".kwcluster-wrapper" };
if ( jQuery(kwcluster.setup).length ) {
    kwcluster.ready = 1;
    kwcluster.is_initialized = false;

    var allow_drag = true;
    var allow_drag_temp = false;
    var kwclustercontainer = jQuery('#kwcluster-main');
    var owl = jQuery('.kwcluster-slider');
    var owlcontainer = jQuery('.kwcluster-slider-container');

    var data = {
        touchDrag: true,
        mouseDrag: true,
        smartSpeed: 125,
        margin:10,
        loop:false,
        slideBy: 6,
        autoWidth:true,
        responsive : {
            0 : {
                slideBy : 2
            },
            568 : {
                slideBy : 3
            },
            768 : {
                slideBy : 4
            },
            991 : {
                slideBy : 5
            }
        },
        onTranslated:doSliding,
        onResized: carouselResize,
        onInitialized: carouselInit,
        onRefreshed: carouselRefreshed
    };

    if( typeof is_details_page === 'undefined' || is_details_page === null ){} else {
        data.borderMargin = 30;
    }

    function doSliding(){

        var btnPrev = jQuery('.kwcluster-slider-nav.prev');
        var btnNext = jQuery('.kwcluster-slider-nav.next');
        var mainWrapper = jQuery('.kwcluster-slider-container');
        var firstItem = jQuery('.owl-carousel .owl-item').first();
        var lastItem = jQuery('.owl-carousel .owl-item').last();
        var firstItemVisible;
        var lastItemVisible;

        if( jQuery(window).width() < 568 ){ //mobile view hide nav button and allow drag only

        } else {

            if ( (mainWrapper.offset().left + mainWrapper.outerWidth()) > (lastItem.offset().left + lastItem.outerWidth()) ){ // check if lastItem Fully visible
                lastItemVisible = true;
            } else {
                lastItemVisible = false;
            }

            // check if firstItem Fully visible
            // if (jQuery('.kwcluster-xchip-container').length){
                if ( (firstItem.offset().left - mainWrapper.offset().left) == 16 ){
                    firstItemVisible = true;
                } else {
                    firstItemVisible = false;
                }
            // } else {
            //     if ( firstItem.offset().left == 30 ){
            //         firstItemVisible = true;
            //     } else {
            //         firstItemVisible = false;
            //     }
            // }

            if( firstItemVisible && !lastItemVisible ){
                btnPrev.fadeOut(500);
                btnNext.fadeIn();
            } else if ( lastItemVisible && !firstItemVisible ){
                btnPrev.fadeIn();
                btnNext.fadeOut(500);
            } else if ( !firstItemVisible && !lastItemVisible ){
                btnPrev.fadeIn();
                btnNext.fadeIn();
            } else if ( firstItemVisible && lastItemVisible ){
                btnPrev.fadeOut(500);
                btnNext.fadeOut(500);
            }
        }

    }

    function toggleNav() {
        var btnPrev = jQuery('.kwcluster-slider-nav.prev');
        var btnNext = jQuery('.kwcluster-slider-nav.next');
        var mainWrapper = jQuery('.kwcluster-slider-container');
        var firstItem = jQuery('.owl-carousel .owl-item').first();
        var lastItem = jQuery('.owl-carousel .owl-item').last();
        var firstItemVisible;
        var lastItemVisible;

        if ( (mainWrapper.offset().left + mainWrapper.outerWidth()) > (lastItem.offset().left + lastItem.outerWidth()) ){ // check if lastItem Fully visible
            lastItemVisible = true;
        } else {
            lastItemVisible = false;
        }

        // if (jQuery('.kwcluster-xchip-container').length){
            if ( (firstItem.offset().left - mainWrapper.offset().left) == 16 ){
                firstItemVisible = true;
            } else {
                firstItemVisible = false;
            }
        // }  else {
        //     if ( firstItem.offset().left == 30 ){ // check if firstItem Fully visible
        //         firstItemVisible = true;
        //     } else {
        //         firstItemVisible = false;
        //     }
        // }

        if( jQuery(window).width() < 568 ){ //mobile view hide nav button and allow drag only
            btnPrev.hide();
            btnNext.hide();

            if( firstItemVisible && lastItemVisible ){
                allow_drag_temp = false;
            } else {
                allow_drag_temp = true;
            }

        } else {
            if( firstItemVisible && !lastItemVisible ){
                btnPrev.hide();
                btnNext.show();
                allow_drag_temp = true;
            } else if ( lastItemVisible && !firstItemVisible ){
                btnPrev.show();
                btnNext.hide();
                allow_drag_temp = true;
            } else if ( !firstItemVisible && !lastItemVisible ){
                btnPrev.show();
                btnNext.show();
                allow_drag_temp = true;
            } else if ( firstItemVisible && lastItemVisible ){
                btnPrev.hide();
                btnNext.hide();
                allow_drag_temp = false;
            }

        }
    }

    function toggleDrag(status){
        if(status == true) {
            data.touchDrag = true;
            data.mouseDrag = true;
        } else {
            data.touchDrag = false;
            data.mouseDrag = false;
        }

        owl.trigger('destroy.owl.carousel');
        owl.owlCarousel(data);
    }

    function carouselResize() {
        var w_total =jQuery('.kwcluster-wrapper').outerWidth(true);
        // var w_next = jQuery('.kwcluster-slider-nav.next').outerWidth(true) ;
        // var w_prev = jQuery('.kwcluster-slider-nav.prev').outerWidth(true) ;
        var w_slider = (jQuery('.kwcluster-slider-container').outerWidth(true)-jQuery('.kwcluster-slider-container').outerWidth());
        var w_xchip = 0;
        if (jQuery('.kwcluster-xchip-container').length){
            w_xchip = jQuery('.kwcluster-xchip-container').outerWidth(true);
        }
        var w_remain = w_total - w_slider - w_xchip - 1;
        var w_result = (w_remain / w_total * 100);

        // console.log("w_total : "+w_total);
        // console.log("w_next : "+w_next);
        // console.log("w_prev : "+w_prev);
        // console.log("w_slider : "+w_slider);
        // console.log("w_xchip : "+w_xchip);
        // console.log("w_remain : "+w_remain);
        // console.log("w_result : "+w_result);

        jQuery('.kwcluster-slider-container').css('width', w_result+"%" );

        toggleNav();
        if ( allow_drag != allow_drag_temp ) {
            toggleDrag(allow_drag_temp);
            allow_drag = allow_drag_temp;
        }

        owl.trigger('refresh.owl.carousel');
    }

    function carouselRefreshed(){
        jQuery('.owl-stage').css('width',kwcluster.stored_width);
    }

    function carouselInit(){

        if (!kwcluster.is_initialized) {
            setTimeout(function(){
                arrowboxInit();
                if(getCookie('kribbon') == 0 ){
                    carouselHide();
                } else {
                    carouselShow();
                }
            }, 10);

            kwcluster.stored_width = jQuery('.owl-stage').css('width');
            kwcluster.is_initialized = true;
        }
    }

    function carouselShow(){
        kwclustercontainer.show();
        owlcontainer.css({ position: "relative", visibility: "visible"});

        jQuery(".arrow-box img").removeClass('arrow-down');
        jQuery(".arrow-box img").addClass('arrow-up');
    }
    function carouselHide(){
        kwclustercontainer.hide();
        owlcontainer.css({ position: "absolute", visibility: "hidden"});

        if( jQuery(window).width() > 991 ){
             jQuery(".arrow-box").hide();
        }
        jQuery(".arrow-box img").removeClass('arrow-up');
        jQuery(".arrow-box img").addClass('arrow-down');
    }

    function arrowboxInit(){
        jQuery('.adv-search-container').append('<div class="arrow-box-container"><div class="arrow-box"><img src="//static-cdn.123rf.com/images/icons/down_icon.png" class="arrow-up"></span></div></div>');
    }

    jQuery(document).on('ready', function() {
        if(owl.length) {
            owl.owlCarousel(data);
            carouselResize();

            owl.on('mousewheel', '.owl-stage', function (e) {
                if (e.deltaY>0) {
            owl.trigger('next.owl.carousel');
                } else {
            owl.trigger('prev.owl.carousel');
                }
                e.preventDefault();
            });

            jQuery(".kwcluster-slider-nav.next").click(function() {
                owl.trigger('next.owl.carousel');
            });
            jQuery(".kwcluster-slider-nav.prev").click(function() {
                owl.trigger('prev.owl.carousel');
            });
        }

        jQuery("body").on("mouseleave", "div#main-wrapper-searchresult", function() {
            if( jQuery(window).width() > 991 ){
                jQuery(".arrow-box").css('top',"-5px");
                jQuery(".arrow-box").show();
                jQuery(".arrow-box").stop().animate({
                        top: '+=4px',
                }, 250, function(){
                    jQuery(".arrow-box").css('top',"-1px");
            });
            }
        });
        jQuery("body").on("mouseenter", "div#main-wrapper-searchresult", function() {
            if( jQuery(window).width() > 991 ){
                jQuery(".arrow-box").stop().animate({
                    top: '-=5px',
                }, 50, function(){
                    jQuery(".arrow-box").css('top',"");
                    jQuery(".arrow-box").hide();
                });
            }
        });

        jQuery("body").on("click", "div.arrow-box", function() {
            var futdate = new Date();
            var expdate = futdate.getTime();
            expdate += 3600*24*3;
            futdate.setTime(expdate);

            if( kwclustercontainer.css('display') == 'none') {

                kwclustercontainer.css('height','0px');
                kwclustercontainer.show();
                owlcontainer.css({ position: "relative", visibility: "visible"});
                jQuery(".arrow-box img").removeClass('arrow-down');
                jQuery(".arrow-box img").addClass('arrow-up');
                toggleNav();
                kwclustercontainer.stop().animate({
                    height: '75px',
                }, 250, function(){

                });

                setCookie('kribbon', 1, futdate, '/', '.123rf.com');
            } else {

                kwclustercontainer.css('height','75px');
                owlcontainer.css({ position: "absolute", visibility: "hidden"});
                jQuery(".arrow-box img").removeClass('arrow-up');
                jQuery(".arrow-box img").addClass('arrow-down');

                kwclustercontainer.stop().animate({
                    height: '0px',
                }, 250, function(){
                    kwclustercontainer.hide();
                });

                setCookie('kribbon', 0, futdate, '/', '.123rf.com');
            }
        });

    });
}