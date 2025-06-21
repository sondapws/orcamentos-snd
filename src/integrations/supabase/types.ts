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
