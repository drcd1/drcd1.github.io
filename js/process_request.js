
//taken from https://stackoverflow.com/questions/4209052/how-to-read-get-request-using-javascript
function getQueryVariable(variable)
{ 
  var query = window.location.search.substring(1); 
  var vars = query.split("&"); 
  for (var i=0;i<vars.length;i++)
  { 
    var pair = vars[i].split("="); 
    if (pair[0] == variable)
    { 
      return pair[1]; 
    } 
  }
  return -1; //not found 
}

function process_request(){
    let help = getQueryVariable("play_video");
    if(help=="normal"){
        play_video();
        return;
    }
    if(help=="reversed"){
        play_video_reversed();
        return;
    }
    
}


process_request();