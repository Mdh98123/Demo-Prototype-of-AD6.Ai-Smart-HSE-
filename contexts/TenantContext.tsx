import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TenantOrg {
  id: string;
  name: string;
  shortName: string;
  country: 'UAE' | 'Oman' | 'GCC';
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
  country: 'UAE' | 'Oman' | 'GCC' | 'KSA';
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
    id: 'tenant-geig',
    name: 'Gulf Energy & Infrastructure Group',
    shortName: 'Gulf Energy',
    country: 'GCC',
    code: 'GCC-GEIG-01',
    sector: 'Integrated Energy, Oil & Gas, Maritime & Industrial Infrastructure',
    brandColor: '#059669',
    sitesCount: 3
  },
  {
    id: 'tenant-adnoc',
    name: 'ADNOC Group (Abu Dhabi National Oil Co)',
    shortName: 'ADNOC Group',
    country: 'UAE',
    code: 'AUH-OG-01',
    sector: 'Integrated Oil, Gas & Petrochemicals',
    brandColor: '#0084FF',
    sitesCount: 4
  },
  {
    id: 'tenant-pdo',
    name: 'Petroleum Development Oman (PDO)',
    shortName: 'PDO Oman',
    country: 'Oman',
    code: 'MCT-PDO-02',
    sector: 'Exploration & Production (Block 6 Concession)',
    brandColor: '#10B981',
    sitesCount: 3
  },
  {
    id: 'tenant-oq',
    name: 'OQ Integrated Energy Company',
    shortName: 'OQ Oman',
    country: 'Oman',
    code: 'OMN-OQ-03',
    sector: 'Downstream, Petrochemicals & Refineries',
    brandColor: '#F59E0B',
    sitesCount: 3
  },
  {
    id: 'tenant-dewa',
    name: 'Dubai Electricity & Water Authority (DEWA)',
    shortName: 'DEWA Utilities',
    country: 'UAE',
    code: 'DXB-DEWA-04',
    sector: 'Power Generation, Water & Clean Energy',
    brandColor: '#3B82F6',
    sitesCount: 2
  },
  {
    id: 'tenant-kezad',
    name: 'KEZAD Industrial & Freezone Authority',
    shortName: 'KEZAD Group',
    country: 'UAE',
    code: 'AUH-KZD-05',
    sector: 'Industrial Manufacturing & Special Economic Zones',
    brandColor: '#14B8A6',
    sitesCount: 2
  }
];

