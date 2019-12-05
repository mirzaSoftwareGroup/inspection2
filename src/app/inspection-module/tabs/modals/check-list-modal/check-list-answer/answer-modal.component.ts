import {Component, ElementRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ModalDialogParams, ModalDialogService} from "nativescript-angular";
import {DropDown, ValueList} from "nativescript-drop-down";
import * as camera from "nativescript-camera";

import * as Toast from 'nativescript-toast';


import {ImageSource} from "tns-core-modules/image-source";

import * as dialogs from "tns-core-modules/ui/dialogs";
import {AnswerQuestionService} from "~/app/inspection-module/tabs/services/answerQuestion/answerQuestion.service";
import {CheckListAnswerPhotoComponent} from "~/app/inspection-module/tabs/modals/check-list-modal/check-list-answer-photo/check-list-answer-photo.component";
import {QuestionfaulttableService} from "~/app/inspection-module/tabs/services/faultTbl/questionfaulttable.service";

@Component({
    selector: 'app-check-list-answer',
    templateUrl: './answer-modal.component.html',
    styleUrls: ['./answer-modal.component.css'],
    moduleId: module.id,
})
export class AnswerModalComponent implements OnInit {

    describtion = "";
    scoreFrom = null;
    scoreTo = null;
    textAnswer = "";
    scoreNum = null;
    itemShow = false;
    scoreShow = false;
    textShow = false;
    choiceOfanswerForItemStatus = [];
    answerchoiceStatus = ['.....', 'انطباق', 'عدم انطباق', 'عدم قضاوت', 'عدم کاربرد', 'بازرسی مجدد'];
    answerchoiceFault = ['....'];/*آیتم های عیب*/
    answerchoiceTroubleshooting = ['....'];/*آیتم های رفع عیب*/
    answerIndex = 0;
    statusIndex = 0;
    faultIndex = 0;
    troubleshootingIndex = 0;
    displayNonCompliance = false;
    questionWithAnswer = {};/*زمانی که پاسخ دهی را میزند سوال و جواب ها اگر پرشده یاشند دراین قرار می گیرد*/
    questionFualtTable = [];
    questionFualtTable_raw = [];


    ///////////////////////AnswerQuestionFault///////
    defect = null;/*عیب*/
    troubleshooting = null;/*رفع عیب*/
    answerQuestionFualtPhoto = null;/*تصویر خطا*/

    ////////////////////////////////////////////////


    constructor(private dialogParams: ModalDialogParams, private dialogService: ModalDialogService, private viewContainerRef: ViewContainerRef,
                private answerQuestionService: AnswerQuestionService,
                private faultTableService:QuestionfaulttableService) {

        this.questionWithAnswer = this.dialogParams.context;


        // @ts-ignore
        for (let fault of this.questionWithAnswer.content.questionFaults) {
            this.answerchoiceFault.push(fault.faultTitle);
        }
        // @ts-ignore
        switch (this.questionWithAnswer.content.structur) {
            case 0:/*چندگزینه ای*/
                this.itemShow = true;
                this.scoreShow = false;
                this.textShow = false;

                this.choiceOfanswerForItemStatus = ['....'];
                // @ts-ignore
                for (let choice of  this.questionWithAnswer.content.choices) {
                    this.choiceOfanswerForItemStatus.push(choice.value);
                }

                break;
            case 1:/*بازه ای*/
                this.itemShow = false;
                this.scoreShow = true;
                this.textShow = false;
                // @ts-ignore
                this.scoreFrom = this.questionWithAnswer.content.scoreFrom;
                // @ts-ignore
                this.scoreTo = this.questionWithAnswer.content.scoreTo;
                // @ts-ignore
                this.scoreNum = this.questionWithAnswer.content.answer;
                break;
            case 2:/*متنی*/
                this.itemShow = false;
                this.scoreShow = false;
                this.textShow = true;
                // @ts-ignore
                this.textAnswer = this.questionWithAnswer.content.answer;
                break;
        }

    }

    public setAnswers() {

        // @ts-ignore
        this.answerIndex = this.choiceOfanswerForItemStatus.findIndex(obj => obj == this.questionWithAnswer.content.answer);/*ایندکس پاسخی را پیدا می کند که برای ان دردیتابیس پر شده است*/
        // @ts-ignore
        this.statusIndex = this.answerchoiceStatus.findIndex(obj => obj == this.questionWithAnswer.content.match);
        this.statusIndex == 2 ? this.displayNonCompliance = true : this.displayNonCompliance = false;
        // @ts-ignore
        this.describtion = this.questionWithAnswer.content.describtion;

        this.fetchQuestionFaultTbl();
    }

    public selectedIndexAnswer(args) {
        let picker = <DropDown>args.object;
        if (picker.selectedIndex != 0) {
            // @ts-ignore
            this.questionWithAnswer.content.answer = picker.items[picker.selectedIndex];
        } else {
            // @ts-ignore
            this.questionWithAnswer.content.answer = '-';
        }
    }

    genRows(item) {
        let rows = "*,*";
        item.forEach((el) => {
            rows += ",*";
        })
        return rows
    }

    public selectedIndexStatus(args) {
        let picker = <DropDown>args.object;
        if (picker.selectedIndex != 0) {
            // @ts-ignore
            this.questionWithAnswer.content.match = picker.items[picker.selectedIndex];
            if (picker.selectedIndex == 2) {
                this.displayNonCompliance = true;
                this.fetchQuestionFaultTbl();
            } else {
                this.displayNonCompliance = false;
            }
        } else {
            // @ts-ignore
            this.questionWithAnswer.content.match = '-';
            this.displayNonCompliance = false;

        }

    }

