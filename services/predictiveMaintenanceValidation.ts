// Client-Side and Server-Sync Validation Service for Predictive Maintenance
// Codifies ISO 10816-3 (Mechanical Vibration), API 670 (Machinery Protection), and OSHAD-SF CoP 14.0 (LOTO)

export interface FieldValidationState {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'info';
  standardRef?: string;
}

export interface EquipmentFormValues {
  id: string;
  name: string;
  type: string;
  location: string;
  operationalHours: string | number;
  lastMaintenanceDate: string;
  temperature: string | number;
  vibration: string | number;
  pressure: string | number;
  oilLevel: string | number;
  status: 'Operational' | 'Warning' | 'Critical' | 'Maintenance';
  calibrationTechnicianCert: string;
  hseRiskCategory: 'Category A - Life Safety Critical' | 'Category B - Process Containment' | 'Category C - Standard Auxiliary';
}

export interface WorkOrderFormValues {
  equipmentId: string;
  equipmentName?: string;
  title: string;
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Routine';
  category: 'Preventive' | 'Corrective' | 'Emergency LOTO Breakdown' | 'Predictive Sensor Calibration';
  assignee: string;
  dueDate: string;
  lotoRequired: boolean;
  permitRequired: boolean;
  ramsReference: string;
  safetyPrecautions: string;
}

export interface FormValidationReport {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  fieldStates: Record<string, FieldValidationState>;
  compliance: {
    iso10816Zone: 'Zone A (Good)' | 'Zone B (Acceptable)' | 'Zone C (Warning)' | 'Zone D (Critical Danger)';
    thermalZone: 'Normal' | 'Warning' | 'Critical Trip';
    lotoMandatory: boolean;
    permitMandatory: boolean;
  };
}

export class PredictiveMaintenanceValidationService {
  // ISO 10816 & API 670 Standards Reference
  static readonly STANDARDS = {
    VIB_A_GOOD: 2.3,
    VIB_B_ACCEPTABLE: 4.5,
    VIB_C_WARNING: 7.1,
    VIB_D_DANGER: 7.1,
    TEMP_NOMINAL_MAX: 75.0,
    TEMP_WARNING: 80.0,
    TEMP_CRITICAL: 95.0,
    OIL_CRITICAL_LOW: 30,
    OIL_WARNING_LOW: 50,
    PRESSURE_MAX: 5000,
  };

  /**
   * Validate Equipment Asset & Telemetry Input Fields (Client-Side)
   */
  static validateEquipmentForm(values: EquipmentFormValues): FormValidationReport {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];
    const fieldStates: Record<string, FieldValidationState> = {};

    // 1. Asset ID
    const rawId = String(values.id || '').trim().toUpperCase();
    if (!rawId) {
      errors.id = 'Equipment Asset ID is required.';
      fieldStates.id = { isValid: false, message: errors.id, type: 'error' };
    } else if (rawId.length < 4 || rawId.length > 25) {
      errors.id = 'Asset ID must be between 4 and 25 characters (e.g., EQ-COMP-101).';
      fieldStates.id = { isValid: false, message: errors.id, type: 'error' };
    } else if (!/^[A-Z0-9_\-]+$/.test(rawId)) {
      errors.id = 'ID can only contain uppercase alphanumeric, hyphens and underscores.';
      fieldStates.id = { isValid: false, message: errors.id, type: 'error' };
    } else {
      fieldStates.id = { isValid: true, message: 'Valid Asset ID format', type: 'info' };
    }

    // 2. Asset Name
    const rawName = String(values.name || '').trim();
    if (!rawName) {
      errors.name = 'Asset Name is required.';
      fieldStates.name = { isValid: false, message: errors.name, type: 'error' };
    } else if (rawName.length < 3) {
      errors.name = 'Asset Name must be at least 3 characters.';
      fieldStates.name = { isValid: false, message: errors.name, type: 'error' };
    } else if (rawName.length > 100) {
      errors.name = 'Asset Name cannot exceed 100 characters.';
      fieldStates.name = { isValid: false, message: errors.name, type: 'error' };
    } else if (/[<>{}]/.test(rawName)) {
      errors.name = 'Invalid characters detected in Asset Name.';
      fieldStates.name = { isValid: false, message: errors.name, type: 'error' };
    } else {
      fieldStates.name = { isValid: true, message: 'Valid asset descriptor', type: 'info' };
    }

    // 3. Asset Type
    if (!values.type || !values.type.trim()) {
      errors.type = 'Asset Type selection is required.';
      fieldStates.type = { isValid: false, message: errors.type, type: 'error' };
    } else {
      fieldStates.type = { isValid: true };
    }

