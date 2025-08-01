export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      approval_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          quote_id: string
          read: boolean
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          quote_id: string
          read?: boolean
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          quote_id?: string
          read?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_notifications_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "pending_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_settings: {
        Row: {
          approver_email: string
          auto_approval_domains: string[]
          created_at: string | null
          email_notifications: boolean
          id: string
          updated_at: string | null
        }
        Insert: {
          approver_email?: string
          auto_approval_domains?: string[]
          created_at?: string | null
          email_notifications?: boolean
          id?: string
          updated_at?: string | null
        }
        Update: {
          approver_email?: string
          auto_approval_domains?: string[]
          created_at?: string | null
          email_notifications?: boolean
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
          ativo: boolean | null
          corpo: string
          created_at: string | null
          descricao: string | null
          formulario: string | null
          id: string
          modalidade: string | null
          nome: string
          tipo: string | null
          updated_at: string | null
          vinculado_formulario: boolean | null
        }
        Insert: {
          assunto: string
          ativo?: boolean | null
          corpo: string
          created_at?: string | null
          descricao?: string | null
          formulario?: string | null
          id?: string
          modalidade?: string | null
          nome?: string
          tipo?: string | null
          updated_at?: string | null
          vinculado_formulario?: boolean | null
        }
        Update: {
          assunto?: string
          ativo?: boolean | null
          corpo?: string
          created_at?: string | null
          descricao?: string | null
          formulario?: string | null
          id?: string
          modalidade?: string | null
          nome?: string
          tipo?: string | null
          updated_at?: string | null
          vinculado_formulario?: boolean | null
        }
        Relationships: []
      }
      pending_quotes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          form_data: Json
          id: string
          product_type: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          form_data: Json
          id?: string
          product_type: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          form_data?: Json
          id?: string
          product_type?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
