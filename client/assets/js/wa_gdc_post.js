/*
* Web Analytics functions snippet for GDC sites
*/
s.linkInternalFilters = wa_linkInternalFilters;

s.channel = wa_channel;
s.events = 'event1';
var s_code = s.t(); if (s_code) document.write(s_code);

var NCIAnalytics = {
    
    // Track sitewide searches
    SiteSearch: function(sender) {
        var s = s_gi(s_account);
        s.linkTrackVars = 'channel,prop14,eVar14,events';
        s.linkTrackEvents = 'event2';
        s.prop14 = sender.elements[0].value;
        s.eVar14 = sender.elements[0].value;
        s.channel = wa_channel;
        s.events = 'event2';
        s.tl(this, 'o', wa_search_function_name);
    }
};
