function play_video(){
    console.log("video play!");
    let video = document.getElementById("profile_video")
    video.play();
    let about_tab = document.getElementById("about_tab");
    let stuff_tab = document.getElementById("stuff_tab");
    let learning_tab = document.getElementById("learning_tab");

    about_tab.onclick = function(){
        location.href = base_path + '/html/about'+ '?play_video=reversed';
    }
    stuff_tab.onclick = function(){
        location.href = base_path + '/html/stuff_i_ve_made'+ '?play_video=reversed';
    }
    learning_tab.onclick = function(){
        location.href = base_path + '/html/learning_resources'+ '?play_video=reversed';
    }
}


function play_video_reversed(){
    console.log("video-play-reversed");
    let video = document.getElementById("profile_video")
    let source = document.getElementsByTagName("source")[0];
    source.src = base_path + "/resources/profile_vid_reversed.mp4";
    video.load();
    video.play();
}