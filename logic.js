
/**********************************
 * food_table_module implements tab functionality, food table population,
 * and click and drag functionality.
 **********************************/
var food_table_module = (function(food_items) {
    
    var desserts_unlocked = false;
    
    var populate_food_bank = function(food_class) {
        var current_food_items = [];
    	for (var i = 0; i < food_items.length; i++) {
    	    var food_item = food_items[i];
    	    if ( (food_class == "A" && desserts_unlocked && food_item.food_classes.indexOf("D") != -1)
    	         || (food_class == "A" && food_item.food_classes.indexOf("D") == -1)
    	         || (food_item.food_classes.indexOf(food_class) != -1)
    	        ) {
    	        current_food_items.push(food_item);
    	    }
    	}
    	
    	var food_table = $("#food_table");
    	food_table.empty();
    	for (var i = 0; i < current_food_items.length; i++) {
    	    var food_item = current_food_items[i];
    	    var food_item_wrapper = $("<div/>");
    	    food_item_wrapper.addClass("food_item_wrapper");
    	    
    	    var food_item_div = $("<div/>");
    	    food_item_div.addClass("food_item");
    	    //food_item_div.css("background-image", "url(" + food_item.icon_url + ")");
    	    //food_item_div.css("background-size", "cover");
    	    
    	    food_item_wrapper.append(food_item_div);
    	    food_table.append(food_item_wrapper);
    	}
    	
    	$(".food_item").mousedown(function(event) {
            event.preventDefault();
            var selected = $(this);
            selected.addClass("food_selected");
            $("body").append(selected);
            selected.css("left", event.pageX);
            selected.css("top", event.pageY);
        });
    };
    
    var activate_desserts = function() {
        desserts_unlocked = true;
        $("#tab_D").removeClass("tab_deactivated");
        var current_tab = $(".tab_selected");
        current_tab.click();
    };
    
    var deactivate_desserts = function() {
        desserts_unlocked = false;
        $("#tab_D").addClass("tab_deactivated");
        var current_tab = $(".tab_selected");
        if (current_tab.attr("id") == "tab_D") {
            current_tab = $("#tab_A");
        }
        current_tab.click();
    };
    
    var initialize = function() {
        $(".food_table_tab").click(function() {
            var food_class = $(this).attr("id").slice(-1);
            if (food_class != "D" || desserts_unlocked) {
                $(".food_table_tab").removeClass("tab_selected");
                $(this).addClass("tab_selected");
                populate_food_bank(food_class);
            }
        });
        
        $(window).mousemove(function(event, ui) {
            var selected = $(".food_selected");
            selected.css("left", event.pageX);
            selected.css("top", event.pageY);
        });
        
        $(window).mouseup(function(event) {
            var selected = $(".food_selected");
            selected.remove();
            populate_food_bank($(".tab_selected").attr("id").slice(-1));
        });
        
        populate_food_bank("A");
    };
    
    return {
        activate_desserts: activate_desserts,
        deactivate_desserts: deactivate_desserts,
        initialize: initialize,
    };
    
}(food_items));



/**********************************
 * run on load.
 **********************************/ 
$(document).ready(function() {     
    
    food_table_module.initialize();
    
});

