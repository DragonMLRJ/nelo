-- Enable RLS on storage.objects if not already enabled
-- Note: You generally need to run this as a superuser or via the dashboard SQL editor.

-- 1. Products Bucket Policies
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Auth Upload Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY "Owner Update Products" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND auth.uid() = owner);
CREATE POLICY "Owner Delete Products" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.uid() = owner);

-- 2. Avatars Bucket Policies
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Owner Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Owner Delete Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 3. Chat Attachments Bucket Policies
CREATE POLICY "Public Access Chat" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');
CREATE POLICY "Auth Upload Chat" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
-- Chat attachments might be viewable only by participants, but keeping it simple public read for now or restricted by folder structure later.
