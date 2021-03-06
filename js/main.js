/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function(options) {

    var _this = this;

    this.render = options.render;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* json */
    if (typeof json == 'undefined' && typeof rma != 'undefined') {
        this.json = rma.customize.json;
    } else if (typeof json != 'undefined') {
        this.json = json;
    } else {
        this.json = '';
    }

    /* fet */
    if (typeof fet == 'undefined' && typeof rma != 'undefined') {
        this.fet = typeof rma.fet == 'string'
            ? [rma.fet]
            : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function() {
        _this.data = json_data;

        _this.render.render();
    });

    /* Get Tracker */
    if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
        this.custTracker = rma.customize.custTracker;
    } else if (typeof custTracker != 'undefined') {
        this.custTracker = custTracker;
    } else {
        this.custTracker = [];
    }

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }

    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined'
        ? rma.customize.src
        : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

    return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

    var tagsStr = '';

    for (var obj in tags) {
        if (tags.hasOwnProperty(obj)) {
            tagsStr += '&' + obj + '=' + tags[obj];
        }
    }

    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

    if (typeof url != "undefined" && url != "") {

        if (typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

        if (typeof mraid !== 'undefined') {
            mraid.open(url);
        } else {
            window.open(url);
        }

        if (typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
    }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

    /*
    * name is used to make sure that particular tracker is tracked for only once
    * there might have the same type in different location, so it will need the name to differentiate them
    */
    name = name || type;

    if (tt == 'E' && !this.fetTracked && this.fet) {
        for (var i = 0; i < this.fet.length; i++) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
        for (var i = 0; i < this.custTracker.length; i++) {
            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
                src = src.replace('tt={{rmatt}}', '');
            } else {
                src = src.replace('{{rmatt}}', tt);
                this.trackedEngagementType.push(tt);
            }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

mads.prototype.imageTracker = function(url) {
    for (var i = 0; i < url.length; i++) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
}

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

/*
*
* Unit Testing for mads
*
*/
var testunit = function() {

    /* pass in object for render callback */
    this.app = new mads({'render': this});

    this.render();

    this.app.loadJs(this.app.path + 'js/shake.js', function() {
        //create a new instance of shake.js.
        var myShakeEvent = new Shake({
            threshold: 5, // optional shake strength threshold
            timeout: 500 // optional, determines the frequency of event generation
        });

        // start listening to device motion
        myShakeEvent.start();
    });
}

/*
* render function
* - render has to be done in render function
* - render will be called once json data loaded
*/
testunit.prototype.render = function() {
    var is_ios = navigator.userAgent.match(/iPhone|iPad|iPod/i);

    this.app.contentTag.innerHTML = '\
        <div id="container"> \
            <img id="noddle" src="' + this.app.path + 'images/bg.png" />\
            <img id="smoke" src="' + this.app.path + 'images/smoke.png" />\
            <img id="noddle-after" src="' + this.app.path + 'images/end_img.png" />\
            <img id="shake-popup" src="' + this.app.path + 'images/cta.png">\
            <img id="link-btn" src="' + this.app.path + 'images/end_cta.png">\
            <div id="gredients">\
                <img id="udang" src="' + this.app.path + 'images/udang.png" />\
                <img id="chikuwa" src="' + this.app.path + 'images/chikuwa.png" />\
                <img id="parika" src="' + this.app.path + 'images/paprika.png" />\
                <img id="chilli" src="' + this.app.path + 'images/saus.png" />\
            </div>\
        </div>\
    ';

    document.body.style.padding = 0
    document.body.style.margin = 0

    var all_element = this.app.contentTag.querySelectorAll('*');
    var element = [];
    var _app = this.app;

    for (i = 0; i < all_element.length; i++) {
        element[all_element[i].id] = all_element[i];
    }

    element['container'].setAttribute('style', 'width: 320px; position: relative; height: 480px;');

    element['noddle'].setAttribute('style', 'width: 320px; left:0; position: absolute; z-index: -1; transition: opacity 1s;');

    element['noddle-after'].setAttribute('style', 'width: 320px; left:0; position: absolute; z-index: -3;');

    element['smoke'].setAttribute('style', 'transition: top 1s, opacity 2s;opacity: 0; top: 80px; width: 320px; position: absolute; z-index: 4;');

    // if( is_ios ) {
    //     element['shake-popup'].setAttribute( 'src', this.app.path + 'images/cta_safari.png' );
    // }

    element['shake-popup'].setAttribute('style', 'top: 120px; position: absolute; left: 55px; z-index: 10;');

    element['link-btn'].setAttribute('style', 'bottom: 10px; position: absolute; left: 40px; z-index:-4; opacity: 0; transition: opacity 0.5s;');

    element['gredients'].setAttribute('style', 'position: absolute; width: 320px; bottom: 0; height: 280px;');

    element['udang'].setAttribute('style', 'position: relative; left: 12px; top: 53px;');

    element['chikuwa'].setAttribute('style', 'position: relative; left: 8px; top: 9px;');

    element['parika'].setAttribute('style', 'position: relative; top: 0;left: 30px;');

    element['chilli'].setAttribute('style', 'position: relative; left: 60px; top: 11px;');

    var completed = false

    var move_gredients = (function() {
        var complete_percent = 0;

        return function() {
            completed = true
            _app.tracker('E', 'shaked')
            element['shake-popup'].style.display = 'none';

            var gredients_loop = setInterval(function() {
                if (complete_percent > 20) {
                    element['gredients'].style.display = 'none';
                    setTimeout(function() {
                        element['noddle'].style.opacity = 0;
                        element['smoke'].style.zIndex = -4;

                        setTimeout(function() {
                            element['link-btn'].style.zIndex = 10;
                            element['link-btn'].style.opacity = 1;
                        }, 2000);
                    }, 3000);
                    clearInterval(gredients_loop);
                } else if (complete_percent == 5) {
                    setInterval(function() {
                        if (element['smoke'].style.top == '80px') {
                            element['smoke'].style.top = '0';
                            element['smoke'].style.opacity = '0';
                        } else {
                            element['smoke'].style.top = '80px';
                            element['smoke'].style.opacity = '1';
                        }
                    }, 1000);
                }

                complete_percent++;

                element['smoke'].style.opacity = '1';
                // Set style to move ingredient
                element['udang'].style.left = parseInt(element['udang'].style.left.replace('px', '')) + 3.4 + 'px';
                element['udang'].style.top = parseInt(element['udang'].style.top.replace('px', '')) + 3.65 + 'px';
                element['chikuwa'].style.top = parseInt(element['chikuwa'].style.top.replace('px', '')) + 3.35 + 'px';
                element['chikuwa'].style.left = parseInt(element['chikuwa'].style.left.replace('px', '')) + 1.8 + 'px';
                element['parika'].style.top = parseInt(element['parika'].style.top.replace('px', '')) + 3.05 + 'px';
                element['chilli'].style.left = parseInt(element['chilli'].style.left.replace('px', '')) - 1.5 + 'px';
                element['chilli'].style.top = parseInt(element['chilli'].style.top.replace('px', '')) + 3.95 + 'px';
            }, 50);
        }

        window.removeEventListener('shake', shakeEventDidOccur, false);
    })();

    //Eventlistener
    window.addEventListener('shake', shakeEventDidOccur, false);
    element['link-btn'].addEventListener('click', function() {
        openLink();
    });

    if ( is_ios ) {
      setTimeout(function() {
          if (!completed) {
              move_gredients()
          }
      }, 3000)
    }


    //callback
    function shakeEventDidOccur() {
        //put your own code here etc.
        move_gredients();
    }

    function openLink() {
        _app.tracker('E', 'landing_page')
        _app.linkOpener('https://www.pizzahut.co.id/promosi/santap-di-restoran/asian-spaghetti-yuzu-breeze?utm_source=imx&utm_medium=rmb&utm_campaign=yuzu_asianspagethi');
    }
}

new testunit();
