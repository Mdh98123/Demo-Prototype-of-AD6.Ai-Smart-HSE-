import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TenantOrg {
  id: string;
  name: string;
  shortName: string;
  country: 'Oman' | 'GCC';
  code: string;
  sector: string;
  brandColor: string;
  sitesCount: number;
}

export interface OperationalSite {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  country: 'Oman' | 'GCC' | 'KSA';
  location: string;
  coordinates: string;
  type: 'Upstream O&G' | 'Refinery' | 'Gas Processing' | 'Industrial Port' | 'Fabrication Yard' | 'Logistics Hub';
  riskLevel: 'Normal' | 'Moderate' | 'High Risk';
  heatStressLevel: 1 | 2 | 3 | 4;
  heatStressTemp: string;
  h2sPpm: string;
  activePermitsCount: number;
  openIncidentsCount: number;
  headcountOnSite: number;
}

export const TENANT_ORGANIZATIONS: TenantOrg[] = [
  {
    id: 'tenant-pdo',
    name: 'Petroleum Development Oman (PDO)',
    shortName: 'PDO Oman',
    country: 'Oman',
    code: 'OMN-PDO-01',
    sector: 'Exploration & Production (Block 6 Concession)',
    brandColor: '#10B981',
    sitesCount: 4
  },
  {
    id: 'tenant-oq',
    name: 'OQ Integrated Energy Company',
    shortName: 'OQ Oman',
    country: 'Oman',
    code: 'OMN-OQ-02',
    sector: 'Downstream, Refining & Petrochemicals',
    brandColor: '#F59E0B',
    sitesCount: 3
  },
  {
    id: 'tenant-asyad',
    name: 'Asyad Group (Oman Logistics & Marine Ports)',
    shortName: 'Asyad Group',
    country: 'Oman',
    code: 'OMN-ASYAD-03',
    sector: 'Deepwater Ports, Maritime Shipping & Logistics',
    brandColor: '#2563EB',
    sitesCount: 3
  },
  {
    id: 'tenant-nama',
    name: 'Nama Holding (Nama Power & Water Services)',
    shortName: 'Nama Group',
    country: 'Oman',
    code: 'OMN-NAMA-04',
    sector: 'National Power Transmission & Desalination',
    brandColor: '#0284C7',
    sitesCount: 2
  },
  {
    id: 'tenant-sezad',
    name: 'Special Economic Zone Authority at Duqm (SEZAD)',
    shortName: 'SEZAD Duqm',
    country: 'Oman',
    code: 'OMN-SEZAD-05',
    sector: 'Special Economic Zones & Heavy Industry Hub',
    brandColor: '#0D9488',
    sitesCount: 2
  },
  {
    id: 'tenant-geig',
    name: 'Gulf Energy Oman Operations',
    shortName: 'Gulf Energy',
    country: 'Oman',
    code: 'OMN-GEIG-06',
    sector: 'Integrated Energy, Drilling & Industrial Infrastructure',
    brandColor: '#059669',
    sitesCount: 3
  }
];

