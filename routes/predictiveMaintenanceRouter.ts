import { Router, Request, Response } from 'express';

export const predictiveMaintenanceRouter = Router();

// ============================================================================
// HSE & ISO STANDARDS CONFIGURATION FOR ASSET INTEGRITY
// ============================================================================
export const HSE_STANDARDS = {
  // ISO 10816-3 Mechanical Vibration Limits (Velocity RMS in mm/s for Industrial Machines)
  VIBRATION: {
    MIN: 0.0,
    MAX: 50.0,
    ZONE_A_GOOD: 2.3,       // Class I/II newly commissioned
    ZONE_B_ACCEPTABLE: 4.5, // Unrestricted continuous operation
    ZONE_C_WARNING: 7.1,    // Restricted operation; action required
    ZONE_D_DANGER: 7.1,     // Trip / emergency shutdown threshold
  },
  // API 670 / IEC 60079 Machinery Protection & Temperature Ceilings
  TEMPERATURE: {
    MIN: -40.0,
    MAX: 300.0,
    NOMINAL_MAX: 75.0,
    WARNING_THRESHOLD: 80.0, // Bearing lubricant breakdown threshold
    CRITICAL_CEILING: 95.0,  // Mandatory equipment trip & LOTO isolation
  },
  // Hydraulic & Pneumatic Pressure Limits (psi)
  PRESSURE: {
    MIN: 0.0,
    MAX: 5000.0,
    HIGH_HAZARD_THRESHOLD: 150.0, // High-energy containment risk
  },
  // Lubrication Sump Level (%)
  OIL_LEVEL: {
    MIN: 0.0,
    MAX: 100.0,
    CRITICAL_LOW: 30.0,
    WARNING_LOW: 50.0,
  },
  // Operational Hours
  OPERATIONAL_HOURS: {
    MIN: 0,
    MAX: 250000,
  },
  APPROVED_EQUIPMENT_TYPES: [
    'Compressor',
    'Pump',
    'Generator',
    'Turbine',
    'Centrifuge',
    'Boiler',
    'Crane',
    'Excavator',
    'Conveyor',
    'Heat Exchanger',
    'Motor',
    'Transformer',
    'Fan / Blower',
    'Extruder',
    'Valve Skid'
  ],
  APPROVED_STATUSES: ['Operational', 'Warning', 'Critical', 'Maintenance'],
  APPROVED_PRIORITIES: ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Routine']
};

export interface EquipmentValidationInput {
  id: string;
  name: string;
  type: string;
  location: string;
  operationalHours: number;
  lastMaintenanceDate: string;
  sensors: {
    temperature: number;
    vibration: number;
    pressure?: number;
    oilLevel?: number;
  };
  status: 'Operational' | 'Warning' | 'Critical' | 'Maintenance';
  calibrationTechnicianCert?: string;
  hseRiskCategory?: 'Category A - Life Safety Critical' | 'Category B - Process Containment' | 'Category C - Standard Auxiliary';
}

export interface WorkOrderValidationInput {
  equipmentId: string;
  title: string;
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Routine';
  category: 'Preventive' | 'Corrective' | 'Emergency LOTO Breakdown' | 'Predictive Sensor Calibration';
  assignee: string;
  dueDate: string;
  lotoRequired: boolean;
  permitRequired: boolean;
  ramsReference?: string;
  safetyPrecautions?: string;
}

