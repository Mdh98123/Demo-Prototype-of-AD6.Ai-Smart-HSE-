import React from 'react';
import { ControlOfWorkModule } from './controlOfWork/ControlOfWorkModule';

interface PermitFormProps {
  initialView?: 'List' | 'Create';
  initialPermitId?: string;
  [key: string]: any;
}

export const PermitForm: React.FC<PermitFormProps> = ({ initialPermitId }) => {
  return <ControlOfWorkModule initialPermitId={initialPermitId} />;
};

export default PermitForm;