export const OPERATIONAL_SITES: OperationalSite[] = [
  {
    id: 'site-fahud',
    tenantId: 'tenant-pdo',
    name: 'Fahud Field - Oman (Concession Block 6)',
    code: 'OMN-FHD-01',
    country: 'Oman',
    location: 'Ad Dhahirah Governorate, Sultanate of Oman (PDO Block 6)',
    coordinates: '22.3167, 56.4833',
    type: 'Upstream O&G',
    riskLevel: 'High Risk',
    heatStressLevel: 4,
    heatStressTemp: '44.8°C',
    h2sPpm: '1.2 ppm',
    activePermitsCount: 18,
    openIncidentsCount: 0,
    headcountOnSite: 1420
  },
  {
    id: 'site-mina-alfahal',
    tenantId: 'tenant-pdo',
    name: 'Mina Al Fahal Refinery & Terminal Complex (Muscat)',
    code: 'OMN-MAF-01',
    country: 'Oman',
    location: 'Mina Al Fahal Industrial Area, Muscat, Sultanate of Oman',
    coordinates: '23.6300, 58.5100',
    type: 'Refinery',
    riskLevel: 'High Risk',
    heatStressLevel: 3,
    heatStressTemp: '39.5°C',
    h2sPpm: '0.4 ppm',
    activePermitsCount: 24,
    openIncidentsCount: 1,
    headcountOnSite: 2480
  },
  {
    id: 'site-sohar',
    tenantId: 'tenant-oq',
    name: 'Sohar Industrial Port Terminal - Oman',
    code: 'OMN-SOH-01',
    country: 'Oman',
    location: 'Sohar Port & Freezone, Al Batinah North, Sultanate of Oman',
    coordinates: '24.4980, 56.6340',
    type: 'Industrial Port',
    riskLevel: 'Moderate',
    heatStressLevel: 2,
    heatStressTemp: '38.0°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 16,
    openIncidentsCount: 0,
    headcountOnSite: 2100
  },
  {
    id: 'site-duqm',
    tenantId: 'tenant-oq',
    name: 'Duqm Special Economic Zone Heavy Plant (OQ8) - Oman',
    code: 'OMN-DQM-02',
    country: 'Oman',
    location: 'SEZAD Concession Area, Al Wusta Governorate, Sultanate of Oman',
    coordinates: '19.6738, 57.7042',
    type: 'Refinery',
    riskLevel: 'Moderate',
    heatStressLevel: 2,
    heatStressTemp: '36.5°C',
    h2sPpm: '0.1 ppm',
    activePermitsCount: 20,
    openIncidentsCount: 0,
    headcountOnSite: 1850
  },
  {
    id: 'site-nimr',
    tenantId: 'tenant-pdo',
    name: 'Nimr Production Station (Block 6 South)',
    code: 'OMN-NMR-03',
    country: 'Oman',
    location: 'Dhofar Interior Basin, Sultanate of Oman (PDO Block 6)',
    coordinates: '18.6667, 55.7500',
    type: 'Upstream O&G',
    riskLevel: 'High Risk',
    heatStressLevel: 4,
    heatStressTemp: '45.0°C',
    h2sPpm: '1.4 ppm',
    activePermitsCount: 22,
    openIncidentsCount: 1,
    headcountOnSite: 1650
  },
  {
    id: 'site-khazzan',
    tenantId: 'tenant-geig',
    name: 'Khazzan Tight Gas Processing Complex (Block 61)',
    code: 'OMN-KHZ-01',
    country: 'Oman',
    location: 'Ad Dhahirah / Al Wusta Border, Sultanate of Oman',
    coordinates: '21.5000, 56.0000',
    type: 'Gas Processing',
    riskLevel: 'High Risk',
    heatStressLevel: 3,
    heatStressTemp: '42.0°C',
    h2sPpm: '0.8 ppm',
    activePermitsCount: 14,
    openIncidentsCount: 0,
    headcountOnSite: 1250
  },
  {
    id: 'site-salalah',
    tenantId: 'tenant-asyad',
    name: 'Salalah Free Zone & Deepwater Marine Terminal',
    code: 'OMN-SLL-01',
    country: 'Oman',
    location: 'Port of Salalah & Free Zone, Raysut, Dhofar Governorate, Oman',
    coordinates: '16.9500, 54.0000',
    type: 'Industrial Port',
    riskLevel: 'Normal',
    heatStressLevel: 2,
    heatStressTemp: '32.0°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 12,
    openIncidentsCount: 0,
    headcountOnSite: 1450
  },
  {
    id: 'site-fahud-west',
    tenantId: 'tenant-geig',
    name: 'Fahud-West Gas Compressor Station (Oman)',
    code: 'OMN-FHD-02',
    country: 'Oman',
    location: 'Ad Dhahirah Governorate, Sultanate of Oman (PDO Block 6)',
    coordinates: '22.3167, 56.4833',
    type: 'Gas Processing',
    riskLevel: 'High Risk',
    heatStressLevel: 4,
    heatStressTemp: '44.8°C',
    h2sPpm: '1.2 ppm',
    activePermitsCount: 14,
    openIncidentsCount: 2,
    headcountOnSite: 1150
  }
];

import { RegionalComplianceService, RegionalComplianceMode } from '../services/regionalComplianceService';

interface TenantContextType {
  currentTenant: TenantOrg;
  currentSite: OperationalSite;
  allTenants: TenantOrg[];
  availableSites: OperationalSite[];
  switchTenant: (tenantId: string) => void;
  switchSite: (siteId: string) => void;
  regionalMode: RegionalComplianceMode;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [regionalMode, setRegionalMode] = useState<RegionalComplianceMode>(() => 
    RegionalComplianceService.getActiveMode()
  );

