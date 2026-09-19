import { useState } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { StepperForm } from './StepperForm';
import type { StepperFormActionEvent, StepperFormConfig, StepperOrientation } from './types';
import { minLength } from '../DynamicForm/validators';
import '../DynamicForm/dynamicForm.css';
import './stepperForm.css';

interface Signup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  plan: string | null;
  seats: number | null;
  addOns: string[];
  companyName: string;
  companySize: string | null;
  billingCycle: string | null;
  agreeToTerms: boolean;
}

const initialValues: Signup = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  plan: null,
  seats: null,
  addOns: [],
  companyName: '',
  companySize: null,
  billingCycle: null,
  agreeToTerms: false,
};

function buildConfig(orientation: StepperOrientation): StepperFormConfig<Signup> {
  return {
    mode: 'add',
    orientation,
    linear: true,
    columns: 2,
    size: 'medium',
    title: 'Create your account',
    steps: [
      {
        key: 'account',
        label: 'Account',
        description: 'Your login details',
        sections: [
          {
            key: 'account-basic',
            columns: 2,
            fields: [
              { name: 'firstName', label: 'First Name', type: 'text', required: true },
              { name: 'lastName', label: 'Last Name', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 'full' },
              {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true,
                colSpan: 'full',
                validators: [minLength(8)],
                helperText: 'At least 8 characters.',
              },
            ],
          },
        ],
      },
      {
        key: 'company',
        label: 'Company',
        description: 'Tell us about your team',
        sections: [
          {
            key: 'company-info',
            columns: 2,
            fields: [
              { name: 'companyName', label: 'Company Name', type: 'text', required: true, colSpan: 'full' },
              {
                name: 'companySize',
                label: 'Company Size',
                type: 'dropdown',
                required: true,
                options: [
                  { label: '1-10', value: 'small' },
                  { label: '11-50', value: 'medium' },
                  { label: '51+', value: 'large' },
                ],
              },
              {
                name: 'seats',
                label: 'Seats Needed',
                type: 'number',
                min: 1,
                max: 500,
                required: true,
              },
            ],
          },
        ],
      },
      {
        key: 'plan',
        label: 'Plan',
        description: 'Choose your plan',
        sections: [
          {
            key: 'plan-info',
            columns: 2,
            fields: [
              {
                name: 'plan',
                label: 'Plan',
                type: 'radio',
                required: true,
                colSpan: 'full',
                options: [
                  { label: 'Starter', value: 'starter' },
                  { label: 'Pro', value: 'pro' },
                  { label: 'Enterprise', value: 'enterprise' },
                ],
              },
              {
                name: 'billingCycle',
                label: 'Billing Cycle',
                type: 'dropdown',
                required: true,
                options: [
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Yearly (save 20%)', value: 'yearly' },
                ],
              },
              {
                name: 'addOns',
                label: 'Add-ons',
                type: 'multiselect',
                options: [
                  { label: 'Priority Support', value: 'support' },
                  { label: 'Advanced Analytics', value: 'analytics' },
                  { label: 'SSO', value: 'sso' },
                ],
              },
            ],
          },
        ],
      },
      {
        key: 'review',
        label: 'Review',
        description: 'Confirm & submit',
        sections: [
          {
            key: 'review-confirm',
            columns: 1,
            fields: [
              {
                name: 'agreeToTerms',
                label: 'I agree to the Terms of Service',
                type: 'checkbox',
                required: true,
                validate: (value) => (value ? undefined : 'You must agree to continue.'),
              },
            ],
          },
        ],
      },
    ],
  };
}

export function StepperFormDemo() {
  const [orientation, setOrientation] = useState<StepperOrientation>('horizontal');
  const [values, setValues] = useState<Signup>(initialValues);
  const [result, setResult] = useState('');

  const handleAction = (event: StepperFormActionEvent<Signup>) => {
    switch (event.type) {
      case 'field-change':
        setValues(event.values);
        break;
      case 'step-change':
        console.log('step change', event.fromIndex, '->', event.toIndex);
        break;
      case 'submit':
        console.log('submit', event.values, 'valid:', event.isValid, 'errors:', event.errors);
        if (event.isValid) {
          setValues(event.values);
          setResult(JSON.stringify(event.values, null, 2));
        }
        break;
      case 'cancel':
        console.log('cancel');
        break;
      case 'file-select':
        console.log('file select', event.name, event.files);
        break;
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '820px' }}>
      <SelectButton
        value={orientation}
        onChange={(e) => e.value && setOrientation(e.value)}
        options={[
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' },
        ]}
        style={{ marginBottom: '1rem' }}
      />
      <StepperForm<Signup> data={values} config={buildConfig(orientation)} onAction={handleAction} />
      {result && <pre style={{ marginTop: '1rem', fontSize: '12px', overflow: 'auto' }}>{result}</pre>}
    </div>
  );
}
