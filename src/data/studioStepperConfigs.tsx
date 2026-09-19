import type { StepperFormConfig } from '../components/shared/StepperForm';
import type { DynamicFormValues } from '../components/shared/DynamicForm';

export interface StudioStepperPreset {
  data: DynamicFormValues;
  config: StepperFormConfig<DynamicFormValues>;
}

const signupWizardConfig: StepperFormConfig<DynamicFormValues> = {
  mode: 'add',
  size: 'small',
  orientation: 'horizontal',
  columns: 2,
  steps: [
    {
      key: 'account',
      label: 'Account',
      sections: [
        {
          key: 'account-basic',
          columns: 2,
          fields: [
            { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 'full' },
            { name: 'password', label: 'Password', type: 'password', required: true, colSpan: 'full' },
          ],
        },
      ],
    },
    {
      key: 'plan',
      label: 'Plan',
      sections: [
        {
          key: 'plan-info',
          columns: 1,
          fields: [
            {
              name: 'plan',
              label: 'Plan',
              type: 'radio',
              required: true,
              options: [
                { label: 'Starter', value: 'starter' },
                { label: 'Pro', value: 'pro' },
                { label: 'Enterprise', value: 'enterprise' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const checkoutWizardConfig: StepperFormConfig<DynamicFormValues> = {
  mode: 'add',
  size: 'small',
  orientation: 'vertical',
  columns: 2,
  steps: [
    {
      key: 'shipping',
      label: 'Shipping',
      sections: [
        {
          key: 'shipping-info',
          columns: 2,
          fields: [
            { name: 'address', label: 'Address', type: 'text', required: true, colSpan: 'full' },
            { name: 'city', label: 'City', type: 'text', required: true },
            { name: 'zip', label: 'ZIP', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      key: 'payment',
      label: 'Payment',
      sections: [
        {
          key: 'payment-info',
          columns: 2,
          fields: [
            { name: 'cardName', label: 'Name on Card', type: 'text', required: true, colSpan: 'full' },
            { name: 'cardNumber', label: 'Card Number', type: 'text', required: true, colSpan: 'full' },
          ],
        },
      ],
    },
  ],
};

export const STUDIO_STEPPER_PRESETS: Record<string, StudioStepperPreset> = {
  'signup-wizard': { data: {}, config: signupWizardConfig },
  'checkout-wizard': { data: {}, config: checkoutWizardConfig },
};