export const OPERATIONAL_SITES: OperationalSite[] = [
  {
    id: 'site-fahud-west',
    tenantId: 'tenant-geig',
    name: 'Fahud-West Gas Station (Oman)',
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
  },
  {
    id: 'site-ruwais-polyolefin',
    tenantId: 'tenant-geig',
    name: 'Al-Ruwais Polyolefin Asset (UAE)',
    code: 'UAE-RUW-03',
    country: 'UAE',
    location: 'Ruwais Industrial Complex, Al Dhafra Region, Abu Dhabi, UAE',
    coordinates: '24.1107, 52.7306',
    type: 'Refinery',
    riskLevel: 'High Risk',
    heatStressLevel: 3,
    heatStressTemp: '42.1°C',
    h2sPpm: '0.4 ppm',
    activePermitsCount: 22,
    openIncidentsCount: 1,
    headcountOnSite: 2480
  },
  {
    id: 'site-ras-alkhair',
    tenantId: 'tenant-geig',
    name: 'Ras Al-Khair Facility (KSA)',
    code: 'KSA-RAK-01',
    country: 'KSA',
    location: 'Ras Al-Khair Special Economic Zone & Maritime Complex, Eastern Province, KSA',
    coordinates: '27.5333, 49.1667',
    type: 'Industrial Port',
    riskLevel: 'Moderate',
    heatStressLevel: 2,
    heatStressTemp: '38.5°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 11,
    openIncidentsCount: 1,
    headcountOnSite: 1890
  },
  {
    id: 'site-fahud',
    tenantId: 'tenant-pdo',
    name: 'Fahud Field - Oman (Concession Block 6)',
    code: 'OMN-FHD-01',
    country: 'Oman',
    location: 'Ad Dhahirah Governorate, Oman',
    coordinates: '22.3167, 56.4833',
    type: 'Upstream O&G',
    riskLevel: 'High Risk',
    heatStressLevel: 3,
    heatStressTemp: '43°C',
    h2sPpm: '0.8 ppm',
    activePermitsCount: 18,
    openIncidentsCount: 0,
    headcountOnSite: 1420
  },
  {
    id: 'site-habshan',
    tenantId: 'tenant-adnoc',
    name: 'Habshan Asset - UAE (Gas Processing Complex)',
    code: 'UAE-HBS-01',
    country: 'UAE',
    location: 'Al Dhafra Region, Abu Dhabi, UAE',
    coordinates: '23.7500, 53.5000',
    type: 'Gas Processing',
    riskLevel: 'High Risk',
    heatStressLevel: 4,
    heatStressTemp: '45°C',
    h2sPpm: '1.4 ppm',
    activePermitsCount: 24,
    openIncidentsCount: 1,
    headcountOnSite: 2840
  },
  {
    id: 'site-ruwais',
    tenantId: 'tenant-adnoc',
    name: 'Ruwais Refinery Complex - UAE',
    code: 'UAE-RUW-02',
    country: 'UAE',
    location: 'Ruwais Industrial Zone, Abu Dhabi, UAE',
    coordinates: '24.1107, 52.7306',
    type: 'Refinery',
    riskLevel: 'Moderate',
    heatStressLevel: 3,
    heatStressTemp: '41°C',
    h2sPpm: '0.2 ppm',
    activePermitsCount: 31,
    openIncidentsCount: 0,
    headcountOnSite: 3200
  },
  {
    id: 'site-sohar',
    tenantId: 'tenant-oq',
    name: 'Sohar Industrial Port Terminal - Oman',
    code: 'OMN-SOH-01',
    country: 'Oman',
    location: 'Sohar Port & Freezone, Al Batinah North, Oman',
    coordinates: '24.4980, 56.6340',
    type: 'Industrial Port',
    riskLevel: 'Moderate',
    heatStressLevel: 2,
    heatStressTemp: '39°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 14,
    openIncidentsCount: 0,
    headcountOnSite: 2100
  },
  {
    id: 'site-duqm',
    tenantId: 'tenant-oq',
    name: 'Duqm Special Economic Zone Heavy Plant - Oman',
    code: 'OMN-DQM-02',
    country: 'Oman',
    location: 'SEZAD, Al Wusta Governorate, Oman',
    coordinates: '19.6738, 57.7042',
    type: 'Refinery',
    riskLevel: 'Moderate',
    heatStressLevel: 2,
    heatStressTemp: '37°C',
    h2sPpm: '0.1 ppm',
    activePermitsCount: 16,
    openIncidentsCount: 0,
    headcountOnSite: 1850
  },
  {
    id: 'site-jebelali',
    tenantId: 'tenant-dewa',
    name: 'Jebel Ali Marine & Heavy Yard - UAE',
    code: 'UAE-DXB-04',
    country: 'UAE',
    location: 'Jebel Ali Industrial Area, Dubai, UAE',
    coordinates: '25.0112, 55.0617',
    type: 'Fabrication Yard',
    riskLevel: 'Normal',
    heatStressLevel: 3,
    heatStressTemp: '40°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 12,
    openIncidentsCount: 0,
    headcountOnSite: 1650
  },
  {
    id: 'site-kezad-hub',
    tenantId: 'tenant-kezad',
    name: 'KEZAD Industrial Logistics City - UAE',
    code: 'UAE-KZD-03',
    country: 'UAE',
    location: 'Khalifa Industrial Zone, Abu Dhabi, UAE',
    coordinates: '24.7869, 54.6854',
    type: 'Logistics Hub',
    riskLevel: 'Normal',
    heatStressLevel: 2,
    heatStressTemp: '38°C',
    h2sPpm: '0.0 ppm',
    activePermitsCount: 9,
    openIncidentsCount: 0,
    headcountOnSite: 940
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