  useEffect(() => {
    const handleModeChange = () => {
      setRegionalMode(RegionalComplianceService.getActiveMode());
    };
    window.addEventListener('ad6-regional-compliance-changed', handleModeChange);
    return () => window.removeEventListener('ad6-regional-compliance-changed', handleModeChange);
  }, []);

  const filteredTenants = React.useMemo(() => {
    return TENANT_ORGANIZATIONS.filter(t => RegionalComplianceService.isEntityVisible(t.country, regionalMode));
  }, [regionalMode]);

  const filteredSites = React.useMemo(() => {
    return OPERATIONAL_SITES.filter(s => RegionalComplianceService.isEntityVisible(s.country, regionalMode));
  }, [regionalMode]);

  const [currentTenant, setCurrentTenant] = useState<TenantOrg>(() => {
    const saved = localStorage.getItem('ad6_current_tenant');
    if (saved) {
      const match = TENANT_ORGANIZATIONS.find(t => t.id === saved);
      if (match && RegionalComplianceService.isEntityVisible(match.country, regionalMode)) {
        return match;
      }
    }
    return filteredTenants[0] || TENANT_ORGANIZATIONS[0];
  });

  const [currentSite, setCurrentSite] = useState<OperationalSite>(() => {
    const saved = localStorage.getItem('ad6_current_site');
    if (saved) {
      const match = OPERATIONAL_SITES.find(s => s.id === saved);
      if (match && RegionalComplianceService.isEntityVisible(match.country, regionalMode)) {
        return match;
      }
    }
    return filteredSites[0] || OPERATIONAL_SITES[0];
  });

  // Re-align current tenant/site if they become invalid under the active regional mode
  useEffect(() => {
    if (!RegionalComplianceService.isEntityVisible(currentTenant.country, regionalMode)) {
      const fallbackTenant = filteredTenants[0] || TENANT_ORGANIZATIONS[0];
      setCurrentTenant(fallbackTenant);
      const matchingSite = filteredSites.find(s => s.tenantId === fallbackTenant.id) || filteredSites[0];
      if (matchingSite) {
        setCurrentSite(matchingSite);
      }
    } else if (!RegionalComplianceService.isEntityVisible(currentSite.country, regionalMode)) {
      const fallbackSite = filteredSites.find(s => s.tenantId === currentTenant.id) || filteredSites[0];
      if (fallbackSite) {
        setCurrentSite(fallbackSite);
      }
    }
  }, [regionalMode, filteredTenants, filteredSites, currentTenant.country, currentSite.country, currentTenant.id]);

  // Keep saved choices in localStorage
  useEffect(() => {
    localStorage.setItem('ad6_current_tenant', currentTenant.id);
  }, [currentTenant]);

  useEffect(() => {
    localStorage.setItem('ad6_current_site', currentSite.id);
  }, [currentSite]);

  const switchTenant = (tenantId: string) => {
    const tenant = filteredTenants.find(t => t.id === tenantId) || TENANT_ORGANIZATIONS.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      const matchingSite = filteredSites.find(s => s.tenantId === tenantId) || OPERATIONAL_SITES.find(s => s.tenantId === tenantId);
      if (matchingSite) {
        setCurrentSite(matchingSite);
      }
    }
  };

  const switchSite = (siteId: string) => {
    const site = filteredSites.find(s => s.id === siteId) || OPERATIONAL_SITES.find(s => s.id === siteId);
    if (site) {
      setCurrentSite(site);
      const matchingTenant = filteredTenants.find(t => t.id === site.tenantId) || TENANT_ORGANIZATIONS.find(t => t.id === site.tenantId);
      if (matchingTenant && matchingTenant.id !== currentTenant.id) {
        setCurrentTenant(matchingTenant);
      }
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        currentSite,
        allTenants: filteredTenants,
        availableSites: filteredSites,
        switchTenant,
        switchSite,
        regionalMode
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    console.warn('useTenant was used outside of TenantProvider; returning safe defaults.');
    return {
      currentTenant: TENANT_ORGANIZATIONS[0],
      currentSite: OPERATIONAL_SITES[0],
      allTenants: TENANT_ORGANIZATIONS,
      availableSites: OPERATIONAL_SITES,
      switchTenant: () => {},
      switchSite: () => {},
      regionalMode: 'COMBINED'
    };
  }
  return context;
};
