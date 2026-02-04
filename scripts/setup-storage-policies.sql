-- Script para configurar políticas de Storage no Supabase
-- Bucket: apresentacoes
-- Permite upload público (INSERT/UPDATE) com ANON_KEY

-- Política 1: Permitir SELECT (leitura) para todos
CREATE POLICY "Public Read apresentacoes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'apresentacoes');

-- Política 2: Permitir INSERT (upload) para todos
CREATE POLICY "Public Insert apresentacoes"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'apresentacoes');

-- Política 3: Permitir UPDATE (sobrescrever) para todos
CREATE POLICY "Public Update apresentacoes"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'apresentacoes')
WITH CHECK (bucket_id = 'apresentacoes');

-- Política 4: Permitir DELETE para todos (opcional)
CREATE POLICY "Public Delete apresentacoes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'apresentacoes');
