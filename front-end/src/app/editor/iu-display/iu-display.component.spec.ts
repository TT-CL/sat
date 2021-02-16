import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IuDisplayComponent } from './iu-display.component';

describe('IuDisplayComponent', () => {
  let component: IuDisplayComponent;
  let fixture: ComponentFixture<IuDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IuDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IuDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
