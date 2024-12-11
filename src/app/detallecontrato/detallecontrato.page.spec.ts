import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallecontratoPage } from './detallecontrato.page';

describe('DetallecontratoPage', () => {
  let component: DetallecontratoPage;
  let fixture: ComponentFixture<DetallecontratoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallecontratoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
