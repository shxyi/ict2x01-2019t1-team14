import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnConquerPage } from './btn-conquer.page';

describe('BtnConquerPage', () => {
  let component: BtnConquerPage;
  let fixture: ComponentFixture<BtnConquerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtnConquerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnConquerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
