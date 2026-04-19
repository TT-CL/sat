import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrayFlexContainerComponent } from './gray-flex-container.component';

describe('GrayFlexContainerComponent', () => {
  let component: GrayFlexContainerComponent;
  let fixture: ComponentFixture<GrayFlexContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrayFlexContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrayFlexContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