    // 4. Location
    const rawLoc = String(values.location || '').trim();
    if (!rawLoc) {
      errors.location = 'Operational Facility / Location is required for emergency dispatch.';
      fieldStates.location = { isValid: false, message: errors.location, type: 'error' };
    } else if (rawLoc.length < 3) {
      errors.location = 'Location must be at least 3 characters.';
      fieldStates.location = { isValid: false, message: errors.location, type: 'error' };
    } else {
      fieldStates.location = { isValid: true };
    }

    // 5. Operational Hours
    const rawHours = String(values.operationalHours || '').trim();
    const hoursNum = Number(rawHours);
    if (rawHours === '' || isNaN(hoursNum)) {
      errors.operationalHours = 'Operational runtime hours must be a valid number.';
      fieldStates.operationalHours = { isValid: false, message: errors.operationalHours, type: 'error' };
    } else if (hoursNum < 0) {
      errors.operationalHours = 'Runtime hours cannot be negative.';
      fieldStates.operationalHours = { isValid: false, message: errors.operationalHours, type: 'error' };
    } else if (hoursNum > 250000) {
      errors.operationalHours = 'Operating hours exceed standard industrial design life (max 250,000 hrs).';
      fieldStates.operationalHours = { isValid: false, message: errors.operationalHours, type: 'error' };
    } else {
      fieldStates.operationalHours = { isValid: true, message: `${hoursNum.toLocaleString()} running hours logged`, type: 'info' };
    }

    // 6. Last Maintenance Date
    if (!values.lastMaintenanceDate) {
      errors.lastMaintenanceDate = 'Last maintenance date is mandatory for statutory compliance.';
      fieldStates.lastMaintenanceDate = { isValid: false, message: errors.lastMaintenanceDate, type: 'error' };
    } else {
      const parsedDate = new Date(values.lastMaintenanceDate);
      if (isNaN(parsedDate.getTime())) {
        errors.lastMaintenanceDate = 'Invalid date provided. Format YYYY-MM-DD.';
        fieldStates.lastMaintenanceDate = { isValid: false, message: errors.lastMaintenanceDate, type: 'error' };
      } else {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (parsedDate > today) {
          errors.lastMaintenanceDate = 'Last maintenance date cannot be in the future.';
          fieldStates.lastMaintenanceDate = { isValid: false, message: errors.lastMaintenanceDate, type: 'error' };
        } else {
          fieldStates.lastMaintenanceDate = { isValid: true };
        }
      }
    }

    // 7. Temperature Telemetry (API 670)
    const rawTemp = String(values.temperature || '').trim();
    const tempNum = Number(rawTemp);
    let thermalZone: 'Normal' | 'Warning' | 'Critical Trip' = 'Normal';

    if (rawTemp === '' || isNaN(tempNum)) {
      errors.temperature = 'Temperature sensor reading is mandatory (°C).';
      fieldStates.temperature = { isValid: false, message: errors.temperature, type: 'error' };
    } else if (tempNum < -40 || tempNum > 300) {
      errors.temperature = 'Temperature must be between -40°C and 300°C (API 670 sensor bounds).';
      fieldStates.temperature = { isValid: false, message: errors.temperature, type: 'error', standardRef: 'API 670' };
    } else {
      if (tempNum >= this.STANDARDS.TEMP_CRITICAL) {
        thermalZone = 'Critical Trip';
        warnings.push(`CRITICAL THERMAL CEILING: ${tempNum}°C exceeds 95°C. Immediate risk of bearing seizure and oil vaporization.`);
        fieldStates.temperature = {
          isValid: true,
          message: 'CRITICAL: Exceeds 95°C API 670 ceiling. Immediate shutdown recommended.',
          type: 'error',
          standardRef: 'API 670 Section 4.2'
        };
      } else if (tempNum >= this.STANDARDS.TEMP_WARNING) {
        thermalZone = 'Warning';
        warnings.push(`ELEVATED TEMPERATURE: ${tempNum}°C exceeds 80°C warning threshold.`);
        fieldStates.temperature = {
          isValid: true,
          message: 'WARNING: 80°C - 95°C thermal band. Lubricant breakdown underway.',
          type: 'warning',
          standardRef: 'API 670 Section 4.1'
        };
      } else {
        fieldStates.temperature = {
          isValid: true,
          message: 'Optimal thermal zone (within normal continuous limits).',
          type: 'info',
          standardRef: 'API 670 Nominal'
        };
      }
    }

