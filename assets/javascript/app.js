$(document).ready(function () {

    // This will be used in a future release to greet the user by name when they log into the app. This approach would look at the username which would have been saved to the users local sessionStorage in the browser

    // read a this greeting message for the user depense on his name
    // var user = sessionStorage.getItem('user');
    // speechSynthesis.speak(new SpeechSynthesisUtterance("Hi,  " + user + '. upload your photo and check your mood today'));



    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(function () {
        $('a.page-scroll').bind('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });



    // ====================================================================================================================================
    // UPLOAD AND PASS A PHOTO TO THE GOOGLE VISION API    
    // ====================================================================================================================================

    // When the state of the input element changes execute this function
    $("#pic").change(function () {
        $("#loadPicIcon").attr("class", "fa fa-refresh fa-spin fa-3x fa-fw");
         var file = this.files[0];
         recongition(file);
        // Store the uploaded file
        
        // Starts reading the contents of the specified Blob, once finished, the result attribute contains a data: URL representing the file's data in Base64

    });


    // ====================================================================================================================================
    // USE THE WEB SPEECH API TO INTERACT WITH THE USER AND RETURN RESULTS BASED ON USER VOICE INPUT
    // ====================================================================================================================================
    function recongition(file){
        // New FileReader object to read the uploaded file
        var reader = new FileReader();

        // This event is triggered each time the reading operation is completed
        reader.onloadend = function () {
            var convertedPic = reader.result;
            // Finds where the "," starts and then adds one and only gets the Base64 part of the string
            var sliceNum = convertedPic.indexOf(",") + 1;
            // Removes the extra string characters before the / by slicing out the Data Url content based on the indexOf resulting in final format of image in Base64 that the google vision api understands
            var convertedPicSlice = convertedPic.slice(sliceNum) ;

            // Post the uploaded file to the google vision api and only ask to use Face Detection feature
            $.ajax({
                url: "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDdccmbhWxyGXxtqWe1mrNpBPbL7ZN3GRY",
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    'requests': [{
                        'image': {
                            "content": convertedPicSlice
                        },
                        'features': [{
                            'type': "FACE_DETECTION"
                        }]
                    }]
                }),
                // If detection is a success execute this function
                success: function (result) {

                    // Scroll to voice section once results are produced for the image
                    $('html, body').stop().animate({
                        scrollTop: $("#voice").offset().top
                    }, 1500, 'easeInOutExpo');

                    // Store the results from the api for the face detection
                    var faceResults = result.responses[0].faceAnnotations[0];
                    var joy = faceResults.joyLikelihood;
                    var sorrow = faceResults.sorrowLikelihood;

                    // Will use these in future updates
                    // var anger = faceResults.angerLikelihood;
                    // var surprise = faceResults.surpriseLikelihood;

                    console.log("Joy " + joy);
                    console.log("Sorrow " + sorrow);

                    // Will use these in future updates
                    // console.log("Anger " + anger);
                    // console.log("Surprise " + surprise);

                    // Store the mood based on results of google vision api
                    var mood;

                    // The google vision api uses likely, possible and very likely to represent the specific mood as true. If so then happy or sad is assigned to the mood variable
                    if (joy === "LIKELY" || joy === "POSSIBLE" || joy === "VERY_LIKELY") {
                        mood = 'happy';
                    }
                    if (sorrow === "LIKELY" || sorrow === "POSSIBLE" || sorrow === "VERY_LIKELY") {
                        mood = 'sad';
                    }

                    // Execute the voice function after 1 second and pass through the current mood
                    setTimeout(googleVoice(mood), 100);
                    // Change the dynamic loading icon back to the static cloud icon
                    $("#loadPicIcon").attr("class", "fa fa-cloud-upload fa-5x");

                },
                error: function (error) {
                    console.log(error);
                }
            });      }
               reader.readAsDataURL(file);
        }
    function googleVoice(mood) {
        console.log('dsfdgdsfg');
        var speechMessage = new SpeechSynthesisUtterance();
        speechMessage.lang = 'en-US';
        speechMessage.text = 'oh  you  look  ' + mood + ' Today  how  can I  help  you';
        speechSynthesis.speak(speechMessage);

        speechMessage.onstart = function (event) {
            console.log(event);
        };

        if ('webkitSpeechRecognition' in window) {
            var speechRecognizer = new window.webkitSpeechRecognition();
            speechRecognizer.continuous = true;
            speechRecognizer.interimResults = true;
            speechRecognizer.lang = 'en-US';
            speechRecognizer.maxAlternatives = 1;

            // Wait until computer voice is done talking before listening on the mic so it doesn't hear itself
            setTimeout(function () {
                f(mood)
            }, 3000);


            function f(mood) {

                // When the speechRecognizer stops execute this function
                speechRecognizer.onend = function (event) {
                    // Show the user instructions on how to start the mic again after it stops listening to make another statement
                    $("#button").append("<h2>Click the mic to start listening</h2>");
                    // When the mic is clicked start the f function again
                    $("#mic").on('click', function () {
                        f(mood);
                    });
                };

                // Start mic animation when the mic starts to listen
                $("#mic").css("animation", "mic-animate 2s linear infinite");

                speechRecognizer.start();

                speechRecognizer.onresult = function (event) {

                    // When the mic receives input remove the "click the mic to start listening text"
                    $("#button").find('h2').empty();

                    for (var i = event.resultIndex; i < event.results.length; ++i) {

                        interimResults = event.results[i][0].transcript;
                        // Display words as their being said in the textbox
                        $('textarea').val(interimResults);
                        x = $('textarea').val();
                        console.log(x);

                        // Once the user statement is considered final run it through the following if else statements
                        if (event.results[i].isFinal) {
                            if (compare2string(x, "Im looking for some food")) {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("go and  cook  some  food  for  your  self"));
                            } else if (compare2string(x, "go")) {
                                window.open("https://www.google.com/search?source=hp&q=" + x);
                                speechRecognizer.stop();
                                $('textarea').val("");
                                $("#mic").css("animation", 'none');
                                break;
                            } else if (compare2string(x, "stop")) {
                                speechRecognizer.stop();
                                $('textarea').val("");
                                $("#mic").css("animation", 'none');
                                break;
                            } else if (compare2string(x, "delete")) {
                                var lastIndex = x.lastIndexOf(" ");
                                x = x.substring(0, lastIndex);
                                $('textarea').val(x);
                                break;
                            } else if (compare2string(x, "delete all")) {
                                $('textarea').val("");
                                break;
                            } else if (compare2string(x, "I want to get out of the house") && mood == "sad") {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Since your feeling blue you should treat yourself to some relaxation. A spa day perhaps and long massage"));
                                foodMap("spa");
                                break;
                            } else if (compare2string(x, "I want to get out of the house") && mood == "happy") {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Well since your having such a good day why don't you go ahead and add to it by visiting one of your local parks, go and be one with nature"));
                                foodMap("parks");
                                break;
                            } else if (compare2string(x, "I want to watch a movie") && mood == "sad") {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("How about an animated film, or maybe even a musical that will get your spirits up, here are your local theatre's"));
                                foodMap("theatre");
                                break;
                            } else if (compare2string(x, "I want to watch a movie") && mood == "happy") {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Well your feeling pretty good how about an action film or maybe a comedy, here are your local theatre's"));
                                foodMap("theatre");
                                break;
                            } else if (compare2string(x, "I want to eat something") && mood == "sad") {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Sorry your feeling sad, here's some food that will comfort you. It's mostly ice cream, my favorite"));
                                foodMap("ice cream");
                                break;
                            } else if (compare2string(x, "I want to eat something") && mood == "happy") {
                                speechRecognizer.stop();
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Glad to see your feeling good, here's some food that will keep you happy and healthy"));
                                foodMap("healthy food");
                                break;
                            } else {
                                speechRecognizer.stop();
                                $("#mic").css("animation", 'none');
                                $('textarea').val("");
                                speechSynthesis.speak(new SpeechSynthesisUtterance("Sorry, I'm not programmed for that yet. Try one of the printed examples"));
                                setTimeout(function () {
                                    f(mood)
                                }, 5000);
                            }
                        }
                    }
                }
            }
        }

        // Checks to see if the user voice input matches one of the pre programmed options and returns a boolean value
        function compare2string(x, y) {
            if (x.toLowerCase().replace(/ /g, '').replace(/'/g, '') === y.toLowerCase().replace(/ /g, '').replace(/'/g, '')) {
                return true;
            } else {
                return false;
            }
        }
    }


    // ====================================================================================================================================
    // USE THE IPAPI TO CAPTURE THE USERS CITY VIA THEIR IP ADDRESS AND THEN USE THE GOOGLE MAPS API TO SHOW RESULTS LOCAL TO THE USER
    // ====================================================================================================================================

    // This is so a map local to the user is loaded immediately when the site is initially visited
    $.getJSON("https://ipapi.co/json/",
        function (json) {

            var city = json.city;

            $("iframe").attr("src", "https://www.google.com/maps/embed/v1/search?key=AIzaSyD0X2UTW5AczWoZ9-Wj517k9yvMZqBEeA4&q=" + city);
        });


    // This will show results on the map after photo is uploaded and user interacts via voice with the app
    function foodMap(search) {

        $("#mic").css("animation", 'none');
        $('textarea').val("");

        // Scroll to map section once results are produced for the image
        $('html, body').stop().animate({
            scrollTop: $("#mapSection").offset().top
        }, 1500, 'easeInOutExpo');

        $.getJSON("https://ipapi.co/json/",
            function (json) {

                var city = json.city;

                $("iframe").attr("src", "https://www.google.com/maps/embed/v1/search?key=AIzaSyD0X2UTW5AczWoZ9-Wj517k9yvMZqBEeA4&q=" + search + "+in+" + city);
            });
    }

     // References to all the element we will need.
var video = document.querySelector('#camera-stream'),
    image = document.querySelector('#snap'),
    start_camera = document.querySelector('#start-camera'),
    controls = document.querySelector('.controls'),
    take_photo_btn = document.querySelector('#take-photo'),
    delete_photo_btn = document.querySelector('#delete-photo'),
    download_photo_btn = document.querySelector('#download-photo'),
    error_message = document.querySelector('#error-message');


// The getUserMedia interface is used for handling camera input.
// Some browsers need a prefix so here we're covering all the options
navigator.getMedia = ( navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia);


if(!navigator.getMedia){
  displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
}
else{

  // Request the camera.
  navigator.getMedia(
    {
      video: true
    },
    // Success Callback
    function(stream){

      // Create an object URL for the video stream and
      // set it as src of our HTLM video element.
      video.src = window.URL.createObjectURL(stream);

      // Play the video element to start the stream.
      video.play();
      video.onplay = function() {
        showVideo();
      };

    },
    // Error Callback
    function(err){
      displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
    }
  );

}



// Mobile browsers cannot play video without user input,
// so here we're using a button to start it manually.
start_camera.addEventListener("click", function(e){

  e.preventDefault();

  // Start video playback manually.
  video.play();
  showVideo();

});


take_photo_btn.addEventListener("click", function(e){

  e.preventDefault();

  var snap = takeSnapshot();

  // Show image. 
  image.setAttribute('src', snap);
  image.classList.add("visible");

  // Enable delete and save buttons
  delete_photo_btn.classList.remove("disabled");
  download_photo_btn.classList.remove("disabled");

  // Set the href attribute of the download button to the snap url.
  download_photo_btn.href = snap;

  // Pause video playback of stream.
  video.pause();

});


delete_photo_btn.addEventListener("click", function(e){

  e.preventDefault();

  // Hide image.
  image.setAttribute('src', "");
  image.classList.remove("visible");

  // Disable delete and save buttons
  delete_photo_btn.classList.add("disabled");
  download_photo_btn.classList.add("disabled");

  // Resume playback of stream.
  video.play();

});

function showVideo(){
  // Display the video stream and the controls.

  hideUI();
  video.classList.add("visible");
  controls.classList.add("visible");
}

function takeSnapshot(){
  // Here we're using a trick that involves a hidden canvas element.  

  var hidden_canvas = document.querySelector('canvas'),
      context = hidden_canvas.getContext('2d');

  var width = video.videoWidth,
      height = video.videoHeight;

  if (width && height) {

    // Setup a canvas with the same dimensions as the video.
    hidden_canvas.width = width;
    hidden_canvas.height = height;

    // Make a copy of the current frame in the video on the canvas.
    context.drawImage(video, 0, 0, width, height);
    // Turn the canvas image into a dataURL that can be used as a src for our photo.
    return hidden_canvas.toDataURL('image/png');
  }
}


function displayErrorMessage(error_msg, error){
  error = error || "";
  if(error){
    console.log(error);
  }

  error_message.innerText = error_msg;

  hideUI();
  error_message.classList.add("visible");
}


function hideUI(){
  // Helper function for clearing the app UI.

  controls.classList.remove("visible");
  start_camera.classList.remove("visible");
  video.classList.remove("visible");
  snap.classList.remove("visible");
  error_message.classList.remove("visible");
}

});