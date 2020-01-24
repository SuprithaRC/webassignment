
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();

jQuery( document ).ready(function() {
		var Tawk_active = 0;
		var head = document.getElementsByTagName("head")[0];
		jQuery(".tawkchat").click(function(){
			if(Tawk_active ==0)
			{
				var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
				s1.async=false;
				s1.src='https://embed.tawk.to/570dba7db38fbac02fd60803/default';
				s1.charset='UTF-8';
				s1.setAttribute('crossorigin','*');
				s0.parentNode.insertBefore(s1,s0);
			}

			head.addEventListener("load", function(event) {
			        if (event.target.nodeName === "SCRIPT")
			        {
			        	if(Tawk_active==0)
			        	{
			        		attemptTrigger();
							Tawk_active = 1;
			        	}
			        }
			    }, true);
			if(Tawk_active==1)
			{
				attemptTrigger();
			}

			function attemptTrigger() {
			 if (Tawk_API.isChatMaximized()){

			 }else{
			 	Tawk_API.toggle();
			   setTimeout(function(){ attemptTrigger() },250);
			 }
			}
		});
	});