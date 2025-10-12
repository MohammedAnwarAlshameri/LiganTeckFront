import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  providers: [DecimalPipe]
})
export class IndexComponent {

  // bread crumb items
  breadCrumbItems!: Array<{}>;

  constructor() { }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'Dashboard', active: true }
    ];
  }
}