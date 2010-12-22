// Homepage.js - Building realtime user-interfaces
// Create javascript object

var Home = { 
  trends: [], 
  twitter_since_id: 0,
  live_images_since_id: 0,
  friendfeed_entries: [] 
};
  
// Initializes the Twitter Callbacks

Home.init = function() {
  Home.appendJS('http://search.twitter.com/trends.json?callback=Home.catchTrends');
  // Extending for friendfeed  
  Home.getFriendFeedUpdates();
  Home.getLiveImages();
};

//Initialize the Twitter or yfrog callout

Home.getLiveImages = function(){
    var url = 'http://search.twitter.com/search.json?' + 'callback=Home.catchLiveImages&q=yfrog.com+OR+twitpic.com';
    url += '&since_id=' + Home.live_images_since_id;
    Home.appendJS(url);
    setTimeout(Home.getLiveImages, 8000);
};

Home.catchLiveImages = function(data){
  var image_regexp = new RegExp("http://(yfrog\.com|twitpic\.com)/([0-9a-zA-Z]+)");
    for(var i = data.results.length - 1; i > -1; --i) {
    var tweet = data.results[i];
    var matches = image_regexp.exec(tweet.text);
    
    if(matches){
      //yfrog 
      var domain = matches[1];
      var image_id = matches[2];
      var image_url = '';
      
      if(domain == 'yfrog.com')
        image_url = 'http://yfrog.com/' + image_id + '.th.jpg';
      if(domain == 'twitpic.com')
        image_url = 'http://twitpic.com/show/thumb/' + image_id;
      var image_str = '<a target="_blank" href="' + matches[0] + '">' + '<img src="' + image_url + '" />' + '</a>';
      
      Home.addLine('images-on-twitter', { 'html': image_str });
    }
  }
  
  if(data.results.length)
    Home.updateTitle('images-title', data.results.length);
    Home.live_images_since_id = data.max_id;
};

Home.getFriendFeedUpdates = function(){
  var url = "http://friendfeed-api.com/v2/feed/orionengleton/friends?" + 'callback=Home.catchFriendFeedUpdates';  
  Home.appendJS(url);
  setTimeout(Home.getFriendFeedUpdates, 5000);
};

Home.catchFriendFeedUpdates = function(data) {
  var cnt = 0;
  for(var i = data.entries.length - 1; i > -1; --i) {
    var entry = data.entries[i];
    
    if(Home.friendfeed_entries.indexOf(entry.id) == -1) {
      Home.friendfeed_entries.push(entry.id);
      Home.addLine('friendfeed-updates', {
        'username': entry.from.name,
        'html': entry.body });
      cnt++
    }
  }
  if(cnt)
    Home.updateTitle('friendfeed-title', cnt);
};

Home.appendJS = function(url) {
  url += "&" + Math.random(); 
  var scr = document.createElement('script');
  scr.setAttribute('src', url);
  scr.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head').item(0).appendChild(scr);
};

// The above function - rewrites the script file over and over to the head of the document

Home.catchTrends = function(data) {
  for(var trend = 0; trend < data.trends.length; ++trend)
      Home.trends.push(data.trends[trend].name);
      Home.getTrendingTweets();
};

Home.getTrendingTweets = function(){
  // setup the base url
  var url = 'http://search.twitter.com/search.json?' + 'callback=Home.catchTweets';
    Home.trends = Home.trends.sort(function() {
      return (Math.round(Math.random()) - 0.5);
    });
  url += '&q=' + encodeURIComponent(Home.trends.slice(0,5).join(" OR "));
  url += "&since_id=" + Home.twitter_since_id;

  Home.appendJS(url);
  setTimeout(Home.getTrendingTweets, 7000);

};

Home.addLine = function(TargetDivID, data) {
  var doc = document;
  
  var line = doc.createElement('div');
  line.setAttribute('class', 'line');
  
  if('profile_image' in data) {
    var img = doc.createElement('img');
    img.setAttribute('align', 'right');
    img.setAttribute('class', 'profile_image');
    img.setAttribute('src', data.profile_image);
    line.appendChild(img);
  }
  
  var p = doc.createElement('p');
  p.innerHTML ="";
  
  if('username' in data)
  p.innerHTML += '<strong>' + data.username + "</strong>" + ": ";
  
  if('html' in data)
  p.innerHTML += data.html;
  
  line.appendChild(p);
  var targetDiv = doc.getElementById(TargetDivID);

  // target.insertBefore('selector expression')
  targetDiv.insertBefore(line, targetDiv.firstChild);

  //Cleanup DOM
  var dom_limit = 50;
  var elements = targetDiv.getElementsByClassName('line');

  for(var i = elements.length - 1; i >= dom_limit; --i)
    targetDiv.removeChild(elements[i]);

};

Home.catchTweets = function(data) {
  for(var i = data.results.length - 1; i > -1; --i) {
    var tweet = data.results[i];
    Home.addLine('trending-on-twitter', {  'username': tweet.from_user,
                                           'html': tweet.text ,
                                           'profile_image': tweet.profile_image_url
                                           });
  }
  if(data.results.length)
    Home.updateTitle('trending-title', data.results.length);
    Home.twitter_since_id = data.max_id;
  
};

Home.updateTitle = function(divID, number) {
  var titleDiv = document.getElementById(divID);
  
  titleDiv.innerHTML += ": " + number + " new Results";
  setTimeout(function() { titleDiv.innerHTML = titleDiv.innerHTML.replace(/\:.+/, '');
  }, 1500 );
  var highlightLevel = 1;
  var highlightStep = function() {
    var hex = highlightLevel.toString(16);
    titleDiv.style.backgroundColor = '#ccc' + hex + hex;
    
    if( highlightLevel < 12) { // 12=="c" in base16 (hex) 
      highlightLevel++;
      setTimeout(highlightStep, 50);
    }
  };
  highlightStep();
};

Home.init();