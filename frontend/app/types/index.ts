export interface CustomerSummary {
  id: string
  first_name: string
  last_name: string
  age: number
  city: string
  marital_status: string
  status_tag: string
  gender: string
}

export interface Profile {
  id: string
  first_name: string
  last_name: string
  gender: string
  date_of_birth: string
  age: number
  country: string
  city: string
  height_cm: number
  email: string
  phone: string
  undergraduate_college: string
  degree: string
  income_lpa: number
  current_company: string
  designation: string
  marital_status: string
  languages_known: string[]
  siblings: number
  caste: string
  religion: string
  want_kids: string
  open_to_relocate: string
  open_to_pets: string
  manglik?: string
  mother_tongue?: string
  family_type?: string
  family_values?: string
  diet?: string
  drinking?: string
  smoking?: string
  photo_url?: string
  status_tag?: string
  notes?: string
}

export interface MatchResult {
  profile: Profile
  score: number
  ai_label: string
  ai_explanation: string
  match_reasons: string[]
}

export interface SendMatchRequest {
  customer_id: string
  match_id: string
}

export interface SendMatchResponse {
  success: boolean
  message: string
  preview_subject: string
  preview_body: string
}
