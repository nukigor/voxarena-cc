import { Debate, Participant, FormatTemplate } from '@prisma/client'

export interface DebateExportData extends Debate {
  participants: Participant[]
  formatTemplate: FormatTemplate | null
}

export interface FormattedDebateData {
  title: string
  topic: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  participants: Array<{
    name: string
    role: string
  }>
  transcript: string
  formatName: string
}

export function formatDebateForExport(debate: DebateExportData): FormattedDebateData {
  return {
    title: debate.title,
    topic: debate.topic,
    description: debate.description,
    createdAt: debate.createdAt,
    updatedAt: debate.updatedAt,
    participants: debate.participants.map(p => ({
      name: p.name,
      role: p.role,
    })).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    transcript: debate.transcript || '',
    formatName: debate.formatTemplate?.name || 'Standard Debate',
  }
}

export function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
