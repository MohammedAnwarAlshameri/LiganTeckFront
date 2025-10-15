import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSearchComponent } from './subscription-search.component';

describe('SubscriptionSearchComponent', () => {
  let component: SubscriptionSearchComponent;
  let fixture: ComponentFixture<SubscriptionSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
