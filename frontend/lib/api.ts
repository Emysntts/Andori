const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Tipos
export type Turma = {
  id: string
  nome: string
}

export type Aluno = {
  id: string
  nome: string
}

// API de Turmas
export const turmasAPI = {
  async list(): Promise<{ items: Turma[] }> {
    const url = `${API_BASE_URL}/api/v1/turmas`
    console.log('🌐 GET', url)
    const response = await fetch(url)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      throw new Error(`${response.status}: ${errorText}`)
    }
    return response.json()
  },

  async get(id: string): Promise<{ turma: Turma; professores: any[] }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/turmas/${id}`)
    if (!response.ok) {
      throw new Error(`Erro ao buscar turma: ${response.statusText}`)
    }
    return response.json()
  },

  async create(nome: string): Promise<{ turma: Turma }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    })
    if (!response.ok) {
      throw new Error(`Erro ao criar turma: ${response.statusText}`)
    }
    return response.json()
  },

  async update(id: string, nome: string): Promise<{ turma: Turma }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/turmas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    })
    if (!response.ok) {
      throw new Error(`Erro ao atualizar turma: ${response.statusText}`)
    }
    return response.json()
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/turmas/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar turma: ${response.statusText}`)
    }
    return response.json()
  },

  async getStudents(turmaId: string): Promise<{ items: Aluno[] }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/turmas/${turmaId}/students`)
    if (!response.ok) {
      throw new Error(`Erro ao buscar alunos: ${response.statusText}`)
    }
    return response.json()
  }
}

// Tipos para Aulas
export type Aula = {
  id: string
  titulo: string
  assunto: string
  turma: string
  data: string
  descricao: string
}

export type AulaCreatePayload = {
  assunto: string
  turma: string
  data: string
  descricao: string
  arquivo?: File | null
}

// API de Aulas
export const aulasAPI = {
  async list(): Promise<{ items: Aula[] }> {
    const url = `${API_BASE_URL}/api/v1/aulas`
    console.log('🌐 GET', url)
    const response = await fetch(url)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      throw new Error(`${response.status}: ${errorText}`)
    }
    return response.json()
  },

  async create(payload: AulaCreatePayload): Promise<{ aula: Aula }> {
    const url = `${API_BASE_URL}/api/v1/aulas`
    console.log('🌐 POST', url, payload)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assunto: payload.assunto,
        turma: payload.turma,
        data: payload.data,
        descricao: payload.descricao
      })
    })
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      throw new Error(`${response.status}: ${errorText}`)
    }
    return response.json()
  },

  async get(id: string): Promise<{ aula: Aula }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/aulas/${id}`)
    if (!response.ok) {
      throw new Error(`Erro ao buscar aula: ${response.statusText}`)
    }
    return response.json()
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/aulas/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Erro ao deletar aula: ${response.statusText}`)
    }
    return response.json()
  }
}

