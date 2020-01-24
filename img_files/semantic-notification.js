(function($){
    window.SemanticNotify = $(window.jQuery);
})(function($){

    Notifier = new Object();
    Container = new Object();

    var sanitize = function (str) {
        var lt = /</g;
        var gt = />/g;
  
        str = str.toString().replace(lt, "&lt;").replace(gt, "&gt;");

        return str;
    };

    var escape = function (str) {
        str = str.replace(/\[url=([^\s\]]+)\s*\](.*(?=\[\/url\]))\[\/url\]/g, '<a href=$1>$2</a>');  //[url=] -> <a href=></a>
        return str;
    }

    var gen_id = function(type) {
        rand_id = 'semantic_notify_'+type+'_'+(Math.ceil(Math.random() * 100000));
        return rand_id;
    };

    var Message = function(id, template, options){
        this.id = id;
        this.template = template;
        this.options = $.extend({}, Message.defaults, options);

        var $Item = this;
        if(!Container[this.options.position]) {
            Container[this.options.position] = $('<div class="ui notification pos-'+this.options.position+'"></div>').appendTo('body').on("click", ".notification-wrapper i.close", function(){
                $Item.id=jQuery(this).closest('.notification-wrapper').attr('id');
                $Item.close();
            });
        }
    }

    Message.defaults = {
        timeout: 3000,
        position: 'center',
        stack: true
    };

    Message.prototype.display = function(){
        var $Item = this;
        var starting_time = new Date();
        var remaining_time = $Item.options.timeout;

        if ( this.options.stack == false ){
            $(Container[this.options.position]).find('.notification-wrapper').remove();
        }

        $($Item.template).prependTo(Container[this.options.position]);
        $("#"+$Item.id).fadeIn();

        $Item.timer = setTimeout(function(){
            $Item.close();
        }, remaining_time);

        $("#"+$Item.id).on("mouseenter", function(){
            clearTimeout($Item.timer);
            remaining_time -= new Date() - starting_time;

            // console.log("Remain time on pause "+remaining_time);
        });
        $("#"+$Item.id).on("mouseleave", function(){
            starting_time = new Date();
            clearTimeout($Item.timer);
            $Item.timer = setTimeout( function(){
                $Item.close();
            }, remaining_time);

            // console.log("Remain time on resume "+remaining_time);
        });

        return this;
    };

    Message.prototype.close = function(){

        var $Item = this;
        $("#"+$Item.id).fadeOut();
        setTimeout(function(){
            $("#"+$Item.id).remove();
        }, 500);
    };

    notify_success = function(message, options){
        var id = gen_id("success");

        var success_template =
        '<div class="notification-wrapper" id="'+id+'">'+
            '<table>'+
                '<tr>'+
                    '<td class="notification-icon success">'+
                        '<img src="/assets/images/icon-success.png" width="24">'+
                    '</td>'+
                    '<td>'+
                        '<div class="notification-message">'+
                        escape(sanitize(message)) +
                        '</div>'+
                    '</td>'+
                    '<td class="notification-close">'+
                        '<i class="link icon close"></i>'+
                    '</td>'+
                '</tr>'+
            '</table>'+
        '</div>';

        return (new Message(id, success_template, options)).display();
    }

    notify_reminder = function(message, options){
        var id = gen_id("reminder");
        var reminder_template =
        '<div class="notification-wrapper" id="'+id+'">'+
            '<table>'+
                '<tr>'+
                    '<td class="notification-icon reminder">'+
                        '<img src="/assets/images/icon-reminder.png" width="24">'+
                    '</td>'+
                    '<td>'+
                        '<div class="notification-message">'+
                        escape(sanitize(message))+
                        '</div>'+
                    '</td>'+
                    '<td class="notification-close">'+
                        '<i class="link icon close"></i>'+
                    '</td>'+
                '</tr>'+
            '</table>'+
        '</div>';

        return (new Message(id, reminder_template, options)).display();
    }

    notify_error = function(message, options){
        var id = gen_id("error");
        var error_template =
        '<div class="notification-wrapper" id="'+id+'">'+
            '<table>'+
                '<tr>'+
                    '<td class="notification-icon error">'+
                        '<img src="/assets/images/icon-error.png" width="24">'+
                    '</td>'+
                    '<td>'+
                        '<div class="notification-message">'+
                        escape(sanitize(message)) +
                        '</div>'+
                    '</td>'+
                    '<td class="notification-close">'+
                        '<i class="link icon close"></i>'+
                    '</td>'+
                '</tr>'+
            '</table>'+
        '</div>';

        return (new Message(id, error_template, options)).display();
    }

    Notifier.notify_success = notify_success;
    Notifier.notify_reminder = notify_reminder;
    Notifier.notify_error = notify_error;
    return Notifier;
});

if(window.location.hash) {
    var gethash =  window.location.hash;
    // console.log(gethash);
    if (gethash.indexOf("notify_success=") !== -1 || gethash.indexOf("notify_reminder=") !== -1 || gethash.indexOf("notify_error=") !== -1){

        if (gethash.indexOf("notify_success=") !== -1){
            var show_msg = decodeURI(gethash.split('notify_success=')[1]);
            SemanticNotify.notify_success(show_msg);
        } else if (gethash.indexOf("notify_reminder=") !== -1) {
            var show_msg = decodeURI(gethash.split('notify_reminder=')[1]);
            SemanticNotify.notify_reminder(show_msg);
        } else if (gethash.indexOf("notify_error=") !== -1) {
            var show_msg = decodeURI(gethash.split('notify_error=')[1]);
            SemanticNotify.notify_error(show_msg);
        }
        document.location.hash="";

    }
}

