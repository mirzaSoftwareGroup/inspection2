import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {InstanceModel} from "~/app/inspection-module/tabs/instanceComponent/instance.model";
import * as appSettings from "tns-core-modules/application-settings";
import {DropDown} from "nativescript-drop-down";
import {InstanceService} from "~/app/inspection-module/tabs/instanceComponent/instance.service";
import * as Toast from "nativescript-toast";


@Component({
    selector: 'instance-edit',
    templateUrl: './instance-edit.component.html',
    styleUrls: ['./instance-edit.component.css'],
    moduleId: module.id,
})
export class InstanceEditComponent implements OnInit,AfterViewInit  {
    @ViewChild("examTypeDropDown", {static: false}) examTypeDropDown;
    @ViewChild("citiationReferencesDropDown", {static: false}) citiationReferencesDropDown;
    @ViewChild("inspectionLevelDropDown", {static: false}) inspectionLevelDropDown;
    @ViewChild("vasfi", {static: false}) vasfi: ElementRef;
    @ViewChild("kammi", {static: false}) kammi: ElementRef;

    @Output()
    public toggleComponent = new EventEmitter<boolean>();
    @Input()
    public instance: InstanceModel;
    public instanceList: InstanceModel[];

    public sanjeshData = {};
    public examType = [];
    public examTypeIndex = null;
    public examTypeId = [];

    public citiationReferencesLists = [];//مرجع استناد
    public citiationReferencesListsId = [];//مرجع استناد
    public citiationReferencesListsIndex = null;//مرجع استناد
    public inspectionLevelLists = [];//سطح بازرسی
    public inspectionLevelListsId = [];//سطح بازرسی
    public inspectionLevelListsIndex = null;//سطح بازرسی
    constructor(private instanceService: InstanceService) {
        this.instance = new InstanceModel();


    }

    ngOnInit(): void {
        this.pushDropDownData();
        this.findIndexes(this.instance.examTypeId, this.instance.citiationReferencesId, this.instance.inspectionLevelId);

    }


    pushDropDownData() {
        this.sanjeshData = JSON.parse(appSettings.getString('sanjeshData'));
        this.examType = [];
        this.citiationReferencesLists = [];
        this.inspectionLevelLists = [];

        // @ts-ignore
        for (let item_0 of this.sanjeshData.inspectionCheckLists) {
            for (let item_1 of item_0.checkList.checkListCategorys) {
                this.examType.push(item_1.checkListTitle + '-' + item_1.title);
                this.examTypeId.push(item_1.id);
            }
        }
        // @ts-ignore
        for (let item_1 of this.sanjeshData.citiationReferencesLists) {
            this.citiationReferencesLists.push(item_1.topic);
            this.citiationReferencesListsId.push(item_1.id);
        }
        // @ts-ignore
        for (let item_2 of this.sanjeshData.inspectionLevelLists) {
            this.inspectionLevelLists.push(item_2.topic);
            this.inspectionLevelListsId.push(item_2.id);
        }
    }

    back() {
        this.toggleComponent.emit(false);
    }

    instanceEdit() {
        this.instance = new InstanceModel();
        this.examTypeIndex = null;
        this.citiationReferencesListsIndex = null;
        this.inspectionLevelListsIndex = null;
    }

    onChangeVasfi(){

        this.kammi.nativeElement.checked=false;

    }

    onChangeKammi() {

        this.vasfi.nativeElement.checked = false;

    }

    save() {

        if (this.instance.id > 0) {
            this.instanceService.excute2("update instacneTbl  set instanceValues=? where id=?", [JSON.stringify(this.instance), this.instance.id]).then(id => {
                Toast.makeText('ثبت شد').show();
                this.clearForm();
            }, error => {
                console.log("INSERT ERROR", error);
            });
        } else {

            this.instanceService.excute2("insert into instacneTbl(instanceValues) VALUES (?) ",
                [JSON.stringify(this.instance)]
            ).then(id => {
                Toast.makeText('ثبت شد').show();
                this.clearForm();
            }, error => {
                console.log("INSERT ERROR", error);
            });
        }

    }

    selectAll() {
        this.instanceService.All("SELECT * FROM instacneTbl ins ").then(rows => {
            this.instanceList = [];
            for (var row in rows) {
                this.instanceList.push(
                    JSON.parse(row[1])
                );
            }

        }, error => {
            console.log("SELECT ERROR", error);
        });
    }

    findIndexes(examType, citiation, instanceLevel) {
        if (this.examTypeId.findIndex(obj => obj == examType) > -1) {
            this.examTypeIndex = this.examTypeId.findIndex(obj => obj == examType);
        }
        if (this.citiationReferencesListsId.findIndex(obj => obj == citiation) > -1) {
            this.citiationReferencesListsIndex = this.citiationReferencesListsId.findIndex(obj => obj == citiation);
        }
        if (this.inspectionLevelListsId.findIndex(obj => obj == instanceLevel) > -1) {
            this.inspectionLevelListsIndex = this.inspectionLevelListsId.findIndex(obj => obj == instanceLevel);
        }

    }

    selectedIndexInspectionLevel(args) {
        let picker = <DropDown>args.object;/**/
        this.instance.inspectionLevelId = this.inspectionLevelListsId[picker.selectedIndex];
        this.instance.inspectionLevel = this.inspectionLevelLists[picker.selectedIndex];
    }

    selectedIndexCitiationReferences(args) {
        let picker = <DropDown>args.object;
        this.instance.citiationReferencesId = this.citiationReferencesListsId[picker.selectedIndex];
        this.instance.citiationReferences = this.citiationReferencesLists[picker.selectedIndex];
    }

    selectedIndexExamType(args) {

        let picker = <DropDown>args.object;
        this.instance.examTypeId = this.examTypeId[picker.selectedIndex];
        this.instance.examType = this.examType[picker.selectedIndex];
    }

    clearForm() {
        this.instance = new InstanceModel();
        this.examTypeDropDown.nativeElement.selectedIndex = null;
        this.citiationReferencesDropDown.nativeElement.selectedIndex = null;
        this.inspectionLevelDropDown.nativeElement.selectedIndex = null;
    }

    ngAfterViewInit(): void {
        this.vasfi.nativeElement.checked=true;
    }


}