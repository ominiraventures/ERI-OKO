import { Component, OnInit, Input } from '@angular/core';
import { TabCommunicationService } from 'src/app/shared/tab-communication.service';

@Component({
  selector: 'app-authorised-layout',
  templateUrl: './authorised-layout.component.html',
  styleUrls: ['./authorised-layout.component.scss']
})
export class AuthorisedLayoutComponent implements OnInit {

  @Input()
  returnUrl: string = null;

  tabCommunicationService: TabCommunicationService;

  constructor() {
    this.tabCommunicationService = new TabCommunicationService();
  }

  ngOnInit(): void {
  }

}
