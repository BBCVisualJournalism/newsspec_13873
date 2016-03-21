define(['bootstrap', 'postcodeMediator', 'viewMediator', 'autocompleteMediator', 'http://www.bbc.co.uk/indepthtoolkit/data-sets/my_mps_stance_on_eu?callback=define'], function (news, postcoder, viewMediator, AutocompleteMediator, autocompleteData) {

    var $searchForm = news.$('.mpSearch_form');
    var $searchInput = news.$('#mpSearch_form_input');
    var autocomplete = false;

    var getUserData = function () {
        return autocomplete.getSelectedMp();
    };

    var onMpSelect = function () {
        $searchInput.trigger('blur');
        $searchForm.trigger('submit');
    };
    var performPostcodeSearch = function (postcode) {
        // Postcodes in the UK - https://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom
        postcode = postcoder.sanitise(postcode);
        var datafile = ['/news/special/2016/newsspec_13873_data/postcode', 'constituency', postcoder.getOutwardCode(postcode), postcoder.getInwardCode(postcode) + '.json?callback=define'].join('/');
        
        require(
            [datafile],
            function (data) {
                //load dataset
                var postcodeData = setupPostcodeData();
                viewMediator.createView(postcodeData[data.code]);
                // autocomplete = null;
            },
            function (err) {
                //handle error
                console.dir(err);
            }
        );
    };

    var setupPostcodeData = function () {
        var postcodeData = {};
        for (var dataKey in autocompleteData) {
            // console.log(dataKey);
            postcodeData[autocompleteData[dataKey].ons_id] = autocompleteData[dataKey];
        }
        return postcodeData;
    };

    var performTextSearch = function () {
        console.log('text search');
        var userData = getUserData();

        if (userData) {
            viewMediator.createView(userData.data);
        }
    };

    $searchInput.on('keyup', function () {
        var postcode = postcoder.sanitise($searchInput.val());
        
        if (postcode.length > 2 && !postcoder.resemblesPostcode(postcode) && !autocomplete) {
            console.log('this is a text search');
            autocomplete = new AutocompleteMediator($searchInput, onMpSelect, autocompleteData);
        }
    });

    $searchForm.on('submit', function () {
        var searchTerm = postcoder.sanitise($searchInput.val());

        if (searchTerm === $searchInput.attr('placeholder')) {
            $searchInput.val('');
            return false;
        }

        if (searchTerm.length < 8 && postcoder.resemblesPostcode(searchTerm)) {
            performPostcodeSearch($searchInput.val());
        } else {
            performTextSearch();
        }

        return false;
    });

    $searchInput.on('focus', function () {
        var $this = $(this);
        // if (postcode.length === 1) {autocomplete}
        autocomplete = false;
        if ($this.val() !== '') {
            $this.val('');
            viewMediator.hideResult();
        }
    });


    news.pubsub.emit('pageLoaded');
});
