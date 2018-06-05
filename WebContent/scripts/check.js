
function chatApp() {
	this.initFirebase();
}

// saving all variable needed and used them throughout
chatApp.prototype.initFirebase = function() {
		this.auth = firebase.auth();
		this.database = firebase.database();
		this.storage = firebase.storage();
		this.setUsingGoogle = false;
		this.spanId =  document.getElementById("pop_help");
		this.usermsg = document.getElementById('usermsg');
		this.signin = document.getElementById("sign-in");
		this.signup = document.getElementById('sign-up');
		this.submit = document.getElementById("submit");
		this.pop = document.getElementById('pop');
		this.email = document.getElementById("email");
		this.password = document.getElementById("password");
		this.name = document.getElementById("name");

		// adding event authstatechanged
		this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}

//function called automatically if there is any change in the auth
chatApp.prototype.onAuthStateChanged = function(user) {
	this.userName =  document.getElementById('user-name');
	// check for the user if it already present
	if(user) {

		if(!this.setUsingGoogle) {
			if(this.name.value == undefined)
				this.name.value = "";
		}

		// Display User name who signed in the application
		if(this.auth.currentUser.displayName)
			this.userName.innerText = "Welcome "+ this.auth.currentUser.displayName.toUpperCase();
		else 
			this.userName.innerText = "Welcome ";

		this.retrieveMessages();
		this.signin.innerHTML = "Sign-Out";
		this.signup.style.visibility = "hidden";

		// Hide sign-in button.
		this.signin.style.visibility = "visible";

	}
	else {
		this.userName.innerText = "Welcome";
		this.signin.innerHTML = "Sign-In";

		// Show sign-in button.
		this.signin.style.visibility = "visible";

	}
	this.sendButtonProperty(this.usermsg);
	this.userName.style.fontWeight = 'bold';
	
}

//function to signin after validation of email and passowrd
chatApp.prototype.submitSignin = function() {
	if(chatApp.popHelpValidation()) {
		var provider = firebase.auth().signInWithEmailAndPassword(chatApp.email.value,chatApp.password.value).catch(function(error) {
			  var errorMessage = error.message;
			  // Show invalid username,password message on span tag
			  chatApp.spanId.appendChild(document.createTextNode("Invalid Username or password"));
			  this.pop.style.display='block';
			  return false;
			});
		this.pop.style.display='none';
	}

}.bind(this);

