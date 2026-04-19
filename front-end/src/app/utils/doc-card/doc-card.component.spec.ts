import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocCardComponent } from './doc-card.component';

describe('DocCardComponent', () => {
  let component: DocCardComponent;
  let fixture: ComponentFixture<DocCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
