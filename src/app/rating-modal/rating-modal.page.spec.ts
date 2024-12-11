import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingModalPage } from './rating-modal.page';

describe('RatingModalPage', () => {
  let component: RatingModalPage;
  let fixture: ComponentFixture<RatingModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
