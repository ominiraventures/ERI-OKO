import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'smart-tag',
  templateUrl: './smart-tag.component.html',
  styleUrls: ['./smart-tag.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('closed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        margin: '0',
        padding: '0'
      })),
      state('open', style({
        opacity: '1'
      })),
      transition(
        'closed=>open',
        animate("200ms")
      ),
      transition(
        'open=>closed',
        animate('200ms ease-out')
      )
    ]),
    trigger('expandCollapse2', [
      state('closed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        margin: '0',
        padding: '0',
      })),
      state('open', style({
        opacity: '1',
        display: 'block'
      })),
      transition(
        'closed=>open',
        animate("200ms")
      ),
      transition(
        'open=>closed',
        animate('200ms ease-out')
      )
    ]),
    trigger('expandCollapse3', [
      state('closed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        margin: '0',
        padding: '0'
      })),
      state('open', style({
        opacity: '1'
      })),
      transition(
        'closed=>open',
        animate("200ms")
      ),
      transition(
        'open=>closed',
        animate('200ms ease-out')
      )
    ]),
    trigger('deleteAnimate', [
      state('active', style({
      })),
      state('deleted', style({
        opacity: '0',
        height: '0',
        minHeight: '0',
        paddingTop: '0',
        paddingBottom: '0',
        marginBottom: '0',
        marginTop: '0'
      })),
      transition(
        'active=>deleted',
        animate("300ms")
      )
    ])
  ]
})
export class SmartTagComponent implements OnInit {

  faImage = faImage;
  constructor() { }

  _isOpen: boolean = false;

  @Input() set isOpen(value: boolean) {
    let oldValue = this._isOpen;
    this._isOpen = value;
    if (value && !oldValue) {
      this.scrollToTarget();
    }
  }

  @Input()
  readOnly?: boolean;

  get isOpen(): boolean {
    return this._isOpen;
  }

  @Input()
  formControlInput?: FormControl;

  @Input()
  disableEdit: boolean = false

  @Input()
  disableDelete: boolean = false

  @Input()
  viewOnly: boolean = false

  @Input()
  disableRowClick: boolean = false

  @Output() onView = new EventEmitter<any>();

  @Output() onEdit = new EventEmitter<any>();

  @Output() onDelete = new EventEmitter<any>();

  ngOnInit() {
  }

  @ViewChild('startTabElementJump', { static: false }) startTabElementJump;
  @ViewChild('startTabElementTarget', { static: false }) startTabElementTarget;
  @ViewChild('endTabElementJump', { static: false }) endTabElementJump;
  @ViewChild('endTabElementTarget', { static: false }) endTabElementTarget;

  onEndFocus() {
    this.startTabElementTarget.nativeElement.focus()
  }

  onStartFocus() {
    this.endTabElementTarget.nativeElement.focus()
  }

  isDisabled() {
    if (this.formControlInput) {
      return this.formControlInput.enabled === false
    }
    return false
  }

  @ViewChild("target", { static: false })
  targetElement: ElementRef<HTMLInputElement>;

  scrollToTarget(n = 10) {
    if (n == 0) {
      // console.log("Cannot find editor element")
      return
    }
    window.setTimeout(() => {
      if (this.targetElement) {   // scrolanje novega podokna v vidno polje
        this.targetElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        this.scrollToTarget(n - 1)
      }
    }, 200)
  }

  deleted = false;

  deleteTriggered(event) {
    this.deleted = true;
  }

  deleteAfterAnimation(event) {
    if (event.fromState === 'active' && event.toState === 'deleted') {
      // if(this.listEditorManager && this.listEditorManagerPosition != null) {
      //     this.listEditorManager.delete(this.listEditorManagerPosition)
      // }
      this.onDelete.next(true)
    }
  }

  showEditableComponent = true;

  @ViewChildren('editComponent') editComponent;
  @ViewChildren('fullTag') fullTag;
  @ViewChildren('editIcon') editIcon;

  startShowEditableComponentAnimation() {
    if (this.editComponent.first.nativeElement.style.display === '') {
      this.editComponent.first.nativeElement.style.display = 'none'
    } else {
      this.editComponent.first.nativeElement.style.display = ''
    }
    // console.log(this.editComponent)
    // if(this.isOpen) this.showEditableComponent = true;
  }
  endShowEditableComponentAnimation() {
    if (this.isOpen) {  // pri keriranju
      this.editComponent.first.nativeElement.style.display = ''
    }
  }

  onEditHandler(trigger) {
    if (this.disableRowClick && trigger === 'fullTag') return;
    let returnFocusElement = trigger === 'fullTag' ? this.fullTag.first.nativeElement : this.editIcon.first.nativeElement
    this.onEdit.next(returnFocusElement);
  }

  onBackdrop() {
    this.scrollToTarget()
  }

}
