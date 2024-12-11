import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestcontratoPage } from './testcontrato.page';

describe('TestcontratoPage', () => {
  let component: TestcontratoPage;
  let fixture: ComponentFixture<TestcontratoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcontratoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
