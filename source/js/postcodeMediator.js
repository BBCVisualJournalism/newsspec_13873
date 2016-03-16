define(function () {
    return {

        sanitise: function (postcode) {
            return postcode.replace(/ /g, '');
        },

        isValidPostcode: function (postcode) {
            return (postcode.length >= 5 && postcode.length <= 7);
        },

        getInwardCode: function (postcode) {
            return postcode.substr(-3);
        },

        getOutwardCode: function (postcode) {
            return postcode.substring(0, postcode.length - 3);
        },

        resemblesPostcode: function (postcode) {
            return (/^\w{2}\d|^\w\d[ 0-9a-zA-Z]/.test(postcode));
        }

    };
});