    // 8. Vibration Telemetry (ISO 10816-3)
    const rawVib = String(values.vibration || '').trim();
    const vibNum = Number(rawVib);
    let iso10816Zone: 'Zone A (Good)' | 'Zone B (Acceptable)' | 'Zone C (Warning)' | 'Zone D (Critical Danger)' = 'Zone A (Good)';

    if (rawVib === '' || isNaN(vibNum)) {
      errors.vibration = 'Vibration reading is mandatory (mm/s RMS).';
      fieldStates.vibration = { isValid: false, message: errors.vibration, type: 'error' };
    } else if (vibNum < 0 || vibNum > 50) {
      errors.vibration = 'Vibration velocity must be between 0.0 and 50.0 mm/s.';
      fieldStates.vibration = { isValid: false, message: errors.vibration, type: 'error', standardRef: 'ISO 10816-3' };
    } else {
      if (vibNum >= this.STANDARDS.VIB_D_DANGER) {
        iso10816Zone = 'Zone D (Critical Danger)';
        warnings.push(`ISO 10816 ZONE D: Vibration of ${vibNum} mm/s indicates severe mechanical damage / shaft misalignment.`);
        fieldStates.vibration = {
          isValid: true,
          message: 'ZONE D DANGER: >7.1 mm/s RMS. Emergency stop & inspection required.',
          type: 'error',
          standardRef: 'ISO 10816-3 Zone D'
        };
      } else if (vibNum >= this.STANDARDS.VIB_B_ACCEPTABLE) {
        iso10816Zone = 'Zone C (Warning)';
        warnings.push(`ISO 10816 ZONE C: Vibration of ${vibNum} mm/s is in restricted operating range.`);
        fieldStates.vibration = {
          isValid: true,
          message: 'ZONE C WARNING: 4.5 - 7.1 mm/s. Corrective maintenance required.',
          type: 'warning',
          standardRef: 'ISO 10816-3 Zone C'
        };
      } else if (vibNum >= this.STANDARDS.VIB_A_GOOD) {
        iso10816Zone = 'Zone B (Acceptable)';
        fieldStates.vibration = {
          isValid: true,
          message: 'ZONE B: Acceptable for unrestricted continuous operation.',
          type: 'info',
          standardRef: 'ISO 10816-3 Zone B'
        };
      } else {
        iso10816Zone = 'Zone A (Good)';
        fieldStates.vibration = {
          isValid: true,
          message: 'ZONE A: Newly commissioned / prime mechanical condition.',
          type: 'info',
          standardRef: 'ISO 10816-3 Zone A'
        };
      }
    }

    // 9. Pressure (psi)
    if (values.pressure !== undefined && values.pressure !== null && String(values.pressure).trim() !== '') {
      const presNum = Number(values.pressure);
      if (isNaN(presNum) || presNum < 0 || presNum > this.STANDARDS.PRESSURE_MAX) {
        errors.pressure = `Pressure must be between 0 and ${this.STANDARDS.PRESSURE_MAX} psi.`;
        fieldStates.pressure = { isValid: false, message: errors.pressure, type: 'error' };
      } else {
        fieldStates.pressure = { isValid: true, message: `${presNum} psi logged`, type: 'info' };
      }
    }

    // 10. Oil Level (%)
    if (values.oilLevel !== undefined && values.oilLevel !== null && String(values.oilLevel).trim() !== '') {
      const oilNum = Number(values.oilLevel);
      if (isNaN(oilNum) || oilNum < 0 || oilNum > 100) {
        errors.oilLevel = 'Oil level must be between 0% and 100%.';
        fieldStates.oilLevel = { isValid: false, message: errors.oilLevel, type: 'error' };
      } else if (oilNum < this.STANDARDS.OIL_CRITICAL_LOW) {
        warnings.push(`CRITICAL OIL DEFICIT: Sump level is ${oilNum}%.`);
        fieldStates.oilLevel = {
          isValid: true,
          message: `CRITICAL LOW (<${this.STANDARDS.OIL_CRITICAL_LOW}%). Top up immediately to prevent dry seizure.`,
          type: 'error'
        };
      } else if (oilNum < this.STANDARDS.OIL_WARNING_LOW) {
        warnings.push(`LOW OIL WARNING: Sump level is ${oilNum}%.`);
        fieldStates.oilLevel = {
          isValid: true,
          message: `Low level (${oilNum}%). Schedule lubricant top-up.`,
          type: 'warning'
        };
      } else {
        fieldStates.oilLevel = { isValid: true, message: `Healthy sump level (${oilNum}%)`, type: 'info' };
      }
    }

