var track_load = 0; //total loaded record group(s)
var loading  = false; //to prevents multipal ajax loads
var total_groups = 199;//total record group(s)

var countries_mini_thumb = ['AG', 'IN', 'CO', 'RU', 'BR', 'MX', 'UA', 'ID', 'TR', 'AU', 'MY'];
var domain_mini_thumb = ['it.123rf.com', 'fr.123rf.com'];
var loaded_similarImgID = [];

jQuery(document).on('ready', function(e){

    function getSimilarImages(){

        jQuery('.animation_image').show(); //show loading image
        loading = true;
        jQuery.ajax({
            url: siteurl+"/details_similar_img.php",
            type: 'POST',
            data:{
                similarImgID: wordval,
                lr_code: track_load,
                ftmode: "1",
                is_pdetail: is_pdetail,
                fromid: fromid,
                country: country,
                loaded_similarImgID: loaded_similarImgID
            },
            success: function(result){
                if(result.trim() != ""){
                    jQuery('#simiTitle').show();
                    $result = jQuery(result).css({ opacity: 0 });

                    if(countries_mini_thumb.indexOf(country) !== -1 || domain_mini_thumb.indexOf(window.location.hostname) !== -1 ) {
                        $result.animate({ opacity: 1 });
                        jQuery('#main_container_mosaic').append(result);

                        updateImgSrc();
                        jQuery('.animation_image').hide(); //hide loading image once data is received
                        track_load += 25; //loaded group increment
                        loading = false;

                        // from jiew-search.js -> to reinit for dynamically created div
                        initMoscCont();
                        initIconPopup();
                        // from details.js -> bind the click event of likebox action for popping up modal
                        initLikeboxAction();

                        updateLoadedSimilarImgID();
                    } else {
                        $result.imagesLoaded(function(e){
                            $result.animate({ opacity: 1 });
                            jQuery('#main_container_mosaic').append(result);

                            jQuery('.animation_image').hide(); //hide loading image once data is received
                            track_load += 25; //loaded group increment
                            loading = false;

                            // from jiew-search.js -> to reinit for dynamically created div
                            initMoscCont();
                            initIconPopup();
                            // from details.js -> bind the click event of likebox action for popping up modal
                            initLikeboxAction();

                            updateLoadedSimilarImgID();
                        });
                    }

                } else {
                    jQuery('.animation_image').hide();
                }
            }
        });
    }

    // get initial similar images
    setTimeout(function (){
        getSimilarImages();
    }, 250);

    // from the declaration in details_similar_img.php
    similarScroller.scroll(function() {
        if(jQuery(window).scrollTop() + jQuery(window).height() >= jQuery(document).height() - 2500)  //user scrolled to bottom of the page?
        {
            if((track_load < total_groups) && !loading) //more data to load
            {
                getSimilarImages();
            }
        }
    });

    jQuery(window).resize(function() {
        updateImgSrc();
    });

    function updateImgSrc() {
        var height = jQuery(window).height();
        var width = jQuery(window).width();

        if(width < 567) {
            jQuery('.similar-item-tile img').each( function(e) {
                var temp = jQuery(this).attr('data-smsrc');
                jQuery(this).attr('src', temp);
            });
        } else {
            jQuery('.similar-item-tile img').each( function(e) {
                var temp = jQuery(this).attr('data-bgsrc');
                jQuery(this).attr('src', temp);
            });
        }
    }

    function updateLoadedSimilarImgID() { //prevent duplicate imgid
        loaded_similarImgID = [];
        jQuery.each( jQuery('#main_container_mosaic .mosaic-main-container') , function(){
            loaded_similarImgID.push(jQuery(this).attr('data-imgid'));
        });
    }
});
