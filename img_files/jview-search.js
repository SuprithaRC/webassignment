function getWidthForHeight(image, height){
    return height * (image.width/image.height);
}

function processBlock_rebuild(data,type){
    jQuery("#target-container").html("");
    processBlock(data,type);
}
function staticMagnifyMosaic(imageID,imgSrc,imgSrcSmall) {

    if(getCookie('previewimages') != 'no')
    {
        if(navigator.appVersion.indexOf("MSIE 7.")!=-1 || navigator.appVersion.indexOf("MSIE 8.")!=-1)
        {
            if (!window.cacheserver || cacheserver == '') cacheserver = 'http://us.123rf.com';
            var imgdiv = '<div style=\'position:relative;margin: 6px;text-align:center;\'>';
            var imgsrc = '<div><img id="imgt1" class="loading" style="max-width:450px;max-height:450px;" src="'+cacheserver+'/'+imgSrc+'"></div>';
            return overlib(imgdiv + imgsrc + '</div>', ABOVE, HAUTO, VAUTO, BGCOLOR, '#231F20', FGCOLOR, '#231F20',NOFOLLOW,DELAY, 500);
        }
        else
        {
            var maxSize = 450;
            var imgID = jQuery("#"+imageID); // Get my img elem
            var overlibWidth;
            var overlibHeight;
            jQuery("<img/>")
            .attr("src", jQuery(imgID).attr("src"))
            .load(function() {
                overlibWidth = this.width;
                overlibHeight = this.height;

                if (overlibHeight > overlibWidth) {
                    overlibWidth = (overlibWidth / overlibHeight) * maxSize;
                    overlibHeight = maxSize;
                } else {
                    overlibHeight = (overlibHeight / overlibWidth) * maxSize;
                    overlibWidth = maxSize;
                }
                jQuery(".loadBlur").attr('src', cacheserver+'/'+imgSrcSmall);
                jQuery(".loadBlur").css('height', overlibHeight);
                jQuery(".loadBlur").css('width', overlibWidth);
                jQuery(".mouseContainer").css('width', overlibWidth);
                jQuery(".mouseContainer").css('height', overlibHeight);
                jQuery(".loadReal").css('maxHeight', maxSize);
                jQuery(".loadReal").css('maxWidth', maxSize);
                jQuery(".loadReal").attr('src', cacheserver+'/'+imgSrc);
                overlib(jQuery(".mouseMainContainer").html(), ABOVE, HAUTO, VAUTO, BGCOLOR, '#231F20', FGCOLOR, '#231F20', NOFOLLOW, DELAY, 500);
            });
        }
    }
}

function windowSize(){
    var width = jQuery(window).width();
    var height = jQuery(window).height();
    return [width,height];
}

function getImgSize(imgSrc){
    var newImg = new Image();
    newImg.src = imgSrc;
    curHeight = newImg.height;
    curWidth = newImg.width;
    return [curWidth,curHeight];
}

function imgDimension(imagesrc){
    var myImage = new Image();
    myImage.onload = function () {
        myImage.width = this.width;
        myImage.height = this.height;
    };
    myImage.src = imagesrc;
    return [myImage.width,myImage.height];
}
function widthResize(){
    if(getCookie('advsearchdisplay_new')=='none'){

        return 120 * 0.99;
    }
    else if(!getCookie('advsearchdisplay_new') && dis_none)
    {

        return 120 * 0.9;
    }
    else if(typeof special_page!=='undefined')
    {
        return 120 * 0.5;
    }
    else{
        if(islogined){
            var perc = 0.998;
        }else{
            var perc = 1.05;
        }
        return 280 * perc;
    }
}

function initMoscCont() {
    if ( jQuery('#main_container_mosaic .mosaic-main-container').length > 0){
        jQuery.when(jQuery('#main_container_mosaic').flexImages({rowHeight: layout_height })).then( function () {
            jQuery('.justified-gallery .mosaic-main-container .imgContMosc').css('outline', '1px solid #e5e5e5');

        })
        jQuery(window).trigger('resize');
    }
}

function initIconPopup() {
    jQuery('.similar-icon')
      .popup({
        inline: true,
        hoverable  : true,
        position   : 'top center',
        setFluidWidth: true,
        delay: {
          show: 100,
          hide: 50
        }
    });

    jQuery('.lb-icon')
      .popup({
        inline: true,
        hoverable  : true,
        position   : 'top center',
        setFluidWidth: true,
        delay: {
          show: 100,
          hide: 50
        }
    });

    jQuery('.imgtype-icon')
      .popup({
        inline: true,
        hoverable  : true,
        position   : 'top center',
        setFluidWidth: true,
        offset: -7,
        delay: {
          show: 100,
          hide: 50
        }
    });
}

function bindHoverThumbDesc() {;
    jQuery(document).on("mouseenter", ".mosaic-main-container", function() {
        if((!inMobile || inMobile == 0) && !isTablet){
            var imgId = jQuery(this).attr('class');
            jQuery(this).find('.imgidContainerNew').show();
            jQuery(this).find('.imgIconsContainer').show();
        }
    });
    jQuery(document).on("mouseleave", ".mosaic-main-container", function() {
        if((!inMobile || inMobile == 0) && !isTablet){
            var imgId = jQuery(this).attr('data-imgid');
            jQuery(this).find('.imgidContainerNew').hide();
            jQuery(this).find('.imgIconsContainer').hide();
        }
    });
}

function unbindHoverThumbDesc() {
     jQuery(document).off("mouseenter mouseleae", ".mosaic-main-container");
}


jQuery( window ).load(function() {
    initIconPopup();
});

jQuery(document).ready(function () {
    initMoscCont();
})

jQuery(document).on('ready', function(e){

        bindHoverThumbDesc();

});