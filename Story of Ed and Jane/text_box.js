TextBox = function(img,x,y,width,height){
	var self = {
		id : 'text_box',
		x : x,
		y : y,
		width : width,
		height : height,
		img : img,
		display_margin_x : 50,
		display_margin_y : 50,
		display_line_gap : 25,
		characters_per_line : 60,
		single_message_length : 120,
		frames_since_last_change : 0,
		write_speed : 3, //Lower is faster.  # of frames till next message
		flip : true
	}
	var message_queue = ["Here is the first text message in the message queue.  I hope it works.",  "Behold.  THe second message in the message queue!"];
	var get_next_message_in_queue = true;
	var display_message_split = false;
	var next_message = "";
	var display_line_1 = "";
	var display_line_2 = "";

	self.addToMessageQueue = function(new_message) {
		if(new_message.length < self.characters_per_line * 2){
			message_queue.push(new_message);
		}
		else {
			var splitIndex = new_message.substring(0,self.characters_per_line * 2).lastIndexOf(" ")
			if(splitIndex != -1){
				message_queue.push(new_message.substring(0,splitIndex));
				self.addToMessageQueue(new_message.substring(splitIndex+ 1));
			}
		}
	}
	self.getNextMessage = function() {
		if(get_next_message_in_queue && message_queue[0] !== undefined){
			display_message_split = false;
			next_message = message_queue.splice(0,1);    // Splice returns an array.
			self.splitMessageIntoLines(next_message[0]); //So I have to convert it to a string
		}
		get_next_message_in_queue = false;	
	}
	
	self.splitMessageIntoLines = function(message){
		if(!display_message_split){
			display_line_1 = "";
			display_line_2 = "";
			display_line_1_array = [];
			display_line_2_array = [];
			if(message.length < self.characters_per_line){
				display_line_1_array = message.split(" ");
			}
			else {
				//split index is the last space before i reach my character line limit
				var splitIndex = message.substring(0,self.characters_per_line).lastIndexOf(" ")
				display_line_1_array = message.substring(0,splitIndex).split(" ");
				display_line_2_array = message.substring(splitIndex + 1).split(" "); //+ 1 because i don't want the space
			}
			display_message_split = true;
		}
	}
	self.addNextWord = function(){
		if(self.frames_since_last_change > self.write_speed){
			if(display_line_1_array[0] !== undefined){
				display_line_1 += " " + display_line_1_array.splice(0,1);
				self.frames_since_last_change = 0;
			}
			else if(display_line_1_array[0] === undefined && display_line_2_array[0] !== undefined){
				display_line_2 +=" " + display_line_2_array.splice(0,1);
				self.frames_since_last_change = 0;
			}				
			else if (display_line_2_array[0] === undefined && self.frames_since_last_change > 20){
				get_next_message_in_queue = true;
			}
			
				
		}
	}
	self.update = function(){
		self.frames_since_last_change += 1
		self.getNextMessage();
		self.addNextWord();
		self.draw();
	}
	
	self.draw = function(){
		ctx.save();
		ctx.font = '15px Arial';
		ctx.drawImage(self.img,self.x,self.y,width,height);
		ctx.fillText(display_line_1, self.x +self.display_margin_x, self.y + self.display_margin_y);
		ctx.fillText(display_line_2, self.x +self.display_margin_x, self.y + self.display_margin_y + self.display_line_gap);
		ctx.restore();
	}
	
	return self;
}
console.log("text box loaded");


/*
HOW THE TEXT BOX SHOULD WORK
1.  Get entire message
2.  Split message into 2 lines
	a.  Criteria is to find last space before threshold (around 60 chars)
3.  For each line, split into array for each word
4.  Display
	a.  Start with line 1 word 1.  
	b.  After 3 frames, add the next word.  Repeat until line 1 is done
	c.  Start line 2
5.  After message has been displayed, get next message

*/




