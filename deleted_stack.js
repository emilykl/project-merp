var undo_active = false;
var redo_active = false;
var undo_stack = [];
var current_state_ptr = -1;

var setup_undo_redo = function(){
	$("#undo_button").click(function(){
	    if (undo_active){
	    	var last_event = undo_stack[current_state_ptr--];
	    	if (last_event.event_type == 'add'){
	    		state_module.delete_item(last_event.item, true);
	    	} else if (last_event.event_type == 'delete' && last_event.item.food_class=="D"){
	    		state_module.add_dessert_item(last_event.item, true);
	    	} else if (last_event.event_type == 'delete'){
	    		state_module.add_dinner_item(last_event.item, true);
	    	} 
	    	if (current_state_ptr == -1){
	    		deactivate_undo_button();
	    	} else if (current_state_ptr < undo_stack.length-1){
	    		activate_redo_button();
	    	}
	    }
	});
	$("#redo_button").click(function(){
	    if (redo_active){
	    	var last_event = undo_stack[++current_state_ptr];
	    	if (last_event.event_type == 'delete'){
	    		state_module.delete_item(last_event.item, true);
	    	} else if (last_event.event_type == 'add' && last_event.item.food_class=="D"){
	    		state_module.add_dessert_item(last_event.item, true);
	    	} else if (last_event.event_type == 'add'){
	    		state_module.add_dinner_item(last_event.item, true);
	    	} 
	    	if (current_state_ptr == undo_stack.length-1){
	    		deactivate_redo_button();
	    	} else if (current_state_ptr > -1){
	    		activate_undo_button();
	    	}
	    }
	})
};

var activate_undo_button = function(){
	undo_active = true;
	$('#undo_button').css({
		'background-image': 'url("img/undo arrow.png")'
	});
}

var deactivate_undo_button = function(){
	undo_active = false;
	$('#undo_button').css({
		'background-image': 'url("img/undo arrow inactive.png")'
	});
}

var activate_redo_button = function(){
	redo_active = true;
	$('#redo_button').css({
		'background-image': 'url("img/redo arrow.png")'
	});
}

var deactivate_redo_button = function(){
	redo_active = false;
	$('#redo_button').css({
		'background-image': 'url("img/redo arrow inactive.png")'
	});
}


var add_to_undo_stack = function(event){
	if (current_state_ptr == undo_stack.length-1){
		undo_stack.push(event);
		current_state_ptr++;
		if (current_state_ptr == 0) activate_undo_button();
	}else if(current_state_ptr < undo_stack.length-1){
		undo_stack[++current_state_ptr] = event;
		undo_stack = undo_stack.slice(0, current_state_ptr+1);
		if (current_state_ptr == undo_stack.length-1) deactivate_redo_button();
	}
}

var Event = function(event_type, item){
	// --------------------------------------------------------------------------------------
	// Event class for putting into undo_stack
	// event_type: can take 'add,' 'delete' values. 'replace' consists of two events. 
	// items: an array fo items. length 1 for event_types 'add' and 'delete.' 2 for 'replace'
	// --------------------------------------------------------------------------------------
	this.event_type = event_type;
	this.item = item;
}