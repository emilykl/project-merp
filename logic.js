/**********************************
 * click_and_drag_module implements the click and drag functionality
 * for food items.
 **********************************/
var click_and_drag_module = (function() {
    
    var class_selected = "item_selected";
    var update_event = "click_and_drag_update";
    var update_event_context = {
        trash_can_item: null,
        dinner_plate_item: null,
        dessert_plate_item: null,
    };
    var offsetX = 0;
    var offsetY = 0;
    
    var get_element_containing_coords = function(x, y) {
        var trashcan_offset = $("#trash_can").offset();
        var dinnerplate_offset = $("#dinner_plate").offset();
        var dessertplate_offset = $("#dessert_plate").offset();
        if (x >= trashcan_offset.left 
            && x <= trashcan_offset.left + $("#trash_can").width()
            && y >= trashcan_offset.top 
            && y <= trashcan_offset.top + $("#trash_can").height()) {
            return "trash";
        } else if (x >= dinnerplate_offset.left 
                   && x <= dinnerplate_offset.left + $("#dinner_plate").width()
                   && y >= dinnerplate_offset.top 
                   && y <= dinnerplate_offset.top + $("#dinner_plate").height()) {
            return "dinner";
        } else if (x >= dessertplate_offset.left 
                   && x <= dessertplate_offset.left + $("#dessert_plate").width()
                   && y >= dessertplate_offset.top 
                   && y <= dessertplate_offset.top + $("#dessert_plate").height()) {
            return "dessert";
        }
        return "";
    };
    
    var mouse_down_function = function(event) {
        event.preventDefault();
        
        update_event_context.trash_can_item = null;
        update_event_context.dinner_plate_item = null;
        update_event_context.dessert_plate_item = null;
        
        var selected = $(this);
        selected.addClass(class_selected);
        offsetX = selected.offset().left - event.pageX;
        offsetY = selected.offset().top - event.pageY;
        $("body").append(selected);
        selected.css("position", "absolute");
        selected.css("left", event.pageX + offsetX);
        selected.css("top", event.pageY + offsetY);
    };
    
    var mouse_move_function = function() {
        var selected = $("." + class_selected);
        selected.css("left", event.pageX + offsetX);
        selected.css("top", event.pageY + offsetY);
    };
    
    var mouse_up_function = function(event) {
        var selected = $("." + class_selected);
        if (selected.length == 0) { //if no element is selected
            return;
        }
        
        var element = get_element_containing_coords(event.pageX, event.pageY);
        switch(element) {
            case "trash": update_event_context.trash_can_item = selected.data("item"); break;
            case "dinner": update_event_context.dinner_plate_item = selected.data("item"); break;
            case "dessert": update_event_context.dessert_plate_item = selected.data("item"); break;
            default: break;
        }
        selected.remove();
        
        $("body").trigger(update_event, update_event_context);
    };
    
    var apply = function() {
        $(".food_item").mousedown(mouse_down_function);
    };

    var initialize = function() {
        $(window).mousemove(mouse_move_function);
        $(window).mouseup(mouse_up_function);
    };
    
    return {
        initialize: initialize,
        apply: apply,
        update_event: update_event,
    };

}());


/**********************************
 * tabs_module implements tab functionality and food table population.
 **********************************/
