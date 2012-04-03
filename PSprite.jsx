/**
 * @Author      Axel Etcheverry <axel@etcheverry.biz>
 * @Copyright   (c) 2012 Axel Etcheverry (http://www.axel-etcheverry.com)
 * @License     http://creativecommons.org/licenses/MIT/deed.fr    MIT
 */
 
// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop


// on localized builds we pull the $$$/Strings from a .dat file, see documentation for more details
$.localize = true;

//=================================================================
// Globals
//=================================================================

// UI strings to be localized
var strAlertDocumentMustBeOpened = localize("$$$/JavaScripts/PSprite/OneDocument=You must have a document open to export!");
var strAlertNeedMultipleLayers = localize("$$$/JavaScripts/PSprite/NoLayers=You need a document with multiple layers to export!");

var psdIndex = 3;
var css = '';
var docName = '';

///////////////////////////////////////////////////////////////////////////////
// Dispatch
///////////////////////////////////////////////////////////////////////////////
var defaultRulerUnits = preferences.rulerUnits;
preferences.rulerUnits = Units.PIXELS;

main();

preferences.rulerUnits = defaultRulerUnits;
///////////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Function: main
// Usage: the core routine for this script
// Input: <none>
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function main() {
    if ( app.documents.length <= 0 ) {
        if ( DialogModes.NO != app.playbackDisplayDialogs ) {
            alert( strAlertDocumentMustBeOpened );
        }
     	return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
    }

    try {
        docName = app.activeDocument.name;  // save the app.activeDocument name before duplicate.

        var layerCount = app.documents[docName].layers.length;
        var layerSetsCount = app.documents[docName].layerSets.length;

        if ((layerCount <= 1) && (layerSetsCount <= 0)) {
            if ( DialogModes.NO != app.playbackDisplayDialogs ) {
                alert( strAlertNeedMultipleLayers );
                return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
            }
        } else {

            var name = docName.replace('.psd', '');
            css += '.' + name.toLowerCase() + ' {' + "\n";
            css += "\t" + 'background-image: url(' + name + '.png);' + "\n";
            css += "\t" + 'background-repeat: no-repeat;' + "\n";
            css += "\t" + 'display:block;' + "\n";
            css += '}' + "\n";

            createSprite(app.activeDocument);
            
            // create export file in src dir
            var exportFile = new File(app.activeDocument.path + "/" + docName.replace(".psd", ".css"));
            exportFile.open("w");
            exportFile.writeln(css);
            exportFile.close();

            var options = new ExportOptionsSaveForWeb();
            options.format = SaveDocumentType.PNG;
            options.PNG8 = false;
            options.quality = 100;

            if (docName.length > 27) {
                var file = new File(app.activeDocument.path + "/temp.png");
                app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, options);
                file.rename(docName.replace(".psd", ".png"));
            } else {
                var file = new File(app.activeDocument.path + "/" + docName.replace(".psd", ".png"));
                app.activeDocument.exportDocument(file, ExportType.SAVEFORWEB, options);
            }
        }
    } catch (e) {
        if ( DialogModes.NO != app.playbackDisplayDialogs ) {
            alert(e);
        }
        return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
    }
}

function createSprite(doc, prefix) {
    for (var i = 0; i < doc.layers.length; i++) {
        createSpriteElement(doc.layers[i], prefix);
    }
}

function createSpriteElement(layer, prefix) {
    if (layer.typename == 'LayerSet') {
        createSprite(layer, layer.name.toLowerCase());
    } else {
        var width = (layer.bounds[2].value - layer.bounds[0].value),
            height = (layer.bounds[3].value - layer.bounds[1].value);
        
        if(width != 0 && height != 0) {
            
            var name = docName.replace('.psd', '').toLowerCase() + '-';
            
            if(prefix != undefined) {
                name += prefix + '-';
            }
            
            name += layer.name.toLowerCase();
            
            css += '.' + name + ' {' + "\n";
            css += "\t" + 'width: ' + width + 'px;' + "\n";
            css += "\t" + 'height: ' + height + 'px;' + "\n";
            css += "\t" + 'background-position: -' + layer.bounds[0].value + 'px -' + layer.bounds[1].value + 'px;' + "\n";
            css += '}' + "\n";
        }
    }
}