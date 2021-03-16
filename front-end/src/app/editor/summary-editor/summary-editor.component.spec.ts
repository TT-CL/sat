import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryEditorComponent } from './summary-editor.component';

describe('SummaryEditorComponent', () => {
  let component: SummaryEditorComponent;
  let fixture: ComponentFixture<SummaryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
