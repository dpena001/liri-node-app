//Global Variable
var query = new String();

// Take in the command line arguments
var action = process.argv[2];
var nodeArgs = process.argv;

for (var i = 3; i < nodeArgs.length; i++) {
 query = query + ' ' + nodeArgs[i];
}

query = query.substr(1);

// Function Retrieve My Tweets
function gettweets(){
  var Twitter = require('twitter-node-sdk');
  var config = require('./key.js');
  var err = "";
  var twitter = new Twitter(config.twitterkeys);
  var param = {screen_name: 'sn_dpena01',count: '20'};
  twitter.getUserTimeline(param,err, function (data){

            if (err){
                console.log("There was a failure: "+err);
                logdata("my-tweets","",err);
                return;
            }
            var result = JSON.parse(data);
            for (var i = 0; i < result.length; i++) {
                var date = new Date(result[i].created_at);
                time = date.toString();
                var tmpdata = "-----------------------------------"+'\n'+"Tweet No."+i+"  Created At: "+time.substr(0,33)+"\n"+result[i].text;
                console.log(tmpdata);
                logdata("my-tweets","",tmpdata);
            }
  });
}

// Function Retrieve Spotify Songs
function getsongs(song){
  var Spotify_id = require('node-spotify-api');
  var spotify = new Spotify_id({ id: '596f3a18a2404472953b2dad0d0df47b', 
  secret: 'b57d2b5a382e48ef989b868a1a758317'});
  var songnumber = 0;

  if (song) {
    var param = {type: "track", query : song};
  }else{
    var param = {type: "track", query : "The Sign artist:Ace of Base", limit : 1};
    song = query;
  }
     spotify.search(param)
       .then(function(response) {
              if (response.tracks.items.length >= 10){
                    songnumber = 10;
              }else{
                    songnumber = response.tracks.items.length;
              }
   
              for (var i = 0; i < songnumber; i++) {
                var result = response.tracks.items[i];
                  var tmpdata = "-----------------------------------"+'\n';
                  tmpdata = tmpdata + "Artist(s): "+result.artists[0].name+'\n'+"Track Name: "+result.name+'\n'
                  tmpdata = tmpdata + "Preview Link: "+ result.preview_url+'\n'+"Album: "+result.album.name+'\n'
                  tmpdata = tmpdata + "Popularity: "+result.popularity;
                  console.log(tmpdata);
                  logdata ("spotify-this-song",song,tmpdata);
              }
        })
       .catch(function(err) {
          console.log(err);
          logdata ("spotify-this-song",song,err);
     });
}

// Function Retrieve OMDB movies
function getmovie(movie){
  var request = require('request');
  if (!movie){
    movie ="Mr. Nobody";
  }
  
  request('http://www.omdbapi.com/?apikey=40e9cece&t='+movie, function (error, response, body) {

    var result = JSON.parse(body)
    if (result.Response === "False"){
       console.log('Error occurred: ' + response.statusCode);
       console.log("Detail: "+result.Error);
       logdata ("movie-this",movie,result.Error);
       return;
    } else{
        if (typeof(result.Ratings[1])== 'undefined'){
          var tomatoes_rating = "N/A";
       }else{
          var tomatoes_rating = result.Ratings[1].Value;
       }

       var tmpdata = "-----------------------------------"+'\n';
           tmpdata = tmpdata + "Title of the movie: "+result.Title+'\n'+"Year: "+result.Year+'\n'
           tmpdata = tmpdata + "IMDB Rating of the movie: "+ result.imdbRating+'\n'+"Rotten Tomatoes Rating: "+tomatoes_rating+'\n'
           tmpdata = tmpdata + "Country: "+result.Country+" Language: "+result.Language+'\n'
           tmpdata = tmpdata + "Plot: "+result.Plot+'\n'
           tmpdata = tmpdata + "Actors: "+result.Actors+'\n'
           console.log(tmpdata);
           logdata ("movie-this",movie,tmpdata);
    }
 });

}

function do_what_it_say(){

    const rf = require("fs");

    var transaction = "";
    var parameter ="";

    rf.readFile("random.txt","utf8",function(error,data){

     if (error) throw error;
     
     var da = data.split(",");
     transaction = da[0];
     parameter = da[1];
     switch(transaction){
        case 'my-tweets':
           gettweets();
           break;
        case 'spotify-this-song':
           getsongs(parameter);
           break;
        case 'movie-this':
           getmovie(parameter);
           break;
        case 'do-what-it-say':
           var outdata = "Invalid Parameter Dangerous Recursivity";
           console.log(outdata);
           logdata("do-what-it-say","",outdata);
           break;
     }
  });  

}


function logdata(action,query,data){
  //define File System constant 
  const fs = require("fs");
  // Get Date and time Machine
  var time = new Date().getTime();
  var date = new Date(time);
  var date_time = date.toString();

  if(!query){
   query = "-----";
  }

  if(!data){
    data = "-----";
  }

  var textFile = date_time.substr(0,33)+" "+action+" "+query+" "+data;
  fs.appendFile("log.txt", textFile +";"+'\n', function(err) {
       // If an error was experienced we say it.
      if (err) {
         console.log(err);
      }
   });
}

switch(action){
        case 'my-tweets':
           gettweets();
           break;
        case 'spotify-this-song':
           getsongs(query);
           break;
        case 'movie-this':
           getmovie(query);
           break;
        case 'do-what-it-say':
           do_what_it_say();
           break;
        default :
           var outdata = "Invalid action!, The valid actions are; 'my-tweets','spotify-this-song','movie-this','do-what-it-say'.";
           console.log(outdata);
           logdata("Invalid action","",outdata);
           break;
}
