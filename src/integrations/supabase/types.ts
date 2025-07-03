export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aplicativos: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calibracao_colunas: {
        Row: {
          considera_segmento: boolean | null
          created_at: string | null
          id: string
          nome: string
          regra_calculo: string | null
          regra_id: string
          tipo: string
        }
        Insert: {
          considera_segmento?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          regra_calculo?: string | null
          regra_id: string
          tipo: string
        }
        Update: {
          considera_segmento?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          regra_calculo?: string | null
          regra_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibracao_colunas_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_precificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      calibracao_valores: {
        Row: {
          coluna_id: string
          created_at: string | null
          id: string
          segmento: string
          valor: number
        }
        Insert: {
          coluna_id: string
          created_at?: string | null
          id?: string
          segmento: string
          valor: number
        }
        Update: {
          coluna_id?: string
          created_at?: string | null
          id?: string
          segmento?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "calibracao_valores_coluna_id_fkey"
            columns: ["coluna_id"]
            isOneToOne: false
            referencedRelation: "calibracao_colunas"
            referencedColumns: ["id"]
          },
        ]
      }
      config_prefeituras: {
        Row: {
          calibracao: number | null
          created_at: string | null
          id: string
          quantidade_municipios: number
          regra_id: string
          sob_consulta: boolean | null
        }
        Insert: {
          calibracao?: number | null
          created_at?: string | null
          id?: string
          quantidade_municipios: number
          regra_id: string
          sob_consulta?: boolean | null
        }
        Update: {
          calibracao?: number | null
          created_at?: string | null
          id?: string
          quantidade_municipios?: number
          regra_id?: string
          sob_consulta?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "config_prefeituras_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_precificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      config_saas: {
        Row: {
          created_at: string | null
          devops: number
          hosting: number
          id: string
          nome_plano: string
          plano: string
          regra_id: string
          setup: number
          volumetria_max: number | null
          volumetria_min: number
        }
        Insert: {
          created_at?: string | null
          devops: number
          hosting: number
          id?: string
          nome_plano: string
          plano: string
          regra_id: string
          setup: number
          volumetria_max?: number | null
          volumetria_min: number
        }
        Update: {
          created_at?: string | null
          devops?: number
          hosting?: number
          id?: string
          nome_plano?: string
          plano?: string
          regra_id?: string
          setup?: number
          volumetria_max?: number | null
          volumetria_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_saas_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_precificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      config_suporte: {
        Row: {
          ano: number
          created_at: string | null
          id: string
          preco_unitario: number
          quantidade_horas: number
          regra_id: string
          tipo_suporte: string
          total: number
        }
        Insert: {
          ano: number
          created_at?: string | null
          id?: string
          preco_unitario: number
          quantidade_horas: number
          regra_id: string
          tipo_suporte: string
          total: number
        }
        Update: {
          ano?: number
          created_at?: string | null
          id?: string
          preco_unitario?: number
          quantidade_horas?: number
          regra_id?: string
          tipo_suporte?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_suporte_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_precificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      config_va: {
        Row: {
          agregado: number
          calibracao: number
          created_at: string | null
          fator: number
          id: string
          regra_id: string
          va: number
        }
        Insert: {
          agregado: number
          calibracao: number
          created_at?: string | null
          fator: number
          id?: string
          regra_id: string
          va: number
        }
        Update: {
          agregado?: number
          calibracao?: number
          created_at?: string | null
          fator?: number
          id?: string
          regra_id?: string
          va?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_va_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_precificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_produto_ano: {
        Row: {
          ano: number
          aplicativo_id: string
          bloco_k_lu: number | null
          bloco_k_ma: number | null
          calibracao_lu: number
          created_at: string | null
          custo_base: number | null
          custo_medio: number | null
          custo_mensal: number | null
          custo_percent: number | null
          id: string
          lu_ma_minima: number
          lu_meses: number
          margem_venda: number
          qtd_clientes: number | null
          receita_custo: number | null
          receita_mensal: number | null
          reinf_lu: number | null
          reinf_ma: number | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          aplicativo_id: string
          bloco_k_lu?: number | null
          bloco_k_ma?: number | null
          calibracao_lu?: number
          created_at?: string | null
          custo_base?: number | null
          custo_medio?: number | null
          custo_mensal?: number | null
          custo_percent?: number | null
          id?: string
          lu_ma_minima?: number
          lu_meses?: number
          margem_venda?: number
          qtd_clientes?: number | null
          receita_custo?: number | null
          receita_mensal?: number | null
          reinf_lu?: number | null
          reinf_ma?: number | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          aplicativo_id?: string
          bloco_k_lu?: number | null
          bloco_k_ma?: number | null
          calibracao_lu?: number
          created_at?: string | null
          custo_base?: number | null
          custo_medio?: number | null
          custo_mensal?: number | null
          custo_percent?: number | null
          id?: string
          lu_ma_minima?: number
          lu_meses?: number
          margem_venda?: number
          qtd_clientes?: number | null
          receita_custo?: number | null
          receita_mensal?: number | null
          reinf_lu?: number | null
          reinf_ma?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_produto_ano_aplicativo_id_fkey"
            columns: ["aplicativo_id"]
            isOneToOne: false
            referencedRelation: "aplicativos"
            referencedColumns: ["id"]
          },
        ]
      }
      email_config: {
        Row: {
          created_at: string | null
          id: string
          porta: number
          senha: string
          servidor: string
          ssl: boolean | null
          updated_at: string | null
          usuario: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          porta: number
          senha: string
          servidor: string
          ssl?: boolean | null
          updated_at?: string | null
          usuario: string
        }
        Update: {
          created_at?: string | null
          id?: string
          porta?: number
          senha?: string
          servidor?: string
          ssl?: boolean | null
          updated_at?: string | null
          usuario?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          assunto: string
          created_at: string | null
          destinatario: string
          enviado_em: string | null
          erro: string | null
          id: string
          status: string
        }
        Insert: {
          assunto: string
          created_at?: string | null
          destinatario: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          status?: string
        }
        Update: {
          assunto?: string
          created_at?: string | null
          destinatario?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          assunto: string
          corpo: string
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          assunto: string
          corpo: string
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Update: {
          assunto?: string
          corpo?: string
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regras_precificacao: {
        Row: {
          ano: number
          aplicativo_id: string
          bloco_k_lu: number
          bloco_k_ma: number
          calibracao_lu: number
          created_at: string | null
          custo_base: number | null
          custo_medio: number | null
          custo_mensal: number
          custo_percent: number | null
          id: string
          lu_ma_minima: number
          lu_meses: number
          margem_venda: number
          qtd_clientes: number
          receita_custo_percent: number | null
          receita_mensal: number
          reinf_lu: number
          reinf_ma: number
          updated_at: string | null
        }
        Insert: {
          ano: number
          aplicativo_id: string
          bloco_k_lu: number
          bloco_k_ma: number
          calibracao_lu: number
          created_at?: string | null
          custo_base?: number | null
          custo_medio?: number | null
          custo_mensal: number
          custo_percent?: number | null
          id?: string
          lu_ma_minima: number
          lu_meses: number
          margem_venda: number
          qtd_clientes: number
          receita_custo_percent?: number | null
          receita_mensal: number
          reinf_lu: number
          reinf_ma: number
          updated_at?: string | null
        }
        Update: {
          ano?: number
          aplicativo_id?: string
          bloco_k_lu?: number
          bloco_k_ma?: number
          calibracao_lu?: number
          created_at?: string | null
          custo_base?: number | null
          custo_medio?: number | null
          custo_mensal?: number
          custo_percent?: number | null
          id?: string
          lu_ma_minima?: number
          lu_meses?: number
          margem_venda?: number
          qtd_clientes?: number
          receita_custo_percent?: number | null
          receita_mensal?: number
          reinf_lu?: number
          reinf_ma?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regras_precificacao_aplicativo_id_fkey"
            columns: ["aplicativo_id"]
            isOneToOne: false
            referencedRelation: "aplicativos"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_config: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
