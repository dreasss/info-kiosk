export interface OrganizationInfo {
  name: string
  fullName: string
  logo: string
  description: string
  address: string
  phone: string
  email: string
  website: string
}

export interface SystemSettings {
  idleTimeout: number // в миллисекундах
  loadingGif: string
  organizationInfo: OrganizationInfo
}
