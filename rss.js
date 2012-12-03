var getRSSFeeds = function() {
	if ((rssData.readyState === 4) || (rssData.readyState === "complete")) {
		div = ((document.getElementById) ? document.getElementById("content")
				: document.all.content);
		feeds = rssData.responseXML.getElementsByTagName("rss")[0]; // Specifying
																	// the root
																	// element
		tnodes = ""; // Will be used to display our feeds
		tnodes += "<h1>" + feeds.getElementsByTagName("title")[0].childNodes[0].nodeValue + "</h1>\n";
		div.innerHTML = tnodes;
		// displays everything from the feeds
	}
};

function loadRSSFeeds(url) {
	rssData = null;
	if (window.XMLHttpRequest) { // Creates XMLHttpRequest object for IE7+,
									// OP, ff etc.
		rssData = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		try { // Works well in IE Browser's
			rssData = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {
			rssData = new ActiveXObject("Msxml2.XMLHTTP");
		}
	}
	if (rssData !== null) { // Initiating function reference ( getRSSFeeds )
		rssData.onreadystatechange = getRSSFeeds;
		rssData.open("GET", url, true);
		// sending out request
		rssData.send(null);
	} else {
		alert("\nYour browser does not support AJAX Request!");
	}
};