// ----------------------------------------------------------------------------
// SERVER-SIDE VALIDATION LOGIC FOR EQUIPMENT & SENSOR TELEMETRY
// ----------------------------------------------------------------------------
export function validateEquipmentPayload(data: any): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  hseCompliance: {
    iso10816Zone: 'Zone A (Good)' | 'Zone B (Acceptable)' | 'Zone C (Warning)' | 'Zone D (Critical Danger)';
    thermalCeilingExceeded: boolean;
    lotoMandatory: boolean;
    complianceStatus: 'Fully Compliant' | 'Non-Compliant' | 'Requires Investigation';
  };
  sanitizedData?: EquipmentValidationInput;
} {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // 1. Equipment ID Validation
  if (!data.id || typeof data.id !== 'string') {
    errors.id = 'Equipment Asset ID is mandatory.';
  } else {
    const trimmedId = data.id.trim().toUpperCase();
    if (trimmedId.length < 4 || trimmedId.length > 25) {
      errors.id = 'Equipment ID must be between 4 and 25 characters.';
    } else if (!/^[A-Z0-9_\-]+$/.test(trimmedId)) {
      errors.id = 'Equipment ID may only contain uppercase letters, numbers, hyphens, and underscores (e.g., EQ-COMP-101).';
    }
  }

  // 2. Equipment Name Validation
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Asset Name is required.';
  } else {
    const trimmedName = data.name.trim();
    if (trimmedName.length < 3) {
      errors.name = 'Asset Name must be at least 3 characters long.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Asset Name cannot exceed 100 characters.';
    } else if (/[<>{}]/.test(trimmedName)) {
      errors.name = 'Asset Name contains invalid or unsafe characters.';
    }
  }

  // 3. Equipment Type Validation
  if (!data.type || typeof data.type !== 'string') {
    errors.type = 'Asset Type is required.';
  } else if (!HSE_STANDARDS.APPROVED_EQUIPMENT_TYPES.includes(data.type.trim())) {
    errors.type = `Invalid Equipment Type. Must be one of approved industrial classes: ${HSE_STANDARDS.APPROVED_EQUIPMENT_TYPES.slice(0, 5).join(', ')}...`;
  }

  // 4. Operational Location Validation
  if (!data.location || typeof data.location !== 'string') {
    errors.location = 'Operational Facility / Location is required for emergency dispatch.';
  } else {
    const trimmedLoc = data.location.trim();
    if (trimmedLoc.length < 3) {
      errors.location = 'Location name must be at least 3 characters.';
    } else if (trimmedLoc.length > 120) {
      errors.location = 'Location cannot exceed 120 characters.';
    }
  }

  // 5. Operational Hours Validation
  const opHours = Number(data.operationalHours);
  if (data.operationalHours === undefined || data.operationalHours === null || isNaN(opHours)) {
    errors.operationalHours = 'Operational runtime hours must be a valid number.';
  } else if (!Number.isFinite(opHours)) {
    errors.operationalHours = 'Operational hours must be a finite number.';
  } else if (opHours < HSE_STANDARDS.OPERATIONAL_HOURS.MIN) {
    errors.operationalHours = 'Operational runtime hours cannot be negative.';
  } else if (opHours > HSE_STANDARDS.OPERATIONAL_HOURS.MAX) {
    errors.operationalHours = `Operational hours exceed realistic design lifespan (${HSE_STANDARDS.OPERATIONAL_HOURS.MAX.toLocaleString()} hrs).`;
  }

  // 6. Last Maintenance Date Validation
  if (!data.lastMaintenanceDate || typeof data.lastMaintenanceDate !== 'string') {
    errors.lastMaintenanceDate = 'Last maintenance date is mandatory for statutory compliance.';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.lastMaintenanceDate.trim())) {
      errors.lastMaintenanceDate = 'Date must be formatted as YYYY-MM-DD.';
    } else {
      const parsedDate = new Date(data.lastMaintenanceDate);
      if (isNaN(parsedDate.getTime())) {
        errors.lastMaintenanceDate = 'Invalid calendar date provided.';
      } else {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (parsedDate > today) {
          errors.lastMaintenanceDate = 'Last maintenance date cannot be in the future.';
        }
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (parsedDate < tenYearsAgo) {
          errors.lastMaintenanceDate = 'Last maintenance date cannot be older than 10 years per statutory asset retention.';
        }
      }
    }
  }

  // 7. Sensor Telemetry Validation (HSE & ISO Standards)
  if (!data.sensors || typeof data.sensors !== 'object') {
    errors.sensors = 'Sensor telemetry object is required.';
  }

  // 7a. Temperature (°C)
  const temp = Number(data.sensors?.temperature);
  if (data.sensors?.temperature === undefined || isNaN(temp)) {
    errors['sensors.temperature'] = 'Temperature sensor reading is mandatory (°C).';
  } else if (temp < HSE_STANDARDS.TEMPERATURE.MIN || temp > HSE_STANDARDS.TEMPERATURE.MAX) {
    errors['sensors.temperature'] = `Temperature must be between ${HSE_STANDARDS.TEMPERATURE.MIN}°C and ${HSE_STANDARDS.TEMPERATURE.MAX}°C (API 670 Standard).`;
  } else {
    if (temp >= HSE_STANDARDS.TEMPERATURE.CRITICAL_CEILING) {
      warnings.push(`CRITICAL THERMAL ALERT: ${temp}°C exceeds API 670 maximum allowable bearing temperature (${HSE_STANDARDS.TEMPERATURE.CRITICAL_CEILING}°C). Imminent seizure risk.`);
    } else if (temp >= HSE_STANDARDS.TEMPERATURE.WARNING_THRESHOLD) {
      warnings.push(`ELEVATED TEMPERATURE: ${temp}°C is within warning band (${HSE_STANDARDS.TEMPERATURE.WARNING_THRESHOLD}°C - ${HSE_STANDARDS.TEMPERATURE.CRITICAL_CEILING}°C). Lubricant viscosity degradation likely.`);
    }
  }

  // 7b. Vibration Velocity (mm/s RMS)
  const vib = Number(data.sensors?.vibration);
  if (data.sensors?.vibration === undefined || isNaN(vib)) {
    errors['sensors.vibration'] = 'Vibration sensor reading is mandatory (mm/s RMS).';
  } else if (vib < HSE_STANDARDS.VIBRATION.MIN || vib > HSE_STANDARDS.VIBRATION.MAX) {
    errors['sensors.vibration'] = `Vibration velocity must be between ${HSE_STANDARDS.VIBRATION.MIN} and ${HSE_STANDARDS.VIBRATION.MAX} mm/s (ISO 10816-3).`;
  } else {
    if (vib >= HSE_STANDARDS.VIBRATION.ZONE_D_DANGER) {
      warnings.push(`ISO 10816 ZONE D DANGER: Vibration of ${vib} mm/s exceeds 7.1 mm/s. Immediate structural damage or catastrophic shaft failure hazard.`);
    } else if (vib >= HSE_STANDARDS.VIBRATION.ZONE_B_ACCEPTABLE) {
      warnings.push(`ISO 10816 ZONE C WARNING: Vibration of ${vib} mm/s exceeds 4.5 mm/s acceptable limit. Mechanical looseness or imbalance detected.`);
    }
  }

  // 7c. Pressure (psi) - Optional but validated if provided
  let pres: number | undefined = undefined;
  if (data.sensors?.pressure !== undefined && data.sensors?.pressure !== null && data.sensors?.pressure !== '') {
    pres = Number(data.sensors.pressure);
    if (isNaN(pres) || pres < HSE_STANDARDS.PRESSURE.MIN || pres > HSE_STANDARDS.PRESSURE.MAX) {
      errors['sensors.pressure'] = `Pressure must be between ${HSE_STANDARDS.PRESSURE.MIN} and ${HSE_STANDARDS.PRESSURE.MAX} psi.`;
    }
  }

  // 7d. Oil Level (%) - Optional but validated if provided
  let oil: number | undefined = undefined;
  if (data.sensors?.oilLevel !== undefined && data.sensors?.oilLevel !== null && data.sensors?.oilLevel !== '') {
    oil = Number(data.sensors.oilLevel);
    if (isNaN(oil) || oil < HSE_STANDARDS.OIL_LEVEL.MIN || oil > HSE_STANDARDS.OIL_LEVEL.MAX) {
      errors['sensors.oilLevel'] = `Oil level must be a percentage between ${HSE_STANDARDS.OIL_LEVEL.MIN}% and ${HSE_STANDARDS.OIL_LEVEL.MAX}%.`;
    } else if (oil < HSE_STANDARDS.OIL_LEVEL.CRITICAL_LOW) {
      warnings.push(`LOW OIL WARNING: Sump level is ${oil}% (below ${HSE_STANDARDS.OIL_LEVEL.CRITICAL_LOW}% critical threshold). Dry-friction bearing failure imminent.`);
    }
  }

  // 8. Status Validation
  if (!data.status || !HSE_STANDARDS.APPROVED_STATUSES.includes(data.status)) {
    errors.status = `Status must be one of: ${HSE_STANDARDS.APPROVED_STATUSES.join(', ')}.`;
  } else {
    // Cross-field validation: Status must reflect critical telemetry
    if ((temp >= HSE_STANDARDS.TEMPERATURE.CRITICAL_CEILING || vib >= HSE_STANDARDS.VIBRATION.ZONE_D_DANGER) && data.status === 'Operational') {
      errors.status = `HSE Safety Inconsistency: Asset status cannot be "Operational" when temperature (${temp}°C) or vibration (${vib} mm/s) exceeds Critical safety trip levels.`;
    }
  }

  // 9. Calibration Technician Certificate (Mandatory for calibrated updates)
  if (data.calibrationTechnicianCert) {
    const cert = String(data.calibrationTechnicianCert).trim();
    if (cert.length < 5 || cert.length > 30) {
      errors.calibrationTechnicianCert = 'Technician Certificate ID must be between 5 and 30 characters (e.g. ISO-18436-VA-9912).';
    }
  }

  // Determine ISO 10816 Zone
  let iso10816Zone: 'Zone A (Good)' | 'Zone B (Acceptable)' | 'Zone C (Warning)' | 'Zone D (Critical Danger)' = 'Zone A (Good)';
  if (vib >= HSE_STANDARDS.VIBRATION.ZONE_D_DANGER) {
    iso10816Zone = 'Zone D (Critical Danger)';
  } else if (vib >= HSE_STANDARDS.VIBRATION.ZONE_B_ACCEPTABLE) {
    iso10816Zone = 'Zone C (Warning)';
  } else if (vib >= HSE_STANDARDS.VIBRATION.ZONE_A_GOOD) {
    iso10816Zone = 'Zone B (Acceptable)';
  }

  const thermalCeilingExceeded = temp >= HSE_STANDARDS.TEMPERATURE.CRITICAL_CEILING;
  const lotoMandatory = thermalCeilingExceeded || vib >= HSE_STANDARDS.VIBRATION.ZONE_D_DANGER || data.status === 'Critical';

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    warnings,
    hseCompliance: {
      iso10816Zone,
      thermalCeilingExceeded,
      lotoMandatory,
      complianceStatus: isValid ? (warnings.length > 0 ? 'Requires Investigation' : 'Fully Compliant') : 'Non-Compliant'
    },
    sanitizedData: isValid ? {
      id: String(data.id).trim().toUpperCase(),
      name: String(data.name).trim(),
      type: String(data.type).trim(),
      location: String(data.location).trim(),
      operationalHours: Math.round(opHours),
      lastMaintenanceDate: String(data.lastMaintenanceDate).trim(),
      sensors: {
        temperature: Number(temp.toFixed(1)),
        vibration: Number(vib.toFixed(2)),
        pressure: pres !== undefined ? Number(pres.toFixed(1)) : undefined,
        oilLevel: oil !== undefined ? Math.round(oil) : undefined,
      },
      status: data.status,
      calibrationTechnicianCert: data.calibrationTechnicianCert ? String(data.calibrationTechnicianCert).trim() : undefined,
      hseRiskCategory: data.hseRiskCategory || 'Category B - Process Containment'
    } : undefined
  };
}