/*
SOURCE CODE FOR WRITER!

package data;

import java.awt.Font;
import java.util.LinkedList;
import java.util.List;
import java.io.InputStream;
import java.util.ArrayList;
 
import org.lwjgl.LWJGLException;
import org.lwjgl.opengl.Display;
import org.lwjgl.opengl.DisplayMode;
import org.lwjgl.opengl.GL11;
 
import org.newdawn.slick.Color;
import org.newdawn.slick.TrueTypeFont;
import org.newdawn.slick.util.ResourceLoader;




public class Writer {
	private static TrueTypeFont font2;
	public static String message, line1 ="",line2="", moreStory;
	public static String[] test, test2;
	public static List<String> story = new ArrayList<String>(); List<String> arrayLine1 = new ArrayList<String>(); List<String> arrayLine2 = new ArrayList<String>();
	//private static ArrayList<String> story = new ArrayList<String>();ArrayList<String> arrayLine1 = new ArrayList<String>() ; ArrayList<String> arrayLine2 = new ArrayList<String>() ;
	public int messageLen;
	private static int lastSpacePosition;
	private static long time=helpers.Clock.getTime(),time2;
	public Writer() {
		init();
	}
		
	public void init() {
		moreStory = "I am currently reading a book called 'The Life of Pi'.  It is a very interesting novel about religion, self, and spending a lot of time in a boat with a tiger called Richard parker."; 
		assignMessageQueue(moreStory);
		message = story.get(0);
		story.remove(0);
		//time = helpers.Clock.getTime();
		getMessageLines();
 
		// load font from file
		try {
			InputStream inputStream	= ResourceLoader.getResourceAsStream("pictures/jane_font.ttf");
 
			Font awtFont2 = Font.createFont(Font.TRUETYPE_FONT, inputStream);
			awtFont2 = awtFont2.deriveFont(Font.BOLD,36f);
			font2 = new TrueTypeFont(awtFont2, true);

 
		} catch (Exception e) {
			e.printStackTrace();
		}
		//Font awtFont = new Font("Times New Roman", Font.BOLD, 24); //name, style (PLAIN, BOLD, or ITALIC), size
	}

	public static void assignMessageQueue(String message) {
		if(message.length()>60) {
			lastSpacePosition = 60;
			lastSpacePosition = getLastSpace(message.substring(0, 60));
			story.add(message.substring(0,lastSpacePosition-1));	
			assignMessageQueue(message.substring(lastSpacePosition, message.length()));	
			
		} else {
			
			story.add(message);
		}
	}
	
	private void getMessageLines() {
		arrayLine1.clear();
		arrayLine2.clear();
		if(message.length() < 30) {
			test = message.substring(0, message.length()).split(" ");
			for(int i=0; i<test.length;i++) {
				arrayLine1.add(test[i]);
			}
			 line2 = "";
		} else if(message.length() < 60) {
			lastSpacePosition = 30;
			lastSpacePosition = getLastSpace(message.substring(0, 30));
			test = message.substring(0, message.length()).split(" ");
			for(int i=0; i<test.length;i++) {
				arrayLine1.add(test[i]);
			}
			test2 = message.substring(lastSpacePosition, message.length()).split(" ");
			for(int i=0; i<test2.length;i++) {
				arrayLine2.add(test2[i]);
			}
		}
		//List<String> list = new LinkedList (Arrays.asList(split));
		
	}
	private static int getLastSpace(String message) {
		if(lastSpacePosition == 1) {
			return 31;
		}
		if(message.substring(message.length()-1,message.length()).matches(" ") == true) {
			return lastSpacePosition;
		} 
		lastSpacePosition -= 1;
		return getLastSpace(message.substring(0, message.length() -1));
	}
	
	private void getNextMessage() {
		if(helpers.Clock.currentTime-time > 3000) {
			if(story.isEmpty() == false) {
				line1 = "";
				line2 = "";
				message = story.get(0);
				story.remove(0);
				getMessageLines();
				time = helpers.Clock.getTime();
			}
		}
		if(helpers.Clock.currentTime-time2 > 250) {
			if(arrayLine1.isEmpty()==false) {
				line1 = line1 + " " + arrayLine1.get(0);
				arrayLine1.remove(0);
			}
			else if(arrayLine1.isEmpty() && arrayLine2.isEmpty()==false) {
				line2 = line2 + " " + arrayLine2.get(0);
				arrayLine2.remove(0);
			}
			//if(arrayLine1.isEmpty() && arrayLine2.isEmpty()) {	
			//}
			time2 = helpers.Clock.getTime();
		}
		
	}
	public void updateWriting() {
		getNextMessage();
		Color.white.bind();
		//font.drawString(100, 50, "THE LIGHTWEIGHT JAVA GAMES LIBRARY", org.newdawn.slick.Color.yellow);
		font2.drawString(Boot.WIDTH/2 -350, 560, line1, Color.black);
		font2.drawString(Boot.WIDTH/2- 350, 590, line2, Color.black);
		font2.drawString(100, 100, "", Color.white);
	}
	
}


*/