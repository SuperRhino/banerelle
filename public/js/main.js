(function() {

    //console.log('hello world');

    // Click on big button:
    $(function() {
        $('a.btn-lg').on('click', function(){
            if (ga) ga('send', 'event', 'buttons', 'click', 'stay tuned');
            console.log('send', 'event', 'buttons', 'click', 'stay tuned');
        });
    });

}());