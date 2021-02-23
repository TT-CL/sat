import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryLinkComponent } from './summary-link.component';

describe('SummaryLinkComponent', () => {
  let component: SummaryLinkComponent;
  let fixture: ComponentFixture<SummaryLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
