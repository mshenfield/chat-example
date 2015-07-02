// Setup emoji.js image directory
var imgPath = 'bower_components/emojify.js/dist/images/basic/';

$.getJSON('./emojies', function(data) {
	$('#chat-input-area').atwho(
	  { // emoji strategy
	    //  /\B:([\-+\w]*)$/
	      at: ":",
	      // Hit API endpoint for our emojies list
	      data: './emojies',
	      displayTpl: '<li><img src="//cdn.jsdelivr.net/emojione/assets/png/${unicode}.png?v=1.2.4" class="emojione popup"></img> ${shortname} </li>',
	  		insertTpl: ':${shortname}:',
        searchKey: 'shortname',
	      limit: 20
	  });
})

if(Cookies.get('username')){
	// hide the modal
	$('#overlay').hide();
	} else {
	$('#overlay').show();
}

var socket = io();

// Hook into automcomplete events to allow user to press enter
// to both select an autocomplete option and submit form
var isAutocompleting = false;
$('#chat-input-area').on('shown.atwho', function(e) {
	isAutocompleting = true;
});

$('#chat-input-area').on('inserted.atwho', function(e) {
	isAutocompleting = false;
});

var FIRSTVISIBLECHARCODE = 33 // 0
var COLONCHARCODE = 58;
var ENTERCHARCODE = 13;
$('#chat-input-area').keypress(function (e) {
	if(isAutocompleting){
		// Disable whitespaces characters inside of autocompletion
		if(e.charCode < FIRSTVISIBLECHARCODE) {
			e.preventDefault();
		}
	}
	// Allow Shift+Enter, and pressing Enter to select an At autocompletion option
	if(e.charCode === ENTERCHARCODE && !e.shiftKey && !isAutocompleting) {
		e.preventDefault();

		if($('#chat-input-area').val() !== ''){
		  $('#chat-form').submit();
		}
	}

	// Only emojies and whitespace
	if(e.charCode !== COLONCHARCODE && e.charCode >= FIRSTVISIBLECHARCODE && !isAutocompleting){
		e.preventDefault();
	}
});

$('form').submit(function(){
	socket.emit('chat message', {username: Cookies.get('username'), text: $('#chat-input-area').val()} );
	$('#chat-input-area').val('');
	return false;
});

socket.on('welcome', function(history) {
	history.forEach(function(msg) {
	  addMessage(msg);
	});
});

socket.on('chat message', function(msg){
	addMessage(msg);
});

function saveUsername() {
Cookies.set('username', $('#username-input').val(), {expires: 1});
	$('#overlay').hide();
}

function toggleButton() {
	if($('#username-input').val() === ''){
	  $('#submit-username').attr('disabled', 'true');
	} else {
	  $('#submit-username').removeAttr('disabled');
	}
}

function addMessage(msg){
  msg.text = emojione.toImage(msg.text);
  var li = $('<li>');
  li.html(msg.username + ": " + msg.text);
	$('#messages').append(li);
}
