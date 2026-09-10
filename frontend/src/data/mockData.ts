import type {
  Product, Module, Client, Deployment, DeploymentModule, Environment,
  TeamMember, ProductResponsibility, ClientResponsibility, Repository, ProductDocument, User,
} from '../types'

export const teamMembers: TeamMember[] = [
  { id: 't1', fullName: 'John Smith', jobTitle: 'Backend Developer', department: 'Engineering', email: 'john.smith@idsfintech.com', status: 'Active' },
  { id: 't2', fullName: 'Layla Chami', jobTitle: 'Technical Lead', department: 'Engineering', email: 'layla.chami@idsfintech.com', status: 'Active' },
  { id: 't3', fullName: 'Marc Aoun', jobTitle: 'QA Engineer', department: 'Quality Assurance', email: 'marc.aoun@idsfintech.com', status: 'Active' },
  { id: 't4', fullName: 'Sara Khalil', jobTitle: 'Product Owner', department: 'Product', email: 'sara.khalil@idsfintech.com', status: 'Active' },
  { id: 't5', fullName: 'Elie Nassar', jobTitle: 'Infrastructure Engineer', department: 'Operations', email: 'elie.nassar@idsfintech.com', status: 'Inactive' },
  { id: 't6', fullName: 'Nadine Torbey', jobTitle: 'Implementation Engineer', department: 'Client Services', email: 'nadine.torbey@idsfintech.com', status: 'Active' },
]

// User is the login account, optionally linked to a TeamMember. An Admin can
// exist without ever being a TeamMember (e.g. a pure system administrator).
export const users: User[] = [
  { id: 'u1', email: 'admin@idsfintech.com', password: 'admin123', role: 'Admin', isActive: true, teamMemberId: null },
  { id: 'u2', email: 'john.smith@idsfintech.com', password: 'password', role: 'Employee', isActive: true, teamMemberId: 't1' },
  { id: 'u3', email: 'layla.chami@idsfintech.com', password: 'password', role: 'Admin', isActive: true, teamMemberId: 't2' },
  { id: 'u4', email: 'sara.khalil@idsfintech.com', password: 'password', role: 'Employee', isActive: true, teamMemberId: 't4' },
  { id: 'u5', email: 'elie.nassar@idsfintech.com', password: 'password', role: 'Employee', isActive: false, teamMemberId: 't5' },
]

export const products: Product[] = [
  {
    id: 'p1',
    name: 'IDS Payment Platform',
    description: 'Core payment processing engine for card and bank transfers.',
    businessPurpose: 'Lets banks authorise, clear and settle customer payments.',
    lifecycleStatus: 'Active',
    currentVersion: '3.2',
    supportedMarkets: ['Lebanon', 'UAE', 'Saudi Arabia'],
    criticality: 'Critical',
    technologies: ['.NET', 'SQL Server', 'React'],
    notes: 'Main revenue product, highest support priority.',
  },
  {
    id: 'p2',
    name: 'IDS Risk Engine',
    description: 'Real time fraud and risk scoring for transactions.',
    businessPurpose: 'Reduces fraud losses by scoring transactions before approval.',
    lifecycleStatus: 'Active',
    currentVersion: '1.8',
    supportedMarkets: ['Lebanon', 'Jordan'],
    criticality: 'High',
    technologies: ['.NET', 'Redis', 'SQL Server'],
    notes: '',
  },
  {
    id: 'p3',
    name: 'IDS Onboarding Portal',
    description: 'Self service portal for client onboarding and KYC document collection.',
    businessPurpose: 'Speeds up new client setup and reduces manual paperwork.',
    lifecycleStatus: 'Maintenance',
    currentVersion: '2.1',
    supportedMarkets: ['Lebanon'],
    criticality: 'Medium',
    technologies: ['React', 'Node.js'],
    notes: 'Scheduled for a rewrite next year.',
  },
  {
    id: 'p4',
    name: 'IDS Reporting Suite',
    description: 'Reporting and export tools for regulatory and internal reports.',
    businessPurpose: 'Gives compliance teams the reports they need without manual queries.',
    lifecycleStatus: 'Planned',
    currentVersion: '0.1',
    supportedMarkets: [],
    criticality: 'Low',
    technologies: ['.NET', 'React'],
    notes: 'Kickoff planned for next quarter.',
  },
]

