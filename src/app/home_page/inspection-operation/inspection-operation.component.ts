import {Component, OnInit} from '@angular/core';
import {FilePickerOptions, Mediafilepicker} from "nativescript-mediafilepicker";
import {File} from "tns-core-modules/file-system";
import * as appSettings from "tns-core-modules/application-settings";
import * as application from "tns-core-modules/application";
//import {AES} from 'crypto-ts';

import {AES} from "crypto-ts";
var CryptoTS = require("crypto-ts");

@Component({
    selector: 'app-inspection-operation',
    templateUrl: './inspection-operation.component.html',
    styleUrls: ['./inspection-operation.component.css'],
    moduleId: module.id,
})

export class InspectionOperationComponent implements OnInit {

    text: string;
    data = '';

    constructor() {
        appSettings.setBoolean('isSelectdItemProduct', false);

    }

    ngOnInit() {
        appSettings.remove("sanjeshData");
       console.log( AES.encrypt("Mahdi Galavani","123").toString());
       console.log( "lknlsndvlnsdlkvnkl");

    }

    get_data() {


        let extensions = ['json'];
        let options: FilePickerOptions = {
            android: {
                extensions: extensions,
                maxNumberFiles: 1
            },
            ios: {
                extensions: extensions,
                multipleSelection: true
            }
        };
        let mediafilepicker = new Mediafilepicker();
        mediafilepicker.openFilePicker(options);
        mediafilepicker.on("getFiles", (res) => {
            let file = File.fromPath(res.object.get('results')[0].file);
            file.readText()
                .then((result) => {

                    /*console.log('result',result);
                    let decrypted=AES.decrypt(result,"13730514");
                    console.log('decrypted',decrypted);*/
                   appSettings.setString('sanjeshData', result);
                });

        });
        mediafilepicker.on("error", function (res) {
            let msg = res.object.get('msg');
            console.log(msg);
        });

        mediafilepicker.on("cancel", function (res) {
            let msg = res.object.get('msg');
            console.log(msg);
        });
    }


}
