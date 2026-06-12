import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Quote, Undo, Redo, Minus,
} from 'lucide-react';

const ToolBtn = ({ active, disabled, onClick, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer
      ${active
        ? 'bg-dark-green text-white'
        : 'text-[#555] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed'
      }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-[#e0e0e0] mx-0.5 shrink-0" />;

const RichEditor = ({ initialValue = '', onChange, placeholder = 'Start writing…', minHeight = 160 }) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialValue,
    editorProps: {
      attributes: {
        class: 'outline-none font-lato text-[13px] text-dark-green leading-relaxed',
        style: `min-height:${minHeight}px; padding: 12px 14px;`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChangeRef.current(html === '<p></p>' ? '' : html);
    },
  });

  // Sync external content changes (e.g., when async data loads)
  const prevInit = useRef(initialValue);
  useEffect(() => {
    if (!editor) return;
    if (initialValue !== prevInit.current) {
      prevInit.current = initialValue;
      // Only update if editor doesn't have focus and content actually differs
      if (!editor.isFocused && editor.getHTML() !== initialValue) {
        editor.commands.setContent(initialValue || '', false);
      }
    }
  }, [initialValue, editor]);

  if (!editor) return null;

  const btn = (label, active, action, icon) => (
    <ToolBtn key={label} title={label} active={active} onClick={action}>
      {icon}
    </ToolBtn>
  );

  return (
    <div className="border border-[#ddd] rounded-lg overflow-hidden focus-within:border-brand-green transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-[#eee] bg-[#fafafa]">
        {btn('Bold',           editor.isActive('bold'),          () => editor.chain().focus().toggleBold().run(),          <Bold size={13} />)}
        {btn('Italic',         editor.isActive('italic'),        () => editor.chain().focus().toggleItalic().run(),        <Italic size={13} />)}
        <Divider />
        {btn('Heading 2',      editor.isActive('heading',{level:2}), () => editor.chain().focus().toggleHeading({level:2}).run(), <Heading2 size={13} />)}
        {btn('Heading 3',      editor.isActive('heading',{level:3}), () => editor.chain().focus().toggleHeading({level:3}).run(), <Heading3 size={13} />)}
        <Divider />
        {btn('Bullet List',    editor.isActive('bulletList'),    () => editor.chain().focus().toggleBulletList().run(),    <List size={13} />)}
        {btn('Ordered List',   editor.isActive('orderedList'),   () => editor.chain().focus().toggleOrderedList().run(),  <ListOrdered size={13} />)}
        <Divider />
        {btn('Blockquote',     editor.isActive('blockquote'),    () => editor.chain().focus().toggleBlockquote().run(),   <Quote size={13} />)}
        {btn('Horizontal Rule',false,                            () => editor.chain().focus().setHorizontalRule().run(),  <Minus size={13} />)}
        <Divider />
        <ToolBtn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo size={13} /></ToolBtn>
        <ToolBtn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo size={13} /></ToolBtn>
      </div>

      {/* Editor area */}
      <div className="relative bg-white">
        {editor.isEmpty && (
          <p className="absolute top-0 left-0 px-3.5 py-3 font-lato text-[13px] text-[#bbb] pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichEditor;
