-- ============================================================
-- دالة إرسال الإشعارات الآمنة — send_notification_row
-- تُشغَّل مرة واحدة في Supabase SQL Editor
--
-- تقبل إشعاراً واحداً (كائن) أو مجموعة (مصفوفة حتى 50 إشعار)
-- الحماية: مستخدم مسجّل فقط + حدود طول النصوص + منع الروابط
-- الخارجية نهائياً (الحماية الفعلية من إشعارات التصيّد)
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_notification_row(p_row jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_count int := 0;
  v_title text; v_message text; v_type text; v_link text; v_user_type text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  FOR v_item IN
    SELECT * FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(p_row) = 'array' THEN p_row
           ELSE jsonb_build_array(p_row) END)
  LOOP
    v_count := v_count + 1;
    IF v_count > 50 THEN RAISE EXCEPTION 'too many notifications'; END IF;

    v_title     := trim(coalesce(v_item->>'title',''));
    v_message   := trim(coalesce(v_item->>'message',''));
    v_type      := coalesce(nullif(v_item->>'type',''), 'info');
    v_link      := nullif(trim(coalesce(v_item->>'link','')), '');
    v_user_type := v_item->>'user_type';

    IF v_user_type NOT IN ('student','company','admin') THEN
      RAISE EXCEPTION 'invalid user_type';
    END IF;
    IF v_title = '' OR char_length(v_title) > 200 THEN
      RAISE EXCEPTION 'invalid title';
    END IF;
    IF v_message = '' OR char_length(v_message) > 2000 THEN
      RAISE EXCEPTION 'invalid message';
    END IF;
    -- منع الروابط الخارجية والبروتوكولات الخطرة (حماية من التصيّد)
    IF v_link IS NOT NULL AND (v_link ~* '^(https?:|//|javascript:|data:)') THEN
      RAISE EXCEPTION 'external links not allowed';
    END IF;

    INSERT INTO public.notifications (user_id, user_type, title, message, type, link, is_read)
    VALUES ((v_item->>'user_id')::uuid, v_user_type, v_title, v_message, v_type, v_link, false);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.send_notification_row(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_notification_row(jsonb) TO authenticated;

-- ============================================================
-- الخطوة الأخيرة (اختيارية — بعد رفع كل الملفات والتأكد إن
-- الإشعارات شغالة): امسح سياسة الإدخال المباشر عشان الدالة
-- تبقى الطريق الوحيد، وساعتها حتى مستخدم مسجّل ميقدرش يزيّف
-- إشعار من الكونسول:
--
-- DROP POLICY IF EXISTS "authenticated_can_insert_notifications" ON public.notifications;
-- ============================================================
