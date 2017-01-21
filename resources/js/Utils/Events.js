import $ from 'jquery';

export default class Events {
    /*
     * @param category  *required*  Typically the object that was interacted with (e.g. 'Video')
     * @param action    *required*  The type of interaction (e.g. 'play')
     * @param label                 Useful for categorizing events (e.g. 'Fall Campaign')
     */
    static send(category, action, label) {
        if (!! window.ga) ga('send', 'event', category, action, label);
        console.log('event', category, action, label);
    }

    static init() {
        // Click anchors with [data-ga-event]
        let $btns = $('a[data-ga-event]');
        $btns.on('click', function(e) {
            let $this = $(this),
                label = $.trim($this.text().toLowerCase());
            Events.send('buttons', 'click', label);
        });

        // Click anchors with [data-ga-internal]
        let $iBtns = $('a[data-ga-internal]');
        $iBtns.on('click', function(e) {
            let $this = $(this),
                label = 'internal-' + $.trim($this.text().toLowerCase());
            Events.send('buttons', 'click', label);
        });

        // Click anchors with [data-ga-rsvp]
        let $rsvpBtns = $('a[data-ga-rsvp]');
        $rsvpBtns.on('click', function(e) {
            let $this = $(this),
                label = 'internal-' + $.trim($this.text().toLowerCase());
            Events.send('buttons', 'click', label);
        });

    }
}