var tabs_module = (function(food_items) {
    
    var update_event = "tabs_update";
    
    var desserts_unlocked = false;
    
    var populate_food_bank = function(food_class) {
        var current_food_items = [];
    	for (var i = 0; i < food_items.length; i++) {
    	    var food_item = food_items[i];
    	    if ( (food_class == "A" && desserts_unlocked && food_item.food_class == "D")
    	         || (food_class == "A" && food_item.food_class != "D")
    	         || (food_item.food_class == food_class)
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
    	    food_item_div.css("background-image", "url(" + food_item.icon_url + ")");
    	    food_item_div.css("background-size", "100%");
            food_item_div.css("background-repeat", "no-repeat");
    	    food_item_div.data("item", food_item);
    	    
    	    food_item_wrapper.append(food_item_div);
    	    food_table.append(food_item_wrapper);
    	}
    	
    	$("body").trigger(update_event);
    };
    
    var refresh_food_bank = function() {
        populate_food_bank($(".tab_selected").attr("id").slice(-1));
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
        
        populate_food_bank("A");
    };
    
    return {
        initialize: initialize,
        refresh_food_bank: refresh_food_bank,
        activate_desserts: activate_desserts,
        deactivate_desserts: deactivate_desserts,
        update_event: update_event,
    };
    
}(food_items));



/**********************************
 * state_module implements the functionality to record and
 * update the state of the plates.
 **********************************/
var state_module = (function(dinner_menu, dessert_menu) {
    
    var update_event = "state_update";
    var current_day = null; 
    var dinner_plate_items = [];
    var dessert_plate_item = null;
    var desserts_activated = false;
    
    var populate_plates = function() {
        $("#dinner_plate_P .food_item").remove();
        $("#dinner_plate_C .food_item").remove();
        $("#dinner_plate_V .food_item").remove();
        $("#dessert_plate .food_item").remove();

        $("#icon_p").empty();
        $("#icon_c").empty();
        $("#icon_v").empty();

        $("#icon_p").append('<img class="med_icon" src="img/icon_p0.png"></img>');
        $("#icon_c").append('<img class="med_icon" src="img/icon_c0.png"></img>');
        $("#icon_v").append('<img class="med_icon" src="img/icon_v0.png"></img>');

        for (var i = 0; i < dinner_plate_items.length; i++) {
            var food_item = dinner_plate_items[i];
            var food_item_div = $("<div/>");
    	    food_item_div.addClass("food_item");
    	    food_item_div.css("background-image", "url(" + food_item.icon_url + ")");
    	    food_item_div.css("background-repeat", "no-repeat");
    	    food_item_div.css("background-size", "contain");
            food_item_div.css("background-color", "transparent");
    	    food_item_div.data("item", food_item);
            $("#dinner_plate_" + food_item.food_class).append(food_item_div);

            if (food_item.food_class == "P") {
                $("#icon_p").empty();
                $("#icon_p").append('<img class="med_icon" src="img/icon_p1.png"></img>');
            } else if (food_item.food_class == "C") {
                $("#icon_c").empty();
                $("#icon_c").append('<img class="med_icon" src="img/icon_c1.png"></img>');
            } else if (food_item.food_class == "V") {
                $("#icon_v").empty();
                $("#icon_v").append('<img class="med_icon" src="img/icon_v1.png"></img>');
            }
        }
        
        if (dessert_plate_item != null) {
            var food_item_div = $("<div/>");
    	    food_item_div.addClass("food_item");
    	    food_item_div.css("background-image", "url(" + dessert_plate_item.icon_url + ")");
    	    food_item_div.css("background-size", "contain");
            food_item_div.css("background-repeat", "no-repeat");
    	    food_item_div.data("item", dessert_plate_item);
            $("#dessert_plate").append(food_item_div);
        }
        $("body").trigger(update_event, desserts_activated);
    };
    
    var activate_desserts = function() {
        desserts_activated = true;
        $('#dessert_plate').css({
        	'visibility': 'visible'
        });
    };

    var deactivate_desserts = function() {
    	desserts_activated = false;
    	$('#dessert_plate').css({
    		'visibility': 'hidden'
    	});
    };
    
    var add_dinner_item = function(item) {
        if (item.food_class == "D") {
            populate_plates(current_day);
            return;
        }
        
        var replaced = false;
        for (var i = 0; i < dinner_plate_items.length; i++) {
            var food_item = dinner_plate_items[i];
            if (item.food_class == food_item.food_class) {
                dinner_plate_items[i] = item;
                replaced = true;
            }
        }
        if (!replaced) {
            dinner_plate_items.push(item);
        }
        if (dinner_plate_items.length == 3) {
        	$('#' + current_day + ' img').attr('src', 'img/smiley_full.png');
            activate_desserts();
        }
        dinner_menu[current_day] = dinner_plate_items;
        populate_plates(current_day);
    };
    
    var add_dessert_item = function(item) {
        if (item.food_class != "D") {
            populate_plates(current_day);
            return;
        }
        dessert_plate_item = item;
        dessert_menu[current_day] = dessert_plate_item;
        populate_plates(current_day);
    };
    
    var delete_item = function(item) {
        if (item == dessert_plate_item) {
            dessert_plate_item = null;
        	dessert_menu[current_day] = dessert_plate_item;
        } else if (dinner_plate_items.indexOf(item) != -1) {
            var dinner_index = dinner_plate_items.indexOf(item);
            dinner_plate_items.splice(dinner_index, 1);
            deactivate_desserts();
        }
        populate_plates(current_day);
    };
    
    var initialize = function(which_day) {
        current_day = which_day;
        $(".day").css({
    		"border": "0px solid #999"
    	});
    	$("#" + which_day).css({
    		"border": "3px solid #666Fd2"
    	});
        dinner_plate_items = dinner_menu[which_day];
        dessert_plate_item = dessert_menu[which_day];
        if (dinner_plate_items.length == 3) activate_desserts();
        else deactivate_desserts();
        populate_plates(which_day);
    };
    
    return {
        initialize: initialize,
        add_dinner_item: add_dinner_item,
        add_dessert_item: add_dessert_item,
        delete_item: delete_item,
        refresh: populate_plates,
        update_event: update_event,
    };
    
}(dinner_menu, dessert_menu));



/**********************************
 * run on load.
 **********************************/ 
$(document).ready(function() {     
    $("body").on(click_and_drag_module.update_event, function(event, context) {
        tabs_module.refresh_food_bank();
        if (context.trash_can_item != null) {
            state_module.delete_item(context.trash_can_item);
        } else if (context.dinner_plate_item != null) {
            state_module.add_dinner_item(context.dinner_plate_item);
        } else if (context.dessert_plate_item != null) {
            state_module.add_dessert_item(context.dessert_plate_item);
        } else {
            state_module.refresh();
        }
    });
    
    $("body").on(tabs_module.update_event, function() {
        click_and_drag_module.apply();
    });
    
    $("body").on(state_module.update_event, function(event, desserts_activated) {
        if (desserts_activated) {
            tabs_module.activate_desserts();
        } else {
            tabs_module.deactivate_desserts();
        }
        click_and_drag_module.apply();
    });

    $(".day").click(function(e){
    	state_module.initialize(e.currentTarget.id);
    });
    
    
    click_and_drag_module.initialize();
    tabs_module.initialize();
    state_module.initialize("sun");
    
});

