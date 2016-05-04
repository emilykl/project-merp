var undo_active = false;
var redo_active = false;
var undo_stacks = {
	"sun-1": [],
	"mon-1": [],
	"tue-1": [],
	"wed-1": [],
	"thu-1": [],
	"fri-1": [],
	"sat-1": [],

	"sun-2": [],
	"mon-2": [],
	"tue-2": [],
	"wed-2": [],
	"thu-2": [],
	"fri-2": [],
	"sat-2": [],

	"sun-3": [],
	"mon-3": [],
	"tue-3": [],
	"wed-3": [],
	"thu-3": [],
	"fri-3": [],
	"sat-3": [],
};
var undo_stack = null;
var current_state_ptrs = {
	"sun-1": -1,
	"mon-1": -1,
	"tue-1": -1,
	"wed-1": -1,
	"thu-1": -1,
	"fri-1": -1,
	"sat-1": -1,

	"sun-2": -1,
	"mon-2": -1,
	"tue-2": -1,
	"wed-2": -1,
	"thu-2": -1,
	"fri-2": -1,
	"sat-2": -1,

	"sun-3": -1,
	"mon-3": -1,
	"tue-3": -1,
	"wed-3": -1,
	"thu-3": -1,
	"fri-3": -1,
	"sat-3": -1,
};
var current_state_ptr = null;
var selected_day = null;

var initialize_undo_stack = function(current_day){
	selected_day = current_day;
	undo_stack = undo_stacks[current_day];
	current_state_ptr = current_state_ptrs[current_day];
	if (current_state_ptr == -1){
		deactivate_undo_button();
	} else if (current_state_ptr > -1){
		activate_undo_button();
	}
	if (current_state_ptr == undo_stack.length-1){
		deactivate_redo_button();
	} else if (current_state_ptr < undo_stack.length-1){
		activate_redo_button();
	}
}

var add_undo_redo_listener = function(){
	$("#undo_button").click(function(){
	    if (undo_active){
	    	var last_event = undo_stack[current_state_ptr--];
	    	if (last_event.event_type == 'add'){
	    		state_module.delete_item(last_event.item, true);
	    	} else if (last_event.event_type == 'delete' && last_event.item.food_class=="D"){
	    		state_module.add_dessert_item(last_event.item, true);
	    	} else if (last_event.event_type == 'delete'){
	    		state_module.add_dinner_item(last_event.item, true);
	    	} else if (last_event.event_type == 'replace') {
	    		state_module.add_dinner_item(last_event.item['from'], true);
	    	}
	    	if (current_state_ptr == -1){
	    		deactivate_undo_button();
	    	}
	    	if (current_state_ptr < undo_stack.length-1){
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
	    	} else if (last_event.event_type == 'replace') {
	    		state_module.add_dinner_item(last_event.item['to'], true);
	    	}
	    	if (current_state_ptr == undo_stack.length-1){
	    		deactivate_redo_button();
	    	}
	    	if (current_state_ptr > -1){
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
		if (current_state_ptr == 0) activate_undo_button();
	}
	current_state_ptrs[selected_day] = current_state_ptr;
}

var Event = function(event_type, item){
	// --------------------------------------------------------------------------------------
	// Event class for putting into undo_stack
	// event_type: can take 'add,' 'delete' values. 'replace' has two corresponding items. 
	// items: an array fo items. length 1 for event_types 'add' and 'delete.' 2 for 'replace'
	// --------------------------------------------------------------------------------------
	this.event_type = event_type;
	this.item = item;
}