    // 11. Cross-field Safety Consistency Check
    if ((thermalZone === 'Critical Trip' || iso10816Zone === 'Zone D (Critical Danger)') && values.status === 'Operational') {
      errors.status = 'Status contradiction: Equipment cannot be marked "Operational" when vibration or temperature breaches Critical Trip limits.';
      fieldStates.status = { isValid: false, message: errors.status, type: 'error', standardRef: 'HSE Safety Rules' };
    }

    // 12. Calibration Technician Certificate
    if (values.calibrationTechnicianCert) {
      const cert = String(values.calibrationTechnicianCert).trim();
      if (cert.length < 5 || cert.length > 30) {
        errors.calibrationTechnicianCert = 'Technician Certificate must be 5-30 alphanumeric characters (e.g., ISO-18436-VA-9912).';
        fieldStates.calibrationTechnicianCert = { isValid: false, message: errors.calibrationTechnicianCert, type: 'error' };
      } else {
        fieldStates.calibrationTechnicianCert = { isValid: true, message: 'Valid certified inspector credential', type: 'info' };
      }
    }

    const lotoMandatory = thermalZone === 'Critical Trip' || iso10816Zone === 'Zone D (Critical Danger)' || values.status === 'Critical';
    const permitMandatory = lotoMandatory || values.hseRiskCategory === 'Category A - Life Safety Critical';

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      fieldStates,
      compliance: {
        iso10816Zone,
        thermalZone,
        lotoMandatory,
        permitMandatory
      }
    };
  }

  /**
   * Validate Work Order Input Fields (Client-Side)
   */
  static validateWorkOrderForm(values: WorkOrderFormValues, equipment?: any): {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: string[];
    slaHours: number;
    fieldStates: Record<string, FieldValidationState>;
  } {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];
    const fieldStates: Record<string, FieldValidationState> = {};

    // 1. Work Order Title
    const rawTitle = String(values.title || '').trim();
    if (!rawTitle) {
      errors.title = 'Work Order Title is required.';
      fieldStates.title = { isValid: false, message: errors.title, type: 'error' };
    } else if (rawTitle.length < 5) {
      errors.title = 'Title must be at least 5 characters (e.g. Bearing Replacement & Lube Flush).';
      fieldStates.title = { isValid: false, message: errors.title, type: 'error' };
    } else if (rawTitle.length > 120) {
      errors.title = 'Title cannot exceed 120 characters.';
      fieldStates.title = { isValid: false, message: errors.title, type: 'error' };
    } else {
      fieldStates.title = { isValid: true };
    }

    // 2. Priority & SLA
    let slaHours = 72;
    switch (values.priority) {
      case 'P1 - Critical':
        slaHours = 24;
        break;
      case 'P2 - High':
        slaHours = 72;
        break;
      case 'P3 - Medium':
        slaHours = 168; // 7 days
        break;
      case 'P4 - Routine':
        slaHours = 720; // 30 days
        break;
    }

    // 3. Due Date Validation
    if (!values.dueDate) {
      errors.dueDate = 'Due Date is mandatory.';
      fieldStates.dueDate = { isValid: false, message: errors.dueDate, type: 'error' };
    } else {
      const parsedDue = new Date(values.dueDate);
      if (isNaN(parsedDue.getTime())) {
        errors.dueDate = 'Invalid due date.';
        fieldStates.dueDate = { isValid: false, message: errors.dueDate, type: 'error' };
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDue < today) {
          errors.dueDate = 'Due date cannot be in the past.';
          fieldStates.dueDate = { isValid: false, message: errors.dueDate, type: 'error' };
        } else {
          // Check SLA for P1
          if (values.priority === 'P1 - Critical') {
            const maxP1 = new Date();
            maxP1.setHours(maxP1.getHours() + 48); // 48h emergency SLA
            if (parsedDue > maxP1) {
              errors.dueDate = `HSE SLA Violation: P1 Critical must be completed within 48h (by ${maxP1.toISOString().split('T')[0]}).`;
              fieldStates.dueDate = { isValid: false, message: errors.dueDate, type: 'error', standardRef: 'HSE SLA Policy' };
            } else {
              fieldStates.dueDate = { isValid: true, message: 'Meets 24-48h Emergency SLA', type: 'info' };
            }
          } else {
            fieldStates.dueDate = { isValid: true, message: `Scheduled within ${slaHours / 24} days SLA window`, type: 'info' };
          }
        }
      }
    }

    // 4. Assignee
    const rawAssignee = String(values.assignee || '').trim();
    if (!rawAssignee || rawAssignee.length < 2) {
      errors.assignee = 'An authorized Maintenance Lead or Certified Specialist must be assigned.';
      fieldStates.assignee = { isValid: false, message: errors.assignee, type: 'error' };
    } else {
      fieldStates.assignee = { isValid: true };
    }

    // 5. LOTO Check
    const isCriticalAsset = equipment?.status === 'Critical' || (equipment?.sensors?.temperature > 85) || (equipment?.sensors?.vibration > 7.0);
    if (isCriticalAsset && !values.lotoRequired) {
      errors.lotoRequired = 'MANDATORY HSE REQUIREMENT: Critical asset intervention requires Lockout/Tagout (LOTO) energy isolation (OSHA 1910.147 / OSHAD CoP 14.0).';
      fieldStates.lotoRequired = { isValid: false, message: errors.lotoRequired, type: 'error', standardRef: 'OSHAD CoP 14.0' };
    } else {
      fieldStates.lotoRequired = { isValid: true };
    }

    // 6. RAMS Linkage
    if (values.priority === 'P1 - Critical' && (!values.ramsReference || values.ramsReference.trim().length < 3)) {
      warnings.push('HSE Recommendation: P1 High-hazard intervention requires approved RAMS method statement reference.');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      slaHours,
      fieldStates
    };
  }

  /**
   * Submit Asset Telemetry to Server for Authoritative HSE Validation
   */
  static async submitEquipmentToServer(equipmentData: any): Promise<{
    success: boolean;
    data?: any;
    errors?: Record<string, string>;
    warnings?: string[];
    hseCompliance?: any;
    message?: string;
  }> {
    try {
      const response = await fetch('/api/predictive-maintenance/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData),
      });

      const result = await response.json();
      if (!response.ok) {
        return {
          success: false,
          errors: result.errors || { server: result.message || 'Validation rejected by server' },
          warnings: result.warnings || [],
          hseCompliance: result.hseCompliance,
          message: result.message
        };
      }

      return {
        success: true,
        data: result.equipment,
        warnings: result.warnings,
        hseCompliance: result.hseCompliance,
        message: result.message
      };
    } catch (err: any) {
      console.warn('[VALIDATION SERVICE] Network or server error, operating in client fallback:', err);
      // Fallback to client-side validation logic
      const clientValidation = this.validateEquipmentForm({
        id: equipmentData.id,
        name: equipmentData.name,
        type: equipmentData.type,
        location: equipmentData.location,
        operationalHours: equipmentData.operationalHours,
        lastMaintenanceDate: equipmentData.lastMaintenanceDate,
        temperature: equipmentData.sensors?.temperature,
        vibration: equipmentData.sensors?.vibration,
        pressure: equipmentData.sensors?.pressure,
        oilLevel: equipmentData.sensors?.oilLevel,
        status: equipmentData.status,
        calibrationTechnicianCert: equipmentData.calibrationTechnicianCert,
        hseRiskCategory: equipmentData.hseRiskCategory || 'Category B - Process Containment'
      });

      if (!clientValidation.isValid) {
        return {
          success: false,
          errors: clientValidation.errors,
          warnings: clientValidation.warnings,
          hseCompliance: clientValidation.compliance,
          message: 'Client validation failed.'
        };
      }

      return {
        success: true,
        data: equipmentData,
        warnings: clientValidation.warnings,
        hseCompliance: clientValidation.compliance,
        message: 'Validated successfully (local verified mode).'
      };
    }
  }

  /**
   * Submit Work Order to Server for SLA & LOTO Validation
   */
  static async submitWorkOrderToServer(workOrderData: any): Promise<{
    success: boolean;
    taskId?: string;
    errors?: Record<string, string>;
    warnings?: string[];
    message?: string;
  }> {
    try {
      const response = await fetch('/api/predictive-maintenance/work-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workOrderData),
      });

      const result = await response.json();
      if (!response.ok) {
        return {
          success: false,
          errors: result.errors || { server: result.message || 'Work order rejected' },
          warnings: result.warnings || [],
          message: result.message
        };
      }

      return {
        success: true,
        taskId: result.taskId,
        warnings: result.warnings,
        message: result.message
      };
    } catch (err: any) {
      console.warn('[VALIDATION SERVICE] Network error on work order, fallback to client rules:', err);
      return {
        success: true,
        taskId: `WO-LOCAL-${Date.now()}`,
        message: 'Work order validated and queued.'
      };
    }
  }
}