//function for validation of all 3 fields in pop form
chatApp.prototype.popHelpValidation = function() {
	var emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
	var nameRegex = /^[A-Za-z\.\' \-]{1,15}\s?[A-Za-z\.\' \-]{1,15}\s?[A-Za-z\.\' \-]{1,15}/;
	
	if(!this.check(emailRegex,this.email.value, this.spanId, "Please enter a valid email.")) {
		return false;
	}
	else if(!(this.password.value.trim().length>5)) {
		this.spanId.appendChild(document.createTextNode("Password should have minimum 6 characters"));
		return false;
	}
	else if(this.submit.innerHTML == "Signup" && !this.check(nameRegex,this.name.value, this.spanId, "Please enter a valid name.")){
		return false;
	}
	else {
		while (this.spanId.childNodes[0]){
	         this.spanId.removeChild(this.spanId.childNodes[0]);
	        }
		return true;
	}
	
}

//function to check regex with the input provided
// And append the appropiate error message into the span hidden tag
chatApp.prototype.check =  function(regex,input,spanId, helpMessage)
{
	// Test according to appropiate regex
	// And add help message into spanId
	if (!regex.test(input)) {

		if (spanId != null) {
			// Remove any already existing help message into span tag
			while (spanId.childNodes[0]){
				spanId.removeChild(spanId.childNodes[0]);
			}
		}

		// Apend help message into span tag
		spanId.appendChild(document.createTextNode(helpMessage));
		return false;

	}else {

		// If the text box are filled correctly then remove existing help message
		if (spanId != null){
			while (spanId.childNodes[0]){
				spanId.removeChild(spanId.childNodes[0]);
			}
		}
	}
	return true;
}


//function called when signinUsing google clicked
chatApp.prototype.signinUsingGoogle = function() {
	this.pop.style.display='none';
	//this variable used to check login is happened through google account verification
	this.setUsingGoogle = true;
	var provider = new firebase.auth.GoogleAuthProvider();
	this.auth.signInWithPopup(provider);
}

//function to show pop form with all 3 fields and signin button text changed to signup
chatApp.prototype.signUp = function() {
	document.getElementById('namelbl').style.visibility = "visible";
	this.name.style.visibility = "visible";
	this.submit.innerText = "Signup";
	this.pop.style.display='block';
	
}

//function for signup
chatApp.prototype.submitSignUp = function() {
	// check name, email and password field using regex expression
	if(chatApp.popHelpValidation()) {
		var provider = firebase.auth().createUserWithEmailAndPassword(chatApp.email.value,chatApp.password.value).then(function() {
			var user1 = chatApp.auth.currentUser;
			user1.updateProfile({
				displayName: chatApp.name.value
			});

		}).catch(function(error) {
			var errorMessage = error.message;
			if(errorMessage.includes("Unable to create user")) {
				chatApp.spanId.appendChild(document.createTextNode("Unable to create user"));
				this.pop.style.display='block';
				return false;
			}
		});
		this.pop.style.display='none';
	}

}.bind(this);

//function to store message into database
chatApp.prototype.storeMessages = function() {
	
	// There should be a message and user is signed in.
	if (this.usermsg.value && this.auth.currentUser) {
		var currentUser = this.auth.currentUser;
		if(currentUser.displayName == null)
			currentUser.displayName = "";
		
		// Push to the Firebase Database.
		this.messagesReference.push({
			name: currentUser.displayName,
			text: this.usermsg.value
		}).then(function() {
			// Clear message text field and SEND button state.
			this.usermsg.value = "";
			this.sendButtonProperty(this.usermsg);
		}.bind(this)).catch(function(error) {
			console.error('Error in storing new message', error);
		});
	}
	else {
		// alert if user is not signed in
		this.usermsg.value = "";
		alert("Please signin first");
	}
}

//function called by signin or signout button
// And to disable name textbox from pop form
chatApp.prototype.signInSignOut = function() {
	if(this.signin.innerHTML == "Sign-In") {
		document.getElementById('namelbl').style.visibility = "hidden";
		this.name.style.visibility = "hidden";
		this.submit.innerText = "SignIn";
		this.pop.style.display='block';
	}
	else {
		this.signOut();
	}
}

//check which function to call i.e signin or signup
chatApp.prototype.loginSignup = function() {
	if(this.submit.innerHTML == "SignIn") {
		this.submitSignin();
	}
	else {
		this.submitSignUp();
	}
	
}

//function for retrieving messages
chatApp.prototype.retrieveMessages = function() {
	 // to get the referene of firebase database object
	  this.messagesReference = this.database.ref('chatbox');
	  
	  // remove all previous listeners.
	  this.messagesReference.off();
	  // to update chatbox with the new message only and no refresh all meesages
	  var setMsg = function(data) {
		    var val = data.val();
		    this.showMessages(data.key, val.name, val.text);
	  }.bind(this);
	  
	  // to listen event child added and child changed and call setMsg function
	  this.messagesReference.limitToLast(12).on('child_added', setMsg);
	  this.messagesReference.limitToLast(12).on('child_changed', setMsg);

}

//function to signout
chatApp.prototype.signOut = function(){
	if(confirm("Are you sure you want to signout ?")) {
		this.auth.signOut();
		this.usermsg.innerHTML = "";
		this.sendButtonProperty(this.usermsg);
		this.resetpopFields()
		// clearing chatbox field
		document.getElementById("chatbox").innerHTML = "";
		this.signup.style.visibility = "visible";

	}

}

//function to reset the pop form fields
chatApp.prototype.resetpopFields = function(user) {
	this.email.value = "";
	this.password.value = "";
	this.name.value = "";
	this.pop.style.display='none';
	while (this.spanId.childNodes[0]){
		this.spanId.removeChild(this.spanId.childNodes[0]);
	}


}

//function to set send button disabled and enabled on the basis of msg typed
chatApp.prototype.sendButtonProperty = function(event) {
	var char = String.fromCharCode(event.which || window.event.which);
	if (!char) return false; 
	var submitMsg = document.getElementById('submitmsg');
	  if (this.usermsg.value !="") {
	    submitMsg.removeAttribute('disabled');
	    submitMsg.style.cursor = "pointer";
	    submitMsg.style.opacity = "0.8";
	  } else {
	    submitMsg.setAttribute('disabled', 'true');
	    submitMsg.style.cursor = "not-allowed";
	    submitMsg.style.opacity = "0.4";
	  }
};

//message Template
chatApp.prototype.MESSAGE_TEMPLATE =
    '<div class="chatbox-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div></br></br>' +
    '</div>';

//function to show messages on chatbox
chatApp.prototype.showMessages = function(key, name, text) {
	var divElement = document.getElementById(key);
	this.messageList = document.getElementById('chatbox');
	// Create for an existing div element only.
	if (!divElement) {
		var element = document.createElement('div');
		element.innerHTML = chatApp.MESSAGE_TEMPLATE;
		divElement = element.firstChild;
		divElement.setAttribute('id', key);
		this.messageList.appendChild(divElement);
	}

	divElement.querySelector('.name').textContent = name;
	var messageElement = divElement.querySelector('.message');
	messageElement.style.fontWeight = 'bold';
	messageElement.style.fontSize = '125%';

	// If text is present
	if (text) { 
		messageElement.textContent = text;
		// Replace newline by <br>.
		messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
	}
	// when fading-in.
	setTimeout(function() {divElement.classList.add('visible')}, 1);

	//scroll to bottom of chatbox
	this.messageList.scrollTop = this.messageList.scrollHeight;
	this.usermsg.focus();
};

// creating chatApp object during onload and used throughout
window.onload = function() {
		window.chatApp = new chatApp();
	};


