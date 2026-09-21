'use client';
import { useRef, useState } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';

/**
 * Drop-in image uploader. Streams files to /api/uploads (which writes to R2)
 * and exposes a list of URLs via `value` / `onChange`. Supports:
 *   - single mode (just one image) or multi mode
 *   - clicking a thumbnail to re-upload / preview
 *   - pasting a URL by hand if the R2 endpoint is offline
 */
export default function ImageUploader({
  value,
  onChange,
  folder = 'misc',
  multiple = true,
  className = '',
  hint
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  multiple?: boolean;
  className?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const onPick = () => inputRef.current?.click();

  const onFiles = async (filesList: FileList | null) => {
    if (!filesList || !filesList.length) return;
    const files = Array.from(filesList);
    setUploading(true);
    setProgress(`อัพโหลด 0/${files.length}`);
    try {
      const fd = new FormData();
      fd.append('folder', folder);
      files.forEach(f => fd.append('files', f));
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const r = await res.json() as any;
      if (!res.ok || !r.success) {
        alert(r.error || 'อัพโหลดไม่สำเร็จ');
        return;
      }
      const ok = (r.files as any[]).filter(f => f.success).map(f => f.url);
      const failed = (r.files as any[]).filter(f => !f.success);
      if (failed.length) alert(`อัพโหลดไม่สำเร็จ ${failed.length} ไฟล์:\n` + failed.map(f => `${f.name}: ${f.error}`).join('\n'));
      if (ok.length) {
        const next = multiple ? [...value, ...ok] : [ok[0]];
        onChange(next.slice(0, multiple ? 50 : 1));
      }
    } catch (e: any) {
      alert('อัพโหลดล้มเหลว: ' + (e?.message || 'network error'));
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (url: string) => onChange(value.filter(u => u !== url));

  const addManual = () => {
    if (!manualUrl.trim()) return;
    const next = multiple ? [...value, manualUrl.trim()] : [manualUrl.trim()];
    onChange(next);
    setManualUrl('');
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative group">
            <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
            <button type="button" onClick={() => remove(url)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" disabled={uploading} onClick={onPick}
          className="flex items-center gap-1 px-3 py-2 border-2 border-dashed border-brand-400 text-brand-600 rounded hover:bg-brand-50 text-sm">
          <FiUploadCloud /> {uploading ? progress || 'กำลังอัพโหลด...' : (multiple ? 'เพิ่มรูป' : 'เลือกรูป')}
        </button>
        {hint && <span className="text-xs text-gray-500 self-center">{hint}</span>}
      </div>

      <details className="mt-2 text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-brand-600">หรือวาง URL เอง</summary>
        <div className="flex gap-2 mt-1">
          <input value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="https://..." className="flex-1 border rounded px-2 py-1" />
          <button type="button" onClick={addManual} className="px-2 py-1 bg-gray-100 rounded">เพิ่ม</button>
        </div>
      </details>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={e => onFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}