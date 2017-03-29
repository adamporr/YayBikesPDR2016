    (function ($) {
    'use strict';


    $.fn.storymap = function(options) {

        var defaults = {
            selector: '[data-place]',
            breakpointPos: '33.333%',
            createMap: function () {
                // create a map in the "map" div, set the view to a given place and zoom
                var map = L.map('map').setView([39.9622601, -83.0007064], 7);

                // add an OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=bbafa71b6af34b0490daf22ee689afd7', {
                    attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>,&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
		    edgeBufferTiles: 1

		}).addTo(map);

                return map;
            }
        };

        var settings = $.extend(defaults, options);


        if (typeof(L) === 'undefined') {
            throw new Error('Storymap requires Leaflet');
        }
        if (typeof(_) === 'undefined') {
            throw new Error('Storymap requires underscore.js');
        }

        function getDistanceToTop(elem, top) {
            var docViewTop = $(window).scrollTop();

            var elemTop = $(elem).offset().top;

            var dist = elemTop - docViewTop;

            var d1 = top - dist;

            if (d1 < 0) {
                return $(document).height();
            }
            return d1;

        }

        function highlightTopPara(paragraphs, top) {

            var distances = _.map(paragraphs, function (element) {
                var dist = getDistanceToTop(element, top);
                return {el: $(element), distance: dist};
            });

            var closest = _.min(distances, function (dist) {
                return dist.distance;
            });

            _.each(paragraphs, function (element) {
                var paragraph = $(element);
                if (paragraph[0] !== closest.el[0]) {
                    paragraph.trigger('notviewing');
                }
            });

            if (!closest.el.hasClass('viewing')) {
                closest.el.trigger('viewing');
            }
        }

        function watchHighlight(element, searchfor, top) {
            var paragraphs = element.find(searchfor);
            highlightTopPara(paragraphs, top);
            $(window).scroll(function () {
                highlightTopPara(paragraphs, top);
            });
        }

        var makeStoryMap = function (element, markers) {

            var topElem = $('<div class="breakpoint-current"></div>')
                .css('top', settings.breakpointPos);
            $('body').append(topElem);

            var top = topElem.offset().top - $(window).scrollTop();

            var searchfor = settings.selector;

            var paragraphs = element.find(searchfor);

            paragraphs.on('viewing', function () {
                $(this).addClass('viewing');
            });

            paragraphs.on('notviewing', function () {
                $(this).removeClass('viewing');
            });

            watchHighlight(element, searchfor, top);

            var map = settings.createMap();

            var initPoint = map.getCenter();
            var initZoom = map.getZoom();

            var fg = L.featureGroup().addTo(map);

            function showMapView(key) {

                fg.clearLayers();
                if (key === 'overview') {
                    map.setView(initPoint, initZoom, true);
		} else if (key === 'rides') {
                    var marker = markers[key];
                    var layer = marker.layer;
                    fg.addLayer(layer);
                } else if (markers[key]) {
                    var marker = markers[key];
                    var layer = marker.layer;
                    if(typeof layer !== 'undefined'){
                      fg.addLayer(layer);
                    };
//                    fg.addLayer(L.marker([marker.lat, marker.lon]));

                    map.setView([marker.lat, marker.lon], marker.zoom, 1);
//		    map.flyTo([marker.lat, marker.lon], marker.zoom, { duration : 2 });
                }

            }

            paragraphs.on('viewing', function () {
                showMapView($(this).data('place'));
            });
        };

        makeStoryMap(this, settings.markers);

        return this;
    }

}(jQuery));
