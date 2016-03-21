define(['bootstrap', 'lib/vendors/autocomplete'], function (news) {
    var AutocompleteMediator = function ($inputElement, onMpSelect, dataset) {
        this.$autocompleteInput = $inputElement;
        this.onMpSelect = onMpSelect;
        this.autocompleteSelectedMp = null;
        this.istatsSent = false;
        this.$searchForm = news.$('.mpSearch_form');

        this.dataset = dataset;
        
        this.setupAutocomplete();
        
    };

    AutocompleteMediator.prototype = {
        setupAutocomplete: function () {
            var self = this;

            this.$autocompleteInput.autocomplete({
                lookup: this.getAutocompleteData(),
                lookupLimit: 20,
                // minChars: 3,
                autoSelectFirst: true,
                onSelect: function (suggestion) {
                    if (suggestion.mp !== self.autocompleteSelectedMp) {
                        self.autocompleteSelectedMp = suggestion.mp;
                    }
                    self.onMpSelect();
                },
                lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                    if (suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1) {
                        return true;
                    }
                },
                onInvalidateSelection: function () {
                    self.autocompleteSelectedMp = null;
                }
            });
        },
        getAutocompleteData: function () {
            // console.log('this.dataset = ', this.dataset);
            var autocompleteObject = [];
            for (var mpKey in this.dataset) {
                autocompleteObject.push({
                    value: mpKey,
                    mp: {
                        key: mpKey,
                        data: this.dataset[mpKey]
                    }
                });
            }
            return autocompleteObject;
        },
        getSelectedMp: function () {
            return this.autocompleteSelectedMp;
        }
    };

    return AutocompleteMediator;
});