export const modules: Module[] = [
  { id: 'm1', productId: 'p1', name: 'Card Processing', description: 'Handles card authorisation and capture.', status: 'Active' },
  { id: 'm2', productId: 'p1', name: 'Bank Transfers', description: 'Handles domestic and international transfers.', status: 'Active' },
  { id: 'm3', productId: 'p1', name: 'Settlement', description: 'End of day settlement batches.', status: 'Active' },
  { id: 'm4', productId: 'p2', name: 'Rules Engine', description: 'Configurable fraud rules.', status: 'Active' },
  { id: 'm5', productId: 'p2', name: 'Scoring Model', description: 'Machine learning risk score.', status: 'Planned' },
  { id: 'm6', productId: 'p3', name: 'Document Upload', description: 'KYC document collection.', status: 'Active' },
]

export const clients: Client[] = [
  { id: 'c1', companyName: 'ABC Bank', country: 'Lebanon', contactInformation: 'Rita Haddad, rita.haddad@abcbank.com, +961 1 234 567', status: 'Active', notes: 'Long standing client, priority support.' },
  { id: 'c2', companyName: 'Cedar Financial', country: 'Lebanon', contactInformation: 'Karim Fares, karim.fares@cedarfin.com', status: 'Active', notes: '' },
  { id: 'c3', companyName: 'Gulf Trust', country: 'UAE', contactInformation: 'Amina Al Suwaidi, amina@gulftrust.ae, +971 4 555 000', status: 'Onboarding', notes: 'Go live expected next month.' },
  { id: 'c4', companyName: 'Levant Pay', country: 'Jordan', contactInformation: 'Omar Nashef, omar@levantpay.jo', status: 'Inactive', notes: 'Contract ended.' },
]

export const deployments: Deployment[] = [
  { id: 'd1', clientId: 'c1', productId: 'p1', productVersion: '3.2', goLiveDate: '2022-03-14', deploymentStatus: 'Production', supportTier: 'Premium', clientSpecificNotes: 'Highest transaction volume client.' },
  { id: 'd2', clientId: 'c1', productId: 'p2', productVersion: '1.7', goLiveDate: '2023-06-01', deploymentStatus: 'Production', supportTier: 'Priority', clientSpecificNotes: '' },
  { id: 'd3', clientId: 'c2', productId: 'p1', productVersion: '3.1', goLiveDate: '2023-01-20', deploymentStatus: 'Production', supportTier: 'Standard', clientSpecificNotes: '' },
  { id: 'd4', clientId: 'c3', productId: 'p1', productVersion: '3.2', goLiveDate: '2026-10-01', deploymentStatus: 'UAT', supportTier: 'Standard', clientSpecificNotes: 'Currently in testing.' },
  { id: 'd5', clientId: 'c2', productId: 'p3', productVersion: '2.0', goLiveDate: '2021-11-05', deploymentStatus: 'Production', supportTier: 'Standard', clientSpecificNotes: '' },
  { id: 'd6', clientId: 'c4', productId: 'p2', productVersion: '1.5', goLiveDate: '2020-09-10', deploymentStatus: 'Suspended', supportTier: 'Standard', clientSpecificNotes: 'Client contract ended.' },
]

export const deploymentModules: DeploymentModule[] = [
  { id: 'dm1', deploymentId: 'd1', moduleId: 'm1' },
  { id: 'dm2', deploymentId: 'd1', moduleId: 'm2' },
  { id: 'dm3', deploymentId: 'd1', moduleId: 'm3' },
  { id: 'dm4', deploymentId: 'd2', moduleId: 'm4' },
  { id: 'dm5', deploymentId: 'd3', moduleId: 'm1' },
  { id: 'dm6', deploymentId: 'd3', moduleId: 'm2' },
  { id: 'dm7', deploymentId: 'd4', moduleId: 'm1' },
  { id: 'dm8', deploymentId: 'd5', moduleId: 'm6' },
]