// ----------------------------------------------------------------------------
// SERVER-SIDE VALIDATION LOGIC FOR MAINTENANCE WORK ORDERS
// ----------------------------------------------------------------------------
export function validateWorkOrderPayload(data: any): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  slaHours: number;
} {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // 1. Equipment ID Reference
  if (!data.equipmentId || typeof data.equipmentId !== 'string') {
    errors.equipmentId = 'Target Equipment Asset ID is required.';
  }

  // 2. Work Order Title
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Work order title is mandatory.';
  } else {
    const t = data.title.trim();
    if (t.length < 5) {
      errors.title = 'Work order title must be at least 5 characters.';
    } else if (t.length > 120) {
      errors.title = 'Work order title cannot exceed 120 characters.';
    }
  }

  // 3. Priority & Statutory SLA
  let slaHours = 72;
  if (!data.priority || !HSE_STANDARDS.APPROVED_PRIORITIES.includes(data.priority)) {
    errors.priority = `Priority must be one of: ${HSE_STANDARDS.APPROVED_PRIORITIES.join(', ')}.`;
  } else {
    switch (data.priority) {
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
  }

  // 4. Due Date & SLA Constraints
  if (!data.dueDate || typeof data.dueDate !== 'string') {
    errors.dueDate = 'Due Date is mandatory.';
  } else {
    const parsedDue = new Date(data.dueDate);
    if (isNaN(parsedDue.getTime())) {
      errors.dueDate = 'Invalid due date format. Expected YYYY-MM-DD.';
    } else {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (parsedDue < now) {
        errors.dueDate = 'Due date cannot be in the past.';
      }

      // Check SLA constraint
      const maxAllowedDate = new Date();
      maxAllowedDate.setHours(maxAllowedDate.getHours() + slaHours + 24); // Allow 24h grace buffer

      if (data.priority === 'P1 - Critical' && parsedDue > maxAllowedDate) {
        errors.dueDate = `HSE SLA Breach: P1 Critical work orders must be scheduled within 24-48 hours (max allowed: ${maxAllowedDate.toISOString().split('T')[0]}).`;
      }
    }
  }

  // 5. Authorized Assignee
  if (!data.assignee || typeof data.assignee !== 'string' || data.assignee.trim().length < 2) {
    errors.assignee = 'An authorized Maintenance Lead or Engineer must be assigned.';
  }

  // 6. LOTO Mandatory Rule (OSHA 1910.147 / OSHAD CoP 14.0)
  if (data.requiresLotoCheck && !data.lotoRequired) {
    errors.lotoRequired = 'HSE Mandatory Isolation Rule: Equipment is flagged Critical/Hazardous. Lockout/Tagout (LOTO) energy isolation is strictly mandatory.';
  }

  // 7. RAMS Reference for High-Risk / Critical Interventions
  if ((data.priority === 'P1 - Critical' || data.priority === 'P2 - High') && (!data.ramsReference || data.ramsReference.trim().length < 3)) {
    warnings.push('HSE Advisory: High-risk maintenance interventions require an approved RAMS (Risk Assessment & Method Statement) reference prior to work permit issue.');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    slaHours
  };
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * POST /api/predictive-maintenance/validate-telemetry
 * Real-time server-side validation of IoT sensor telemetry & HSE limits
 */
predictiveMaintenanceRouter.post('/validate-telemetry', (req: Request, res: Response) => {
  try {
    const validationResult = validateEquipmentPayload(req.body);
    return res.status(validationResult.isValid ? 200 : 422).json(validationResult);
  } catch (err: any) {
    return res.status(500).json({
      isValid: false,
      errors: { server: 'Internal validation server error: ' + (err?.message || 'unknown') }
    });
  }
});

/**
 * POST /api/predictive-maintenance/equipment
 * Validates, registers or updates equipment record with strict HSE schema enforcement
 */
predictiveMaintenanceRouter.post('/equipment', (req: Request, res: Response) => {
  try {
    const validationResult = validateEquipmentPayload(req.body);

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Equipment data validation failed against HSE & ISO standards.',
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        hseCompliance: validationResult.hseCompliance
      });
    }

    // Success response with normalized, sanitized payload and compliance telemetry
    return res.status(200).json({
      success: true,
      message: 'Asset telemetry and engineering specifications successfully validated and certified.',
      equipment: validationResult.sanitizedData,
      warnings: validationResult.warnings,
      hseCompliance: validationResult.hseCompliance,
      auditTimestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error processing equipment registration.',
      error: err?.message
    });
  }
});

