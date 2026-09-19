import { useState } from 'react';
import { SelectButton } from 'primereact/selectbutton';
import { DynamicForm } from './DynamicForm';
import type { DynamicFormActionEvent, DynamicFormConfig, FormMode } from './types';
import { maxLength, minLength } from './validators';
import './dynamicForm.css';

interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  age: number | null;
  password: string;
  country: string | null;
  city: string | null;
  skills: string[];
  department: string | null;
  isManager: boolean;
  newsletter: boolean;
  startDate: string | Date | null;
  resume: File | File[] | null;
  satisfaction: number;
  workload: number;
  tags: string[];
  managerName: string;
  notes: string;
}

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'us' },
  { label: 'India', value: 'in' },
  { label: 'Germany', value: 'de' },
];

const CITY_OPTIONS_BY_COUNTRY: Record<string, { label: string; value: string }[]> = {
  us: [
    { label: 'New York', value: 'nyc' },
    { label: 'San Francisco', value: 'sf' },
  ],
  in: [
    { label: 'Bengaluru', value: 'blr' },
    { label: 'Hyderabad', value: 'hyd' },
  ],
  de: [
    { label: 'Berlin', value: 'ber' },
    { label: 'Munich', value: 'muc' },
  ],
};

const initialValues: EmployeeForm = {
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  age: null,
  password: '',
  country: null,
  city: null,
  skills: [],
  department: null,
  isManager: false,
  newsletter: true,
  startDate: null,
  resume: null,
  satisfaction: 3,
  workload: 50,
  tags: [],
  managerName: '',
  notes: '',
};

function buildConfig(mode: FormMode): DynamicFormConfig<EmployeeForm> {
  return {
    mode,
    columns: 2,
    size: 'small',
    title: mode === 'add' ? 'New Employee' : mode === 'edit' ? 'Edit Employee' : 'Employee Details',
    sections: [
      {
        key: 'basic',
        title: 'Basic Information',
        columns: 2,
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 'full' },
          {
            name: 'bio',
            label: 'Bio',
            type: 'textarea',
            rows: 3,
            colSpan: 'full',
            helperText: 'A short summary, up to 200 characters.',
            validators: [maxLength(200)],
          },
          { name: 'age', label: 'Age', type: 'number', min: 16, max: 100 },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: mode === 'add',
            validators: [minLength(8)],
          },
        ],
      },
      {
        key: 'location',
        title: 'Location',
        collapsible: true,
        columns: 2,
        fields: [
          { name: 'country', label: 'Country', type: 'dropdown', options: COUNTRY_OPTIONS, required: true },
          {
            name: 'city',
            label: 'City',
            type: 'dropdown',
            required: true,
            dependsOn: ['country'],
            options: (values) => CITY_OPTIONS_BY_COUNTRY[values.country ?? ''] ?? [],
            disabled: (values) => !values.country,
          },
        ],
      },
      {
        key: 'role',
        title: 'Role & Skills',
        collapsible: true,
        columns: 2,
        fields: [
          {
            name: 'department',
            label: 'Department',
            type: 'dropdown',
            options: [
              { label: 'Engineering', value: 'eng' },
              { label: 'Design', value: 'design' },
              { label: 'Sales', value: 'sales' },
            ],
          },
          {
            name: 'skills',
            label: 'Skills',
            type: 'multiselect',
            options: [
              { label: 'React', value: 'react' },
              { label: 'TypeScript', value: 'ts' },
              { label: 'Node.js', value: 'node' },
              { label: 'SQL', value: 'sql' },
            ],
          },
          { name: 'isManager', label: 'Is Manager', type: 'switch' },
          {
            name: 'managerName',
            label: 'Reports To',
            type: 'text',
            hidden: (values) => values.isManager,
            required: (values) => !values.isManager,
          },
          { name: 'newsletter', label: 'Subscribe to newsletter', type: 'checkbox' },
          { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        ],
      },
      {
        key: 'extra',
        title: 'Additional',
        collapsible: true,
        collapsedByDefault: true,
        columns: 2,
        fields: [
          { name: 'resume', label: 'Resume', type: 'file', accept: '.pdf,.doc,.docx', colSpan: 'full' },
          { name: 'satisfaction', label: 'Satisfaction', type: 'rating' },
          { name: 'workload', label: 'Workload %', type: 'slider', min: 0, max: 100, step: 5 },
          { name: 'tags', label: 'Tags', type: 'chips', colSpan: 'full', helperText: 'Press enter to add a tag.' },
          {
            name: 'notes',
            label: 'Notes (custom renderer)',
            type: 'custom',
            colSpan: 'full',
            render: ({ value, setValue, disabled }) => (
              <textarea
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => setValue(e.target.value)}
                disabled={disabled}
                rows={2}
                style={{ width: '100%', fontFamily: 'inherit' }}
                placeholder="Anything else worth noting..."
              />
            ),
          },
        ],
      },
    ],
  };
}

export function DynamicFormDemo() {
  const [mode, setMode] = useState<FormMode>('add');
  const [values, setValues] = useState<EmployeeForm>(initialValues);
  const [lastSubmit, setLastSubmit] = useState<string>('');

  const handleAction = (event: DynamicFormActionEvent<EmployeeForm>) => {
    switch (event.type) {
      case 'field-change':
        setValues(event.values);
        break;
      case 'submit':
        console.log('submit', event.values, 'valid:', event.isValid, 'errors:', event.errors);
        if (event.isValid) {
          setValues(event.values);
          setLastSubmit(JSON.stringify(event.values, null, 2));
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
    <div style={{ padding: '1rem', maxWidth: '720px' }}>
      <SelectButton
        value={mode}
        onChange={(e) => e.value && setMode(e.value)}
        options={[
          { label: 'Add', value: 'add' },
          { label: 'Edit', value: 'edit' },
          { label: 'View', value: 'view' },
        ]}
        style={{ marginBottom: '1rem' }}
      />
      <DynamicForm<EmployeeForm> data={values} config={buildConfig(mode)} onAction={handleAction} />
      {lastSubmit && (
        <pre style={{ marginTop: '1rem', fontSize: '12px', overflow: 'auto' }}>{lastSubmit}</pre>
      )}
    </div>
  );
}
