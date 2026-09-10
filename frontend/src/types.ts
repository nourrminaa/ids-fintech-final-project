// shared shapes used across products, clients, deployments and team pages
// mirrors the ERD: User -> TeamMember (0/1), Product spine (Module, Repository,
// Document, ProductResponsibility), Client spine (ClientResponsibility), crossing
// at Deployment (-> Environment, DeploymentModule). Bonus entities (FinancialInfo,
// ApprovalRequest, SecretVaultReference) are intentionally left out for now.

// ids used to be mock strings like "p1", now they are whatever the real
// database assigns, plain auto increment integers

export type LifecycleStatus = 'Active' | 'Maintenance' | 'Planned' | 'Deprecated'
export type Criticality = 'Low' | 'Medium' | 'High' | 'Critical'

export type UserRole = 'Employee' | 'Admin'

export type User = {
  id: number
  email: string
  role: UserRole
  isActive: boolean
  teamMemberId: number | null // nullable fk, a login can exist without an employee record
}

export type TeamMemberStatus = 'Active' | 'Inactive'

export type TeamMember = {
  id: number
  fullName: string
  jobTitle: string
  department: string
  email: string
  status: TeamMemberStatus
}

export type Module = {
  id: number
  productId: number
  name: string
  description: string
  status: 'Active' | 'Planned' | 'Deprecated'
}

export type Product = {
  id: number
  name: string
  description: string
  businessPurpose: string
  lifecycleStatus: LifecycleStatus
  currentVersion: string
  supportedMarkets: string[]
  criticality: Criticality
  technologies: string[]
  notes: string
}

export type ClientStatus = 'Active' | 'Onboarding' | 'Inactive'

export type Client = {
  id: number
  companyName: string
  country: string
  contactInformation: string
  status: ClientStatus
  notes: string
}

export type DeploymentStatus = 'Production' | 'UAT' | 'In Progress' | 'Suspended'
export type SupportTier = 'Standard' | 'Priority' | 'Premium'

// the client <-> product join, carries data of its own
export type Deployment = {
  id: number
  clientId: number
  productId: number
  productVersion: string
  goLiveDate: string
  deploymentStatus: DeploymentStatus
  supportTier: SupportTier
  clientSpecificNotes: string
}

export type EnvironmentType = 'Development' | 'Testing' | 'UAT' | 'Production'

export type Environment = {
  id: number
  environmentName: string
  environmentType: EnvironmentType
  purpose: string
  serverName: string
  operatingSystem: string
  applicationUrl: string
  databaseInfo: string
  monitoringLink: string
  accessInstructions: string
  notes: string
}

// junction: which employee does what on which product, TeamMemberName comes
// pre joined from the backend so no separate teamMembers lookup is needed
// just to render this
export type ProductResponsibility = {
  id: number
  productId: number
  teamMemberId: number
  teamMemberName: string
  responsibility: string
  description: string
}

// junction: which employee is the contact for which client, same idea
export type ClientResponsibility = {
  id: number
  clientId: number
  teamMemberId: number
  teamMemberName: string
  responsibility: string
  description: string
}

export type Repository = {
  id: number
  productId: number
  name: string
  githubUrl: string
  mainBranch: string
  description: string
}

export type DocumentType =
  | 'Technical Documentation'
  | 'Functional Documentation'
  | 'Deployment Guide'
  | 'Architecture Diagram'
  | 'Postman Collection'
  | 'API Documentation'
  | 'Release Notes'
  | 'User Guide'

export type ProductDocument = {
  id: number
  productId: number
  documentName: string
  documentType: DocumentType
  description: string
  urlOrFileReference: string
  lastUpdatedDate: string
}

// ============================================================
// API response shapes, these are not database entities on their own, they
// are what the backend's aggregate endpoints hand back, one call instead of
// five, see the backend's ProductRepository.GetDetails/ClientRepository.GetDetails
// ============================================================

export type ProductDetails = {
  product: Product
  modules: Module[]
  clientsUsingProduct: Client[]
  responsibleTeam: ProductResponsibility[]
  repositories: Repository[]
  documents: ProductDocument[]
  canEdit: boolean
}

export type DeploymentView = {
  id: number
  productId: number
  productName: string
  productVersion: string
  goLiveDate: string | null
  deploymentStatus: DeploymentStatus
  supportTier: SupportTier
  clientSpecificNotes: string
  availableModules: Module[]
  enabledModuleIds: number[]
  environments: Environment[]
}

export type ClientDetails = {
  client: Client
  deployments: DeploymentView[]
  responsibleTeam: ClientResponsibility[]
}

// one row on the flat /deployments page, client and product names already
// joined in
export type DeploymentListItem = {
  id: number
  clientId: number
  clientName: string
  productId: number
  productName: string
  productVersion: string
  goLiveDate: string | null
  deploymentStatus: DeploymentStatus
  supportTier: SupportTier
}

export type DashboardSummary = {
  totalProducts: number
  activeProducts: number
  totalClients: number
  totalDeployments: number
  totalTeamMembers: number
  recentlyUpdatedProducts: Product[]
}

export type LoginResponse = {
  token: string
  id: number
  email: string
  role: UserRole
  teamMemberId: number | null
  fullName: string
}
