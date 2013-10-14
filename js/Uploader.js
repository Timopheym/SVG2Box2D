/**
 * @author Timophey Molchanov <timopheym@gmail.com>
 * @class Object
 * @extends Uploader
 * Date: 10/14/13 1:41 PM
 *
 */

var Uploader = function () {
    var self = this,
        picker = document.getElementById("files");
    Bacon.fromEventTarget(picker, "change").onValue(function(evt) {
        self.uploadFile(evt);
    });
};
Uploader.prototype.uploadFile = function (evt) {
    var files = evt.target.files;
        if (files.length < 1)
            return;
        var f = files[0];
        if (f.type != 'image/svg+xml')
            return;
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                var triangulatedPolygons,
                    result = e.target.result;
                // some programs add extra markup at the beginning, we remove that here
                result = result.replace(/^[\s\S]*(<svg)/i, "$1");
                triangulatedPolygons = S2B.parser.loadSVG(result);
                S2B.box2Dapp.loadTriangulatedPolygons(triangulatedPolygons);
            };
        })(f);
        reader.readAsText(f);
};