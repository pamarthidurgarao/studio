import type { DynamicFormConfig, DynamicFormValues } from '../components/shared/DynamicForm';
import { minLength } from '../components/shared/DynamicForm/validators';

export interface StudioFormPreset {
  data: DynamicFormValues;
  config: DynamicFormConfig<DynamicFormValues>;
}

const employeeFormConfig: DynamicFormConfig<DynamicFormValues> = {
  mode: 'add',
  size: 'small',
  columns: 2,
  sections: [
    {
      key: 'basic',
      title: 'Basic Information',
      columns: 2,
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true, colSpan: 'full' },
      ],
    },
    {
      key: 'role',
      title: 'Role',
      columns: 2,
      fields: [
        {
          name: 'department',
          label: 'Department',
          type: 'dropdown',
          required: true,
          options: [
            { label: 'Engineering', value: 'eng' },
            { label: 'Design', value: 'design' },
            { label: 'Sales', value: 'sales' },
          ],
        },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      ],
    },
  ],
};

const supportTicketFormConfig: DynamicFormConfig<DynamicFormValues> = {
  mode: 'add',
  size: 'small',
  columns: 1,
  sections: [
    {
      key: 'ticket',
      title: 'Support Ticket',
      columns: 1,
      fields: [
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        {
          name: 'priority',
          label: 'Priority',
          type: 'radio',
          required: true,
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          rows: 4,
          required: true,
          validators: [minLength(10)],
          helperText: 'At least 10 characters.',
        },
      ],
    },
  ],
};

export const STUDIO_FORM_PRESETS: Record<string, StudioFormPreset> = {
  'employee-form': { data: {}, config: employeeFormConfig },
  'support-ticket-form': { data: {}, config: supportTicketFormConfig },
};