    selectedIndexDefect(args) {
        let picker = <DropDown>args.object;
        if (picker.selectedIndex != 0) {
            this.defect = picker.items[picker.selectedIndex];
        } else {
            this.defect = null;
        }
    }

    selectedIndexTroubleshooting(args) {
        let picker = <DropDown>args.object;
        if (picker.selectedIndex != 0) {
            this.troubleshooting = picker.items[picker.selectedIndex];
        } else {
            this.troubleshooting = null;
        }
    }

    ngOnInit() {
        this.setAnswers();
    }

    public takePicture() {

        let that = this;
        const options = {
            saveToGallery: false
        };
        camera.requestPermissions().then(
            function success() {
                camera.takePicture(options).then((imageAsset) => {
                    let source = new ImageSource();
                    source.fromAsset(imageAsset).then((source) => {
                        let base64 = source.toBase64String("png", 60);
                        // @ts-ignore
                        that.answerQuestionFualtPhoto = base64;
                    }).catch(
                        (error) => {
                            console.log("Error -> " + error.message);
                        }
                    );
                }).catch((err) => {
                    console.log("Error -> " + err.message);
                });
            },
            function failure() {
                console.log('denied ***');
            }
        );


    }


    closeModal() {
        var allowToStore = false;
        // @ts-ignore
        switch (this.questionWithAnswer.content.structur) {

            case 0: /*چندگزینه ای*/
                if (!(this.answerIndex == 0) && !(this.statusIndex == 0)) {
                    allowToStore = true;
                } else {
                    Toast.makeText("جواب / وضعیت باید انتخاب شوند").show();
                }
                break;
            case 1:/*بازه ای*/
                if (!(this.scoreNum == null) && !(this.statusIndex == 0)) {
                    allowToStore = true;
                    // @ts-ignore
                    this.questionWithAnswer.content.answer = this.scoreNum;

                } else {
                    Toast.makeText("جواب / وضعیت باید مقداردهی  شوند").show();
                }
                // @ts-ignore
                this.scoreFrom = this.questionWithAnswer.content.scoreFrom;
                // @ts-ignore
                this.scoreTo = this.questionWithAnswer.content.scoreTo;
                break;

            case 2:/*متنی*/
                if (!(this.textAnswer == null) && !(this.statusIndex == 0)) {
                    allowToStore = true;
                    // @ts-ignore
                    this.questionWithAnswer.content.answer = this.textAnswer;
                } else {
                    Toast.makeText("جواب / وضعیت باید مقداردهی شوند").show();
                }
                break;

        }
        if (allowToStore) {
            this.dialogParams.closeCallback();
            // @ts-ignore
            this.questionWithAnswer.content.isAnswered = true;
            // @ts-ignore
            this.questionWithAnswer.content.describtion = this.describtion;


            // @ts-ignore
            this.answerQuestionService.excute2("update answerQuestionTbl  set answerQuestion=? where  id=? ", [JSON.stringify(this.questionWithAnswer.content), this.questionWithAnswer.id]).then(id => {
                Toast.makeText('پاسخ شما ثبت شد').show();
            }, error => {
                console.log("update ERROR", error);
            });
        }
    }


    getImage(src) {
        let option = {context: src, viewContainerRef: this.viewContainerRef, fullscreen: false}
        this.dialogService.showModal(CheckListAnswerPhotoComponent, option);
    }

    insertDefectAnswer() {


        // @ts-ignore
        this.faultTableService.excute2("insert into QuestionFaultTbl(faultTitle,troubleShooting,imgStr,questionId) VALUES (?,?,?,?) ", [this.defect, this.troubleshooting, this.answerQuestionFualtPhoto, this.questionWithAnswer.id]
        ).then(id => {
            Toast.makeText('ثبت شد').show();
            this.fetchQuestionFaultTbl();
        }, error => {
            console.log("INSERT ERROR", error);
        });
        /*this.questionFualtTable.push({
            defect: this.defect,
            troubleshooting: this.troubleshooting,
            answerQuestionFualtPhoto: this.answerQuestionFualtPhoto
        });*/
         //this.questionFualtTable=this.questionFualtTable_raw;

    }

    fetchQuestionFaultTbl(){
        // @ts-ignore
        this.faultTableService.All("select * from QuestionFaultTbl f where f.questionId= "+this.questionWithAnswer.id).then(rows=>{

            this.questionFualtTable=[];
            for(let row of rows){
                this.questionFualtTable.push({
                    id:row[0],
                    defect: row[1],
                    troubleshooting: row[2],
                    answerQuestionFualtPhoto: row[3],
                    questionId:row[4]
                });

            }

        },error=>{
            console.log("error is:"+error);
        });
    }
    deleteDefectAnswer(id) {
        dialogs.confirm({
            title: "پیغام حذف",
            message: "از حذف این آیتم مطمئن هستید؟",
            okButtonText: "بلی",
            cancelButtonText: "خیر"
        }).then(res => {
            if (res) {
                this.faultTableService.excute("delete from QuestionFaultTbl where id="+id).then(id=>{
                    Toast.makeText("رکورد پاک شد").show();
                    this.fetchQuestionFaultTbl();
                },error=>{
                    console.log("error ...."+error);
                });
            }
        })


    }
}