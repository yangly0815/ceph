import { NgModule } from '@angular/core';

import { AutofocusDirective } from './autofocus.directive';
import { Copy2ClipboardButtonDirective } from './copy2clipboard-button.directive';
import { DimlessBinaryPerSecondDirective } from './dimless-binary-per-second.directive';
import { DimlessBinaryDirective } from './dimless-binary.directive';
import { FormInputDisableDirective } from './form-input-disable.directive';
import { FormLoadingDirective } from './form-loading.directive';
import { FormScopeDirective } from './form-scope.directive';
import { IopsDirective } from './iops.directive';
import { MillisecondsDirective } from './milliseconds.directive';
import { CdFormControlDirective } from './ng-bootstrap-form-validation/cd-form-control.directive';
import { CdFormGroupDirective } from './ng-bootstrap-form-validation/cd-form-group.directive';
import { CdFormValidationDirective } from './ng-bootstrap-form-validation/cd-form-validation.directive';
import { PasswordButtonDirective } from './password-button.directive';
import { StatefulTabDirective } from './stateful-tab.directive';
import { TrimDirective } from './trim.directive';

@NgModule({
  imports: [],
  declarations: [
    AutofocusDirective,
    Copy2ClipboardButtonDirective,
    DimlessBinaryDirective,
    DimlessBinaryPerSecondDirective,
    PasswordButtonDirective,
    TrimDirective,
    MillisecondsDirective,
    IopsDirective,
    FormLoadingDirective,
    StatefulTabDirective,
    FormInputDisableDirective,
    FormScopeDirective,
    CdFormControlDirective,
    CdFormGroupDirective,
    CdFormValidationDirective
  ],
  exports: [
    AutofocusDirective,
    Copy2ClipboardButtonDirective,
    DimlessBinaryDirective,
    DimlessBinaryPerSecondDirective,
    PasswordButtonDirective,
    TrimDirective,
    MillisecondsDirective,
    IopsDirective,
    FormLoadingDirective,
    StatefulTabDirective,
    FormInputDisableDirective,
    FormScopeDirective,
    CdFormControlDirective,
    CdFormGroupDirective,
    CdFormValidationDirective
  ]
})
export class DirectivesModule {}
