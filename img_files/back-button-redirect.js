(function(){

    jQuery( window ).on("popstate", function(e) {
        const state = e.originalEvent.state;
        if( state == null  || state == '') {
            if (navigator.userAgent.indexOf("Firefox") == -1){
                window.location.replace('/?r=d');
            }
        }
    });

    const checkIfShouldRun = (prevPage, performanceMode, userAgent) => {
        if(!performanceMode){
            return false;
        }

        let navEntries = performanceMode.getEntriesByType('navigation');

        if(prevPage == ''){
            return false;
        }

        if(prevPage.match(/^https?:\/\/([^\/]+\.)?123rf\.com(\/|$)/i)){
            return false;
        }

        if(navEntries.length > 0 && navEntries[0].type == 'back_forward'){
            return false;
        }

        if (performanceMode.navigation && performanceMode.navigation.type == performanceMode.navigation.TYPE_BACK_FORWARD) {
            return false;
        }
        
        if(userAgent.indexOf("Firefox") == 1){
            return false;
        }

        return true;
    }

    jQuery( document ).ready(function() {
        const prevPage = document.referrer;

        const shouldRun = checkIfShouldRun(prevPage, window.performance, navigator.userAgent);

        if(shouldRun){
            history.pushState({ url: "/" }, window.location.href, window.location.href);
        }
    });

})()