export const environments: Environment[] = [
  { id: 'e1', deploymentId: 'd1', environmentName: 'ABC Bank Production', environmentType: 'Production', purpose: 'Live customer traffic', serverName: 'abcbank-prod-01', operatingSystem: 'Windows Server 2022', applicationUrl: 'https://payments.abcbank.internal', databaseInfo: 'SQL Server, primary replica', monitoringLink: 'https://monitor.idsfintech.com/abcbank-prod', accessInstructions: 'Request access through IT service desk.', notes: '' },
  { id: 'e2', deploymentId: 'd1', environmentName: 'ABC Bank UAT', environmentType: 'UAT', purpose: 'Pre production testing', serverName: 'abcbank-uat-01', operatingSystem: 'Windows Server 2022', applicationUrl: 'https://payments-uat.abcbank.internal', databaseInfo: 'SQL Server, single instance', monitoringLink: 'https://monitor.idsfintech.com/abcbank-uat', accessInstructions: 'Request access through IT service desk.', notes: '' },
  { id: 'e3', deploymentId: 'd4', environmentName: 'Gulf Trust UAT', environmentType: 'UAT', purpose: 'Client acceptance testing', serverName: 'gulftrust-uat-01', operatingSystem: 'Ubuntu 22.04', applicationUrl: 'https://payments-uat.gulftrust.ae', databaseInfo: 'SQL Server, single instance', monitoringLink: 'https://monitor.idsfintech.com/gulftrust-uat', accessInstructions: 'Request access through the implementation lead.', notes: '' },
]

export const productResponsibilities: ProductResponsibility[] = [
  { id: 'r1', productId: 'p1', teamMemberId: 't1', responsibility: 'Backend Developer', description: 'Maintains the payment processing core.' },
  { id: 'r2', productId: 'p1', teamMemberId: 't2', responsibility: 'Technical Owner', description: 'Owns architecture decisions for the platform.' },
  { id: 'r3', productId: 'p1', teamMemberId: 't3', responsibility: 'QA Engineer', description: 'Owns the regression suite.' },
  { id: 'r4', productId: 'p2', teamMemberId: 't2', responsibility: 'Technical Owner', description: '' },
  { id: 'r5', productId: 'p3', teamMemberId: 't4', responsibility: 'Product Owner', description: '' },
]

export const clientResponsibilities: ClientResponsibility[] = [
  { id: 'cr1', clientId: 'c1', teamMemberId: 't6', responsibility: 'Implementation Lead', description: 'Main point of contact for ABC Bank.' },
  { id: 'cr2', clientId: 'c3', teamMemberId: 't6', responsibility: 'Implementation Lead', description: 'Leading the Gulf Trust onboarding.' },
]

export const repositories: Repository[] = [
  { id: 'g1', productId: 'p1', name: 'ids-payment-api', githubUrl: 'https://github.com/idsfintech/ids-payment-api', mainBranch: 'main', description: 'Backend API for the payment platform.' },
  { id: 'g2', productId: 'p1', name: 'ids-payment-web', githubUrl: 'https://github.com/idsfintech/ids-payment-web', mainBranch: 'main', description: 'React frontend for the payment platform.' },
  { id: 'g3', productId: 'p2', name: 'ids-risk-engine', githubUrl: 'https://github.com/idsfintech/ids-risk-engine', mainBranch: 'main', description: 'Fraud and risk scoring service.' },
]

export const documents: ProductDocument[] = [
  { id: 'doc1', productId: 'p1', documentName: 'Payment Platform Architecture', documentType: 'Architecture Diagram', description: 'High level system diagram.', urlOrFileReference: 'https://docs.idsfintech.com/payment-architecture', lastUpdatedDate: '2026-05-12' },
  { id: 'doc2', productId: 'p1', documentName: 'Payment API Reference', documentType: 'API Documentation', description: 'Full endpoint reference.', urlOrFileReference: 'https://docs.idsfintech.com/payment-api', lastUpdatedDate: '2026-07-03' },
  { id: 'doc3', productId: 'p2', documentName: 'Risk Engine Deployment Guide', documentType: 'Deployment Guide', description: 'Steps to deploy a new environment.', urlOrFileReference: 'https://docs.idsfintech.com/risk-deploy', lastUpdatedDate: '2026-02-20' },
]