/**
 * POST /api/predictive-maintenance/work-order
 * Validates preventive/corrective work orders according to HSE SLA and LOTO rules
 */
predictiveMaintenanceRouter.post('/work-order', (req: Request, res: Response) => {
  try {
    const validationResult = validateWorkOrderPayload(req.body);

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Maintenance Work Order failed HSE validation rules.',
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
    }

    const taskId = `WO-${Date.now()}`;
    return res.status(201).json({
      success: true,
      message: 'Maintenance Work Order successfully validated and scheduled.',
      taskId,
      slaHours: validationResult.slaHours,
      warnings: validationResult.warnings,
      createdAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Server error processing work order.',
      error: err?.message
    });
  }
});

/**
 * GET /api/predictive-maintenance/standards
 * Exposes codified HSE and ISO threshold limits to clients
 */
predictiveMaintenanceRouter.get('/standards', (_req: Request, res: Response) => {
  return res.json({
    status: 'success',
    standards: HSE_STANDARDS,
    regulatoryAuthorities: [
      { code: 'ISO-10816-3', name: 'Mechanical vibration - Evaluation of machine vibration by measurements on non-rotating parts' },
      { code: 'API-670', name: 'Machinery Protection Systems Standard' },
      { code: 'OSHAD-SF-CoP-14.0', name: 'Control of Hazardous Energy (Lockout / Tagout)' },
      { code: 'OSHA-1910.147', name: 'The control of hazardous energy (lockout/tagout)' }
    ]
  });
});

export default predictiveMaintenanceRouter;
