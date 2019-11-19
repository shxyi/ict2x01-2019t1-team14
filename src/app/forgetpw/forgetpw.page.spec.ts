import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpwPage } from './forgetpw.page';

describe('ForgetpwPage', () => {
  let component: ForgetpwPage;
  let fixture: ComponentFixture<ForgetpwPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetpwPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetpwPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
