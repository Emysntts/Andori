const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// Tipos
export type Turma = {
  id: string
  nome: string
}

export type Aluno = {
  id: string
  nome: string
}

export type StudentProfile = {
  id: string
  nome: string
  interesse?: string | null
  preferencia?: string | null
  dificuldade?: string | null
  laudo?: string | null
  observacoes?: string | null
  recomendacoes?: string | null
  nivel_de_suporte?: string | null
  descricao_do_aluno?: string | null
  turma_id?: string | null
  turma_nome?: string | null
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

// API de Estudantes
export const studentsAPI = {
  async list(params: { turmaId?: string; limit?: number; offset?: number } = {}): Promise<{ items: Aluno[]; limit: number; offset: number }> {
    console.log('🔵 studentsAPI.list chamado com params:', params)
    
    const searchParams = new URLSearchParams()
    if (params.turmaId) {
      console.log('🔵 Adicionando turma_id ao query:', params.turmaId)
      searchParams.set('turma_id', params.turmaId)
    } else {
      console.log('⚠️ Nenhum turmaId fornecido')
    }
    if (typeof params.limit === 'number') searchParams.set('limit', String(params.limit))
    if (typeof params.offset === 'number') searchParams.set('offset', String(params.offset))
    
    const query = searchParams.toString()
    console.log('🔵 Query string montada:', query)
    
    const url = `${API_BASE_URL}/api/v1/students${query ? `?${query}` : ''}`
    console.log('🌐 GET (estudantes)', url)
    
    const response = await fetch(url)
    console.log(`📊 Status (estudantes): ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (estudantes):', errorText)
      throw new Error(`${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('📦 Dados recebidos (estudantes):', data)
    console.log('📦 Total de items:', data.items?.length || 0)
    
    return data
  },

  async get(id: string): Promise<{ student_profile: StudentProfile }> {
    const url = `${API_BASE_URL}/api/v1/students/${id}`
    console.log('🌐 GET (student profile)', url)
    const response = await fetch(url, { cache: 'no-store' })
    console.log(`📊 Status (student profile): ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (student profile):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Dados recebidos (student profile):', data)
    return data
  }
}

export type RecommendationContent = {
  observacoes?: string | null
  recomendacoes?: {
    arrmd_id: string
    recomendacoes_ia?: string | null
    assunto?: string | null
    descricao?: string | null
    turma_nome?: string | null
  }
}

export const recommendationAPI = {
  async get(params: { alunoId?: string; aulaId?: string }): Promise<RecommendationContent> {
    const searchParams = new URLSearchParams()
    if (params.alunoId) searchParams.set('aluno_id', params.alunoId)
    if (params.aulaId) searchParams.set('arrmd_id', params.aulaId)
    const url = `${API_BASE_URL}/api/v1/recomendation${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    console.log('🌐 GET (recommendation)', url)
    const response = await fetch(url, { cache: 'no-store' })
    console.log(`📊 Status (recommendation): ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (recommendation):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Dados recebidos (recommendation):', data)
    return data
  }
}

// API de Description
export const descriptionAPI = {
  async save(alunoId: string, descricao: string): Promise<{ aluno_id: string; descricao: string }> {
    const url = `${API_BASE_URL}/api/v1/description`
    console.log('🌐 POST (description)', url, { aluno_id: alunoId, descricao })
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aluno_id: alunoId, descricao })
    })
    console.log(`📊 Status (description): ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (description):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Dados recebidos (description):', data)
    return data
  }
}

// Tipos para Aulas
export type Aula = {
  id: string
  titulo: string
  assunto: string
  turma: string
  turma_id?: string | null
  turma_nome?: string | null
  data: string
  descricao: string
  arquivo?: any
  upload_arquivo?: any
}

export type AulaCreatePayload = {
  assunto: string
  turma: string
  turma_id?: string | null
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
    const arquivoPayload =
      payload.arquivo instanceof File
        ? { name: payload.arquivo.name, size: payload.arquivo.size, type: payload.arquivo.type }
        : payload.arquivo ?? null
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assunto: payload.assunto,
        turma: payload.turma,
        turma_id: payload.turma_id ?? null,
        data: payload.data,
        descricao: payload.descricao,
        arquivo: arquivoPayload
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

  async get(id: string): Promise<Aula | { aula: Aula }> {
    const url = `${API_BASE_URL}/api/v1/aulas/${id}`
    const response = await fetch(url, { cache: 'no-store' })
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

export type MaterialItem = {
  id: string
  aula_id: string
  roteiro: {
    topicos: string[]
    falas: string[]
    exemplos: string[]
  }
  resumo: {
    texto: string
    exemplo: string
  }
  source?: string | null
  accepted: boolean
  created_at: string
  material_util?: string | null
  observacoes?: string | null
}

export type MaterialAcceptPayload = {
  aula_id: string
  roteiro: {
    topicos: string[]
    falas: string[]
    exemplos: string[]
  }
  resumo: {
    texto: string
    exemplo: string
  }
  source?: string | null
  accepted?: boolean
  recomendacoes_ia?: string | null
}

export const materialAPI = {
  async listByAula(aulaId: string): Promise<MaterialItem[]> {
    const url = `${API_BASE_URL}/api/v1/material/aula/${aulaId}`
    console.log('🌐 GET (material por aula)', url)
    const response = await fetch(url, { cache: 'no-store' })
    console.log(`📊 Status (material por aula): ${response.status} ${response.statusText}`)
    if (response.status === 404) {
      return []
    }
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (material por aula):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Materiais recebidos:', data)
    return Array.isArray(data) ? data : []
  },

  async accept(payload: MaterialAcceptPayload): Promise<MaterialItem> {
    const url = `${API_BASE_URL}/api/v1/material/accept`
    console.log('🌐 POST (accept material)', url, payload)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        accepted: payload.accepted ?? true
      })
    })
    console.log(`📊 Status (accept material): ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (accept material):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Material salvo:', data)
    return data
  },

  async delete(materialId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/material/${materialId}`
    console.log('🌐 DELETE (material)', url)
    const response = await fetch(url, { method: 'DELETE' })
    console.log(`📊 Status (delete material): ${response.status} ${response.statusText}`)
    if (response.status === 204) {
      return
    }
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (delete material):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
  }
}

export type PerformanceStudentEntry = {
  aluno_id: string
  desempenho: string[]
}

export type MaterialPerformance = {
  arrmd_id: string
  material_id: string
  material_util?: string | null
  observacoes?: string | null
  alunos: PerformanceStudentEntry[]
}

export type MaterialPerformancePayload = {
  arrmd_id: string
  material_util?: string | null
  observacoes?: string | null
  alunos: PerformanceStudentEntry[]
}

export const performanceAPI = {
  async get(arrmdId: string): Promise<MaterialPerformance | null> {
    const url = `${API_BASE_URL}/api/v1/feedback/performance/${arrmdId}`
    console.log('🌐 GET (material performance)', url)
    const response = await fetch(url, { cache: 'no-store' })
    console.log(`📊 Status (material performance): ${response.status} ${response.statusText}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (material performance):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Desempenho recebido:', data)
    return data
  },

  async save(payload: MaterialPerformancePayload): Promise<MaterialPerformance> {
    const url = `${API_BASE_URL}/api/v1/feedback/performance`
    console.log('🌐 POST (material performance)', url, payload)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    console.log(`📊 Status (material performance save): ${response.status} ${response.statusText}`)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (material performance save):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
    const data = await response.json()
    console.log('📦 Desempenho salvo:', data)
    return data
  },

  async delete(arrmdId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/feedback/performance/${arrmdId}`
    console.log('🌐 DELETE (material performance)', url)
    const response = await fetch(url, { method: 'DELETE' })
    console.log(`📊 Status (material performance delete): ${response.status} ${response.statusText}`)
    if (response.status === 204) {
      return
    }
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta (material performance delete):', errorText)
      throw new Error(`${response.status}: ${errorText || response.statusText}`)
    }
  }
}

