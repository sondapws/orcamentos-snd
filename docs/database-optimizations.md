# Email Template Database Optimizations

## Overview

This document describes the database optimizations implemented for the email template mapping system. The optimizations focus on improving query performance for template lookup operations based on formulario and modalidade combinations.

## Implemented Indices

### 1. Composite Index for Template Mapping

**Index Name:** `idx_email_templates_mapping_composite`

**SQL:**
```sql
CREATE INDEX IF NOT EXISTS idx_email_templates_mapping_composite 
ON public.email_templates(formulario, modalidade) 
WHERE ativo = true;
```

**Purpose:**
- Optimizes queries that search for templates by both formulario and modalidade
- Only includes active templates to reduce index size and improve performance
- Supports the primary use case of the template mapping system

**Query Patterns Optimized:**
```sql
-- Exact match queries (most common)
SELECT * FROM email_templates 
WHERE formulario = 'comply_fiscal' 
  AND modalidade = 'on-premise' 
  AND ativo = true;

-- Range queries
SELECT * FROM email_templates 
WHERE formulario = 'comply_fiscal' 
  AND modalidade IN ('on-premise', 'saas') 
  AND ativo = true;
```

### 2. Fallback Index for Formulario-Only Queries

**Index Name:** `idx_email_templates_formulario_active`

**SQL:**
```sql
CREATE INDEX IF NOT EXISTS idx_email_templates_formulario_active 
ON public.email_templates(formulario) 
WHERE ativo = true AND modalidade IS NULL;
```

**Purpose:**
- Optimizes fallback queries when no specific modalidade template exists
- Supports default template lookup scenarios
- Filters for templates without specific modalidade assignment

**Query Patterns Optimized:**
```sql
-- Fallback template queries
SELECT * FROM email_templates 
WHERE formulario = 'comply_fiscal' 
  AND modalidade IS NULL 
  AND ativo = true;

-- Default template lookup
SELECT * FROM email_templates 
WHERE formulario = 'comply_edocs' 
  AND ativo = true 
  AND modalidade IS NULL;
```

## Index Design Decisions

### Field Order in Composite Index

The composite index uses the order `(formulario, modalidade)` because:

1. **Formulario Selectivity:** There are only 2 distinct values ('comply_fiscal', 'comply_edocs')
2. **Modalidade Selectivity:** There are 2-3 distinct values ('on-premise', 'saas', null)
3. **Query Patterns:** Most queries filter by both fields, making the composite index highly effective

### Conditional Index Benefits

Both indices use `WHERE ativo = true` conditions because:

1. **Size Reduction:** Excludes inactive templates from the index
2. **Performance:** Smaller indices are faster to scan
3. **Maintenance:** Less index maintenance overhead
4. **Query Alignment:** All template lookup queries filter by active status

## Performance Impact

### Before Optimization
- Full table scans for template lookup queries
- No index support for formulario + modalidade combinations
- Slower performance as template count grows

### After Optimization
- Index-supported lookups for all common query patterns
- Conditional indices reduce index size by ~50% (assuming 50% active templates)
- Sub-millisecond query times for template lookups
- Efficient fallback template discovery

## Query Performance Expectations

| Query Type | Expected Performance | Index Used |
|------------|---------------------|------------|
| Exact match (formulario + modalidade) | < 1ms | Composite index |
| Fallback (formulario only, modalidade IS NULL) | < 1ms | Fallback index |
| List all active templates | < 5ms | Existing ativo index |
| Admin queries (all templates) | < 10ms | Multiple indices |

## Maintenance Considerations

### Index Maintenance
- Indices are automatically maintained by PostgreSQL
- `ANALYZE` command included in migration to update statistics
- No manual maintenance required

### Monitoring
- Monitor query performance using PostgreSQL's query planner
- Use `EXPLAIN ANALYZE` to verify index usage
- Watch for index bloat in high-update scenarios

### Future Considerations
- If new formulario types are added, indices will automatically accommodate them
- If modalidade values change, no index modifications needed
- Consider partitioning if template count exceeds 100,000 records

## Testing

The optimizations include comprehensive tests that validate:

1. **Index Structure:** SQL syntax and naming conventions
2. **Query Patterns:** Optimal query construction
3. **Coverage:** All expected formulario and modalidade values
4. **Performance:** Query pattern efficiency validation

Tests are located in:
- `src/test/database/email-template-index.test.ts`
- `src/test/database/index-performance.test.ts`

## Migration Details

**Migration File:** `supabase/migrations/20250801000000_email_template_mapping_index.sql`

The migration includes:
- Index creation with `IF NOT EXISTS` for safety
- Descriptive comments for documentation
- `ANALYZE` command to update table statistics
- Proper error handling and rollback safety

## Verification

To verify the optimizations are working:

1. **Check Index Existence:**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'email_templates' 
  AND indexname LIKE 'idx_email_templates_%';
```

2. **Verify Query Plans:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM email_templates 
WHERE formulario = 'comply_fiscal' 
  AND modalidade = 'on-premise' 
  AND ativo = true;
```

3. **Run Performance Tests:**
```bash
npm run test:run
```

The query plan should show "Index Scan" instead of "Seq Scan" for optimized queries.