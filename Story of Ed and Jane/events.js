Event = function(id,run_function, run_condition, data) {
	var self = {
		id : id,
		run_condition : run_condition,
		run_function : run_function,
		data : data,
		startEvent : false,
		eventCompleted : false
	}

	self.update = function() {
		if(self.run_condition(self)){
			self.startEvent = true;
			self.run_function(self.data);
			console.log("Event run: ",self.id );
			self.eventCompleted = true;
		}
	}

	Event.list_of_events[self.id] = self;
	return self;
}
Event.list_of_events = {};
Event.create_events = function() {
	
	var hello_world = {
		id : 'hello_world',
		run_function : function(data) {
			if(data.message_list[data.message_number] !== undefined){
				text_box.addToMessageQueue(data.message_list[data.message_number]);
				data.message_number += 1;
				if(data.message_number>data.message_list.length - 1)
					data.message_number = 0;
			}
	
		},
		run_condition : function(self){
			if(keyPressed.o)
				return true;
		},
		data : {
			message : 'the event worked!',
			message_list : ['It worked again', 'I like cheeseburgers' , 'third option' , 'AbrakaLabrador!'],
			message_number : 0
		}
	}
	
	var double_jump = {
		id : 'double_jump',
		run_function : function(data) {
			gravity.baseJumpStrength = gravity.baseJumpStrength * 1.1;
		},
		run_condition : function(self){
			if(keyPressed.z && !self.eventCompleted)
				return true;
		},
		data : {
			
		}
	}
	
	var restart_map = {
		id : 'restart_map',
		run_function : function(data) {
			map.x = map.startingX;
			map.y = map.startingY;
		},
		run_condition : function(self){
			if(keyPressed.x)
				return true;
		},
		data : {
			
		}
	}
	
	var jump_boost_message = {
		id : 'jump_boost_message',
		run_function : function(data) {
			text_box.addToMessageQueue(data.message);
		},
		run_condition : function(self){
			if(player.coordsTopRight[0] == 19 
			&& player.coordsTopRight[1] == 27
			&& self.eventCompleted != true)
				return true;
			else
				return false;
		},
		data : {
			message : "If you press Z, you'll jump higher!"
		}
	}
	
	var double_jump = new Event(double_jump.id, double_jump.run_function, double_jump.run_condition, double_jump.data);	
	var hello_world = new Event(hello_world.id, hello_world.run_function, hello_world.run_condition, hello_world.data);
	var restart_map = new Event(restart_map.id, restart_map.run_function, restart_map.run_condition, restart_map.data);
	var jump_boost_message = new Event(jump_boost_message.id, jump_boost_message.run_function, jump_boost_message.run_condition, jump_boost_message.data);
	console.log('Events created');
}