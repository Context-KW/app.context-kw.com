-- Private bucket for customer print documents (20 MB limit).
-- Guests can upload here but cannot list or download objects.
-- The bucket id must match PRINT_DOCUMENT_BUCKET in app/utils/supabase/submissions.ts.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'print-documents',
  'print-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "print_documents_upload" on storage.objects;
create policy "print_documents_upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'print-documents');
