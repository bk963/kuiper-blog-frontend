'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

export default function RichEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
      Placeholder.configure({ placeholder: 'Inhalt eingeben…' }),
    ],
    content: html,
    immediatelyRender: false,
    editorProps: { attributes: { class: 'prose prose-lg max-w-none min-h-[400px] focus:outline-none' } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync wenn neue Page geladen wird
  useEffect(() => {
    if (editor && html !== editor.getHTML()) editor.commands.setContent(html, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  if (!editor) return null;

  const Btn = ({ on, active, children, title }: { on: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button type="button" onClick={on} title={title} className={`px-2.5 py-1.5 rounded text-sm font-semibold ${active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
      {children}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3 p-2 bg-slate-100 rounded sticky top-0 z-10">
        <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">B</Btn>
        <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></Btn>
        <Btn on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><s>S</s></Btn>
        <span className="w-px bg-slate-300 mx-1" />
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">H2</Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">H3</Btn>
        <Btn on={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="H4">H4</Btn>
        <span className="w-px bg-slate-300 mx-1" />
        <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">•</Btn>
        <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">1.</Btn>
        <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">"</Btn>
        <span className="w-px bg-slate-300 mx-1" />
        <Btn on={() => {
          const url = prompt('URL eingeben:'); if (!url) return;
          editor.chain().focus().setLink({ href: url }).run();
        }} active={editor.isActive('link')} title="Link">🔗</Btn>
        <Btn on={() => editor.chain().focus().unsetLink().run()} title="Link entfernen">⛓️</Btn>
        <span className="w-px bg-slate-300 mx-1" />
        <Btn on={() => editor.chain().focus().undo().run()} title="Undo">↶</Btn>
        <Btn on={() => editor.chain().focus().redo().run()} title="Redo">↷</Btn>
      </div>
      <div className="border rounded p-4 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
